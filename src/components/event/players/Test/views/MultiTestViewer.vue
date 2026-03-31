<template>
  <v-card class="question-viewer-container" flat>
    <v-row class="mb-2" align="center" justify="space-between" no-gutters>
      <v-col class="d-flex align-center" cols="auto">
        <v-card-text>
          <v-card-title
            color="#6a808b"
            class="text-h5 font-weight-bold mb-0"
            prepend-icon="mdi-format-list-checks"
          >
            NEMBio Group Revision Center </v-card-title
          ><br />
          <v-card-subtitle prepend-icon="mdi-format-list-checks">
            Try over 5000 high quality Testsfor Epidemiology, Biostatistics and
            Research Methods
          </v-card-subtitle>
        </v-card-text>
      </v-col>

      <v-col class="d-flex justify-end" cols="auto">
        <router-link
          :to="
            route.path.includes('computing')
              ? '/dashboard/library'
              : '/dashboard/library'
          "
          class="d-flex align-center mr-4"
        >
          <v-img
            src="https://a2z-v0.s3.eu-central-1.amazonaws.com/Screenshot+from+2024-10-22+16-31-16.png"
            width="150"
            height="90"
            @click="
              resourceStore.setCurrentSubjectArea('Epidemiology');
              resourceStore.showingResourceTitles = true;
              resourceStore.chooseRevisionPath = false;
              resourceStore.showingResourceTitleItems = false;
            "
          />
        </router-link>
      </v-col>
    </v-row>

    <v-divider class="my-4"></v-divider>

    <v-row style="position: relative">
      <!-- Left Panel (3 columns) - Fixed Position -->
      <v-col
        cols="3"
        style="
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          z-index: 1;
        "
      >
        <v-card elevation="2" style="height: 78vh" class="question-type-panel">
          <v-card-title>Question Types</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(type, key) in questionTypeMap"
                :key="key"
                :value="key"
                @click="selectQuestionType(key)"
                :class="{ 'active-type': activeComponent === key }"
              >
                <v-list-item-title>{{ type }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ getQuestionCount(key) }} questions
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions
            style="
              position: sticky;
              bottom: 0;
              background: white;
              z-index: 2;
              padding: 16px;
            "
          >
            <v-spacer />
            <v-btn
              color="primary"
              prepend-icon="mdi-content-save-check-outline"
              variant="text"
              @click="questionStore.resultsSummaryDialog = true"
            >
              Save and exit
            </v-btn>
            <v-spacer />
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Right Panel (9 columns) - Conditional Scroll -->
      <v-col
        cols="9"
        :style="{
          'overflow-y': showAllQuestions ? 'auto' : 'hidden',
          'max-height': '100vh',
          'padding-bottom': '100px',
        }"
      >
        <v-card elevation="2" class="question-display-panel">
          <v-card-text>
            <div v-if="isLoading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
              <div class="mt-4">Loading questions...</div>
            </div>

            <div v-else-if="error" class="error-message">
              <v-alert type="error">{{ error }}</v-alert>
            </div>

            <div v-else>
              <component
                :is="getComponentForCurrentType()"
                :questions="getQuestionsForCurrentType()"
                :currentQuestion="currentQuestion"
                @view-mode-changed="handleViewModeChange"
                ref="questionComponent"
              />
            </div>
          </v-card-text>
          <!-- Footer Content -->
          <v-card-actions
            style="
              position: sticky;
              bottom: 0;
              background: white;
              z-index: 2;
              padding: 16px;
            "
          >
            <v-spacer />
            <v-btn
              color="primary"
              prepend-icon="mdi-content-save-check-outline"
              variant="outlined"
              @click="questionStore.resultsSummaryDialog = true"
            >
              Save All and exit session
            </v-btn>
            <v-spacer />
          </v-card-actions>
        </v-card>

        <v-row justify="center">
          <v-col class="text-center" cols="12">
            <v-card-text class="white--text">
              © 2024 - {{ new Date().getFullYear() }}. The
              <i>Revision Center</i>
              Site presents curated Tests by
              <i>
                <a
                  href="https://www.nembio.com/dashboard/library"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="white--text text-decoration-none"
                >
                  The Nairobi Epidemiology and Biostatistics Methods Colloquium
                  (NEMBio)
                </a> </i
              >.
              <br />
              Email:
              <a
                href="mailto:info@nembio.com"
                class="white--text text-decoration-none"
                >info@nembio.com</a
              >
            </v-card-text>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-dialog v-model="questionStore.resultsSummaryDialog" max-width="85%">
      <v-card-title class="text-h6">Test Results</v-card-title>
      <v-card-text>
        <StudentScoresSummary :questions="questionStore.allQuestions" />
      </v-card-text>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed } from "vue";
