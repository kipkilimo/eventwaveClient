<template>
  <div class="event-admin">
    <!-- Header Section -->
    <v-app-bar :color="event.branding?.themeColor || 'primary'" dark prominent>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>
        <v-icon left>mdi-account-crown</v-icon>
        Admin Dashboard - {{ event.title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="refreshData" :loading="refreshing">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="editEvent">
            <v-list-item-icon>
              <v-icon>mdi-pencil</v-icon>
            </v-list-item-icon>
            <v-list-item-content>Edit Event</v-list-item-content>
          </v-list-item>
          <v-list-item @click="exportData" :loading="exporting">
            <v-list-item-icon>
              <v-icon>mdi-export</v-icon>
            </v-list-item-icon>
            <v-list-item-content>Export Data</v-list-item-content>
          </v-list-item>
          <v-list-item
            @click="publishEvent"
            v-if="event.status !== 'PUBLISHED'"
          >
            <v-list-item-icon>
              <v-icon>mdi-rocket</v-icon>
            </v-list-item-icon>
            <v-list-item-content>Publish Event</v-list-item-content>
          </v-list-item>
          <v-list-item @click="cancelEvent" v-if="event.status === 'PUBLISHED'">
            <v-list-item-icon>
              <v-icon>mdi-cancel</v-icon>
            </v-list-item-icon>
            <v-list-item-content>Cancel Event</v-list-item-content>
          </v-list-item>
          <v-list-item @click="showSettings = true">
            <v-list-item-icon>
              <v-icon>mdi-cog</v-icon>
            </v-list-item-icon>
            <v-list-item-content>Settings</v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <v-list-item>
          <v-list-item-avatar>
            <v-avatar color="primary" size="40">
              <span class="white--text">{{
                getInitials(currentUser?.name || "Admin")
              }}</span>
            </v-avatar>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{
              currentUser?.name || "Admin"
            }}</v-list-item-title>
            <v-list-item-subtitle>Event Administrator</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list nav>
        <v-list-item to="#overview" exact>
          <v-list-item-icon>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Overview</v-list-item-content>
        </v-list-item>
        <v-list-item to="#participants">
          <v-list-item-icon>
            <v-icon>mdi-account-group</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            Participants ({{ participants.length }})
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="#facilitators">
          <v-list-item-icon>
            <v-icon>mdi-chalkboard</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Facilitators</v-list-item-content>
        </v-list-item>
        <v-list-item to="#analytics">
          <v-list-item-icon>
            <v-icon>mdi-chart-line</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Analytics</v-list-item-content>
        </v-list-item>
        <v-list-item to="#interactions">
          <v-list-item-icon>
            <v-icon>mdi-chat-processing</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Interactions</v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="pa-4">
        <!-- Event Overview -->
        <v-row id="overview">
          <v-col cols="12">
            <EventHeader :event="event" :role="'admin'" />
          </v-col>
        </v-row>

        <!-- Admin Controls -->
        <v-row>
          <v-col
            cols="12"
            md="6"
            lg="3"
            v-for="stat in adminStats"
            :key="stat.title"
          >
            <v-card class="stat-card" elevation="2">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon :color="stat.color" size="40" class="mr-3">{{
                    stat.icon
                  }}</v-icon>
                  <div>
                    <div class="text-h4">{{ stat.value }}</div>
                    <div class="text-subtitle-2">{{ stat.title }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Participants Management -->
        <v-row id="participants">
          <v-col cols="12">
            <v-card>
              <v-card-title class="d-flex justify-space-between align-center">
                <span>Participants Management</span>
                <v-btn color="primary" @click="openParticipantDialog">
                  <v-icon left>mdi-plus</v-icon>
                  Add Participant
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="participantHeaders"
                  :items="participants"
                  :loading="participantsLoading"
                  :search="search"
                  class="elevation-1"
                >
                  <template v-slot:top>
                    <v-text-field
                      v-model="search"
                      label="Search participants"
                      class="mx-4"
                      prepend-inner-icon="mdi-magnify"
                      dense
                    ></v-text-field>
                  </template>

                  <template v-slot:item.status="{ item }">
                    <v-chip
                      :color="getParticipantStatusColor(item.status)"
                      size="small"
                    >
                      {{ item.status || "Active" }}
                    </v-chip>
                  </template>

                  <template v-slot:item.joinedAt="{ item }">
                    {{ formatDateTime(item.joinedAt) }}
                  </template>

                  <template v-slot:item.actions="{ item }">
                    <v-icon
                      size="small"
                      class="mr-2"
                      @click="editParticipant(item)"
                    >
                      mdi-pencil
                    </v-icon>
                    <v-icon size="small" @click="removeParticipant(item)">
                      mdi-delete
                    </v-icon>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Facilitators Management -->
        <v-row id="facilitators">
          <v-col cols="12">
            <v-card>
              <v-card-title>
                Facilitators
                <v-spacer></v-spacer>
                <v-btn color="primary" outlined @click="openFacilitatorDialog">
                  <v-icon left>mdi-plus</v-icon>
                  Add Facilitator
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-chip-group>
                  <v-chip
                    v-for="facilitator in facilitators"
                    :key="facilitator.id"
                    color="secondary"
                    close
                    @click:close="removeFacilitator(facilitator)"
                  >
                    <v-icon left>mdi-account-tie</v-icon>
                    {{ facilitator.name }}
                    <span v-if="facilitator.email" class="text-caption ml-1">
                      ({{ facilitator.email }})
                    </span>
                  </v-chip>
                  <v-chip
                    v-if="facilitators.length === 0"
                    color="grey"
                    outlined
                  >
                    No facilitators added yet
                  </v-chip>
                </v-chip-group>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Analytics Section -->
        <v-row id="analytics">
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>
                Attendance Analytics
                <v-spacer></v-spacer>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props" size="small">
                      <v-icon>mdi-chart-timeline-variant</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="attendancePeriod = 'day'">
                      <v-list-item-title>Last 24 Hours</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="attendancePeriod = 'week'">
                      <v-list-item-title>Last 7 Days</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="attendancePeriod = 'month'">
                      <v-list-item-title>Last 30 Days</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-card-title>
              <v-card-text>
                <VChart :option="attendanceChart" autoresize />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>Engagement Metrics</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item
                    v-for="metric in engagementMetrics"
                    :key="metric.name"
                  >
                    <v-list-item-icon>
                      <v-icon :color="metric.color">{{ metric.icon }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{ metric.name }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <span class="text-h6">{{ metric.value }}</span>
                        <span class="text-caption ml-1">{{
                          metric.trend
                        }}</span>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Interactions Feed -->
        <v-row id="interactions">
          <v-col cols="12">
            <v-card>
              <v-card-title>
                Live Interactions
                <v-spacer></v-spacer>
                <v-btn-toggle v-model="interactionFilter" dense>
                  <v-btn value="all">All</v-btn>
                  <v-btn value="chat">Chat</v-btn>
                  <v-btn value="qna">Q&A</v-btn>
                  <v-btn value="polls">Polls</v-btn>
                </v-btn-toggle>
              </v-card-title>
              <v-card-text
                class="interaction-feed"
                style="height: 400px; overflow-y: auto"
                ref="interactionFeedRef"
              >
                <v-timeline dense>
                  <v-timeline-item
                    v-for="interaction in filteredInteractions"
                    :key="interaction.id"
                    :color="getInteractionColor(interaction.type)"
                    size="small"
                  >
                    <template v-slot:icon>
                      <v-icon
                        :color="getInteractionColor(interaction.type)"
                        size="small"
                      >
                        {{ getInteractionIcon(interaction.type) }}
                      </v-icon>
                    </template>
                    <div class="interaction-item">
                      <div class="d-flex align-center">
                        <strong>{{ interaction.userName }}</strong>
                        <span class="text-caption ml-2 text-grey">
                          {{ formatTime(interaction.timestamp) }}
                        </span>
                      </div>
                      <p class="mt-1 mb-0">{{ interaction.content }}</p>
                      <div
                        v-if="
                          interaction.type === 'poll' && interaction.results
                        "
                        class="mt-2"
                      >
                        <v-progress-linear
                          v-for="result in interaction.results"
                          :key="result.option"
                          :value="result.percentage"
                          height="20"
                          class="mb-1"
                        >
                          <template v-slot:default="{ value }">
                            <strong class="text-caption"
                              >{{ result.option }}:
                              {{ Math.round(value) }}%</strong
                            >
                          </template>
                        </v-progress-linear>
                      </div>
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Settings Dialog -->
    <v-dialog v-model="showSettings" max-width="600">
      <v-card>
        <v-card-title>Event Settings</v-card-title>
        <v-card-text>
          <v-switch
            v-model="localSettings.isSecureAccessEvent"
            label="Secure Access Required"
            :loading="savingSettings"
            @change="saveSettings"
          ></v-switch>
          <v-switch
            v-model="localSettings.allowChat"
            label="Allow Chat"
            :loading="savingSettings"
            @change="saveSettings"
          ></v-switch>
          <v-switch
            v-model="localSettings.allowQnA"
            label="Allow Q&A"
            :loading="savingSettings"
            @change="saveSettings"
          ></v-switch>
          <v-switch
            v-model="localSettings.allowPolls"
            label="Allow Polls"
            :loading="savingSettings"
            @change="saveSettings"
          ></v-switch>
          <v-switch
            v-model="localSettings.allowPrivateMessages"
            label="Allow Private Messages"
            :loading="savingSettings"
            @change="saveSettings"
          ></v-switch>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showSettings = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add/Edit Participant Dialog -->
    <v-dialog v-model="showParticipantDialog" max-width="500">
      <v-card>
        <v-card-title>{{
          editingParticipant ? "Edit Participant" : "Add Participant"
        }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="participantForm.name"
            label="Name"
            required
            :rules="[(v) => !!v || 'Name is required']"
          ></v-text-field>
          <v-text-field
            v-model="participantForm.email"
            label="Email"
            type="email"
            :rules="[(v) => /.+@.+\..+/.test(v) || 'Email must be valid']"
          ></v-text-field>
          <v-text-field
            v-model="participantForm.phone"
            label="Phone Number"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showParticipantDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="saveParticipant"
            :loading="savingParticipant"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Facilitator Dialog -->
    <v-dialog v-model="showFacilitatorDialog" max-width="500">
      <v-card>
        <v-card-title>Add Facilitator</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="facilitatorForm.name"
            label="Name"
            required
          ></v-text-field>
          <v-text-field
            v-model="facilitatorForm.email"
            label="Email"
            type="email"
            required
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showFacilitatorDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="saveFacilitator"
            :loading="savingFacilitator"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useEventStore } from "@/stores/event";
import { useUserStore } from "@/stores/user";
import type { Event, User } from "@/stores/event";
import EventHeader from "./common/EventHeader.vue";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
} from "echarts/components";

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
]);

