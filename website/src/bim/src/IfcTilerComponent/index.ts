import {
  geometryLoaderSignal,
  modelLoadedSignal,
  propertyLoaderSignal,
} from "@bim/signals/loader";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import * as THREE from "three";
import {
  IfcStreamerComponent,
  StreamPropertiesSettings,
} from "../IfcStreamerComponent";
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
import {apiUrl} from "@api/core";
import axios, {AxiosProgressEvent} from "axios";

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
  readonly apiUrl = apiUrl;
  readonly aws3Host = import.meta.env.VITE_AWS3_HOST;
  readonly frag = "application/octet-stream" as const;
  readonly json = "application/json" as const;
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
    ifcBuffer?: Uint8Array;
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
      name: string;
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
    const name = `properties-${this.propertyCount}`;
    this.artifactModelData.propertyServerData.push({
      data,
      name,
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
    customIfcStreamer.fromServer = false;
    const settings = {assets, geometries} as OBF.StreamLoaderSettings;
    await customIfcStreamer.loadFromLocal(
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
        isLoaded: true,
        checked: true,
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

    this.artifactModelData = {
      modelServer: {modelId: this.modelId, name},
      ifcBuffer: buffer,
    };

    this.before = performance.now();

    this.parserWorker.postMessage({
      action: "onIfcStream",
      payload: {buffer, modelId: this.modelId} as IPayloadParser,
    } as IWorkerParser);
  };

  streamFromServer = async (modelId: string, projectId: string) => {
    try {
      const customIfcStreamer = this.components.get(IfcStreamerComponent);
      if (!customIfcStreamer)
        throw new Error("customIfcStreamer is not initialized!");
      // const fileName = "18floor.ifc";
      const serverUrl = `${this.aws3Host}/${projectId}/${modelId}`;
      customIfcStreamer.fromServer = true;
      const groupRaw = await axios({
        url: `${serverUrl}/fragmentsGroup.frag`,
        method: "GET",
        responseType: "arraybuffer",
      });
      const settingRaw = await axios({
        url: `${serverUrl}/setting.json`,
        method: "GET",
        responseType: "json",
      });
      const propertyRaw = await axios({
        url: `${serverUrl}/properties.json`,
        method: "GET",
        responseType: "json",
      });
      const propertyIndexesRaw = await axios({
        url: `${serverUrl}/properties-indexes.json`,
        method: "GET",
        responseType: "json",
      });
      const setting = settingRaw.data;
      const group = groupRaw.data;
      const {ids, types, indexesFile} = propertyRaw.data;
      const properties = {
        ids,
        types,
        indexesFile,
        relationsMap: this.getRelationsMapFromJSON(propertyIndexesRaw.data),
      } as StreamPropertiesSettings;
      await customIfcStreamer.loadFromServer(
        setting,
        new Uint8Array(group),
        true,
        serverUrl,
        properties
      );
    } catch (error) {
      console.log(error);
    }
  };
  private getRelationsMapFromJSON(relations: any) {
    const indexMap: OBC.RelationsMap = new Map();
    for (const expressID in relations) {
      const expressIDRelations = relations[expressID];
      const relationMap = new Map<number, number[]>();
      for (const relationID in expressIDRelations) {
        relationMap.set(Number(relationID), expressIDRelations[relationID]);
      }
      indexMap.set(Number(expressID), relationMap);
    }
    return indexMap;
  }
  uploadServer = async (token: string, projectId: string) => {
    const {
      ifcBuffer,
      assets,
      groupBuffer,
      geometries,
      streamedGeometryFiles,
      modelServer,
      propertyServerData,
      propertyStorageFiles,
    } = this.artifactModelData;
    if (
      ifcBuffer === undefined ||
      assets === undefined ||
      geometries === undefined ||
      groupBuffer === undefined ||
      streamedGeometryFiles === undefined ||
      propertyStorageFiles === undefined ||
      modelServer === undefined ||
      propertyServerData === undefined
    ) {
      setNotify("Missing data", false);
      return;
    }
    try {
      const {modelId, name} = modelServer;
      const settings = {assets, geometries};

      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("modelId", modelId);
      formData.append("name", name);
      //ifcBuffer
      formData.append("files", new File([ifcBuffer], name, {type: this.frag}));
      //fragmentsGroup
      formData.append(
        "files",
        new File([groupBuffer], "fragmentsGroup.frag", {type: this.frag})
      );
      //settings
      formData.append(
        "files",
        new File([JSON.stringify(settings)], "setting.json", {type: this.json})
      );
      // propertyStorageFiles
      for (const {name, bits} of propertyStorageFiles) {
        formData.append("files", new File([bits], name, {type: this.json}));
      }
      // propertyServerData
      for (const {name, data} of propertyServerData) {
        formData.append(
          "files",
          new File([JSON.stringify(data)], name, {type: this.json})
        );
      }
      // streamedGeometryFiles
      for (const geometryFile in streamedGeometryFiles) {
        const buffer = streamedGeometryFiles[geometryFile];
        formData.append(
          "files",
          new File([buffer], geometryFile, {type: this.frag})
        );
      }

      await axios.post(`${this.apiUrl}/v1/models/uploads`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (selectProjectSignal.value) {
        const model = selectProjectSignal.value.models.find(
          ({id}) => id === modelId
        );
        if (!model) return;
        model.generated = true;
        selectProjectSignal.value = {...selectProjectSignal.value};
        setNotify("Upload successfully!");
      }
    } catch (error: any) {
      setNotify(error.message, false);
    }
  };
}
