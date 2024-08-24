import {setNotify} from "@components/Notify/baseNotify";
import {fileLoaderSignal, spinnerSignal} from "@stores/viewer/loader";
import * as THREE from "three";
export class FileLoaderProgress extends THREE.Loader {
  private loader!: THREE.FileLoader;
  constructor(manager?: THREE.LoadingManager) {
    super(manager);
    this.loader = new THREE.FileLoader(this.manager);
    this.loader.setPath(this.path);
    this.loader.setResponseType("arraybuffer");
    this.loader.setRequestHeader(this.requestHeader);
    this.loader.setWithCredentials(this.withCredentials);
  }

  dispose() {
    (this.loader as any) = null;
  }
  private onProgress = (event: ProgressEvent) => {
    fileLoaderSignal.value = event.loaded / event.total;
  };
  private onError = (err: any) => {
    setNotify(err.message, false);
  };
  loadFile(file: File, onSuccess: (buffer: Uint8Array) => void) {
    const url = URL.createObjectURL(file);
    spinnerSignal.value = true;
    this.loader.load(
      url,
      (buffer: ArrayBuffer | string) => {
        try {
          if (typeof buffer == "string") {
            throw new Error("IFC files must be given as a buffer!");
          }
          onSuccess(new Uint8Array(buffer));
        } catch (e: any) {
          this.onError(e);
          this.manager.itemError(url);
        }
        URL.revokeObjectURL(url);
      },
      this.onProgress,
      this.onError
    );
  }
}
