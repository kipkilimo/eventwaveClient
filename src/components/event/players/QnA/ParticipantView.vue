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
            <!-- Ask Question Button - Always visible for participants -->
            <v-btn
              size="small"
              variant="flat"
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateQuestionDialog"
            >
              Ask a Question
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
                      'metric-high': metric.value.includes('4') || metric.value.includes('85') || metric.value.includes('92'),
                      'metric-low': metric.value.includes('2.4') && !metric.value.includes('4')
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
                <v-col cols="auto" v-for="legend in colorLegend" :key="legend.label">
                  <v-chip :color="legend.color" size="x-small" class="mr-2">
                    <v-icon :color="legend.iconColor" size="x-small" class="mr-1">
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

    <!-- Infinite progress for no questions -->
    <div v-else-if="!hasQuestions">
      <v-card variant="flat" class="text-center py-16">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
          class="mb-4"
        />
        <div class="text-h6 text-grey mb-2">Be the First to Ask!</div>
        <div class="text-body-2 text-grey mb-4">
          No questions yet. Start the conversation by asking the first question.
        </div>
        <v-btn
          size="small"
          variant="flat"
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateQuestionDialog"
        >
          Ask a Question
        </v-btn>
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
            'high-satisfaction-card': item.isAnswered && getAverageSatisfaction(item) >= 4.0,
            'low-satisfaction-card': item.isAnswered && getAverageSatisfaction(item) < 4.0 && getAverageSatisfaction(item) > 0,
            'my-question': isMyQuestion(item)
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
                  :color="item.isAnswered ? 
                    (getAverageSatisfaction(item) >= 4.0 ? 'green' : 'red') : 'orange'"
                  size="small"
                  variant="flat"
                  class="mb-3"
                  :prepend-icon="item.isAnswered ? 'mdi-check-circle' : 'mdi-clock'"
                  :class="{
                    'unanswered-chip': !item.isAnswered,
                    'high-satisfaction-chip': item.isAnswered && getAverageSatisfaction(item) >= 4.0,
                    'low-satisfaction-chip': item.isAnswered && getAverageSatisfaction(item) < 4.0 && getAverageSatisfaction(item) > 0
                  }"
                >
                  {{ item.isAnswered ? 
                    `Answered (${getAverageSatisfaction(item).toFixed(1)})` : "Pending" }}
                </v-chip>

                <!-- Satisfaction Rating -->
                <div
                  v-if="item.isAnswered && item.satisfactionScores && item.satisfactionScores.length > 0"
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
                <div v-else-if="item.isAnswered" class="text-center">
                  <v-chip
                    size="small"
                    variant="outlined"
                    color="grey"
                    prepend-icon="mdi-star-off"
                  >
                    No ratings
                  </v-chip>
                </div>

                <!-- My Question Indicator -->
                <v-chip
                  v-if="isMyQuestion(item)"
                  size="x-small"
                  color="blue"
                  variant="flat"
                  class="mt-2"
                  prepend-icon="mdi-account"
                >
                  My Question
                </v-chip>
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
                  <v-chip
                    v-if="item.isAnonymous"
                    size="x-small"
                    variant="outlined"
                    color="grey"
                    class="mr-2"
                    prepend-icon="mdi-incognito"
                  >
                    Anonymous
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
                  {{ item.question }}
                  <span
                    class="d-inline-flex align-center text-caption text-grey ml-2"
                  >
                    <v-icon size="x-small" class="mr-1">mdi-account</v-icon
                    >{{ item.askedBy?.name || 'Anonymous' }}
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

                <!-- Upvotes -->
                <div class="d-flex align-center mb-3">
                  <v-btn
                    size="x-small"
                    :color="hasUpvoted(item) ? 'primary' : 'grey'"
                    variant="text"
                    :prepend-icon="hasUpvoted(item) ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'"
                    @click="toggleUpvote(item)"
                    :loading="upvoteLoading[item.id]"
                    :disabled="isMyQuestion(item)"
                  >
                    {{ item.upvoteCount || 0 }}
                  </v-btn>
                  <span class="text-caption text-grey ml-2">
                    {{ item.upvoteCount === 1 ? 'upvote' : 'upvotes' }}
                  </span>
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
                      <span class="text-caption text-grey ml-2">
                        by {{ item.answeredBy?.name || 'Facilitator' }}
                      </span>
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
                    <!-- Rate Answer Button (only for answered questions) -->
                    <v-btn
                      v-if="item.isAnswered"
                      size="small"
                      color="amber"
                      prepend-icon="mdi-star"
                      variant="text"
                      @click="openRateAnswerDialog(item)"
                      :disabled="hasRated(item)"
                      class="justify-start"
                    >
                      {{ hasRated(item) ? 'Already Rated' : 'Rate Answer' }}
                    </v-btn>
                    
                    <!-- Satisfaction Details Button -->
                    <v-btn
                      size="small"
                      color="green"
                      prepend-icon="mdi-chart-bar"
                      variant="text"
                      @click="showSatisfactionDetails(item)"
                      :disabled="!item.satisfactionScores || item.satisfactionScores.length === 0"
                      class="justify-start"
                    >
                      Details
                    </v-btn>
                    
                    <!-- Delete Button (only for my questions) -->
                    <v-btn
                      v-if="isMyQuestion(item)"
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
          Try adjusting your search or filters, or ask a new question
        </div>
        <v-btn
          variant="outlined"
          color="primary"
          class="mt-4"
          @click="resetFilters"
        >
          Reset Filters
        </v-btn>
        <v-btn
          variant="flat"
          color="primary"
          class="mt-4 ml-2"
          prepend-icon="mdi-plus"
          @click="openCreateQuestionDialog"
        >
          Ask a Question
        </v-btn>
      </v-card>
    </div>

    <!-- CREATE QUESTION DIALOG -->
    <v-dialog v-model="createQuestionDialog.show" max-width="600">
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title>Ask a Question</v-toolbar-title>
          <v-toolbar-items>
            <v-btn icon="mdi-close" @click="createQuestionDialog.show = false" />
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="pt-4">
          <v-form ref="createQuestionForm">
            <!-- Question Input -->
            <v-textarea
              v-model="createQuestionDialog.question"
              label="Your Question"
              placeholder="Type your question here..."
              rows="4"
              variant="outlined"
              :rules="[(v) => !!v || 'Question is required']"
              required
              auto-grow
              prepend-inner-icon="mdi-comment-question"
            />

            <!-- Tags -->
            <div class="mb-3">
              <div class="text-caption text-grey mb-1 d-flex align-center">
                <v-icon size="small" class="mr-1">mdi-tag</v-icon>
                Add tags (optional)
              </div>
              <v-combobox
                v-model="createQuestionDialog.tags"
                :items="availableTags"
                multiple
                chips
                density="compact"
                variant="outlined"
                placeholder="Type to add tags..."
                prepend-inner-icon="mdi-tag-plus"
              />
            </div>

            <!-- Anonymous Toggle -->
            <v-switch
              v-model="createQuestionDialog.isAnonymous"
              label="Post anonymously"
              color="primary"
              density="compact"
              hide-details
            />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="createQuestionDialog.show = false"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            :loading="createQuestionDialog.loading"
            @click="submitQuestion"
            prepend-icon="mdi-send"
          >
            Submit Question
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- RATE ANSWER DIALOG -->
    <v-dialog v-model="rateAnswerDialog.show" max-width="400">
      <v-card>
        <v-toolbar color="amber" density="compact">
          <v-toolbar-title>Rate This Answer</v-toolbar-title>
          <v-toolbar-items>
            <v-btn icon="mdi-close" @click="rateAnswerDialog.show = false" />
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="pt-4">
          <div v-if="rateAnswerDialog.question">
            <!-- Question Preview -->
            <v-card variant="outlined" class="mb-4">
              <v-card-text class="py-2">
                <div class="text-caption text-grey mb-1">Question</div>
                <div class="text-body-2">
                  {{ rateAnswerDialog.question.question }}
                </div>
              </v-card-text>
            </v-card>

            <!-- Answer Preview -->
            <v-card variant="outlined" class="mb-4">
              <v-card-text class="py-2">
                <div class="text-caption text-grey mb-1">Answer</div>
                <div class="text-body-2">
                  {{ rateAnswerDialog.question.answer }}
                </div>
              </v-card-text>
            </v-card>

            <!-- Rating Input -->
            <div class="text-center">
              <div class="text-subtitle-2 mb-2">How satisfied are you with this answer?</div>
              <v-rating
                v-model="rateAnswerDialog.rating"
                size="large"
                color="amber"
                half-increments
                hover
                :length="5"
              />
              <div class="text-caption text-grey mt-2">
                {{ getRatingLabel(rateAnswerDialog.rating) }}
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="rateAnswerDialog.show = false"
            >Cancel</v-btn
          >
          <v-btn
            color="amber"
            :loading="rateAnswerDialog.loading"
            @click="submitRating"
            prepend-icon="mdi-star"
            :disabled="!rateAnswerDialog.rating || rateAnswerDialog.rating === 0"
          >
            Submit Rating
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
            Are you sure you want to delete your question? This action cannot be
            undone.
          </v-alert>
          <v-card v-if="deleteDialog.question" variant="outlined" class="mt-4">
            <v-card-text class="py-2">
              <div class="text-body-2 text-truncate">
                {{ deleteDialog.question.question }}
              </div>
              <div class="text-caption text-grey">
                Asked by {{ deleteDialog.question.askedBy?.name || 'Anonymous' }}
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
            <v-card variant="outlined" v-if="satisfactionDialog.question.satisfactionScores && satisfactionDialog.question.satisfactionScores.length > 0">
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
                    :title="score.user.name"
                    :subtitle="formatTimeAgo(score.updatedAt)"
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
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { formatDistanceToNow, parseISO } from "date-fns";
import { storeToRefs } from "pinia";
import { useQnAStore } from "@/stores/qna";
import type { QnA } from "@/stores/qna";
import { useUserStore } from "@/stores/user"; // Assuming you have an auth store

