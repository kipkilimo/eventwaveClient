// -------------------------------------------------------
// BASE ACK RESPONSE
// -------------------------------------------------------
export interface SocketAckResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// -------------------------------------------------------
// Connection status
// -------------------------------------------------------
export type SocketConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

// -------------------------------------------------------
// Base socket events
// -------------------------------------------------------
export enum BaseSocketEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECT_ERROR = 'connect_error',
  ERROR = 'error',
  CONNECT_TIMEOUT = 'connect_timeout',
  RECONNECT = 'reconnect',
  RECONNECT_ATTEMPT = 'reconnect_attempt',
  RECONNECT_ERROR = 'reconnect_error',
  RECONNECT_FAILED = 'reconnect_failed',
  PING = 'ping',
  PONG = 'pong',
}

// -------------------------------------------------------
// Socket configuration
// -------------------------------------------------------
export interface SocketConfig {
  url?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
  transports?: ('websocket' | 'polling')[];
  query?: Record<string, string>;
  auth?: Record<string, any>;
}

// -------------------------------------------------------
// User attached to socket
// -------------------------------------------------------
export interface SocketUser {
  id: string;
  name: string;
  email?: string;
  role: string; 
}
