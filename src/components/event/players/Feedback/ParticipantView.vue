<template>
  <v-container fluid class="pa-4">
    <!-- Loading Overlay -->
    <v-overlay :model-value="isLoading" class="align-center justify-center">
      <v-progress-circular indeterminate size="64" color="orange" />
    </v-overlay>

    <!-- No Feedback -->
    <v-card v-if="!isLoading && feedbacks.length === 0" class="my-6">
      <v-card-text class="text-center py-12">
        <v-icon size="64" color="grey-lighten-1" class="mb-4"
          >mdi-clipboard-text-outline</v-icon
        >
        <div class="text-h6 text-grey mb-2">No Active Feedbacks</div>
        <p class="text-grey">No feedback forms are available currently.</p>
        <v-btn color="orange" class="mt-4" @click="fetchActiveFeedback">
          <v-icon left>mdi-refresh</v-icon> Refresh
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Feedbacks -->
    <v-card
      v-else-if="!isLoading"
      v-for="(feedback, fIndex) in feedbacks"
      :key="feedback.id"
      v-show="fIndex === selectedIndex"
      class="mb-6"
      elevation="2"
    >
      <!-- Header -->
      <v-card-title
        class="d-flex flex-column flex-sm-row justify-space-between align-start pa-4"
      >
        <div class="mb-2 mb-sm-0">
          <div class="text-h6 font-weight-bold">{{ feedback.title }}</div>
          <div class="text-caption text-grey mt-1">
            {{ feedback.description || "Provide your feedback" }}
          </div>
          <div class="text-caption mt-1">Target: {{ feedback.targetType }}</div>
        </div>
        <v-chip
          :color="feedback.isAnonymous ? 'grey' : 'blue'"
          size="small"
          class="ml-auto mt-2 mt-sm-0"
        >
          <v-icon left small>{{
            feedback.isAnonymous ? "mdi-incognito" : "mdi-account"
          }}</v-icon>
          {{ feedback.isAnonymous ? "Anonymous" : "Identified" }}
        </v-chip>
      </v-card-title>

      <!-- Progress -->
      <v-card-text class="pa-4 pt-0">
        <div class="d-flex justify-space-between mb-2 flex-wrap">
          <span class="text-caption">Progress</span>
          <span class="text-caption font-weight-medium">
            {{ answeredCount(feedback.id) }} / {{ feedback.questions.length }}
          </span>
        </div>
        <v-progress-linear
          :model-value="progress[feedback.id]"
          color="orange"
          height="8"
          rounded
        />
      </v-card-text>

      <v-divider />

      <!-- Questions -->
      <v-card-text class="pa-4">
        <div v-if="currentQuestion">
          <component
            :is="questionComponent(currentQuestion.type)"
            :question="currentQuestion"
            :fid="currentFeedback.id"
            :qIndex="currentIndex"
            v-model="responses[currentFeedback.id][currentIndex]"
            @matrix-change="handleMatrixResponse"
            @multi-change="handleMultiChoice"
          />
          <!-- Centered Navigation -->
          <div
            class="d-flex justify-center align-center mt-4 flex-wrap gap-4"
          >
            <v-btn icon :disabled="currentIndex <= 0" @click="prevQuestion">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <span class="text-caption">{{ currentIndex + 1 }} / {{ currentFeedback.questions.length }}</span>
            <v-btn icon :disabled="currentIndex >= currentFeedback.questions.length - 1" @click="nextQuestion">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- All Questions View -->
        <div v-else>
          <component
            v-for="(q, qi) in currentFeedback.questions"
            :key="q.id"
            :is="questionComponent(q.type)"
            :question="q"
            :fid="currentFeedback.id"
            :qIndex="qi"
            v-model="responses[currentFeedback.id][qi]"
            @matrix-change="handleMatrixResponse"
            @multi-change="handleMultiChoice"
          />
        </div>
      </v-card-text>

      <!-- Submit -->
      <v-card-actions class="pa-4 justify-center">
        <v-btn
          color="orange"
          block
          class="mx-auto"
          :disabled="!canSubmit(currentFeedback.id)"
          @click="submitCurrentFeedback"
          :isLoading="submitting"
        >
          <v-icon left>mdi-send-check</v-icon> Submit
        </v-btn>
      </v-card-actions>

      <!-- Validation -->
      <v-card-text v-if="!canSubmit(currentFeedback.id)" class="pa-4 pt-0 text-center">
        <div class="text-caption text-grey mt-1">
          {{ remainingRequired(currentFeedback.id) }} required remaining
        </div>
      </v-card-text>
    </v-card>

    <!-- Completion Dialog -->
    <v-dialog v-model="showCompletion" max-width="400">
      <v-card>
        <v-card-text class="pa-6 text-center">
          <v-icon size="64" color="green" class="mb-4">mdi-check-circle</v-icon>
          <div class="text-h5 mb-2">Thank You!</div>
          <p class="text-grey mb-4">
            Your feedback has been submitted successfully.
          </p>
          <v-btn color="primary" @click="showCompletion = false">Close</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onBeforeMount, watch } from "vue";
import { useFeedbackStore } from "@/stores/feedback";

