import {Link} from "react-router-dom";
import {GiHamburgerMenu} from "react-icons/gi";
//@ts-ignore
import {ReactComponent as Logo} from "@assets/logo.svg";
import {bimRouteSignal} from "@bim/signals/config";
import {useSignals} from "@preact/signals-react/runtime";
import ToggleView from "./ToggleView";
const HeaderMenu = () => {
  useSignals();
  return (
    <div className="flex">
      <div className="flex-shrink-0">
        <Link to={"/"} className="text-2xl font-bold text-gray-800">
          <Logo className="h-12 w-12" />
        </Link>
      </div>
      <div className="inset-y-0 left-0 flex items-center md:hidden">
        <button
          type="button"
          className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white "
        >
          <GiHamburgerMenu className="h-8 w-8" />
        </button>
      </div>
      {bimRouteSignal.value && (
        <>
          <div className="my-auto flex justify-start mx-3">
            <ToggleView />
          </div>
        </>
      )}
    </div>
  );
};

export default HeaderMenu;
