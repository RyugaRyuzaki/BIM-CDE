import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import noneAvatar from "@assets/img/none-avatar.jpg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {IRoomMember} from "@/types/room";
const ParticipantAvatar = ({member}: {member: IRoomMember}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none" asChild>
        <Avatar
          className={`h-[30px] w-[30px] m-auto cursor-pointer z-50 pointer-events-auto`}
          title={member.username}
        >
          {member.avatar ? (
            <AvatarImage src={member.avatar} alt="Avatar" />
          ) : (
            <AvatarImage src={noneAvatar} alt="@room" />
          )}
          <AvatarFallback></AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        alignOffset={30}
        className="mt-0"
      ></DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ParticipantAvatar;
