import {useEffect, useRef, useState} from "react";
import {Socket, io} from "socket.io-client";
import {socketUrl} from "@api/core";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

import {Separator} from "@/components/ui/separator";
import {
  CiVideoOn,
  CiVideoOff,
  CiMicrophoneOff,
  CiMicrophoneOn,
} from "react-icons/ci";
import {IRoomMember, IRoomParticipant} from "@/types/room";
import RoomMembersAvatar from "./RoomMembersAvatar";
import Viewer from "./Viewer";
import {
  isMemberJoinSignal,
  memberSignal,
  roomMembersSignal,
  streamSignal,
} from "@bim/signals/member";
import {useSignalEffect, useSignals} from "@preact/signals-react/runtime";
import Participant from "./Participant";
import {peerHost, peerPORT} from "@api/core";
import {Peer, MediaConnection} from "peerjs";

const RoomPreview = ({
  roomId,
  permission,
}: {
  roomId: string;
  permission: string | "main" | "member" | "guess";
}) => {
  useSignals();
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const callRef = useRef<Set<string>>(new Set());
  const [allowMicro, setAllowMicro] = useState<boolean>(false);

  const handleVideoToggle = async () => {
    if (!streamSignal.value) {
      streamSignal.value = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    } else {
      const tracks = streamSignal.value.getTracks();
      tracks.forEach((track) => track.stop());
      streamSignal.value = null;
      deleteCalls();
    }
  };
  const handleMicroToggle = async () => {
    if (!streamSignal.value) {
      try {
        streamSignal.value = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setAllowMicro(true); // Bật micro khi lấy stream thành công
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    } else {
      const audioTracks = streamSignal.value.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach((track) => (track.enabled = !allowMicro));
        setAllowMicro(!allowMicro);
      } else {
        console.error("No audio track found.");
      }
    }
  };
  const handleJoinRoom = () => {
    if (!socketRef.current) return;
    isMemberJoinSignal.value = true;
  };
  const deleteCalls = () => {
    for (const userId in roomMembersSignal.value) {
      const item = roomMembersSignal.value[userId];
      if (item) {
        item.stream = undefined;
        item.call = undefined;
      }
    }
    roomMembersSignal.value = {...roomMembersSignal.value};
    callRef.current.clear();
  };
  const addCall = (stream: MediaStream, userId: string) => {
    if (!peerRef.current) return;
    const call = peerRef.current!.call(userId, stream, {
      metadata: {
        member: memberSignal.value,
      },
    });
    call.on("stream", (stream: MediaStream) => {
      if (!callRef.current.has(userId)) {
        roomMembersSignal.value = {
          ...roomMembersSignal.value,
          [userId]: {...roomMembersSignal.value[userId], call, stream},
        };
        callRef.current.add(userId);
      }
    });
    call.on("close", () => {
      const item = roomMembersSignal.value[userId];
      if (item) {
        item.stream = undefined;
        item.call = undefined;
        roomMembersSignal.value = {...roomMembersSignal.value};
      }
    });
  };

  useEffect(() => {
    if (!memberSignal.value) return;
    socketRef.current = io(socketUrl, {
      auth: {member: memberSignal.value, roomId, permission},
    });
    peerRef.current = new Peer(memberSignal.value.userId, {
      host: peerHost,
      port: peerPORT,
    });

    peerRef.current.on("call", (call) => {
      const {member} = call.metadata;
      call.answer(streamSignal.value!);
      console.log("call", member.userId);
      call.on("stream", (stream: MediaStream) => {
        if (!callRef.current.has(member.userId)) {
          roomMembersSignal.value = {
            ...roomMembersSignal.value,
            [member.userId]: {call, stream, member},
          };
          callRef.current.add(member.userId);
        }
      });
    });

    const handleRoomMembers = (members: Record<string, IRoomMember>) => {
      if (!memberSignal.value) return;
      const {userId} = memberSignal.value;
      const list: Record<string, IRoomParticipant> = {
        ...roomMembersSignal.value,
      };
      for (const id in members) {
        if (id === userId) continue;
        list[id] = {...list[id], member: members[id]};
      }
      roomMembersSignal.value = {...list};
    };
    const handleUserJoin = (joinMember: IRoomMember) => {
      const {userId} = joinMember;
      roomMembersSignal.value = {
        ...roomMembersSignal.value,
        [userId]: {member: joinMember},
      };
      if (streamSignal.value) {
        addCall(streamSignal.value, userId);
      }
    };
    const handleUserLeave = (leaveMember: IRoomMember) => {
      const {userId} = leaveMember;
      callRef.current.delete(userId);
      if (roomMembersSignal.value[userId]) {
        roomMembersSignal.value[userId]?.call?.close();
      }
      delete roomMembersSignal.value[userId];
      roomMembersSignal.value = {...roomMembersSignal.value};
    };

    socketRef.current.on("room-members", handleRoomMembers);
    socketRef.current.on("user-join", handleUserJoin);
    socketRef.current.on("user-leave", handleUserLeave);

    return () => {
      callRef.current!.clear();
      socketRef.current!.off("room-members", handleRoomMembers);
      socketRef.current!.off("user-join", handleUserJoin);
      socketRef.current!.off("user-leave", handleUserLeave);
      socketRef.current!.disconnect();
      peerRef.current!.disconnect();
      peerRef.current!.destroy();
      if (streamSignal.value) {
        const tracks = streamSignal.value.getTracks();
        tracks.forEach((track) => track.stop());
        streamSignal.value = null;
      }
      roomMembersSignal.value = {};
      isMemberJoinSignal.value = false;
    };
  }, []);

  return (
    <>
      {isMemberJoinSignal.value && socketRef.current && memberSignal.value ? (
        <Viewer
          roomId={roomId}
          permission={permission}
          socket={socketRef.current}
        />
      ) : (
        <div className="relative h-full w-full overflow-hidden flex items-center justify-center">
          <Card className="relative w-[600px] shadow-xl p-3">
            <CardContent className="p-1">
              {memberSignal.value && (
                <Participant
                  member={memberSignal.value}
                  stream={streamSignal.value}
                />
              )}
              <Separator className="my-1" />

              <div className="h-12 w-full grid grid-cols-2 p-1">
                <div className="w-full flex justify-center">
                  <Button
                    className="p-0 my-auto mx-4 bg-transparent hover:bg-transparent animate-pulse"
                    onClick={handleVideoToggle}
                  >
                    {streamSignal.value ? (
                      <CiVideoOff className={"h-8 w-8  text-slate-500"} />
                    ) : (
                      <CiVideoOn className={"h-8 w-8  text-slate-500"} />
                    )}
                  </Button>
                  <h1 className="my-auto">Use Video</h1>
                </div>
                <div className="w-full  flex justify-center">
                  <Button
                    className="p-0 my-auto mx-4 bg-transparent hover:bg-transparent animate-pulse"
                    onClick={handleMicroToggle}
                    disabled={streamSignal.value === null}
                  >
                    {allowMicro ? (
                      <CiMicrophoneOff className={"h-8 w-8  text-slate-500"} />
                    ) : (
                      <CiMicrophoneOn className={"h-8 w-8  text-slate-500"} />
                    )}
                  </Button>
                  <h1 className="my-auto">Use Micro</h1>
                </div>
              </div>
              <Separator className="my-1" />
              <RoomMembersAvatar handleJoinRoom={handleJoinRoom} />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default RoomPreview;
