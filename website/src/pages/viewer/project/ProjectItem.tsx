import React, {Dispatch, FC, memo, SetStateAction, useState} from "react";
import {MdArrowForwardIos} from "react-icons/md";
import {IModel, IProject} from "@bim/types";
const iconClassName = "h-[16px] w-[16px]";

const ProjectItem: FC<Props> = ({project, selectProject, setSelectProject}) => {
  const [show, setShow] = useState<boolean>(true);

  return (
    <div className="relative w-full">
      <>
        <div
          className={`group flex justify-between p-1 cursor-pointer   hover:bg-green-300 hover:text-slate-800 rounded-md my-1
             ${
               selectProject && selectProject.id === project.id
                 ? "bg-green-300 text-slate-800"
                 : ""
             }
        `}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectProject(project);
          }}
        >
          <div className="flex justify-start">
            <button
              className="border-none outline-none cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShow((pre) => !pre);
              }}
            >
              <MdArrowForwardIos
                className={`${iconClassName} ${
                  show ? "rotate-90" : "rotate-0"
                } `}
              />
            </button>

            <p
              className="mx-2 capitalize 
          my-auto select-none 
          whitespace-nowrap overflow-hidden 
          overflow-ellipsis max-w-[200px] p-1"
            >
              {project.name}
            </p>
          </div>
        </div>
        <div className="ml-5">
          {project.models.length === 0 ? (
            <p className="text-center">No model</p>
          ) : (
            <>
              {project.models.map((model: IModel) => (
                <div
                  key={`${model.id}`}
                  className={`group flex justify-between p-1 cursor-pointer   hover:bg-green-300 hover:text-slate-800 rounded-md my-1
                         `}
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
                </div>
              ))}
            </>
          )}
        </div>
      </>
    </div>
  );
};
interface Props {
  project: IProject;
  selectProject: IProject | null;
  setSelectProject: Dispatch<SetStateAction<IProject | null>>;
}
export default memo(ProjectItem);
