<template>
  <v-container fluid class="pa-0 mobile-content">
    <!-- HEADER -->
    <v-card elevation="2" rounded="sm" class="mb-4 pa-3 mobile-header"
      :style="{ position: 'sticky', top: '0', zIndex: 10, background: 'var(--v-theme-surface)' }">
      <v-row align="center" class="flex-column flex-sm-row" no-gutters>
        <v-col cols="auto" class="mr-sm-3 mb-2 mb-sm-0">
          <v-icon size="18" class="status-dot" :class="eventStatusClass">
            mdi-circle
          </v-icon>
        </v-col>

        <v-col class="flex-grow-1 text-center text-sm-left">
          <div class="text-subtitle-1 font-weight-medium">
            <span :style="{ color: eventStatusColor }">
              {{ eventStatusText }}
            </span>
          </div>
          <v-row no-gutters>
            <v-col cols="12" sm="auto" class="mr-sm-4">
              <div class="text-overline"> {{ currentEvent?.title || 'Event' }} </div>
            </v-col>
            <v-col cols="12" sm="auto">
              <span>
                <div class="text-caption mt-1"> {{ eventTimeMessage }} </div>
              </span>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12" sm="auto" class="d-flex justify-center justify-sm-end mt-3 mt-sm-0">
          <v-btn icon :color="socketStatusColor" size="small" @click="handleSocketAction" 
            :loading="liveFeedSocket.isLoading.value" variant="flat" class="mr-2">
            <v-icon :icon="socketStatusIcon" />
          </v-btn>
         
        </v-col>
      </v-row>
    </v-card>

    <!-- ALERTS -->
    <v-row v-if="socketError || showAlert" no-gutters>
      <v-col cols="12" class="px-2">
        <v-alert v-if="socketError" type="error" variant="tonal" dense @click:close="liveFeedSocket.error.value = ''"
          class="mb-2">
          {{ socketError }}
        </v-alert>
        <v-alert v-if="showAlert" :type="alertType" variant="tonal" dense @click:close="closeAlert" class="mb-2">
          {{ alertMessage }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- FEED FILTERS -->
    <v-card v-if="filteredFeeds.length > 0" elevation="0" border class="mb-3 mx-2" rounded="md">
      <v-card-text class="pa-2">
        <div class="d-flex flex-wrap align-center gap-1">
          <span class="text-caption font-weight-medium text-grey mr-1">Filter:</span>
          
          <v-chip
            v-for="type in feedTypes"
            :key="type"
            :color="activeTypeFilter === type ? getTypeColor(type) : 'grey-lighten-4'"
            :variant="activeTypeFilter === type ? 'flat' : 'outlined'"
            size="x-small"
            :prepend-icon="getTypeIcon(type)"
            @click="toggleTypeFilter(type)"
            class="cursor-pointer"
          >
            {{ type }}
          </v-chip>

          <v-spacer></v-spacer>

          <v-chip
            v-for="priority in feedPriorities"
            :key="priority"
            :color="activePriorityFilter === priority ? getPriorityColor(priority) : 'grey-lighten-4'"
            :variant="activePriorityFilter === priority ? 'flat' : 'outlined'"
            size="x-small"
            :prepend-icon="getPriorityIcon(priority)"
            @click="togglePriorityFilter(priority)"
            class="cursor-pointer"
          >
            {{ priority }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>

    <!-- FEEDS LIST -->
    <v-row dense class="g-0">
      <v-col v-for="feed in filteredAndSortedFeeds" :key="feed.id" cols="12" class="px-2">
        <v-card outlined class="mobile-card mb-4 mt-2" :style="{
          borderLeft: feed.isBreaking
            ? '4px solid #d32f2f'
            : feed.isPinned
              ? '4px solid #1976d2'
              : '',
        }">
          <v-card-text class="pb-2">
            <v-row align="center" no-gutters>
              <v-col cols="auto" class="d-flex align-center">
                <v-avatar size="36" color="primary" class="author-avatar">
                  <span class="white--text font-weight-bold">
                    {{ getAuthorInitial(feed) }}
                  </span>
                </v-avatar>
                <div class="pl-3">
                  <div class="font-weight-medium text-subtitle-2">
                    {{ feed.author?.name || 'Anonymous' }}
                  </div>
                  <div class="text-grey text-caption">
                    <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                    {{ formatTimeAgo(feed.createdAt) }}
                  </div>
                </div>
              </v-col>
              <v-spacer />
              <v-col cols="auto" class="d-flex align-center flex-wrap justify-end">
                <template v-if="feed.isBreaking">
                  <v-chip size="small" color="error" class="font-weight-bold mr-1 my-1">
                    <v-icon start>mdi-alert-octagon</v-icon> BREAKING
                  </v-chip>
                </template>
                <template v-if="feed.isPinned">
                  <v-chip size="small" color="info" variant="flat" class="mr-1 my-1">
                    <v-icon start>mdi-pin</v-icon> PINNED
                  </v-chip>
                </template>
                <v-chip size="small" :color="getPriorityColor(feed.priority)" variant="outlined" class="my-1">
                  <v-icon start>mdi-flag</v-icon> {{ feed.priority }}
                </v-chip>
              </v-col>
            </v-row>

            <v-divider class="my-3" />

            <v-row dense no-gutters>
              <v-col cols="auto">
                <v-chip size="small" :color="getTypeColor(feed.type)" :prepend-icon="getTypeIcon(feed.type)">
                  {{ feed.type }}
                </v-chip>
              </v-col>
            </v-row>

          </v-card-text>

          <v-card-text class="pt-0 text-body-2" style="white-space: pre-wrap">
            {{ feed.content }}
          </v-card-text>

          <v-divider class="mx-4" />

          <v-card-actions class="flex-wrap py-2 px-4 card-actions">
            <!-- REACTIONS -->
            <template v-if="feed.reactions && feed.reactions.length > 0">
              <v-chip
                v-for="reaction in getUniqueReactions(feed.reactions)"
                :key="reaction.type"
                color="grey-lighten-4"
                variant="outlined"
                size="x-small"
                class="cursor-pointer mr-1 mb-1"
                @click="handleReaction({ feedId: feed.id, reactionType: reaction.type })"
              >
                <v-icon size="x-small" class="mr-1">{{ getReactionIcon(reaction.type) }}</v-icon>
                {{ reaction.count }}
              </v-chip>
            </template>

            <!-- REACTION BUTTONS -->
            <div class="d-flex mr-2 mb-1">
              <v-btn
                v-for="reactionType in ['like', 'love', 'laugh', 'wow', 'sad', 'angry']"
                :key="reactionType"
                variant="text"
                size="x-small"
                :color="hasUserReacted(feed, reactionType) ? 'primary' : 'grey'"
                :icon="getReactionIcon(reactionType)"
                @click="handleReaction({ feedId: feed.id, reactionType })"
                class="reaction-btn"
              ></v-btn>
            </div>

            <v-spacer />

            <!-- MENU FOR ADMIN/FACILITATOR ACTIONS -->
            <v-menu v-if="canModerateFeed(feed)">
              <template #activator="{ props }">
                <v-btn icon size="small" variant="text" v-bind="props" color="grey-darken-2">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item prepend-icon="mdi-pin" @click="togglePin(feed.id)">
                  <v-list-item-title>
                    {{ feed.isPinned ? 'Unpin' : 'Pin' }}
                  </v-list-item-title>
                </v-list-item>
                <v-list-item prepend-icon="mdi-alert-octagon" @click="toggleBreaking(feed.id)">
                  <v-list-item-title>
                    {{ feed.isBreaking ? 'Un-break' : 'Mark Breaking' }}
                  </v-list-item-title>
                </v-list-item>
                <v-divider />
                <v-list-item v-if="canDeleteFeed(feed)" prepend-icon="mdi-delete" color="error" @click="deleteFeed(feed.id)">
                  <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- LOADING STATE -->
    <div v-if="liveFeedStore.loading && !hasFeeds" class="text-center py-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
        width="3"
      ></v-progress-circular>
      <div class="text-caption text-grey mt-3">Loading feeds...</div>
    </div>

    <!-- END OF FEEDS -->
    <div
      v-if="!liveFeedStore.loading && filteredAndSortedFeeds.length > 0"
      class="text-center py-6"
    >
      <v-card elevation="0" border rounded="md" class="pa-4 mx-2">
        <v-icon color="success" size="40" class="mb-2">mdi-check-circle-outline</v-icon>
        <div class="text-body-2 text-grey-darken-2 mb-2 font-weight-medium">
          You're all caught up!
        </div>
        <v-btn
          variant="outlined"
          size="small"
          prepend-icon="mdi-refresh"
          @click="refreshFeeds"
        >
          Check for new posts
        </v-btn>
      </v-card>
    </div>

    <!-- EMPTY STATE -->
    <v-row v-else-if="!liveFeedStore.loading && filteredFeeds.length === 0" justify="center" class="py-10 empty-state">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <v-icon size="64" color="grey-lighten-2">mdi-newspaper-variant-outline</v-icon>
        <div class="text-h6 mt-3">No Live Feeds</div>
        
      </v-col>
    </v-row>

    <!-- CREATE FEED DIALOG -->
 

    <!-- DELETE CONFIRMATION DIALOG -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card rounded="md">
        <v-card-title class="text-h6 font-weight-medium pa-4">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          Delete Feed
        </v-card-title>
        <v-card-text class="pa-4">
          <div class="text-body-1 mb-2">
            Are you sure you want to delete this feed?
          </div>
          <div class="text-caption text-grey">
            This action cannot be undone.
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="confirmDelete"
            :loading="liveFeedStore.loading"
            prepend-icon="mdi-delete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useTheme } from "vuetify";
import { useLiveFeedStore } from "@/stores/livefeed";
import { useLiveFeedSocket } from "@/composables/useLiveFeedSocket";
import { useEventStore } from "@/stores/event";
import { useUserStore } from "@/stores/user"; 
import type { LiveFeed, Reaction } from "@/graphql/livefeed";

// Store & Composables
const liveFeedStore = useLiveFeedStore();
const liveFeedSocket = useLiveFeedSocket();
const eventStore = useEventStore();
const userStore = useUserStore();
const theme = useTheme();

// Store refs
const currentEvent = computed(() => eventStore.currentEvent);
const { user } = storeToRefs(userStore);

// Local state
const showAlert = ref(false);
const alertMessage = ref("");
const alertType = ref<"success" | "error" | "warning" | "info">("info");
const showDeleteDialog = ref(false);
const feedToDelete = ref<string | null>(null);
const activeTypeFilter = ref<string | null>(null);
const activePriorityFilter = ref<string | null>(null);
const alertTimeout = ref<number | null>(null);

// Options for selects
const feedTypes = ref(["ANNOUNCEMENT", "UPDATE", "TEXT"]);
const feedPriorities = ref(["LOW", "MEDIUM", "HIGH"]);

// Computed Properties
const socketConnected = computed(() => liveFeedSocket.isConnected.value);
const socketError = computed(() => liveFeedSocket.error.value);
const isSubscribed = computed(() => liveFeedSocket.isSubscribed.value);

const socketStatusColor = computed(() => {
  if (socketError.value) return "error";
  if (socketConnected.value && isSubscribed.value) return "success";
  if (socketConnected.value) return "warning";
  return "error";
});

const socketStatusIcon = computed(() => {
  if (liveFeedSocket.isLoading.value) return "mdi-loading mdi-spin";
  if (socketError.value) return "mdi-wifi-off";
  if (socketConnected.value && isSubscribed.value) return "mdi-wifi";
  if (socketConnected.value) return "mdi-wifi-strength-1";
  return "mdi-wifi-strength-off-outline";
});

const socketStatusText = computed(() => {
  if (socketError.value) return "Offline";
  if (socketConnected.value && isSubscribed.value) return "Live";
  if (socketConnected.value) return "Connected";
  return "Disconnected";
});

const eventStatusClass = computed(() => {
  if (!currentEvent.value) return "ended";
  return currentEvent.value.status;
});

const eventStatusColor = computed(() => {
  if (!currentEvent.value) return "grey";

  switch (currentEvent.value.status) {
    case "live":
      return "#d32f2f";
    case "soon":
      return "#2e7d32";
    case "upcoming":
      return "#1976d2";
    case "ended":
      return "#616161";
    default:
      return "grey";
  }
});

const eventStatusText = computed(() => {
  if (!currentEvent.value) return "EVENT ENDED";
  
  switch (currentEvent.value.status) {
    case "live":
      return "LIVE NOW";
    case "soon":
      return "STARTING SOON";
    case "upcoming":
      return "UPCOMING";
    case "ended":
      return "ENDED";
    default:
      return currentEvent.value.status.toUpperCase();
  }
});

const eventTimeMessage = computed(() => {
  if (!currentEvent.value) return "";
  
  const now = new Date();
  const start = new Date(currentEvent.value.startDate);
  const end = new Date(currentEvent.value.endDate);
  
  if (currentEvent.value.status === "live") {
    return "Happening now";
  } else if (currentEvent.value.status === "soon") {
    const minsToStart = Math.floor((start.getTime() - now.getTime()) / 60000);
    return `Starts in ${minsToStart} minutes`;
  } else if (currentEvent.value.status === "upcoming") {
    const daysToStart = Math.floor((start.getTime() - now.getTime()) / 86400000);
    return `Starts in ${daysToStart} days`;
  } else if (currentEvent.value.status === "ended") {
    const daysSinceEnd = Math.floor((now.getTime() - end.getTime()) / 86400000);
    return `Ended ${daysSinceEnd} days ago`;
  }
  return "";
});

const isFullyConnected = computed(() => {
  return socketConnected.value && isSubscribed.value && !!user.value;
});

const alertIcon = computed(() => {
  switch (alertType.value) {
    case "success":
      return "mdi-check-circle";
    case "error":
      return "mdi-alert-circle";
    case "warning":
      return "mdi-alert";
    case "info":
      return "mdi-information";
    default:
      return "mdi-information";
  }
});

// Get feeds from store
const allFeeds = computed(() => {
  if (liveFeedStore.allFeeds) {
    return liveFeedStore.allFeeds;
  } else if (liveFeedStore.feeds && liveFeedStore.feeds.size) {
    return Array.from(liveFeedStore.feeds.values());
  } else if (liveFeedStore.feedIds && liveFeedStore.feedIds.length) {
    return liveFeedStore.feedIds
      .map((id) => liveFeedStore.getFeedById?.(id))
      .filter((feed): feed is LiveFeed => feed !== undefined);
  }
  return [];
});

const hasFeeds = computed(() => allFeeds.value.length > 0);

// Filter and sort feeds
const filteredFeeds = computed(() => {
  let feeds = [...allFeeds.value];

  if (activeTypeFilter.value) {
    feeds = feeds.filter((feed) => feed.type === activeTypeFilter.value);
  }

  if (activePriorityFilter.value) {
    feeds = feeds.filter(
      (feed) => feed.priority === activePriorityFilter.value
    );
  }

  return feeds;
});

const filteredAndSortedFeeds = computed(() => {
  const feeds = [...filteredFeeds.value];

  // Sort: pinned first, then breaking, then by date (newest first)
  feeds.sort((a, b) => {
    // Pinned feeds first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Breaking feeds next
    if (a.isBreaking && !b.isBreaking) return -1;
    if (!a.isBreaking && b.isBreaking) return 1;
    
    // Then by date (newest first)
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  return feeds;
});

const pinnedFeeds = computed(() => {
  return allFeeds.value.filter((feed) => feed.isPinned);
});

const breakingFeeds = computed(() => {
  return allFeeds.value.filter((feed) => feed.isBreaking);
});

// Helper functions for colors and icons
const getTypeColor = (type: string) => {
  switch (type?.toUpperCase()) {
    case "TEXT":
      return "success";
    case "ANNOUNCEMENT":
      return "primary";
    case "UPDATE":
      return "info";
    default:
      return "grey";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority?.toUpperCase()) {
    case "HIGH":
      return "red";
    case "MEDIUM":
      return "orange";
    case "LOW":
      return "green";
    default:
      return "grey";
  }
};

const getTypeIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case "TEXT":
      return "mdi-message-text";
    case "ANNOUNCEMENT":
      return "mdi-bullhorn";
    case "UPDATE":
      return "mdi-update";
    default:
      return "mdi-text";
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority?.toUpperCase()) {
    case "HIGH":
      return "mdi-alert-circle";
    case "MEDIUM":
      return "mdi-information";
    case "LOW":
      return "mdi-check-circle";
    default:
      return "mdi-circle-medium";
  }
};

const getReactionIcon = (type: string) => {
  switch (type) {
    case "like":
      return "mdi-thumb-up-outline";
    case "love":
      return "mdi-heart-outline";
    case "laugh":
      return "mdi-emoticon-outline";
    case "wow":
      return "mdi-emoticon-excited-outline";
    case "sad":
      return "mdi-emoticon-sad-outline";
    case "angry":
      return "mdi-emoticon-angry-outline";
    default:
      return "mdi-emoticon-outline";
  }
};

// Utility functions
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

const getUniqueReactions = (reactions: Reaction[]) => {
  const reactionMap: { [key: string]: number } = {};

  reactions.forEach((reaction) => {
    reactionMap[reaction.type] = (reactionMap[reaction.type] || 0) + 1;
  });

  return Object.entries(reactionMap).map(([type, count]) => ({ type, count }));
};

const hasUserReacted = (feed: LiveFeed, reactionType: string) => {
  if (!user.value) return false;
  return feed.reactions?.some(
    (r) => r.userId === user.value.id && r.type === reactionType
  );
};

const getAuthorInitial = (feed: LiveFeed) => {
  return feed.author?.name?.[0]?.toUpperCase() || 'A';
};

const canDeleteFeed = (feed: LiveFeed) => {
  if (!user.value) return false;
  return (
    user.value.id === feed.author.id ||
    user.value.role === "ADMIN" ||
    user.value.role === "FACILITATOR"
  );
};

const canModerateFeed = (feed: LiveFeed) => {
  if (!user.value) return false;
  return (
    user.value.role === "ADMIN" ||
    user.value.role === "FACILITATOR" ||
    user.value.id === feed.author.id
  );
};

const formatFeedStats = () => {
  const total = allFeeds.value.length;
  const pinned = pinnedFeeds.value.length;
  const breaking = breakingFeeds.value.length;

  const stats = [];
  if (total > 0) stats.push(`${total} total`);
  if (pinned > 0) stats.push(`${pinned} pinned`);
  if (breaking > 0) stats.push(`${breaking} breaking`);

  return stats.join(" • ") || "No feeds yet";
};

// Alert methods
const showMessage = (
  message: string,
  type: "success" | "error" | "warning" | "info",
  duration: number = 5000
) => {
  if (alertTimeout.value) {
    clearTimeout(alertTimeout.value);
  }
  
  alertMessage.value = message;
  alertType.value = type;
  showAlert.value = true;
  
  alertTimeout.value = window.setTimeout(() => {
    closeAlert();
  }, duration);
};

const closeAlert = () => {
  showAlert.value = false;
  alertMessage.value = "";
  if (alertTimeout.value) {
    clearTimeout(alertTimeout.value);
    alertTimeout.value = null;
  }
};

// Methods
 
const toggleTypeFilter = (type: string) => {
  activeTypeFilter.value = activeTypeFilter.value === type ? null : type;
};

const togglePriorityFilter = (priority: string) => {
  activePriorityFilter.value =
    activePriorityFilter.value === priority ? null : priority;
};

const refreshFeeds = async (): Promise<void> => {
  const eventId = currentEvent.value?.id || '';
  if (!eventId) return;

  try {
    const liveFeedStore = useLiveFeedStore();
    await liveFeedStore.fetchFeedsByEvent(eventId, 1, 50);
    
    showMessage("Feeds refreshed", "success");
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to refresh feeds";
    showMessage(errorMsg, "error");
  }
};

const deleteFeed = (id: string) => {
  feedToDelete.value = id;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!feedToDelete.value) return;

  try {
    await liveFeedStore.deleteLiveFeed(feedToDelete.value);
    showMessage("Feed deleted successfully", "success");
    showDeleteDialog.value = false;
    feedToDelete.value = null;
  } catch (error: any) {
    showMessage(error.message || "Failed to delete feed", "error");
  }
};

