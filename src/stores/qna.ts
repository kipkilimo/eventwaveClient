import { defineStore } from "pinia";
import { apolloClient } from "@/plugins/apollo";
import {
  ConnectionStatus,
  EVENT_QNA,
  CREATE_QNA,
  ANSWER_QNA,
  TOGGLE_UPVOTE,
  ADD_SATISFACTION,
  PIN_QNA,
} from "@/graphql/qna";

/* ---------------------- TYPES ---------------------- */

interface User {
  id: string;
  name: string; 
}

interface SatisfactionScore {
  user: User;
  score: number;
  updatedAt: string;
}

export interface QnA {
  id: string;
  event: string;
  question: string;
  answer?: string | null;

  askedBy?: User | null;
  answeredBy?: User | null;

  isAnonymous?: boolean;
  isAnswered: boolean;
  isPinned: boolean;

  tags?: string[];

  upvotes: User[];
  upvoteCount: number;

  satisfactionScores?: SatisfactionScore[];

  createdAt: string;
  updatedAt: string;
}

interface SocketUser {
  id: string;
  name: string; 
}

interface SocketState {
  currentEventId: string | null;
  isJoined: boolean;
  connectionStatus: ConnectionStatus;
  usersInRoom: SocketUser[];
  lastActivity: string | null;
}

interface QnAState {
  qnas: Map<string, QnA>;
  qnaIds: string[];
  loading: boolean;
  error: string | null;
  socketState: SocketState;
}

/* ---------------------- STORE ---------------------- */

export const useQnAStore = defineStore("qna", {
  state: (): QnAState => ({
    qnas: new Map(),
    qnaIds: [],
    loading: false,
    error: null,
    socketState: {
      currentEventId: null,
      isJoined: false,
      connectionStatus: ConnectionStatus.DISCONNECTED,
      usersInRoom: [],
      lastActivity: null,
    },
  }),

  /* ---------------------- GETTERS ---------------------- */
  getters: {
    allQnA: (state) => state.qnaIds.map((id) => state.qnas.get(id)!),

    pinnedQnA: (state) => state.allQnA.filter((q) => q.isPinned),

    answeredQnA: (state) => state.allQnA.filter((q) => q.isAnswered),

    unansweredQnA: (state) => state.allQnA.filter((q) => !q.isAnswered),

    sortedQnA: (state) =>
      [...state.allQnA].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }),

    getQnAById: (state) => (id: string) => state.qnas.get(id),

    socketConnected: (state) =>
      state.socketState.connectionStatus === ConnectionStatus.CONNECTED,
  },

  /* ---------------------- ACTIONS ---------------------- */
  actions: {
    /* ---------- PRIVATE HELPERS ---------- */
    private_addQnA(qna: QnA) {
      const exists = this.qnas.has(qna.id);
      this.qnas.set(qna.id, qna);
      if (!exists) this.qnaIds.unshift(qna.id);
    },

    private_removeQnA(id: string) {
      this.qnas.delete(id);
      this.qnaIds = this.qnaIds.filter((qid) => qid !== id);
    },

    /* ---------- FETCH ---------- */
    async fetchEventQnA(eventId: string) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.query({
          query: EVENT_QNA,
          variables: { eventId },
          fetchPolicy: "network-only",
        });

        this.clearQnA();
        data.eventQnA.forEach((qna: QnA) => this.private_addQnA(qna));

        return data.eventQnA;
      } catch (err: any) {
        this.error = err?.message || "Failed to load QnA";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ---------- MUTATIONS ---------- */
    async createQnA(input: {
      event: string;
      question: string;
      isAnonymous?: boolean;
      tags?: string[];
    }) {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_QNA,
        variables: { input },
      });
      this.private_addQnA(data.createQnA);
      return data.createQnA;
    },

    async answerQnA(qnaId: string, answer: string) {
      const { data } = await apolloClient.mutate({
        mutation: ANSWER_QNA,
        variables: { input: { qnaId, answer } },
      });
      this.private_addQnA(data.answerQnA);
      return data.answerQnA;
    },

    async toggleUpvote(qnaId: string) {
      const { data } = await apolloClient.mutate({
        mutation: TOGGLE_UPVOTE,
        variables: { input: { qnaId } },
      });
      this.private_addQnA(data.toggleUpvote);
      return data.toggleUpvote;
    },

    async addSatisfaction(qnaId: string, score: number) {
      const { data } = await apolloClient.mutate({
        mutation: ADD_SATISFACTION,
        variables: { input: { qnaId, score } },
      });
      this.private_addQnA(data.addSatisfaction);
      return data.addSatisfaction;
    },

    async pinQnA(qnaId: string, pinned: boolean) {
      const { data } = await apolloClient.mutate({
        mutation: PIN_QNA,
        variables: { qnaId, pinned },
      });
      this.private_addQnA(data.pinQnA);
      return data.pinQnA;
    },

    /* ---------- SOCKET EVENTS ---------- */
    handleSocketEvent(
      type: "new" | "update" | "delete" | "pin" | "upvote" | "answer",
      payload: any
    ) {
      switch (type) {
        case "new":
        case "update":
        case "pin":
        case "upvote":
        case "answer":
          this.private_addQnA(payload);
          break;
        case "delete":
          this.private_removeQnA(payload.id);
          break;
      }
    },

    /* ---------- SOCKET ROOM ---------- */
    updateSocketConnectionStatus(status: ConnectionStatus) {
      this.socketState.connectionStatus = status;
      this.socketState.lastActivity = new Date().toISOString();
    },
    setCurrentEventId(eventId: string | null) {
      this.socketState.currentEventId = eventId;
    },
    setJoinedStatus(isJoined: boolean) {
      this.socketState.isJoined = isJoined;
    },
    updateUsersInRoom(users: SocketUser[]) {
      this.socketState.usersInRoom = users;
    },
    addUserToRoom(user: SocketUser) {
      if (!this.socketState.usersInRoom.some((u) => u.id === user.id))
        this.socketState.usersInRoom.push(user);
    },
    removeUserFromRoom(userId: string) {
      this.socketState.usersInRoom = this.socketState.usersInRoom.filter(
        (u) => u.id !== userId
      );
    },

    /* ---------- UTIL ---------- */
    clearQnA() {
      this.qnas.clear();
      this.qnaIds = [];
    },
    clearSocketState() {
      this.socketState = {
        currentEventId: null,
        isJoined: false,
        connectionStatus: ConnectionStatus.DISCONNECTED,
        usersInRoom: [],
        lastActivity: null,
      };
    },
  },
});
