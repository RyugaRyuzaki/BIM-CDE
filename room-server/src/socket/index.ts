import {Server, ServerOptions, Socket} from "socket.io";
export interface IRoomMember {
  userId: string;
  username: string;
  color: number;
  avatar?: string;
}
export interface IMessage {
  text: string;
  time: number;
  member: IRoomMember;
}

export interface ICameraData {
  position: number[];
  target: number[];
}
export interface ICameraSend {
  start: ICameraData;
  end: ICameraData;
  duration: number;
}
export interface IMouseSend {
  clientX: number;
  clientY: number;
  left: number;
  top: number;
  highlighterType?: string;
  fragmentId?: {[fragId: string]: number[]};
}

export type IMemberStatus = "calling" | "busy";

export class SocketService {
  private static readonly option: ServerOptions = {
    cors: {
      origin: "*",
    },
    maxHttpBufferSize: 4e9,
    path: "",
    serveClient: false,
    //@ts-ignore
    adapter: undefined,
    parser: undefined,
    connectTimeout: 0,
    connectionStateRecovery: {
      maxDisconnectionDuration: 0,
      skipMiddlewares: false,
    },
    cleanupEmptyChildNamespaces: false,
  };
  private io!: Server;
  private roomData: {[roomId: string]: Record<string, IRoomMember>} = {};
  private roomSocketId: {[roomId: string]: Record<string, string>} = {};
  private messages: {[roomId: string]: IMessage[]} = {};
  private typings: {[roomId: string]: Set<string>} = {};
  /**
   *
   * @param server
   */
  constructor(server: any) {
    this.io = new Server(server, SocketService.option);
    this.io.on("connection", this.onConnection);
  }
  private onConnection = (socket: Socket) => {
    const {member, roomId} = socket.handshake.auth;
    const {userId, username} = member as IRoomMember;
    // join room
    socket.join(roomId);
    this.io.to(roomId).emit("room-members", this.roomData[roomId]);

    socket.on(
      "user-join",
      ({member, roomId}: {member: IRoomMember; roomId: string}) => {
        // send for client list members
        if (!this.roomData[roomId]) this.roomData[roomId] = {};
        if (!this.roomData[roomId][userId])
          this.roomData[roomId][userId] = member;
        // storage socket id
        if (!this.roomSocketId[roomId]) this.roomSocketId[roomId] = {};
        this.roomSocketId[roomId][userId] = socket.id;

        if (!this.messages[roomId]) this.messages[roomId] = [];
        if (!this.typings[roomId]) this.typings[roomId] = new Set();
        // send for another members
        socket.to(roomId).emit("user-join", member);
        socket.to(roomId).emit("room-members", this.roomData[roomId]);
      }
    );

    socket.on(
      "user-typing",
      ({member, roomId}: {member: IRoomMember; roomId: string}) => {
        if (!this.typings[roomId]) return;
        this.typings[roomId].add(member.username);
        socket.to(roomId).emit("user-typing", Array.from(this.typings[roomId]));
      }
    );
    socket.on(
      "user-stop-typing",
      ({member, roomId}: {member: IRoomMember; roomId: string}) => {
        if (!this.typings[roomId]) return;
        this.typings[roomId].delete(member.username);
        socket.to(roomId).emit("user-typing", Array.from(this.typings[roomId]));
      }
    );
    socket.on(
      "user-send-message",
      ({
        member,
        roomId,
        message,
      }: {
        member: IRoomMember;
        roomId: string;
        message: string;
      }) => {
        console.log(message);
        this.io.to(roomId).emit("user-send-message", {message, member});
      }
    );

    // synchronize data
    socket.on("user-init-camera", (cameraData: ICameraData) => {
      socket.to(roomId).emit("user-send-camera", {userId, cameraData});
    });
    socket.on("user-send-camera", (cameraData: ICameraData) => {
      socket.to(roomId).emit("user-send-camera", {userId, cameraData});
    });
    // control
    socket.on(
      "me-ask-control",
      ({askUser, askedUser}: {askUser: string; askedUser: string}) => {
        const socketId = this.roomSocketId[roomId][askedUser];
        if (!socketId) return;
        socket.to(socketId).emit("user-ask-control", askUser);
      }
    );
    socket.on(
      "me-allow-control",
      ({askUser, askedUser}: {askUser: string; askedUser: string}) => {
        const socketId = this.roomSocketId[roomId][askUser];
        if (!socketId) return;
        socket.to(socketId).emit("user-allow-control", askedUser);
      }
    );
    socket.on(
      "me-refuse-control",
      ({askUser, askedUser}: {askUser: string; askedUser: string}) => {
        const socketId = this.roomSocketId[roomId][askUser];
        if (!socketId) return;
        socket.to(socketId).emit("user-refuse-control", askedUser);
      }
    );
    socket.on(
      "me-abort-control",
      ({askUser, askedUser}: {askUser: string; askedUser: string}) => {
        const socketId = this.roomSocketId[roomId][askUser];
        if (!socketId) return;
        socket.to(socketId).emit("user-abort-control", askedUser);
      }
    );
    //status
    socket.on(
      "me-send-status",
      ({
        userId,
        roomId,
        status,
      }: {
        userId: string;
        roomId: string;
        status?: IMemberStatus;
      }) => {
        socket.to(roomId).emit("user-send-status", {userId, status});
      }
    );

    // mouse
    socket.on(
      "user-controlling-mousemove",
      ({
        askUser,
        askedUsers,
        mouseSend,
      }: {
        askUser: string;
        askedUsers: string[];
        mouseSend: IMouseSend;
      }) => {
        for (const askedUser of askedUsers) {
          const socketId = this.roomSocketId[roomId][askedUser];
          if (!socketId) continue;
          socket
            .to(socketId)
            .emit("me-controlled-mousemove", {askUser, mouseSend});
        }
      }
    );
    socket.on(
      "user-controlling-mousedown",
      ({
        askUser,
        askedUsers,
        mouseSend,
      }: {
        askUser: string;
        askedUsers: string[];
        mouseSend: IMouseSend;
      }) => {
        for (const askedUser of askedUsers) {
          const socketId = this.roomSocketId[roomId][askedUser];
          if (!socketId) continue;
          socket
            .to(roomId)
            .emit("me-controlled-mousedown", {askUser, mouseSend});
        }
      }
    );

    // disconnect a client
    socket.on("disconnect", () => {
      socket.leave(roomId);
      socket.to(roomId).emit("user-leave", member);
      if (this.roomData[roomId]) {
        if (this.roomData[roomId][userId]) {
          delete this.roomData[roomId][userId];
        }
        if (Object.keys(this.roomData[roomId]).length === 0) {
          delete this.roomData[roomId];
          delete this.messages[roomId];
        }
      }
      if (this.roomSocketId[roomId]) {
        delete this.roomSocketId[roomId][userId];
        if (Object.keys(this.roomSocketId[roomId]).length === 0) {
          delete this.roomSocketId[roomId];
        }
      }
      if (this.typings[roomId]) {
        this.typings[roomId].delete(username);
        socket.to(roomId).emit("user-typing", Array.from(this.typings[roomId]));
        if (this.typings[roomId].size === 0) delete this.typings[roomId];
      }
    });
  };
}
