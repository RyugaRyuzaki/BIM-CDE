import {useEffect, useRef, useState} from "react";
import LeftPanel from "./bim/LeftPanel";
import {BimModel} from "@bim/BimModel";
import {useSignals} from "@preact/signals-react/runtime";

import Spinner from "@components/Spinner/Spinner";
import NotifyProgress from "@components/Notify/NotifyProgress";
import {useNavigate} from "react-router";
import {useSearchParams} from "react-router-dom";

import {
  fileLoaderSignal,
  geometryLoaderSignal,
  propertyLoaderSignal,
  bimRouteSignal,
  projectSignal,
  selectProjectSignal,
} from "@bim/signals";
/**
 *
 * @returns
 */
const BimViewer = () => {
  useSignals();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const projectId = searchParams.get("projectId");
  const privateProject = searchParams.get("private");

  const [bimModel, setBimModel] = useState<BimModel | null>(null);
  useEffect(() => {
    if (!projectId) {
      navigate("/Error");
      return;
    }
    if (!containerRef.current) return;
    const model = new BimModel(containerRef.current);
    setBimModel(model);
    bimRouteSignal.value = true;
    if (projectSignal.value) {
      const project =
        projectSignal.value.find((pro) => pro.id === projectId) || null;
      if (project) {
        selectProjectSignal.value = {...project, models: [...project.models]};
      }
    }

    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate: StorageEstimate) => {
        const {usage, quota} = estimate;
        if (!usage || !quota) return;
      });
    }
    return () => {
      model?.dispose();
      setBimModel(null);
    };
  }, [projectId]);

  return (
    <div className="relative h-full w-full overflow-hidden flex">
      <div className="relative h-full w-[15%] p-2 border-r-4">
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
