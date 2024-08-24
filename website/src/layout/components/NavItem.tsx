import React from "react";
import {Link} from "react-router-dom";

const NavItem = () => {
  const handleMouseLeave = () => {
    console.log("object");
  };
  return (
    <div
      className="relative min-w-16  flex items-center group"
      onMouseLeave={handleMouseLeave}
    >
      <Link type="button" to="/" className="my-auto">
        <h3 className="text-xl font-semibold">Link</h3>
      </Link>
      <div className="absolute bottom-0 left-0 w-full h-[4px] bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

export default NavItem;