const handleReaction = async (payload: {
  feedId: string;
  reactionType: string;
}) => {
  if (!user.value) {
    showMessage("Please login to react", "warning");
    return;
  }

  try {
    await liveFeedStore.addReaction({
      postId: payload.feedId,
      type: payload.reactionType,
      userId: user.value.id,
    });
  } catch (error: any) {
    showMessage(error.message || "Failed to add reaction", "error");
  }
};

const togglePin = async (feedId: string) => {
  if (!canModerateFeed(liveFeedStore.getFeedById?.(feedId))) {
    showMessage("You don't have permission to pin/unpin", "warning");
    return;
  }

  const feed = liveFeedStore.getFeedById?.(feedId);
  if (!feed) return;

  try {
    await liveFeedStore.togglePinPost(feedId);
    const message = feed.isPinned ? "Feed unpinned" : "Feed pinned";
    showMessage(message, "success");
  } catch (error: any) {
    showMessage(error.message || "Failed to toggle pin", "error");
  }
};

const toggleBreaking = async (feedId: string) => {
  if (!canModerateFeed(liveFeedStore.getFeedById?.(feedId))) {
    showMessage("You don't have permission to mark as breaking", "warning");
    return;
  }

  const feed = liveFeedStore.getFeedById?.(feedId);
  if (!feed) return;

  try {
    await liveFeedStore.updateLiveFeed({
      id: feedId,
      eventId: feed.event.id || feed.event,
      content: feed.content,
      type: feed.type,
      priority: feed.priority,
      isBreaking: !feed.isBreaking,
      isPinned: feed.isPinned,
    });

    const message = !feed.isBreaking
      ? "Marked as breaking news"
      : "Removed breaking news tag";
    showMessage(message, "success");
  } catch (error: any) {
    showMessage(error.message || "Failed to update feed", "error");
  }
};

