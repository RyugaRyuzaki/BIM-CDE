import {projectSignal} from "@bim/signals/project";
import React, {useEffect} from "react";
import {Outlet} from "react-router";

const AuthLayout = () => {
  useEffect(() => {
    projectSignal.value = null;
  }, []);
  return (
    <div className="relative h-full w-full flex justify-center items-center">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
