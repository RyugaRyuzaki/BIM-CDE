export interface IRoomConfig {
  permission: string | "main" | "member" | "guess";
  roomId: string;
}

export interface IPeer {
  username: string;
  peerId: string;
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
