import {useEffect, useRef, useState} from "react";
import LeftPanel from "./bim/LeftPanel";
import {BimModel} from "@bim/BimModel";
import {useSignals} from "@preact/signals-react/runtime";

import Spinner from "@components/Spinner/Spinner";
import NotifyProgress from "@components/Notify/NotifyProgress";
import {useNavigate} from "react-router";
import {useSearchParams} from "react-router-dom";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  fileLoaderSignal,
  geometryLoaderSignal,
  propertyLoaderSignal,
  bimRouteSignal,
  projectSignal,
  selectProjectSignal,
} from "@bim/signals";

import * as BUI from "@thatopen/ui";
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
    BUI.Manager.init();
    const model = new BimModel(containerRef.current);
    containerRef.current.appendChild(model.selectionPanel);
    setBimModel(model);
    bimRouteSignal.value = true;
    if (projectSignal.value) {
      const project =
        projectSignal.value.find((pro) => pro.id === projectId) || null;
      if (project) {
        selectProjectSignal.value = {
          ...project,
          models: project.models.map((model) => ({
            id: model.id,
            name: model.name,
            generated: true,
            checked: false,
            isLoaded: false,
          })),
        };
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

  const onResize = () => {
    if (!bimModel) return;
    setTimeout(bimModel.onResize, 1);
  };
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="relative h-full w-full overflow-hidden flex"
      onLayout={onResize}
    >
      <ResizablePanel
        defaultSize={15}
        maxSize={25}
        className="relative h-full w-[15%] p-2"
      >
        {bimModel && <LeftPanel bimModel={bimModel} />}
      </ResizablePanel>
      <ResizableHandle className="w-[4px]" />
      <ResizablePanel defaultSize={85}>
        <div
          className="relative h-full flex-1 exclude-theme-change"
          ref={containerRef}
        >
          <Spinner />
        </div>
      </ResizablePanel>
      <NotifyProgress name="File" signal={fileLoaderSignal} />
      <NotifyProgress name="Geometry" signal={geometryLoaderSignal} />
      <NotifyProgress name="Property" signal={propertyLoaderSignal} />
    </ResizablePanelGroup>
  );
};

export default BimViewer;
