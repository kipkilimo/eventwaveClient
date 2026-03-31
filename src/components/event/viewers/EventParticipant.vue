<template>
  <div class="event-participant">
    <v-container>
      <v-row>
        <v-col cols="12">
          <EventHeader :event="event" :role="'participant'" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="8">
          <!-- Live Stream -->
          <v-card class="mb-4">
            <v-card-title>Live Session</v-card-title>
            <v-card-text>
              <div class="video-placeholder text-center pa-8">
                <v-icon size="64" color="grey">mdi-video</v-icon>
                <p>Waiting for session to start...</p>
              </div>
            </v-card-text>
          </v-card>

          <!-- Chat -->
          <v-card>
            <v-card-title>
              Chat
              <v-spacer></v-spacer>
              <v-chip
                v-if="event.interactivity?.allowChat"
                color="success"
                size="small"
              >
                Enabled
              </v-chip>
            </v-card-title>
            <v-card-text class="chat-container">
              <div class="chat-messages" ref="chatMessagesRef">
                <div
                  v-for="message in chatMessages"
                  :key="message.id"
                  class="chat-message"
                >
                  <strong>{{ message.userName }}:</strong>
                  <span>{{ message.content }}</span>
                  <span class="text-caption ml-2">{{
                    formatTime(message.timestamp)
                  }}</span>
                </div>
              </div>
              <v-text-field
                v-if="event.interactivity?.allowChat"
                v-model="newMessage"
                label="Type your message..."
                append-icon="mdi-send"
                @click:append="sendMessage"
                @keyup.enter="sendMessage"
                dense
                outlined
              ></v-text-field>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <!-- Q&A Section -->
          <v-card class="mb-4">
            <v-card-title>
              Q&A
              <v-spacer></v-spacer>
              <v-chip
                v-if="event.interactivity?.allowQnA"
                color="success"
                size="small"
              >
                Open
              </v-chip>
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item v-for="qa in qaList" :key="qa.id">
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-bold">
                      Q: {{ qa.question }}
                    </v-list-item-title>
                    <v-list-item-subtitle v-if="qa.answer">
                      A: {{ qa.answer }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <v-text-field
                v-if="event.interactivity?.allowQnA"
                v-model="newQuestion"
                label="Ask a question..."
                append-icon="mdi-send"
                @click:append="askQuestion"
                dense
                outlined
              ></v-text-field>
            </v-card-text>
          </v-card>

          <!-- Polls -->
          <v-card class="mb-4" v-if="activePoll">
            <v-card-title>Active Poll</v-card-title>
            <v-card-text>
              <p>{{ activePoll.question }}</p>
              <v-radio-group v-model="pollResponse">
                <v-radio
                  v-for="option in activePoll.options"
                  :key="option"
                  :label="option"
                  :value="option"
                ></v-radio>
              </v-radio-group>
              <v-btn color="primary" block @click="submitPollResponse">
                Submit Response
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Resources -->
          <v-card>
            <v-card-title>Resources</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item v-for="resource in resources" :key="resource.id">
                  <v-list-item-icon>
                    <v-icon>{{ resource.icon }}</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{ resource.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      resource.description
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon @click="downloadResource(resource)">
                      <v-icon>mdi-download</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";

import { useEventStore } from "@/stores/event";
import { useUserStore } from "@/stores/user";
import type { Event, User } from "@/stores/event";
import EventHeader from "./common/EventHeader.vue";

// GraphQL mutations for chat, Q&A, and polls would be added here
// import { gql } from '@apollo/client/core'
// import { apolloClient } from '@/plugins/apollo'

// Props with TypeScript
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
  (e: "sendMessage", message: ChatMessage): void;
  (e: "askQuestion", question: QnAItem): void;
}>();

// Types
interface ChatMessage {
  id: number;
  userName: string;
  content: string;
  timestamp: Date;
}

interface QnAItem {
  id: number;
  question: string;
  answer: string | null;
  userName?: string;
}

interface Poll {
  id: string;
  question: string;
  options: string[];
  expiresAt?: Date;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  icon: string;
  url?: string;
}

// Store instances
const eventStore = useEventStore();
const authStore = useAuthStore();

// Refs
const chatMessages = ref<ChatMessage[]>([]);
const newMessage = ref("");
const qaList = ref<QnAItem[]>([]);
const newQuestion = ref("");
const activePoll = ref<Poll | null>(null);
const pollResponse = ref("");
const chatMessagesRef = ref<HTMLDivElement | null>(null);

// Sample resources - in production, these would come from GraphQL
const resources = ref<Resource[]>([
  {
    id: 1,
    title: "Workshop Slides",
    description: "Presentation slides",
    icon: "mdi-file-powerpoint",
  },
  {
    id: 2,
    title: "Resource Guide",
    description: "Additional materials",
    icon: "mdi-file-pdf",
  },
]);

// Computed
const isChatEnabled = () => props.event.interactivity?.allowChat ?? false;
const isQnAEnabled = () => props.event.interactivity?.allowQnA ?? false;
const isPollsEnabled = () => props.event.interactivity?.allowPolls ?? false;

// Methods
const formatTime = (timestamp: Date | string) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  const message: ChatMessage = {
    id: Date.now(),
    userName: props.currentUser?.name || "Anonymous",
    content: newMessage.value,
    timestamp: new Date(),
  };

  chatMessages.value.push(message);
  emit("sendMessage", message);

  // Optional: Send to GraphQL mutation
  // await sendChatMessage({
  //   eventId: props.event.id,
  //   content: newMessage.value,
  //   userId: props.currentUser?.id
  // })

  newMessage.value = "";

  // Scroll to bottom
  await nextTick();
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }
};

