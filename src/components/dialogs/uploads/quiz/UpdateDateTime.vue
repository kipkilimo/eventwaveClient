<template>
  <v-container>
    <v-stepper v-model="step" vertical>
      <!-- Exam Details Step -->
      <v-stepper-step step="1" header="Exam Details">
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          v-if="showingDateTimePicker"
        >
          <v-row>
            <v-col cols="6">
              <v-select
                v-model="selectedHour"
                :items="hourOptions"
                label="Select Hours Duration"
                required
                :menu-props="{ maxHeight: 'none' }"
              ></v-select>
            </v-col>

            <v-col cols="6">
              <v-select
                v-model="selectedMinute"
                :items="minuteOptions"
                label="Select Minutes Duration"
                required
                :menu-props="{ maxHeight: 'none' }"
              ></v-select>
            </v-col>
          </v-row>

          <p>Exam Duration: {{ formattedDuration }}</p>
          <v-divider />
          <v-row>
            <v-col cols="5">
              <v-time-picker
                v-model="examStartTime"
                :allowed-minutes="allowedMinutes"
                format="24hr"
                :min="minTime"
                hint="Exam Start Time"
                label="Select Exam Start Time"
                required
              ></v-time-picker>
            </v-col>
            <v-col cols="5">
              <v-date-picker
                v-model="examDate"
                label="Select Exam Date"
                required
              ></v-date-picker>
            </v-col>

            <v-col cols="2">
              <v-select
                class="mr-1"
                :items="timeZones"
                density="compact"
                v-model="timeZone"
                label="Time Zone"
              ></v-select>
            </v-col>
          </v-row>

          <p>
            Exam Date: {{ formattedExamDate }} | Duration:
            {{ formattedDuration }} | Ends at: {{ examEndTime }}
          </p>
          <v-divider />
          <v-card-actions>
            <v-btn @click="calculateEndTime">Set End Time</v-btn><v-spacer />
            <v-switch
              :color="clearParticipants ? 'orange' : '0'"
              v-model="clearParticipants"
              :label="`Clear Participants: ${clearParticipants ? 'Yes' : 'No'}`"
              hide-details
              inset
            ></v-switch
            ><v-spacer />
          </v-card-actions>
        </v-form>
      </v-stepper-step>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn @click="saveExamDetail" :disabled="!isDateTimeValid"
          >SUBMIT</v-btn
        >
        <v-spacer />
      </v-card-actions>
    </v-stepper>
    <v-alert
      border="top"
      type="warning"
      variant="outlined"
      prominent
      class="ml-38 mt-4"
      width="72%"
      v-if="errorMessage"
    >
      {{ errorMessage }}
    </v-alert>

    <v-alert
      border="top"
      v-if="success"
      type="success"
      class="ml-38 mt-4"
      width="72%"
      variant="outlined"
      prominent
    >
      {{ success }}
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import { VTimePicker } from "vuetify/labs/VTimePicker";

import axios from "axios";
import { useResourceStore } from "@/stores/resources";
const success = ref(null);
const errorMessage = ref(null);
const clearParticipants = ref(false);

const resourceStore = useResourceStore();
const apiUrl = import.meta.env.VITE_BASE_URL;
const step = ref(1);
const valid = ref(false);
const showingDateTimePicker = ref(true);
const examStartTime = ref(null);
const examDate = ref(new Date(Date.now() + 86400000)); // Default to tomorrow's date
const selectedHour = ref("0");
const selectedMinute = ref("00");
const timeZone = ref("");
const examEndTime = ref(null);
const examDuration = ref("");
const hourOptions = ["0", "1", "2", "3", "4"];
const minuteOptions = ["00", "15", "30", "45"];
const timeZonesAll = [
  { name: "GMT", region: "Greenwich Mean Time", iana: "GMT" },
  { name: "CET", region: "Central European Time", iana: "Europe/Berlin" },
  { name: "EET", region: "Eastern European Time", iana: "Europe/Helsinki" },
  { name: "CAT", region: "Central Africa Time", iana: "Africa/Harare" },
  { name: "WAT", region: "West Africa Time", iana: "Africa/Lagos" },
  { name: "EAT", region: "East Africa Time", iana: "Africa/Nairobi" },
  { name: "EST", region: "Eastern Standard Time", iana: "America/New_York" },
  { name: "PST", region: "Pacific Standard Time", iana: "America/Los_Angeles" },
  { name: "IST", region: "India Standard Time", iana: "Asia/Kolkata" },
];

// Example usage

const timeZones = computed(() => {
  const tz = timeZonesAll.map((z) => {
    return z.region;
  });
  return tz;
});
const formattedDuration = computed(() => {
  const hours = parseInt(selectedHour.value || "0", 10);
  const minutes = parseInt(selectedMinute.value || "0", 10);
  if (isNaN(hours) || isNaN(minutes)) return "Invalid duration";
  const hourText = hours === 1 ? "hr" : "hrs";
  const minuteText = minutes === 1 ? "min" : "mins";
  examDuration.value = `${hours} ${hourText} : ${minutes} ${minuteText}`;
  return `${hours} ${hourText} : ${minutes} ${minuteText}`;
});

const formattedExamDate = computed(() => {
  if (!examDate.value) return "Invalid Date";
  return new Date(examDate.value).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

function calculateEndTime() {
  if (!examStartTime.value || !formattedDuration.value) return;

  const [startHours, startMinutes] = examStartTime.value.split(":").map(Number);
  const [hours, minutes] = formattedDuration.value.match(/\d+/g).map(Number);

  let totalMinutes = startMinutes + minutes;
  let totalHours = startHours + hours + Math.floor(totalMinutes / 60);
  totalMinutes %= 60;
  totalHours %= 24;

  examEndTime.value = `${String(totalHours).padStart(2, "0")}:${String(totalMinutes).padStart(2, "0")}`;
}

const isDateTimeValid = computed(() => {
  return (
    examDate.value &&
    examStartTime.value &&
    examEndTime.value &&
    selectedHour.value &&
    selectedMinute.value
  );
});

async function saveExamDetail() {
  const resource = JSON.parse(resourceStore.exam);
  function getTimeZoneAbbreviation(region) {
    // Find the time zone with the matching region
    const timeZone = timeZonesAll.find((tz) => tz.region === region);

    // Return the name (abbreviation) if found, otherwise return null or an error message
    return timeZone ? timeZone.name : null;
  }
  if (isDateTimeValid.value) {
    // Handle exam detail submission logic here
    // Example usage
    const selectedRegion = timeZone.value;
    const timeZoneAbbreviation = getTimeZoneAbbreviation(selectedRegion);
    console.log(timeZoneAbbreviation); // Output: EAT

    const formDataJson = JSON.stringify({
      examDate: examDate.value,
      examStartTime: `${examStartTime.value} ${timeZoneAbbreviation}`,
      examDuration: examDuration.value,
      examEndTime: examEndTime.value,

      wipeParticipants: `${clearParticipants.value === true ? "Yes" : "No"}`,
    });

    try {
      // Send the data using axios
      await axios.post(
        `${apiUrl}/resources/uploads/exam/update?sessionId=${resource.sessionId}`,
        formDataJson, // The body data to send
        {
          headers: {
            "Content-Type": "application/json", // Ensure content type is set to JSON
          },
        }
      );

      // Handle success response
      success.value = "Exam updated successfully:";
      setTimeout(() => {
        window.location.reload();
      }, 4200);
    } catch (error) {
      // Handle error
      errorMessage.value = "Error updating exam:";
    }
  }
}
</script>
