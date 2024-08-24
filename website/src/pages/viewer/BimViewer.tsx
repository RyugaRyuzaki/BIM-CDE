import {useEffect, useRef, useState} from "react";
import LeftPanel from "./bim/LeftPanel";
import {BimModel} from "@bim/BimModel";
import {useSignals} from "@preact/signals-react/runtime";
import {
  fileLoaderSignal,
  geometryLoaderSignal,
  modelIdSignal,
  modelLoadingSignal,
  propertyLoaderSignal,
  spinnerSignal,
  versionIdSignal,
} from "@stores/viewer/loader";
import Spinner from "@components/Spinner/Spinner";
import NotifyProgress from "@components/Notify/NotifyProgress";
const BimViewer = () => {
  useSignals();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [bimModel, setBimModel] = useState<BimModel | null>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const model = new BimModel(containerRef.current);
    setBimModel(model);
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate: StorageEstimate) => {
        const {usage, quota} = estimate;
        if (!usage || !quota) return;
      });
    }
    return () => {
      modelLoadingSignal.value = false;
      spinnerSignal.value = false;
      fileLoaderSignal.value = null;
      geometryLoaderSignal.value = null;
      propertyLoaderSignal.value = null;
      modelIdSignal.value = null;
      versionIdSignal.value = null;
      model.dispose();
      setBimModel(null);
    };
  }, []);
  return (
    <div className="relative h-full w-full overflow-hidden flex">
      <div className="relative h-full w-[300px] p-2">
        {bimModel && <LeftPanel bimModel={bimModel} />}
      </div>
      <div
        className="relative h-full flex-1 exclude-theme-change"
        ref={containerRef}
      >
        <Spinner />
      </div>
      <NotifyProgress name="File" signal={fileLoaderSignal} />
      <NotifyProgress name="Geometry" signal={geometryLoaderSignal} />
      <NotifyProgress name="Property" signal={propertyLoaderSignal} />
    </div>
  );
};

export default BimViewer;
