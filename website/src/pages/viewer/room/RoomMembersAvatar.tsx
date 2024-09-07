import noneAvatar from "@assets/img/none-avatar.jpg";
import {MeetingItem} from "react-chat-elements";
import {IRoomParticipant} from "@/types/room";
import {roomMembersSignal} from "@bim/signals/member";
import {useSignals} from "@preact/signals-react/runtime";
const RoomMembersAvatar = ({handleJoinRoom}: {handleJoinRoom: () => void}) => {
  useSignals();
  return (
    <MeetingItem
      id={"meeting-1"}
      subject={"....."}
      subjectLimit={10}
      dateString="...."
      avatars={Object.values(roomMembersSignal.value).map(
        ({member}: IRoomParticipant) => ({src: member.avatar ?? noneAvatar})
      )}
      onMeetingClick={handleJoinRoom}
      onShareClick={() => alert("Clicked Share Meeting")}
    />
  );
};

export default RoomMembersAvatar;
