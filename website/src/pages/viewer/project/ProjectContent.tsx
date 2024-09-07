import {Dispatch, FC, memo, SetStateAction} from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {useSignals} from "@preact/signals-react/runtime";
import {projectSignal} from "@bim/signals";
import ProjectItem from "./ProjectItem";
import {IProject} from "@bim/types";
const ProjectContent: FC<Props> = ({selectProject, setSelectProject}) => {
  useSignals();
  return (
    <div
      className="col-span-1 border-r-2 p-2"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectProject(null);
      }}
    >
      <Accordion type="multiple" className="w-full" defaultValue={["item-1"]}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Project List</AccordionTrigger>
          <AccordionContent>
            {projectSignal.value && (
              <>
                {projectSignal.value.map((pro) => (
                  <ProjectItem
                    key={pro.id}
                    project={pro}
                    selectProject={selectProject}
                    setSelectProject={setSelectProject}
                  />
                ))}
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
interface Props {
  selectProject: IProject | null;
  setSelectProject: Dispatch<SetStateAction<IProject | null>>;
}
export default memo(ProjectContent);
