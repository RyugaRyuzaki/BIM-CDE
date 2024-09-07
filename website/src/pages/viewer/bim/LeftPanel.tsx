import {memo} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {BimModel} from "@bim/BimModel";
import LoadModel from "./LoadModel";
import {useSignals} from "@preact/signals-react/runtime";
import Settings from "./Settings";
import ModelTree from "./ModelTree";
import {IModelTree} from "@bim/types";
import {modelTreeSignal} from "@bim/signals";
import ProjectTree from "./ProjectTree";

const LeftPanel = ({bimModel}: {bimModel: BimModel}) => {
  useSignals();

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
        <ProjectTree />

        <LoadModel
          handleOpenFile={() => {
            // if (!modelTreeSignal.value) return;
            bimModel.loadModel();
          }}
        />
      </TabsContent>
      <TabsContent
        value="Settings"
        className="relative h-[calc(100%-40px)] w-full overflow-hidden"
      >
        <Settings />
      </TabsContent>
    </Tabs>
  );
};

export default memo(LeftPanel);
