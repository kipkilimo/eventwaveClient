src/composables/
├── useBaseSocket.ts          # Base socket functionality
├── useLiveFeedSocket.ts      # Live Feed socket composable
├── useQnASocket.ts          # Q&A socket composable
├── usePollSocket.ts         # Poll socket composable
├── useTestSocket.ts         # Test socket composable
├── useChatSocket.ts         # Chat socket composable
├── useFeedbackSocket.ts     # Feedback socket composable
└── index.ts                # Barrel export


Here are the complete files for the barrel export and socket plugin:

## **`src/composables/index.ts`**

```typescript
// Base Socket Composable
export { useBaseSocket } from './useBaseSocket';
export type { SocketOptions, SocketState, BaseSocketReturn } from './useBaseSocket';

// Live Feed Socket Composable
export { useLiveFeedSocket } from './useLiveFeedSocket';
export type {
  LiveFeedSocketReturn,
  LiveFeed,
  LiveFeedInput,
  LiveFeedUpdateInput,
  LiveFeedFilter,
  LiveFeedType,
  LiveFeedPriority,
  LiveFeedStatus,
  Sentiment,
  MediaType,
  ContentBlockType,
  ReactionType,
  Media,
  Author,
  ContentBlock,
  Reaction,
  LiveFeedStats,
  LiveFeedSocketOptions,
} from './useLiveFeedSocket';

// Q&A Socket Composable
export { useQnASocket } from './useQnASocket';
export type {
  QnASocketReturn,
  QnAQuestion,
  QnAAnswer,
  QnAFilter,
  QnASort,
  QnAStats,
} from './useQnASocket';

// Poll Socket Composable
export { usePollSocket } from './usePollSocket';
export type {
  PollSocketReturn,
  Poll,
  PollOption,
  PollVote,
  PollInput,
  PollFilter,
  PollStats,
  PollResult,
} from './usePollSocket';

// Test Socket Composable
export { useTestSocket } from './useTestSocket';
export type {
  TestSocketReturn,
  Test,
  TestQuestion,
  TestAnswer,
  TestParticipant,
  TestInput,
  TestFilter,
  TestStats,
  TestLeaderboard,
} from './useTestSocket';

// Chat Socket Composable
export { useChatSocket } from './useChatSocket';
export type {
  ChatSocketReturn,
  ChatMessage,
  ChatRoom,
  ChatUser,
  ChatInput,
  ChatFilter,
  ChatStats,
} from './useChatSocket';

// Feedback Socket Composable
export { useFeedbackSocket } from './useFeedbackSocket';
export type {
  FeedbackSocketReturn,
  Feedback,
  FeedbackInput,
  FeedbackFilter,
  FeedbackStats,
  FeedbackCategory,
  FeedbackStatus,
} from './useFeedbackSocket';

// All Socket Composable (for when you need all features)
export { useAllSockets } from './useAllSockets';
export type { AllSocketsReturn } from './useAllSockets';

// Socket Types
export type {
  SocketEvent,
  SocketResponse,
  SocketError,
  SocketRoom,
  SocketUser,
} from './types/socket';
```

## **`src/composables/types/socket.ts`**

```typescript
// Common socket types used across all composables

export interface SocketEvent<T = any> {
  type: string;
  data: T;
  timestamp: string;
  sender?: SocketUser;
  roomId?: string;
}

export interface SocketResponse<T = any> {
  success: boolean;
  data?: T;
  error?: SocketError;
  timestamp: string;
}

export interface SocketError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface SocketRoom {
  id: string;
  name: string;
  type: 'feed' | 'chat' | 'poll' | 'Test' | 'qna' | 'feedback';
  participants: SocketUser[];
  createdAt: string;
  updatedAt: string;
}

export interface SocketUser {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Common event types
export const SocketEventTypes = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  
  // User events
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  USER_UPDATED: 'user:updated',
  
  // Room events
  ROOM_CREATED: 'room:created',
  ROOM_UPDATED: 'room:updated',
  ROOM_DELETED: 'room:deleted',
  JOINED_ROOM: 'joined:room',
  LEFT_ROOM: 'left:room',
  
  // Error events
  ERROR: 'error',
  VALIDATION_ERROR: 'validation:error',
  PERMISSION_ERROR: 'permission:error',
  
  // Broadcast events
  BROADCAST: 'broadcast',
  NOTIFICATION: 'notification',
} as const;

// Common error codes
export const SocketErrorCodes = {
  // Connection errors
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  RECONNECT_FAILED: 'RECONNECT_FAILED',
  AUTH_FAILED: 'AUTH_FAILED',
  
  // Room errors
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_FULL: 'ROOM_FULL',
  ALREADY_IN_ROOM: 'ALREADY_IN_ROOM',
  NOT_IN_ROOM: 'NOT_IN_ROOM',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_DATA: 'INVALID_DATA',
  MISSING_REQUIRED: 'MISSING_REQUIRED',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;
```

