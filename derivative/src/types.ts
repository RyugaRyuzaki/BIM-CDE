export interface IPayloadParser {
  buffer: Uint8Array;
  modelId: string;
}
export interface IPayloadModify {
  buffer: Record<string, any>;
  modelId: string;
}
export interface IWorkerParser {
  action: "onIfcStream" | "onIfcModify";
  payload: IPayloadParser | IPayloadModify;
}

export type IIndicesStreamed = Map<number, Map<number, number[]>>;
export type IPropertiesStreamed = {
  type: number;
  data: {[id: number]: any};
};
export type IProgress = {
  type: "property" | "geometry";
  progress: number;
};
export type IAssetStreamed = StreamedAsset[];
export type IGeometryStreamed = {
  data: StreamedGeometries;
  buffer: Uint8Array;
};

export interface IWorkerReceive {
  action:
    | "onError"
    | "onIndicesStreamed"
    | "onPropertiesStreamed"
    | "onProgressProperty"
    | "onAssetStreamed"
    | "onGeometryStreamed"
    | "onIfcLoaded"
    | "onProgressGeometry";
  payload:
    | IIndicesStreamed
    | IPropertiesStreamed
    | IProgress
    | string
    | IAssetStreamed
    | Uint8Array
    | IGeometryStreamed;
}

export interface IfcItemsCategories {
  [itemID: number]: number;
}

/**
 * A dictionary of geometries streamed from a server. Each geometry is identified by a unique number (id), and contains information about its bounding box, whether it has holes, and an optional file path for the geometry data.
 */
export interface StreamedGeometries {
  [id: number]: {
    /** The bounding box of the geometry as a Float32Array. */
    boundingBox: Float32Array;
    /** A boolean indicating whether the geometry has holes. */
    hasHoles: boolean;
    /** An optional file path for the geometry data. */
    geometryFile?: string;
  };
}

/**
 * A streamed asset, which consists of multiple geometries. Each geometry in the asset is identified by a unique number (geometryID), and contains information about its transformation and color.
 */
export interface StreamedAsset {
  /** The unique identifier of the asset. */
  id: number;
  /** An array of geometries associated with the asset. */
  geometries: {
    /** The unique identifier of the geometry. */
    geometryID: number;
    /** The transformation matrix of the geometry as a number array. */
    transformation: number[];
    /** The color of the geometry as a number array. */
    color: number[];
  }[];
}
export interface StreamedProperties {
  types: {
    [typeID: number]: number[];
  };

  ids: {
    [id: number]: number;
  };

  indexesFile: string;
}

export interface IfcProperties {
  /**
   * The unique identifier of the IFC entity.
   */
  [expressID: number]: {
    /**
     * The attribute name of the property.
     */
    [attribute: string]: any;
  };
}
export interface StreamLoaderSettings {
  assets: StreamedAsset[];
  geometries: StreamedGeometries;
}