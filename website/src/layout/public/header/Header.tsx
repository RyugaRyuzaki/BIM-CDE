import React from "react";
import Theme from "@components/theme";
import {useAuth} from "@clerk/clerk-react";
import PrivateAvatar from "@layout/private/PrivateAvatar";
import {Button} from "@/components/ui/button";
import {Link, useNavigate} from "react-router-dom";
//@ts-ignore
import {ReactComponent as Logo} from "@assets/logo.svg";
const Header = () => {
  const navigate = useNavigate();
  const {isSignedIn} = useAuth();
  return (
    <div className="sticky top-0 h-16 w-full shadow-xl">
      <div className="relative h-full w-[80%] mx-auto flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-[80%] flex justify-between">
          <div className="my-auto flex justify-start">
            <div className="flex-shrink-0">
              <Link to={"/"} className="text-2xl font-bold text-gray-800">
                <Logo className="h-12 w-12" />
              </Link>
            </div>
          </div>
          <div className="my-auto flex justify-end">
            {isSignedIn ? (
              <PrivateAvatar />
            ) : (
              <Button
                className="w-[150px] p-5 text-lg bg-blue-600 mr-3"
                onClick={() => navigate("/signIn")}
              >
                Get in touch
              </Button>
            )}
            <Theme />
          </div>
        </div>
      </div>
      {/* <div className="absolute w-full h-16 animate-accordion-down z-50 bg-slate-200"></div> */}
    </div>
  );
};

export default Header;
