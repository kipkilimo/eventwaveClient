<template>
  <v-container> 
    <v-row>
      <!-- Event Cover Image 
      {{ currentEvent }}-->
      <v-col cols="12">
        <v-card
          flat
          class="px-4 py-2"
          elevation="0"
          style="border-radius: 15px 15px 15px 15px !important"
        >
          <v-row>
            <v-col cols="5"
              ><v-img
                :src="resourceStore.resource.coverImage"
                alt="Event Cover Image"
                class="rounded-xs"
                cover
                height="15rem"
                min-width="100%"
              ></v-img
            ></v-col>
            <v-col cols="7">
              <v-card-title class="text-h4 font-weight-bold">{{
                currentEvent.event_name
              }}</v-card-title>

              <!-- Event Date and Time -->
              <v-card-subtitle class="text-body-2">
                <v-icon left small class="mr-1">mdi-calendar-today</v-icon>
                {{
                  formatLongDateWithTime(
                    formatDateWithTimeZone(currentEvent.date_and_time.start)
                  )
                }}
                - {{ formatDateWithTimeZone(currentEvent.date_and_time.end) }}
              </v-card-subtitle>

              <!-- Location -->
              <v-card-subtitle class="mt-1 mb-1 text-body-2">
                <v-icon left small class="mr-1">mdi-map-marker</v-icon>
                {{ currentEvent.location }}
              </v-card-subtitle>

              <!-- Target Audience -->
              <v-card-subtitle class="mt-1 mb-1 text-body-2">
                <v-icon left small class="mr-1">mdi-account-multiple</v-icon>
                {{ currentEvent.target_audience }}
              </v-card-subtitle>

              <!-- Event Type -->
              <v-card-subtitle class="mt-1 mb-1 text-body-2">
                <v-icon left small class="mr-1">mdi-tag-outline</v-icon>
                {{ currentEvent.event_type }}
              </v-card-subtitle>
            </v-col>
          </v-row>
          <!-- Divider -->
          <v-divider class="my-1"></v-divider>

          <!-- Event Description -->
          <v-card-text class="text-body-1">
            <v-subheader class="text-h6">Description</v-subheader>
            <p>{{ currentEvent.description }}</p>

            <v-subheader class="text-h6">Keynote Speakers</v-subheader>
            <ul>
              <li
                v-for="(speaker, index) in currentEvent.keynote_speakers"
                :key="index"
                class="mb-1"
              >
                <v-icon left small class="mr-1">mdi-account</v-icon>
                <strong>{{ speaker.name }}</strong> -
                {{ speaker.affiliation }} ({{ speaker.expertise }})
              </li>
            </ul>

            <v-subheader class="text-h6">Registration & Budget</v-subheader>
            <v-card-subtitle class="text-body-2 mb-1">
              <v-icon left small class="mr-1">mdi-cash</v-icon>
              Registration Fee: {{ currentEvent.registration.fee | currency }}
            </v-card-subtitle>
            <v-card-subtitle class="text-body-2 mb-1">
              <v-icon left small class="mr-1">mdi-calendar-clock</v-icon>
              Registration Deadline:
              {{ formatDateWithTimeZone(currentEvent.registration.deadline) }}
            </v-card-subtitle>
            <v-card-subtitle class="text-body-2 mb-1">
              <v-icon left small class="mr-1">mdi-web</v-icon>
              <a
                :href="currentEvent.registration.registration_link"
                target="_blank"
                >Register Here</a
              >
            </v-card-subtitle>

            <v-subheader class="mb-2 text-h6">Networking Events</v-subheader>
            <v-row>
              <v-chip
                v-for="(networkEvent, index) in currentEvent.networking_events"
                :key="index"
                outlined
                class="mr-2 mt-3"
              >
                <v-icon left small class="mr-1">mdi-handshake</v-icon>
                {{ networkEvent }}
              </v-chip>
            </v-row>
          </v-card-text>

          <!-- Accessibility Features -->
          <v-card-text class="text-body-1">
            <v-subheader class="text-h6">Accessibility Features</v-subheader>
            <v-list dense>
              <v-list-item
                v-for="(feature, index) in currentEvent.accessibility.features"
                :key="index"
              >
                <v-list-item-content>
                  <v-icon small class="mr-1">mdi-human-wheelchair</v-icon>
                  {{ feature }}
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { useResourceStore } from "@/stores/resources";

// Fetch resources before mounting the component
onBeforeMount(async () => {
  const queryParams = [
    {
      resourceType: "EVENT",
      subject: "",
      topic: "",
      country: "",
      targetRegion: "",
      language: "",
    },
  ];
  await resourceStore.getAllSpecificTypeResources(JSON.stringify(queryParams));
  // selectResource(resourceStore.resources[0]);
});
// Sort the URLs
const resourceStore = useResourceStore();

// Slide URLs
const retrievedParamsRaw =ref(resourceStore.resource.content);
// Assuming you have retrieved paramsObjRaw from storage or API
const retrievedParams = JSON.parse(retrievedParamsRaw.value);
const currentEvent = retrievedParams[0];
function formatLongDateWithTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    timeZoneName: "short",
  });
}
function formatDateWithTimeZone(isoString) {
  const options = {
    weekday: "long", // Saturday
    year: "numeric", // 2024
    month: "short", // Sep
    day: "numeric", // 7
    hour: "2-digit", // 15 (24-hour format)
    minute: "2-digit", // 00
    timeZoneName: "short", // Time zone abbreviation (e.g., "GMT", "PST")
  };
  const date = new Date(isoString);
  return date.toLocaleString(undefined, options);
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans:wght@400;700&display=swap");

.v-card {
  font-family: "Inter", "Noto Sans", sans-serif;
  border-radius: 10px;
}

.text-h4 {
  font-weight: 700;
}

.text-h6 {
  font-weight: 700;
}

.v-subheader {
  font-weight: 700;
  color: #333;
}

p {
  margin: 0;
}

ul {
  padding-left: 16px;
  list-style-type: none;
}

li {
  margin-bottom: 8px;
}

a {
  color: #1e88e5;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.v-divider {
  margin-top: 16px;
  margin-bottom: 16px;
}

.rounded-lg {
  border-radius: 12px;
}
</style>
