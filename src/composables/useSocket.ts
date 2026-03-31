/* eslint-disable @typescript-eslint/no-explicit-any */
// /client/src/composables/useSocket.ts
import { io, type Socket } from "socket.io-client";
import { ref, onUnmounted } from "vue";
import { useUserStore } from "@/stores/user";

// Types
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  AuthenticatedSocket,
} from "@/types/socket/livefeed.types";

// Handlers
import { registerLiveFeedHandlers } from "@/socket/livefeed";
import { registerChatHandlers } from "@/socket/chat";
import { registerFeedbackHandlers } from "@/socket/feedback";
import { registerTestHandlers } from "@/socket/Test";
import { registerPollHandlers } from "@/socket/poll";
import { registerQnAHandlers } from "@/socket/qna";

// Singleton socket reference
const socketRef = ref<AuthenticatedSocket | null>(null);

/**
 * Aggregates and registers all socket event handlers for the application
 */
function registerAllSocketHandlers(socket: AuthenticatedSocket): void {
  // Register all socket handlers
  registerLiveFeedHandlers(socket, socket);
  registerChatHandlers(socket, socket);
  registerFeedbackHandlers(socket, socket);
  registerTestHandlers(socket, socket);
  registerPollHandlers(socket, socket);
  registerQnAHandlers(socket, socket);
}

/**
 * Transmits events from client to server with proper typing
 */
function createEventTransmitter(
  socket: AuthenticatedSocket,
): ClientToServerEvents {
  return {
    uploadLiveFeedMedia: (payload: any) =>
      socket.emit("uploadLiveFeedMedia", payload),
    sendMessage: (payload: any) => socket.emit("sendMessage", payload),
    submitFeedback: (payload: any) => socket.emit("submitFeedback", payload),
    submitTestAnswer: (payload: any) =>
      socket.emit("submitTestAnswer", payload),
    submitPollVote: (payload: any) => socket.emit("submitPollVote", payload),
    submitQnA: (payload: any) => socket.emit("submitQnA", payload),
  };
}

/**
 * Vue composable for managing a singleton Socket.IO connection
 * Acts as an aggregator and transmitter for all socket events
 */
export function useSocket() {
  const authStore = useUserStore();

  if (!socketRef.value) {
    const token: string | null = authStore.token;
    if (!token) throw new Error("Cannot connect socket: no auth token found");

    // Connect Socket.IO
    const client: AuthenticatedSocket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:4003",
      {
        auth: { token },
      },
    ) as AuthenticatedSocket;

    // Optional: attach userId if you have it in Pinia
    client.userId = authStore.user?.id;

    // Aggregate: Register all socket handlers
    registerAllSocketHandlers(client);

    // Save singleton
    socketRef.value = client;

    // Disconnect automatically on component unmount
    onUnmounted(() => {
      client.disconnect();
      socketRef.value = null;
    });
  }

  // Transmitter: Return both the socket instance and typed event emitters
  const eventTransmitter = createEventTransmitter(socketRef.value);

  return {
    // The raw socket instance for advanced usage
    socket: socketRef.value,

    // Typed event transmitters for client→server communication
    events: eventTransmitter,

    // Convenience methods
    connected: socketRef.value.connected,
    id: socketRef.value.id,
    disconnect: () => socketRef.value?.disconnect(),
    connect: () => socketRef.value?.connect(),
  };
}

/**
 * Type for the useSocket return value
 */
export type UseSocketReturn = ReturnType<typeof useSocket>;
