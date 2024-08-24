import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import {
  FileLoaderProgress,
  IfcStreamerComponent,
  IfcTilerComponent,
  RoomComponent,
} from "./src";
import {IRoomConfig} from "./src/RoomComponent/types";
import {Socket} from "socket.io-client";
import {IRoomMember} from "@/types/room";
import {modelLoadingSignal, spinnerSignal} from "@stores/viewer/loader";
import {setNotify} from "@components/Notify/baseNotify";
/**
 *
 */
export class BimModel implements OBC.Disposable {
  readonly onDisposed: OBC.Event<any> = new OBC.Event();

  private loaderProgress = new FileLoaderProgress();

  components!: OBC.Components;

  /**
   *
   */
  constructor(private container: HTMLDivElement) {
    this.components = new OBC.Components();

    const worlds = this.components.get(OBC.Worlds);

    const world = worlds.create<
      OBC.SimpleScene,
      OBC.OrthoPerspectiveCamera,
      OBF.PostproductionRenderer
    >();
    world.name = "Main";

    world.scene = new OBC.SimpleScene(this.components);
    world.scene.setup();
    world.scene.three.background = null;

    world.renderer = new OBF.PostproductionRenderer(
      this.components,
      this.container
    );
    const {postproduction, three} = world.renderer;

    three.shadowMap.enabled = true;
    three.shadowMap.type = THREE.PCFSoftShadowMap;

    world.camera = new OBC.OrthoPerspectiveCamera(this.components);

    const worldGrid = this.components.get(OBC.Grids).create(world);
    worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242);
    worldGrid.material.uniforms.uSize1.value = 2;
    worldGrid.material.uniforms.uSize2.value = 8;

    this.components.init();

    postproduction.enabled = true;
    postproduction.customEffects.excludedMeshes.push(worldGrid.three);
    postproduction.setPasses({custom: true, ao: true, gamma: true});
    postproduction.customEffects.lineColor = 0x17191c;

    const highlighter = this.components.get(OBF.Highlighter);
    highlighter.setup({world});

    /** ====== RoomComponent ======= **/
    const roomComponent = this.components.get(RoomComponent);
    roomComponent.enabled = true;
    roomComponent.world = world;

    /** ====== IfcTilerComponent ======= **/
    const ifcTilerComponent = this.components.get(IfcTilerComponent);
    ifcTilerComponent.enabled = true;

    /** ====== IfcStreamerComponent ======= **/
    const ifcStreamerComponent = this.components.get(IfcStreamerComponent);
    ifcStreamerComponent.enabled = true;
    ifcStreamerComponent.world = world;
    ifcStreamerComponent.setupEvent = false;
    ifcStreamerComponent.setupEvent = true;

    world.camera.controls.restThreshold = 0.25;

    world.camera.controls.addEventListener("rest", async () => {
      // await world.scene.updateShadows();
    });
    const fragments = this.components.get(OBC.FragmentsManager);
    const indexer = this.components.get(OBC.IfcRelationsIndexer);
    const classifier = this.components.get(OBC.Classifier);
    classifier.list.CustomSelections = {};

    fragments.onFragmentsLoaded.add(async (model) => {
      if (model.hasProperties) {
        await indexer.process(model);
        classifier.byEntity(model);
      }
      for (const fragment of model.items) {
        world.meshes.add(fragment.mesh);
      }
      world.scene.three.add(model);
      spinnerSignal.value = false;
    });

    fragments.onFragmentsDisposed.add(({fragmentIDs}) => {
      for (const fragmentID of fragmentIDs) {
        const mesh = [...world.meshes].find((mesh) => mesh.uuid === fragmentID);
        if (mesh) {
          world.meshes.delete(mesh);
        }
      }
    });
  }
  //
  async dispose() {
    this.loaderProgress.dispose();
    (this.loaderProgress as any) = null;
    this.components?.dispose();
    this.onDisposed.trigger(this);
    this.onDisposed.reset();
  }
  loadModel = async () => {
    try {
      modelLoadingSignal.value = true;

      const options: OpenFilePickerOptions = {
        multiple: false,
        types: [
          {
            description: "Files",
            accept: {
              "application/octet-stream": [".ifc", ".IFC"],
            },
          },
        ],
      };

      const [fileHandle] = await window.showOpenFilePicker(options);
      const file = await fileHandle.getFile();
      const fileName = file.name;
      const ifcTilerComponent = this.components.get(IfcTilerComponent);
      this.loaderProgress.loadFile(file, async (buffer: Uint8Array) => {
        await ifcTilerComponent.streamIfcFile(buffer, fileName);
        modelLoadingSignal.value = false;
      });
    } catch (err: any) {
      setNotify(err.message, false);
    }
  };
  uploadServer = async () => {};
  initRoom(config: IRoomConfig, socket: Socket, me: IRoomMember) {
    this.components.get(RoomComponent).init(config, socket, me);
  }
}
