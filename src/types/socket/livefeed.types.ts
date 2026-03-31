// -------------------------------------------------------
// IMPORT BASE TYPES ONLY
// -------------------------------------------------------
import type {
  SocketUser,
  SocketAckResponse,
  SocketConnectionStatus,
  BaseSocketEvents,
  SocketConfig
} from './base.types';

// -------------------------------------------------------
// LIVEFEED POST INTERFACES
// -------------------------------------------------------
export interface LiveFeedPost {
  _id: string;
  event: string | { _id: string; title?: string };
  author: {
    id: string;
    name: string;
    role: string;
    email?: string;
  };
  content: string;
  type: string;
  priority?: string;
  reactions?: any[];
  isPinned?: boolean;
  isBreaking?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OptimisticPost extends LiveFeedPost {
  _isOptimistic?: boolean;
  _tempId?: string;
}

// -------------------------------------------------------
// LIVEFEED CLIENT → SERVER EVENTS
// -------------------------------------------------------
export enum LiveFeedClientEvents {
  JOIN = "livefeed:join",
  LEAVE = "livefeed:leave",

  POST_CREATE = "livefeed:post:create",
  POST_UPDATE = "livefeed:post:update",
  POST_DELETE = "livefeed:post:delete",

  REACTION_ADD = "livefeed:reaction:add",

  POST_PIN = "livefeed:post:pin",
}

// -------------------------------------------------------
// LIVEFEED SERVER → CLIENT EVENTS
// -------------------------------------------------------
export enum LiveFeedServerEvents {
  JOINED = "livefeed:joined",
  LEFT = "livefeed:left",

  POSTS = "livefeed:posts",

  POST_NEW = "livefeed:post:new",
  POST_CREATED = "livefeed:post:created",

  POST_UPDATED = "livefeed:post:updated",
  POST_DELETED = "livefeed:post:deleted",

  REACTION_UPDATED = "livefeed:reaction:updated",
  REACTION_ADDED = "livefeed:reaction:added",

  POST_PINNED = "livefeed:post:pinned",
}

// -------------------------------------------------------
// LIVEFEED DATA TRANSFER OBJECTS (DTOs)
// -------------------------------------------------------
export interface JoinRoomData {
  eventId: string;
}

export interface CreatePostData {
  event: string;
  author: string;
  content: string;
  type?: string;
  priority?: string;
  isBreaking?: boolean;
}

export interface CreatePostResponse {
  postId: string;
}

export interface UpdatePostData {
  postId: string;
  content?: string;
  type?: string;
  priority?: string;
  isBreaking?: boolean;
}

export interface UpdatePostResponse {
  postId: string;
}

export interface DeletePostResponse {
  postId: string;
}

export interface ReactionData {
  postId: string;
  emoji: string;
}

export interface ReactionResponse {
  postId: string;
  reactions: any[];
}

export interface PinData {
  postId: string;
  isPinned: boolean;
}

export interface PinResponse {
  postId: string;
  isPinned: boolean;
}

// -------------------------------------------------------
// LIVEFEED PAYLOADS
// -------------------------------------------------------
export interface LiveFeedJoinPayload {
  eventId: string;
}

export interface LiveFeedPostPayload {
  id: string;
  content: string;
  author: SocketUser;
  createdAt: string;
  pinned?: boolean;
}

// -------------------------------------------------------
// RE-EXPORT BASE TYPES
// -------------------------------------------------------
export type {
  SocketUser,
  SocketAckResponse,
  SocketConnectionStatus,
  BaseSocketEvents,
  SocketConfig
};
