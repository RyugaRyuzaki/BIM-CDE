import {IModelTree} from "@bim/types";
import {signal} from "@preact/signals-react";
import {projectSignal} from "./project";

export const modelTreeSignal = signal<IModelTree | null>(null);

export function disposeTreeViewer() {
  modelTreeSignal.value = null;
}
export function initTree(projectId: string | null) {}
