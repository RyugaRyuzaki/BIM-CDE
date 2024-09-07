import Theme from "@components/theme";
import HeaderMenu from "@layout/components/HeaderMenu";
import PrivateAvatar from "./PrivateAvatar";
import RoomHeader from "./RoomHeader";
import {useSignals} from "@preact/signals-react/runtime";
import {isMemberJoinSignal, memberSignal} from "@bim/signals/member";

const PrivateHeader = () => {
  useSignals();

  return (
    <div className="relative h-full w-full mx-auto flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-[80%] flex justify-between">
        <div className="my-auto flex">
          <HeaderMenu />
        </div>
        <div className="my-auto flex justify-end">
          <div className="hidden md:mx-2 md:flex md:space-x-4">
            {isMemberJoinSignal.value && memberSignal.value && <RoomHeader />}
          </div>
          <PrivateAvatar />
          <Theme />
        </div>
      </div>
    </div>
  );
};

export default PrivateHeader;
