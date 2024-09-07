import {memo} from "react";

import {IRoomMember} from "@/types/room";
import {useSignals} from "@preact/signals-react/runtime";
import {
  askControlMemberSignal,
  meControlledMemberSignal,
  memberSignal,
  memberStatusSignal,
  orientedMemberSignal,
} from "@bim/signals/member";
import {IoIosFlash} from "react-icons/io";
import {MdFollowTheSigns} from "react-icons/md";
import {RiUserUnfollowLine} from "react-icons/ri";
import {Button} from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ParticipantAvatar from "./ParticipantAvatar";

const iconClass = "h-4 w-4 text-slate-500";
/**
 *
 * @param param0
 * @returns
 */
const Participant = ({
  member,
  stream,
}: {
  member: IRoomMember;
  stream: MediaStream | null;
}) => {
  useSignals();

  const handleOriented = () => {
    orientedMemberSignal.value = member.userId;
  };

  const handleAskControl = () => {
    askControlMemberSignal.value = member.userId;
  };
  const handleAbortControl = () => {
    meControlledMemberSignal.value = null;
  };
  return (
    <div className="relative h-auto w-full  shadow-xl my-1">
      <div className="relative h-full w-full flex flex-col border-b-2">
        <ParticipantAvatar {...{member, stream}} />
        <div className="relative w-full top-1 flex items-center justify-center">
          <p
            className={`relative capitalize text-center py-2`}
            style={{color: `#${member.color?.toString(16)}`}}
          >
            {member.username}
          </p>
          {memberSignal.value &&
            meControlledMemberSignal.value &&
            memberSignal.value.userId === member.userId && (
              <TooltipProvider delayDuration={10}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="mx-2 bg-transparent hover:bg-transparent  px-1"
                      onClick={handleAbortControl}
                    >
                      <RiUserUnfollowLine className={iconClass} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Abort Control</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

          {memberSignal.value &&
            !meControlledMemberSignal.value &&
            memberSignal.value.userId !== member.userId && (
              <>
                <TooltipProvider delayDuration={10}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="mx-2 bg-transparent hover:bg-transparent  px-1"
                        onClick={handleOriented}
                      >
                        <IoIosFlash className={iconClass} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Oriented</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {memberStatusSignal.value[member.userId] ? (
                  <p className="relative capitalize text-center py-2">
                    {memberStatusSignal.value[member.userId] === "busy" ? (
                      <>⛔</>
                    ) : (
                      <>📞</>
                    )}
                  </p>
                ) : (
                  <TooltipProvider delayDuration={10}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="mx-2 bg-transparent hover:bg-transparent  px-1"
                          onClick={handleAskControl}
                        >
                          <MdFollowTheSigns className={iconClass} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Ask Control</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            )}
        </div>
      </div>
    </div>
  );
};

export default memo(Participant);
