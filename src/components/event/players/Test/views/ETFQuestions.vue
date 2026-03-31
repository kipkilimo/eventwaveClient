<template>
  <v-card class="Test-container" elevation="0">
    <!-- Header section remains the same -->
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h5"
        >SECTION A Part II - Expanded True/False Questions
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
        <v-btn @click="toggleViewMode" variant="outlined">
          {{ showSingleQuestion ? "View All " : "View One " }}
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
      <!-- All-at-once mode -->
      <template v-if="!showSingleQuestion">
        <v-card
          v-for="(question, qIndex) in questions"
          :key="qIndex"
          class="Test-container mb-4"
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
          <h5 class="text-h6 ml-2">{{ qIndex + 1 }}. {{ question.stem }}</h5>

          <v-card-text>
            <v-list dense>
              <v-list-item
                v-for="(choice, cIndex) in question.choices"
                :key="cIndex"
              >
                <v-list-item-content
                  class="d-flex align-center justify-space-between"
                  style="gap: 16px; flex-wrap: wrap"
                >
                  <!-- Option label -->
                  <div class="d-flex align-center" style="min-width: 200px">
                    <span class="font-weight-bold mr-2">
                      {{ String.fromCharCode(65 + cIndex) }}.
                    </span>
                    <span>{{ choice }}</span>
                  </div>

                  <!-- Select chips -->
                  <div class="d-flex align-center" style="gap: 8px">
                    <v-chip
                      v-for="option in ['T', 'F', 'D']"
                      :key="option"
                      :color="
                        userAnswers[qIndex] &&
                        userAnswers[qIndex][cIndex] === option
                          ? 'primary'
                          : 'grey lighten-2'
                      "
                      :text-color="
                        userAnswers[qIndex] &&
                        userAnswers[qIndex][cIndex] === option
                          ? 'white'
                          : 'black'
                      "
                      @click="setUserAnswer(qIndex, cIndex, option)"
                      class="cursor-pointer"
                      label
                      size="small"
                    >
                      {{
                        option === "T"
                          ? "TRUE"
                          : option === "F"
                            ? "FALSE"
                            : "DON'T KNOW"
                      }}
                    </v-chip>
                  </div>

                  <!-- Correct answer chip -->
                  <v-chip
                    v-if="showAnswers"
                    :color="
                      getAnswerColor(
                        question.correctAnswers[cIndex],
                        userAnswers[qIndex]
                          ? userAnswers[qIndex][cIndex]
                          : null,
                      )
                    "
                    class="ml-2"
                    label
                    size="small"
                  >
                    {{
                      getAnswerText(
                        question.correctAnswers[cIndex],
                        userAnswers[qIndex]
                          ? userAnswers[qIndex][cIndex]
                          : null,
                      )
                    }}
                  </v-chip>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-expand-transition>
              <div v-if="showAnswers" class="mt-3">
                <v-alert type="info" density="compact" variant="outlined">
                  <strong>Explanation:</strong> {{ question.explanation }}
                </v-alert>
              </div>
            </v-expand-transition>
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
          <h5 class="text-h6 ml-2">
            {{ currentQuestionIndex + 1 }}. {{ currentQuestion.stem }}
          </h5>

          <v-card-text>
            <v-list dense>
              <v-list-item
                v-for="(choice, cIndex) in currentQuestion.choices"
                :key="cIndex"
              >
                <v-list-item-content
                  class="d-flex align-center justify-space-between"
                  style="gap: 16px; flex-wrap: wrap"
                >
                  <!-- Option label -->
                  <div class="d-flex align-center" style="min-width: 200px">
                    <span class="font-weight-bold mr-2">
                      {{ String.fromCharCode(65 + cIndex) }}.
                    </span>
                    <span>{{ choice }}</span>
                  </div>

                  <!-- Select chips -->
                  <div class="d-flex align-center" style="gap: 8px">
                    <v-chip
                      v-for="option in ['T', 'F', 'D']"
                      :key="option"
                      :color="
                        userAnswers[currentQuestionIndex] &&
                        userAnswers[currentQuestionIndex][cIndex] === option
                          ? 'primary'
                          : 'grey lighten-2'
                      "
                      :text-color="
                        userAnswers[currentQuestionIndex] &&
                        userAnswers[currentQuestionIndex][cIndex] === option
                          ? 'white'
                          : 'black'
                      "
                      @click="
                        setUserAnswer(currentQuestionIndex, cIndex, option)
                      "
                      class="cursor-pointer"
                      label
                      size="small"
                    >
                      {{
                        option === "T"
                          ? "TRUE"
                          : option === "F"
                            ? "FALSE"
                            : "DON'T KNOW"
                      }}
                    </v-chip>
                  </div>

                  <!-- Correct answer chip -->
                  <v-chip
                    v-if="showAnswers"
                    :color="
                      getAnswerColor(
                        currentQuestion.correctAnswers[cIndex],
                        userAnswers[currentQuestionIndex]
                          ? userAnswers[currentQuestionIndex][cIndex]
                          : null,
                      )
                    "
                    class="ml-2"
                    label
                    size="small"
                  >
                    {{
                      getAnswerText(
                        currentQuestion.correctAnswers[cIndex],
                        userAnswers[currentQuestionIndex]
                          ? userAnswers[currentQuestionIndex][cIndex]
                          : null,
                      )
                    }}
                  </v-chip>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-expand-transition>
              <div v-if="showAnswers" class="mt-3">
                <v-alert type="info" density="compact" variant="outlined">
                  <strong>Explanation:</strong>
                  {{ currentQuestion.explanation }}
                </v-alert>
              </div>
            </v-expand-transition>
          </v-card-text>
        </v-card>

        <v-card-actions class="mt-4">
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
            :disabled="!isAnswerComplete"
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
      </template>

      <v-alert v-else type="info">No questions available.</v-alert>
    </v-card-text>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-card>