// -----------------------------
// Store
// -----------------------------
const feedbackStore = useFeedbackStore();
const { 
  submitting,
  feedbacks,
  currentFeedback,
  fetchFeedback,
  submitFeedback: submitFeedbackAction,
  fetchFeedbacks,
} = feedbackStore;
const isLoading=ref(false)
// -----------------------------
// State
// -----------------------------
const selectedIndex = ref(0);
const currentIndex = ref(0);
const responses = reactive({});
const progress = reactive({});
const showCompletion = ref(false);

// -----------------------------
// Computed
// -----------------------------
const activeFeedback = computed(() => feedbacks.find(f => f.status === "ACTIVE") || null);
const currentQuestion = computed(() => currentFeedback?.questions[currentIndex.value]);

// -----------------------------
// Helpers
// -----------------------------
const initializeResponses = () => {
  feedbacks.forEach(f => {
    if (!responses[f.id]) {
      responses[f.id] = f.questions.map(q => {
        if (q.type === "LIKERT_SCALE") return Array(q.items?.length || 0).fill(undefined);
        if (q.type === "MULTI_CHOICE") return [];
        return undefined;
      });
    }
    progress[f.id] = 0;
  });
};

const updateProgress = (fid: string) => {
  const f = feedbacks.find(f => f.id === fid);
  if (f) progress[fid] = Math.round((answeredCount(fid) / f.questions.length) * 100);
};

const answeredCount = (fid: string) => {
  const res = responses[fid] || [];
  return res.filter(r => {
    if (Array.isArray(r)) return r.length && r.every(v => v != null);
    return r != null && r !== "" && r !== false && r !== true;
  }).length;
};

const canSubmit = (fid: string) => {
  const f = feedbacks.find(f => f.id === fid);
  if (!f) return false;
  return f.questions.every((q, i) => {
    const r = responses[fid][i];
    if (!q.isRequired) return true;
    if (Array.isArray(r)) return r.length && r.every(v => v != null);
    return r != null && r !== "" && r !== false && r !== true;
  });
};

const remainingRequired = (fid: string) => {
  const f = feedbacks.find(f => f.id === fid);
  if (!f) return 0;
  return f.questions.filter((q, i) => {
    const r = responses[f.id][i];
    if (!q.isRequired) return false;
    if (Array.isArray(r)) return r.length === 0 || r.some(v => v == null);
    return r == null || r === "" || r === false || r === true;
  }).length;
};

// -----------------------------
// Response handlers
// -----------------------------
const handleResponse = (fid: string, qIndex: number, value: any) => {
  responses[fid][qIndex] = value;
  updateProgress(fid);
};

const handleMatrixResponse = (fid: string, qIndex: number, itemIndex: number, value: any) => {
  if (!responses[fid][qIndex]) responses[fid][qIndex] = [];
  responses[fid][qIndex][itemIndex] = value;
  updateProgress(fid);
};

const handleMultiChoice = (fid: string, qIndex: number, option: string, checked: boolean) => {
  if (!responses[fid][qIndex]) responses[fid][qIndex] = [];
  if (checked) {
    if (!responses[fid][qIndex].includes(option)) responses[fid][qIndex].push(option);
  } else {
    const idx = responses[fid][qIndex].indexOf(option);
    if (idx > -1) responses[fid][qIndex].splice(idx, 1);
  }
  updateProgress(fid);
};

// -----------------------------
// Navigation
// -----------------------------
const prevQuestion = () => { if (currentIndex.value > 0) currentIndex.value--; };
const nextQuestion = () => { if (currentFeedback && currentIndex.value < currentFeedback.questions.length - 1) currentIndex.value++; };

// -----------------------------
// Submit
// -----------------------------
const submitCurrentFeedback = async () => {
  if (!currentFeedback || !canSubmit(currentFeedback.id)) return;
  try {
    await submitFeedbackAction({
      feedbackId: currentFeedback.id,
      answers: responses[currentFeedback.id],
    });
    showCompletion.value = true;
    initializeResponses();
    currentIndex.value = 0;
  } catch (err) {
    console.error(err);
  }
};

// -----------------------------
// Question component mapper
// -----------------------------
const questionComponent = (type: string) => {
  switch(type) {
    case "LIKERT_SCALE": return "MatrixLikertQuestion";
    case "SINGLE_CHOICE": return "SingleChoiceQuestion";
    case "MULTI_CHOICE": return "MultiChoiceQuestion";
    case "FREE_TEXT": return "FreeTextQuestion";
    case "BOOLEAN": return "BooleanQuestion";
    case "NPS": return "NpsQuestion";
    default: return "UnsupportedQuestion";
  }
};

// -----------------------------
// Fetch active feedback
// -----------------------------
const fetchActiveFeedback = async () => {
  try {
    isLoading.value = true;
    await fetchFeedbacks();
    if (activeFeedback.value) await fetchFeedback(activeFeedback.value.id);
    initializeResponses();
  } finally { isLoading.value = false; }
};

onBeforeMount(fetchActiveFeedback);
watch(feedbacks, () => initializeResponses());
</script>

<style scoped>
.v-simple-table { overflow-x: auto; }
.gap-4 { gap: 16px; }

/* Responsive adjustments */
@media (max-width: 600px) {
  .v-card-title { flex-direction: column !important; }
  .v-chip { margin-top: 8px !important; }
  .d-flex.justify-center { flex-direction: column !important; gap: 8px; }
}
</style>
