import React, {FC, ReactElement} from "react";
import {Button} from "@/components/ui/button";
const ButtonRoom: FC<Props> = ({icon, title, disabled, onClick}) => {
  return (
    <div className="relative flex flex-col">
      <Button
        className="flex-1 p-0 bg-transparent hover:bg-transparent animate-pulse"
        {...{onClick, disabled}}
      >
        {icon}
      </Button>
      <h1 className="text-center text-[10px] capitalize p-0">{title}</h1>
    </div>
  );
};
interface Props {
  icon: ReactElement;
  title: string;
  onClick: () => void;
  disabled: boolean;
}
export default ButtonRoom;
