<template>
  <div>
    <!-- VSAQ Section -->
    <v-card class="leq-container" elevation="0">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5">SECTION B Part III - Long Answer Questions</span>
        <v-chip :color="saveStatusColor" dark>
          <v-icon left>{{ saveStatusIcon }}</v-icon>
          {{ saveStatusText }}
        </v-chip>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <!-- Progress Indicator -->


        <!-- Current Question -->
        <v-card elevation="2">
          <v-card-subtitle class="d-flex mt-1 flex-wrap align-center">
            <v-chip small class="mr-2" color="primary">
              Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
            </v-chip>
            <v-chip small class="mr-2" color="primary">{{ currentQuestion.specialty }}</v-chip>
            <v-chip small class="mr-2" color="secondary">{{ currentQuestion.topic }}</v-chip>
            <v-chip small :prepend-icon="currentIcon" :color="currentColor">
              {{ currentQuestion.shortId }} | {{ currentQuestion.difficulty }}
            </v-chip>
          </v-card-subtitle>

          <h5 class="text-h6 ml-2">
            {{ currentQuestionIndex + 1 }}. {{ currentQuestion.stem }}
          </h5>

          <v-card-text>
            <!-- Text Answer Input  <v-textarea :disabled="responseType === 'file' || currentAnswer.submitted" v-model="currentAnswer.text"
              label="Type your answer here" outlined rows="3" class="mb-4" :rules="textAnswerRules"></v-textarea>-->

            <v-card elevation="0" :disabled="responseType === 'file' || currentAnswer.submitted"
              v-model="currentAnswer.file">
              <v-card min-height="51vh" max-height="51vh" max-width="95%">
                <RichTextEditor v-model="currentAnswer.text" />
                <v-card-actions>
                  <v-btn variant="outlined" @click="saveArticle">
                    <v-icon class="mr-2">mdi-content-save-edit</v-icon>SAVE ARTICLE
                  </v-btn>
                </v-card-actions>
              </v-card>
              <VuetifyViewer :value="currentAnswer.text" />
            </v-card>
            <!-- File Upload Section -->
            <!-- <v-row>
              <v-col cols="6">
                <v-card height="10.5rem" class="ma-2 mr-3">
                  <v-file-input :disabled="responseType === 'text' || currentAnswer.submitted" class="mb-2 mt-2 ma-2"
                    v-model="currentAnswer.file" accept=".jpg,.jpeg,.png,.pdf" label="Upload response document"
                    prepend-icon="mdi-paperclip" :rules="fileRules" :show-size="true" :clearable="true"
                    @change="handleFileChange"></v-file-input>

                  <v-alert v-if="currentAnswer.fileUrl" type="info" density="compact" class="mt-2">
                    File attached: {{ currentAnswer.fileName }}
                    <v-btn icon size="x-small" @click="removeFile" class="ml-2" :disabled="currentAnswer.submitted">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-alert>
                </v-card>

              </v-col>
              <v-col cols="5" class="ml-8"> 
                <v-card>
                  <v-radio-group v-model="responseType" :disabled="currentAnswer.submitted" class="mt-3" mandatory>
                    <v-radio label="Text response only" value="text"></v-radio>
                    <v-radio label="File upload only" value="file"></v-radio>
                    <v-radio label="Both text and file" value="both"></v-radio>
                  </v-radio-group>
                </v-card>
              </v-col>
            </v-row> -->


          </v-card-text>
        </v-card>

        <!-- Navigation Buttons -->
        <!-- Navigation Buttons -->
        <v-card-actions class="mt-4">
          <v-spacer></v-spacer>
          <v-btn v-if="!currentAnswer.submitted" @click="submitCurrentQuestion" color="primary" :loading="saving"
            :disabled="!canSubmit">
            Submit Response
          </v-btn> <v-btn v-if="!isLastQuestion && currentAnswer.submitted" @click="moveToNextQuestion" color="primary"
            size="small">
            Continue to Next Question
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card-text>
      <!-- Submission Status -->
      <v-alert v-if="currentAnswer.submitted" type="success" density="compact" variant="outlined" class="mt-4">
        Response submitted!

      </v-alert>
      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
        {{ snackbar.message }}
      </v-snackbar>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeMount, onMounted } from 'vue';
// Questions data
import { useQuestionStore } from '@/stores/question';
// Difficulty styling
// Difficulty styling
import RichTextEditor from "@/components/commonResourceCreateItems/formItems/RichTextEditor.vue";


const questionStore = useQuestionStore();

const currentQuestionIndex = ref(0);
// Computed properties
const questions = computed(() => {
  return questionStore.allQuestions.filter(q => q.questionType === 'LONG_ANSWER');
});

const saving = ref(false);
const responseType = ref<'text' | 'file' | 'both'>('text');

// Computed properties
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
const currentAnswer = computed(() => userAnswers.value[currentQuestionIndex.value]);
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1);

// Form validation
const textAnswerRules = [
  (v: string) => !!v || 'Text response is required when selected',
  (v: string) => (v && v.length >= 5) || 'Response must be at least 5 characters'
];

const fileRules = [
  (value: File[]) => !value || value.length <= 1 || 'Only one file can be uploaded',
  (value: File[]) => !value || value[0]?.size <= 10 * 1024 * 1024 || 'Upload pdf,png or jpg and be less than 10 MB',
];

const currentIcon = ref('');
const currentColor = ref('');

