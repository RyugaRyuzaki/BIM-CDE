import {disposeViewerConfig} from "./config";
import {disposeViewerLoader} from "./loader";
import {disposeProject} from "./project";
import {disposeTreeViewer} from "./tree";

export * from "./config";
export * from "./loader";
export * from "./member";
export * from "./project";
export * from "./tree";

export function disposeViewerSignals() {
  disposeViewerLoader();
  disposeViewerConfig();
  disposeTreeViewer();
  disposeProject();
}
