// /src/plugins/socket.ts
import { io, Socket } from "socket.io-client";

// Stores
import { useSocketStore } from "@/stores/socket";
import { useUserStore } from "@/stores/user";

// Types
import type {
  SocketAckResponse,
  SocketConfig,
  SocketConnectionStatus,
  SocketRoomConfig,
  SocketUser,
} from "@/types/socket";

import { BaseSocketEvents } from "@/types/socket";

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;

  // Lazy store access
  private get socketStore() {
    return useSocketStore();
  }
  private get userStore() {
    return useUserStore();
  }

  // Default config
  private defaultConfig: SocketConfig = {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    transports: ["websocket", "polling"],
    withCredentials: true,
  };

  private constructor() {}

  /** Singleton */
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /** Initialize socket */
  public initialize(config?: Partial<SocketConfig>): Socket {
    if (this.socket) return this.socket;

    const finalConfig = { ...this.defaultConfig, ...config };
    const URL = finalConfig.url || import.meta.env.VITE_BASE_WS_URL;

    const token = localStorage.getItem("token");
    const user = this.userStore.user;

    this.socket = io(URL, {
      ...finalConfig,
      autoConnect: false, // always connect manually
      auth: {
        token: token || null,
        userId: user?.id || "anonymous",
        userName: user?.name || "Anonymous",
      },
      query: finalConfig.query || {},
    });

    this.setupBaseListeners();
    return this.socket;
  }

  /** Base listeners */
  private setupBaseListeners(): void {
    if (!this.socket) return;

    this.socket.on(BaseSocketEvents.CONNECT, () => {
      this.socketStore.updateConnectionStatus("connected");
      this.socketStore.setSocketId(this.socket?.id || null);
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket.on(BaseSocketEvents.DISCONNECT, (reason: string) => {
      this.socketStore.updateConnectionStatus("disconnected");
      console.log("Socket disconnected:", reason);
    });

    this.socket.on(BaseSocketEvents.CONNECT_ERROR, (error: any) => {
      this.socketStore.updateConnectionStatus("error");
      console.error("Socket connection error:", error?.message || error);
    });

    this.socket.on(BaseSocketEvents.ERROR, (error: any) => {
      console.error("Socket error:", error);
    });

    this.socket.on(BaseSocketEvents.RECONNECT, (attempt: number) => {
      console.log("Socket reconnected after attempt:", attempt);
      this.socketStore.updateConnectionStatus("connected");

      // Update token after reconnect
      const token = localStorage.getItem("token");
      if (this.socket) this.socket.auth = { ...this.socket.auth, token };
    });

    this.socket.on(BaseSocketEvents.RECONNECT_ATTEMPT, (attempt: number) => {
      console.log("Socket reconnection attempt:", attempt);
      this.socketStore.updateConnectionStatus("connecting");
    });

    this.socket.on(BaseSocketEvents.RECONNECT_FAILED, () => {
      console.error("Socket reconnection failed");
      this.socketStore.updateConnectionStatus("error");
    });
  }

  /** Connect socket with auto-reconnect & token refresh */
  public async connect(): Promise<void> {
    if (!this.socket) this.initialize();

    if (this.socket?.connected) return;

    // refresh auth
    const token = localStorage.getItem("token");
    if (this.socket) this.socket.auth = { ...this.socket.auth, token };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Socket connect timeout")), this.defaultConfig.timeout);

      const cleanup = () => {
        clearTimeout(timeout);
        this.socket?.off(BaseSocketEvents.CONNECT, onConnect);
        this.socket?.off(BaseSocketEvents.CONNECT_ERROR, onError);
      };

      const onConnect = () => {
        cleanup();
        resolve();
      };

      const onError = (err: any) => {
        cleanup();
        reject(err);
      };

      this.socketStore.updateConnectionStatus("connecting");
      this.socket?.once(BaseSocketEvents.CONNECT, onConnect);
      this.socket?.once(BaseSocketEvents.CONNECT_ERROR, onError);

      this.socket?.connect();
    });
  }

  /** Disconnect socket */
  public disconnect(): void {
    this.socket?.disconnect();
    this.socketStore.clearAllRooms();
  }

  /** Emit with acknowledgment */
  public async emitWithAck<T = any>(
    event: string,
    data: any,
    timeout = 5000
  ): Promise<SocketAckResponse<T>> {
    if (!this.socket) this.initialize();

    if (!this.socket.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Ack timeout for event: ${event}`)), timeout);

      this.socket!.emit(event, data, (response: SocketAckResponse<T>) => {
        clearTimeout(timer);
        resolve(response);
      });
    });
  }

  /** Simple emit */
  public emit(event: string, ...args: any[]): void {
    if (!this.socket) this.initialize();
    this.socket?.emit(event, ...args);
  }

  /** Listen */
  public on<T = any>(event: string, handler: (data: T) => void): void {
    if (!this.socket) this.initialize();
    this.socket?.on(event, handler);
  }

  /** Remove listener */
  public off(event: string, handler?: (...args: any[]) => void): void {
    this.socket?.off(event, handler);
  }

  /** Once listener */
  public once<T = any>(event: string, handler: (data: T) => void): void {
    if (!this.socket) this.initialize();
    this.socket?.once(event, handler);
  }

  /** Get room ID */
  public getRoomId(roomConfig: SocketRoomConfig): string {
    return `${roomConfig.type}:${roomConfig.eventId}`;
  }

  /** Current user */
  public getCurrentUser(): SocketUser {
    const user = this.userStore.user;
    return {
      id: user?.id ?? "anonymous",
      name: user?.name ?? "Anonymous",
      email: user?.email,
      role: user?.role ?? "participant",
    };
  }

  /** Connection status */
  public getConnectionStatus(): SocketConnectionStatus {
    if (!this.socket) return "disconnected";
    if (this.socket.connected) return "connected";
    return this.socketStore.connectionStatus;
  }

  /** Quick check */
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /** Socket ID */
  public getSocketId(): string | null {
    return this.socket?.id || null;
  }

  /** Cleanup socket */
  public cleanup(): void {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.socketStore.clearState();
  }
}

// Export singleton
export const socketService = SocketService.getInstance();
export { SocketService };
