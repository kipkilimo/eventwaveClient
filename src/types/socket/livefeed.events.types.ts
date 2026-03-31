// -------------------------------------------------------
// LIVEFEED SOCKET EVENT TYPES
// -------------------------------------------------------

export enum LiveFeedClientEvents {
  JOIN = "livefeed:join",
  LEAVE = "livefeed:leave",
  CREATE_POST = "livefeed:createPost",
  UPDATE_POST = "livefeed:updatePost",
  DELETE_POST = "livefeed:deletePost",
  ADD_REACTION = "livefeed:addReaction",
  PIN_POST = "livefeed:pinPost",
}

export enum LiveFeedServerEvents {
  POST_NEW = "livefeed:post:new",
  POST_CREATED = "livefeed:post:created",
  POST_UPDATED = "livefeed:post:updated",
  POST_DELETED = "livefeed:post:deleted",
  REACTION_ADDED = "livefeed:reaction:added",
  REACTION_UPDATED = "livefeed:reaction:updated",
  POST_PINNED = "livefeed:post:pinned",
  POSTS = "livefeed:posts",
  JOINED = "livefeed:joined",
  LEFT = "livefeed:left",
}

// DTOs

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
