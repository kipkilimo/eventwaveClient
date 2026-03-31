<template>
  <v-container fluid class="pa-0 live-feed-container">
    <!-- HEADER CARD -->
    <v-card elevation="0" class="mb-4 pa-3" :class="headerCardClass">
      <div class="d-flex align-center justify-space-between flex-wrap gap-2">
        <div class="d-flex align-center gap-3">
          <div class="status-indicator" :class="eventStatusClass">
            <v-icon size="small" :color="eventStatusColor">{{
              eventStatusIcon
            }}</v-icon>
          </div>
          <div>
            <div class="text-subtitle-2 font-weight-medium">Live Feed</div>
            <div class="text-caption text-grey">{{ formatFeedStats() }}</div>
          </div>
        </div>

        <div class="d-flex align-center gap-1">
          <!-- Sort Toggle Button -->
          <v-btn
            @click="toggleSortOrder"
            size="small"
            variant="text"
            class="mr-1"
            :prepend-icon="sortAscending ? 'mdi-sort-clock-ascending' : 'mdi-sort-clock-descending'"
          >
            {{ sortAscending ? 'Oldest First' : 'Newest First' }}
          </v-btn>

          <v-chip
            :color="socketStatusColor"
            size="small"
            :prepend-icon="socketStatusIcon"
            variant="flat"
            class="font-weight-medium text-white"
          >
            {{ socketStatusText }}
          </v-chip>

          <v-btn
            size="small"
            icon="mdi-plus"
            color="primary"
            variant="flat"
            @click="addFeed"
            class="ml-2"
          >
          </v-btn>

          <v-btn
            size="small"
            :icon="
              isLoading ? 'mdi-loading mdi-spin' : 'mdi-refresh'
            "
            @click="refreshFeeds"
            :loading="isLoading"
            variant="text"
          ></v-btn>
        </div>
      </div>
    </v-card>

    <!-- ALERTS SECTION -->
    <template v-if="socketError || showAlert">
      <v-alert
        v-if="socketError"
        type="warning"
        variant="tonal"
        class="mb-3"
        border="start"
        density="compact"
        :icon="false"
      >
        <div class="d-flex align-start">
          <v-icon color="warning" size="small" class="mr-2 mt-1"
            >mdi-wifi-off</v-icon
          >
          <div>
            <div class="text-caption font-weight-medium">Connection issues</div>
            <div class="text-caption text-grey">{{ socketError }}</div>
          </div>
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="x-small"
            @click="liveFeedSocket.error.value = null"
          ></v-btn>
        </div>
      </v-alert>

      <v-alert
        v-if="showAlert"
        :type="alertType"
        variant="tonal"
        class="mb-3"
        border="start"
        density="compact"
        :icon="false"
      >
        <div class="d-flex align-center">
          <v-icon :color="alertType" size="small" class="mr-2">{{
            alertIcon
          }}</v-icon>
          <div class="text-caption">{{ alertMessage }}</div>
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="x-small"
            @click="showAlert = false"
          ></v-btn>
        </div>
      </v-alert>
    </template>

    <!-- FEED FILTERS -->
    <v-card
      v-if="filteredFeeds.length > 0"
      elevation="0"
      border
      class="mb-4"
      rounded="md"
    >
      <v-card-text class="pa-2">
        <div class="d-flex flex-wrap align-center gap-1">
          <span class="text-caption font-weight-medium text-grey mr-1"
            >Filter:</span
          >

          <v-chip
            v-for="type in feedTypes"
            :key="type"
            :color="
              activeTypeFilter === type ? getTypeColor(type) : 'grey-lighten-4'
            "
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
            :color="
              activePriorityFilter === priority
                ? getPriorityColor(priority)
                : 'grey-lighten-4'
            "
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

    <!-- MAIN FEEDS LIST -->
    <template v-if="filteredFeeds.length > 0">
      <div v-for="feed in filteredAndSortedFeeds" :key="feed.id" class="mb-3">
        <v-card elevation="0" border class="feed-card mt-6 ma-2" rounded="md">
          <!-- COLOR CODED LEFT MARGIN -->
          <div
            class="feed-left-border"
            :class="`border-${getTypeColor(feed.type)}`"
          ></div>

          <div class="pa-3">
            <!-- FEED HEADER -->
            <div class="d-flex justify-space-between align-start mb-2">
              <div class="d-flex align-center flex-wrap gap-1">
                <v-chip
                  :color="getTypeColor(feed.type)"
                  variant="flat"
                  size="x-small"
                  :prepend-icon="getTypeIcon(feed.type)"
                  class="font-weight-medium"
                >
                  {{ feed.type }}
                </v-chip>

                <v-chip
                  :color="getPriorityColor(feed.priority)"
                  variant="outlined"
                  size="x-small"
                  :prepend-icon="getPriorityIcon(feed.priority)"
                  class="font-weight-medium"
                >
                  {{ feed.priority }}
                </v-chip>

                <v-chip
                  v-if="feed.isPinned"
                  color="amber"
                  variant="flat"
                  size="x-small"
                  prepend-icon="mdi-pin"
                >
                  Pinned
                </v-chip>

                <v-chip
                  v-if="feed.isBreaking"
                  color="red"
                  variant="flat"
                  size="x-small"
                  prepend-icon="mdi-fire"
                >
                  Breaking
                </v-chip>
              </div>

              <div class="d-flex align-center gap-1">
                <v-chip
                  color="grey-lighten-4"
                  variant="text"
                  size="x-small"
                  prepend-icon="mdi-clock-outline"
                  class="text-grey"
                >
                  {{ formatTimeAgo(feed.createdAt) }}
                </v-chip>
              </div>
            </div>

            <!-- CONTENT -->
            <div class="text-body-2 mb-2" style="white-space: pre-wrap">
              {{ feed.content }}
            </div>

            <!-- AUTHOR -->
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon size="x-small" class="mr-1 text-grey"
                  >mdi-account</v-icon
                >
                <span class="text-caption text-grey">{{
                  feed.author.name
                }}</span>
              </div>

              <!-- REACTIONS -->
              <div
                v-if="feed.reactions && feed.reactions.length > 0"
                class="d-flex gap-1"
              >
                <v-chip
                  v-for="reaction in getUniqueReactions(feed.reactions)"
                  :key="reaction.type"
                  color="grey-lighten-4"
                  variant="outlined"
                  size="x-small"
                  class="cursor-pointer"
                  @click="
                    handleReaction({
                      feedId: feed.id,
                      reactionType: reaction.type,
                    })
                  "
                >
                  <v-icon size="x-small" class="mr-1">{{
                    getReactionIcon(reaction.type)
                  }}</v-icon>
                  {{ reaction.count }}
                </v-chip>
              </div>
            </div>

            <!-- ACTION BUTTONS -->
            <v-divider class="my-2"></v-divider>
            <div class="d-flex align-center gap-1">
              <!-- REACTION BUTTONS -->
              <v-btn
                v-for="reactionType in [
                  'like',
                  'love',
                  'laugh',
                  'wow',
                  'sad',
                  'angry',
                ]"
                :key="reactionType"
                variant="text"
                size="x-small"
                :color="hasUserReacted(feed, reactionType) ? 'primary' : 'grey'"
                :icon="getReactionIcon(reactionType)"
                @click="handleReaction({ feedId: feed.id, reactionType })"
                class="reaction-btn"
              ></v-btn>

              <v-divider vertical inset class="mx-1"></v-divider>

              <!-- ACTION BUTTONS -->
              <v-btn
                variant="text"
                size="x-small"
                :color="feed.isPinned ? 'amber' : 'grey'"
                :icon="feed.isPinned ? 'mdi-pin' : 'mdi-pin-outline'"
                @click="togglePin(feed.id)"
              ></v-btn>

              <v-btn
                variant="text"
                size="x-small"
                :color="feed.isBreaking ? 'red' : 'grey'"
                :icon="feed.isBreaking ? 'mdi-fire' : 'mdi-fire-outline'"
                @click="toggleBreaking(feed.id)"
              ></v-btn>

              <v-spacer></v-spacer>

              <!-- DELETE BUTTON -->
              <v-btn
                v-if="canDeleteFeed(feed)"
                variant="text"
                size="x-small"
                color="error"
                icon="mdi-delete-outline"
                @click="deleteFeed(feed.id)"
              ></v-btn>
            </div>
          </div>
        </v-card>
      </div>
    </template>

    <!-- LOADING STATE -->
    <div v-if="isLoading" class="text-center py-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
        width="3"
      ></v-progress-circular>
      <div class="text-caption text-grey mt-3">Loading feeds...</div>
    </div>

    <!-- END OF FEEDS MESSAGE -->
    <div
      v-if="!isLoading && filteredAndSortedFeeds.length > 0"
      class="text-center py-6"
    >
      <v-card elevation="0" border rounded="md" class="pa-4">
        <v-icon color="success" size="40" class="mb-2"
          >mdi-check-circle-outline</v-icon
        >
        <div class="text-body-2 text-grey-darken-2 mb-2 font-weight-medium">
          You're all caught up!
        </div>
        <v-btn
          variant="outlined"
          size="small"
          prepend-icon="mdi-refresh"
          @click="refreshFeeds"
          :loading="isLoading"
        >
          Check for new posts
        </v-btn>
      </v-card>
    </div>

    <!-- EMPTY STATE -->
    <template v-else-if="!isLoading && filteredFeeds.length === 0">
      <v-row justify="center" class="py-8">
        <v-col cols="12" class="text-center">
          <v-icon size="64" color="grey-lighten-2" class="mb-3">
            mdi-newspaper-variant-outline
          </v-icon>
          <div class="text-h6 font-weight-medium text-grey-darken-3 mb-2">
            No Live Feeds Yet
          </div>
          <div class="text-body-2 text-grey-darken-1 mb-4">
            Be the first to share updates or announcements
          </div>

          <div class="d-flex flex-wrap justify-center gap-2">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="addFeed"
              size="small"
              variant="flat"
            >
              Create First Feed
            </v-btn>

            <v-btn
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="refreshFeeds"
              :loading="isLoading"
              size="small"
            >
              Refresh
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </template>

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
            :loading="isLoading"
            prepend-icon="mdi-delete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- CREATE FEED DIALOG -->
    <v-dialog v-model="liveFeedStore.feedDialog" max-width="630">
      <CreateLiveFeed />
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
import CreateLiveFeed from "@/components/dialogs/forms/CreateLiveFeed.vue";
import type { LiveFeed, Reaction } from "@/graphql/livefeed";

