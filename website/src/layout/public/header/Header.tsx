import React from "react";
import Theme from "@components/theme";

const Header = () => {
  return (
    <div className="sticky top-0 h-16 w-full shadow-xl">
      <div className="relative h-full w-[80%] mx-auto flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-[80%] flex justify-between">
          <div className="my-auto"></div>
          <div className="my-auto flex justify-end">
            <Theme />
          </div>
        </div>
      </div>
      {/* <div className="absolute w-full h-16 animate-accordion-down z-50 bg-slate-200"></div> */}
    </div>
  );
};

export default Header;
