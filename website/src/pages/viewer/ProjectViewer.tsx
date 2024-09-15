import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import ProjectTable from "./project/ProjectTable";
import {Button} from "@components/ui/button";
import NewProject from "./project/NewProject";
import {useState} from "react";
import ProjectContent from "./project/ProjectContent";
import {SiAirplayvideo} from "react-icons/si";
import {FaShareFromSquare} from "react-icons/fa6";
import {MdPreview} from "react-icons/md";
import {IoCloudUploadOutline} from "react-icons/io5";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {useNavigate} from "react-router";
import {isBrowser} from "@constants/browser";
import {IProject} from "@bim/types";
import {derivativeFile} from "@api/project";
import {useAuth} from "@clerk/clerk-react";
import {setNotify} from "@components/Notify/baseNotify";
const iconClassName = "h-[20px] w-[20px]";

/**
 *
 * @returns
 */
const ProjectViewer = () => {
  const navigate = useNavigate();
  const {getToken} = useAuth();
  const [openNewProject, setOpenNewProject] = useState<boolean>(false);

  const [selectProject, setSelectProject] = useState<IProject | null>(null);

  const onViewProject = () => {
    if (!selectProject) return;
    navigate(`/viewer/bim?projectId=${selectProject.id}&private=true`);
  };
  const onPreViewProject = () => {
    if (!selectProject) return;
    navigate(
      `/viewer/bim?projectId=${selectProject.id}&private=true&preview=true`
    );
  };
  const onUploadServer = async () => {
    if (!selectProject) return;

    const token = await getToken();
    if (!token) {
      setNotify("UnAuthorization!");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".ifc, .IFC, .dxf";
    input.multiple = false;
    input.click();
    input.onchange = async (e: any) => {
      const file = e.target.files[0] as File;
      if (!file) return;
      const res = await derivativeFile(file, selectProject.id, token);
      console.log(res);
    };
    input.remove();
  };
  const onShare = () => {
    if (!selectProject) return;
    if (!isBrowser) return;
    const protocol = window.location.protocol;
    const host = window.location.host;
    window.navigator.clipboard
      .writeText(
        `${protocol}//${host}/viewer/bim?projectId=${selectProject.id}&private=false`
      )
      .then(() => {
        console.log("Text copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };
  return (
    <>
      <div className="relative h-full w-full overflow-hidden flex items-center p-5 bg-orange-300">
        <Card className="relative h-full w-full overflow-hidden shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle>
              <div className="w-full flex justify-between">
                <h1 className="my-auto">My Document</h1>
                <div className="flex justify-end gap-2">
                  {selectProject && (
                    <>
                      <TooltipProvider delayDuration={10}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={"secondary"}
                              onClick={onViewProject}
                            >
                              <SiAirplayvideo className={iconClassName} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>View projects</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider delayDuration={10}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={"secondary"}
                              onClick={onPreViewProject}
                            >
                              <MdPreview className={iconClassName} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>PreView projects</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider delayDuration={10}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant={"secondary"} onClick={onShare}>
                              <FaShareFromSquare className={iconClassName} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Share Project</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider delayDuration={10}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={"secondary"}
                              onClick={onUploadServer}
                            >
                              <IoCloudUploadOutline className={iconClassName} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Upload file</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </>
                  )}
                  <Button
                    variant={"destructive"}
                    onClick={() => {
                      setOpenNewProject(true);
                    }}
                  >
                    New Project
                  </Button>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative h-full w-full grid grid-cols-5 gap-2">
            <ProjectContent
              selectProject={selectProject}
              setSelectProject={setSelectProject}
            />
            <div className="col-span-4">
              <ProjectTable />
            </div>
          </CardContent>
        </Card>
      </div>
      <NewProject
        openNewProject={openNewProject}
        setOpenNewProject={setOpenNewProject}
      />
    </>
  );
};

export default ProjectViewer;
