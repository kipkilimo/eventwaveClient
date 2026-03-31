<template>
    <v-container fluid class="exam-center-container">

        <!-- Header with Create Button -->
        <v-row class="mb-2" align="center" justify="space-between" no-gutters>
            <v-col class="d-flex align-center" cols="auto">
                <router-link :to="route.path.includes('computing') ? '/dashboard/library' : '/dashboard/library'"
                    class="d-flex align-center mr-4">
                    <v-img src="https://a2z-v0.s3.eu-central-1.amazonaws.com/Screenshot+from+2024-10-22+16-31-16.png"
                        width="150" height="90" @click="
                            resourceStore.setCurrentSubjectArea('Epidemiology');
                        resourceStore.showingResourceTitles = true;
                        resourceStore.showingResourceTitleItems = false;
                        " />
                </router-link>

                <v-card-title color="#6a808b" class="text-h5 font-weight-bold mb-0">NEMBio Exam Center</v-card-title>
            </v-col>

            <v-col class="d-flex justify-end" cols="auto">
                <v-btn variant="tonal" color="primary" prepend-icon="mdi-file-edit-outline"
                    @click="resourceStore.chooseCreateExam = true">
                    Create New Exam
                </v-btn>
            </v-col>
        </v-row>


        <v-divider />

        <v-progress-linear :indeterminate="true" v-if="isLoading"></v-progress-linear>
        <!-- Exam Cards Grid -->

        <v-row v-if="examStore.exams.length > 0 && isLoading === false">
            <v-col v-for="exam in examStore.exams" :key="exam.id" cols="12" md="4">
                <v-card class="exam-card ma-4" elevation="4" color="#f5f7fa"
                    style="border-radius: 12px; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease;">
                    <v-card-title class="d-flex align-center"
                        style="background: linear-gradient(135deg, #f8f9fa f5f7fa 0%, #e4e8ed 100%); border-bottom: 1px solid #e0e0e0;">
                        <span class="text-h6 text-truncate" v-tooltip.bottom="exam.title"
                            style="font-weight: 600; color: #2c3e50;">{{ exam.title }} |
                            {{ exam.isRevisionSession ? 'Revision' : 'Exam' }}</span>
                        <v-spacer />
                        <v-menu>
                            <template v-slot:activator="{ props }">
                                <v-btn icon v-bind="props" variant="text" style="color: #5c6bc0;">
                                    <v-icon>mdi-dots-vertical</v-icon>
                                </v-btn>
                            </template>
                            <v-list density="compact"
                                style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                                <template v-for="(action, index) in dotActions" :key="index">
                                    <v-list-item v-if="action.type === 'list-item'" @click="action.click(exam)"
                                        style="border-bottom: 1px solid #f0f0f0;">
                                        <v-btn variant="text" :prepend-icon="action.icon"
                                            :class="action.color === 'error' ? 'text-error' : ''"
                                            :style="{ color: action.color, fontWeight: '500' }">
                                            {{ action.title }}
                                        </v-btn>
                                    </v-list-item>

                                    <v-btn v-else-if="action.type === 'button'" color="info" variant="text"
                                        @click="action.click(exam)" style="font-weight: 500; letter-spacing: 0.3px;">
                                        <v-icon left style="font-size: 18px;">{{ action.icon }}</v-icon>
                                        {{ action.getCount(exam) }} {{ action.title.toLowerCase() }}
                                    </v-btn>
                                </template>
                            </v-list>

                        </v-menu>
                    </v-card-title>

                    <v-card-text style="padding: 16px 20px;">
                        <div class="d-flex align-center mb-2" style="color: #4a5568;">
                            <v-icon color="primary" class="mr-2" style="font-size: 20px;">mdi-calendar</v-icon>
                            <span style="font-size: 14px;">{{ formatDate(exam.examDate, exam.timeZone) }} ({{
                                exam.timeZone }})</span>
                        </div>
                        <div class="d-flex align-center mb-2" style="color: #4a5568;">
                            <v-icon color="primary" class="mr-2" style="font-size: 20px;">mdi-key</v-icon>
                            <span style="font-size: 14px;">Exam ID Key: {{ exam.accessKey || 'N/A' }}</span>
                        </div>
                        <div class="d-flex align-center mb-2" style="color: #4a5568;">
                            <v-icon color="primary" class="mr-2" style="font-size: 20px;">mdi-account</v-icon>
                            <span style="font-size: 14px;">Created by:
                                {{ exam.createdBy?.personalInfo?.fullName || 'Unknown' }}</span>
                        </div>
                        <v-chip-group class="mt-2">
                            <v-chip variant="outlined" rounded size="small"
                                v-for="difficulty in exam.difficultyDistribution" :key="difficulty"
                                :color="getDifficultyColor(difficulty)"
                                style="font-weight: 500; letter-spacing: 0.5px;">
                                {{ difficulty }}
                            </v-chip>
                        </v-chip-group>
                    </v-card-text>

                    <v-divider style="border-color: #e0e0e0;"></v-divider>

                    <v-card-actions class="justify-space-between"
                        style="padding: 12px 20px; background-color: #e5e5e5;">

                        <v-spacer />
                        <v-btn color="success" variant="text" @click="enrollParticipants(exam)"
                            style="font-weight: 500; margin-right: 8px;">
                            <v-icon left style="font-size: 18px;">mdi-account-plus</v-icon>
                            Enroll
                        </v-btn>
                        <v-btn color="warning" variant="text" @click="startExam(exam)"
                            style="font-weight: 500; margin-right: 8px;">
                            <v-icon left style="font-size: 18px;">mdi-play</v-icon>
                            {{ exam.isRevisionSession ? 'Open' : 'Start' }}
                        </v-btn>
                        <v-btn color="secondary" variant="text" @click="gradeExam(exam)" style="font-weight: 500;">
                            <v-icon left style="font-size: 18px;">mdi-clipboard-check</v-icon>
                            Grade
                        </v-btn>
                        <v-spacer />
                    </v-card-actions>
                </v-card>

            </v-col>
        </v-row>

        <v-row v-if="examStore.exams.length === 0 && isLoading === false">
            <v-col cols="12" class="text-center">
                <v-alert type="info" variant="tonal">
                    No exams found. Create your first exam to get started.
                </v-alert>
            </v-col>
        </v-row>

        <!-- Create Exam Dialog      <v-dialog v-model="dialogCreate" max-width="600" persistent>
            <ExamForm :exam="emptyExam" :title="'Create New Exam'" @submit="createExam"
                @cancel="dialogCreate = false" />
        </v-dialog>-->


        <!-- Edit Exam Dialog -->
        <v-dialog v-model="dialogEdit" max-width="600" persistent>
            <ExamForm v-if="selectedExam" :exam="selectedExam" :title="'Edit Exam'" @submit="updateExam"
                @cancel="dialogEdit = false" />
        </v-dialog>

        <!-- Participants Dialog -->
        <v-dialog v-model="dialogParticipants" max-width="800">
            <v-card>
                <v-card-title class="d-flex align-center">
                    <span>Participants for {{ selectedExam?.title }}</span>
                    <v-spacer />
                    <v-btn icon @click="dialogParticipants = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-data-table :headers="participantHeaders" :items="selectedExam?.participants || []"
                        item-value="userId" class="elevation-1">
                        <template #item.actions="{ item }">
                            <v-btn icon color="error" variant="text"
                                @click="removeParticipant(selectedExam.id, item.userId)">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Enroll Participants Dialog -->
        <v-dialog v-model="dialogEnroll" max-width="800">
            <v-card>
                <v-card-title>Enroll Participants</v-card-title>
                <v-card-text>
                    <v-data-table v-model="selectedUsers" :headers="preRegistrationHeaders"
                        :items="selectedExam?.examPreRegistrationDetails || []" show-select item-value="userId"
                        class="elevation-1">
                        <template #item.name="{ item }">
                            {{ item.name || 'Anonymous' }}
                        </template>
                        <template #item.emailAddress="{ item }">
                            {{ item.emailAddress || 'No email' }}
                        </template>
                    </v-data-table>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="dialogEnroll = false">Cancel</v-btn>
                    <v-btn color="primary" @click="enrollSelected">Enroll Selected</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Grade Exam Dialog -->
        <v-dialog v-model="dialogGrade" max-width="1200" fullscreen>
            <v-card v-if="selectedExam">
                <v-toolbar color="primary" dark>
                    <v-toolbar-title>
                        Grading: {{ selectedExam.title }}
                    </v-toolbar-title>
                    <v-spacer />
                    <v-btn icon @click="dialogGrade = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>

                <v-card-text>
                    <v-tabs v-model="gradingTab" grow>
                        <v-tab value="summary">Summary</v-tab>
                        <v-tab value="detailed">Detailed Responses</v-tab>
                    </v-tabs>

                    <v-window v-model="gradingTab">
                        <v-window-item value="summary">
                            <v-data-table :headers="gradingHeaders" :items="gradingData" class="elevation-1 mt-4">
                                <template #item.score="{ item }">
                                    <v-progress-linear :model-value="item.score" height="20"
                                        :color="getScoreColor(item.score)" rounded>
                                        <template v-slot:default="{ value }">
                                            <strong>{{ value }}%</strong>
                                        </template>
                                    </v-progress-linear>
                                </template>
                                <template #item.actions="{ item }">
                                    <v-btn color="primary" variant="text" @click="viewDetailedResponses(item)">
                                        View Details
                                    </v-btn>
                                </template>
                            </v-data-table>
                        </v-window-item>

                        <v-window-item value="detailed">
                            <div v-if="selectedResponse">
                                <v-card class="mb-4">
                                    <v-card-title>
                                        Responses for {{ selectedResponse.name }}
                                    </v-card-title>
                                    <v-card-text>
                                        <v-list lines="two">
                                            <v-list-item v-for="(answer, idx) in selectedResponse.answers" :key="idx">
                                                <template v-slot:prepend>
                                                    <v-icon :color="answer.correct ? 'success' : 'error'" class="mr-2">
                                                        {{ answer.correct ? 'mdi-check' : 'mdi-close' }}
                                                    </v-icon>
                                                </template>
                                                <v-list-item-title>
                                                    Question {{ idx + 1 }}
                                                </v-list-item-title>
                                                <v-list-item-subtitle>
                                                    Answer: {{ answer.answer }}
                                                    <span v-if="!answer.correct">
                                                        (Correct: {{ answer.correctAnswer }})
                                                    </span>
                                                </v-list-item-subtitle>
                                            </v-list-item>
                                        </v-list>
                                    </v-card-text>
                                </v-card>
                            </div>
                            <div v-else class="text-center pa-8">
                                <v-alert type="info" variant="tonal">
                                    Select a participant from the Summary tab to view detailed responses
                                </v-alert>
                            </div>
                        </v-window-item>
                    </v-window>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Confirmation Dialog -->
        <v-dialog v-model="dialogConfirm" max-width="400">
            <v-card>
                <v-card-title>Confirm Deletion</v-card-title>
                <v-card-text>
                    Are you sure you want to delete this exam? This action cannot be undone.
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="dialogConfirm = false">Cancel</v-btn>
                    <v-btn color="error" @click="deleteConfirmed">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="resourceStore.chooseCreateExam" width="75%">
            <ExamSessionBuilder />
        </v-dialog>
        <!-- Snackbar for notifications -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
            {{ snackbar.message }}
        </v-snackbar>
        <ExamForm v-model="dialog" :initialExam="selectedExam" :editMode="isEditMode" @submit="handleFormSubmit" />

    </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useDate } from 'vuetify';
