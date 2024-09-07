import {
  memberSignal,
  roomMembersSignal,
  streamSignal,
} from "@bim/signals/member";
import Participant from "./Participant";
import {useSignals} from "@preact/signals-react/runtime";
import {IRoomMember, IRoomParticipant} from "@/types/room";
import {memo, useMemo} from "react";
const RoomParticipants = () => {
  useSignals();
  const roomMembers = useMemo<IRoomParticipant[]>(() => {
    return Object.values(roomMembersSignal.value);
  }, [roomMembersSignal.value]);
  return (
    <div className="relative h-full w-full max-h-[200vh] overflow-x-hidden overflow-y-auto">
      {memberSignal.value && (
        <Participant member={memberSignal.value} stream={streamSignal.value!} />
      )}
      <>
        {roomMembers.map((item: IRoomParticipant, index: number) => (
          <Participant
            key={`${item.member.userId}-${index}`}
            member={item.member}
            stream={item.stream!}
          />
        ))}
      </>
    </div>
  );
};

export default memo(RoomParticipants);
