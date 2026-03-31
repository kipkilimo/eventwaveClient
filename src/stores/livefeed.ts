import { defineStore } from "pinia";
import { apolloClient } from "@/plugins/apollo";
import {
  type LiveFeedPopulated,
  type LiveFeedInput,
  type ReactionInput,
  type PaginatedLiveFeeds,
  ConnectionStatus,
  LiveFeedPriority,
  LIVEFEEDS_BY_EVENT,
  LIVEFEED_QUERY,
  CREATE_LIVEFEED,
  UPDATE_LIVEFEED,
  DELETE_LIVEFEED,
  ADD_REACTION,
  TOGGLE_PIN_POST,
} from "@/graphql/livefeed";

interface SocketUser {
  id: string;
  name: string;
  avatar?: string;
}

interface SocketState {
  currentEventId: string | null;
  isJoined: boolean;
  connectionStatus: ConnectionStatus;
  usersInRoom: SocketUser[];
  lastActivity: string | null;
}

interface PaginationState {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface LiveFeedState {
  feeds: Map<string, LiveFeedPopulated>; // ✅ Changed to Map
  feedIds: string[];
  pagination: PaginationState;
  currentFeed: LiveFeedPopulated | null;
  loading: boolean;
  feedDialog: boolean;
  error: string | null;
  socketState: SocketState;
}

export const useLiveFeedStore = defineStore("livefeed", {
  state: (): LiveFeedState => ({
    feeds: new Map(), // ✅ Initialize as Map
    feedIds: [],
    pagination: { total: 0, page: 1, limit: 50, hasMore: false },
    currentFeed: null,
    loading: false,
    feedDialog: false,
    error: null,
    socketState: {
      currentEventId: null,
      isJoined: false,
      connectionStatus: ConnectionStatus.DISCONNECTED,
      usersInRoom: [],
      lastActivity: null,
    },
  }),

  getters: {
    allFeeds: (state) => state.feedIds.map((id) => state.feeds.get(id)!),
    pinnedFeeds: (state) => state.allFeeds.filter((f) => f.isPinned),
    breakingFeeds: (state) => state.allFeeds.filter((f) => f.isBreaking),
    feedsByPriority: (state) => (priority: LiveFeedPriority) =>
      state.allFeeds.filter((f) => f.priority === priority),
    sortedFeeds: (state) =>
      [...state.allFeeds].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        if (a.isBreaking && !b.isBreaking) return -1;
        if (!a.isBreaking && b.isBreaking) return 1;
        // prioritize by LiveFeedPriority if available
        if ((a.priority ?? 0) > (b.priority ?? 0)) return -1;
        if ((a.priority ?? 0) < (b.priority ?? 0)) return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }),
    getFeedById: (state) => (id: string) => state.feeds.get(id),
    feedsByUser: (state) => (userId: string) =>
      state.allFeeds.filter((f) => f.author.id === userId),
    feedsByEvent: (state) => (eventId: string) =>
      state.allFeeds.filter((f) => f.event.id === eventId),
    isInLiveFeed: (state) => state.socketState.isJoined,
    currentLiveFeedEventId: (state) => state.socketState.currentEventId,
    usersInLiveFeedRoom: (state) => state.socketState.usersInRoom,
    socketConnected: (state) =>
      state.socketState.connectionStatus === ConnectionStatus.CONNECTED,
    socketConnecting: (state) =>
      state.socketState.connectionStatus === ConnectionStatus.CONNECTING,
  },

