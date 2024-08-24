import React from "react";
import {Link} from "react-router-dom";
import {Separator} from "@/components/ui/separator";
import {FaLinkedin} from "react-icons/fa";
import {FaGithub} from "react-icons/fa";
const Footer = () => {
  return (
    <div className="relative h-96 w-full flex flex-col">
      <Separator className="my-4" />
      <div className="relative h-full w-[80%] mx-auto ">
        <div className="relative flex-1 my-auto grid grid-cols-3 overflow-hidden">
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="relative h-20 w-[80%] mx-auto  flex justify-between mb-2">
        <h1 className="text-xl font-extralight  my-auto">
          © 2024 openbimvietnam Inc.
        </h1>
        <div className="relative flex justify-start h-[90%] my-auto">
          <a
            href="https://www.linkedin.com/in/ryuga-ryuzaki-479b36186/"
            rel="noopener noreferrer"
            className="my-auto mx-2"
            target="_blank"
          >
            <FaLinkedin className="h-8 w-8" />
          </a>
          <a
            href="https://github.com/RyugaRyuzaki"
            rel="noopener noreferrer"
            className="my-auto mx-2"
            target="_blank"
          >
            <FaGithub className="h-8 w-8" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
