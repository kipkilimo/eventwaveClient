// Room types for modularity

export enum SocketRoomType {
  LIVEFEED = "livefeed",
  CHAT = "chat",
  Test = "Test",
  QNA = "qna",
  FEEDBACK = "feedback",
  POLL = "poll",
}

// Room user information
export interface RoomUser {
  id: string;
  name: string;
  email?: string;
  role: string;
  avatar?: string;
  joinedAt: string;
  socketId?: string;
}

// Room state
export interface RoomState {
  type: SocketRoomType;
  users: RoomUser[];
  joinedAt: string | null;
  lastActivity?: string;
}

// Room configuration
export interface SocketRoomConfig {
  type: SocketRoomType;
  eventId: string;
  userId: string;
}

// Room join/leave response
export interface RoomJoinResponse {
  room: string;
  users: RoomUser[];
  totalUsers: number;
  timestamp: string;
}

export interface RoomLeaveResponse {
  room: string;
  userId: string;
  timestamp: string;
}
