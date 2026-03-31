<template>
  <v-container height="75vh" class="d-flex align-center justify-center" elevation="0"
    style="border-radius: 0px 10px 10px 0px !important;">
    <v-container fluid v-if="examStore.currentQuestion">
      <v-row>
        <!-- Left Column: Question and Results -->

        <!-- Right Column: Participant Progress -->
        <v-col cols="12" md="12">
          <v-card elevation="0" class="h-100">
            <v-card-title>Participant Progress</v-card-title>
            <v-divider />

            <!-- Overall Stats -->
            <v-card-text>
              <div class="d-flex justify-space-between mb-4">
                <div>
                  <div class="text-subtitle-1">Participants</div>
                  <div class="text-h4">{{ participantCount }}</div>
                </div>
                <div>
                  <div class="text-subtitle-1">Answered</div>
                  <div class="text-h4">{{ answeredCount }} ({{ answeredPercentage }}%)</div>
                </div>
                <div>
                  <div class="text-subtitle-1">Correct</div>
                  <div class="text-h4">{{ correctCount }} ({{ correctPercentage }}%)</div>
                </div>
              </div>

              <v-progress-linear :model-value="answeredPercentage" height="20" color="primary" striped>
                <template v-slot:default="{ value }">
                  <strong>{{ Math.ceil(value) }}% Answered</strong>
                </template>
              </v-progress-linear>
            </v-card-text>

            <!-- Leaderboard -->
            <v-card-text>
              <v-list lines="two">
                <v-list-subheader>Top Participants</v-list-subheader>
                <v-list-item v-for="(participant, index) in sortedParticipants" :key="participant.id">
                  <template v-slot:prepend>
                    <v-avatar color="primary" size="40">
                      <span class="text-white">{{ index + 1 }}</span>
                    </v-avatar>
                  </template>

                  <v-list-item-title>
                    {{ participant.name || `Participant ${participant.id.slice(0, 6)}` }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    Score: {{ participant.score }} |
                    Speed: {{ participant.averageTime }}s
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-chip :color="getAccuracyColor(participant.accuracy)">
                      {{ participant.accuracy }}%
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Waiting State -->
    <v-card v-else class="waiting-card">
      <v-card-text class="text-h5 text-center">
        <strong>Waiting for session to start...</strong>
      </v-card-text>
      <v-progress-linear indeterminate color="primary"></v-progress-linear>
    </v-card>
  </v-container>
</template>
<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useWebSocket } from '@/composables/useWebsocket'
import WordCloud from './WordCloud.vue'
import MultiSelectChart from './MultiSelectChart.vue'

import { useExamStore } from "@/stores/exam";
Chart.register(...registerables)

const examStore = useExamStore()
const chartRef = ref(null)
let chartInstance = null

// Current responses
const currentResponses = ref([])
const showCorrectAnswer = ref(false)

// Participant data
const participants = ref([])
const participantResponses = ref({})

// WebSocket connection
const { connectWebSocket, sendMessage } = useWebSocket(
  'exam',
  computed(() => examStore.exam?.sessionId),
  computed(() => examStore.exam?.accessKey),
  handleWebSocketMessage
)

// Computed properties
const participantCount = computed(() => participants.value.length)
const answeredCount = computed(() => {
  return Object.values(participantResponses.value).filter(r =>
    r.responses[examStore.currentQuestion?.id]?.submittedAt
  ).length
})
const answeredPercentage = computed(() => {
  return participantCount.value > 0
    ? Math.round((answeredCount.value / participantCount.value) * 100)
    : 0
})

const correctCount = computed(() => {
  return Object.values(participantResponses.value).filter(r =>
    r.responses[examStore.currentQuestion?.id]?.isCorrect
  ).length
})
const correctPercentage = computed(() => {
  return answeredCount.value > 0
    ? Math.round((correctCount.value / answeredCount.value) * 100)
    : 0
})

