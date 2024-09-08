import React, {memo} from "react";
import {Button} from "@components/ui/button";
import {FaUpload} from "react-icons/fa";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import {useSignals} from "@preact/signals-react/runtime";
import {selectProjectSignal} from "@bim/signals";
import {BimModel} from "@bim/BimModel";

const ProjectTree = ({bimModel}: {bimModel: BimModel}) => {
  useSignals();
  const handleUploadServer = () => {
    //bimModel
  };
  return (
    <div className="relative w-full overflow-x-hidden overflow-y-auto max-h-[500px]">
      <Accordion type="single" className="w-full" defaultValue={"item-1"}>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            {selectProjectSignal.value?.name ?? ""}
          </AccordionTrigger>
          <AccordionContent>
            {selectProjectSignal.value && (
              <>
                {selectProjectSignal.value.models.length === 0 ? (
                  <p className="text-center">No Models</p>
                ) : (
                  <>
                    {selectProjectSignal.value.models.map((model) => (
                      <div
                        key={model.id}
                        className={`group flex justify-between p-1   rounded-md my-1`}
                      >
                        <div className="flex justify-start">
                          <p
                            className="mx-2 capitalize 
                       my-auto select-none 
                       whitespace-nowrap overflow-hidden 
                       overflow-ellipsis max-w-[200px] p-1"
                          >
                            {model.name}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <TooltipProvider delayDuration={10}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="flex-1 p-0 bg-transparent hover:bg-transparent"
                                  onClick={handleUploadServer}
                                >
                                  <FaUpload className="text-white" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="right"
                                className="text-white bg-slate-900"
                              >
                                Upload to server
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default memo(ProjectTree);
