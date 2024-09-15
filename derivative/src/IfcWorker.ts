import {parentPort} from "worker_threads";
import * as WEBIFC from "web-ifc";
import {LogLevel} from "web-ifc";

import {
  IAssetStreamed,
  IGeometryStreamed,
  IPayloadModify,
  IPayloadParser,
  IProgress,
  IWorkerReceive,
} from "./types";
import {IfcPropertiesTiler} from "./IfcPropertiesTiler";
import {IfcGeometryTiler} from "./IfcGeometryTiler";

const wasm = {
  path: "./",
  absolute: false,
  LogLevel: LogLevel.LOG_LEVEL_OFF,
};

const webIfc: WEBIFC.LoaderSettings = {
  COORDINATE_TO_ORIGIN: true,
  //@ts-ignore
  OPTIMIZE_PROFILES: true,
} as const;

// streamer geometry

const onAssetStreamed = (payload: IAssetStreamed) => {
  parentPort?.postMessage({
    action: "onAssetStreamed",
    payload,
  } as IWorkerReceive);
};
const onGeometryStreamed = (payload: IGeometryStreamed) => {
  parentPort?.postMessage({
    action: "onGeometryStreamed",
    payload,
  } as IWorkerReceive);
};
const onIfcLoaded = (payload: Uint8Array) => {
  parentPort?.postMessage({action: "onIfcLoaded", payload} as IWorkerReceive);
};
const onProgressGeometry = (progress: number) => {
  parentPort?.postMessage({
    action: "onProgressGeometry",
    payload: {progress, type: "geometry"} as IProgress,
  } as IWorkerReceive);
};
const ifcGeometryTiler = new IfcGeometryTiler(
  onAssetStreamed,
  onGeometryStreamed,
  onIfcLoaded,
  onProgressGeometry
);
ifcGeometryTiler.settings.wasm = wasm;
ifcGeometryTiler.settings.autoSetWasm = false;
ifcGeometryTiler.settings.webIfc = webIfc;
ifcGeometryTiler.settings.minGeometrySize = 20;
ifcGeometryTiler.settings.minAssetsSize = 1000;

// streamer property
const onIndicesStreamed = (payload: Map<number, Map<number, number[]>>) => {
  parentPort?.postMessage({
    action: "onIndicesStreamed",
    payload,
  } as IWorkerReceive);
};
const onPropertiesStreamed = (payload: {
  type: number;
  data: {[id: number]: any};
}) => {
  parentPort?.postMessage({
    action: "onPropertiesStreamed",
    payload,
  } as IWorkerReceive);
};
const onProgressProperty = (progress: number) => {
  parentPort?.postMessage({
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
ifcPropertiesTiler.settings.propertiesSize = 100;

const onIfcStream = async (payload: IPayloadParser) => {
  try {
    const {buffer} = payload;
    await ifcPropertiesTiler.streamFromBuffer(buffer);
    await ifcGeometryTiler.streamFromBuffer(buffer);
  } catch (error: any) {
    parentPort?.postMessage({action: "onError", payload: error.message});
  }
};

parentPort?.on("message", async (data: IPayloadParser) => {
  await onIfcStream(data);
});