// Types
interface Participant extends User {
  status?: string;
  joinedAt?: string;
}

interface Facilitator extends User {
  role?: string;
}

interface Interaction {
  id: string;
  type: "chat" | "qna" | "poll";
  userName: string;
  content: string;
  timestamp: Date;
  results?: Array<{ option: string; percentage: number }>;
}

interface AdminStats {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

interface EngagementMetric {
  name: string;
  value: string | number;
  icon: string;
  color: string;
  trend: string;
}

// Props
interface Props {
  event: Event;
  userRole: string;
  currentUser: User | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "refresh"): void;
  (e: "updateEvent", event: Event): void;
}>();

// Router and stores
const router = useRouter();
const eventStore = useEventStore();
const authStore = useAuthStore();

// UI State
const drawer = ref(false);
const search = ref("");
const participantsLoading = ref(false);
const refreshing = ref(false);
const exporting = ref(false);
const savingSettings = ref(false);
const savingParticipant = ref(false);
const savingFacilitator = ref(false);
const showSettings = ref(false);
const showParticipantDialog = ref(false);
const showFacilitatorDialog = ref(false);
const editingParticipant = ref<Participant | null>(null);
const interactionFilter = ref<"all" | "chat" | "qna" | "polls">("all");
const attendancePeriod = ref<"day" | "week" | "month">("week");
const interactionFeedRef = ref<HTMLDivElement | null>(null);

