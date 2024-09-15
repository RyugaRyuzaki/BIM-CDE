import {Worker} from "worker_threads";
import {resolve} from "path";
import {v4 as uuidv4} from "uuid";
import {
  IAssetStreamed,
  IfcProperties,
  IGeometryStreamed,
  IIndicesStreamed,
  IPayloadParser,
  IProgress,
  IPropertiesStreamed,
  IWorkerReceive,
  StreamedAsset,
  StreamedGeometries,
  StreamedProperties,
  StreamLoaderSettings,
} from "./types";
import axios from "axios";

const suffix = process.env.NODE_ENV === "development" ? ".ts" : ".js";
export class ParserManager {
  worker = new Worker(resolve(__dirname, `IfcWorker${suffix}`));
  readonly apiUrl = process.env.SERVER_TILES_PROD_API;
  readonly frag = "application/octet-stream" as const;
  readonly json = "application/json" as const;
  private geometryFilesCount = 0;

  private propertyCount = 0;

  private modelId!: string | null;
  // S3 storage ${host}/${bucket_name}/${modelId}
  artifactModelData!: {
    ifcBuffer?: Uint8Array;
    assets?: StreamedAsset[];
    geometries?: StreamedGeometries;
    groupBuffer?: Uint8Array;
    streamedGeometryFiles?: {[fileName: string]: Uint8Array};
    propertyStorageFiles?: {
      name: string;
      bits: Blob;
    }[];
    modelServer?: {
      modelId: string;
      name: string;
      projectId: string;
      token: string;
    };
    propertyServerData?: {
      modelId: string;
      name: string;
      data: {[id: number]: any};
    }[];
    properties?: IfcProperties;
    jsonFile?: StreamedProperties;
  };

  /**
   * Serializes the relations of a given relation map into a JSON string.
   * This method iterates through the relations in the given map, organizing them into a structured object where each key is an expressID of an entity,
   * and its value is another object mapping relation indices to arrays of related entity expressIDs.
   * The resulting object is then serialized into a JSON string.
   *
   * @param relationMap - The map of relations to be serialized. The map keys are expressIDs of entities, and the values are maps where each key is a relation type ID and its value is an array of expressIDs of entities related through that relation type.
   * @returns A JSON string representing the serialized relations of the given relation map.
   */
  serializeRelations(relationMap: IIndicesStreamed) {
    const object: Record<string, Record<string, number[]>> = {};
    for (const [expressID, relations] of relationMap.entries()) {
      if (!object[expressID]) object[expressID] = {};
      for (const [relationID, relationEntities] of relations.entries()) {
        object[expressID][relationID] = relationEntities;
      }
    }
    return JSON.stringify(object);
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
    await this.onSuccess();
  };

  private onProgressGeometry = (payload: IProgress) => {
    const {progress} = payload;
    if (progress !== 1) return;
    /// notify redis
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
    const serializedRels = this.serializeRelations(payload);
    this.artifactModelData.propertyStorageFiles.push({
      name: `properties-indexes.json`,
      bits: new Blob([serializedRels]),
    });
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
    if (progress !== 1) return;
    /// notify redis
  };

  private onSuccess = async () => {
    if (!this.modelId || !this.artifactModelData) return;

    const {
      ifcBuffer,
      propertyStorageFiles,
      propertyServerData,
      assets,
      geometries,
      groupBuffer,
      properties,
      modelServer,
      streamedGeometryFiles,
    } = this.artifactModelData;
    if (
      ifcBuffer === undefined ||
      modelServer === undefined ||
      propertyStorageFiles === undefined ||
      propertyStorageFiles.length === 0 ||
      propertyServerData === undefined ||
      streamedGeometryFiles === undefined ||
      propertyServerData.length === 0 ||
      assets === undefined ||
      assets.length === 0 ||
      geometries === undefined ||
      groupBuffer === undefined ||
      properties === undefined
    )
      return;
    try {
      const {modelId, name, projectId, token} = modelServer;
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

      await axios.post(
        `${this.apiUrl}/v1/models/properties`,
        {properties: propertyServerData},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      console.log(error);
    }
    this.dispose();
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

  private dispose() {
    (this.artifactModelData as any) = null;
    (this.modelId as any) = null;
    this.worker.terminate();
    (this.worker as any) = null;
  }
  streamModel(buffer: Buffer, name: string, projectId: string, token: string) {
    (this.artifactModelData as any) = null;
    (this.modelId as any) = null;
    const modelId = uuidv4();
    this.modelId = modelId;

    this.geometryFilesCount = 0;
    this.propertyCount = 0;

    this.artifactModelData = {
      modelServer: {modelId: this.modelId, name, projectId, token},
      ifcBuffer: buffer,
    };

    this.worker.postMessage({buffer, modelId} as IPayloadParser);

    this.worker.on("message", (data: IWorkerReceive) => {
      const {action, payload} = data;
      if (action === "onError") {
        return;
      }
      const handler = this.handlerMap[action as keyof typeof this.handlerMap];
      //@ts-ignore
      if (handler) handler(payload);
    });
    this.worker.on("error", (err) => console.error(err));
  }
}
