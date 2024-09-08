import {
  geometryLoaderSignal,
  modelLoadedSignal,
  propertyLoaderSignal,
  spinnerSignal,
} from "@bim/signals/loader";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import * as WEBIFC from "web-ifc";
import * as THREE from "three";
import {LogLevel} from "web-ifc";
import {IfcStreamerComponent} from "../IfcStreamerComponent";
import {
  IAssetStreamed,
  IGeometryStreamed,
  IIndicesStreamed,
  IPayloadParser,
  IProgress,
  IPropertiesStreamed,
  IWorkerParser,
  IWorkerReceive,
} from "./src/types";
import {setNotify} from "@components/Notify/baseNotify";
import {selectProjectSignal} from "@bim/signals";

interface StreamedProperties {
  types: {
    [typeID: number]: number[];
  };

  ids: {
    [id: number]: number;
  };

  indexesFile: string;
}

/**
 *
 */
export class IfcTilerComponent extends OBC.Component implements OBC.Disposable {
  //1 attribute
  /**
   * A unique identifier for the component.
   * This UUID is used to register the component within the Components system.
   */
  static readonly uuid = "245d14fc-e534-4b5e-bdef-c1ca3e6bb734" as const;
  enabled = false;

  readonly onDisposed: OBC.Event<any> = new OBC.Event();

  // worker
  private parserWorker = new Worker(
    new URL("./src/IfcWorker.ts", import.meta.url),
    {
      type: "module",
      credentials: "include",
    }
  );
  private geometryFilesCount = 0;

  private propertyCount = 0;

  private before = 0;
  private modelId!: string | null;
  // S3 storage ${host}/${bucket_name}/${modelId}
  artifactModelData!: {
    assets?: OBC.StreamedAsset[];
    geometries?: OBC.StreamedGeometries;
    groupBuffer?: Uint8Array;
    streamedGeometryFiles?: {[fileName: string]: Uint8Array};
    propertyStorageFiles?: {
      name: string;
      bits: Blob;
    }[];
    modelServer?: {modelId: string; name: string};
    propertyServerData?: {
      modelId: string;
      data: {[id: number]: any};
    }[];
    properties?: FRAGS.IfcProperties;
    jsonFile?: StreamedProperties;
  };
  /**
   *
   * @param components
   */
  constructor(components: OBC.Components) {
    super(components);
    this.components.add(IfcTilerComponent.uuid, this);
    this.onWorkerMessage();
  }
  //3 method
  async dispose() {
    (this.artifactModelData as any) = null;
    this.parserWorker.terminate();
    (this.parserWorker as any) = null;
    this.onDisposed.trigger(this);
    this.onDisposed.reset();
    console.log("disposed IfcTilerComponent");
  }
  // streamer geometry
  //
  private onAssetStreamed = (payload: IAssetStreamed) => {
    if (!this.modelId || !this.artifactModelData) return;
    if (this.artifactModelData.assets === undefined)
      this.artifactModelData.assets = [];
    this.artifactModelData.assets = [
      ...this.artifactModelData.assets,
      ...payload,
    ];
  };

  private onGeometryStreamed = (payload: IGeometryStreamed) => {
    if (!this.modelId || !this.artifactModelData) return;

    const {data, buffer} = payload;

    if (this.artifactModelData.geometries === undefined)
      this.artifactModelData.geometries = {};

    if (this.artifactModelData.streamedGeometryFiles === undefined)
      this.artifactModelData.streamedGeometryFiles = {};

    const geometryFile = `geometries-${this.geometryFilesCount}.frag`;

    for (const id in data) {
      if (!this.artifactModelData.geometries[id])
        this.artifactModelData.geometries[id] = {...data[id], geometryFile};
    }

    if (!this.artifactModelData.streamedGeometryFiles[geometryFile])
      this.artifactModelData.streamedGeometryFiles[geometryFile] = buffer;

    this.geometryFilesCount++;
  };

  private onIfcLoaded = async (payload: Uint8Array) => {
    if (!this.modelId || !this.artifactModelData) return;

    this.artifactModelData.groupBuffer = payload;
    const now = performance.now();
    console.log("onIfcLoaded", `${now - this.before}`);
    await this.onSuccess();
  };

