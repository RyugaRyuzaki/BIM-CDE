import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import {LineMaterial} from "three/examples/jsm/lines/LineMaterial";
import * as TWEEN from "@tweenjs/tween.js";
import {Socket} from "socket.io-client";
import {ICameraData, IMouseSend, IRoomConfig} from "../types";
import inComing from "@assets/audio/incoming-Voicemod.mp3";
import nextLevel from "@assets/audio/teams_next_level.mp3";
import accept from "@assets/audio/teams_accept.mp3";
import abort from "@assets/audio/teams_abort.mp3";
import {effect} from "@preact/signals-react";
import {IMemberStatus, IRoomMember, IRoomParticipant} from "@/types/room";
import {Participant} from "./Participant";
import {
  askControlMemberSignal,
  askedControlMemberSignal,
  controlledMemberSignal,
  meControlledMemberSignal,
  memberStatusSignal,
  orientedMemberSignal,
  roomMembersSignal,
} from "@bim/signals/member";
import {setNotify} from "@components/Notify/baseNotify";

export class Participants implements OBC.Disposable {
  readonly onDisposed: OBC.Event<any> = new OBC.Event();
  private readonly inComingAudio = new Audio(inComing);
  private readonly nextLevelAudio = new Audio(nextLevel);
  private readonly acceptAudio = new Audio(accept);
  private readonly abortAudio = new Audio(abort);

  private readonly target = new THREE.Vector3();
  private readonly position = new THREE.Vector3();
  private readonly dimension: LineMaterial = new LineMaterial({
    linewidth: 2, // in world units with size attenuation, pixels otherwise
    vertexColors: true,
    color: 0xfcb603,
    alphaToCoverage: true,
  });

  get domElement() {
    if (!this.world || !this.world.renderer) return null;
    return (this.world.renderer as OBC.BaseRenderer).three.domElement;
  }

  get rect(): DOMRect | null {
    if (!this.domElement) return null;
    return this.domElement.getBoundingClientRect();
  }

  get controls() {
    if (!this.world || !this.world.camera) return null;
    return (this.world.camera as OBC.OrthoPerspectiveCamera).controls;
  }
  //
  get cameraData(): ICameraData | null {
    if (!this.controls) return null;
    this.controls.getTarget(this.target);
    this.controls.getPosition(this.position);

    return {
      target: this.target.toArray(),
      position: this.position.toArray(),
    } as ICameraData;
  }
  //
  set setupEvent(enabled: boolean) {
    if (!this.controls || !this.domElement) return;
    if (enabled) {
      this.controls.addEventListener("wake", this.onControlWake);
      this.controls.addEventListener("rest", this.onControlRest);
      this.domElement.addEventListener("mousemove", this.onMouseMove);
      this.domElement.addEventListener("click", this.onMouseDown);
    } else {
      this.controls.removeEventListener("wake", this.onControlWake);
      this.controls.removeEventListener("rest", this.onControlRest);
      this.domElement.removeEventListener("mousemove", this.onMouseMove);
      this.domElement.removeEventListener("click", this.onMouseDown);
    }
  }
  private _participants: Map<string, Participant> = new Map();
  set participants(members: Record<string, IRoomParticipant>) {
    for (const userId in members) {
      if (!this._participants.has(userId)) {
        this._participants.set(
          userId,
          new Participant(
            this.components,
            this.world,
            members[userId].member,
            this.dimension
          )
        );
      }
    }
    const partSize = this._participants.size;
    const controllingSize = this.controllingMember.size;
    const length = Object.keys(members).length;
    if (partSize > length) {
      for (const [id, part] of this._participants) {
        if (!members[id]) continue;
        part.dispose();
        this._participants.delete(id);
      }
    }
    if (controllingSize > length) {
      for (const id of this.controllingMember) {
        if (!members[id]) continue;
        this.controllingMember.delete(id);
      }
    }
  }
  /**
   *
   */
  private _askControlMember: string | null = null;

  set askControlMember(askControlMember: string | null) {
    this._askControlMember = askControlMember;
    this.socket.emit("me-send-status", {
      userId: this.me.userId,
      roomId: this.config.roomId,
      status: askControlMember ? "calling" : undefined,
    });
  }

  get askControlMember() {
    return this._askControlMember;
  }

  /**
   *
   */
  private _meControlledMember: string | null = null;

  set meControlledMember(meControlledMember: string | null) {
    if (!this.controls || !this.domElement) return;
    if (meControlledMember) {
      const part = this._participants.get(meControlledMember);
      if (!part) return;
      part.visible = false;
      const {position, target} = part;
      this.controls.setLookAt(
        position.x,
        position.y,
        position.z,
        target.x,
        target.y,
        target.z,
        true
      );
      this.controls.disconnect();
      this._meControlledMember = meControlledMember;
    } else {
      for (const [_id, part] of this._participants) {
        part.visible = true;
      }
      this.controls.connect(this.domElement);
      if (this._meControlledMember) {
        this.socket.emit("me-abort-control", {
          askUser: this._meControlledMember,
          askedUser: this.me.userId,
        });
        this._meControlledMember = null;
        this.askControlMember = null;
      }
    }
    this.socket.emit("me-send-status", {
      userId: this.me.userId,
      roomId: this.config.roomId,
      status: meControlledMember ? "busy" : undefined,
    });
  }
  get meControlledMember() {
    return this._meControlledMember;
  }

