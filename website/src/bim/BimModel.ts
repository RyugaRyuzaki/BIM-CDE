import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import {
  DxfComponent,
  FileLoaderProgress,
  IfcStreamerComponent,
  IfcTilerComponent,
  MapBoxComponent,
  RoomComponent,
} from "./src";
import {IRoomConfig} from "./src/RoomComponent/types";
import {Socket} from "socket.io-client";
import {IRoomMember} from "@/types/room";
import {
  disposeViewerLoader,
  modelLoadingSignal,
  spinnerSignal,
} from "@bim/signals/loader";
import {setNotify} from "@components/Notify/baseNotify";
import {effect} from "@preact/signals-react";
import {
  cameraModeSignal,
  disposeViewerConfig,
  disposeViewerSignals,
  mapBoxSignal,
  shadowSceneSignal,
} from "@bim/signals";

import {Fragment} from "@thatopen/fragments";
import {IModelTree} from "./types";
/**
 *
 */
export class BimModel implements OBC.Disposable {
  readonly onDisposed: OBC.Event<any> = new OBC.Event();

  private loaderProgress = new FileLoaderProgress();

  components!: OBC.Components;
  worldGrid!: OBC.SimpleGrid;
  private container3D: HTMLDivElement = this.createContainer();

  private containerMapBox: HTMLDivElement = this.createContainer();

  set mapBox(mapBox: boolean) {
    if (!this.components) return;
    const mapBoxComponent = this.components.get(MapBoxComponent);
    if (!this.container3D || !this.containerMapBox || !mapBoxComponent) return;
    if (mapBox) {
      this.container3D.remove();
      this.container.appendChild(this.containerMapBox);
      mapBoxComponent.onResize();
    } else {
      this.containerMapBox.remove();
      this.container.appendChild(this.container3D);
    }
    if (this.worldGrid) this.worldGrid.visible = !mapBox;
  }

  /**
   *
   */
  constructor(private container: HTMLDivElement) {
    this.init();
  }
  //
  async dispose() {
    console.log("dispose");
    disposeViewerSignals();
    this.container3D?.remove();
    (this.container3D as any) = null;
    this.containerMapBox?.remove();
    (this.containerMapBox as any) = null;
    this.loaderProgress.dispose();
    (this.loaderProgress as any) = null;
    (this.container as any) = null;
    this.components?.get(OBC.Worlds).dispose();
    this.components?.dispose();
    (this.components as any) = null;
    this.onDisposed.trigger(this);
    this.onDisposed.reset();
  }

  private init() {
    this.components = new OBC.Components();
    this.components.init();

    const worlds = this.components.get(OBC.Worlds);

    const world = worlds.create<
      OBC.ShadowedScene,
      OBC.OrthoPerspectiveCamera,
      OBF.PostproductionRenderer
    >();
    world.name = "Main";

    world.scene = new OBC.ShadowedScene(this.components);

    world.renderer = new OBF.PostproductionRenderer(
      this.components,
      this.container3D
    );
    const {postproduction, three} = world.renderer;

    three.shadowMap.enabled = true;
    three.shadowMap.type = THREE.PCFSoftShadowMap;

    world.camera = new OBC.OrthoPerspectiveCamera(this.components);

    world.scene.setup({
      shadows: {
        cascade: 1,
        resolution: 1024,
      },
    });
    world.scene.three.background = null;

    this.worldGrid = this.components.get(OBC.Grids).create(world);
    this.worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242);
    this.worldGrid.material.uniforms.uSize1.value = 2;
    this.worldGrid.material.uniforms.uSize2.value = 8;

    postproduction.enabled = true;
    postproduction.customEffects.excludedMeshes.push(this.worldGrid.three);
    postproduction.setPasses({custom: true, ao: true, gamma: true});
    postproduction.customEffects.lineColor = 0x17191c;
    postproduction.enabled = false;

    const highlighter = this.components.get(OBF.Highlighter);
    highlighter.setup({world});

    /** ====== RoomComponent ======= **/
    const roomComponent = this.components.get(RoomComponent);
    roomComponent.enabled = true;
    roomComponent.world = world;

    /** ====== DxfComponent ======= **/
    const dxfComponent = this.components.get(DxfComponent);
    dxfComponent.enabled = true;
    dxfComponent.world = world;

    /** ====== MapBoxComponent ======= **/
    const mapBoxComponent = this.components.get(MapBoxComponent);
    mapBoxComponent.enabled = true;
    mapBoxComponent.container = this.containerMapBox;
    mapBoxComponent.world = world;
    mapBoxComponent.setup();

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

    const fragments = this.components.get(OBC.FragmentsManager);
    const indexer = this.components.get(OBC.IfcRelationsIndexer);
    const classifier = this.components.get(OBC.Classifier);
    classifier.list.CustomSelections = {};

    fragments.onFragmentsLoaded.add(async (model) => {
      if (model.hasProperties) {
        await indexer.process(model);
        classifier.byEntity(model);
      }
      spinnerSignal.value = false;
    });
    ifcStreamerComponent.onFragmentsLoaded.add(
      async (fragments: Fragment[]) => {
        for (const {mesh} of fragments) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      }
    );
    fragments.onFragmentsDisposed.add(({fragmentIDs}) => {
      for (const fragmentID of fragmentIDs) {
        const mesh = [...world.meshes].find((mesh) => mesh.uuid === fragmentID);
        if (mesh) {
          world.meshes.delete(mesh);
        }
      }
    });
    //
    effect(() => {
      this.mapBox = mapBoxSignal.value;
    });
    effect(() => {
      if (!this.components) return;
      world.scene.shadowsEnabled = shadowSceneSignal.value;
      postproduction.enabled = !shadowSceneSignal.value;
      (async () => {
        if (shadowSceneSignal.value) {
          await world.scene.updateShadows();
        }
      })();
    });
    effect(() => {
      if (!this.components) return;
      const mode = cameraModeSignal.value;
      if (!world.camera) return;
      world.camera.set(mode);
    });
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
              "application/octet-stream": [".ifc", ".IFC", ".dxf"],
            },
          },
        ],
      };

      const [fileHandle] = await window.showOpenFilePicker(options);
      const file = await fileHandle.getFile();
      const ifcTilerComponent = this.components.get(IfcTilerComponent);
      this.loaderProgress.loadIfcFile(
        file,
        async (buffer: Uint8Array, name: string) => {
          await ifcTilerComponent.streamIfcWorkerFile(buffer, name);
        }
      );
    } catch (err: any) {
      setNotify(err.message, false);
    }
  };
  uploadServer = async () => {};
  initRoom(config: IRoomConfig, socket: Socket, me: IRoomMember) {
    this.components.get(RoomComponent).init(config, socket, me);
  }

  private createContainer() {
    const container = document.createElement("div");
    container.className = "relative h-full w-full overflow-hidden";
    return container;
  }
}