## **`src/plugins/socket.ts`**

```typescript
import { io, Socket } from 'socket.io-client';
import type { App } from 'vue';

// Configuration interface
export interface SocketConfig {
  url?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  transports?: string[];
  withCredentials?: boolean;
  auth?: Record<string, any>;
  query?: Record<string, any>;
}

// Socket event handler type
export type SocketEventHandler<T = any> = (data: T) => void;

// Event handler registry
interface EventHandlerRegistry {
  event: string;
  handler: SocketEventHandler;
  once?: boolean;
}

// Main Socket Service Class
class SocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Set<SocketEventHandler>> = new Map();
  private handlerRegistry: EventHandlerRegistry[] = [];
  private config: SocketConfig;
  
  // Connection state
  private _isConnected = false;
  private _connectionId: string | null = null;
  private _reconnectAttempts = 0;
  
  constructor(config: SocketConfig = {}) {
    this.config = {
      url: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
      withCredentials: true,
      ...config,
    };
    
    if (this.config.autoConnect) {
      this.connect();
    }
  }
  
  // Public properties
  get isConnected(): boolean {
    return this._isConnected;
  }
  
  get connectionId(): string | null {
    return this._connectionId;
  }
  
  get reconnectAttempts(): number {
    return this._reconnectAttempts;
  }
  
  // Connect to server
  connect(customUrl?: string): Socket {
    if (this.socket?.connected) {
      console.warn('Socket already connected');
      return this.socket;
    }
    
    // Clean up existing socket
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }
    
    const url = customUrl || this.config.url!;
    console.log(`Connecting to socket server: ${url}`);
    
    this.socket = io(url, {
      reconnection: this.config.reconnection,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
      reconnectionDelayMax: this.config.reconnectionDelayMax,
      transports: this.config.transports,
      withCredentials: this.config.withCredentials,
      auth: this.config.auth,
      query: this.config.query,
    });
    
    this.setupEventListeners();
    
    return this.socket;
  }
  
  // Disconnect from server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this._isConnected = false;
      this._connectionId = null;
      this.cleanupHandlers();
      console.log('Socket disconnected');
    }
  }
  
  // Reconnect manually
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.connect();
    }
  }
  
  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      this._isConnected = true;
      this._connectionId = this.socket?.id || null;
      this._reconnectAttempts = 0;
      console.log('Socket connected:', this._connectionId);
      this.emitToHandlers('connect', this._connectionId);
    });
    
    this.socket.on('disconnect', (reason: string) => {
      this._isConnected = false;
      console.log('Socket disconnected:', reason);
      this.emitToHandlers('disconnect', reason);
    });
    
    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error.message);
      this.emitToHandlers('connect_error', error);
    });
    
    this.socket.on('reconnect', (attempt: number) => {
      this._reconnectAttempts = attempt;
      console.log(`Socket reconnected after ${attempt} attempts`);
      this.emitToHandlers('reconnect', attempt);
    });
    
    this.socket.on('reconnect_attempt', (attempt: number) => {
      console.log(`Reconnection attempt: ${attempt}`);
      this.emitToHandlers('reconnect_attempt', attempt);
    });
    
    this.socket.on('reconnect_error', (error: Error) => {
      console.error('Reconnection error:', error);
      this.emitToHandlers('reconnect_error', error);
    });
    
    this.socket.on('reconnect_failed', () => {
      console.error('Reconnection failed');
      this.emitToHandlers('reconnect_failed');
    });
    
    // Register all stored event handlers
    this.handlerRegistry.forEach(({ event, handler, once }) => {
      if (once) {
        this.socket?.once(event, handler);
      } else {
        this.socket?.on(event, handler);
      }
    });
  }
  
  // Emit event with acknowledgement
  emit<T = any>(event: string, data?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }
      
      const timeout = setTimeout(() => {
        reject(new Error(`Socket timeout for event: ${event}`));
      }, 30000); // 30 second timeout
      
      this.socket.emit(event, data, (response: any) => {
        clearTimeout(timeout);
        
        if (response?.error) {
          const error = new Error(response.error.message || 'Socket error');
          (error as any).code = response.error.code;
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
  
  // Listen to event
  on<T = any>(event: string, handler: SocketEventHandler<T>): () => void {
    if (!this.socket) {
      // Store handler for later registration
      const wrapper = (data: T) => handler(data);
      this.handlerRegistry.push({ event, handler: wrapper });
      return () => this.removeStoredHandler(event, wrapper);
    }
    
    // Register immediately
    const wrapper = (data: T) => handler(data);
    this.socket.on(event, wrapper);
    
    // Store for cleanup
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(wrapper);
    
    // Return unsubscribe function
    return () => {
      this.socket?.off(event, wrapper);
      this.eventHandlers.get(event)?.delete(wrapper);
    };
  }
  
  // Listen to event once
  once<T = any>(event: string, handler: SocketEventHandler<T>): () => void {
    if (!this.socket) {
      // Store handler for later registration
      const wrapper = (data: T) => handler(data);
      this.handlerRegistry.push({ event, handler: wrapper, once: true });
      return () => this.removeStoredHandler(event, wrapper);
    }
    
    // Register immediately
    const wrapper = (data: T) => handler(data);
    this.socket.once(event, wrapper);
    
    return () => {
      // Note: Socket.io doesn't have an easy way to remove a once handler
      // We'll rely on it automatically removing after firing
    };
  }
  
  // Remove listener
  off(event: string, handler?: SocketEventHandler): void {
    if (!this.socket) return;
    
    if (handler) {
      this.socket.off(event, handler);
      this.eventHandlers.get(event)?.delete(handler);
    } else {
      this.socket.off(event);
      this.eventHandlers.delete(event);
    }
  }
  
  // Remove all listeners
  removeAllListeners(event?: string): void {
    if (!this.socket) return;
    
    if (event) {
      this.socket.removeAllListeners(event);
      this.eventHandlers.delete(event);
    } else {
      this.socket.removeAllListeners();
      this.eventHandlers.clear();
    }
  }
  
  // Join room
  joinRoom(roomId: string, data?: any): Promise<void> {
    return this.emit('join:room', { roomId, ...data });
  }
  
  // Leave room
  leaveRoom(roomId: string): Promise<void> {
    return this.emit('leave:room', { roomId });
  }
  
  // Get rooms
  getRooms(): Promise<string[]> {
    return this.emit('get:rooms');
  }
  
  // Get room info
  getRoomInfo(roomId: string): Promise<any> {
    return this.emit('get:room:info', { roomId });
  }
  
  // Broadcast to room
  broadcastToRoom(roomId: string, event: string, data: any): Promise<void> {
    return this.emit('broadcast:room', { roomId, event, data });
  }
  
  // Private helper methods
  private removeStoredHandler(event: string, handler: SocketEventHandler): void {
    const index = this.handlerRegistry.findIndex(
      item => item.event === event && item.handler === handler
    );
    if (index !== -1) {
      this.handlerRegistry.splice(index, 1);
    }
  }
  
  private emitToHandlers(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
  
  private cleanupHandlers(): void {
    this.eventHandlers.clear();
    this.handlerRegistry = [];
  }
  
  // Authentication
  authenticate(token: string): Promise<{ user: any }> {
    return this.emit('authenticate', { token });
  }
  
  // Get connection status
  getConnectionStatus(): {
    isConnected: boolean;
    connectionId: string | null;
    reconnectAttempts: number;
  } {
    return {
      isConnected: this._isConnected,
      connectionId: this._connectionId,
      reconnectAttempts: this._reconnectAttempts,
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

// Vue Plugin
export const socketPlugin = {
  install: (app: App, config?: SocketConfig) => {
    // Update config if provided
    if (config) {
      socketService.disconnect();
      socketService.connect(config.url);
    }
    
    // Provide socket service for Composition API
    app.provide('socket', socketService);
    
    // Add to global properties for Options API
    app.config.globalProperties.$socket = socketService;
    
    // Helper to auto-connect when app is mounted
    app.mixin({
      mounted() {
        if (!socketService.isConnected) {
          socketService.connect();
        }
      },
    });
    
    console.log('Socket plugin installed');
  },
};

// Composition API hook
export function useSocket() {
  const socket = inject('socket') as SocketService;
  if (!socket) {
    throw new Error('Socket service not found. Make sure socket plugin is installed.');
  }
  return socket;
}

// Export for direct usage
export const socket = socketService;
export default socketService;

// Export types
export type { SocketService, SocketConfig, SocketEventHandler };
```