const sortedParticipants = computed(() => {
  return [...participants.value]
    .map(p => ({
      ...p,
      score: calculateParticipantScore(p.id),
      accuracy: calculateParticipantAccuracy(p.id),
      averageTime: calculateAverageTime(p.id)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
})

// Methods
function handleWebSocketMessage(receivedData) {
  switch (receivedData.action) {
    case 'exam_data':
      handleExamData(receivedData.data)
      break
    case 'question_activated':
      handleQuestionActivated(receivedData.data)
      break
    case 'participant_joined':
      handleParticipantJoined(receivedData.data)
      break
    case 'response_submitted':
      handleResponseSubmitted(receivedData.data)
      break
    case 'show_correct_answer':
      showCorrectAnswer.value = true
      break
  }
}

function handleExamData(data) {
  participants.value = data.participants
  examStore.sessionStarted = true
}

function handleQuestionActivated(data) {
  examStore.setCurrentQuestion(data.questionId)
  showCorrectAnswer.value = false
  renderChart()
}

function handleParticipantJoined(data) {
  if (!participants.value.some(p => p.id === data.id)) {
    participants.value.push(data)
  }
}

function handleResponseSubmitted(data) {
  if (!participantResponses.value[data.participantId]) {
    participantResponses.value[data.participantId] = { responses: {} }
  }

  participantResponses.value[data.participantId].responses[data.questionId] = {
    submittedAt: new Date().toISOString(),
    isCorrect: data.isCorrect,
    timeSeconds: data.timeSeconds
  }

  // Update chart if this response is for the current question
  if (data.questionId === examStore.currentQuestion?.id) {
    currentResponses.value = [
      ...currentResponses.value,
      {
        participantId: data.participantId,
        selectedAnswers: data.selectedAnswers,
        isCorrect: data.isCorrect
      }
    ]
    renderChart()
  }
}

function calculateParticipantScore(participantId) {
  const responses = participantResponses.value[participantId]?.responses || {}
  return Object.values(responses).filter(r => r.isCorrect).length * 10
}

function calculateParticipantAccuracy(participantId) {
  const responses = participantResponses.value[participantId]?.responses || {}
  const total = Object.keys(responses).length
  const correct = Object.values(responses).filter(r => r.isCorrect).length
  return total > 0 ? Math.round((correct / total) * 100) : 0
}

function calculateAverageTime(participantId) {
  const responses = participantResponses.value[participantId]?.responses || {}
  const times = Object.values(responses).map(r => r.timeSeconds)
  return times.length > 0
    ? (times.reduce((a, b) => a + b, 0) / times.length)
    : 0
}

function getAccuracyColor(accuracy) {
  if (accuracy >= 80) return 'green'
  if (accuracy >= 50) return 'orange'
  return 'red'
}

function renderChart() {
  if (!examStore.currentQuestion || !chartRef.value) return

  const ctx = chartRef.value.getContext('2d')
  if (chartInstance) chartInstance.destroy()

  switch (examStore.currentQuestion.questionType) {
    case 'QUICK_TRUE_FALSE':
    case 'SINGLE_SELECT':
      renderSingleSelectChart(ctx)
      break
    // Other chart types handled by their respective components
  }
}

function renderSingleSelectChart(ctx) {
  const options = examStore.currentQuestion.choices || ['True', 'False']
  const responses = currentResponses.value.flatMap(r => r.selectedAnswers)

  const counts = options.map(option =>
    responses.filter(r => r === option).length
  )

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: options,
      datasets: [{
        label: 'Responses',
        data: counts,
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = counts.reduce((a, b) => a + b, 0)
              const percentage = total > 0
                ? Math.round((context.raw / total) * 100)
                : 0
              return `${context.raw} responses (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

// Lifecycle hooks
onMounted(() => {
  connectWebSocket()
})

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>
<style scoped>
.waiting-card {
  padding: 2rem;
  text-align: center;
  width: 100%;
}

.h-100 {
  height: 100%;
}

.v-progress-linear {
  border-radius: 4px;
}

.v-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
</style>