import ExamForm from './ExamForm.vue';
import { useExamStore } from '@/stores/exam'
import { useWebSocket } from '@/composables/useWebsocket'

import { DateTime } from 'luxon';
import { useRouter, useRoute } from "vue-router";
import { useResourceStore } from "@/stores/resources";
const currentUserId = localStorage.getItem("sessionId") || "";
const dotActions = [
    {
        title: 'Edit',
        icon: 'mdi-pencil',
        color: '#5c6bc0',
        click: (exam) => openEditDialog(exam),
        type: 'list-item'
    },
    {
        title: 'Delete',
        icon: 'mdi-delete',
        color: 'error',
        click: (exam) => confirmDelete(exam.id),
        type: 'list-item'
    },
    {
        title: 'Register',
        icon: 'mdi-account-multiple-plus-outline',
        getCount: (exam) => exam.examPreRegistrationDetails !== null ? exam.examPreRegistrationDetails.length : '0',
        click: (exam) => viewParticipants(exam),
        type: 'list-item'
    },
    {
        title: 'Enroll',
        icon: 'mdi-account-multiple-check',
        getCount: (exam) => exam.participants.length,
        click: (exam) => viewParticipants(exam),
        type: 'list-item'
    }
];
//useRouter
const router = useRouter();

const route = useRoute();
const resourceStore = useResourceStore();
// Stores
const examStore = useExamStore()

