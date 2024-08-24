import React from "react";
import {Outlet} from "react-router";

const RoomLayout = () => {
  return (
    <div className="relative h-full w-full flex bg-slate-50">
      <div className="relative h-full flex-1 flex justify-center">
        <div className="relative h-full w-[50%] m-auto bg-visual bg-center bg-no-repeat"></div>
      </div>
      <div className="relative h-full flex-1 flex justify-center">
        <div className="relative h-auto w-[600px] m-auto z-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default RoomLayout;
