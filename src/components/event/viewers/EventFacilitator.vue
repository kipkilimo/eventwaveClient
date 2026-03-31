<template>
  <div class="event-facilitator">
    <v-container>
      <v-row>
        <v-col cols="12">
          <EventHeader :event="event" :role="'facilitator'" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="8">
          <!-- Main Content Area -->
          <v-card class="mb-4">
            <v-card-title>Session Controls</v-card-title>
            <v-card-text>
              <v-btn
                color="primary"
                class="mr-2"
                @click="startSession"
                :loading="sessionLoading"
                :disabled="sessionStatus === 'ACTIVE'"
              >
                <v-icon left>mdi-play</v-icon>
                Start Session
              </v-btn>
              <v-btn
                color="warning"
                class="mr-2"
                @click="pauseSession"
                :loading="sessionLoading"
                :disabled="sessionStatus !== 'ACTIVE'"
              >
                <v-icon left>mdi-pause</v-icon>
                Pause
              </v-btn>
              <v-btn
                color="error"
                @click="endSession"
                :loading="sessionLoading"
                :disabled="sessionStatus === 'ENDED'"
              >
                <v-icon left>mdi-stop</v-icon>
                End Session
              </v-btn>
              <v-chip
                v-if="sessionStatus"
                class="ml-4"
                :color="getSessionStatusColor(sessionStatus)"
                dark
              >
                {{ getSessionStatusLabel(sessionStatus) }}
              </v-chip>
            </v-card-text>
          </v-card>

          <!-- Live Stream/Video Area -->
          <v-card class="mb-4">
            <v-card-title>
              Live Session
              <v-spacer></v-spacer>
              <v-chip
                v-if="isStreaming"
                color="error"
                size="small"
                class="mr-2"
              >
                <v-icon left size="12">mdi-circle</v-icon>
                LIVE
              </v-chip>
            </v-card-title>
            <v-card-text>
              <div
                class="video-placeholder text-center pa-8"
                :class="{ 'stream-active': isStreaming }"
              >
                <v-icon size="64" :color="isStreaming ? 'error' : 'grey'">
                  {{ isStreaming ? "mdi-video" : "mdi-video-off" }}
                </v-icon>
                <p v-if="!isStreaming">
                  Video stream will appear here when session starts
                </p>
                <video
                  v-else
                  ref="videoElement"
                  class="stream-video"
                  autoplay
                  playsinline
                  controls
                ></video>
              </div>
            </v-card-text>
          </v-card>

          <!-- Q&A Management -->
          <v-card>
            <v-card-title>
              Q&A Management
              <v-spacer></v-spacer>
              <v-badge :content="pendingQuestions.length" color="error" overlap>
                <v-icon>mdi-help-circle</v-icon>
              </v-badge>
            </v-card-title>
            <v-card-text>
              <v-list v-if="pendingQuestions.length > 0">
                <v-list-item
                  v-for="question in pendingQuestions"
                  :key="question.id"
                  class="question-item"
                >
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-medium">
                      {{ question.question }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      Asked by: {{ question.userName }} •
                      {{ formatTime(question.timestamp) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn
                      icon
                      size="small"
                      color="success"
                      @click="openAnswerDialog(question)"
                      :loading="answeringQuestion === question.id"
                    >
                      <v-icon>mdi-check</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
              <v-alert v-else type="info" variant="tonal" class="mt-2">
                No pending questions
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Participants List -->
          <v-card class="mb-4">
            <v-card-title>
              Participants ({{ participants.length }})
              <v-spacer></v-spacer>
              <v-btn
                icon
                size="small"
                @click="refreshParticipants"
                :loading="participantsLoading"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text class="participants-list">
              <v-list dense>
                <v-list-item
                  v-for="participant in participants"
                  :key="participant.id"
                  class="participant-item"
                >
                  <v-list-item-avatar size="32">
                    <v-avatar color="primary" size="32">
                      <span class="white--text text-caption">{{
                        getInitials(participant.name)
                      }}</span>
                    </v-avatar>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{
                      participant.name
                    }}</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip
                        :color="getParticipantStatusColor(participant.status)"
                        size="x-small"
                        class="status-chip"
                      >
                        {{ participant.status || "Active" }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn icon size="small" v-bind="props">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="muteParticipant(participant)">
                          <v-list-item-icon>
                            <v-icon>mdi-microphone-off</v-icon>
                          </v-list-item-icon>
                          <v-list-item-content>Mute</v-list-item-content>
                        </v-list-item>
                        <v-list-item @click="removeParticipant(participant)">
                          <v-list-item-icon>
                            <v-icon>mdi-account-remove</v-icon>
                          </v-list-item-icon>
                          <v-list-item-content>Remove</v-list-item-content>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Polls -->
          <v-card class="mb-4">
            <v-card-title>
              Polls
              <v-spacer></v-spacer>
              <v-btn
                icon
                size="small"
                @click="openCreatePollDialog"
                :disabled="!isSessionActive"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-list v-if="polls.length > 0">
                <v-list-item v-for="poll in polls" :key="poll.id">
                  <v-list-item-content>
                    <v-list-item-title>{{ poll.question }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ poll.responses }} responses • {{ poll.status }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon size="small" @click="viewPollResults(poll)">
                      <v-icon>mdi-chart-bar</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
              <v-alert v-else type="info" variant="tonal" class="mt-2">
                No polls created yet
              </v-alert>
            </v-card-text>
          </v-card>

          <!-- Quick Actions -->
          <v-card>
            <v-card-title>Quick Actions</v-card-title>
            <v-card-text>
              <v-btn
                block
                class="mb-2"
                color="info"
                @click="shareScreen"
                :disabled="!isSessionActive"
              >
                <v-icon left>mdi-monitor-share</v-icon>
                Share Screen
              </v-btn>
              <v-btn
                block
                class="mb-2"
                color="success"
                @click="openAnnouncementDialog"
                :disabled="!isSessionActive"
              >
                <v-icon left>mdi-bullhorn</v-icon>
                Make Announcement
              </v-btn>
              <v-btn block color="primary" @click="shareResources">
                <v-icon left>mdi-folder-open</v-icon>
                Share Resources
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Answer Question Dialog -->
    <v-dialog v-model="showAnswerDialog" max-width="600">
      <v-card>
        <v-card-title>Answer Question</v-card-title>
        <v-card-text>
          <p class="font-weight-medium mb-2">Question:</p>
          <p class="mb-4">{{ selectedQuestion?.question }}</p>
          <v-textarea
            v-model="answerText"
            label="Your Answer"
            rows="3"
            outlined
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showAnswerDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="submitAnswer"
            :loading="submittingAnswer"
          >
            Submit Answer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Poll Dialog -->
    <v-dialog v-model="showPollDialog" max-width="500">
      <v-card>
        <v-card-title>Create Poll</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newPoll.question"
            label="Poll Question"
            required
          ></v-text-field>
          <div class="mb-4">
            <label class="text-subtitle-2">Options</label>
            <div
              v-for="(option, index) in newPoll.options"
              :key="index"
              class="d-flex align-center mt-2"
            >
              <v-text-field
                v-model="newPoll.options[index]"
                :label="`Option ${index + 1}`"
                dense
                hide-details
              ></v-text-field>
              <v-btn
                icon
                size="small"
                color="error"
                @click="removePollOption(index)"
                class="ml-2"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
            <v-btn text small class="mt-2" @click="addPollOption">
              <v-icon left>mdi-plus</v-icon>
              Add Option
            </v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showPollDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="createPoll" :loading="creatingPoll">
            Create Poll
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Announcement Dialog -->
    <v-dialog v-model="showAnnouncementDialog" max-width="500">
      <v-card>
        <v-card-title>Make Announcement</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="announcementText"
            label="Announcement Message"
            rows="4"
            outlined
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showAnnouncementDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="sendAnnouncement"
            :loading="sendingAnnouncement"
          >
            Send Announcement
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

import { useEventStore } from "@/stores/event";
import { useUserStore } from "@/stores/user";
import type { Event, User } from "@/stores/event";
import EventHeader from "./common/EventHeader.vue";

// GraphQL mutations (to be implemented)
// import { gql } from '@apollo/client/core'
// import { apolloClient } from '@/plugins/apollo'

// Types
interface Participant extends User {
  status?: string;
  isMuted?: boolean;
}

interface Question {
  id: string;
  question: string;
  userName: string;
  timestamp: Date;
  answer?: string;
}

interface Poll {
  id: string;
  question: string;
  options: string[];
  responses: number;
  status: "active" | "closed";
  createdAt: Date;
}

interface Announcement {
  id: string;
  message: string;
  timestamp: Date;
}

// Props
interface Props {
  event: Event;
  userRole: string;
  currentUser: User | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  (e: "refresh"): void;
  (e: "updateEvent", event: Event): void;
  (e: "sessionStatusChange", status: string): void;
}>();

// Store instances
const eventStore = useEventStore();
const authStore = useAuthStore();

// Refs
const sessionLoading = ref(false);
const sessionStatus = ref(props.event.status || "PENDING");
const isStreaming = ref(false);
const videoElement = ref<HTMLVideoElement | null>(null);
const participantsLoading = ref(false);
const pendingQuestions = ref<Question[]>([]);
const polls = ref<Poll[]>([]);
const answeringQuestion = ref<string | null>(null);
const showAnswerDialog = ref(false);
const selectedQuestion = ref<Question | null>(null);
const answerText = ref("");
const submittingAnswer = ref(false);
const showPollDialog = ref(false);
const creatingPoll = ref(false);
const newPoll = ref({
  question: "",
  options: ["", ""],
});
const showAnnouncementDialog = ref(false);
const announcementText = ref("");
const sendingAnnouncement = ref(false);

// Computed
const participants = computed(() => props.event.participants || []);
const isSessionActive = computed(() => sessionStatus.value === "ACTIVE");

// Helper methods
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatTime = (timestamp: Date | string) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getSessionStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: "grey",
    ACTIVE: "success",
    PAUSED: "warning",
    ENDED: "error",
  };
  return colors[status] || "grey";
};

const getSessionStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: "Not Started",
    ACTIVE: "Live",
    PAUSED: "Paused",
    ENDED: "Ended",
  };
  return labels[status] || status;
};

