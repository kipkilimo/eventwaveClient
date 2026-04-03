<script setup lang="ts">
import { ref } from "vue";
import {
  BuildingStoreIcon,
  SendIcon,
  MailboxIcon,
  PhotoIcon,
  CalendarIcon,
  UsersIcon,
  MapPinIcon,
} from "vue-tabler-icons";

const notificationDD = ref(["All Notifications", "New", "Unread", "Other"]);
const selectNotify = ref<string>("All Notifications");

// Event data from the API response


// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Calculate time until event
const getTimeUntilEvent = (startDate: string) => {
  const now = new Date();
  const eventStart = new Date(startDate);
  const diffTime = eventStart.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1) return `In ${diffDays} days`;
  return "Started";
};
</script>

<template>
  <!-- ---------------------------------------------- -->
  <!-- notifications DD -->
  <!-- ---------------------------------------------- -->
  <div class="pa-4">
    <div class="d-flex align-center justify-space-between mb-3">
      <h6 class="text-subtitle-1">
        Event Notifications
        <v-chip
          color="warning"
          variant="flat"
          size="small"
          class="ml-2 text-white"
          >01</v-chip
        >
      </h6>
      <a href="#" class="text-decoration-underline text-primary text-subtitle-2"
        >Mark as all read</a
      >
    </div>
    <v-select
      :items="notificationDD"
      v-model="selectNotify"
      color="primary"
      variant="outlined"
      density="default"
      hide-details
    ></v-select>
  </div>
  <v-divider></v-divider>
  <perfect-scrollbar style="height: calc(100vh - 300px); max-height: 650px">
    <v-list class="py-0" lines="three">
      <!-- Event Published Notification -->
      <v-list-item value="" color="secondary" class="no-spacer">
        <template v-slot:prepend>
          <v-avatar
            size="40"
            variant="flat"
            color="lightprimary"
            class="mr-3 py-2 text-primary"
          >
            <CalendarIcon size="20" />
          </v-avatar>
        </template>
        <div class="d-inline-flex align-center justify-space-between w-100">
          <h6 class="text-subtitle-1 font-weight-regular">
            New Event Published
          </h6>
          <span class="text-subtitle-2 text-medium-emphasis">{{
            getTimeUntilEvent(eventData.data.eventBySecret.dateTime.start)
          }}</span>
        </div>

        <p class="text-subtitle-2 text-medium-emphasis mt-1">
          {{ eventData.data.eventBySecret.title }}
        </p>
        <div class="mt-3">
          <v-chip
            size="small"
            :text="eventData.data.eventBySecret.eventType"
            color="primary"
            variant="tonal"
            class="mr-2"
          />
          <v-chip
            size="small"
            text="Published"
            color="success"
            variant="tonal"
          />
        </div>
      </v-list-item>
      <v-divider></v-divider>

      <!-- Event Details Notification -->
      <v-list-item value="" color="secondary" class="no-spacer">
        <template v-slot:prepend>
          <v-avatar
            size="40"
            variant="flat"
            color="lightinfo"
            class="mr-3 py-2 text-info"
          >
            <MapPinIcon size="20" />
          </v-avatar>
        </template>
        <div class="d-inline-flex align-center justify-space-between w-100">
          <h6 class="text-subtitle-1">Event Location & Time</h6>
          <span class="text-subtitle-2 text-medium-emphasis">{{
            formatDate(eventData.data.eventBySecret.createdAt)
          }}</span>
        </div>

        <p class="text-subtitle-2 text-medium-emphasis mt-1">
          <strong>When:</strong>
          {{ formatDate(eventData.data.eventBySecret.dateTime.start) }}<br />
          <strong>Where:</strong>
          {{ eventData.data.eventBySecret.location.name }} -
          {{ eventData.data.eventBySecret.location.address }}
        </p>
        <div class="mt-3">
          <v-chip
            size="small"
            :text="
              eventData.data.eventBySecret.isVirtual ? 'Virtual' : 'In-Person'
            "
            color="warning"
            variant="tonal"
            class="mr-2"
          />
          <v-chip
            size="small"
            :text="`${eventData.data.eventBySecret.capacity.maxParticipants} seats`"
            color="info"
            variant="tonal"
          />
        </div>
      </v-list-item>
      <v-divider></v-divider>

      <!-- Organizer Information -->
      <v-list-item value="" color="secondary" class="no-spacer">
        <template v-slot:prepend>
          <v-avatar size="40" class="mr-3 py-2">
            <img
              src="@/assets/images/profile/user-round.svg"
              width="40"
              alt="Organizer"
            />
          </v-avatar>
        </template>
        <div class="d-inline-flex align-center justify-space-between w-100">
          <h6 class="text-subtitle-1">
            {{ eventData.data.eventBySecret.organizer.name }}
          </h6>
          <span class="text-subtitle-2 text-medium-emphasis">Organizer</span>
        </div>

        <p class="text-subtitle-2 text-medium-emphasis mt-1">
          Event organizer contact:
          {{ eventData.data.eventBySecret.organizer.email }}
        </p>
        <div class="mt-3">
          <v-btn color="primary" variant="flat" size="small">
            <template v-slot:append>
              <SendIcon size="16" />
            </template>
            Contact
          </v-btn>
        </div>
      </v-list-item>
      <v-divider></v-divider>

      <!-- Registration Status -->
      <v-list-item value="" color="secondary" class="no-spacer">
        <template v-slot:prepend>
          <v-avatar
            size="40"
            variant="flat"
            color="lightsuccess"
            class="mr-3 py-2 text-success"
          >
            <UsersIcon size="20" />
          </v-avatar>
        </template>
        <div class="d-inline-flex align-center justify-space-between w-100">
          <h6 class="text-subtitle-1">Registration Available</h6>
          <span class="text-subtitle-2 text-medium-emphasis"
            >{{ eventData.data.eventBySecret.capacity.currentParticipants }}/{{
              eventData.data.eventBySecret.capacity.maxParticipants
            }}</span
          >
        </div>

        <p class="text-subtitle-2 text-medium-emphasis mt-1">
          Spots available for this training event. Register now to secure your
          place.
        </p>
        <div class="mt-3">
          <v-chip
            size="small"
            text="Open Registration"
            color="success"
            variant="tonal"
            class="mr-2"
          />
          <v-chip
            size="small"
            text="Training"
            color="primary"
            variant="tonal"
          />
        </div>
      </v-list-item>
      <v-divider></v-divider>

      <!-- Event Features -->
      <v-list-item value="" color="secondary" class="no-spacer">
        <template v-slot:prepend>
          <v-avatar
            size="40"
            variant="flat"
            color="lightwarning"
            class="mr-3 py-2 text-warning"
          >
            <BuildingStoreIcon size="20" />
          </v-avatar>
        </template>
        <div class="d-inline-flex align-center justify-space-between w-100">
          <h6 class="text-subtitle-1">Interactive Features</h6>
          <span class="text-subtitle-2 text-medium-emphasis">Enabled</span>
        </div>

        <p class="text-subtitle-2 mt-1">
          <span class="text-medium-emphasis">This event supports: </span>
          <span
            class="font-weight-medium"
            v-if="eventData.data.eventBySecret.interactivity.allowChat"
            >Chat,
          </span>
          <span
            class="font-weight-medium"
            v-if="eventData.data.eventBySecret.interactivity.allowPolls"
            >Polls,
          </span>
          <span
            class="font-weight-medium"
            v-if="eventData.data.eventBySecret.interactivity.allowQnA"
            >Q&A</span
          >
        </p>
        <div class="mt-3 bg-lightsecondary rounded pa-3 d-flex align-center">
          <PhotoIcon
            size="18"
            stroke-width="1.5"
            class="text-medium-emphasis"
          />
          <span class="ml-2 text-subtitle-2"
            >Event Code: {{ eventData.data.eventBySecret.eventSecret }}</span
          >
        </div>
      </v-list-item>
    </v-list>
  </perfect-scrollbar>
  <v-divider></v-divider>
  <div class="pa-2 text-center">
    <v-btn color="primary" variant="text">View All Events</v-btn>
  </div>
</template>
