import { ref, onUnmounted, watch, computed } from 'vue';
import { socketService } from '@/plugins/socket';
import { useSocketStore } from '@/stores/socket';
import { useUserStore } from '@/stores/user';

import type {
  SocketRoomType,
  SocketRoomConfig,
  SocketAckResponse,
  SocketConnectionStatus,
  RoomUser,
} from '@/types/socket';

export function useSocketBase(roomType: SocketRoomType) {
  const socketStore = useSocketStore();
  const userStore = useUserStore();

  const isConnected = ref(false);
  const currentRoom = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Sync local state with global socket status
  watch(
    () => socketStore.connectionStatus,
    (status: SocketConnectionStatus) => {
      isConnected.value = status === 'connected';
    },
    { immediate: true }
  );

  const connect = async (): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;
      await socketService.connect();
    } catch (err: any) {
      error.value = err.message || 'Failed to connect';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const joinRoom = async (eventId: string): Promise<SocketAckResponse> => {
    if (!userStore.user?.id) {
      throw new Error('User not found');
    }

    const roomConfig: SocketRoomConfig = {
      type: roomType,
      eventId,
      userId: userStore.user.id,
    };

    try {
      isLoading.value = true;
      error.value = null;

      const response = await socketService.emitWithAck(`${roomType}:join`, { eventId });

      if (response.success) {
        currentRoom.value = socketService.getRoomId(roomConfig);
        socketStore.addRoom(currentRoom.value, roomType);
      }

      return response;
    } catch (err: any) {
      error.value = err.message || `Failed to join ${roomType} room`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const leaveRoom = async (eventId: string): Promise<SocketAckResponse> => {
    if (!userStore.user?.id) {
      throw new Error('User not found');
    }

    const roomConfig: SocketRoomConfig = {
      type: roomType,
      eventId,
      userId: userStore.user.id,
    };

    try {
      isLoading.value = true;

      const response = await socketService.emitWithAck(`${roomType}:leave`, { eventId });

      if (response.success) {
        const roomId = socketService.getRoomId(roomConfig);
        socketStore.removeRoom(roomId);
        currentRoom.value = null;
      }

      return response;
    } catch (err: any) {
      error.value = err.message || `Failed to leave ${roomType} room`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const emitWithAck = async <T = any>(
    event: string,
    data: any,
    timeout?: number
  ): Promise<SocketAckResponse<T>> => {
    try {
      return await socketService.emitWithAck<T>(event, data, timeout);
    } catch (err: any) {
      error.value = err.message || `Failed to emit ${event}`;
      throw err;
    }
  };

  const emit = <T = any>(event: string, data: T): void => {
    socketService.emit(event, data);
  };

  const on = <T = any>(event: string, handler: (data: T) => void): void => {
    socketService.on<T>(event, handler);
  };

  const off = (event: string, handler?: (...args: any[]) => void): void => {
    socketService.off(event, handler);
  };

  const once = <T = any>(event: string, handler: (data: T) => void): void => {
    socketService.once<T>(event, handler);
  };

  const getUsersInRoom = (eventId: string): RoomUser[] => {
    const roomId = socketService.getRoomId({
      type: roomType,
      eventId,
      userId: userStore.user?.id || '',
    });
    return socketStore.usersInRoom(roomId);
  };

  const getRoomId = (eventId: string): string => {
    return socketService.getRoomId({
      type: roomType,
      eventId,
      userId: userStore.user?.id || '',
    });
  };

  // Good cleanup on component unmount
  onUnmounted(() => {
    if (currentRoom.value) {
      const eventId = currentRoom.value.split(':')[1];
      leaveRoom(eventId).catch(console.error);
    }
  });

  return {
    // state
    isConnected,
    currentRoom,
    isLoading,
    error,

    // actions
    connect,
    disconnect: () => socketService.disconnect(),
    joinRoom,
    leaveRoom,

    // event actions
    emitWithAck,
    emit,
    on,
    off,
    once,

    // getters
    getUsersInRoom,
    getRoomId,

    getConnectionStatus: (): SocketConnectionStatus => socketStore.connectionStatus,
  };
}