/* =========================
   PROPS
========================= */
interface Props {
  initialSortAscending?: boolean;
  showSort?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialSortAscending: false,
  showSort: true
});

/* =========================
   EMITS
========================= */
const emit = defineEmits<{
  'feed-deleted': [id: string];
  'feed-pinned': [id: string, isPinned: boolean];
}>();

// Store & Composables
const liveFeedStore = useLiveFeedStore();
const liveFeedSocket = useLiveFeedSocket();
const eventStore = useEventStore();
const userStore = useUserStore();
const theme = useTheme();

// Store refs
const currentEvent = eventStore.currentEvent;
const { user } = storeToRefs(userStore);

// Local state
const sortAscending = ref(props.initialSortAscending);
const showAlert = ref(false);
const alertMessage = ref("");
const alertType = ref<"success" | "error" | "warning" | "info">("info");
const showDeleteDialog = ref(false);
const feedToDelete = ref<string | null>(null);
const activeTypeFilter = ref<string | null>(null);
const activePriorityFilter = ref<string | null>(null);
const isLoading = ref(false);

// Options for selects
const feedTypes = ref(["ANNOUNCEMENT", "UPDATE", "TEXT"]);
const feedPriorities = ref(["LOW", "MEDIUM", "HIGH"]);

// Computed Properties
const socketConnected = computed(() => liveFeedSocket.isConnected.value);
const socketError = computed(() => liveFeedSocket.error.value);