## **`src/composables/useAllSockets.ts`**

```typescript
import { computed } from 'vue';
import { useBaseSocket } from './useBaseSocket';
import { useLiveFeedSocket } from './useLiveFeedSocket';
import { useQnASocket } from './useQnASocket';
import { usePollSocket } from './usePollSocket';
import { useTestSocket } from './useTestSocket';
import { useChatSocket } from './useChatSocket';
import { useFeedbackSocket } from './useFeedbackSocket';

export interface AllSocketsOptions {
  eventId?: string;
  feedId?: string;
  roomId?: string;
  userId?: string;
  enableAll?: boolean;
  enableLiveFeed?: boolean;
  enableQnA?: boolean;
  enablePoll?: boolean;
  enableTest?: boolean;
  enableChat?: boolean;
  enableFeedback?: boolean;
}

export function useAllSockets(options: AllSocketsOptions = {}) {
  const {
    eventId,
    feedId,
    roomId,
    userId,
    enableAll = true,
    enableLiveFeed = enableAll,
    enableQnA = enableAll,
    enablePoll = enableAll,
    enableTest = enableAll,
    enableChat = enableAll,
    enableFeedback = enableAll,
  } = options;
  
  // Base socket for common functionality
  const baseSocket = useBaseSocket(roomId);
  
  // Individual socket composables
  const liveFeedSocket = enableLiveFeed ? useLiveFeedSocket(feedId, { eventId }) : null;
  const qnaSocket = enableQnA ? useQnASocket(eventId) : null;
  const pollSocket = enablePoll ? usePollSocket(eventId) : null;
  const TestSocket = enableTest ? useTestSocket(eventId) : null;
  const chatSocket = enableChat ? useChatSocket(roomId) : null;
  const feedbackSocket = enableFeedback ? useFeedbackSocket(eventId) : null;
  
  // Combined state
  const isConnected = computed(() => baseSocket.state.value.isConnected);
  const isLoading = computed(() => baseSocket.state.value.isLoading);
  const error = computed(() => baseSocket.state.value.error);
  
  // Combined methods
  function disconnectAll() {
    baseSocket.cleanup();
    liveFeedSocket?.cleanup();
    qnaSocket?.cleanup();
    pollSocket?.cleanup();
    TestSocket?.cleanup();
    chatSocket?.cleanup();
    feedbackSocket?.cleanup();
  }
  
  function resetAll() {
    liveFeedSocket?.reset();
    qnaSocket?.reset();
    pollSocket?.reset();
    TestSocket?.reset();
    chatSocket?.reset();
    feedbackSocket?.reset();
  }
  
  return {
    // Base
    socket: baseSocket.socket,
    state: baseSocket.state,
    isConnected,
    isLoading,
    error,
    
    // Individual sockets
    liveFeed: liveFeedSocket,
    qna: qnaSocket,
    poll: pollSocket,
    Test: TestSocket,
    chat: chatSocket,
    feedback: feedbackSocket,
    
    // Combined methods
    disconnectAll,
    resetAll,
    joinRoom: baseSocket.joinRoom,
    leaveRoom: baseSocket.leaveRoom,
    emit: baseSocket.emit,
    on: baseSocket.on,
    off: baseSocket.off,
  };
}

export type AllSocketsReturn = ReturnType<typeof useAllSockets>;
```

