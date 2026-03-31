<template>
  <v-card
    class="Test-container"
    elevation="0"
    v-if="currentQuestion.difficulty && currentQuestion.difficulty.length > 0"
  >
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h5"
        >SECTION A Part I - Quick True/False Questions
        <v-chip
          :prepend-icon="
            currentSaveStatus ? 'mdi-content-save-check-outline' : 'mdi-alert'
          "
          :color="currentSaveStatus ? 'green' : 'red'"
        >
          {{ currentSaveStatus ? "Saved" : "Unsaved" }}
        </v-chip></span
      >
      <div class="d-flex align-center">
        <v-btn @click="toggleViewMode" variant="outlined">
          {{
            showSingleQuestion ? "View All Questions" : "View Single Question"
          }}
        </v-btn>
        <v-chip v-if="showProgress" :color="progressColor" dark class="ml-2">
          {{ currentQuestionIndex + 1 }} / {{ questions.length }}
        </v-chip>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text>
      <!-- All-at-once mode -->
      <template v-if="!showSingleQuestion">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="mb-8"
        >
          <div class="question-meta mb-2">
            <v-chip small class="mr-2" color="primary">{{
              question.specialty
            }}</v-chip>
            <v-chip small class="mr-2" color="secondary">{{
              question.topic
            }}</v-chip>
            <v-chip
              small
              :prepend-icon="getDifficultyIcon(question.difficulty)"
              class="text-p"
              :color="getDifficultyColor(question.difficulty)"
            >
              {{ question.shortId }} | {{ question.difficulty }}
            </v-chip>
          </div>

          <div class="question-stem mb-6">
            <p class="text-h6">{{ index + 1 }}. {{ question.stem }}</p>
          </div>
          <v-radio-group v-model="userAnswers[index]" class="mb-2" mandatory>
            <v-radio label="True" value="T" color="primary"></v-radio>
            <v-radio label="False" value="F" color="primary"></v-radio>
          </v-radio-group>

          <v-divider class="my-1"></v-divider>
        </div>

        <v-btn
          color="primary"
          prepend-icon="mdi-check"
          variant="outlined"
          :disabled="!allQuestionsAnswered"
          @click="smoothScrollToTop"
        >
          finish section & save responses</v-btn
        >
      </template>

      <!-- Single-question mode -->
      <template v-else-if="currentQuestion">
        <div class="question-meta mb-4">
          <v-chip small class="mr-2" color="primary">
            {{ currentQuestion.specialty }}
          </v-chip>
          <v-chip small class="mr-2" color="secondary">
            {{ currentQuestion.topic }}
          </v-chip>
          <v-chip
            small
            :prepend-icon="currentIcon"
            class="text-p"
            :color="currentColor"
          >
            {{ currentQuestion.shortId }} | {{ currentQuestion.difficulty }}
          </v-chip>
        </div>

        <div class="question-stem mb-6">
          <p class="text-h6">{{ currentQuestion.stem }}</p>
        </div>

        <v-radio-group
          v-model="userAnswers[currentQuestionIndex]"
          class="answer-options"
          mandatory
        >
          <v-radio label="True" value="T" color="primary"></v-radio>
          <v-radio label="False" value="F" color="primary"></v-radio>
        </v-radio-group>

        <v-expand-transition>
          <div v-if="showExplanation" class="explanation mt-4">
            <v-alert
              :color="isAnswerCorrect ? 'success' : 'error'"
              variant="outlined"
              density="compact"
            >
              <strong>{{ isAnswerCorrect ? "Correct!" : "Incorrect" }}</strong>
              <div v-if="currentQuestion.explanation" class="mt-2">
                {{ currentQuestion.explanation }}
              </div>
            </v-alert>
          </div>
        </v-expand-transition>
      </template>

      <v-alert v-else type="info">No questions available.</v-alert>
    </v-card-text>

    <v-divider class="my-4"></v-divider>
    <v-card-actions v-if="showSingleQuestion && currentQuestion">
      <v-btn
        :disabled="currentQuestionIndex === 0"
        @click="prevQuestion"
        color="primary"
        variant="outlined"
      >
        <v-icon left>mdi-chevron-left</v-icon> Previous
      </v-btn>
      <v-btn
        v-if="!showExplanation"
        @click="submitAnswer"
        color="primary"
        :disabled="!hasAnswer"
        class="mr-2"
      >
        Submit
      </v-btn>
      <v-btn v-else @click="nextQuestion" color="primary">
        {{ isLastQuestion ? "Finish" : "Next" }}
        <v-icon right>mdi-chevron-right</v-icon>
      </v-btn>
      <v-spacer />
    </v-card-actions>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>

    <v-divider class="my-4"></v-divider>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeMount } from "vue";
import { useQuestionStore } from "@/stores/question";

const questionStore = useQuestionStore();

