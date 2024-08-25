import React, {memo} from "react";
import {Button} from "@/components/ui/button";
import {SiMapbox} from "react-icons/si";
import {MdOutline3dRotation} from "react-icons/md";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {useSignals} from "@preact/signals-react/runtime";
import {mapBoxSignal} from "@stores/viewer/config";
const ToggleView = () => {
  useSignals();
  return (
    <TooltipProvider delayDuration={10}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="flex-1 p-0 bg-transparent hover:bg-transparent"
            onClick={() => (mapBoxSignal.value = !mapBoxSignal.value)}
          >
            {mapBoxSignal.value ? (
              <MdOutline3dRotation className="h-8 w-8 text-slate-50" />
            ) : (
              <SiMapbox className="h-8 w-8 text-slate-50" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{mapBoxSignal.value ? "3D" : "Map"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default memo(ToggleView);