// --------------------
// Stores
// --------------------
const qnaStore = useQnAStore();
const authStore = useUserStore(); // For getting current user info
const { loading, allQnA, sortedQnA, unansweredQnA, answeredQnA } = storeToRefs(qnaStore);

// Get current user ID (you'll need to implement this in your auth store)
const currentUserId = computed(() => authStore.user?.id || null);

// Reactive state
const search = ref("");
const showSatisfactionMetrics = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;
const upvoteLoading = ref<Record<string, boolean>>({});

const filters = ref({
  status: [] as string[],
  sortBy: "newest",
});

const sortOptions = [
  { title: "Newest First", value: "newest" },
  { title: "Oldest First", value: "oldest" },
  { title: "Most Upvoted", value: "mostUpvoted" },
  { title: "Least Upvoted", value: "leastUpvoted" },
  { title: "Most Rated", value: "mostRated" },
  { title: "Least Rated", value: "leastRated" },
];

// Dialogs
const createQuestionDialog = ref({
  show: false,
  question: "",
  tags: [] as string[],
  isAnonymous: false,
  loading: false,
});

const rateAnswerDialog = ref({
  show: false,
  question: null as QnA | null,
  rating: 0,
  loading: false,
});

const deleteDialog = ref({
  show: false,
  question: null as QnA | null,
  loading: false,
});

