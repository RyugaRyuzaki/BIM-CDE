import * as OBC from "@thatopen/components";
import {signal, effect} from "@preact/signals-react";
export const bimRouteSignal = signal<boolean>(false);
export const mapBoxSignal = signal<boolean>(false);
export const shadowSceneSignal = signal<boolean>(true);
export const cameraModeSignal = signal<OBC.NavModeID>("Orbit");

effect(() => {
  if (mapBoxSignal.value) shadowSceneSignal.value = true;
});

export function disposeViewerConfig() {
  bimRouteSignal.value = false;
  mapBoxSignal.value = false;
  shadowSceneSignal.value = true;
  cameraModeSignal.value = "Orbit";
}
