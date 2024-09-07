import {IProject, IProjectParser} from "@bim/types";
import {signal} from "@preact/signals-react";

export const projectSignal = signal<IProject[] | null>(null);
export const selectProjectSignal = signal<IProjectParser | null>(null);

export function disposeProject() {
  selectProjectSignal.value = null;
}
