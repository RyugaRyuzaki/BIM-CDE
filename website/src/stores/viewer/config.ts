import {signal} from "@preact/signals-react";
export const bimRouteSignal = signal<boolean>(false);
export const mapBoxSignal = signal<boolean>(false);

export function disposeViewerConfig() {
  bimRouteSignal.value = false;
  mapBoxSignal.value = false;
}
