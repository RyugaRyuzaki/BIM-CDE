import React from "react";
import ReactDOM from "react-dom/client";
import {Participant} from "./Participant";
import ParticipantAvatar from "./ParticipantAvatar";

export const createParticipantMaker = (part: Participant) => {
  const div = document.createElement("div");
  ReactDOM.createRoot(div).render(<ParticipantAvatar member={part.member} />);
  return div;
};