## **Installation in main.ts**

```typescript
// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import { socketPlugin } from './plugins/socket';

const app = createApp(App);

// Install socket plugin
app.use(socketPlugin, {
  url: import.meta.env.VITE_SOCKET_URL,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
});

app.mount('#app');
```

## **Usage Examples**

```typescript
// Example 1: Import specific socket composable
import { useLiveFeedSocket } from '@/composables';

const {
  liveFeeds,
  createFeed,
  updateFeed,
  deleteFeed,
} = useLiveFeedSocket('feed-123');

// Example 2: Import all sockets
import { useAllSockets } from '@/composables';

const {
  liveFeed,
  qna,
  poll,
  chat,
  socket,
  isConnected,
} = useAllSockets({
  eventId: 'event-123',
  roomId: 'room-456',
  enableLiveFeed: true,
  enableChat: true,
});

// Example 3: Use socket plugin directly
import { useSocket } from '@/plugins/socket';

const socket = useSocket();

// Join a room
socket.joinRoom('feed-123');

// Listen to events
const unsubscribe = socket.on('livefeed:created', (data) => {
  console.log('New live feed:', data);
});

// Emit an event
await socket.emit('livefeed:create', {
  title: 'New Feed',
  content: 'Hello World',
});
```

This complete setup provides:

1. **Centralized Export**: Easy imports from `@/composables`
2. **Type Safety**: Full TypeScript support for all composables
3. **Modular Design**: Each feature has its own composable
4. **Combined Usage**: Use all features together with `useAllSockets`
5. **Vue Plugin**: Proper Vue 3 plugin installation
6. **Error Handling**: Comprehensive error handling throughout
7. **Cleanup**: Automatic cleanup on component unmount
8. **Reconnection**: Built-in reconnection logic
9. **Room Management**: Easy room joining/leaving
10. **Broadcast Support**: Send updates to specific rooms

The system is fully scalable and ready for production use!