const getParticipantStatusColor = (status?: string) => {
  const colors: Record<string, string> = {
    Active: "success",
    Away: "warning",
    Muted: "grey",
    Disconnected: "error",
  };
  return colors[status || "Active"] || "success";
};

// Session management methods
const startSession = async () => {
  sessionLoading.value = true;
  try {
    // Call GraphQL mutation to start session
    // await startSessionMutation({ eventId: props.event.id })
    sessionStatus.value = "ACTIVE";
    isStreaming.value = true;
    emit("sessionStatusChange", "ACTIVE");

    // Initialize video stream
    await initVideoStream();
  } catch (error) {
    console.error("Failed to start session:", error);
  } finally {
    sessionLoading.value = false;
  }
};

const pauseSession = async () => {
  sessionLoading.value = true;
  try {
    // await pauseSessionMutation({ eventId: props.event.id })
    sessionStatus.value = "PAUSED";
    isStreaming.value = false;
    emit("sessionStatusChange", "PAUSED");

    // Stop video stream
    stopVideoStream();
  } catch (error) {
    console.error("Failed to pause session:", error);
  } finally {
    sessionLoading.value = false;
  }
};

const endSession = async () => {
  sessionLoading.value = true;
  try {
    // await endSessionMutation({ eventId: props.event.id })
    sessionStatus.value = "ENDED";
    isStreaming.value = false;
    emit("sessionStatusChange", "ENDED");

    // Clean up video stream
    stopVideoStream();
  } catch (error) {
    console.error("Failed to end session:", error);
  } finally {
    sessionLoading.value = false;
  }
};

const initVideoStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (videoElement.value) {
      videoElement.value.srcObject = stream;
    }
  } catch (error) {
    console.error("Failed to access camera/microphone:", error);
  }
};

const stopVideoStream = () => {
  if (videoElement.value && videoElement.value.srcObject) {
    const tracks = (videoElement.value.srcObject as MediaStream).getTracks();
    tracks.forEach((track) => track.stop());
    videoElement.value.srcObject = null;
  }
};

// Q&A methods
const openAnswerDialog = (question: Question) => {
  selectedQuestion.value = question;
  answerText.value = "";
  showAnswerDialog.value = true;
};

const submitAnswer = async () => {
  if (!selectedQuestion.value || !answerText.value.trim()) return;

  submittingAnswer.value = true;
  answeringQuestion.value = selectedQuestion.value.id;

  try {
    // GraphQL mutation to answer question
    // await answerQuestionMutation({
    //   questionId: selectedQuestion.value.id,
    //   answer: answerText.value,
    //   facilitatorId: props.currentUser?.id
    // })

    // Remove from pending questions
    const index = pendingQuestions.value.findIndex(
      (q) => q.id === selectedQuestion.value?.id,
    );
    if (index !== -1) {
      pendingQuestions.value.splice(index, 1);
    }

    showAnswerDialog.value = false;
  } catch (error) {
    console.error("Failed to submit answer:", error);
  } finally {
    submittingAnswer.value = false;
    answeringQuestion.value = null;
  }
};

// Poll methods
const openCreatePollDialog = () => {
  newPoll.value = { question: "", options: ["", ""] };
  showPollDialog.value = true;
};

const addPollOption = () => {
  newPoll.value.options.push("");
};

const removePollOption = (index: number) => {
  newPoll.value.options.splice(index, 1);
};