const isLoading = ref(false);
// Data
const exams = computed(() => examStore.exams)
onMounted(async () => {
    isLoading.value = true
    await examStore.getParticipatingExams(currentUserId)

    isLoading.value = false
})
// UI State
const dialogEdit = ref(false);
const dialogParticipants = ref(false);
const dialogEnroll = ref(false);
const dialogGrade = ref(false);
const dialogConfirm = ref(false);
const gradingTab = ref('summary');
const selectedUsers = ref([]);
const examToDelete = ref(null);
const selectedResponse = ref(null);

const selectedExam = ref(null);


const snackbar = ref({
    show: false,
    message: '',
    color: 'success'
});

// Mock grading data
const gradingData = ref([
    {
        userId: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        score: 75,
        answers: [
            { questionId: 'q1', answer: 'A', correct: true, correctAnswer: 'A' },
            { questionId: 'q2', answer: 'B', correct: false, correctAnswer: 'C' }
        ]
    },
    {
        userId: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        score: 100,
        answers: [
            { questionId: 'q1', answer: 'A', correct: true, correctAnswer: 'A' },
            { questionId: 'q2', answer: 'C', correct: true, correctAnswer: 'C' }
        ]
    }
]);

// Table Headers
const participantHeaders = [
    { title: 'Name', key: 'name' },
    { title: 'Email', key: 'email' },
    { title: 'Actions', key: 'actions' }
];