const handleSocketAction = () => {
  if (!user.value) {
    showMessage("Please login to connect", "warning");
    return;
  }

  if (!socketConnected.value) {
    liveFeedSocket.connect();
    showMessage("Connecting to live feed...", "info");
  } else if (!isSubscribed.value && currentEvent.value?.id) {
    joinEventRoom();
  } else if (isSubscribed.value) {
    leaveEventRoom();
    showMessage("Disconnected from live feed", "info");
  }
};

const joinEventRoom = async () => {
  if (!currentEvent.value?.id || isSubscribed.value) return;

  try {
    await liveFeedSocket.joinLiveFeed(currentEvent.value.id);
    showMessage("Connected to live feed", "success");
  } catch (error: any) {
    console.error("Failed to join event room:", error);
    showMessage("Live updates unavailable", "warning");
  }
};

const leaveEventRoom = async () => {
  if (!currentEvent.value?.id || !isSubscribed.value) return;

  try {
    await liveFeedSocket.leaveLiveFeed(currentEvent.value.id);
  } catch (error: any) {
    console.error("Failed to leave event room:", error);
  }
};

// Lifecycle
onMounted(async () => {
  if (currentEvent.value?.id) {
    await refreshFeeds();
    await joinEventRoom();
  }
});

onUnmounted(() => {
  leaveEventRoom();
  if (alertTimeout.value) {
    clearTimeout(alertTimeout.value);
  }
});