const socketStatusColor = computed(() => {
  if (socketError.value) return "error";
  return socketConnected.value ? "success" : "warning";
});

const socketStatusIcon = computed(() => {
  if (socketError.value) return "mdi-wifi-off";
  return socketConnected.value ? "mdi-wifi" : "mdi-wifi-strength-1";
});

const socketStatusText = computed(() => {
  if (socketError.value) return "Offline";
  return socketConnected.value ? "Live" : "Connecting";
});

const eventStatusClass = computed(() => {
  if (!currentEvent.value) return "";
  return `status-${currentEvent.value.status}`;
});

const eventStatusColor = computed(() => {
  if (!currentEvent.value) return "grey";

  switch (currentEvent.value.status) {
    case "live":
      return "red";
    case "soon":
      return "green";
    case "upcoming":
      return "blue";
    case "ended":
      return "grey";
    default:
      return "grey";
  }
});

const eventStatusIcon = computed(() => {
  if (!currentEvent.value) return "mdi-calendar";

  switch (currentEvent.value.status) {
    case "live":
      return "mdi-broadcast";
    case "soon":
      return "mdi-clock-alert";
    case "upcoming":
      return "mdi-calendar-clock";
    case "ended":
      return "mdi-calendar-check";
    default:
      return "mdi-calendar";
  }
});

