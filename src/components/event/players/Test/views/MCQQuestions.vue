<template>
  <v-card class="Test-container" elevation="0">
    <!-- Header section -->
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h5"
        >SECTION B Part IV - Multi Select Questions
        <v-chip
          :prepend-icon="
            currentSaveStatus ? 'mdi-content-save-check-outline' : 'mdi-alert'
          "
          :color="currentSaveStatus ? 'green' : 'red'"
        >
          {{ currentSaveStatus ? "Saved" : "Unsaved" }}
        </v-chip>
      </span>
      <div class="d-flex align-center">
        <v-btn @click="toggleViewMode" class="ml-1" variant="outlined">
          {{ showSingleQuestion ? "View All" : "View Single" }}
        </v-btn>
        <v-chip v-if="showProgress" :color="progressColor" dark class="ml-1">
          {{ currentQuestionIndex + 1 }} / {{ questions.length }}
        </v-chip>
        <v-switch
          size="small"
          v-model="showAnswers"
          label="Answers"
          class="ml-2"
          hide-details
          density="compact"
        ></v-switch>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text>
      <!-- Loading state -->
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
        <div class="mt-2">Loading questions...</div>
      </div>

      <!-- All-at-once mode -->
      <template v-else-if="!showSingleQuestion && questions.length > 0">
        <v-card
          v-for="(question, qIndex) in questions"
          :key="question.id"
          class="mb-4"
          elevation="2"
        >
          <v-card-subtitle class="d-flex flex-wrap align-center">
            <v-chip small class="mr-2" color="primary">{{
              question.specialty
            }}</v-chip>
            <v-chip small class="mr-2" color="secondary">{{
              question.topic
            }}</v-chip>
            <v-chip
              small
              :prepend-icon="getDifficultyIcon(question.difficulty)"
              :color="getDifficultyColor(question.difficulty)"
            >
              {{ question.shortId }} | {{ question.difficulty }}
            </v-chip>
          </v-card-subtitle>
          <v-card-text class="text-h6 ml-2">
            {{ qIndex + 1 }}. {{ question.stem }}
          </v-card-text>

          <v-card-text>
            <v-list dense>
              <v-list-item
                v-for="(choice, cIndex) in question.choices"
                :key="cIndex"
                @click="toggleMultiAnswer(qIndex, cIndex)"
                :class="{
                  'selected-choice': userAnswers[qIndex]?.includes(
                    String.fromCharCode(65 + cIndex),
                  ),
                }"
                class="choice-item"
                style="min-height: 40px; padding-top: 0; padding-bottom: 0"
              >
                <v-list-item-content
                  class="d-flex align-center"
                  style="min-height: 40px"
                >
                  <div class="d-flex align-center">
                    <v-checkbox
                      :model-value="
                        userAnswers[qIndex]?.includes(
                          String.fromCharCode(65 + cIndex),
                        )
                      "
                      hide-details
                      class="mr-2"
                      color="primary"
                      readonly
                      style="
                        margin-top: 0;
                        margin-bottom: 0;
                        padding-top: 0;
                        padding-bottom: 0;
                      "
                    ></v-checkbox>
                    <span class="font-weight-bold mr-2" style="min-width: 24px">
                      {{ String.fromCharCode(65 + cIndex) }}.
                    </span>
                    <span>{{ choice }}</span>
                  </div>

                  <v-icon
                    v-if="showAnswers && isCorrectAnswer(question, cIndex)"
                    color="green"
                    class="ml-2"
                    style="font-size: 18px"
                  >
                    mdi-check-circle
                  </v-icon>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <div v-if="showAnswers" class="mt-3">
              <v-alert
                :type="getAnswerAlertType(qIndex)"
                density="compact"
                variant="outlined"
              >
                <div v-if="userAnswers[qIndex]?.length">
                  You selected:
                  <strong>{{ userAnswers[qIndex].join(", ") }}</strong>
                  <div
                    v-for="answer in userAnswers[qIndex]"
                    :key="answer"
                    class="mt-1"
                  >
                    - {{ String.fromCharCode(65 + answer.charCodeAt(0) - 65) }}:
                    {{ question.choices[answer.charCodeAt(0) - 65] }}
                  </div>

                  <div class="mt-2">
                    <span v-if="isAnswerFullyCorrect(qIndex)"
                      >All correct!</span
                    >
                    <span v-else-if="isAnswerPartiallyCorrect(qIndex)"
                      >Partially correct!</span
                    >
                    <span v-else>Incorrect.</span>

                    <div v-if="!isAnswerFullyCorrect(qIndex)" class="mt-1">
                      The correct answers are:
                      <strong>{{
                        getCorrectAnswerLabels(question).join(", ")
                      }}</strong>
                      <div
                        v-for="answer in question.correctAnswers"
                        :key="answer"
                        class="mt-1"
                      >
                        -
                        {{
                          String.fromCharCode(
                            65 + question.choices.indexOf(answer),
                          )
                        }}: {{ answer }}
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else>
                  You didn't select any answers. The correct answers are:
                  <strong>{{
                    getCorrectAnswerLabels(question).join(", ")
                  }}</strong>
                  <div
                    v-for="answer in question.correctAnswers"
                    :key="answer"
                    class="mt-1"
                  >
                    -
                    {{
                      String.fromCharCode(
                        65 + question.choices.indexOf(answer),
                      )
                    }}: {{ answer }}
                  </div>
                </div>
              </v-alert>

              <v-alert
                v-if="question.explanation"
                type="info"
                density="compact"
                variant="outlined"
                class="mt-2"
              >
                <strong>Explanation:</strong> {{ question.explanation }}
              </v-alert>
            </div>
          </v-card-text>
        </v-card>

        <v-card-actions class="mt-4">
          <v-spacer></v-spacer>
          <v-btn
            @click="submitAllAnswers"
            color="primary"
            :disabled="!allQuestionsAnswered"
          >
            Submit All Answers
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </template>

      <!-- Single-question mode -->
      <template v-else-if="currentQuestion">
        <v-card elevation="2">
          <v-card-subtitle class="d-flex flex-wrap align-center">
            <v-chip small class="mr-2" color="primary">{{
              currentQuestion.specialty
            }}</v-chip>
            <v-chip small class="mr-2" color="secondary">{{
              currentQuestion.topic
            }}</v-chip>
            <v-chip small :prepend-icon="currentIcon" :color="currentColor">
              {{ currentQuestion.shortId }} | {{ currentQuestion.difficulty }}
            </v-chip>
          </v-card-subtitle>
          <v-card-text class="text-h6 ml-2">
            {{ currentQuestionIndex + 1 }}. {{ currentQuestion.stem }}
          </v-card-text>

          <v-card-text>
            <v-list dense>
              <v-list-item
                v-for="(choice, cIndex) in currentQuestion.choices"
                :key="cIndex"
                @click="toggleMultiAnswer(currentQuestionIndex, cIndex)"
                :class="{
                  'selected-choice': userAnswers[
                    currentQuestionIndex
                  ]?.includes(String.fromCharCode(65 + cIndex)),
                }"
                class="choice-item"
              >
                <v-list-item-content class="d-flex align-center">
                  <div class="d-flex align-center">
                    <v-checkbox
                      :model-value="
                        userAnswers[currentQuestionIndex]?.includes(
                          String.fromCharCode(65 + cIndex),
                        )
                      "
                      hide-details
                      class="mr-2"
                      color="primary"
                      readonly
                    ></v-checkbox>
                    <span class="font-weight-bold mr-2">
                      {{ String.fromCharCode(65 + cIndex) }}.
                    </span>
                    <span>{{ choice }}</span>
                  </div>

                  <v-icon
                    v-if="
                      showAnswers && isCorrectAnswer(currentQuestion, cIndex)
                    "
                    color="green"
                    class="ml-2"
                  >
                    mdi-check-circle
                  </v-icon>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions class="mt-1">
            <v-spacer></v-spacer>
            <v-btn
              :disabled="currentQuestionIndex === 0"
              @click="prevQuestion"
              color="primary"
              variant="outlined"
            >
              <v-icon left>mdi-chevron-left</v-icon> Previous
            </v-btn>

            <v-btn
              v-if="!showAnswers"
              @click="submitAnswer"
              color="primary"
              :disabled="!userAnswers[currentQuestionIndex]?.length"
              class="ml-2"
            >
              Submit
            </v-btn>

            <v-btn v-else @click="nextQuestion" color="primary" class="ml-2">
              {{ isLastQuestion ? "Finish" : "Next" }}
              <v-icon right>mdi-chevron-right</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
          <div v-if="showAnswers" class="mt-1">
            <v-alert
              :type="getAnswerAlertType(currentQuestionIndex)"
              density="compact"
              variant="outlined"
            >
              <div v-if="userAnswers[currentQuestionIndex]?.length">
                You selected:
                <strong>{{
                  userAnswers[currentQuestionIndex].join(", ")
                }}</strong>
                <div
                  v-for="answer in userAnswers[currentQuestionIndex]"
                  :key="answer"
                  class="mt-1"
                >
                  - {{ answer }}:
                  {{ currentQuestion.choices[answer.charCodeAt(0) - 65] }}
                </div>

                <div class="mt-2">
                  <span v-if="isAnswerFullyCorrect(currentQuestionIndex)"
                    >All correct!</span
                  >
                  <span
                    v-else-if="isAnswerPartiallyCorrect(currentQuestionIndex)"
                    >Partially correct!</span
                  >
                  <span v-else>Incorrect.</span>

                  <div
                    v-if="!isAnswerFullyCorrect(currentQuestionIndex)"
                    class="mt-1"
                  >
                    The correct answers are:
                    <strong>{{
                      getCorrectAnswerLabels(currentQuestion).join(", ")
                    }}</strong>
                    <div
                      v-for="answer in currentQuestion.correctAnswers"
                      :key="answer"
                      class="mt-1"
                    >
                      -
                      {{
                        String.fromCharCode(
                          65 + currentQuestion.choices.indexOf(answer),
                        )
                      }}: {{ answer }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                You didn't select any answers. The correct answers are:
                <strong>{{
                  getCorrectAnswerLabels(currentQuestion).join(", ")
                }}</strong>
                <div
                  v-for="answer in currentQuestion.correctAnswers"
                  :key="answer"
                  class="mt-1"
                >
                  -
                  {{
                    String.fromCharCode(
                      65 + currentQuestion.choices.indexOf(answer),
                    )
                  }}: {{ answer }}
                </div>
              </div>
            </v-alert>

            <v-alert
              v-if="currentQuestion.explanation"
              type="info"
              density="compact"
              variant="outlined"
              class="mt-2"
            >
              <strong>Explanation:</strong> {{ currentQuestion.explanation }}
            </v-alert>
          </div>
        </v-card>
      </template>

      <v-alert v-else-if="!loading" type="info"
        >No questions available.</v-alert
      >
    </v-card-text>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useQuestionStore } from "@/stores/question";