const preRegistrationHeaders = [
    { title: 'Name', key: 'name' },
    { title: 'Email', key: 'emailAddress' },
    { title: 'Course', key: 'courseTaken' },
    { title: 'Level', key: 'level' }
];

const gradingHeaders = [
    { title: 'Participant', key: 'name' },
    { title: 'Email', key: 'email' },
    { title: 'Score', key: 'score' },
    { title: 'Actions', key: 'actions' }
];

// Methods
// ✅ Convert timestamp to readable date
const formatDate = (timestamp, timeZone) => {
    return DateTime.fromMillis(Number(timestamp), {
        zone: 'utc' // Treat input as UTC
    }).setZone(timeZone) // Then convert to local zone
        .toLocaleString({
            ...DateTime.DATETIME_MED,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
};
const getDifficultyColor = (level) => {
    const colors = {
        EASY: 'green',
        MEDIUM: 'orange',
        HARD: 'red'
    };
    return colors[level] || 'grey';
};

// ✅ Methods (replace with actual logic)
const openEditDialog = (exam) => {
    console.log('Opening edit dialog for:', exam);
};

const confirmDelete = async (id) => {

    isLoading.value = true
    await examStore.deleteExam(id)
    isLoading.value = false
};

const viewParticipants = (exam) => {
    console.log('Viewing participants for:', exam);
};

const enrollParticipants = (exam) => {
    console.log('Enrolling participants for:', exam);
};

const startExam = (exam) => {
    if (exam.isRevisionSession) {
        examStore.currentExam = exam
        router.push('revision')

    } else {

        examStore.currentExam = exam
        router.push('attempt')
    }
};

const gradeExam = (exam) => {
    console.log('Grading exam:', exam);
};

// ✅ Compute the pre-registration host email (if available)
const hostEmail = computed(() => {
    return exam.value.examPreRegistrationDetails?.[0]?.emailAddress || 'N/A';
});


function removeParticipant(examId, userId) {
    const exam = examStore.exams.value.find(e => e.id === examId);
    if (exam) {
        exam.participants = exam.participants.filter(p => p.userId !== userId);
        showSnackbar('Participant removed');
    }
}


function enrollSelected() {
    if (!selectedExam.value || selectedUsers.value.length === 0 || exam.value.examPreRegistrationDetails === null) return;

    const exam = examStore.exams.value.find(e => e.id === selectedExam.value.id);
    if (exam) {
        selectedUsers.value.forEach(userId => {
            const user = exam.value.examPreRegistrationDetails.find(u => u.userId === userId);
            if (user && !exam.value.participants.some(p => p.userId === userId)) {
                exam.value.participants.push({
                    userId: user.userId,
                    name: user.name,
                    email: user.emailAddress
                });
            }
        });

        // Remove enrolled users from pre-registration
        exam.value.examPreRegistrationDetails = exam.value.examPreRegistrationDetails.filter(
            user => !selectedUsers.value.includes(user.userId)
        );

        dialogEnroll.value = false;
        showSnackbar(`${selectedUsers.value.length} participants enrolled`);
    }
}

</script>

<style scoped>
.exam-center-container {
  max-width: 99%;
  margin: 0 auto;
}

.exam-card {
  border-radius: 4px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.exam-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
}

.v-card-actions .v-btn {
  text-transform: none;
  letter-spacing: normal;
}
</style>