  actions: {
    // ---------------------- PRIVATE HELPERS ----------------------
    private_addFeed(feed: LiveFeedPopulated) {
      const exists = this.feeds.has(feed.id);
      this.feeds.set(feed.id, feed);
      if (!exists) this.feedIds.unshift(feed.id);
      if (this.currentFeed?.id === feed.id) this.currentFeed = feed;
    },
    private_removeFeed(id: string) {
      this.feeds.delete(id);
      this.feedIds = this.feedIds.filter((fid) => fid !== id);
      if (this.currentFeed?.id === id) this.currentFeed = null;
    },

    // ---------------------- PAGINATED FETCH ----------------------
    async fetchFeedsByEvent(event: string, page = 1, limit = 50) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.query({
          query: LIVEFEEDS_BY_EVENT,
          variables: { event, page, limit },
          fetchPolicy: "network-only",
        });
        const paginatedData = data.liveFeedPosts as PaginatedLiveFeeds;

        if (page === 1) this.clearFeeds();

        paginatedData.items.forEach((feed) => this.private_addFeed(feed));

        this.pagination = {
          total: paginatedData.total,
          page: paginatedData.page,
          limit: paginatedData.limit,
          hasMore:
            paginatedData.page * paginatedData.limit < paginatedData.total,
        };
        return paginatedData;
      } catch (err: any) {
        this.error = err?.message || "Failed to load live feeds";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async loadMoreFeeds(event: string) {
      if (!this.pagination.hasMore || this.loading) return;
      return this.fetchFeedsByEvent(
        event,
        this.pagination.page + 1,
        this.pagination.limit
      );
    },

    async fetchLiveFeed(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.query({
          query: LIVEFEED_QUERY,
          variables: { id },
          fetchPolicy: "network-only",
        });
        this.currentFeed = data.liveFeedPost;
        return this.currentFeed;
      } catch (err: any) {
        this.error = err?.message || "Failed to load live feed";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ---------------------- CREATE / UPDATE / DELETE ----------------------
    async createLiveFeed(input: LiveFeedInput) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.mutate({
          mutation: CREATE_LIVEFEED,
          variables: { input },
        });
        const newFeed = data.createLiveFeed as LiveFeedPopulated;
        this.private_addFeed(newFeed);
        this.pagination.total += 1;
        this.currentFeed = newFeed;
        return newFeed;
      } catch (err: any) {
        this.error = err?.message || "Failed to create live feed";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateLiveFeed(id: string, input: LiveFeedInput) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.mutate({
          mutation: UPDATE_LIVEFEED,
          variables: { id, input },
        });
        this.private_addFeed(data.updateLiveFeed as LiveFeedPopulated);
        return data.updateLiveFeed;
      } catch (err: any) {
        this.error = err?.message || "Failed to update live feed";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deleteLiveFeed(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await apolloClient.mutate({
          mutation: DELETE_LIVEFEED,
          variables: { id },
        });
        this.private_removeFeed(id);
        this.pagination.total = Math.max(0, this.pagination.total - 1);
        return true;
      } catch (err: any) {
        this.error = err?.message || "Failed to delete live feed";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ---------------------- REACTIONS ----------------------
    async addReaction(input: ReactionInput) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.mutate({
          mutation: ADD_REACTION,
          variables: { input },
        });
        this.private_addFeed(data.addReaction as LiveFeedPopulated);
        return data.addReaction;
      } catch (err: any) {
        this.error = err?.message || "Failed to add reaction";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async togglePinPost(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.mutate({
          mutation: TOGGLE_PIN_POST,
          variables: { id },
        });
        this.private_addFeed(data.togglePinPost as LiveFeedPopulated);
        return data.togglePinPost;
      } catch (err: any) {
        this.error = err?.message || "Failed to toggle pin";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ---------------------- SOCKET HANDLERS ----------------------
    handleSocketEvent(
      type: "new" | "update" | "delete" | "reaction" | "pin",
      data: any
    ) {
      switch (type) {
        case "new":
          this.private_addFeed(data);
          break;
        case "update":
          this.private_addFeed(data);
          break;
        case "delete":
          this.private_removeFeed(data.id || data.postId);
          break;
        case "reaction":
          this.handleSocketReactionUpdate(data.postId, data.reactions);
          break;
        case "pin":
          this.handleSocketPinUpdate(data.postId, data.isPinned);
          break;
      }
    },
    handleSocketReactionUpdate(postId: string, reactions: any[]) {
      const feed = this.feeds.get(postId);
      if (!feed) return;
      this.private_addFeed({
        ...feed,
        reactions: reactions.map((r) => ({ count: 0, users: [], ...r })),
      });
    },
    handleSocketPinUpdate(postId: string, isPinned: boolean) {
      const feed = this.feeds.get(postId);
      if (!feed) return;
      this.private_addFeed({ ...feed, isPinned });
    },

    // ---------------------- SOCKET ROOM ----------------------
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
    clearRoomUsers() {
      this.socketState.usersInRoom = [];
    },

    // ---------------------- UTILITIES ----------------------
    batchUpdatePosts(posts: LiveFeedPopulated[]) {
      posts.forEach((p) => this.private_addFeed(p));
      this.pagination.total = this.feeds.size;
    },
    clearCurrentFeed() {
      this.currentFeed = null;
    },
    clearFeeds() {
      this.feeds.clear(); // ✅ Now works with Map
      this.feedIds = [];
      this.pagination = { total: 0, page: 1, limit: 50, hasMore: false };
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
    findFeedById(id: string) {
      return this.feeds.get(id) || null;
    },
    getFeedsForEvents(eventIds: string[]) {
      return this.allFeeds.filter((f) => eventIds.includes(f.event.id));
    },

    async syncLiveFeed(
      event: string,
      options: { forceRefresh?: boolean; page?: number; limit?: number } = {}
    ) {
      const { forceRefresh = false, page = 1, limit = 50 } = options;
      if (forceRefresh || this.feeds.size === 0)
        return this.fetchFeedsByEvent(event, page, limit);
      return {
        items: this.allFeeds,
        total: this.pagination.total,
        page: this.pagination.page,
        limit: this.pagination.limit,
      };
    },
  },
});