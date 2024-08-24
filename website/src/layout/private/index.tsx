import React from "react";
import {Outlet} from "react-router";
import PrivateHeader from "./PrivateHeader";

const PrivateLayout = () => {
  return (
    <div className="relative h-full w-full  flex flex-col">
      <div className="relative h-16 w-full px-8 border-b-2">
        <PrivateHeader />
      </div>
      <div className="relative flex-1 w-full overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default PrivateLayout;