  private onProgressGeometry = (payload: IProgress) => {
    const {progress} = payload;
    geometryLoaderSignal.value = progress;
    if (progress !== 1) return;
    const now = performance.now();
    console.log("onProgressGeometry", `${now - this.before}`);
  };
  // streamer property
  private onIndicesStreamed = async (payload: IIndicesStreamed) => {
    if (!this.modelId || !this.artifactModelData) return;

    if (this.artifactModelData.jsonFile === undefined) return;
    if (this.artifactModelData.propertyStorageFiles === undefined)
      this.artifactModelData.propertyStorageFiles = [];
    const bits = new Blob([JSON.stringify(this.artifactModelData.jsonFile)]);
    this.artifactModelData.propertyStorageFiles.push({
      name: `properties.json`,
      bits,
    });
    const relations = this.components.get(OBC.IfcRelationsIndexer);
    const serializedRels = relations.serializeRelations(payload);
    this.artifactModelData.propertyStorageFiles.push({
      name: `properties-indexes.json`,
      bits: new Blob([serializedRels]),
    });
    const now = performance.now();
    console.log("onIndicesStreamed", `${now - this.before}`);
    await this.onSuccess();
  };

  private onPropertiesStreamed = (payload: IPropertiesStreamed) => {
    if (!this.modelId || !this.artifactModelData) return;
    const {type, data} = payload;
    if (this.artifactModelData.jsonFile === undefined)
      this.artifactModelData.jsonFile = {
        types: {},
        ids: {},
        indexesFile: `properties`,
      };

    if (this.artifactModelData.properties === undefined)
      this.artifactModelData.properties = {};

    if (this.artifactModelData.propertyServerData === undefined)
      this.artifactModelData.propertyServerData = [];

    if (!this.artifactModelData.jsonFile.types[type])
      this.artifactModelData.jsonFile.types[type] = [];
    this.artifactModelData.jsonFile.types[type].push(this.propertyCount);

    for (const id in data) {
      this.artifactModelData.jsonFile.ids[id] = this.propertyCount;
      if (!this.artifactModelData.properties[id])
        this.artifactModelData.properties[id] = data[id];
    }

    this.artifactModelData.propertyServerData.push({
      data,
      modelId: this.modelId,
    });
    this.propertyCount++;
  };

  private onProgressProperty = (payload: IProgress) => {
    const {progress} = payload;
    propertyLoaderSignal.value = progress;
    if (progress !== 1) return;
    const now = performance.now();
    console.log("onProgressProperty", `${now - this.before}`);
  };

  private onSuccess = async () => {
    if (!this.modelId || !this.artifactModelData) return;

    const {
      propertyStorageFiles,
      propertyServerData,
      assets,
      geometries,
      groupBuffer,
      properties,
      modelServer,
    } = this.artifactModelData;
    if (
      modelServer === undefined ||
      propertyStorageFiles === undefined ||
      propertyStorageFiles.length === 0 ||
      propertyServerData === undefined ||
      propertyServerData.length === 0 ||
      assets === undefined ||
      assets.length === 0 ||
      geometries === undefined ||
      groupBuffer === undefined ||
      properties === undefined
    )
      return;
    const customIfcStreamer = this.components.get(IfcStreamerComponent);
    const settings = {assets, geometries} as OBF.StreamLoaderSettings;
    const group = await customIfcStreamer.loadFromLocal(
      settings,
      groupBuffer,
      true,
      properties
    );
    const {name, modelId} = modelServer;
    modelLoadedSignal.value = true;
    if (selectProjectSignal.value) {
      selectProjectSignal.value.models.push({
        name,
        id: modelId,
        generated: false,
      });
      selectProjectSignal.value = {...selectProjectSignal.value};
    }
  };
  /**
   * 1/make sure onAssetStreamed,onGeometryStreamed and onIfcLoaded are finished
   * then we can load model for reviewing
   * 2/ make sure onProgressGeometry and onProgressProperty are finished
   * then we can upload to server
   */
  private handlerMap = {
    onIndicesStreamed: this.onIndicesStreamed,
    onPropertiesStreamed: this.onPropertiesStreamed,
    onProgressProperty: this.onProgressProperty,
    onAssetStreamed: this.onAssetStreamed,
    onGeometryStreamed: this.onGeometryStreamed,
    onIfcLoaded: this.onIfcLoaded,
    onProgressGeometry: this.onProgressGeometry,
  };

