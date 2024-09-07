import React from "react";
import {Outlet} from "react-router";

const UserLayout = () => {
  return (
    <div className="relative h-full w-full flex justify-center items-center">
      <Outlet />
    </div>
  );
};

export default UserLayout;
