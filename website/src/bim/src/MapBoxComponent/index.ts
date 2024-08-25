import * as OBC from "@thatopen/components";
import * as THREE from "three";
import * as MAPBOX from "mapbox-gl";
import {MapBoxCoord} from "./src";
import {CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer";
export interface IMapBoxConfig {
  pitch: number;
  bearing: number;
  zoom: number;
  center: [number, number];
  style: string;
  antialias: boolean;
  maxZoom: number;
  minZoom: number;
  maxPitch: number;
  minPitch: number;
}

/**
 *
 */
export class MapBoxComponent
  extends OBC.Component
  implements OBC.Disposable, OBC.Configurable<IMapBoxConfig>
{
  /**
   * A unique identifier for the component.
   * This UUID is used to register the component within the Components system.
   */
  static readonly uuid = "abf957d2-2dcf-455c-bce1-bddbfd6eefc0" as const;

  enabled = false;

  readonly onDisposed: OBC.Event<any> = new OBC.Event();

  readonly coord = new MapBoxCoord();

  isSetup = false;

  onSetup: OBC.Event<any> = new OBC.Event();

  config: Required<IMapBoxConfig> = {
    pitch: 60,
    bearing: -300,
    zoom: 18,
    center: this.coord.center,
    style: "mapbox://styles/mapbox/streets-v12",
    antialias: true,
    maxZoom: 60,
    minZoom: 3,
    maxPitch: 85,
    minPitch: 0,
  };
  map!: MAPBOX.Map | null;

  container!: HTMLDivElement;
  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  renderer!: THREE.WebGLRenderer;
  labelRenderer: CSS2DRenderer = new CSS2DRenderer();
  private readonly scene: THREE.Scene = new THREE.Scene();
  /**
   *
   * @param components
   */
  constructor(components: OBC.Components) {
    super(components);
    this.components.add(MapBoxComponent.uuid, this);
  }

  /**
   *
   */
  async dispose() {
    this.isSetup = false;
    this.map?.remove();
    (this.map as any) = null;
    (this.container as any) = null;
    this.onDisposed.trigger(this);
    this.onDisposed.reset();
    console.log("disposed MapBoxComponent");
  }
  /**
   *
   * @param config
   */
  setup = (config?: Partial<IMapBoxConfig> | undefined) => {
    if (!this.container) throw Error("Container was not initialized!");
    this.config = {...this.config, ...config};
    const {center} = this.config;
    this.coord.center = center;

    this.map = new MAPBOX.Map({
      container: this.container,
      accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
      ...this.config,
    });
    this.map.rotateTo(Math.PI / 2);
    this.addDefaultLayer();
    this.setupMap();
    this.isSetup = true;
    this.onSetup.trigger();
  };
  /**
   * Add default layers
   */
  private addDefaultLayer() {
    this.map!.on("load", () => {
      const layers = this.map?.getStyle()!.layers as any[];
      const labelLayerId = layers.find(
        (layer) => layer.type === "symbol" && layer.layout["text-field"]
      ).id;
      //   // using box for all building
      this.map!.addLayer(
        {
          id: "add-3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",

            // Use an 'interpolate' expression to
            // add a smooth transition effect to
            // the buildings as the user zooms in.
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "min_height"],
            ],
            "fill-extrusion-opacity": 0.6,
          },
        },
        labelLayerId
      );
    });
  }

  /**
   *
   * @param map
   * @param gl //https://docs.mapbox.com/mapbox-gl-js/example/add-3d-model/
   */
  private onAdd = (map: any, gl: any) => {
    // create two three.js lights to illuminate the model
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, -70, 100).normalize();
    this.scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff);
    directionalLight2.position.set(0, 70, 100).normalize();
    this.scene.add(directionalLight2);
    // use the Mapbox GL JS map canvas for three.js
    const canvas = map.getCanvas() as HTMLCanvasElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      context: gl,
      antialias: true,
    });
    this.renderer.autoClear = false;
    this.renderer.outputColorSpace = "srgb";
    this.renderer.localClippingEnabled = true;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.autoClearStencil = false;
    this.initializeLabelRenderer();
  };

  private render = (_gl: any, matrix: number[]) => {
    const m = new THREE.Matrix4().fromArray(matrix);
    this.camera.projectionMatrix = m.multiply(this.coord.mapCamera);
    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);
    this.map!.triggerRepaint();
  };
  private setupMap() {
    // add custom layer
    //https://docs.mapbox.com/mapbox-gl-js/example/add-3d-model/

    const customLayer = {
      id: "3d-model",
      type: "custom",
      renderingMode: "3d",
      onAdd: this.onAdd,
      render: this.render,
    };
    this.map!.on("style.load", () => {
      //@ts-ignore
      this.map!.addLayer(customLayer);
      this.map!.resize();
    });
    this.map!.addControl(
      new MAPBOX.NavigationControl({
        visualizePitch: true,
      }),
      "bottom-right"
    );
  }
  /**
   * initializeLabelRenderer , if help add label HTML div...
   */
  private initializeLabelRenderer() {
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.top = "0px";
    this.labelRenderer.domElement.style.zIndex = "1";
    this.labelRenderer.setSize(
      this.renderer.domElement.clientWidth,
      this.renderer.domElement.clientHeight
    );
    this.renderer?.domElement.parentElement?.appendChild(
      this.labelRenderer.domElement
    );
  }
  /**
   * resize window
   */
  private updateLabelRendererSize = () => {
    setTimeout(() => {
      this.map!.resize();
      const canvas = this.map!.getCanvas() as HTMLCanvasElement;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      if (this.renderer?.domElement) {
        const {width, height} =
          this.renderer.domElement.getBoundingClientRect();
        this.labelRenderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      }
    }, 1);
  };
  onResize = () => {
    if (!this.renderer || !this.container || !this.map) return;
    this.updateLabelRendererSize();
  };
}