  private onWorkerMessage() {
    this.parserWorker.addEventListener("message", async (e: MessageEvent) => {
      const {action, payload} = e.data as IWorkerReceive;
      if (action === "onError") {
        setNotify(payload as string, false);
        return;
      }
      const handler = this.handlerMap[action as keyof typeof this.handlerMap];
      //@ts-ignore
      if (handler) handler(payload);
    });
  }
  streamIfcWorkerFile = async (buffer: Uint8Array, name: string) => {
    (this.artifactModelData as any) = null;
    (this.modelId as any) = null;
    this.geometryFilesCount = 0;
    this.propertyCount = 0;
    this.modelId = THREE.MathUtils.generateUUID();

    this.artifactModelData = {modelServer: {modelId: this.modelId, name}};

    this.before = performance.now();

    this.parserWorker.postMessage({
      action: "onIfcStream",
      payload: {buffer, modelId: this.modelId} as IPayloadParser,
    } as IWorkerParser);
  };

  // streamIfcFile = async (buffer: Uint8Array, name: string) => {
  //   const modelId = THREE.MathUtils.generateUUID();
  //   if (!this.enabled) throw new Error("This class was not enabled!");
  //   /* ==========  IfcPropertyTiler  ========== */
  //   const ifcPropertiesTiler = this.components.get(OBC.IfcPropertiesTiler);
  //   ifcPropertiesTiler.settings.wasm = this.wasm;
  //   ifcPropertiesTiler.settings.autoSetWasm = false;
  //   ifcPropertiesTiler.settings.webIfc = this.webIfc;
  //   ifcPropertiesTiler.settings.propertiesSize = 500;
  //   ifcPropertiesTiler.onIndicesStreamed.reset();
  //   ifcPropertiesTiler.onPropertiesStreamed.reset();
  //   ifcPropertiesTiler.onProgress.reset();

  //   // storage in S3 because it's large size
  //   const jsonFile: StreamedProperties = {
  //     types: {},
  //     ids: {},
  //     indexesFile: `properties`,
  //   };
  //   // storage in S3 because it's large size
  //   const propertyStorageFiles: {name: string; bits: Blob}[] = [];
  //   // post request to server to storage in mongdb
  //   const propertyServerData: {
  //     name: string;
  //     modelId: string;
  //     data: {[id: number]: any};
  //   }[] = [];

  //   let counter = 0;
  //   // storage in S3 because it's large size
  //   let propertyJson: FRAGS.IfcProperties;
  //   // storage in S3 because it's large size
  //   let assets: OBC.StreamedAsset[] = [];
  //   // storage in S3 because it's large size
  //   let geometries: OBC.StreamedGeometries;
  //   // storage in S3 because it's large size
  //   let groupBuffer: Uint8Array;
  //   //
  //   let geometryFilesCount = 0;
  //   // storage in S3 because it's large size
  //   const streamedGeometryFiles: {[fileName: string]: Uint8Array} = {};

  //   const modelServer = {modelId, name};
  //   const onSuccess = async () => {
  //     const customIfcStreamer = this.components.get(IfcStreamerComponent);
  //     if (!customIfcStreamer) return;
  //     customIfcStreamer.fromServer = false;
  //     if (
  //       propertyStorageFiles.length === 0 ||
  //       propertyServerData.length === 0 ||
  //       assets.length === 0 ||
  //       geometries === undefined ||
  //       groupBuffer === undefined ||
  //       !propertyJson
  //     )
  //       return;
  //     const settings = {assets, geometries} as OBF.StreamLoaderSettings;
  //     const group = await customIfcStreamer.loadFromLocal(
  //       settings,
  //       groupBuffer,
  //       true,
  //       propertyJson
  //     );
  //     const uuid = group.uuid;
  //     if (!this.artifactModelData[uuid]) {
  //       this.artifactModelData[uuid] = {
  //         modelServer,
  //         settings,
  //         groupBuffer,
  //         propertyStorageFiles,
  //         propertyServerData,
  //         streamedGeometryFiles,
  //       };
  //     }
  //   };