// Form data
const participantForm = ref({
  name: "",
  email: "",
  phone: "",
});

const facilitatorForm = ref({
  name: "",
  email: "",
});

const localSettings = ref({
  isSecureAccessEvent: props.event.isSecureAccessEvent || false,
  allowChat: props.event.interactivity?.allowChat ?? true,
  allowQnA: props.event.interactivity?.allowQnA ?? true,
  allowPolls: props.event.interactivity?.allowPolls ?? true,
  allowPrivateMessages: props.event.interactivity?.allowPrivateMessages ?? true,
});

// Computed
const participants = computed(() => props.event.participants || []);
const facilitators = computed(() => props.event.facilitators || []);

const adminStats = computed<AdminStats[]>(() => {
  const activeNow = participants.value.filter(
    (p) => p.status === "active",
  ).length;

  return [
    {
      title: "Total Participants",
      value: participants.value.length,
      icon: "mdi-account-group",
      color: "primary",
    },
    {
      title: "Active Now",
      value: activeNow,
      icon: "mdi-account-check",
      color: "success",
    },
    {
      title: "Engagement Rate",
      value: calculateEngagementRate(),
      icon: "mdi-chart-line",
      color: "info",
    },
    {
      title: "Event Status",
      value: props.event.status,
      icon: "mdi-calendar-check",
      color: "warning",
    },
  ];
});

