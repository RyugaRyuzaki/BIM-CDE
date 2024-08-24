import {
  IControlNotify,
  IMemberStatus,
  IRoomMember,
  IRoomParticipant,
} from "@/types/room";
import {signal} from "@preact/signals-react";

const storageKey = "room-member";
function defaultMember(): IRoomMember | null {
  const memberString = window.localStorage.getItem(storageKey);
  if (!memberString) return null;
  return JSON.parse(memberString) as IRoomMember;
}

/**
 * me assign oriented other member
 */
export const orientedMemberSignal = signal<string | null>(null);

/**
 * someone ask me for him/her control
 */
export const askControlMemberSignal = signal<string | null>(null);

/**
 * me ask someone for me control
 */
export const askedControlMemberSignal = signal<IControlNotify>("none");

/**
 * someone ask me for him/her control (member)
 */
export const controlledMemberSignal = signal<IRoomMember | null>(null);

/**
 * someone's controlling me
 */
export const meControlledMemberSignal = signal<string | null>(null);
/**
 * if me join a room
 */
export const isMemberJoinSignal = signal<boolean>(false);

/**
 * me as member
 */
export const memberSignal = signal<IRoomMember | null>(defaultMember());
/**
 * list member status
 */
export const memberStatusSignal = signal<Record<string, IMemberStatus>>({});

/**
 * me stream
 */
export const streamSignal = signal<MediaStream | null>(null);

/**
 * all member except me
 */
export const roomMembersSignal = signal<Record<string, IRoomParticipant>>({});
/**
 *
 * @returns
 */
export const setMember = () => {
  if (!memberSignal.value) return;
  window.localStorage.setItem(storageKey, JSON.stringify(memberSignal.value));
};