const questionStore = useQuestionStore();

// Reactive state
const currentQuestionIndex = ref(0);
const showAnswers = ref(false);
const showSingleQuestion = ref(true);
const userAnswers = ref([]); // Now stores arrays of selected options for each question
const currentSaveStatus = ref(false);
const loading = ref(true);
const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

// Computed properties
const questions = computed(() => {
  return questionStore.allQuestions.filter(
    (q) => q.questionType === "MULTI_SELECT",
  );
});

const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value];
});

const isLastQuestion = computed(
  () => currentQuestionIndex.value === questions.value.length - 1,
);
const showProgress = computed(
  () => showSingleQuestion.value && questions.value.length > 1,
);
const allQuestionsAnswered = computed(() => {
  return questions.value.every(
    (_, qIndex) =>
      userAnswers.value[qIndex] !== undefined &&
      userAnswers.value[qIndex] !== null &&
      userAnswers.value[qIndex].length > 0,
  );
});

const progressColor = computed(() => {
  const progress = (currentQuestionIndex.value + 1) / questions.value.length;
  return progress < 0.3 ? "red" : progress < 0.7 ? "orange" : "green";
});

// Difficulty styling
const currentIcon = ref("");
const currentColor = ref("");

function getDifficultyColor(level) {
  if (level === "EASY") return "grey";
  if (level === "MEDIUM") return "grey";
  if (level === "HARD") return "grey";
  return "grey";
}

