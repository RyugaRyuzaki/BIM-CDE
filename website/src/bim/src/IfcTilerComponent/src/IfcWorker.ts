import * as WEBIFC from "web-ifc";
import {LogLevel} from "web-ifc";

import {
  IPayloadModify,
  IPayloadParser,
  IProgress,
  IWorkerParser,
  IWorkerReceive,
} from "./types";
import {IfcPropertiesTiler} from "./IfcPropertiesTiler";

const wasm = {
  path: "https://unpkg.com/web-ifc@0.0.57/",
  absolute: true,
  LogLevel: LogLevel.LOG_LEVEL_OFF,
};

const webIfc: WEBIFC.LoaderSettings = {
  COORDINATE_TO_ORIGIN: true,
  //@ts-ignore
  OPTIMIZE_PROFILES: true,
} as const;

// streamer geometry

// streamer property
const onIndicesStreamed = (payload: Map<number, Map<number, number[]>>) => {
  self.postMessage({action: "onIndicesStreamed", payload} as IWorkerReceive);
};
const onPropertiesStreamed = (payload: {
  type: number;
  data: {[id: number]: any};
}) => {
  self.postMessage({action: "onPropertiesStreamed", payload} as IWorkerReceive);
};
const onProgressProperty = (progress: number) => {
  self.postMessage({
    action: "onProgressProperty",
    payload: {progress, type: "property"} as IProgress,
  } as IWorkerReceive);
};

const ifcPropertiesTiler = new IfcPropertiesTiler(
  onIndicesStreamed,
  onPropertiesStreamed,
  onProgressProperty
);
ifcPropertiesTiler.settings.wasm = wasm;
ifcPropertiesTiler.settings.autoSetWasm = false;
ifcPropertiesTiler.settings.webIfc = webIfc;
ifcPropertiesTiler.settings.propertiesSize = 500;

const onIfcStream = async (payload: IPayloadParser) => {
  try {
    const {buffer} = payload;
    await ifcPropertiesTiler.streamFromBuffer(buffer);
  } catch (error: any) {
    self.postMessage({action: "onError", payload: error.message});
  }
};
const onIfcModify = async (payload: IPayloadModify) => {
  console.log(payload);
};

const handlerMap = {
  onIfcStream,
  onIfcModify,
};

self.onmessage = async (e: MessageEvent) => {
  const {action, payload} = e.data as IWorkerParser;
  const handler = handlerMap[action as keyof typeof handlerMap];
  //@ts-ignore
  if (handler) handler(payload);
};