const askQuestion = async () => {
  if (!newQuestion.value.trim()) return;

  const question: QnAItem = {
    id: Date.now(),
    question: newQuestion.value,
    answer: null,
    userName: props.currentUser?.name,
  };

  qaList.value.push(question);
  emit("askQuestion", question);

  // Optional: Send to GraphQL mutation
  // await askQuestionMutation({
  //   eventId: props.event.id,
  //   question: newQuestion.value,
  //   userId: props.currentUser?.id
  // })

  newQuestion.value = "";
};

const submitPollResponse = async () => {
  if (!pollResponse.value || !activePoll.value) return;

  console.log("Poll response submitted:", {
    pollId: activePoll.value.id,
    response: pollResponse.value,
    userId: props.currentUser?.id,
  });

  // Optional: Send to GraphQL mutation
  // await submitPollResponseMutation({
  //   pollId: activePoll.value.id,
  //   response: pollResponse.value,
  //   userId: props.currentUser?.id
  // })

  // Clear active poll after submission
  activePoll.value = null;
  pollResponse.value = "";
};

const downloadResource = (resource: Resource) => {
  console.log("Downloading resource:", resource.title);
  // Implement actual download logic
  if (resource.url) {
    window.open(resource.url, "_blank");
  }
};

// Poll subscription (example - would use GraphQL subscriptions in production)
const subscribeToPolls = () => {
  // This would be implemented with GraphQL subscriptions
  // For now, simulate with a timeout
  setTimeout(() => {
    // Simulate a poll being pushed
    activePoll.value = {
      id: "poll-1",
      question: "How would you rate this session?",
      options: ["Excellent", "Good", "Average", "Poor"],
    };
  }, 10000);
};

// Chat subscription (example)
const subscribeToChat = () => {
  // This would use GraphQL subscriptions
  // For now, simulate receiving messages
  const interval = setInterval(() => {
    if (Math.random() > 0.7) {
      // Randomly add messages
      const dummyMessages = [
        "Great session!",
        "Can you share the slides?",
        "Very informative",
        "Thank you for this session",
      ];
      const randomMessage =
        dummyMessages[Math.floor(Math.random() * dummyMessages.length)];

      chatMessages.value.push({
        id: Date.now(),
        userName: "Other Participant",
        content: randomMessage,
        timestamp: new Date(),
      });

      // Scroll to bottom
      nextTick(() => {
        if (chatMessagesRef.value) {
          chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
        }
      });
    }
  }, 15000);

  return interval;
};

// Q&A subscription
const subscribeToQnA = () => {
  // This would use GraphQL subscriptions to get answers to questions
  setInterval(() => {
    const unansweredQuestions = qaList.value.filter((q) => !q.answer);
    if (unansweredQuestions.length > 0 && Math.random() > 0.8) {
      const randomQuestion = unansweredQuestions[0];
      randomQuestion.answer =
        "Thank you for your question. We will address it shortly.";

      // Update the question in the list
      const index = qaList.value.findIndex((q) => q.id === randomQuestion.id);
      if (index !== -1) {
        qaList.value[index] = { ...randomQuestion };
      }
    }
  }, 20000);
};

// Lifecycle
let chatInterval: ReturnType<typeof setInterval> | null = null;
let qaInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  console.log("Participant view mounted for event:", props.event.id);

  // Subscribe to real-time features if enabled
  if (isChatEnabled()) {
    chatInterval = subscribeToChat();
  }

  if (isQnAEnabled()) {
    qaInterval = subscribeToQnA();
  }

  if (isPollsEnabled()) {
    subscribeToPolls();
  }
});

onUnmounted(() => {
  // Cleanup subscriptions
  if (chatInterval) {
    clearInterval(chatInterval);
  }
  if (qaInterval) {
    clearInterval(qaInterval);
  }
});
</script>

<style scoped>
.event-participant {
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
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 400px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  padding: 8px;
}

.chat-message {
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.chat-message strong {
  color: #1976d2;
}

/* Scrollbar styling */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