const participantHeaders = ref([
  { text: "Name", value: "name" },
  { text: "Email", value: "email" },
  { text: "Phone", value: "phoneNumber" },
  { text: "Joined", value: "joinedAt" },
  { text: "Status", value: "status" },
  { text: "Actions", value: "actions", sortable: false },
]);

const engagementMetrics = ref<EngagementMetric[]>([
  {
    name: "Chat Messages",
    value: "0",
    icon: "mdi-chat",
    color: "blue",
    trend: "+0%",
  },
  {
    name: "Questions Asked",
    value: "0",
    icon: "mdi-help-circle",
    color: "green",
    trend: "+0%",
  },
  {
    name: "Poll Responses",
    value: "0",
    icon: "mdi-poll",
    color: "purple",
    trend: "+0%",
  },
  {
    name: "Reactions",
    value: "0",
    icon: "mdi-emoticon-happy",
    color: "orange",
    trend: "+0%",
  },
]);

const interactions = ref<Interaction[]>([
  {
    id: "1",
    type: "chat",
    userName: "System",
    content: "Event dashboard loaded",
    timestamp: new Date(),
  },
]);

const filteredInteractions = computed(() => {
  if (interactionFilter.value === "all") return interactions.value;
  return interactions.value.filter((i) => i.type === interactionFilter.value);
});

const attendanceChart = computed(() => {
  const data = getAttendanceData();
  return {
    title: {
      text: "Attendance Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    toolbox: {
      feature: {
        saveAsImage: {},
        dataZoom: {},
      },
    },
    xAxis: {
      type: "category",
      data: data.labels,
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: "value",
      name: "Participants",
    },
    series: [
      {
        data: data.values,
        type: "line",
        smooth: true,
        areaStyle: {
          opacity: 0.3,
        },
        lineStyle: {
          width: 2,
        },
        itemStyle: {
          color: "#1976d2",
        },
      },
    ],
  };
});

// Helper functions
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString();
};

const formatTime = (timestamp: Date | string): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getParticipantStatusColor = (status?: string): string => {
  const colors: Record<string, string> = {
    active: "success",
    away: "warning",
    offline: "grey",
    muted: "grey",
  };
  return colors[status || "active"] || "success";
};

const getInteractionColor = (type: string): string => {
  const colors: Record<string, string> = {
    chat: "blue",
    qna: "green",
    poll: "purple",
  };
  return colors[type] || "grey";
};

