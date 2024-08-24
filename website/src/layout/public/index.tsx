import React, {Suspense} from "react";
import {Outlet} from "react-router";
import Header from "./header/Header";
import Footer from "./footer/Footer";
const PublicLayout = () => {
  return (
    <div className="relative w-full h-full flex flex-col">
      <Header />
      <div className="relative flex-1 overflow-y-auto">
        <div className="relative min-h-[calc(100%-20rem)]  w-[80%] mx-auto py-2 my-24">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default PublicLayout;