function getDifficultyIcon(level) {
  if (level === "EASY") return "mdi-wifi-strength-1";
  if (level === "MEDIUM") return "mdi-wifi-strength-2";
  if (level === "HARD") return "mdi-wifi-strength-3";
  return "mdi-help-circle-outline";
}

// Answer checking functions
function isCorrectAnswer(question, choiceIndex) {
  if (!question.correctAnswers || question.correctAnswers.length === 0)
    return false;
  const choiceText = question.choices[choiceIndex];
  return question.correctAnswers.includes(choiceText);
}

function getCorrectAnswerLabels(question) {
  if (!question.correctAnswers || question.correctAnswers.length === 0)
    return [];
  return question.correctAnswers.map((answer) => {
    const index = question.choices.findIndex((choice) => choice === answer);
    return String.fromCharCode(65 + index);
  });
}

function isAnswerFullyCorrect(qIndex) {
  if (!userAnswers.value[qIndex]?.length) return false;

  const question = questions.value[qIndex];
  if (!question.correctAnswers?.length) return false;

  // Convert user's letter selections to answer texts
  const userAnswerTexts = userAnswers.value[qIndex].map(
    (letter) => question.choices[letter.charCodeAt(0) - 65],
  );

  // Check if all correct answers are selected and no incorrect ones
  return (
    question.correctAnswers.every((correct) =>
      userAnswerTexts.includes(correct),
    ) &&
    userAnswerTexts.every((selected) =>
      question.correctAnswers.includes(selected),
    )
  );
}