function getDifficultyColor(level: string) {
  if (level === 'EASY') return 'grey';
  if (level === 'MEDIUM') return 'grey';
  if (level === 'HARD') return 'grey';
  return 'grey';
}

function getDifficultyIcon(level: string) {
  if (level === 'EASY') return 'mdi-wifi-strength-1';
  if (level === 'MEDIUM') return 'mdi-wifi-strength-2';
  if (level === 'HARD') return 'mdi-wifi-strength-3';
  return 'mdi-help-circle-outline';
}



// Watch for question changes
watch(currentQuestion, (newVal) => {
  if (newVal?.difficulty) {
    currentIcon.value = getDifficultyIcon(newVal.difficulty);
    currentColor.value = getDifficultyColor(newVal.difficulty);
  }
}, { immediate: true });


// Reactive state 
const showAnswers = ref(false);
const showSingleQuestion = ref(true);
const currentSaveStatus = ref(false);
const loading = ref(true);

// Answer structure
interface Answer {
  text: string;
  file: File | null;
  fileName: string;
  fileUrl: string;
  submitted: boolean;
}

// Initialize userAnswers with default values immediately
const userAnswers = ref<Answer[]>(questions.value.map(() => ({
  text: '',
  file: null,
  fileName: '',
  fileUrl: '',
  submitted: false
})));
const canSubmit = computed(() => {
  if (responseType.value === 'text') {
    return currentAnswer.value.text.length >= 5;
  } else if (responseType.value === 'file') {
    return !!currentAnswer.value.file;
  } else { // both
    return currentAnswer.value.text.length >= 5 && !!currentAnswer.value.file;
  }
});

// Save status
const saveStatus = ref<'unsaved' | 'saved' | 'saving'>('unsaved');
const saveStatusColor = computed(() => ({
  unsaved: 'red',
  saved: 'green',
  saving: 'orange'
}[saveStatus.value]));

const saveStatusIcon = computed(() => ({
  unsaved: 'mdi-alert-circle',
  saved: 'mdi-check-circle',
  saving: 'mdi-progress-upload'
}[saveStatus.value]));

const saveStatusText = computed(() => ({
  unsaved: 'Unsaved',
  saved: 'Saved',
  saving: 'Saving...'
}[saveStatus.value]));

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
});

// Handle file changes
const handleFileChange = () => {
  if (currentAnswer.value.file) {
    currentAnswer.value.fileName = currentAnswer.value.file?.name || '';
    currentAnswer.value.fileUrl = URL.createObjectURL(currentAnswer.value.file as Blob);
  } else {
    currentAnswer.value.fileName = '';
    currentAnswer.value.fileUrl = '';
  }
  saveStatus.value = 'unsaved';
};

// Remove file
const removeFile = () => {
  currentAnswer.value.file = null;
  currentAnswer.value.fileName = '';
  currentAnswer.value.fileUrl = '';
  saveStatus.value = 'unsaved';
};

// Submit current question
const submitCurrentQuestion = async () => {
  saving.value = true;
  saveStatus.value = 'saving';

  try {
    // Validate based on response type
    if (responseType.value === 'text' && !currentAnswer.value.text) {
      throw new Error('Text response is required');
    }
    if (responseType.value === 'file' && !currentAnswer.value.file) {
      throw new Error('File upload is required');
    }
    if (responseType.value === 'both' && (!currentAnswer.value.text || !currentAnswer.value.file)) {
      throw new Error('Both text and file are required');
    }

    // Mark as submitted
    currentAnswer.value.submitted = true;

    // Save to localStorage
    localStorage.setItem('leq_answers', JSON.stringify(userAnswers.value));

    saveStatus.value = 'saved';
    showSnackbar('Response submitted successfully!', 'success');
  } catch (error) {
    console.error('Submission failed:', error);
    // @ts-ignore
    showSnackbar(error || 'Failed to submit response. Please try again.', 'error');
  } finally {
    saving.value = false;
  }
};
const saveArticle = async () => {
  const paramsObjRaw = [
    {
      //@ts-ignore
      questionId: currentQuestion.id,
      respondentId: localStorage.getItem('sessionId'),
      questionTypedResponseContent: JSON.stringify(currentAnswer.value.text),
    },
  ];
  console.log({ paramsObjRaw });

  const questionDetails = JSON.stringify(paramsObjRaw);
  // await questionStore.handleSaveSectionBTypedResponse({ questionDetails });  
};
// Move to next question
const moveToNextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
    responseType.value = 'text'; // Reset for next question
  }
};

// Show snackbar
const showSnackbar = (message: string, color: 'success' | 'error' | 'info') => {
  snackbar.value = { show: true, message, color };
};
// Initialize questions and answers

// Load saved answers if they exist
onMounted(() => {
  const savedAnswers = localStorage.getItem('leq_answers');
  if (savedAnswers) {
    try {
      const parsed = JSON.parse(savedAnswers);
      if (Array.isArray(parsed) && parsed.length === questions.value.length) {
        userAnswers.value = parsed;
        saveStatus.value = 'saved';
      }
    } catch (e) {
      console.error('Failed to parse saved answers', e);
    }
  }
});
</script>
<style scoped>
.leq-container {
  max-width: 90%;
  margin: 0 auto;
  padding: 20px;
  max-height: 96vh;

  overflow: auto !important; /* Enables scrolling if content overflows */
} 


.v-card {
  margin-bottom: 20px;
}

.uploaded-file {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.v-radio-group {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
}
</style>