const getInteractionIcon = (type: string): string => {
  const icons: Record<string, string> = {
    chat: "mdi-chat",
    qna: "mdi-help-circle",
    poll: "mdi-poll",
  };
  return icons[type] || "mdi-message";
};

const calculateEngagementRate = (): string => {
  // Calculate engagement rate based on interactions
  const totalInteractions = interactions.value.length;
  const totalParticipants = participants.value.length || 1;
  const rate = (totalInteractions / totalParticipants) * 100;
  return `${Math.min(Math.round(rate), 100)}%`;
};

const getAttendanceData = () => {
  // This would come from actual analytics data
  const periods = {
    day: ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm"],
    week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    month: ["Week 1", "Week 2", "Week 3", "Week 4"],
  };

  const values = {
    day: [15, 32, 45, 48, 52, 50, 48],
    week: [120, 145, 132, 158, 167, 145, 98],
    month: [450, 520, 580, 490],
  };

  return {
    labels: periods[attendancePeriod.value],
    values: values[attendancePeriod.value],
  };
};

// Data management methods
const refreshData = async () => {
  refreshing.value = true;
  try {
    emit("refresh");
    await eventStore.fetchEvent(props.event.id);
  } catch (error) {
    console.error("Failed to refresh data:", error);
  } finally {
    refreshing.value = false;
  }
};

const editEvent = () => {
  router.push(`/events/edit/${props.event.id}`);
};

const exportData = async () => {
  exporting.value = true;
  try {
    await eventStore.exportEventData(props.event.id);
  } catch (error) {
    console.error("Failed to export data:", error);
  } finally {
    exporting.value = false;
  }
};

const publishEvent = async () => {
  if (confirm("Publish this event? It will be visible to participants.")) {
    try {
      await eventStore.publishEvent(props.event.id);
      emit("refresh");
    } catch (error) {
      console.error("Failed to publish event:", error);
    }
  }
};

const cancelEvent = async () => {
  if (confirm("Cancel this event? This action cannot be undone.")) {
    try {
      await eventStore.cancelEvent(props.event.id);
      emit("refresh");
    } catch (error) {
      console.error("Failed to cancel event:", error);
    }
  }
};

const saveSettings = async () => {
  savingSettings.value = true;
  try {
    const updateInput = {
      isSecureAccessEvent: localSettings.value.isSecureAccessEvent,
      interactivity: {
        allowChat: localSettings.value.allowChat,
        allowQnA: localSettings.value.allowQnA,
        allowPolls: localSettings.value.allowPolls,
        allowPrivateMessages: localSettings.value.allowPrivateMessages,
      },
    };

    const updatedEvent = await eventStore.updateEvent(
      props.event.id,
      updateInput,
    );
    emit("updateEvent", updatedEvent);
  } catch (error) {
    console.error("Failed to save settings:", error);
  } finally {
    savingSettings.value = false;
  }
};

// Participant management
const openParticipantDialog = () => {
  editingParticipant.value = null;
  participantForm.value = { name: "", email: "", phone: "" };
  showParticipantDialog.value = true;
};

const editParticipant = (participant: Participant) => {
  editingParticipant.value = participant;
  participantForm.value = {
    name: participant.name,
    email: participant.email || "",
    phone: participant.phoneNumber || "",
  };
  showParticipantDialog.value = true;
};

const saveParticipant = async () => {
  if (!participantForm.value.name || !participantForm.value.email) {
    return;
  }

  savingParticipant.value = true;
  try {
    if (editingParticipant.value) {
      // Update participant - you may need a specific mutation for this
      console.log(
        "Update participant:",
        editingParticipant.value.id,
        participantForm.value,
      );
    } else {
      // Add participant via updateEventRoles
      await eventStore.updateEventRoles(
        props.event.id,
        "participant",
        [participantForm.value.email],
        [],
      );
    }
    showParticipantDialog.value = false;
    emit("refresh");
  } catch (error) {
    console.error("Failed to save participant:", error);
  } finally {
    savingParticipant.value = false;
  }
};