const currentQuestionIndex = ref(0);
const showExplanation = ref(false);
const showSingleQuestion = ref(true);
const userAnswers = ref([]);
const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

const questions = ref([]);
const currentQuestion = computed(
  () => questions.value[currentQuestionIndex.value],
);

const hasAnswer = computed(
  () => userAnswers.value[currentQuestionIndex.value] !== undefined,
);
const isAnswerCorrect = computed(() => {
  const answer = userAnswers.value[currentQuestionIndex.value];
  return answer === currentQuestion.value?.correctAnswers?.[0];
});
const isLastQuestion = computed(
  () => currentQuestionIndex.value === questions.value.length - 1,
);
const showProgress = computed(
  () => showSingleQuestion.value && questions.value.length > 1,
);
const allQuestionsAnswered = computed(() =>
  questions.value.every(
    (_, idx) =>
      userAnswers.value[idx] !== null && userAnswers.value[idx] !== undefined,
  ),
);

const progressColor = computed(() => {
  const progress = (currentQuestionIndex.value + 1) / questions.value.length;
  return progress < 0.3 ? "red" : progress < 0.7 ? "orange" : "green";
});

// Dynamic difficulty style
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

// Fixed difficulty icon and color refs
const currentIcon = ref("");
const currentColor = ref("");

watch(
  () => isLastQuestion.value,
  (newVal) => {
    if (newVal === true) {
      smoothScrollToTop();
    }
  },
  { immediate: true },
);

watch(
  () => currentQuestion.value?.difficulty,
  (newVal) => {
    if (newVal) {
      currentIcon.value = getDifficultyIcon(newVal);
      currentColor.value = getDifficultyColor(newVal);
    }
  },
  { immediate: true },
);

// Define emits
const emit = defineEmits(["view-mode-changed"]);

// When toggling between single/all view
const toggleViewMode = () => {
  showSingleQuestion.value = !showSingleQuestion.value;
  emit("view-mode-changed", !showSingleQuestion.value);
};

// Initialize userAnswers when questions change
watch(
  questions,
  (newQuestions) => {
    if (newQuestions.length !== userAnswers.value.length) {
      const newAnswers = Array(newQuestions.length).fill(null);
      for (
        let i = 0;
        i < Math.min(userAnswers.value.length, newQuestions.length);
        i++
      ) {
        newAnswers[i] = userAnswers.value[i];
      }
      userAnswers.value = newAnswers;
      saveAnswersToStorage();
    }
  },
  { deep: true },
);

// Watch for changes in userAnswers and save to storage
watch(
  userAnswers,
  (newAnswers) => {
    saveAnswersToStorage();
  },
  { deep: true },
);

function submitAnswer() {
  showExplanation.value = true;
  snackbar.value = {
    show: true,
    message: isAnswerCorrect.value ? "Correct answer!" : "Incorrect answer",
    color: isAnswerCorrect.value ? "success" : "error",
  };
}

const currentSaveStatus = ref(null);

function submitAllAnswers() {
  currentSaveStatus.value = true;
  snackbar.value = {
    show: true,
    message: "All answers submitted!",
    color: "success",
  };
}

const smoothScrollToTop = () => {
  submitAllAnswers();
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

function nextQuestion() {
  showExplanation.value = false;
  if (!isLastQuestion.value) {
    currentQuestionIndex.value++;
  }
}

function prevQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    showExplanation.value = false;
  }
}

// Local storage functions
function saveAnswersToStorage() {
  localStorage.setItem("atf_Test_answers", JSON.stringify(userAnswers.value));
}

function loadAnswersFromStorage() {
  const saved = localStorage.getItem("atf_Test_answers");
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
  function getATFQuestions() {
    const res = questionStore.allQuestions.filter(
      (q) => q.questionType === "QUICK_TRUE_FALSE",
    );
    return res;
  }
  questions.value = getATFQuestions();
  loadAnswersFromStorage();
});

onMounted(() => {
  // Initialize userAnswers if not loaded from storage
  if (userAnswers.value.length !== questions.value.length) {
    userAnswers.value = Array(questions.value.length).fill(null);
  }

  // Check if all answers are complete
  currentSaveStatus.value = userAnswers.value.every(
    (answer) => answer !== null && answer !== undefined,
  );
});
</script>

<style scoped>
.Test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.question-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.question-stem {
  font-family: "Lato", san-serif !important;
}

.explanation {
  border-left: 4px solid;
  padding-left: 12px;
}
</style>
<style scoped>
.Test-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}
</style>
<style scoped>
.Test-container {
  max-width: 100%;
  margin: 0 auto;
}

.question-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.question-stem {
  line-height: 1.6;
}

.answer-options {
  margin-top: 16px;
}

.explanation {
  border-left: 4px solid;
  padding-left: 12px;
}
</style>
