import {TbHandStop} from "react-icons/tb";
import {MdOutlineAddReaction} from "react-icons/md";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";

import ButtonRoom from "@layout/components/ButtonRoom";
import {listReaction} from "@constants/reaction";
import {IReaction} from "@/types/reaction";
import {useSignals} from "@preact/signals-react/runtime";
const iconClass = "h-8 w-8  text-slate-500";

const RoomHeader = () => {
  useSignals();
  const onRaise = () => {};
  const onReact = (react: IReaction) => {
    console.log(react);
  };

  return (
    <>
      <ButtonRoom
        onClick={onRaise}
        disabled={false}
        title="Raise"
        icon={<TbHandStop className={iconClass} />}
      />
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none" asChild>
          <div className="relative flex flex-col">
            <Button className="flex-1 p-0 bg-transparent hover:bg-transparent animate-pulse">
              <MdOutlineAddReaction className={iconClass} />
            </Button>
            <h1 className="text-center text-[10px] capitalize p-0">React</h1>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-4 mt-0">
          {listReaction.map((react: IReaction, index: number) => (
            <DropdownMenuItem
              key={`${react.uuid}-${index}`}
              className="text-lg"
              onClick={() => onReact(react)}
            >
              {react.emoji}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default RoomHeader;
