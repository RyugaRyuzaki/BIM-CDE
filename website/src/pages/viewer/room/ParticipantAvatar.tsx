import React, {memo, useEffect, useRef} from "react";
import {IRoomMember} from "@/types/room";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import noneAvatar from "@assets/img/none-avatar.jpg";
const ParticipantAvatar = ({
  member,
  stream,
}: {
  member: IRoomMember;
  stream: MediaStream | null;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current || !stream) return;
    videoRef.current.srcObject = stream;
  }, [stream]);
  return (
    <div
      className={`relative flex-1 w-full rounded-md flex items-center select-none`}
    >
      {stream ? (
        <video
          ref={videoRef}
          className="h-full w-full m-auto object-cover rounded-md"
          autoPlay
        ></video>
      ) : (
        <Avatar
          className={`h-[150px] w-[150px] m-auto`}
          title={member.username}
        >
          {member.avatar ? (
            <AvatarImage src={member.avatar} alt="Avatar" />
          ) : (
            <AvatarImage src={noneAvatar} alt="@room" />
          )}
          <AvatarFallback></AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default memo(ParticipantAvatar);
