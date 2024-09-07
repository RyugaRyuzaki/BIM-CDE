import * as OBC from "@thatopen/components";

import {memo, useId} from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {Switch} from "@components/ui/switch";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {useSignals} from "@preact/signals-react/runtime";
import {
  cameraModeSignal,
  mapBoxSignal,
  shadowSceneSignal,
} from "@bim/signals/config";

const Settings = () => {
  useSignals();
  const projectionId = useId();
  const cameraModeId = useId();
  const allModes: OBC.NavModeID[] = ["Orbit", "FirstPerson", "Plan"];

  return (
    <Accordion
      type="multiple"
      className="w-full"
      defaultValue={["item-1", "item-2", "item-3"]}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Render Settings</AccordionTrigger>
        <AccordionContent>
          <div className="relative h-full w-full my-2 flex justify-between">
            <Label htmlFor={projectionId} className="my-auto ml-2 w-[40%]">
              {shadowSceneSignal.value ? "Shadow" : "PostProduction"}
            </Label>
            <Switch
              id={projectionId}
              checked={shadowSceneSignal.value}
              onCheckedChange={(e: boolean) => {
                shadowSceneSignal.value = e;
              }}
            />
          </div>
          <div className="relative h-full w-full my-2 flex justify-between">
            <Label htmlFor={cameraModeId} className="my-auto m-2 w-[40%]">
              Camera Mode
            </Label>
            <Select
              value={cameraModeSignal.value}
              onValueChange={(value: OBC.NavModeID) =>
                (cameraModeSignal.value = value)
              }
            >
              <SelectTrigger className="relative h-full flex-1 my-auto">
                <SelectValue placeholder="Orbit" id={cameraModeId} />
              </SelectTrigger>
              <SelectContent>
                {allModes.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        {mapBoxSignal.value && (
          <>
            <AccordionTrigger>Model Coordination</AccordionTrigger>
            <AccordionContent></AccordionContent>
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
};

export default memo(Settings);
