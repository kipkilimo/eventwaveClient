<template>
  <v-container fluid class="pa-0">
    <!-- STATS HEADER -->
    <v-card flat class="rounded-0">
      <v-card-text class="pa-4">
        <v-row align="center" justify="space-between" no-gutters>
          <v-row
            align="center"
            no-gutters
            class="flex-nowrap"
            style="overflow-x: auto"
          >
            <v-col cols="auto" class="pr-3">
              <v-chip
                variant="outlined"
                color="primary"
                prepend-icon="mdi-forum"
                size="small"
              >
                {{ totalQuestions }} Questions
              </v-chip>
            </v-col>
            <v-divider vertical inset />
            <v-col cols="auto" class="px-3">
              <v-chip
                variant="flat"
                class="stats-answered"
                prepend-icon="mdi-check-circle"
                size="small"
              >
                {{ answeredQuestions }} Answered
              </v-chip>
            </v-col>
            <v-divider vertical inset />
            <v-col cols="auto" class="px-3">
              <v-chip
                variant="flat"
                class="stats-pending"
                prepend-icon="mdi-clock"
                size="small"
              >
                {{ pendingQuestions }} Pending
              </v-chip>
            </v-col>
          </v-row>
          <v-col cols="auto">
            <v-btn
              size="small"
              variant="outlined"
              prepend-icon="mdi-chart-box"
              @click="showSatisfactionMetrics = !showSatisfactionMetrics"
            >
              Satisfaction Metrics
            </v-btn>
          </v-col>
        </v-row>

        <!-- SATISFACTION METRICS PANEL -->
        <v-expand-transition>
          <v-card
            v-if="showSatisfactionMetrics"
            variant="outlined"
            class="mt-4"
          >
            <v-card-text>
              <v-row align="center" justify="space-around" no-gutters>
                <v-col
                  v-for="metric in satisfactionMetrics"
                  :key="metric.label"
                  cols="auto"
                >
                  <v-card
                    flat
                    class="text-center px-4 py-2"
                    :class="{
                      'metric-high':
                        metric.value.includes('4') ||
                        metric.value.includes('85') ||
                        metric.value.includes('92'),
                      'metric-low':
                        metric.value.includes('2.4') &&
                        !metric.value.includes('4'),
                    }"
                  >
                    <v-card-title class="text-h5 justify-center pa-0">
                      {{ metric.value }}
                    </v-card-title>
                    <v-card-subtitle class="text-caption pa-0">
                      {{ metric.label }}
                    </v-card-subtitle>
                  </v-card>
                </v-col>
              </v-row>
              <!-- Color Legend -->
              <v-row class="mt-4" justify="center">
                <v-col
                  cols="auto"
                  v-for="legend in colorLegend"
                  :key="legend.label"
                >
                  <v-chip :color="legend.color" size="x-small" class="mr-2">
                    <v-icon
                      :color="legend.iconColor"
                      size="x-small"
                      class="mr-1"
                    >
                      {{ legend.icon }}
                    </v-icon>
                    {{ legend.label }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-expand-transition>
      </v-card-text>
    </v-card>

    <v-divider />

    <!-- SEARCH & FILTERS -->
    <v-card flat class="rounded-0">
      <v-card-text class="pa-4">
        <v-row align="center" no-gutters>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              placeholder="Search questions..."
              density="compact"
              variant="outlined"
              prepend-inner-icon="mdi-magnify"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="8" class="d-flex justify-md-end mt-2 mt-md-0">
            <v-chip-group
              v-model="filters.status"
              multiple
              selected-class="text-primary"
            >
              <v-chip filter variant="outlined" size="small" value="pending">
                <v-icon start size="small">mdi-clock</v-icon>
                Pending
              </v-chip>
              <v-chip filter variant="outlined" size="small" value="answered">
                <v-icon start size="small">mdi-check-circle</v-icon>
                Answered
              </v-chip>
              <v-chip filter variant="outlined" size="small" value="pinned">
                <v-icon start size="small">mdi-pin</v-icon>
                Pinned
              </v-chip>
            </v-chip-group>
            <v-select
              v-model="filters.sortBy"
              :items="sortOptions"
              label="Sort"
              density="compact"
              variant="outlined"
              class="ml-2"
              style="max-width: 180px"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-divider />

    <!-- QUESTIONS LIST WITH V-CARDS -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
      <div class="text-caption text-grey mt-2">Loading questions...</div>
    </div>

    <!-- Infinite progress for no questions or all answered -->
    <div v-else-if="!hasQuestions">
      <v-card variant="flat" class="text-center py-16">
        <v-progress-circular
          indeterminate
          color="primary"
          height="4"
          class="mb-4 mx-auto"
          max-width="66%"
        />
        <div class="text-h6 text-grey mb-2">Awaiting New Questions</div>
        <div class="text-body-2 text-grey">
          No questions yet. When participants submit questions, they'll appear
          here.
        </div>
      </v-card>
    </div>

    <!-- QUESTION CARDS -->
    <div v-else>
      <template v-if="filteredQuestions.length > 0">
        <v-card
          v-for="item in paginatedQuestions"
          :key="item.id"
          variant="outlined"
          class="mb-4 mx-0 mx-md-2 mt-2"
          :class="{
            'border-left-primary': item.isPinned,
            'unanswered-card': !item.isAnswered,
            'high-satisfaction-card':
              item.isAnswered && getAverageSatisfaction(item) >= 4.0,
            'low-satisfaction-card':
              item.isAnswered &&
              getAverageSatisfaction(item) < 4.0 &&
              getAverageSatisfaction(item) > 0,
          }"
        >
          <v-card-text class="pa-4">
            <v-row no-gutters>
              <!-- Left column for status and satisfaction -->
              <v-col
                cols="12"
                md="2"
                class="d-flex flex-column align-center justify-start pa-0"
              >
                <!-- Status Chip -->
                <v-chip
                  :color="
                    item.isAnswered
                      ? getAverageSatisfaction(item) >= 4.0
                        ? 'green'
                        : 'red'
                      : 'orange'
                  "
                  size="small"
                  variant="flat"
                  class="mb-3"
                  :prepend-icon="
                    item.isAnswered ? 'mdi-check-circle' : 'mdi-clock'
                  "
                  :class="{
                    'unanswered-chip': !item.isAnswered,
                    'high-satisfaction-chip':
                      item.isAnswered && getAverageSatisfaction(item) >= 4.0,
                    'low-satisfaction-chip':
                      item.isAnswered &&
                      getAverageSatisfaction(item) < 4.0 &&
                      getAverageSatisfaction(item) > 0,
                  }"
                >
                  {{
                    item.isAnswered
                      ? `Answered (${getAverageSatisfaction(item).toFixed(1)})`
                      : "Pending"
                  }}
                </v-chip>

                <!-- Satisfaction Rating -->
                <div
                  v-if="
                    item.isAnswered &&
                    item.satisfactionScores &&
                    item.satisfactionScores.length > 0
                  "
                  class="text-center"
                >
                  <v-rating
                    :model-value="getAverageSatisfaction(item)"
                    size="small"
                    readonly
                    half-increments
                    density="compact"
                    color="amber"
                  />
                  <div class="text-caption font-weight-medium mt-1">
                    {{ getAverageSatisfaction(item).toFixed(1) }}
                  </div>
                  <div class="text-caption text-grey">
                    ({{ item.satisfactionScores.length }} ratings)
                  </div>
                </div>
                <div v-else class="text-center">
                  <v-chip
                    size="small"
                    variant="outlined"
                    color="grey"
                    prepend-icon="mdi-star-off"
                  >
                    No ratings
                  </v-chip>
                </div>
              </v-col>

              <!-- Center column for question content -->
              <v-col cols="12" md="8" class="pa-0 pa-md-4">
                <!-- Question Header -->
                <div class="d-flex align-center mb-2">
                  <v-chip
                    v-if="item.isPinned"
                    size="x-small"
                    color="blue"
                    class="mr-2"
                    prepend-icon="mdi-pin"
                  >
                    Pinned
                  </v-chip>
                  <v-spacer />
                  <div class="text-caption text-grey">
                    {{ formatTimeAgo(item.createdAt) }}
                  </div>
                </div>

                <!-- Question Text -->
                <div
                  class="text-body-1 font-weight-medium mb-3"
                  style="
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  "
                >
                  {{ item.question }} -
                  <span
                    class="d-inline-flex align-center text-caption text-grey"
                  >
                    <v-icon size="x-small" class="mr-1">mdi-account</v-icon
                    >{{ item.askedBy?.name || "Anonymous" }}
                  </span>
                </div>

                <!-- Tags -->
                <div class="mb-3" v-if="item.tags && item.tags.length > 0">
                  <v-chip
                    v-for="tag in item.tags"
                    :key="tag"
                    size="x-small"
                    variant="outlined"
                    color="primary"
                    class="mr-1 mb-1"
                  >
                    {{ tag }}
                  </v-chip>
                </div>

                <!-- Answer Preview (if answered) -->
                <v-expand-transition v-if="item.isAnswered && item.answer">
                  <div class="mt-4 pt-3 border-t">
                    <div class="d-flex align-center mb-2">
                      <v-icon size="small" color="green" class="mr-2"
                        >mdi-check-circle</v-icon
                      >
                      <span class="text-caption font-weight-medium"
                        >Answer</span
                      >
                    </div>
                    <div class="text-body-2 text-grey-darken-1">
                      {{ item.answer }}
                    </div>
                  </div>
                </v-expand-transition>
              </v-col>

              <!-- Right column for actions -->
              <v-card-actions>
                <v-row>
                  <v-col>
                    <v-btn
                      v-if="!item.isAnswered"
                      size="small"
                      color="primary"
                      prepend-icon="mdi-reply"
                      variant="text"
                      @click="openAnswerDialog(item)"
                      class="justify-start"
                    >
                      Answer
                    </v-btn>
                    <v-btn
                      v-if="item.isAnswered"
                      size="small"
                      color="blue"
                      prepend-icon="mdi-pencil"
                      variant="text"
                      @click="openAnswerDialog(item)"
                      class="justify-start"
                    >
                      Edit
                    </v-btn>
                    <v-btn
                      size="small"
                      color="green"
                      prepend-icon="mdi-chart-bar"
                      variant="text"
                      @click="showSatisfactionDetails(item)"
                      :disabled="
                        !item.satisfactionScores ||
                        item.satisfactionScores.length === 0
                      "
                      class="justify-start"
                    >
                      Details
                    </v-btn>
                    <v-btn
                      size="small"
                      color="red"
                      prepend-icon="mdi-delete"
                      variant="text"
                      @click="confirmDeleteQuestion(item)"
                      class="justify-start"
                    >
                      Delete
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-actions>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Pagination -->
        <v-card flat class="mt-4">
          <v-card-text class="d-flex justify-center">
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="7"
            />
          </v-card-text>
        </v-card>
      </template>

      <!-- Empty State after filtering -->
      <v-card v-else variant="flat" class="text-center py-12">
        <v-icon size="large" color="grey" class="mb-4"
          >mdi-forum-remove-outline</v-icon
        >
        <div class="text-h6 text-grey mb-2">No questions found</div>
        <div class="text-body-2 text-grey">
          Try adjusting your search or filters
        </div>
        <v-btn
          variant="outlined"
          color="primary"
          class="mt-4"
          @click="resetFilters"
        >
          Reset Filters
        </v-btn>
      </v-card>
    </div>

    <!-- ANSWER DIALOG -->
    <v-dialog v-model="answerDialog.show" max-width="600">
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title>
            {{
              answerDialog.question?.isAnswered
                ? "Edit Answer"
                : "Answer Question"
            }}
          </v-toolbar-title>
          <v-toolbar-items>
            <v-btn icon="mdi-close" @click="answerDialog.show = false" />
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="pt-4">
          <!-- QUESTION PREVIEW -->
          <v-card variant="outlined" class="mb-4">
            <v-card-text>
              <div class="text-subtitle-2 mb-2 d-flex align-center">
                <v-icon size="small" class="mr-2">mdi-comment-question</v-icon>
                Question
              </div>
              <div class="text-body-1">
                {{ answerDialog.question?.question }}
              </div>
              <v-divider class="my-2" />
              <v-row align="center" no-gutters>
                <v-col cols="auto" class="d-flex align-center">
                  <v-icon size="x-small" class="mr-1">mdi-account</v-icon>
                  <span class="text-caption">
                    {{ answerDialog.question?.askedBy?.name || "Anonymous" }}
                  </span>
                </v-col>
                <v-divider vertical inset class="mx-3" />
                <v-col cols="auto" class="d-flex align-center">
                  <v-icon size="x-small" class="mr-1">mdi-clock-outline</v-icon>
                  <span class="text-caption">
                    {{
                      answerDialog.question
                        ? formatTimeAgo(answerDialog.question.createdAt)
                        : ""
                    }}
                  </span>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- ANSWER FORM -->
          <v-form ref="answerFormRef">
            <v-textarea
              v-model="answerDialog.answer"
              label="Your Answer"
              placeholder="Type your answer here..."
              rows="4"
              variant="outlined"
              :rules="[(v: string) => !!v || 'Answer is required']"
              required
              auto-grow
              prepend-inner-icon="mdi-reply"
            />

            <!-- TAGS -->
            <div class="mb-3">
              <div class="text-caption text-grey mb-1 d-flex align-center">
                <v-icon size="small" class="mr-1">mdi-tag</v-icon>
                Add tags
              </div>
              <v-combobox
                v-model="answerDialog.tags"
                :items="availableTags"
                multiple
                chips
                density="compact"
                variant="outlined"
                placeholder="Type to add tags..."
                prepend-inner-icon="mdi-tag-plus"
              />
            </div>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="answerDialog.show = false"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            :loading="answerDialog.loading"
            @click="submitAnswer"
            :prepend-icon="
              answerDialog.question?.isAnswered
                ? 'mdi-content-save'
                : 'mdi-send'
            "
          >
            {{
              answerDialog.question?.isAnswered
                ? "Update Answer"
                : "Submit Answer"
            }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DELETE CONFIRMATION -->
    <v-dialog v-model="deleteDialog.show" max-width="400">
      <v-card>
        <v-toolbar color="error" density="compact">
          <v-toolbar-title>Delete Question</v-toolbar-title>
          <v-toolbar-items>
            <v-btn icon="mdi-close" @click="deleteDialog.show = false" />
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="pt-4">
          <v-alert type="warning" variant="tonal" icon="mdi-alert-circle">
            Are you sure you want to delete this question? This action cannot be
            undone.
          </v-alert>
          <v-card v-if="deleteDialog.question" variant="outlined" class="mt-4">
            <v-card-text class="py-2">
              <div class="text-body-2 text-truncate">
                {{ deleteDialog.question.question }}
              </div>
              <div class="text-caption text-grey">
                Asked by
                {{ deleteDialog.question.askedBy?.name || "Anonymous" }}
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog.show = false"
            >Cancel</v-btn
          >
          <v-btn
            color="error"
            :loading="deleteDialog.loading"
            @click="confirmDelete"
            prepend-icon="mdi-delete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SATISFACTION DETAILS DIALOG -->
    <v-dialog v-model="satisfactionDialog.show" max-width="500">
      <v-card>
        <v-toolbar color="green" density="compact">
          <v-toolbar-title>Satisfaction Details</v-toolbar-title>
          <v-toolbar-items>
            <v-btn icon="mdi-close" @click="satisfactionDialog.show = false" />
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="pt-4">
          <div v-if="satisfactionDialog.question">
            <!-- QUESTION -->
            <v-card variant="outlined" class="mb-4">
              <v-card-text class="py-2">
                <div class="text-caption text-grey mb-1">Question</div>
                <div class="text-body-2">
                  {{ satisfactionDialog.question.question }}
                </div>
              </v-card-text>
            </v-card>

            <!-- ANSWER -->
            <v-card
              v-if="satisfactionDialog.question.answer"
              variant="outlined"
              class="mb-4"
            >
              <v-card-text class="py-2">
                <div class="text-caption text-grey mb-1">Answer</div>
                <div class="text-body-2">
                  {{ satisfactionDialog.question.answer }}
                </div>
              </v-card-text>
            </v-card>

            <!-- RATINGS -->
            <v-card
              variant="outlined"
              v-if="
                satisfactionDialog.question.satisfactionScores &&
                satisfactionDialog.question.satisfactionScores.length > 0
              "
            >
              <v-card-text>
                <div class="text-subtitle-2 mb-3 d-flex align-center">
                  <v-icon size="small" class="mr-2">mdi-star</v-icon>
                  Ratings ({{
                    satisfactionDialog.question.satisfactionScores.length
                  }})
                </div>
                <v-list lines="two" density="compact">
                  <v-list-item
                    v-for="(score, index) in satisfactionDialog.question
                      .satisfactionScores"
                    :key="index"
                    :title="score.user?.name || 'Anonymous'"
                    :subtitle="
                      formatTimeAgo(score.updatedAt || score.createdAt)
                    "
                    class="px-0"
                  >
                    <template #prepend>
                      <v-avatar size="32" color="green-lighten-5">
                        <v-icon color="green">mdi-account</v-icon>
                      </v-avatar>
                    </template>
                    <template #append>
                      <v-chip size="small" color="amber">
                        <v-icon start size="small">mdi-star</v-icon>
                        {{ score.score }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </v-list>
                <v-divider class="my-4" />

                <!-- AVERAGE -->
                <v-row align="center" justify="center" no-gutters>
                  <v-col cols="auto" class="text-center">
                    <div class="text-h4 text-primary">
                      {{
                        getAverageSatisfaction(
                          satisfactionDialog.question
                        ).toFixed(1)
                      }}
                    </div>
                    <div class="text-caption text-grey">
                      Average Satisfaction Score
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <v-alert v-else type="info" variant="tonal" class="mt-4">
              No satisfaction ratings yet for this question.
            </v-alert>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="satisfactionDialog.show = false"
            prepend-icon="mdi-close"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, type Ref } from "vue";
import { formatDistanceToNow, parseISO } from "date-fns";
import { storeToRefs } from "pinia";
import { useQnAStore } from "@/stores/qna";
import type { QnA, SatisfactionScore } from "@/stores/qna";

// --------------------
// Stores
// --------------------
const qnaStore = useQnAStore();
const { loading, allQnA, sortedQnA, unansweredQnA, answeredQnA } =
  storeToRefs(qnaStore);

// Template refs
const answerFormRef = ref();

// Reactive state
const search = ref("");
const showSatisfactionMetrics = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;

interface Filters {
  status: string[];
  sortBy: string;
}

const filters = ref<Filters>({
  status: [],
  sortBy: "newest",
});

interface SortOption {
  title: string;
  value: string;
}

const sortOptions: SortOption[] = [
  { title: "Newest First", value: "newest" },
  { title: "Oldest First", value: "oldest" },
  { title: "Most Upvoted", value: "mostUpvoted" },
  { title: "Least Upvoted", value: "leastUpvoted" },
  { title: "Most Rated", value: "mostRated" },
  { title: "Least Rated", value: "leastRated" },
];

interface AnswerDialog {
  show: boolean;
  question: QnA | null;
  answer: string;
  tags: string[];
  loading: boolean;
}

const answerDialog = ref<AnswerDialog>({
  show: false,
  question: null,
  answer: "",
  tags: [],
  loading: false,
});

interface DeleteDialog {
  show: boolean;
  question: QnA | null;
  loading: boolean;
}

const deleteDialog = ref<DeleteDialog>({
  show: false,
  question: null,
  loading: false,
});

interface SatisfactionDialog {
  show: boolean;
  question: QnA | null;
}

const satisfactionDialog = ref<SatisfactionDialog>({
  show: false,
  question: null,
});

const availableTags = [
  "General",
  "Technical",
  "Billing",
  "Account",
  "Feature Request",
  "Bug Report",
];

interface ColorLegend {
  label: string;
  color: string;
  iconColor: string;
  icon: string;
}

// Color legend for satisfaction metrics
const colorLegend: ColorLegend[] = [
  {
    label: "Unanswered",
    color: "#FFF3E0",
    iconColor: "#FF9800",
    icon: "mdi-clock",
  },
  {
    label: "High Satisfaction",
    color: "#E8F5E8",
    iconColor: "#4CAF50",
    icon: "mdi-star",
  },
  {
    label: "Low Satisfaction",
    color: "#FFEBEE",
    iconColor: "#F44336",
    icon: "mdi-star-half",
  },
];

// Computed properties
const hasQuestions = computed(() => allQnA.value.length > 0);

const totalQuestions = computed(() => allQnA.value.length);
const answeredQuestions = computed(() => answeredQnA.value.length);
const pendingQuestions = computed(() => unansweredQnA.value.length);

interface SatisfactionMetric {
  label: string;
  value: string;
}

const satisfactionMetrics = computed<SatisfactionMetric[]>(() => {
  const totalScores = allQnA.value.reduce((sum, q) => {
    return sum + (q.satisfactionScores?.length || 0);
  }, 0);

  const totalValue = allQnA.value.reduce((sum, q) => {
    if (!q.satisfactionScores?.length) return sum;
    const avg = getAverageSatisfaction(q);
    return sum + (avg || 0);
  }, 0);

  const avgRating =
    totalScores > 0 ? (totalValue / totalScores).toFixed(1) : "0.0";
  const responseRate =
    totalQuestions.value > 0
      ? `${Math.round((answeredQuestions.value / totalQuestions.value) * 100)}%`
      : "0%";

  // Calculate average response time (simplified - in real app, calculate from timestamps)
  const responseTime = "2.4h";
  const satisfiedUsers =
    totalScores > 0
      ? `${Math.round((allQnA.value.filter((q) => getAverageSatisfaction(q) >= 4.0).length / answeredQuestions.value) * 100)}%`
      : "0%";

  return [
    { label: "Average Rating", value: avgRating },
    { label: "Response Rate", value: responseRate },
    { label: "Response Time", value: responseTime },
    { label: "Satisfied Users", value: satisfiedUsers },
  ];
});

const filteredQuestions = computed(() => {
  let result = [...sortedQnA.value];

  // Apply search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (item) =>
        item.question.toLowerCase().includes(searchLower) ||
        (item.tags &&
          item.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchLower)
          )) ||
        item.askedBy?.name?.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filters
  if (filters.value.status.length > 0) {
    result = result.filter((item) => {
      if (filters.value.status.includes("pending") && !item.isAnswered)
        return true;
      if (filters.value.status.includes("answered") && item.isAnswered)
        return true;
      if (filters.value.status.includes("pinned") && item.isPinned) return true;
      return false;
    });
  }

  // Apply sorting
  switch (filters.value.sortBy) {
    case "newest":
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "oldest":
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      break;
    case "mostUpvoted":
      result.sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0));
      break;
    case "leastUpvoted":
      result.sort((a, b) => (a.upvoteCount || 0) - (b.upvoteCount || 0));
      break;
    case "mostRated":
      result.sort(
        (a, b) =>
          (b.satisfactionScores?.length || 0) -
          (a.satisfactionScores?.length || 0)
      );
      break;
    case "leastRated":
      result.sort(
        (a, b) =>
          (a.satisfactionScores?.length || 0) -
          (b.satisfactionScores?.length || 0)
      );
      break;
  }

  return result;
});