const headerCardClass = computed(() => {
  if (!currentEvent.value) return "";
  return `header-${currentEvent.value.status}`;
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
  
  // Sort by pinned first, then by date
  feeds.sort((a, b) => {
    // Pinned items first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then by date
    const tA = new Date(a.createdAt).getTime();
    const tB = new Date(b.createdAt).getTime();
    return sortAscending.value ? tA - tB : tB - tA;
  });
  
  return feeds;
});

const pinnedFeeds = computed(() => {
  return allFeeds.value.filter((feed) => feed.isPinned);
});

const breakingFeeds = computed(() => {
  return allFeeds.value.filter((feed) => feed.isBreaking);
});

/* =========================
   HELPER FUNCTIONS
========================= */
const getTypeColor = (type: string = "") => {
  switch (type.toUpperCase()) {
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

const getPriorityColor = (priority: string = "") => {
  switch (priority.toUpperCase()) {
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

const getTypeIcon = (type: string = "") => {
  switch (type.toUpperCase()) {
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

const getPriorityIcon = (priority: string = "") => {
  switch (priority.toUpperCase()) {
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
  const icons: Record<string, string> = {
    "like": "mdi-thumb-up-outline",
    "love": "mdi-heart-outline",
    "laugh": "mdi-emoticon-outline",
    "wow": "mdi-emoticon-excited-outline",
    "sad": "mdi-emoticon-sad-outline",
    "angry": "mdi-emoticon-angry-outline"
  };
  return icons[type] || "mdi-emoticon-outline";
};

/* =========================
   UTILITY FUNCTIONS
========================= */
const formatTimeAgo = (dateString: string) => {
  if (!dateString) return "Unknown";
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (isNaN(date.getTime())) return "Invalid date";
  
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

const hasUserReacted = (feed: LiveFeed, reactionType: string): boolean => {
  if (!user.value || !feed.reactions) return false;
  return feed.reactions.some(
    (r) => r.userId === user.value.id && r.type === reactionType
  );
};

const canDeleteFeed = (feed: LiveFeed): boolean => {
  if (!user.value) return false;
  return (
    user.value.id === feed.author?.id ||
    ["ADMIN", "FACILITATOR"].includes(user.value.role)
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

/* =========================
   METHODS
========================= */
const addFeed = () => {
  liveFeedStore.feedDialog = true;
};

const toggleSortOrder = () => {
  sortAscending.value = !sortAscending.value;
};

const toggleTypeFilter = (type: string) => {
  activeTypeFilter.value = activeTypeFilter.value === type ? null : type;
};

const togglePriorityFilter = (priority: string) => {
  activePriorityFilter.value =
    activePriorityFilter.value === priority ? null : priority;
};

const refreshFeeds = async (): Promise<void> => {
  const eventId = currentEvent.value?.id || '';
  if (!eventId || isLoading.value) return;

  try {
    isLoading.value = true;
    
    // 1. Fetch data
    await liveFeedStore.fetchFeedsByEvent(eventId, 1, 50);

    // 2. Reset filters only after successful fetch
    activeTypeFilter.value = null;
    activePriorityFilter.value = null;

    // 3. Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    showMessage("Feeds refreshed successfully", "success");
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to refresh feeds";
    showMessage(errorMsg, "error");
  } finally {
    isLoading.value = false;
  }
};

const deleteFeed = (id: string) => {
  feedToDelete.value = id;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!feedToDelete.value) return;

  try {
    isLoading.value = true;
    await liveFeedStore.deleteLiveFeed(feedToDelete.value);
    showDeleteDialog.value = false;
    feedToDelete.value = null;
    emit('feed-deleted', feedToDelete.value!);
    showMessage("Feed deleted successfully", "success");
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to delete feed";
    showMessage(errorMsg, "error");
  } finally {
    isLoading.value = false;
  }
};

const handleReaction = async (payload: {
  feedId: string;
  reactionType: string;
}) => {
  if (!user.value) return;
  
  try {
    await liveFeedStore.addReaction({
      postId: payload.feedId,
      type: payload.reactionType,
      userId: user.value.id
    });
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to add reaction";
    showMessage(errorMsg, "error");
  }
};

const togglePin = async (feedId: string) => {
  const feed = liveFeedStore.getFeedById?.(feedId);
  if (!feed) return;

  try {
    const result = await liveFeedStore.togglePinPost(feedId);
    const message = feed.isPinned ? "Feed unpinned" : "Feed pinned";
    emit('feed-pinned', feedId, result?.isPinned || false);
    showMessage(message, "success");
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to toggle pin";
    showMessage(errorMsg, "error");
  }
};

const toggleBreaking = async (feedId: string) => {
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
    const errorMsg = error.response?.data?.message || error.message || "Failed to update feed";
    showMessage(errorMsg, "error");
  }
};

const showMessage = (
  message: string,
  type: "success" | "error" | "warning" | "info"
) => {
  alertMessage.value = message;
  alertType.value = type;
  showAlert.value = true;

  setTimeout(() => {
    showAlert.value = false;
  }, 5000);
};

const joinEventRoom = async () => {
  if (!currentEvent.value?.id || liveFeedSocket.isSubscribed.value) return;

  try {
    await liveFeedSocket.joinLiveFeed(currentEvent.value.id);
  } catch (error: any) {
    console.error("Failed to join event room:", error);
    showMessage("Live updates unavailable", "warning");
  }
};

const leaveEventRoom = async () => {
  if (!currentEvent.value?.id || !liveFeedSocket.isSubscribed.value) return;

  try {
    await liveFeedSocket.leaveLiveFeed(currentEvent.value.id);
  } catch (error: any) {
    console.error("Failed to leave event room:", error);
  }
};

/* =========================
   LIFECYCLE
========================= */
onMounted(async () => {
  if (currentEvent.value?.id) {
    await refreshFeeds();
    await joinEventRoom();
  }
});

onUnmounted(() => {
  leaveEventRoom();
});

/* =========================
   WATCHERS
========================= */
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
  if (
    connected &&
    currentEvent.value?.id &&
    !liveFeedSocket.isSubscribed.value
  ) {
    joinEventRoom();
  }
});
</script>

<style scoped>
.live-feed-container {
  max-width: 100%;
  overflow-x: hidden;
}

/* Status indicator */
.status-indicator {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.05);
}

.status-live {
  background-color: rgba(211, 47, 47, 0.1);
}

.status-soon {
  background-color: rgba(46, 125, 50, 0.1);
}

.status-upcoming {
  background-color: rgba(25, 118, 210, 0.1);
}

.status-ended {
  background-color: rgba(97, 97, 97, 0.1);
}

/* Header card colors */
.header-live {
  background: linear-gradient(135deg, #fff5f5 0%, #ffebee 100%);
}

.header-soon {
  background: linear-gradient(135deg, #f0fff4 0%, #e8f5e9 100%);
}

.header-upcoming {
  background: linear-gradient(135deg, #f0f9ff 0%, #e3f2fd 100%);
}

.header-ended {
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
}

/* Feed card with left border */
.feed-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.feed-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.feed-left-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

/* Color classes for left border */
.border-primary {
  background-color: rgb(var(--v-theme-primary));
}

.border-success {
  background-color: rgb(var(--v-theme-success));
}

.border-info {
  background-color: rgb(var(--v-theme-info));
}

.border-red {
  background-color: rgb(var(--v-theme-red));
}

.border-orange {
  background-color: rgb(var(--v-theme-orange));
}

.border-green {
  background-color: rgb(var(--v-theme-green));
}

.border-grey {
  background-color: rgb(var(--v-theme-grey));
}

/* Reaction button styling */
.reaction-btn {
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .live-feed-container {
    padding: 0 8px !important;
  }

  .v-card {
    margin: 0 0 8px 0;
  }

  .d-flex.gap-2 > * {
    margin: 1px;
  }

  .feed-left-border {
    width: 3px;
  }
  
  .status-indicator {
    width: 28px;
    height: 28px;
  }
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