  //   ifcPropertiesTiler.onPropertiesStreamed.add(
  //     async (props: {type: number; data: {[id: number]: any}}) => {
  //       const {type, data} = props;
  //       if (!jsonFile.types[type]) jsonFile.types[type] = [];
  //       jsonFile.types[type].push(counter);
  //       if (!propertyJson) propertyJson = {};
  //       for (const id in data) {
  //         jsonFile.ids[id] = counter;
  //         if (!propertyJson[id]) propertyJson[id] = data[id];
  //       }

  //       const name = `properties-${counter}`;

  //       propertyServerData.push({data, name, modelId});
  //       counter++;
  //     }
  //   );
  //   ifcPropertiesTiler.onIndicesStreamed.add(
  //     async (props: Map<number, Map<number, number[]>>) => {
  //       const bits = new Blob([JSON.stringify(jsonFile)]);
  //       propertyStorageFiles.push({
  //         name: `properties.json`,
  //         bits,
  //       });
  //       const relations = this.components.get(OBC.IfcRelationsIndexer);
  //       const serializedRels = relations.serializeRelations(props);
  //       propertyStorageFiles.push({
  //         name: `properties-indexes.json`,
  //         bits: new Blob([serializedRels]),
  //       });
  //     }
  //   );
  //   // progress
  //   ifcPropertiesTiler.onProgress.add(async (progress: number) => {
  //     propertyLoaderSignal.value = progress;
  //     if (progress !== 1) return;
  //     await onSuccess();
  //   });
  //   await ifcPropertiesTiler.streamFromBuffer(buffer);
  //   /* ==========  IfcGeometryTiler  ========== */
  //   const ifcGeometryTiler = this.components.get(OBC.IfcGeometryTiler);
  //   ifcGeometryTiler.settings.wasm = this.wasm;
  //   ifcGeometryTiler.settings.autoSetWasm = false;
  //   ifcGeometryTiler.settings.webIfc = this.webIfc;
  //   ifcGeometryTiler.settings.minGeometrySize = 10;
  //   ifcGeometryTiler.settings.minAssetsSize = 1000;
  //   ifcGeometryTiler.onAssetStreamed.reset();
  //   ifcGeometryTiler.onGeometryStreamed.reset();
  //   ifcGeometryTiler.onIfcLoaded.reset();
  //   ifcGeometryTiler.onProgress.reset();

  //   const streamGeometry = async (
  //     data: OBC.StreamedGeometries,
  //     buffer: Uint8Array
  //   ) => {
  //     const geometryFile = `geometries-${geometryFilesCount}.frag`;
  //     if (geometries === undefined) geometries = {};
  //     for (const id in data) {
  //       if (!geometries[id]) geometries[id] = {...data[id], geometryFile};
  //     }
  //     if (!streamedGeometryFiles[geometryFile])
  //       streamedGeometryFiles[geometryFile] = buffer;
  //     geometryFilesCount++;
  //   };

  //   ifcGeometryTiler.onAssetStreamed.add(
  //     async (assetItems: OBC.StreamedAsset[]) => {
  //       assets = [...assets, ...assetItems];
  //     }
  //   );

  //   ifcGeometryTiler.onGeometryStreamed.add(
  //     async ({
  //       data,
  //       buffer,
  //     }: {
  //       data: OBC.StreamedGeometries;
  //       buffer: Uint8Array;
  //     }) => {
  //       await streamGeometry(data, buffer);
  //     }
  //   );

  //   ifcGeometryTiler.onIfcLoaded.add(async (group: Uint8Array) => {
  //     groupBuffer = group;
  //     await onSuccess();
  //   });
  //   ifcGeometryTiler.onProgress.add(async (progress: number) => {
  //     if (progress !== 1) return;
  //     await onSuccess();
  //   });
  //   await ifcGeometryTiler.streamFromBuffer(buffer);
  // };
}
