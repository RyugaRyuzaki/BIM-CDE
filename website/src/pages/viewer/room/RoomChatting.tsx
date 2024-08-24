import {Socket} from "socket.io-client";
import ChatBottom from "./ChatBottom";
import {IRoomMember} from "@/types/room";
import ChatItem from "./ChatItem";

const getMemberTyping = (members: string[]) => {
  let str = "";
  for (const mem of members) {
    str += mem.substring(0, 4);
  }
  return str;
};
const RoomChatting = ({
  listChat,
  isTyping,
  members,
  roomId,
  socket,
}: {
  listChat: {message: string; member: IRoomMember}[];
  isTyping: boolean;
  members: string[];
  roomId: string;
  socket: Socket;
}) => {
  return (
    <div className="relative h-full w-full overflow-clip flex flex-col">
      <div className="relative w-full flex-1 max-h-[200vh] overflow-x-hidden overflow-y-auto rounded-sm border  border-spacing-1">
        <div
          className={`absolute z-50 top-0 w-full  flex items-center  bg-green-200  ${
            isTyping
              ? "animate-accordion-down visible"
              : "animate-accordion-up hidden"
          }`}
        >
          <p className="p-0 h-full w-[90%] mx-auto text-black">
            {getMemberTyping(members)} typing...
          </p>
        </div>
        {listChat.map(({member, message}, index: number) => (
          <ChatItem key={`${index}`} member={member} message={message} />
        ))}
      </div>
      <ChatBottom roomId={roomId} socket={socket} />
    </div>
  );
};

export default RoomChatting;
