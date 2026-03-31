// Common user types used across all tools - Aligned with GraphQL SDL

// User roles from SDL (exact match)
export enum UserRole {
  SUPER = 'SUPER',
  FACILITATOR = 'FACILITATOR',
  ADMIN = 'ADMIN',
  PARTICIPANT = 'PARTICIPANT',
}

// Base user type matching GraphQL SDL User type
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  organizations?: Organization[];
  events?: Event[];
  createdAt: string; // Date scalar
  updatedAt: string; // Date scalar
}

// Organization type (referenced in User)
export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Event type (referenced in User)
export interface Event {
  id: string;
  name: string;
  description?: string;
  startDate: string; // Date scalar
  endDate: string; // Date scalar
  location?: string;
  status: EventStatus;
  createdAt: string; // Date scalar
  updatedAt: string; // Date scalar
}

// Event status enum
export enum EventStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Input Types for Mutations
export interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  role?: UserRole;
  organizationId?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  organizationId?: string;
}

// Authentication Response Types
export interface AuthPayload {
  token: string;
  user: User;
}

export interface ParticipantLoginPayload {
  token: string;
  user: User;
  event: Event;
}

// Extended user types for specific contexts
export interface Author {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  organization?: Organization;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  event: Event;
  joinedAt: string; // Date scalar
  lastActiveAt?: string; // Date scalar
}

// User status and presence
export interface UserPresence {
  id: string;
  user: User;
  isOnline: boolean;
  lastSeen?: string; // Date scalar
  status?: 'available' | 'busy' | 'away' | 'offline';
  currentEventId?: string;
}

// Minimal user info for display
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
}

// User preferences
export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
}

// Pagination Types (commonly used in GraphQL)
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

// Query Response Types
export interface UsersQueryResponse {
  users: User[];
}

export interface UserQueryResponse {
  user: User;
}

export interface MeQueryResponse {
  me: User;
}

// Mutation Response Types
export interface RegisterResponse {
  register: AuthPayload;
}

export interface UpdateUserResponse {
  updateUser: User;
}

export interface DeleteUserResponse {
  deleteUser: boolean;
}

export interface LoginResponse {
  login: AuthPayload;
}

export interface ParticipantLoginResponse {
  participantLogin: ParticipantLoginPayload;
}

// Socket Events related to users
export const UserSocketEvents = {
  // Client → Server
  USER_JOIN: 'user:join',
  USER_LEAVE: 'user:leave',
  USER_UPDATE: 'user:update',
  USER_TYPING: 'user:typing',
  USER_PRESENCE: 'user:presence',
  
  // Server → Client
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  USER_UPDATED: 'user:updated',
  USER_TYPING_START: 'user:typing:start',
  USER_TYPING_STOP: 'user:typing:stop',
  USER_PRESENCE_UPDATED: 'user:presence:updated',
  
  // Broadcast Events
  BROADCAST_USER_JOINED: 'broadcast:user:joined',
  BROADCAST_USER_LEFT: 'broadcast:user:left',
  BROADCAST_USER_UPDATED: 'broadcast:user:updated',
} as const;