  private controllingMember: Set<string> = new Set();

  /**
   *
   * @param components
   */
  constructor(
    private components: OBC.Components,
    private socket: Socket,
    private world: OBC.World,
    private config: IRoomConfig,
    private me: IRoomMember
  ) {
    this.setupEvent = true;
    (this.world.camera as OBC.OrthoPerspectiveCamera).onAfterUpdate.add(() => {
      TWEEN.update();
      this.updateLine();
    });
    this.inComingAudio.loop = true;
    this.init();
  }
  async dispose() {
    orientedMemberSignal.value = null;
    askControlMemberSignal.value = null;
    askedControlMemberSignal.value = "none";
    controlledMemberSignal.value = null;
    meControlledMemberSignal.value = null;
    memberStatusSignal.value = {};
    this.socket.off("user-send-camera");
    this.socket.off("user-send-status");
    this.socket.off("user-ask-control");
    this.socket.off("user-allow-control");
    this.socket.off("user-abort-control");
    this.socket.off("me-controlled-mousemove");
    this.socket.off("me-controlled-mousedown");
    this.controllingMember.clear();
    this.disposeParticipants();
    this.dimension.dispose();
    (this.dimension as any) = null;
    (this.components as any) = null;
    (this.socket as any) = null;
    (this.world as any) = null;
    this.onDisposed.trigger(this);
    this.onDisposed.reset();
    this.disposeAudio();
    console.log("dispose Participants");
  }
  //
  private disposeParticipants() {
    for (const [_id, part] of this._participants) {
      part.dispose();
    }
    this._participants.clear();
  }
  private disposeAudio() {
    if (!this.inComingAudio.paused) this.inComingAudio.pause();
    if (!this.nextLevelAudio.paused) this.nextLevelAudio.pause();
    if (!this.acceptAudio.paused) this.acceptAudio.pause();
    if (!this.abortAudio.paused) this.abortAudio.pause();
    this.inComingAudio.remove();
    (this.inComingAudio as any) = null;
    this.nextLevelAudio.remove();
    (this.nextLevelAudio as any) = null;
    this.acceptAudio.remove();
    (this.acceptAudio as any) = null;
    this.abortAudio.remove();
    (this.abortAudio as any) = null;
  }
  private updateLine = () => {
    if (!this.domElement) return;
    const {width, height} = this.domElement.getBoundingClientRect();
    this.dimension.resolution.set(width, height);
  };
  private init() {
    this.socket.emit("user-init-camera", this.cameraData);
    effect(() => {
      this.participants = roomMembersSignal.value;
    });
    effect(() => {
      this.meControlledMember = meControlledMemberSignal.value;
    });
    effect(() => {
      const userId = orientedMemberSignal.value;
      if (!userId) return;
      const part = this._participants.get(userId);
      if (!part || !this.controls) return;
      const {position, target} = part;
      this.controls.setLookAt(
        position.x,
        position.y,
        position.z,
        target.x,
        target.y,
        target.z,
        true
      );
    });
    effect(() => {
      const userId = askControlMemberSignal.value;
      if (!userId) return;
      console.log(userId);
      const part = this._participants.get(userId);
      if (!part) return;
      // ask other user that me control
      this.socket.emit("me-ask-control", {
        askUser: this.me.userId,
        askedUser: userId,
      });
    });
    effect(() => {
      const status = askedControlMemberSignal.value;
      try {
        switch (status) {
          case "none":
            if (!this.inComingAudio.paused) this.inComingAudio.pause();
            if (!this.acceptAudio.paused) this.inComingAudio.pause();
            if (!this.abortAudio.paused) this.inComingAudio.pause();
            break;
          case "pending":
            if (this.inComingAudio.paused) {
              this.inComingAudio.currentTime = 0;
              this.inComingAudio.play();
            }
            break;
          case "accept":
            if (!this.inComingAudio.paused) this.inComingAudio.pause();
            if (this.askControlMember) {
              this.socket.emit("me-allow-control", {
                askUser: this.askControlMember,
                askedUser: this.me.userId,
              });
              meControlledMemberSignal.value = this.askControlMember;
            }
            break;
          case "refuse":
            if (!this.inComingAudio.paused) this.inComingAudio.pause();
            if (this.askControlMember)
              this.socket.emit("me-refuse-control", {
                askUser: this.askControlMember,
                askedUser: this.me.userId,
              });
            this.askControlMember = null;
            meControlledMemberSignal.value = null;
            break;
        }
      } catch (error) {
        console.error("Error controlling audio:", error);
      }
    });
    this.socket.on("user-send-camera", this.onUserSendCamera);
    this.socket.on("user-send-status", this.onUserSendStatus);
    // listen other user to control
    this.socket.on("user-ask-control", this.onUserAskControl);
    // listen other user ask control me scene
    this.socket.on("user-allow-control", this.onNotifyAllowControl);
    // abort other user control me scene
    this.socket.on("user-refuse-control", this.onNotifyRefuseControl);
    // abort other user control me scene
    this.socket.on("user-abort-control", this.onAbortControl);
    // when me controlled by other user mousemove
    this.socket.on("me-controlled-mousemove", this.onMeControlledMouseMove);
    // when me controlled by other user mousedown
    this.socket.on("me-controlled-mousedown", this.onMeControlledMouseDown);
  }
  /**
   *
   */
  private onControlWake = () => {
    this.socket.emit("user-send-camera", this.cameraData);
  };
  /**
   *
   */
  private onControlRest = () => {
    this.socket.emit("user-send-camera", this.cameraData);
  };