const createPoll = async () => {
  if (
    !newPoll.value.question ||
    newPoll.value.options.some((opt) => !opt.trim())
  ) {
    return;
  }

  creatingPoll.value = true;

  try {
    // GraphQL mutation to create poll
    // const result = await createPollMutation({
    //   eventId: props.event.id,
    //   question: newPoll.value.question,
    //   options: newPoll.value.options.filter(opt => opt.trim())
    // })

    // Add to polls list
    polls.value.push({
      id: Date.now().toString(),
      question: newPoll.value.question,
      options: newPoll.value.options.filter((opt) => opt.trim()),
      responses: 0,
      status: "active",
      createdAt: new Date(),
    });

    showPollDialog.value = false;
  } catch (error) {
    console.error("Failed to create poll:", error);
  } finally {
    creatingPoll.value = false;
  }
};

const viewPollResults = (poll: Poll) => {
  console.log("View poll results:", poll);
  // Implement poll results dialog
};

// Participant management
const refreshParticipants = async () => {
  participantsLoading.value = true;
  try {
    // await eventStore.fetchEvent(props.event.id)
    emit("refresh");
  } catch (error) {
    console.error("Failed to refresh participants:", error);
  } finally {
    participantsLoading.value = false;
  }
};

const muteParticipant = async (participant: Participant) => {
  console.log("Mute participant:", participant);
  // Implement mute functionality
};

const removeParticipant = async (participant: Participant) => {
  if (confirm(`Remove ${participant.name} from the event?`)) {
    try {
      await eventStore.updateEventRoles(
        props.event.id,
        "participant",
        [],
        [participant.email || participant.id],
      );
      emit("refresh");
    } catch (error) {
      console.error("Failed to remove participant:", error);
    }
  }
};

// Announcement methods
const openAnnouncementDialog = () => {
  announcementText.value = "";
  showAnnouncementDialog.value = true;
};

const sendAnnouncement = async () => {
  if (!announcementText.value.trim()) return;

  sendingAnnouncement.value = true;

  try {
    // GraphQL mutation to send announcement
    // await sendAnnouncementMutation({
    //   eventId: props.event.id,
    //   message: announcementText.value,
    //   senderId: props.currentUser?.id
    // })

    showAnnouncementDialog.value = false;
    announcementText.value = "";
  } catch (error) {
    console.error("Failed to send announcement:", error);
  } finally {
    sendingAnnouncement.value = false;
  }
};

// Resource sharing
const shareResources = () => {
  console.log("Share resources");
  // Implement resource sharing dialog
};

const shareScreen = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    if (videoElement.value) {
      videoElement.value.srcObject = stream;
      isStreaming.value = true;
    }
  } catch (error) {
    console.error("Failed to share screen:", error);
  }
};

// Subscriptions for real-time updates
let questionSubscription: any = null;
let pollSubscription: any = null;
let participantSubscription: any = null;

const subscribeToQuestions = () => {
  // GraphQL subscription for new questions
  // questionSubscription = apolloClient.subscribe({
  //   query: QUESTION_SUBSCRIPTION,
  //   variables: { eventId: props.event.id }
  // }).subscribe({
  //   next: ({ data }) => {
  //     if (data?.newQuestion) {
  //       pendingQuestions.value.unshift(data.newQuestion)
  //     }
  //   }
  // })
};

const subscribeToPolls = () => {
  // GraphQL subscription for poll updates
};

const subscribeToParticipants = () => {
  // GraphQL subscription for participant updates
};

// Lifecycle
onMounted(() => {
  console.log("Facilitator view mounted for event:", props.event.id);

  // Subscribe to real-time updates
  subscribeToQuestions();
  subscribeToPolls();
  subscribeToParticipants();
});

onUnmounted(() => {
  // Clean up subscriptions
  if (questionSubscription) questionSubscription.unsubscribe();
  if (pollSubscription) pollSubscription.unsubscribe();
  if (participantSubscription) participantSubscription.unsubscribe();

  // Stop video stream if active
  stopVideoStream();
});
</script>

<style scoped>
.event-facilitator {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.video-placeholder {
  background: #e0e0e0;
  border-radius: 8px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.video-placeholder.stream-active {
  background: #000;
  padding: 0;
}

.stream-video {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: #000;
}

.participants-list {
  max-height: 400px;
  overflow-y: auto;
}

.participant-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.participant-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.question-item {
  border-bottom: 1px solid #eee;
}

.status-chip {
  font-size: 10px;
  height: 18px;
}

/* Scrollbar styling */
.participants-list::-webkit-scrollbar,
.video-placeholder::-webkit-scrollbar {
  width: 6px;
}

.participants-list::-webkit-scrollbar-track,
.video-placeholder::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.participants-list::-webkit-scrollbar-thumb,
.video-placeholder::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.participants-list::-webkit-scrollbar-thumb:hover,
.video-placeholder::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
