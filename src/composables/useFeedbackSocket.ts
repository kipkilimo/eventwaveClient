import { ref, onMounted, onUnmounted } from "vue";
import { io, Socket } from "socket.io-client";

/* ----------------------------------
 * Event names (must match backend)
 * ---------------------------------- */
export const FEEDBACK_EVENTS = {
  SUBMITTED: "feedbackSubmitted",
  ANALYTICS_UPDATED: "feedbackAnalyticsUpdated",
  STATUS_CHANGED: "feedbackStatusChanged",
} as const;

/* ----------------------------------
 * Types (UI-focused)
 * ---------------------------------- */

export type FeedbackResponse = {
  id: string;
  questionId: string;
  questionText: string;
  questionType: string; // LIKERT_MATRIX, NPS_SCALE, etc.
  matrixValues?: number[]; // for LIKERT_MATRIX
  participantId?: string;
  submittedAt: string;
  sentiment?: string;
  additionalComments?: string;
};

export type FeedbackAnalytics = {
  totalSubmissions: number;
  completionRate: number;
  averageRating?: number;
  averageSentimentScore?: number;
  questionAnalytics: unknown; // can refine later
  sentimentDistribution: Record<string, number>;
  submissionTrend: { date: string; count: number }[];
};

export type Feedback = {
  id: string;
  status: string;
  isAcceptingResponses?: boolean;
  responseWindowDuration?: string;
};

/* ----------------------------------
 * Composable
 * ---------------------------------- */
export function useFeedbackSocket(feedbackId: string) {
  const socket = ref<Socket | null>(null);

  /* -----------------------------
   * Reactive state
   * ----------------------------- */
  const latestResponse = ref<FeedbackResponse | null>(null);
  const analytics = ref<FeedbackAnalytics | null>(null);
  const feedbackStatus = ref<Feedback | null>(null);
  const connected = ref(false);

  /* -----------------------------
   * Socket setup
   * ----------------------------- */
  const connect = () => {
    if (socket.value) return;

    socket.value = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.value.on("connect", () => {
      connected.value = true;
      socket.value?.emit("joinFeedback", feedbackId);
    });

    socket.value.on("disconnect", () => {
      connected.value = false;
    });

    /* -----------------------------
     * Event listeners
     * ----------------------------- */

    // New feedback response submitted
    socket.value.on(FEEDBACK_EVENTS.SUBMITTED, (response: FeedbackResponse) => {
      latestResponse.value = response;
      // Optionally push into analytics if needed
    });

    // Analytics updated (question averages, submission counts, sentiment distribution)
    socket.value.on(FEEDBACK_EVENTS.ANALYTICS_UPDATED, (payload: FeedbackAnalytics) => {
      analytics.value = payload;
    });

    // Feedback status changed (ACTIVE, CLOSED, etc.) or response acceptance
    socket.value.on(FEEDBACK_EVENTS.STATUS_CHANGED, (payload: Feedback) => {
      feedbackStatus.value = payload;
    });
  };

  /* -----------------------------
   * Emit helpers (optional)
   * ----------------------------- */
  const notifySubmitted = () => {
    socket.value?.emit(FEEDBACK_EVENTS.SUBMITTED, { feedbackId });
  };

  const notifyStatusChanged = () => {
    socket.value?.emit(FEEDBACK_EVENTS.STATUS_CHANGED, { feedbackId });
  };

  /* -----------------------------
   * Cleanup
   * ----------------------------- */
  const disconnect = () => {
    if (!socket.value) return;
    socket.value.emit("leaveFeedback", feedbackId);
    socket.value.disconnect();
    socket.value = null;
  };

  onMounted(connect);
  onUnmounted(disconnect);

  return {
    /* state */
    connected,
    latestResponse,
    analytics,
    feedbackStatus,

    /* actions */
    notifySubmitted,
    notifyStatusChanged,
    disconnect,
  };
}
