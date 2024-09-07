import React, {memo} from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {useSignals} from "@preact/signals-react/runtime";
import {selectProjectSignal} from "@bim/signals";
const ProjectTree = () => {
  useSignals();
  return (
    <div className="relative w-full overflow-x-hidden overflow-y-auto max-h-[500px]">
      <Accordion type="single" className="w-full" defaultValue={"item-1"}>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            {selectProjectSignal.value?.name ?? ""}
          </AccordionTrigger>
          <AccordionContent></AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default memo(ProjectTree);
