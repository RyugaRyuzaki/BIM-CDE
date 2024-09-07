import React, {memo} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import noneAvatar from "@assets/img/none-avatar.jpg";
import {IRoomMember} from "@/types/room";
import {memberSignal} from "@bim/signals/member";
import {Separator} from "@/components/ui/separator";
const ChatItem = ({
  member,
  message,
}: {
  member: IRoomMember;
  message: string;
}) => {
  const isMain =
    memberSignal.value !== null && memberSignal.value.userId === member.userId;
  return (
    <div
      className={`relative w-full p-1 flex ${
        isMain ? "justify-end" : "justify-start"
      }`}
    >
      <Card className="w-[70%] cursor-pointer">
        <CardHeader className={`p-1 `}>
          <div className={`p-1 ${isMain ? "bg-blue-200" : ""}`}>
            <Avatar className="h-8 w-8" title={member.username}>
              {member.avatar ? (
                <AvatarImage src={member.avatar} alt="Avatar" />
              ) : (
                <AvatarImage src={noneAvatar} alt="@room" />
              )}
              <AvatarFallback></AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-1">
          <p className="text-[12px] select-none break-words">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default memo(ChatItem);