const satisfactionDialog = ref({
  show: false,
  question: null as QnA | null,
});

const availableTags = [
  "General",
  "Technical",
  "Billing",
  "Account",
  "Feature Request",
  "Bug Report",
];

// Color legend for satisfaction metrics
const colorLegend = [
  { label: 'Unanswered', color: '#FFF3E0', iconColor: '#FF9800', icon: 'mdi-clock' },
  { label: 'High Satisfaction', color: '#E8F5E8', iconColor: '#4CAF50', icon: 'mdi-star' },
  { label: 'Low Satisfaction', color: '#FFEBEE', iconColor: '#F44336', icon: 'mdi-star-half' },
];

// Computed properties
const hasQuestions = computed(() => allQnA.value.length > 0);

const totalQuestions = computed(() => allQnA.value.length);
const answeredQuestions = computed(() => answeredQnA.value.length);
const pendingQuestions = computed(() => unansweredQnA.value.length);

const satisfactionMetrics = computed(() => {
  const totalScores = allQnA.value.reduce((sum, q) => {
    return sum + (q.satisfactionScores?.length || 0);
  }, 0);
  
  const totalValue = allQnA.value.reduce((sum, q) => {
    if (!q.satisfactionScores?.length) return sum;
    const avg = getAverageSatisfaction(q);
    return sum + (avg || 0);
  }, 0);
  
  const avgRating = totalScores > 0 ? (totalValue / totalScores).toFixed(1) : "0.0";
  const responseRate = totalQuestions.value > 0 
    ? `${Math.round((answeredQuestions.value / totalQuestions.value) * 100)}%` 
    : "0%";
  
  // Calculate average response time (simplified - in real app, calculate from timestamps)
  const responseTime = "2.4h";
  const satisfiedUsers = totalScores > 0 
    ? `${Math.round((allQnA.value.filter(q => getAverageSatisfaction(q) >= 4.0).length / answeredQuestions.value) * 100)}%`
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
        (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(searchLower))) ||
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
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case "oldest":
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case "mostUpvoted":
      result.sort((a, b) => b.upvoteCount - a.upvoteCount);
      break;
    case "leastUpvoted":
      result.sort((a, b) => a.upvoteCount - b.upvoteCount);
      break;
    case "mostRated":
      result.sort(
        (a, b) => (b.satisfactionScores?.length || 0) - (a.satisfactionScores?.length || 0)
      );
      break;
    case "leastRated":
      result.sort(
        (a, b) => (a.satisfactionScores?.length || 0) - (b.satisfactionScores?.length || 0)
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
const formatTimeAgo = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return "Some time ago";
  }
};

