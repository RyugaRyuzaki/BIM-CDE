import {memo, useEffect, useRef, useState} from "react";
import {BimModel} from "@bim/BimModel";
import {Socket} from "socket.io-client";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import RoomParticipants from "./RoomParticipants";
import RoomChatting from "./RoomChatting";
import {IRoomMember} from "@/types/room";
import {
  askedControlMemberSignal,
  controlledMemberSignal,
  memberSignal,
} from "@bim/signals/member";
import {IoMdClose} from "react-icons/io";
import {Button} from "@/components/ui/button";
import {AskControlNotify} from "@components/Notify/ControlNotify";

/**
 *
 * @param param0
 * @returns
 */
const Viewer = ({
  roomId,
  permission,
  socket,
}: {
  roomId: string;
  permission: string | "main" | "member" | "guess";
  socket: Socket;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [members, setMembers] = useState<string[]>([]);
  const [listChat, setListChat] = useState<
    {message: string; member: IRoomMember}[]
  >([]);
  useEffect(() => {
    if (!memberSignal.value) return;
    // join room
    socket.emit("user-join", {member: memberSignal.value, roomId});

    const handleUserTyping = (members: string[]) => {
      setIsTyping(members.length > 0);
      setMembers(members);
    };

    const handleUserSendMessage = ({
      member,
      message,
    }: {
      member: IRoomMember;
      message: string;
    }) => {
      setListChat((prevListChat) => [...prevListChat, {member, message}]);
    };

    socket.on("user-typing", handleUserTyping);
    socket.on("user-send-message", handleUserSendMessage);

    const bimModel = new BimModel(containerRef.current!);
    bimModel.initRoom({permission, roomId}, socket, memberSignal.value);

    return () => {
      socket.off("user-typing", handleUserTyping);
      socket.off("user-send-message", handleUserSendMessage);
      bimModel.dispose();
    };
  }, []);
  return (
    <div className="relative h-full w-full overflow-hidden flex">
      <div className="relative h-full w-[300px] p-2">
        <Tabs defaultValue="Participants" className="w-full h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Participants">Participants</TabsTrigger>
            <TabsTrigger value="Chatting">
              <div className="w-full flex justify-start">
                <p className="my-auto flex-1">Chatting</p>
                {/* <Button className="h-4 w-4 m-auto bg-transparent hover:bg-transparent animate-pulse p-0">
                  <IoMdClose className={"h-4 w-4 text-slate-500"} />
                </Button> */}
              </div>
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="Participants"
            className="relative h-[calc(100%-40px)] w-full overflow-hidden"
          >
            <RoomParticipants />
          </TabsContent>
          <TabsContent
            value="Chatting"
            className="relative h-[calc(100%-40px)] w-full overflow-hidden"
          >
            <RoomChatting {...{roomId, socket, listChat, isTyping, members}} />
          </TabsContent>
        </Tabs>
      </div>
      <div
        className="relative h-full flex-1 exclude-theme-change"
        ref={containerRef}
      ></div>
      <AskControlNotify
        status={askedControlMemberSignal}
        member={controlledMemberSignal}
      />
    </div>
  );
};

export default memo(Viewer);
