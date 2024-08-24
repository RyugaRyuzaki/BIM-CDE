import {memo, useRef} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {BimModel} from "@bim/BimModel";
import UploadForm from "./UploadForm";
import LoadModel from "./LoadModel";
import {useSignals} from "@preact/signals-react/runtime";

const LeftPanel = ({bimModel}: {bimModel: BimModel}) => {
  useSignals();
  const settingRef = useRef<HTMLDivElement | null>(null);

  return (
    <Tabs defaultValue="Project" className="w-full h-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="Project">Project</TabsTrigger>
        <TabsTrigger value="Settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent
        value="Project"
        className="relative h-[calc(100%-40px)] w-full overflow-hidden"
      >
        <LoadModel handleOpenFile={bimModel.loadModel} />
      </TabsContent>
      <TabsContent
        value="Settings"
        className="relative h-[calc(100%-40px)] w-full overflow-hidden"
        ref={settingRef}
      ></TabsContent>
    </Tabs>
  );
};

export default memo(LeftPanel);