</template>
<script setup>
import { ref, computed, watch, onMounted, onBeforeMount } from "vue";
import { useQuestionStore } from "@/stores/question";

const questionStore = useQuestionStore();

const currentQuestionIndex = ref(0);
const showAnswers = ref(false);
const showSingleQuestion = ref(true);
const userAnswers = ref([]);
const currentSaveStatus = ref(false);
const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

const questions = ref([]);
const currentQuestion = computed(
  () => questions.value[currentQuestionIndex.value],
);

const isAnswerComplete = computed(() =>
  userAnswers.value[currentQuestionIndex.value]?.every(
    (answer) => answer !== null && answer !== undefined,
  ),
);
const isLastQuestion = computed(
  () => currentQuestionIndex.value === questions.value.length - 1,
);
const showProgress = computed(
  () => showSingleQuestion.value && questions.value.length > 1,
);
const allQuestionsAnswered = computed(() =>
  questions.value.every(
    (_, idx) =>
      Array.isArray(userAnswers.value[idx]) &&
      userAnswers.value[idx].every(
        (answer) => answer !== null && answer !== undefined,
      ),
  ),
);

const progressColor = computed(() => {
  const progress = (currentQuestionIndex.value + 1) / questions.value.length;
  return progress < 0.3 ? "red" : progress < 0.7 ? "orange" : "green";
});
// Define emits
const emit = defineEmits(["view-mode-changed"]);

// Component state

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

// Answer display helpers
function getAnswerColor(correctAnswer, userAnswer) {
  if (userAnswer === "D" || userAnswer === null || userAnswer === undefined)
    return "grey";
  return userAnswer === correctAnswer ? "green" : "red";
}

function getAnswerText(correctAnswer, userAnswer) {
  if (userAnswer === "D" || userAnswer === null || userAnswer === undefined)
    return "Not answered";
  return userAnswer === correctAnswer ? "✓ Correct" : "✗ Wrong";
}

// Methods
function setUserAnswer(qIndex, cIndex, option) {
  if (!userAnswers.value[qIndex]) {
    userAnswers.value[qIndex] = Array(5).fill(null);
  }
  userAnswers.value[qIndex][cIndex] = option;
}

// When toggling between single/all view
const toggleViewMode = () => {
  showSingleQuestion.value = !showSingleQuestion.value;
  emit("view-mode-changed", !showSingleQuestion.value);
};
function submitAnswer() {
  showAnswers.value = true;
  showSnackbar("Responses submitted!", "success");
}

const smoothScrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

function submitAllAnswers() {
  currentSaveStatus.value = true;
  showAnswers.value = true;
  showSnackbar("All answers submitted!", "success");
  questionStore.recordTestCompletion("EXPANDED_TRUE_FALSE", userAnswers.value);
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

// Storage functions
function saveAnswersToStorage() {
  localStorage.setItem("etf_Test_answers", JSON.stringify(userAnswers.value));
}

function loadAnswersFromStorage() {
  const saved = localStorage.getItem("etf_Test_answers");
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

// Initialize questions and answers
onBeforeMount(() => {
  function getETFQuestions() {
    const res = questionStore.allQuestions.filter(
      (q) => q.questionType === "EXPANDED_TRUE_FALSE",
    );
    return res;
  }
  questions.value = getETFQuestions();
  loadAnswersFromStorage();
});

onMounted(() => {
  // Initialize userAnswers if not loaded from storage or length mismatch
  if (userAnswers.value.length !== questions.value.length) {
    const newAnswers = Array(questions.value.length)
      .fill()
      .map(() => Array(5).fill(null));

    // Preserve existing answers where possible
    for (
      let i = 0;
      i < Math.min(userAnswers.value.length, questions.value.length);
      i++
    ) {
      if (
        Array.isArray(userAnswers.value[i]) &&
        userAnswers.value[i].length === 5
      ) {
        newAnswers[i] = [...userAnswers.value[i]];
      }
    }

    userAnswers.value = newAnswers;
  }

  // Check if all answers are complete
  currentSaveStatus.value = userAnswers.value.every(
    (answer) =>
      Array.isArray(answer) &&
      answer.every((a) => a !== null && a !== undefined),
  );
});

// Watch questions and adjust answers array if needed
watch(
  questions,
  (newQuestions) => {
    if (newQuestions.length !== userAnswers.value.length) {
      const newAnswers = Array(newQuestions.length)
        .fill()
        .map(() => Array(5).fill(null));

      // Copy existing answers
      for (
        let i = 0;
        i < Math.min(userAnswers.value.length, newQuestions.length);
        i++
      ) {
        if (
          Array.isArray(userAnswers.value[i]) &&
          userAnswers.value[i].length === 5
        ) {
          newAnswers[i] = [...userAnswers.value[i]];
        }
      }

      userAnswers.value = newAnswers;
    }
  },
  { deep: true },
);

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

// Auto-save answers when changed
watch(
  userAnswers,
  () => {
    saveAnswersToStorage();
  },
  { deep: true },
);
</script>
<style scoped>
.Test-container {
  max-width: 96%;
  margin: 0 auto;
  padding: 8px;
}

.v-list-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.v-list-item-content span {
  font-size: 16px;
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

.cursor-pointer {
  cursor: pointer;
}
</style>