function isAnswerPartiallyCorrect(qIndex) {
  if (!userAnswers.value[qIndex]?.length) return false;

  const question = questions.value[qIndex];
  if (!question.correctAnswers?.length) return false;

  // Convert user's letter selections to answer texts
  const userAnswerTexts = userAnswers.value[qIndex].map(
    (letter) => question.choices[letter.charCodeAt(0) - 65],
  );

  // Check if at least one correct answer is selected
  return question.correctAnswers.some((correct) =>
    userAnswerTexts.includes(correct),
  );
}

function getAnswerAlertType(qIndex) {
  if (isAnswerFullyCorrect(qIndex)) return "success";
  if (isAnswerPartiallyCorrect(qIndex)) return "warning";
  return "error";
}

// Watch for question changes
watch(
  currentQuestion,
  (newVal) => {
    if (newVal?.difficulty) {
      currentIcon.value = getDifficultyIcon(newVal.difficulty);
      currentColor.value = getDifficultyColor(newVal.difficulty);
    }
  },
  { immediate: true },
);

// Initialize userAnswers when questions change
watch(
  questions,
  (newQuestions) => {
    if (newQuestions.length !== userAnswers.value.length) {
      userAnswers.value = Array(newQuestions.length)
        .fill(null)
        .map(() => []);
      loadAnswersFromStorage();
    }
    loading.value = false;
  },
  { immediate: true, deep: true },
);

// Save answers when they change
watch(
  userAnswers,
  (newAnswers) => {
    saveAnswersToStorage();
  },
  { deep: true },
);

// Methods
function toggleView() {
  showSingleQuestion.value = !showSingleQuestion.value;
  showAnswers.value = false;
}

function toggleMultiAnswer(qIndex, cIndex) {
  if (!showAnswers.value) {
    const selectedOption = String.fromCharCode(65 + cIndex); // Convert index to letter (0->A, 1->B, etc.)

    // Initialize array if not exists
    if (!userAnswers.value[qIndex]) {
      userAnswers.value[qIndex] = [];
    }

    // Toggle selection
    const currentAnswers = userAnswers.value[qIndex];
    const optionIndex = currentAnswers.indexOf(selectedOption);

    if (optionIndex === -1) {
      currentAnswers.push(selectedOption);
    } else {
      currentAnswers.splice(optionIndex, 1);
    }

    // Sort the answers to maintain consistent order
    userAnswers.value[qIndex] = [...currentAnswers].sort();
  }
}

const smoothScrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

function submitAnswer() {
  showAnswers.value = true;
  const status = isAnswerFullyCorrect(currentQuestionIndex.value)
    ? "fully correct"
    : isAnswerPartiallyCorrect(currentQuestionIndex.value)
      ? "partially correct"
      : "incorrect";
  showSnackbar(
    `Response submitted (${status})!`,
    isAnswerFullyCorrect(currentQuestionIndex.value)
      ? "success"
      : isAnswerPartiallyCorrect(currentQuestionIndex.value)
        ? "warning"
        : "error",
  );
}

function submitAllAnswers() {
  currentSaveStatus.value = true;
  showAnswers.value = true;

  // Calculate score
  const correctCount = questions.value.reduce(
    (count, _, qIndex) => (isAnswerFullyCorrect(qIndex) ? count + 1 : count),
    0,
  );

  const partiallyCorrectCount = questions.value.reduce(
    (count, _, qIndex) =>
      !isAnswerFullyCorrect(qIndex) && isAnswerPartiallyCorrect(qIndex)
        ? count + 1
        : count,
    0,
  );

  showSnackbar(
    `All answers submitted! (${correctCount} fully correct, ${partiallyCorrectCount} partially correct)`,
    correctCount === questions.value.length
      ? "success"
      : correctCount + partiallyCorrectCount > 0
        ? "warning"
        : "error",
  );

  questionStore.recordTestCompletion("MULTI_SELECT", userAnswers.value);
  smoothScrollToTop();
}

function nextQuestion() {
  showAnswers.value = false;
  if (!isLastQuestion.value) {
    currentQuestionIndex.value++;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function prevQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    showAnswers.value = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function showSnackbar(message, color) {
  snackbar.value = { show: true, message, color };
}
// In your question components (e.g., SCQQuestions.vue)
const props = defineProps({
  questions: {
    type: Array,
    required: true,
  },
  currentQuestion: {
    type: Object,
    required: true,
  },
});

// Define emits
const emit = defineEmits(["view-mode-changed"]);

// Component state

// Methods
const toggleViewMode = () => {
  showSingleQuestion.value = !showSingleQuestion.value;
  emit("view-mode-changed", !showSingleQuestion.value);
};
// Storage functions
function saveAnswersToStorage() {
  localStorage.setItem(
    "multi_select_Test_answers",
    JSON.stringify(userAnswers.value),
  );
}

function loadAnswersFromStorage() {
  const saved = localStorage.getItem("multi_select_Test_answers");
  if (saved) {
    try {
      const parsedAnswers = JSON.parse(saved);
      if (Array.isArray(parsedAnswers)) {
        userAnswers.value = parsedAnswers;
      }
    } catch (e) {
      console.error("Failed to parse saved answers", e);
    }
  }
}

// Initialize
onMounted(() => {
  loadAnswersFromStorage();
});
</script>

<style scoped>
.Test-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.choice-item {
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
  padding: 8px 16px;
  margin: 4px 0;
}

.choice-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.selected-choice {
  background-color: rgba(25, 118, 210, 0.08);
  border-left: 3px solid #1976d2;
}

.v-list-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.question-stem {
  font-family: "Lato", sans-serif !important;
  line-height: 1.6;
}

.v-card-subtitle {
  padding-top: 8px;
  padding-bottom: 8px;
}

.v-card-actions {
  padding: 16px;
}
</style>
<style scoped>
.choice-item {
  min-height: 40px;
  padding-top: 0;
  padding-bottom: 0;
}

.choice-item .v-list-item__content {
  min-height: 40px;
}

.choice-item .v-checkbox {
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.choice-letter {
  min-width: 24px;
}

.choice-icon {
  font-size: 18px;
}
</style>