const getAverageSatisfaction = (item: QnA) => {
  if (!item.satisfactionScores?.length) return 0;
  const sum = item.satisfactionScores.reduce(
    (acc, score) => acc + score.score,
    0
  );
  return sum / item.satisfactionScores.length;
};

const isMyQuestion = (item: QnA): boolean => {
  if (!currentUserId.value) return false;
  return item.askedBy?.id === currentUserId.value;
};

const hasUpvoted = (item: QnA): boolean => {
  if (!currentUserId.value || !item.upvotes) return false;
  return item.upvotes.some(user => user.id === currentUserId.value);
};

const hasRated = (item: QnA): boolean => {
  if (!currentUserId.value || !item.satisfactionScores) return false;
  return item.satisfactionScores.some(score => score.user.id === currentUserId.value);
};

const getRatingLabel = (rating: number): string => {
  const labels = [
    "Very Dissatisfied",
    "Dissatisfied",
    "Neutral",
    "Satisfied",
    "Very Satisfied"
  ];
  const index = Math.floor(rating) - 1;
  return index >= 0 && index < labels.length ? labels[index] : "No rating";
};

// Action methods
const openCreateQuestionDialog = () => {
  createQuestionDialog.value = {
    show: true,
    question: "",
    tags: [],
    isAnonymous: false,
    loading: false,
  };
};

