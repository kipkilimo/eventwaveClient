<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useDialogStore, DIALOG_NAMES } from "@/stores/dialog";
import {
  SettingsIcon,
  LogoutIcon,
  UserIcon,
  CalendarIcon,
} from "vue-tabler-icons";
import PlanSelector from "@/components/dialogs/plans/PlanSelector.vue";

const dialogStore = useDialogStore();
const userStore = useUserStore();

// Time state
const now = ref(new Date());
let timer: number | undefined;

// Switches
const swt1 = ref(true);
const swt2 = ref(false);

// Auth state
const hasToken = computed(() => !!localStorage.getItem("token"));

// Greeting
const greeting = ref("Hello");

const userName = computed(() => userStore.user?.name || "Guest");

const setGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) greeting.value = "Good Morning";
  else if (hour >= 12 && hour < 18) greeting.value = "Good Afternoon";
  else if (hour >= 18 && hour < 22) greeting.value = "Good Evening";
  else greeting.value = "Good Night";
};

const formatTimestamp = (date: Date): string => {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const handleCreateFreeEvent = () => {
  const organizerId = userStore.user?.id || "current-user-id";
  dialogStore.openCreateFreeEvent(organizerId);
};

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date();
  }, 1000);

  setGreeting();
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <v-card height="70vh" class="pa-4 position-relative">
    <!-- CLOSE BUTTON -->
    <v-btn
      icon
      variant="text"
      class="position-absolute"
      style="top: 10px; right: 10px;"
      @click="dialogStore.close(DIALOG_NAMES.PLANS)"
    >
      <LogoutIcon />
    </v-btn>

    <!-- Greeting -->
    <h4 class="mb-n1">
      {{ greeting }},
      <span class="font-weight-regular">{{ userName }}</span>
    </h4>

    <span class="text-subtitle-2 text-medium-emphasis">
      {{ userStore.user?.role }}
    </span>

    <!-- New event button -->
    <v-btn
      class="my-3"
      color="primary"
      variant="outlined"
      block
      @click="handleCreateFreeEvent"
    >
      <template #prepend>
        <CalendarIcon stroke-width="1.5" size="20" />
      </template>
      Create a short Event
    </v-btn>

    <v-divider />

    <perfect-scrollbar style="height: calc(100vh - 300px); max-height: 515px">
      <!-- PREMIUM CARD -->
      <div class="premium-entry">
        <v-card
          class="go-premium-card"
          elevation="5"
          variant="elevated"
          v-if="hasToken"
          @click="dialogStore.open(DIALOG_NAMES.PLANS)"
          :style="{
            background:
              'linear-gradient(45deg, #256dec, #256dec, #B659EC, #C13584, #E1306C, #FD1D1D)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 8s ease infinite',
            height: '9rem',
          }"
        >
          <div class="text-white ml-2 mt-2 font-weight-bold">
            Event Wave Technologies
          </div>

          <v-divider />

          <v-row no-gutters align="center" justify="space-between" class="pa-2">
            <div
              class="live-pulse-container w-12 h-12 rounded-full d-flex align-center justify-center"
              :style="{ background: 'rgba(255,255,255,0.2)', position: 'relative' }"
            />

            <v-col class="pl-2">
              <div class="text-white text-caption">
                <v-row align="center" justify="center">
                  <v-col cols="auto">
                    <v-icon class="me-2">mdi-clock-outline</v-icon>
                    <strong>{{ formatTimestamp(now) }}</strong>
                  </v-col>
                </v-row>
              </div>
            </v-col>

            <v-col cols="auto">
              <v-btn size="small" color="white" variant="tonal">
                View Plans
              </v-btn>
            </v-col>
          </v-row>

          <div class="text-white ml-2 mt-2 font-weight-bold">
            Realtime Interactivity Tools
          </div>

          <div class="text-white text-caption ml-4 mb-2">
            Bring your events to life
          </div>
        </v-card>
      </div>

      <v-divider class="my-3" />

      <!-- SWITCHES -->
      <div class="bg-lightprimary rounded-md px-5 py-3 my-3">
        <div class="d-flex align-center justify-space-between">
          <h5 class="text-h5">Start DND Mode</h5>
          <v-switch v-model="swt1" color="primary" hide-details />
        </div>

        <div class="d-flex align-center justify-space-between mt-3">
          <h5 class="text-h5">Allow Notifications</h5>
          <v-switch v-model="swt2" color="primary" hide-details />
        </div>
      </div>

      <v-divider />

      <!-- MENU -->
      <v-list class="mt-3">
        <v-list-item color="secondary" rounded="md">
          <template #prepend>
            <SettingsIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title>Account Settings</v-list-item-title>
        </v-list-item>

        <v-list-item color="secondary" rounded="md">
          <template #prepend>
            <UserIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title>Social Profile</v-list-item-title>
          <template #append>
            <v-chip color="warning" class="text-white" size="small">
              02
            </v-chip>
          </template>
        </v-list-item>

        <v-list-item
          color="secondary"
          rounded="md"
          @click="userStore.logout()"
        >
          <template #prepend>
            <LogoutIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </perfect-scrollbar>
  </v-card>

  <!-- Plans Dialog -->
  <v-dialog
    :model-value="dialogStore.isDialogOpen(DIALOG_NAMES.PLANS)"
    @update:model-value="(val) => !val && dialogStore.close(DIALOG_NAMES.PLANS)"
    max-width="900"
  >
    <PlanSelector />
  </v-dialog>
</template>

<style scoped>
.go-premium-card {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.go-premium-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3) !important;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.live-pulse-container {
  position: relative;
}
</style>