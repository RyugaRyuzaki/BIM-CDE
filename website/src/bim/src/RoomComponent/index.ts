import * as OBC from "@thatopen/components";
import {Socket} from "socket.io-client";
import {IRoomConfig} from "@bim/src/RoomComponent/types";
import {Participants} from "./src";
import {IRoomMember} from "@/types/room";
import {memberSignal} from "@stores/viewer/member";

export class RoomComponent extends OBC.Component implements OBC.Disposable {
  /**
   * A unique identifier for the component.
   * This UUID is used to register the component within the Components system.
   */
  static readonly uuid = "715f9b5d-1a09-41e4-8829-8c5a42ea07c2" as const;

  /** {@link OBC.Component.enabled} */
  enabled = true;
  readonly onDisposed: OBC.Event<any> = new OBC.Event();

  private _world: OBC.World | null = null;
  /**
   * The world in which the fragments will be displayed.
   * It must be set before using the streaming service.
   * If not set, an error will be thrown when trying to access the world.
   */
  get world() {
    if (!this._world) {
      throw new Error("You must set a world before using the streamer!");
    }
    return this._world;
  }

  /**
   * Sets the world in which the fragments will be displayed.
   * @param world - The new world to be set.
   */
  set world(world: OBC.World) {
    this._world = world;
  }

  private participants!: Participants;
  /**
   *
   * @param components
   */
  constructor(components: OBC.Components) {
    super(components);
    this.components.add(RoomComponent.uuid, this);
  }

  async dispose() {
    this.participants?.dispose();
    (this.participants as any) = null;
    (this._world as any) = null;
    this.onDisposed.trigger(this);
    this.onDisposed.reset();
    console.log("disposed RoomComponent");
  }
  init(config: IRoomConfig, socket: Socket, me: IRoomMember) {
    if (!this.participants)
      this.participants = new Participants(
        this.components,
        socket,
        this.world,
        config,
        me
      );
  }
}
//
