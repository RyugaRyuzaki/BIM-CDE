"use client";

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {MdOutlineArrowDropDown} from "react-icons/md";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import noneAvatar from "@assets/img/none-avatar.jpg";
import {useClerk, useUser} from "@clerk/clerk-react";
import {useNavigate} from "react-router";
const PrivateAvatar = () => {
  const {signOut} = useClerk();
  const navigate = useNavigate();
  const {user} = useUser();
  return (
    <div className="my-auto mx-2 flex justify-start">
      <Avatar className="my-auto mx-2">
        <AvatarImage
          src={user ? user.imageUrl : noneAvatar}
          alt="@openbimvietnam"
        />
        <AvatarFallback></AvatarFallback>
      </Avatar>
      <div className="my-auto">
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <MdOutlineArrowDropDown className="h-8 w-8" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mt-4">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/user-profile")}>
              Your Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/viewer/project")}>
              Your Project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({redirectUrl: "/signIn"})}>
              SignOut
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default PrivateAvatar;