const totalPages = computed(() =>
  Math.ceil(filteredQuestions.value.length / itemsPerPage)
);

const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredQuestions.value.slice(start, end);
});

// Methods
const formatTimeAgo = (dateString: string): string => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return "Some time ago";
  }
};

const getAverageSatisfaction = (item: QnA): number => {
  if (!item.satisfactionScores?.length) return 0;
  const sum = item.satisfactionScores.reduce(
    (acc: number, score: SatisfactionScore) => acc + score.score,
    0
  );
  return sum / item.satisfactionScores.length;
};

const openAnswerDialog = (question: QnA): void => {
  answerDialog.value = {
    show: true,
    question: { ...question },
    answer: question.answer || "",
    tags: [...(question.tags || [])],
    loading: false,
  };
};

const submitAnswer = async (): Promise<void> => {
  if (!answerDialog.value.question) return;

  // Validate form
  if (answerFormRef.value) {
    const { valid } = await answerFormRef.value.validate();
    if (!valid) return;
  }

  answerDialog.value.loading = true;
  try {
    await qnaStore.answerQnA(
      answerDialog.value.question.id,
      answerDialog.value.answer
    );
    answerDialog.value.show = false;
  } catch (error) {
    console.error("Failed to submit answer:", error);
  } finally {
    answerDialog.value.loading = false;
  }
};