import { useQuestionStore } from "@/stores/question";

import { useRouter, useRoute } from "vue-router";
// Import question components
import ATFQuestions from "@/components/resourcePlayers/revision/self/views/ATFQuestions.vue";
import ETFQuestions from "@/components/resourcePlayers/revision/self/views/ETFQuestions.vue";
import LEQQuestions from "@/components/resourcePlayers/revision/self/views/LEQQuestions.vue";
import MCQQuestions from "@/components/resourcePlayers/revision/self/views/MCQQuestions.vue";
import SAQQuestions from "@/components/resourcePlayers/revision/self/views/SAQQuestions.vue";
import SCQQuestions from "@/components/resourcePlayers/revision/self/views/SCQQuestions.vue";
import VSAQQuestions from "@/components/resourcePlayers/revision/self/views/VSAQQuestions.vue";
import StudentScoresSummary from "@/components/resourcePlayers/revision/self/analytics/StudentScoresSummary.vue";
// Define question type mapping
const QUESTION_TYPE_MAP = {
  QUICK_TRUE_FALSE: "Quick True/False",
  EXPANDED_TRUE_FALSE: "Expanded True/False",
  SINGLE_SELECT: "Single Choice",
  MULTI_SELECT: "Multiple Choice",
  VERY_SHORT_ANSWER: "Very Short Answer",
  SHORT_ANSWER: "Short Answer",
  LONG_ANSWER: "Long Answer",
};

const route = useRoute();
// Component mapping
const QUESTION_TYPE_TO_COMPONENT = {
  QUICK_TRUE_FALSE: ATFQuestions,
  EXPANDED_TRUE_FALSE: ETFQuestions,
  SINGLE_SELECT: SCQQuestions,
  MULTI_SELECT: MCQQuestions,
  VERY_SHORT_ANSWER: VSAQQuestions,
  SHORT_ANSWER: SAQQuestions,
  LONG_ANSWER: LEQQuestions,
};

// Store
const questionStore = useQuestionStore();
const questionComponent = ref(null);

// State for scroll behavior
const showAllQuestions = ref(false);

// Handle view mode changes from child components
const handleViewModeChange = (isViewingAll) => {
  showAllQuestions.value = isViewingAll;
};

// Computed properties
const isLoading = computed(() => questionStore.isLoading);
const error = computed(() => questionStore.error);
const activeComponent = computed(() => questionStore.activeComponent);
const currentQuestion = computed(() => questionStore.currentQuestion);
const questionTypeMap = QUESTION_TYPE_MAP;

// Methods
function selectQuestionType(type) {
  questionStore.setActiveComponent(type);
  showAllQuestions.value = false; // Reset to single question view when changing question types
}

function getQuestionCount(type) {
  switch (type) {
    case "QUICK_TRUE_FALSE":
      return questionStore.allQuestions.filter(
        (q) => q.questionType === "QUICK_TRUE_FALSE",
      ).length;
    case "EXPANDED_TRUE_FALSE":
      return questionStore.allQuestions.filter(
        (q) => q.questionType === "EXPANDED_TRUE_FALSE",
      ).length;
    case "SINGLE_SELECT":
      return questionStore.allQuestions.filter(
        (q) => q.questionType === "SINGLE_SELECT",
      ).length;
    case "MULTI_SELECT":
      return questionStore.allQuestions.filter(
        (q) => q.questionType === "MULTI_SELECT",
      ).length;
    case "VERY_SHORT_ANSWER":
      return questionStore.allQuestions.filter(
        (q) => q.questionType === "VERY_SHORT_ANSWER",
      ).length;
    case "SHORT_ANSWER":
      return questionStore.allQuestions.filter(
        (q) => q.questionType === "SHORT_ANSWER",
      ).length;
    case "LONG_ANSWER":
      return questionStore.allQuestions.filter(
        (q) => q.questionType === "LONG_ANSWER",
      ).length;
    default:
      return 0;
  }
}

