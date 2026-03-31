// Base Socket Types
export interface SocketEvent<T = any> {
  type: string;
  data: T;
  timestamp: string;
  sender?: SocketUser;
  roomId?: string;
  metadata?: Record<string, any>;
}

export interface SocketResponse<T = any> {
  success: boolean;
  data?: T;
  error?: SocketError;
  timestamp: string;
  requestId?: string;
}

export interface SocketError {
  code: string;
  message: string;
  details?: Record<string, any>;
  fieldErrors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface SocketRoom {
  id: string;
  name: string;
  type: SocketRoomType;
  participants: SocketUser[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export type SocketRoomType =
  | "livefeed"
  | "chat"
  | "poll"
  | "Test"
  | "qna"
  | "feedback"
  | "event"
  | "session"
  | "broadcast";

export interface SocketUser {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
  lastSeen?: string;
  metadata?: Record<string, any>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  cursor?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

export interface SocketConnectionStatus {
  isConnected: boolean;
  connectionId: string | null;
  lastPing?: number;
  latency?: number;
  reconnectAttempts: number;
}

// Common event types
export const SocketEventTypes = {
  // Connection events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
  RECONNECT: "reconnect",
  RECONNECT_ATTEMPT: "reconnect_attempt",
  RECONNECT_ERROR: "reconnect_error",
  RECONNECT_FAILED: "reconnect_failed",
  PING: "ping",
  PONG: "pong",

  // User events
  USER_JOINED: "user:joined",
  USER_LEFT: "user:left",
  USER_UPDATED: "user:updated",
  USER_PRESENCE: "user:presence",

  // Room events
  ROOM_CREATED: "room:created",
  ROOM_UPDATED: "room:updated",
  ROOM_DELETED: "room:deleted",
  JOINED_ROOM: "joined:room",
  LEFT_ROOM: "left:room",
  ROOM_PRESENCE: "room:presence",

  // Error events
  ERROR: "error",
  VALIDATION_ERROR: "validation:error",
  PERMISSION_ERROR: "permission:error",
  NOT_FOUND_ERROR: "not_found:error",
  RATE_LIMIT_ERROR: "rate_limit:error",

  // System events
  SYSTEM_MESSAGE: "system:message",
  NOTIFICATION: "notification",
  ALERT: "alert",
  MAINTENANCE: "maintenance",

  // Broadcast events
  BROADCAST: "broadcast",
  BROADCAST_TO_ROOM: "broadcast:room",
  BROADCAST_TO_USER: "broadcast:user",

  // Typing indicators
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
} as const;

// Common error codes
export const SocketErrorCodes = {
  // Connection errors
  CONNECTION_FAILED: "CONNECTION_FAILED",
  RECONNECT_FAILED: "RECONNECT_FAILED",
  AUTH_FAILED: "AUTH_FAILED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",

  // Room errors
  ROOM_NOT_FOUND: "ROOM_NOT_FOUND",
  ROOM_FULL: "ROOM_FULL",
  ROOM_LOCKED: "ROOM_LOCKED",
  ALREADY_IN_ROOM: "ALREADY_IN_ROOM",
  NOT_IN_ROOM: "NOT_IN_ROOM",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  ROOM_CREATE_FAILED: "ROOM_CREATE_FAILED",

  // User errors
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_BANNED: "USER_BANNED",
  USER_SUSPENDED: "USER_SUSPENDED",

  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_DATA: "INVALID_DATA",
  MISSING_REQUIRED: "MISSING_REQUIRED",
  INVALID_FORMAT: "INVALID_FORMAT",

  // Business logic errors
  ITEM_NOT_FOUND: "ITEM_NOT_FOUND",
  OPERATION_NOT_ALLOWED: "OPERATION_NOT_ALLOWED",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  LIMIT_EXCEEDED: "LIMIT_EXCEEDED",

  // System errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",

  // Rate limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
} as const;

// Socket event handler type
export type SocketEventHandler<T = any> = (data: T) => void;

// Socket configuration
export interface SocketConfig {
  url?: string;
  path?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
  transports?: string[];
  withCredentials?: boolean;
  auth?: Record<string, any>;
  query?: Record<string, any>;
  extraHeaders?: Record<string, string>;
  forceNew?: boolean;
}