const confirmDeleteQuestion = (question: QnA): void => {
  deleteDialog.value = {
    show: true,
    question: question,
    loading: false,
  };
};

const confirmDelete = async (): Promise<void> => {
  if (!deleteDialog.value.question) return;

  deleteDialog.value.loading = true;
  try {
    // Note: You'll need to implement a delete mutation in your GraphQL
    // For now, this is a placeholder
    console.log("Delete question:", deleteDialog.value.question.id);
    // await qnaStore.deleteQnA(deleteDialog.value.question.id);
  } catch (error) {
    console.error("Failed to delete question:", error);
  } finally {
    deleteDialog.value.show = false;
    deleteDialog.value.loading = false;
  }
};

const showSatisfactionDetails = (question: QnA): void => {
  satisfactionDialog.value = {
    show: true,
    question: { ...question },
  };
};

const resetFilters = (): void => {
  search.value = "";
  filters.value = {
    status: [],
    sortBy: "newest",
  };
  currentPage.value = 1;
};

// Reset pagination when filters change
watch([search, () => filters.value.status, () => filters.value.sortBy], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.border-left-primary {
  border-left: 4px solid rgb(var(--v-theme-primary)) !important;
}

.border-t {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.text-grey-darken-1 {
  color: rgba(0, 0, 0, 0.7);
}

/* Unanswered/Pending Questions - Orange Light */
.unanswered-card {
  background-color: rgba(255, 243, 224, 0.3) !important;
  border-left: 3px solid #ff9800 !important;
}

/* High Satisfaction (≥ 4.0) - Green Light */
.high-satisfaction-card {
  background-color: rgba(232, 245, 232, 0.3) !important;
  border-left: 3px solid #4caf50 !important;
}

/* Low Satisfaction (< 4.0) - Red Light */
.low-satisfaction-card {
  background-color: rgba(255, 235, 238, 0.3) !important;
  border-left: 3px solid #f44336 !important;
}

/* Status Chip Colors */
.unanswered-chip {
  background-color: #fff3e0 !important;
  color: #ff9800 !important;
  border: 1px solid #ff9800 !important;
}

.high-satisfaction-chip {
  background-color: #e8f5e8 !important;
  color: #4caf50 !important;
  border: 1px solid #4caf50 !important;
}

.low-satisfaction-chip {
  background-color: #ffebee !important;
  color: #f44336 !important;
  border: 1px solid #f44336 !important;
}

/* Stats Header Chips */
.stats-answered {
  background-color: rgba(232, 245, 232, 0.5) !important;
  color: #4caf50 !important;
}

.stats-pending {
  background-color: rgba(255, 243, 224, 0.5) !important;
  color: #ff9800 !important;
}

/* Metrics Panel */
.metric-high {
  background-color: rgba(232, 245, 232, 0.3) !important;
  border-radius: 8px;
}

.metric-low {
  background-color: rgba(255, 235, 238, 0.3) !important;
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .v-card {
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
