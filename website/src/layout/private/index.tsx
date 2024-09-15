import {Outlet} from "react-router";
import PrivateHeader from "./PrivateHeader";
import {useEffect} from "react";
import {useAuth} from "@clerk/clerk-react";
import {getListProject} from "@api/project";
import {projectSignal} from "@bim/signals/project";
import {setNotify} from "@components/Notify/baseNotify";
import {IProject} from "@bim/types";
import {useNavigate} from "react-router-dom";
const PrivateLayout = () => {
  const {getToken, isSignedIn} = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isSignedIn) {
      navigate("/signIn");
      return;
    }
    (async () => {
      try {
        const token = await getToken();
        const res = await getListProject(token!);
        console.log(res.data.projects);
        projectSignal.value = res.data.projects.map((pro) => ({
          id: pro.id,
          name: pro.name,
          models: pro.models ?? [],
        })) as IProject[];
      } catch (error: any) {
        setNotify(error.message, false);
      }
    })();
  }, [getToken, navigate]);
  return (
    <div className="relative h-full w-full  flex flex-col">
      <div className="relative h-16 w-full px-8 border-b-4">
        <PrivateHeader />
      </div>
      <div className="relative flex-1 w-full overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default PrivateLayout;
