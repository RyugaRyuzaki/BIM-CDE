import {useEffect} from "react";

import {useNavigate, useSearchParams} from "react-router-dom";

import {useSignals} from "@preact/signals-react/runtime";
import RoomCredential from "./room/RoomCredential";
import {memberSignal} from "@stores/viewer/member";
import RoomPreview from "./room/RoomPreview";

//http://localhost:5001/viewer/room?permission=main&roomId=1&userId=1&username=vuong1
//http://localhost:5001/viewer/room?permission=main&roomId=1&userId=2&username=vuong2
const RoomViewer = () => {
  useSignals();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roomId = searchParams.get("roomId");
  const permission = searchParams.get("permission");

  useEffect(() => {
    if (!roomId || !permission) {
      navigate("error");
      return;
    }
  }, []);
  return (
    <>
      {!memberSignal.value ? (
        <RoomCredential />
      ) : (
        <RoomPreview roomId={roomId!} permission={permission!} />
      )}
    </>
  );
};

export default RoomViewer;