function getComponentForCurrentType() {
  if (!activeComponent.value) return null;
  return QUESTION_TYPE_TO_COMPONENT[activeComponent.value];
}

function getQuestionsForCurrentType() {
  if (!activeComponent.value) return [];

  switch (activeComponent.value) {
    case "QUICK_TRUE_FALSE":
      return questionStore.quickTrueFalse;
    case "EXPANDED_TRUE_FALSE":
      return questionStore.expandedTrueFalse;
    case "SINGLE_SELECT":
      return questionStore.singleSelect;
    case "MULTI_SELECT":
      return questionStore.multiSelect;
    case "VERY_SHORT_ANSWER":
      return questionStore.veryShortAnswer;
    case "SHORT_ANSWER":
      return questionStore.shortAnswer;
    case "LONG_ANSWER":
      return questionStore.longAnswer;
    default:
      return [];
  }
}
function clearTestStorage() {
  const keysToRemove = [
    "atf_Test_answers",
    "etf_Test_answers",
    "multi_select_Test_answers",
    "single_select_Test_answers",
    "vsaq_answers",
    "saq_answers",
    "laq_answers",
  ];

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });
}
</script>

<style scoped>
.question-viewer-container {
  background-color: #f5f5f5;
}

.question-type-panel {
  background-color: white;
  border-right: 1px solid #e0e0e0;
}

.question-display-panel {
  background-color: white;
  min-height: 79vh;
}

.active-type {
  background-color: #e3f2fd;
  border-left: 4px solid #1976d2;
}

/* Custom scrollbar styling when visible */
.question-display-panel::-webkit-scrollbar {
  width: 8px;
}

.question-display-panel::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.question-display-panel::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.question-display-panel::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
<style scoped>
.question-viewer-container {
  background-color: #f5f5f5;
}

.question-type-panel {
  background-color: white;
  border-right: 1px solid #e0e0e0;
}

.active-type {
  background-color: #e3f2fd;
  border-left: 4px solid #1976d2;
}

/* Custom scrollbar styling when visible */
.question-display-panel::-webkit-scrollbar {
  width: 8px;
}

.question-display-panel::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.question-display-panel::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.question-display-panel::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

<style scoped>
.question-viewer-container {
  width: 90%;
  margin: 0 auto;
  padding: 10px;
}

.question-type-panel {
  height: 66%;
  position: relative;
  top: 20px;
}

.question-display-panel {
  max-height: 90%vh;
}

.active-type {
  background-color: rgba(25, 118, 210, 0.1);
  border-left: 3px solid #1976d2;
}

.v-list-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.v-list-item:hover {
  background-color: rgba(25, 118, 210, 0.05);
}

.error-message {
  margin-top: 20px;
}
</style>
<style scoped>
.article-container {
  max-width: 900px;
  margin: 0 auto;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.article-subtitle {
  font-size: 1.5rem;
  font-weight: 400;
  color: #666;
  line-height: 1.4;
  margin-bottom: 1.5rem;
}

.article-meta {
  color: #666;
  font-size: 0.9rem;
}

.featured-image {
  border-radius: 8px !important;
  width: 100%;
}

.content-image {
  border-radius: 4px;
  margin: 1rem 0;
  width: 100%;
}

.article-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* Style for embedded content */
.iframe-container {
  position: relative;
  overflow: hidden;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  margin: 1rem 0;
}

.iframe-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 93%;
  border: none;
}
</style>

<style>
/* Global styles for rendered content */
.article-container >>> p {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.article-container >>> h2 {
  font-size: 1.8rem;
  margin: 2rem 0 1rem;
  font-weight: 600;
}

.article-container >>> h3 {
  font-size: 1.5rem;
  margin: 1.5rem 0 1rem;
  font-weight: 600;
}

.article-container >>> ul,
.article-container >>> ol {
  margin-bottom: 1.5rem;
  padding-left: 2rem;
}

.article-container >>> li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.article-container >>> blockquote {
  border-left: 4px solid #1976d2;
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: #555;
  font-style: italic;
}

.article-container >>> a {
  color: #1976d2;
  text-decoration: none;
}

.article-container >>> a:hover {
  text-decoration: underline;
}

.article-container >>> table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.article-container >>> th,
.article-container >>> td {
  border: 1px solid #ddd;
  padding: 8px;
}

.article-container >>> th {
  background-color: #f5f5f5;
  text-align: left;
}
</style>
