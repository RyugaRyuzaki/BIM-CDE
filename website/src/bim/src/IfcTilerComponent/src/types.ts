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

export interface IWorkerReceive {
  action:
    | "onError"
    | "onIndicesStreamed"
    | "onPropertiesStreamed"
    | "onProgressProperty";
  payload: IIndicesStreamed | IPropertiesStreamed | IProgress | string;
}
