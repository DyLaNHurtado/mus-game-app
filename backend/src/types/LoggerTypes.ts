import { SocketEvents } from "./SocketTypes";

export enum LogLevel {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  DEBUG = "debug",
}

// Contextos posibles
export enum LogContextType {
  USER = "user",
  ROOM = "room",
  GAME = "game",
  SOCKET = "socket",
  SYSTEM = "system",
}

// Acciones específicas para cada contexto
export enum UserAction {
  LOGIN = "login",
  LOGOUT = "logout",
  REGISTER = "register",
  UPDATE_PROFILE = "updateProfile",
}

export enum RoomAction {
  CREATE = "create",
  JOIN = "join",
  LEAVE = "leave",
  DELETE = "delete",
}

export enum GameAction {
  START = "start",
  END = "end",
  PLAY_CARD = "playCard",
  PAUSE = "pause",
}


export enum SystemAction {
  START = "start",
  STOP = "stop",
  ERROR = "error",
  RESTART = "restart",
}

// Tipos de contexto con acción específica
export interface UserContext {
  type: LogContextType.USER;
  userId: string;
  username?: string;
  action: UserAction;
}

export interface RoomContext {
  type: LogContextType.ROOM;
  roomId: string;
  players?: string[];
  action: RoomAction;
}

export interface GameContext {
  type: LogContextType.GAME;
  gameId: string;
  roomId: string;
  action: GameAction;
}

export interface SocketContext {
  type: LogContextType.SOCKET;
  socketId: string;
  userId?: string;
  action: SocketEvents;
} 

export interface SystemContext {
  type: LogContextType.SYSTEM;
  service: string;
  status?: string;
  error?: string;
  action: SystemAction;
}

// Unión de todos los contextos posibles
export type LogContext =
  | UserContext
  | RoomContext
  | GameContext
  | SocketContext
  | SystemContext;
