import React, {useRef, useState} from "react";
import {Textarea} from "@/components/ui/textarea";
import {EmojiPicker} from "./EmojiPicker";
import {Button} from "@/components/ui/button";
import {ThumbsUp} from "lucide-react";
import {Socket} from "socket.io-client";
import {memberSignal} from "@stores/viewer/member";
const ChatBottom = ({roomId, socket}: {roomId: string; socket: Socket}) => {
  const [message, setMessage] = useState<string>("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const handleFocus = () => {
    if (!memberSignal.value) return;
    socket.emit("user-typing", {roomId, member: memberSignal.value});
  };
  const handleBlur = () => {
    if (!memberSignal.value) return;
    socket.emit("user-stop-typing", {roomId, member: memberSignal.value});
  };
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };
  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }

    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      setMessage((prev) => prev + "\n");
    }
  };
  const handleSend = () => {
    if (!memberSignal.value) return;
    if (message.trim()) {
      socket.emit("user-send-message", {
        roomId,
        member: memberSignal.value,
        message: message.trim(),
      });
      setMessage("");

      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  return (
    <div className="w-full h-12 p-1 mt-0.5 flex justify-between  items-center">
      <div className="relative flex-1">
        <Textarea
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={message}
          ref={inputRef}
          onKeyDown={handleKeyPress}
          onChange={handleInputChange}
          placeholder="Aa"
          className=" w-full border rounded-full flex items-center h-9 resize-none overflow-hidden bg-background"
        ></Textarea>
        <div className="absolute right-2 bottom-0.5  ">
          <EmojiPicker
            onChange={(value) => {
              console.log(value);
            }}
          />
        </div>
      </div>
      <Button className="ml-2 bg-transparent hover:bg-transparent p-1">
        <ThumbsUp size={20} className="text-muted-foreground" />
      </Button>
    </div>
  );
};

export default ChatBottom;