const submitQuestion = async () => {
  if (!createQuestionDialog.value.question.trim()) return;
  
  createQuestionDialog.value.loading = true;
  try {
    // Get current event ID (you'll need to get this from your event store)
    const eventId = ""; // TODO: Get current event ID
    
    await qnaStore.createQnA({
      event: eventId,
      question: createQuestionDialog.value.question,
      tags: createQuestionDialog.value.tags,
      isAnonymous: createQuestionDialog.value.isAnonymous,
    });
    
    createQuestionDialog.value.show = false;
    // Reset form
    createQuestionDialog.value.question = "";
    createQuestionDialog.value.tags = [];
    createQuestionDialog.value.isAnonymous = false;
  } catch (error) {
    console.error("Failed to submit question:", error);
  } finally {
    createQuestionDialog.value.loading = false;
  }
};

const toggleUpvote = async (question: QnA) => {
  if (isMyQuestion(question)) return; // Don't allow upvoting own questions
  
  upvoteLoading.value[question.id] = true;
  try {
    await qnaStore.toggleUpvote(question.id);
  } catch (error) {
    console.error("Failed to toggle upvote:", error);
  } finally {
    upvoteLoading.value[question.id] = false;
  }
};

const openRateAnswerDialog = (question: QnA) => {
  if (hasRated(question)) return; // Don't open if already rated
  
  rateAnswerDialog.value = {
    show: true,
    question: { ...question },
    rating: 0,
    loading: false,
  };
};

const submitRating = async () => {
  if (!rateAnswerDialog.value.question || !rateAnswerDialog.value.rating) return;
  
  rateAnswerDialog.value.loading = true;
  try {
    await qnaStore.addSatisfaction(
      rateAnswerDialog.value.question.id,
      rateAnswerDialog.value.rating
    );
    rateAnswerDialog.value.show = false;
    rateAnswerDialog.value.rating = 0;
  } catch (error) {
    console.error("Failed to submit rating:", error);
  } finally {
    rateAnswerDialog.value.loading = false;
  }
};

const confirmDeleteQuestion = (question: QnA) => {
  if (!isMyQuestion(question)) return; // Only allow deleting own questions
  
  deleteDialog.value = {
    show: true,
    question: question,
    loading: false,
  };
};

const confirmDelete = async () => {
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

const showSatisfactionDetails = (question: QnA) => {
  satisfactionDialog.value = {
    show: true,
    question: { ...question },
  };
};

const resetFilters = () => {
  search.value = "";
  filters.value = {
    status: [],
    sortBy: "newest",
  };
  currentPage.value = 1;
};

// Reset pagination when filters change
watch([search, filters], () => {
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
  border-left: 3px solid #FF9800 !important;
}

/* High Satisfaction (≥ 4.0) - Green Light */
.high-satisfaction-card {
  background-color: rgba(232, 245, 232, 0.3) !important;
  border-left: 3px solid #4CAF50 !important;
}

/* Low Satisfaction (< 4.0) - Red Light */
.low-satisfaction-card {
  background-color: rgba(255, 235, 238, 0.3) !important;
  border-left: 3px solid #F44336 !important;
}

/* My Question - Blue Light */
.my-question {
  background-color: rgba(227, 242, 253, 0.3) !important;
  border-left: 3px solid #2196F3 !important;
}

/* Status Chip Colors */
.unanswered-chip {
  background-color: #FFF3E0 !important;
  color: #FF9800 !important;
  border: 1px solid #FF9800 !important;
}

.high-satisfaction-chip {
  background-color: #E8F5E8 !important;
  color: #4CAF50 !important;
  border: 1px solid #4CAF50 !important;
}

.low-satisfaction-chip {
  background-color: #FFEBEE !important;
  color: #F44336 !important;
  border: 1px solid #F44336 !important;
}

/* Stats Header Chips */
.stats-answered {
  background-color: rgba(232, 245, 232, 0.5) !important;
  color: #4CAF50 !important;
}

.stats-pending {
  background-color: rgba(255, 243, 224, 0.5) !important;
  color: #FF9800 !important;
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