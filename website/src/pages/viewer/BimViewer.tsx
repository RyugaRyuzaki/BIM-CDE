import {useEffect, useRef, useState} from "react";
import LeftPanel from "./bim/LeftPanel";
import {BimModel} from "@bim/BimModel";
import {useSignals} from "@preact/signals-react/runtime";
import {
  disposeViewerLoader,
  fileLoaderSignal,
  geometryLoaderSignal,
  propertyLoaderSignal,
} from "@stores/viewer/loader";
import Spinner from "@components/Spinner/Spinner";
import NotifyProgress from "@components/Notify/NotifyProgress";
import {bimRouteSignal, disposeViewerConfig} from "@stores/viewer/config";
const BimViewer = () => {
  useSignals();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [bimModel, setBimModel] = useState<BimModel | null>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const model = new BimModel(containerRef.current);
    setBimModel(model);
    bimRouteSignal.value = true;
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate: StorageEstimate) => {
        const {usage, quota} = estimate;
        if (!usage || !quota) return;
      });
    }
    return () => {
      disposeViewerLoader();
      disposeViewerConfig();
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
