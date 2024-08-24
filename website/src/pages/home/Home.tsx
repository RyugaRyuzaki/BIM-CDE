import React from "react";
import {Button} from "@/components/ui/button";
import {Link} from "react-router-dom";
const Home = () => {
  return (
    <div className="relative h-[60vh] w-full rounded-md shadow-md  flex bg-gray-900">
      <div className="relative h-full flex-1 "></div>
      <div className="relative h-full flex-1 bg-meeting bg-center bg-no-repeat flex items-center"></div>
      <div className="absolute top-0 h-full w-full flex items-center">
        <div className="relative h-[30%] w-[80%] m-auto flex flex-col">
          <h3 className="text-white text-xl mb-3">BIM-Model Team Meeting</h3>
          <h1 className="text-white max-w-[50%] whitespace-pre-wrap text-6xl mb-5 flex-1">
            Collaborate, Innovate, Succeed
          </h1>
          <Link to={"/login"}>
            <Button className="w-[150px] p-5 text-lg bg-blue-600">
              Get in touch
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
