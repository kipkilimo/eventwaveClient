<template>
  <v-container>
    <v-card class="elevation-0">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Test Results</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-chip color="white" text-color="primary">
          {{ overallScore }}% Overall
        </v-chip>
      </v-toolbar>

      <v-card-text>
        <!-- Progress Summary -->
        <v-row class="mb-6">
          <v-col
            cols="12"
            md="6"
            lg="3"
            v-for="(score, type) in filteredScores"
            :key="type"
          >
            <v-card class="pa-4" :color="getScoreColor(score.percentage)" dark>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-caption">{{ formatQuestionType(type) }}</div>
                  <div class="text-h5">{{ score.percentage }}%</div>
                </div>
                <v-progress-circular
                  :value="score.percentage"
                  :color="getProgressColor(score.percentage)"
                  size="60"
                  width="6"
                >
                  {{ score.correct }}/{{ score.total }}
                </v-progress-circular>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Detailed Results -->
        <v-expansion-panels>
          <!-- Quick True/False -->
          <v-expansion-panel v-if="scores.QUICK_TRUE_FALSE.total > 0">
            <v-expansion-panel-title>
              <v-row align="center">
                <v-col cols="6">Quick True/False</v-col>
                <v-col cols="6" class="text-right">
                  <v-chip
                    :color="getScoreColor(scores.QUICK_TRUE_FALSE.percentage)"
                  >
                    {{ scores.QUICK_TRUE_FALSE.correct }}/{{
                      scores.QUICK_TRUE_FALSE.total
                    }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-table>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Your Answer</th>
                    <th>Correct Answer</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(answer, index) in atfAnswers" :key="index">
                    <td>Question {{ index + 1 }}</td>
                    <td>
                      <v-chip
                        :color="
                          answer === markingScheme.QUICK_TRUE_FALSE[index]
                            ? 'success'
                            : 'error'
                        "
                      >
                        {{ answer }}
                      </v-chip>
                    </td>
                    <td>{{ markingScheme.QUICK_TRUE_FALSE[index] }}</td>
                    <td>
                      <v-icon
                        :color="
                          answer === markingScheme.QUICK_TRUE_FALSE[index]
                            ? 'success'
                            : 'error'
                        "
                      >
                        {{
                          answer === markingScheme.QUICK_TRUE_FALSE[index]
                            ? "mdi-check"
                            : "mdi-close"
                        }}
                      </v-icon>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Expanded True/False -->
          <v-expansion-panel v-if="scores.EXPANDED_TRUE_FALSE.total > 0">
            <v-expansion-panel-title>
              <v-row align="center">
                <v-col cols="6">Expanded True/False</v-col>
                <v-col cols="6" class="text-right">
                  <v-chip
                    :color="
                      getScoreColor(scores.EXPANDED_TRUE_FALSE.percentage)
                    "
                  >
                    {{ scores.EXPANDED_TRUE_FALSE.correct }}/{{
                      scores.EXPANDED_TRUE_FALSE.total
                    }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-table>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Your Answers</th>
                    <th>Correct Answers</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(answers, index) in etfAnswers" :key="index">
                    <td>Question {{ index + 1 }}</td>
                    <td>
                      <div class="d-flex flex-wrap gap-2">
                        <v-chip
                          v-for="(answer, aIndex) in answers"
                          :key="aIndex"
                          :color="
                            answer ===
                            markingScheme.EXPANDED_TRUE_FALSE[index][aIndex]
                              ? 'success'
                              : 'error'
                          "
                        >
                          {{ answer }}
                        </v-chip>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex flex-wrap gap-2">
                        <v-chip
                          v-for="(answer, aIndex) in markingScheme
                            .EXPANDED_TRUE_FALSE[index]"
                          :key="aIndex"
                          color="primary"
                        >
                          {{ answer }}
                        </v-chip>
                      </div>
                    </td>
                    <td>
                      <v-icon
                        :color="isEtfCorrect(index) ? 'success' : 'error'"
                      >
                        {{ isEtfCorrect(index) ? "mdi-check" : "mdi-close" }}
                      </v-icon>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Single Select -->
          <v-expansion-panel v-if="scores.SINGLE_SELECT.total > 0">
            <v-expansion-panel-title>
              <v-row align="center">
                <v-col cols="6">Single Select</v-col>
                <v-col cols="6" class="text-right">
                  <v-chip
                    :color="getScoreColor(scores.SINGLE_SELECT.percentage)"
                  >
                    {{ scores.SINGLE_SELECT.correct }}/{{
                      scores.SINGLE_SELECT.total
                    }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-table>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Your Answer</th>
                    <th>Correct Answer</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(answer, index) in singleSelectAnswers"
                    :key="index"
                  >
                    <td>Question {{ index + 1 }}</td>
                    <td>
                      <v-chip
                        :color="
                          answer.toUpperCase() ===
                          markingScheme.SINGLE_SELECT[index].toUpperCase()
                            ? 'success'
                            : 'error'
                        "
                      >
                        {{ answer }}
                      </v-chip>
                    </td>
                    <td>{{ markingScheme.SINGLE_SELECT[index] }}</td>
                    <td>
                      <v-icon
                        :color="
                          answer.toUpperCase() ===
                          markingScheme.SINGLE_SELECT[index].toUpperCase()
                            ? 'success'
                            : 'error'
                        "
                      >
                        {{
                          answer.toUpperCase() ===
                          markingScheme.SINGLE_SELECT[index].toUpperCase()
                            ? "mdi-check"
                            : "mdi-close"
                        }}
                      </v-icon>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Multi Select -->
          <v-expansion-panel v-if="scores.MULTI_SELECT.total > 0">
            <v-expansion-panel-title>
              <v-row align="center">
                <v-col cols="6">Multi Select</v-col>
                <v-col cols="6" class="text-right">
                  <v-chip
                    :color="getScoreColor(scores.MULTI_SELECT.percentage)"
                  >
                    {{ scores.MULTI_SELECT.correct }}/{{
                      scores.MULTI_SELECT.total
                    }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-table>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Your Answers</th>
                    <th>Correct Answers</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(answers, index) in multiSelectAnswers"
                    :key="index"
                  >
                    <td>Question {{ index + 1 }}</td>
                    <td>
                      <div class="d-flex flex-wrap gap-2">
                        <v-chip
                          v-for="(answer, aIndex) in answers"
                          :key="aIndex"
                          :color="
                            isMultiSelectCorrect(index, answer)
                              ? 'success'
                              : 'error'
                          "
                        >
                          {{ answer }}
                        </v-chip>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex flex-wrap gap-2">
                        <v-chip
                          v-for="(answer, aIndex) in markingScheme.MULTI_SELECT[
                            index
                          ]"
                          :key="aIndex"
                          color="primary"
                        >
                          {{ answer }}
                        </v-chip>
                      </div>
                    </td>
                    <td>
                      <v-icon
                        :color="
                          isMultiSelectAllCorrect(index) ? 'success' : 'error'
                        "
                      >
                        {{
                          isMultiSelectAllCorrect(index)
                            ? "mdi-check"
                            : "mdi-close"
                        }}
                      </v-icon>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Manually Graded Sections -->
          <template v-for="type in manualGradedTypes" :key="type">
            <v-expansion-panel v-if="scores[type].total > 0">
              <v-expansion-panel-title>
                <v-row align="center">
                  <v-col cols="6">{{ formatQuestionType(type) }}</v-col>
                  <v-col cols="6" class="text-right">
                    <v-chip color="warning">
                      {{ scores[type].correct }}/{{
                        scores[type].total
                      }}
                      (Manual Grading)
                    </v-chip>
                  </v-col>
                </v-row>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-alert type="info" class="mb-4">
                  These questions require manual assessment by your instructor.
                </v-alert>
                <v-table>
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Your Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(response, index) in getManualResponses(type)"
                      :key="index"
                    >
                      <td>Question {{ index + 1 }}</td>
                      <td>
                        <div
                          v-if="response.text"
                          class="response-text"
                          v-html="response.text"
                        ></div>
                        <div v-if="response.fileUrl">
                          <v-btn
                            variant="text"
                            color="primary"
                            :href="response.fileUrl"
                            target="_blank"
                          >
                            <v-icon left>mdi-file</v-icon>
                            {{ response.fileName || "Download File" }}
                          </v-btn>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </template>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer> <v-spacer></v-spacer>
        <v-btn color="primary" @click="printResults">
          <v-icon left>mdi-home-circle-outline</v-icon>
          Exit Revision ENvironment
        </v-btn>
        <v-spacer></v-spacer> <v-spacer></v-spacer
        ><v-btn color="grey" @click="questionStore.resultsSummaryDialog = null">
          <v-icon left>mdi-close-octagon-outline</v-icon>
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
<script setup>
import { computed, ref } from "vue";
import { useQuestionStore } from "@/stores/question";

// Props
const props = defineProps({
  questions: {
    type: Array,
    required: true,
  },
});

// Store
const questionStore = useQuestionStore();

// Reactive state
const markingScheme = ref({});
const scores = ref({});
const atfAnswers = ref([]);
const etfAnswers = ref([]);
const singleSelectAnswers = ref([]);
const multiSelectAnswers = ref([]);
const vsaAnswers = ref([]);
const saqAnswers = ref([]);
const leqAnswers = ref([]);
const manualGradedTypes = ref([
  "VERY_SHORT_ANSWER",
  "SHORT_ANSWER",
  "LONG_ANSWER",
]);

// Computed properties
const filteredScores = computed(() => {
  const filtered = {};
  Object.keys(scores.value).forEach((key) => {
    if (scores.value[key].total > 0 && !manualGradedTypes.value.includes(key)) {
      filtered[key] = scores.value[key];
    }
  });
  return filtered;
});

const overallScore = computed(() => {
  return scores.value.overall?.autoGradedPercentage || 0;
});

// Methods
const generateMarkingScheme = () => {
  markingScheme.value = {
    QUICK_TRUE_FALSE: [],
    EXPANDED_TRUE_FALSE: [],
    SINGLE_SELECT: [],
    MULTI_SELECT: [],
    VERY_SHORT_ANSWER: [],
    SHORT_ANSWER: [],
    LONG_ANSWER: [],
  };

  props.questions.forEach((question) => {
    const { questionType, correctAnswers, choices } = question;

    switch (questionType) {
      case "QUICK_TRUE_FALSE":
        markingScheme.value.QUICK_TRUE_FALSE.push(correctAnswers[0]);
        break;

      case "EXPANDED_TRUE_FALSE":
        markingScheme.value.EXPANDED_TRUE_FALSE.push(correctAnswers);
        break;

      case "SINGLE_SELECT":
        if (choices && choices.length > 0) {
          const index = choices.findIndex(
            (choice) => choice === correctAnswers[0],
          );
          markingScheme.value.SINGLE_SELECT.push(
            String.fromCharCode(65 + index),
          );
        } else {
          markingScheme.value.SINGLE_SELECT.push(correctAnswers[0]);
        }
        break;

      case "MULTI_SELECT":
      case "MULTIPLE_SELECT":
        if (choices && choices.length > 0) {
          const selectedIndices = correctAnswers.map((answer) =>
            choices.findIndex((choice) => choice === answer),
          );
          markingScheme.value.MULTI_SELECT.push(
            selectedIndices.map((index) => String.fromCharCode(65 + index)),
          );
        } else {
          markingScheme.value.MULTI_SELECT.push(correctAnswers);
        }
        break;

      case "VERY_SHORT_ANSWER":
        markingScheme.value.VERY_SHORT_ANSWER.push(
          correctAnswers.length > 0 ? correctAnswers[0] : "",
        );
        break;

      case "SHORT_ANSWER":
        markingScheme.value.SHORT_ANSWER.push(
          correctAnswers.length > 0 ? correctAnswers[0] : "",
        );
        break;

      case "LONG_ANSWER":
      case "LONG_ESSAY_QUESTION":
        markingScheme.value.LONG_ANSWER.push(
          correctAnswers.length > 0 ? correctAnswers[0] : "",
        );
        break;

      default:
        console.warn(`Unknown question type: ${questionType}`);
    }
  });
};

const fetchResponses = () => {
  atfAnswers.value = JSON.parse(localStorage.getItem("atf_Test_answers")) || [];
  etfAnswers.value = JSON.parse(localStorage.getItem("etf_Test_answers")) || [];
  singleSelectAnswers.value =
    JSON.parse(localStorage.getItem("single_select_Test_answers")) || [];
  multiSelectAnswers.value =
    JSON.parse(localStorage.getItem("multi_select_Test_answers")) || [];
  vsaAnswers.value = JSON.parse(localStorage.getItem("vsaq_answers")) || [];
  saqAnswers.value = JSON.parse(localStorage.getItem("saq_answers")) || [];
  leqAnswers.value = JSON.parse(localStorage.getItem("leq_answers")) || [];
};

const calculateScores = () => {
  // Initialize scores
  scores.value = {
    QUICK_TRUE_FALSE: { correct: 0, total: 0, percentage: 0 },
    EXPANDED_TRUE_FALSE: { correct: 0, total: 0, percentage: 0 },
    SINGLE_SELECT: { correct: 0, total: 0, percentage: 0 },
    MULTI_SELECT: { correct: 0, total: 0, percentage: 0 },
    VERY_SHORT_ANSWER: { correct: 0, total: 0, percentage: 0 },
    SHORT_ANSWER: { correct: 0, total: 0, percentage: 0 },
    LONG_ANSWER: { correct: 0, total: 0, percentage: 0 },
    overall: {
      autoGradedCorrect: 0,
      autoGradedTotal: 0,
      autoGradedPercentage: 0,
      manualGradedTotal: 0,
    },
  };

  // Compare QUICK_TRUE_FALSE answers
  markingScheme.value.QUICK_TRUE_FALSE.forEach((correctAnswer, index) => {
    if (index < atfAnswers.value.length) {
      scores.value.QUICK_TRUE_FALSE.total++;
      if (atfAnswers.value[index] === correctAnswer) {
        scores.value.QUICK_TRUE_FALSE.correct++;
      }
    }
  });

  // Compare EXPANDED_TRUE_FALSE answers
  markingScheme.value.EXPANDED_TRUE_FALSE.forEach((correctAnswers, qIndex) => {
    if (qIndex < etfAnswers.value.length) {
      const userAnswers = etfAnswers.value[qIndex];
      let questionCorrect = true;

      correctAnswers.forEach((correctAnswer, aIndex) => {
        if (
          aIndex >= userAnswers.length ||
          userAnswers[aIndex] !== correctAnswer
        ) {
          questionCorrect = false;
        }
      });

      scores.value.EXPANDED_TRUE_FALSE.total++;
      if (questionCorrect) {
        scores.value.EXPANDED_TRUE_FALSE.correct++;
      }
    }
  });

  // Compare SINGLE_SELECT answers
  markingScheme.value.SINGLE_SELECT.forEach((correctAnswer, index) => {
    if (index < singleSelectAnswers.value.length) {
      scores.value.SINGLE_SELECT.total++;
      if (
        singleSelectAnswers.value[index].toUpperCase() ===
        correctAnswer.toUpperCase()
      ) {
        scores.value.SINGLE_SELECT.correct++;
      }
    }
  });

  // Compare MULTI_SELECT answers
  markingScheme.value.MULTI_SELECT.forEach((correctAnswers, qIndex) => {
    if (qIndex < multiSelectAnswers.value.length) {
      const userAnswers = multiSelectAnswers.value[qIndex].map((a) =>
        a.toUpperCase(),
      );
      const correctAnswersUpper = correctAnswers.map((a) => a.toUpperCase());

      const allCorrectSelected = correctAnswersUpper.every((a) =>
        userAnswers.includes(a),
      );
      const noIncorrectSelected = userAnswers.every((a) =>
        correctAnswersUpper.includes(a),
      );

      scores.value.MULTI_SELECT.total++;
      if (allCorrectSelected && noIncorrectSelected) {
        scores.value.MULTI_SELECT.correct++;
      }
    }
  });

  // Set totals for manually assessed questions
  scores.value.VERY_SHORT_ANSWER.total =
    markingScheme.value.VERY_SHORT_ANSWER.length;
  scores.value.SHORT_ANSWER.total = markingScheme.value.SHORT_ANSWER.length;
  scores.value.LONG_ANSWER.total = markingScheme.value.LONG_ANSWER.length;

  // Calculate overall stats
  scores.value.overall.autoGradedCorrect =
    scores.value.QUICK_TRUE_FALSE.correct +
    scores.value.EXPANDED_TRUE_FALSE.correct +
    scores.value.SINGLE_SELECT.correct +
    scores.value.MULTI_SELECT.correct;

  scores.value.overall.autoGradedTotal =
    scores.value.QUICK_TRUE_FALSE.total +
    scores.value.EXPANDED_TRUE_FALSE.total +
    scores.value.SINGLE_SELECT.total +
    scores.value.MULTI_SELECT.total;

  scores.value.overall.manualGradedTotal =
    scores.value.VERY_SHORT_ANSWER.total +
    scores.value.SHORT_ANSWER.total +
    scores.value.LONG_ANSWER.total;

  // Calculate percentages
  Object.keys(scores.value).forEach((type) => {
    if (type !== "overall" && scores.value[type].total > 0) {
      scores.value[type].percentage = Math.round(
        (scores.value[type].correct / scores.value[type].total) * 100,
      );
    }
  });

  if (scores.value.overall.autoGradedTotal > 0) {
    scores.value.overall.autoGradedPercentage = Math.round(
      (scores.value.overall.autoGradedCorrect /
        scores.value.overall.autoGradedTotal) *
        100,
    );
  }
};

const getScoreColor = (percentage) => {
  if (percentage >= 80) return "success";
  if (percentage >= 50) return "warning";
  return "error";
};

const getProgressColor = (percentage) => {
  if (percentage >= 80) return "white";
  if (percentage >= 50) return "orange-darken-2";
  return "red-darken-2";
};

const formatQuestionType = (type) => {
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

const isEtfCorrect = (index) => {
  if (
    index >= etfAnswers.value.length ||
    index >= markingScheme.value.EXPANDED_TRUE_FALSE.length
  ) {
    return false;
  }
  const userAnswers = etfAnswers.value[index];
  const correctAnswers = markingScheme.value.EXPANDED_TRUE_FALSE[index];

  if (userAnswers.length !== correctAnswers.length) return false;

  for (let i = 0; i < correctAnswers.length; i++) {
    if (userAnswers[i] !== correctAnswers[i]) return false;
  }
  return true;
};

const isMultiSelectCorrect = (index, answer) => {
  if (index >= markingScheme.value.MULTI_SELECT.length) return false;
  return markingScheme.value.MULTI_SELECT[index].includes(answer.toUpperCase());
};

const isMultiSelectAllCorrect = (index) => {
  if (
    index >= multiSelectAnswers.value.length ||
    index >= markingScheme.value.MULTI_SELECT.length
  ) {
    return false;
  }
  const userAnswers = multiSelectAnswers.value[index].map((a) =>
    a.toUpperCase(),
  );
  const correctAnswers = markingScheme.value.MULTI_SELECT[index].map((a) =>
    a.toUpperCase(),
  );

  const allCorrectSelected = correctAnswers.every((a) =>
    userAnswers.includes(a),
  );
  const noIncorrectSelected = userAnswers.every((a) =>
    correctAnswers.includes(a),
  );

  return allCorrectSelected && noIncorrectSelected;
};

const getManualResponses = (type) => {
  switch (type) {
    case "VERY_SHORT_ANSWER":
      return vsaAnswers.value;
    case "SHORT_ANSWER":
      return saqAnswers.value;
    case "LONG_ANSWER":
      return leqAnswers.value;
    default:
      return [];
  }
};

const printResults = () => {
  window.location.href = "/dashboard/library";
};

// Lifecycle hooks
generateMarkingScheme();
fetchResponses();
calculateScores();
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.response-text {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
}
@media print {
  .v-expansion-panel-text {
    display: block !important;
  }
  .v-expansion-panel-title {
    pointer-events: none !important;
  }
  .v-expansion-panel-title__icon {
    display: none !important;
  }
}
</style>