// Watchers
watch(
  () => currentEvent.value?.id,
  (newEventId) => {
    if (newEventId) {
      refreshFeeds();
      joinEventRoom();
    } else {
      leaveEventRoom();
    }
  }
);

watch(socketConnected, (connected) => {
  if (connected && currentEvent.value?.id && !isSubscribed.value) {
    joinEventRoom();
  }
});

watch(socketError, (error) => {
  if (error) {
    showMessage(`Connection error: ${error}`, "error");
  }
});
</script>

<style scoped>
.mobile-content {
  max-width: 100%;
  overflow-x: hidden;
}

.mobile-header {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
}

.mobile-card {
  transition: all 0.2s ease;
}

.mobile-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.author-avatar {
  flex-shrink: 0;
}

.card-actions {
  min-height: 44px;
}

.reaction-btn {
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
}

@media (max-width: 600px) {
  .mobile-content {
    padding: 16px;
  }

  .mobile-card {
    border-radius: 8px;
  }

  .mobile-header {
    padding-bottom: 8px;
  }

  .v-btn {
    min-width: auto;
    padding: 0 8px;
  }

  .v-chip {
    font-size: 0.625rem;
    height: 20px;
    padding: 0 6px;
  }

  .text-subtitle-2 {
    font-size: 0.875rem;
  }

  .text-caption {
    font-size: 0.75rem;
  }

  /* Better spacing for mobile */
  .v-card-actions {
    padding: 8px !important;
  }

  .v-card-text {
    padding: 12px !important;
  }

  /* Better touch targets */
  .v-btn--icon {
    width: 36px;
    height: 36px;
  }
}

.status-dot {
  transition: color 0.3s ease;
}

/* 🔴 LIVE */
.status-dot.live {
  color: #d32f2f;
  animation: blink 1s infinite;
}

/* 🟢 STARTING SOON */
.status-dot.soon {
  color: #2e7d32;
}

/* 🔵 UPCOMING */
.status-dot.upcoming {
  color: #26a9e7;
}

/* ⚫ ENDED */
.status-dot.ended {
  color: #9e9e9e;
}

@keyframes blink {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.2;
  }

  100% {
    opacity: 1;
  }
}

/* Smooth transitions */
.v-chip {
  transition: all 0.2s ease;
}

.v-btn {
  transition: all 0.2s ease;
}

/* Loading animation */
@keyframes subtle-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.v-progress-circular {
  animation: subtle-pulse 2s ease-in-out infinite;
}
</style>