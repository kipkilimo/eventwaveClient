<template>
  <v-container class="py-6">
    <v-card class="pa-6" elevation="3">
      <v-card-title class="text-h5 font-weight-bold">
        {{ editingFeed ? "Edit Live Feed" : "Create Live Feed" }} :
        {{ eventStore.currentEvent?.title }}
      </v-card-title>

      <v-divider class="my-3" />

      <v-form ref="feedForm" v-model="formValid">
        <v-row dense>
          <v-col cols="12">
            <v-textarea
              v-model="formData.content"
              label="Content"
              rows="5"
              auto-grow
              required
              placeholder="What's happening?"
              :rules="[(v) => !!v || 'Content is required']"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-select
              v-model="formData.type"
              :items="feedTypes"
              label="Type"
              required
              :rules="[(v) => !!v || 'Type is required']"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-select
              v-model="formData.priority"
              :items="feedPriorities"
              label="Priority"
              required
              :rules="[(v) => !!v || 'Priority is required']"
            />
          </v-col>

          <v-col cols="12">
            <v-switch
              v-model="formData.isPinned"
              label="Pin this feed"
              color="blue"
              inset
            />
          </v-col>

          <v-col cols="12">
            <v-switch
              v-model="formData.isBreaking"
              label="Mark as Breaking News"
              color="red"
              inset
            />
          </v-col>
        </v-row>

        <div class="mt-6 d-flex justify-end">
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!formValid"
            :loading="saving"
            @click="submitBasicFeed"
          >
            {{ editingFeed ? "Update Feed" : "Publish Live Feed" }}
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";

// Stores
import { useLiveFeedStore } from "@/stores/livefeed";
import { useUserStore } from "@/stores/user";
import { useEventStore } from "@/stores/event";

// Local Enums (Hard-coded to replace external imports)
const LiveFeedPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

const LiveFeedType = {
  TEXT: "TEXT",
  ANNOUNCEMENT: "ANNOUNCEMENT",
  UPDATE: "UPDATE",
} as const;

type LiveFeedPriority = (typeof LiveFeedPriority)[keyof typeof LiveFeedPriority];
type LiveFeedType = (typeof LiveFeedType)[keyof typeof LiveFeedType];

// Emits
const emit = defineEmits<{
  (e: "created", feed: any): void;
  (e: "saved", feed: any): void;
}>();

// Props
const props = defineProps<{
  editingFeed?: any;
}>();

// Stores
const liveFeedStore = useLiveFeedStore();
const userStore = useUserStore();
const eventStore = useEventStore();

// Select options
const feedTypes = [
  { title: "Text", value: LiveFeedType.TEXT },
  { title: "Announcement", value: LiveFeedType.ANNOUNCEMENT },
  { title: "Update", value: LiveFeedType.UPDATE },
];

const feedPriorities = [
  { title: "Low", value: LiveFeedPriority.LOW },
  { title: "Medium", value: LiveFeedPriority.MEDIUM },
  { title: "High", value: LiveFeedPriority.HIGH },
];

// Form state
const formData = ref({
  content: "",
  type: LiveFeedType.TEXT as LiveFeedType,
  priority: LiveFeedPriority.MEDIUM as LiveFeedPriority,
  isPinned: false,
  isBreaking: false,
});

const formValid = ref(false);
const feedForm = ref<any>(null);
const saving = ref(false);

// Computed
const currentUser = computed(() => userStore.user);
const currentEvent = computed(() => eventStore.currentEvent);

/* ---------------------------
   LOAD EDIT MODE
---------------------------- */
watch(
  () => props.editingFeed,
  (feed) => {
    if (!feed) return;

    formData.value = {
      content: feed.content ?? "",
      type: feed.type ?? LiveFeedType.TEXT,
      priority: feed.priority ?? LiveFeedPriority.MEDIUM,
      isPinned: feed.isPinned ?? false,
      isBreaking: feed.isBreaking ?? false,
    };
  },
  { immediate: true }
);

/* ---------------------------
   SUBMIT
---------------------------- */
const submitBasicFeed = async () => {
  const { valid } = await feedForm.value?.validate();
  if (!valid) return;

  if (!currentEvent.value?.id || !currentUser.value?.id) {
    console.error("Missing event or user.");
    return;
  }

  saving.value = true;

  const payload = {
    content: formData.value.content,
    type: formData.value.type,
    priority: formData.value.priority,
    isBreaking: formData.value.isBreaking,
    event: currentEvent.value.id,
    author: currentUser.value.id,
  };

  try {
    let result;

    if (props.editingFeed) {
      result = await liveFeedStore.updateLiveFeed(
        props.editingFeed.id,
        payload
      );

      // Handle Pin state change via separate mutation
      if (formData.value.isPinned !== props.editingFeed.isPinned) {
        await liveFeedStore.togglePinPost(props.editingFeed.id);
      }

      emit("saved", result);
    } else {
      result = await liveFeedStore.createLiveFeed(payload);

      // Pin newly created post if set
      if (formData.value.isPinned) {
        // Need ID from creation result
        await liveFeedStore.togglePinPost(result.id);
      }

      emit("created", result);
      resetForm();
    }
  } catch (err) {
    console.error("Failed to save live feed:", err);
  } finally {
    saving.value = false;
    liveFeedStore.feedDialog = false;
  }
};

/* ---------------------------
   RESET
---------------------------- */
const resetForm = () => {
  formData.value = {
    content: "",
    type: LiveFeedType.TEXT,
    priority: LiveFeedPriority.MEDIUM,
    isPinned: false,
    isBreaking: false,
  };

  feedForm.value?.reset();
};
</script>

<style scoped>
/* Optional subtle spacing polish */
.v-card-title {
  line-height: 1.3;
}

@media (max-width: 600px) {
  .v-card {
    border-radius: 12px;
  }
}
</style>