const removeParticipant = async (participant: Participant) => {
  if (confirm(`Remove ${participant.name} from event?`)) {
    participantsLoading.value = true;
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
    } finally {
      participantsLoading.value = false;
    }
  }
};

// Facilitator management
const openFacilitatorDialog = () => {
  facilitatorForm.value = { name: "", email: "" };
  showFacilitatorDialog.value = true;
};

const saveFacilitator = async () => {
  if (!facilitatorForm.value.name || !facilitatorForm.value.email) {
    return;
  }

  savingFacilitator.value = true;
  try {
    await eventStore.updateEventRoles(
      props.event.id,
      "facilitator",
      [facilitatorForm.value.email],
      [],
    );
    showFacilitatorDialog.value = false;
    emit("refresh");
  } catch (error) {
    console.error("Failed to add facilitator:", error);
  } finally {
    savingFacilitator.value = false;
  }
};

const removeFacilitator = async (facilitator: Facilitator) => {
  if (confirm(`Remove ${facilitator.name} as facilitator?`)) {
    try {
      await eventStore.updateEventRoles(
        props.event.id,
        "facilitator",
        [],
        [facilitator.email || facilitator.id],
      );
      emit("refresh");
    } catch (error) {
      console.error("Failed to remove facilitator:", error);
    }
  }
};

// Real-time subscriptions
let interactionSubscription: any = null;
let metricsSubscription: any = null;

const subscribeToInteractions = () => {
  // GraphQL subscription for real-time interactions
  // interactionSubscription = apolloClient.subscribe({
  //   query: INTERACTION_SUBSCRIPTION,
  //   variables: { eventId: props.event.id }
  // }).subscribe({
  //   next: ({ data }) => {
  //     if (data?.newInteraction) {
  //       interactions.value.unshift(data.newInteraction)
  //       updateEngagementMetrics(data.newInteraction)
  //       nextTick(() => {
  //         if (interactionFeedRef.value) {
  //           interactionFeedRef.value.scrollTop = 0
  //         }
  //       })
  //     }
  //   }
  // })
};

const updateEngagementMetrics = (interaction: Interaction) => {
  // Update metrics based on new interaction
  switch (interaction.type) {
    case "chat":
      const currentChats = parseInt(engagementMetrics.value[0].value as string);
      engagementMetrics.value[0].value = (currentChats + 1).toString();
      break;
    case "qna":
      const currentQnA = parseInt(engagementMetrics.value[1].value as string);
      engagementMetrics.value[1].value = (currentQnA + 1).toString();
      break;
    case "poll":
      const currentPolls = parseInt(engagementMetrics.value[2].value as string);
      engagementMetrics.value[2].value = (currentPolls + 1).toString();
      break;
  }
  adminStats.value[2].value = calculateEngagementRate();
};

const subscribeToMetrics = () => {
  // GraphQL subscription for real-time metrics
  // metricsSubscription = apolloClient.subscribe({
  //   query: METRICS_SUBSCRIPTION,
  //   variables: { eventId: props.event.id }
  // }).subscribe({
  //   next: ({ data }) => {
  //     if (data?.metrics) {
  //       updateMetrics(data.metrics)
  //     }
  //   }
  // })
};

// Lifecycle
onMounted(() => {
  console.log("Admin view mounted for event:", props.event.id);

  // Load real-time data
  subscribeToInteractions();
  subscribeToMetrics();
});

onUnmounted(() => {
  // Clean up subscriptions
  if (interactionSubscription) interactionSubscription.unsubscribe();
  if (metricsSubscription) metricsSubscription.unsubscribe();
});
</script>

<style scoped>
.event-admin {
  min-height: 100vh;
  background: #f5f5f5;
}

.stat-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.interaction-feed::-webkit-scrollbar {
  width: 6px;
}

.interaction-feed::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.interaction-feed::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.interaction-feed::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.interaction-item {
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}

.interaction-item:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .event-admin {
    padding: 0;
  }

  .stat-card .text-h4 {
    font-size: 1.5rem;
  }
}
</style>