  /**
   *
   * @param e
   * @returns
   */
  private onMouseMove = (e: MouseEvent) => {
    if (!this.rect) return;
    const {clientX, clientY} = e;
    const {top, left} = this.rect;
    if (this.controllingMember.size > 0) {
      this.socket.emit("user-controlling-mousemove", {
        askUser: this.me.userId,
        askedUsers: Array.from(this.controllingMember),
        mouseSend: {clientX, clientY, top, left} as IMouseSend,
      });
    }
  };
  /**
   *
   * @param e
   * @returns
   */
  private onMouseDown = (e: MouseEvent) => {
    if (!this.rect) return;
    const {clientX, clientY} = e;
    const {top, left} = this.rect;
    if (this.controllingMember.size > 0) {
      this.socket.emit("user-controlling-mousedown", {
        askUser: this.me.userId,
        askedUsers: Array.from(this.controllingMember),
        mouseSend: {clientX, clientY, top, left} as IMouseSend,
      });
    }
  };
  /**
   *
   * @param param0
   * @returns
   */
  private onUserSendCamera = ({
    userId,
    cameraData,
  }: {
    userId: string;
    cameraData: ICameraData;
  }) => {
    const part = this._participants.get(userId);
    if (!part) return;
    part?.update(cameraData);
    if (!this.controls) return;
    if (this.meControlledMember && this.meControlledMember === userId) {
      const {position, target} = part;
      this.controls.setLookAt(
        position.x,
        position.y,
        position.z,
        target.x,
        target.y,
        target.z,
        true
      );
    }
  };
  /**
   *
   * @param param0
   */
  private onUserSendStatus = ({
    userId,
    status,
  }: {
    userId: string;
    status?: IMemberStatus;
  }) => {
    const newMemberStatus = {...memberStatusSignal.value};
    if (status === undefined) {
      delete newMemberStatus[userId];
    } else {
      newMemberStatus[userId] = status;
    }
    memberStatusSignal.value = {...newMemberStatus};
  };
  /**
   *
   * @param param0
   * @returns
   */
  private onMeControlledMouseMove = ({
    askUser,
    mouseSend,
  }: {
    askUser: string;
    mouseSend: IMouseSend;
  }) => {
    const part = this._participants.get(askUser);
    if (!part) return;
    if (!this.controls) return;
    if (this.meControlledMember && this.meControlledMember === askUser) {
      console.log(mouseSend);
    }
  };
  /**
   *
   * @param param0
   * @returns
   */
  private onMeControlledMouseDown = ({
    askUser,
    mouseSend,
  }: {
    askUser: string;
    mouseSend: IMouseSend;
  }) => {
    const part = this._participants.get(askUser);
    if (!part) return;
    if (!this.controls) return;
    if (this.meControlledMember && this.meControlledMember === askUser) {
      console.log(mouseSend);
    }
  };
  /**
   *
   * @param askUser
   * @returns
   */
  private onUserAskControl = (askUser: string) => {
    if (this.meControlledMember || this.askControlMember) return;
    this.askControlMember = askUser;
    const part = this._participants.get(askUser);
    if (!part) return;
    askedControlMemberSignal.value = "pending";
    controlledMemberSignal.value = part.member;
  };
  /**
   *
   * @param askedUser
   * @returns
   */
  private onNotifyAllowControl = (askedUser: string) => {
    this.controllingMember.add(askedUser);
    const part = this._participants.get(askedUser);
    if (!part) return;
    setNotify(`${part.member.username} agrees controlled`);
    if (this.acceptAudio.paused) this.acceptAudio.play();
  };
  /**
   *
   * @param askedUser
   * @returns
   */
  private onNotifyRefuseControl = (askedUser: string) => {
    askControlMemberSignal.value = null;
    const part = this._participants.get(askedUser);
    if (!part) return;
    setNotify(`${part.member.username} disagrees controlled`, false);
    if (this.abortAudio.paused) this.abortAudio.play();
  };
  /**
   *
   * @param askedUser
   * @returns
   */
  private onAbortControl = (askedUser: string) => {
    this.controllingMember.delete(askedUser);
    askControlMemberSignal.value = null;
  };
}
