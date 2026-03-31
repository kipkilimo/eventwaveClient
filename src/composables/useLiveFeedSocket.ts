import { ref, computed, onUnmounted } from 'vue';
import { useSocketBase } from './useBaseSocket';
import { useLiveFeedStore } from '@/stores/livefeed';
import { useEventStore } from '@/stores/event';

import { 
  SocketRoomType, 
  LiveFeedClientEvents, 
  LiveFeedServerEvents 
} from '../types/socket';

import type { 
  SocketAckResponse,
  JoinRoomData,
  LiveFeedPost,
  OptimisticPost
} from '../types/socket';

export function useLiveFeedSocket() {
  const liveFeedStore = useLiveFeedStore();
  const eventStore = useEventStore();
  const baseSocket = useSocketBase(SocketRoomType.LIVEFEED);

  const isSubscribed = ref(false);

  // -----------------------------
  // Normalize server post
  // -----------------------------
  const normalizePost = (serverPost: any): OptimisticPost => ({
    id: serverPost._id || serverPost.id,
    event: typeof serverPost.event === 'string'
      ? serverPost.event
      : serverPost.event?._id || serverPost.eventId,
    author: {
      id: serverPost.author?.id || serverPost.author?._id || 'anonymous',
      name: serverPost.author?.name || 'Anonymous',
      role: serverPost.author?.role || 'participant',
      email: serverPost.author?.email,
    },
    content: serverPost.content,
    type: serverPost.type,
    priority: serverPost.priority,
    reactions: serverPost.reactions || [],
    isPinned: serverPost.isPinned || false,
    isBreaking: serverPost.isBreaking || false,
    createdAt: serverPost.createdAt || new Date().toISOString(),
    updatedAt: serverPost.updatedAt || new Date().toISOString(),
    _isOptimistic: serverPost._isOptimistic || false,
    _tempId: serverPost._tempId,
  });

  const toStoreFormat = (post: OptimisticPost) => ({
    id: post.id,
    event: { id: post.event, title: 'Event', description: '', dateTime: { start: '', end: '' }, status: 'active' },
    author: post.author,
    content: post.content,
    type: post.type,
    priority: post.priority,
    reactions: post.reactions,
    isPinned: post.isPinned,
    isBreaking: post.isBreaking,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  });

  // -----------------------------
  // Join / Leave live feed
  // -----------------------------
  const joinLiveFeed = async (eventId: string): Promise<SocketAckResponse> => {
    if (!baseSocket.isConnected.value) await baseSocket.connect();

    const response = await baseSocket.emitWithAck<JoinRoomData, any>(
      LiveFeedClientEvents.JOIN,
      { eventId }
    );

    if (response.success) {
      setupLiveFeedListeners(eventId);
      isSubscribed.value = true;
      liveFeedStore.setCurrentEventId(eventId);
      liveFeedStore.setJoinedStatus(true);

      if (response.data?.posts) {
        const normalizedPosts = response.data.posts.map(post =>
          toStoreFormat(normalizePost(post))
        );
        liveFeedStore.batchUpdatePosts(normalizedPosts);
      }
    }

    return response;
  };

  const leaveLiveFeed = async (eventId: string): Promise<SocketAckResponse> => {
    const response = await baseSocket.emitWithAck(LiveFeedClientEvents.LEAVE, { eventId });

    if (response.success) {
      removeLiveFeedListeners();
      isSubscribed.value = false;
      liveFeedStore.setCurrentEventId(null);
      liveFeedStore.setJoinedStatus(false);
      liveFeedStore.clearSocketUsers();
    }

    return response;
  };

  // -----------------------------
  // Socket listeners
  // -----------------------------
  const setupLiveFeedListeners = (eventId: string) => {
    baseSocket.on<{ post: LiveFeedPost }>(LiveFeedServerEvents.POST_NEW, ({ post }) => {
      const storePost = toStoreFormat(normalizePost(post));
      if (storePost.event.id === eventId) liveFeedStore.handleSocketNewPost(storePost);
    });

    baseSocket.on<{ post: LiveFeedPost }>(LiveFeedServerEvents.POST_CREATED, ({ post }) => {
      liveFeedStore.handleSocketPostUpdate(toStoreFormat(normalizePost(post)));
    });

    baseSocket.on<{ post: LiveFeedPost }>(LiveFeedServerEvents.POST_UPDATED, ({ post }) => {
      liveFeedStore.handleSocketPostUpdate(toStoreFormat(normalizePost(post)));
    });

    baseSocket.on<{ postId: string; reactions: any[] }>(LiveFeedServerEvents.REACTION_UPDATED, ({ postId, reactions }) => {
      liveFeedStore.handleSocketReactionUpdate(postId, reactions);
    });

    baseSocket.on<{ postId: string; reactions: any[] }>(LiveFeedServerEvents.REACTION_ADDED, ({ postId, reactions }) => {
      liveFeedStore.handleSocketReactionUpdate(postId, reactions);
    });

    baseSocket.on<{ postId: string; isPinned: boolean }>(LiveFeedServerEvents.POST_PINNED, ({ postId, isPinned }) => {
      liveFeedStore.handleSocketPinUpdate(postId, isPinned);
    });

    baseSocket.on<{ postId: string }>(LiveFeedServerEvents.POST_DELETED, ({ postId }) => {
      liveFeedStore.handleSocketPostDelete(postId);
    });

    baseSocket.on<{ posts: LiveFeedPost[] }>(LiveFeedServerEvents.POSTS, ({ posts }) => {
      liveFeedStore.batchUpdatePosts(posts.map(post => toStoreFormat(normalizePost(post))));
    });
  };

  const removeLiveFeedListeners = () => {
    Object.values(LiveFeedServerEvents).forEach(evt => baseSocket.off(evt));
  };

  // -----------------------------
  // Computed
  // -----------------------------
  const usersInRoom = computed(() => {
    const id = eventStore.currentEvent?.id;
    return id ? baseSocket.getUsersInRoom(id) : [];
  });

  onUnmounted(() => {
    if (isSubscribed.value && liveFeedStore.currentLiveFeedEventId) {
      leaveLiveFeed(liveFeedStore.currentLiveFeedEventId).catch(console.error);
    }
    removeLiveFeedListeners();
  });

  return {
    // states
    isConnected: baseSocket.isConnected,
    isLoading: baseSocket.isLoading,
    error: baseSocket.error,
    isSubscribed,

    // actions
    connect: baseSocket.connect,
    disconnect: baseSocket.disconnect,
    joinLiveFeed,
    leaveLiveFeed,

    // computed
    usersInRoom,

    // store passthrough
    store: liveFeedStore,

    // helpers
    normalizePost,
    toStoreFormat,

    // socket raw
    on: baseSocket.on.bind(baseSocket),
    off: baseSocket.off.bind(baseSocket),
    emit: baseSocket.emit.bind(baseSocket),
    emitWithAck: baseSocket.emitWithAck.bind(baseSocket),
  };
}
