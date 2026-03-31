import { defineStore } from "pinia";
// In your other files, import like this:
import { SocketRoomType } from '@/types/socket';
interface RoomUser {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface RoomState {
  type: SocketRoomType;
  users: RoomUser[];
  joinedAt: string | null;
}

export const useSocketStore = defineStore("socket", {
  state: () => ({
    connectionStatus: "disconnected" as "disconnected" | "connecting" | "connected" | "error",
    socketId: null as string | null,
    rooms: new Map<string, RoomState>(),
    lastActivity: null as string | null,
  }),

  getters: {
    isConnected: (state) => state.connectionStatus === "connected",
    isConnecting: (state) => state.connectionStatus === "connecting",
    
    // Get all rooms user is currently in
    currentRooms: (state) => Array.from(state.rooms.keys()),
    
    // Get rooms by type
    roomsByType: (state) => (type: SocketRoomType) => {
      return Array.from(state.rooms.entries())
        .filter(([_, roomState]) => roomState.type === type)
        .map(([roomId]) => roomId);
    },

    // Get users in specific room
    usersInRoom: (state) => (roomId: string) => {
      return state.rooms.get(roomId)?.users || [];
    },

    // Get total users across all rooms
    totalConnectedUsers: (state) => {
      const allUsers = new Set<string>();
      state.rooms.forEach((room) => {
        room.users.forEach((user) => allUsers.add(user.id));
      });
      return allUsers.size;
    },
  },

  actions: {
    updateConnectionStatus(status: "disconnected" | "connecting" | "connected" | "error") {
      this.connectionStatus = status;
      this.lastActivity = new Date().toISOString();
    },

    setSocketId(socketId: string) {
      this.socketId = socketId;
    },

    addRoom(roomId: string, type: SocketRoomType) {
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, {
          type,
          users: [],
          joinedAt: new Date().toISOString(),
        });
      }
    },

    removeRoom(roomId: string) {
      this.rooms.delete(roomId);
    },

    updateRoomUsers(roomId: string, users: RoomUser[]) {
      const room = this.rooms.get(roomId);
      if (room) {
        room.users = users;
      }
    },

    addUserToRoom(userId: string, roomId: string) {
      const room = this.rooms.get(roomId);
      if (room && !room.users.some((u) => u.id === userId)) {
        // User will be added by the server response
        this.lastActivity = new Date().toISOString();
      }
    },

    removeUserFromRoom(userId: string, roomId: string) {
      const room = this.rooms.get(roomId);
      if (room) {
        room.users = room.users.filter((u) => u.id !== userId);
        this.lastActivity = new Date().toISOString();
      }
    },

    clearRoom(roomId: string) {
      const room = this.rooms.get(roomId);
      if (room) {
        room.users = [];
      }
    },

    clearAllRooms() {
      this.rooms.clear();
    },

    clearState() {
      this.connectionStatus = "disconnected";
      this.socketId = null;
      this.rooms.clear();
      this.lastActivity = null;
    },
  },
});