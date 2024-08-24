import React, {lazy} from "react";
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
const PrivateAvatar = () => {
  return (
    <div className="my-auto mx-2 flex justify-start">
      <Avatar className="my-auto mx-2">
        <AvatarImage src={noneAvatar} alt="@shadcn" />
        <AvatarFallback></AvatarFallback>
      </Avatar>
      <div className="my-auto">
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <MdOutlineArrowDropDown className="h-8 w-8" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mt-4">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default PrivateAvatar;
