<template>
  <v-container>
    <v-stepper v-model="step" vertical>
      <!-- Assignment Details Step -->
      <v-stepper-step step="1" header="Assignment Details">
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          v-if="showingDateTimePicker"
        >
          <v-row>
            <v-col cols="5">
              <v-date-picker
                v-model="taskDate"
                label="Select Assignment Date"
                required
                :min="minDate"
              ></v-date-picker>
            </v-col>
            <v-col cols="5">
              <v-time-picker
                v-model="taskStartTime"
                :allowed-minutes="allowedMinutes"
                format="24hr"
                :min="minTime"
                hint="Assignment Start Time"
                label="Select Assignment Start Time"
                required
              ></v-time-picker>
            </v-col>
            <v-col cols="2">
              <v-select
                class="mr-1"
                disabled
                :items="timeZones"
                density="compact"
                v-model="timeZone"
                label="Time Zone"
              ></v-select>
            </v-col>
          </v-row>

          <!-- Display Assignment Deadline, Duration, and End Time -->
          <p class="ma-4">
            Assignment Deadline: {{ formattedAssignmentDeadline }} | Duration:
            {{ formattedDuration }}
          </p>

          <v-divider />

          <v-card-actions>
            <v-btn @click="calculateEndTime">Set End Time</v-btn> <v-spacer />
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
        <v-btn @click="saveAssignmentDetail" :disabled="!isDateTimeValid"
          >SUBMIT</v-btn
        >
        <v-spacer />
      </v-card-actions>
    </v-stepper>

    <!-- Error and Success Alerts -->
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
import { ref, computed, watch } from "vue";
import axios from "axios";
import { VTimePicker } from "vuetify/labs/VTimePicker";

import { useResourceStore } from "@/stores/resources";
const success = ref(null);
const errorMessage = ref(null);
const clearParticipants = ref(false);

const resourceStore = useResourceStore();
const apiUrl = import.meta.env.VITE_BASE_URL;

const step = ref(1);
const valid = ref(false);
const showingDateTimePicker = ref(true);
const timeZone = ref("");
const taskDate = ref(new Date(Date.now() + 86400000 / 20)); // Default to tomorrow's date
const futureTime = new Date(Date.now() + 86400000 / 20).toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const taskStartTime = ref(futureTime);
const taskEndTime = ref(null);
const taskDuration = ref("Unknown"); // Input for the duration (e.g., "7 days, 12 hours, 50 minutes")

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

// Time Zones for dropdown
const timeZones = computed(() => {
  return timeZonesAll.map((z) => z.region);
});
// Disable past dates and times
const minDate = ref(new Date().toISOString().substr(0, 10)); // Disable past dates
const minTime = computed(() => {
  const now = new Date();
  if (
    taskDate.value.toISOString().substr(0, 10) ===
    now.toISOString().substr(0, 10)
  ) {
    // If the selected date is today, disable past times
    return now.toTimeString().substr(0, 5);
  }
  return "00:00"; // Otherwise, no restriction
});

const formattedAssignmentDeadline = ref("");

// Format the Assignment Deadline to show weekday, long date, and time
// Watch for changes in taskEndTime to calculate taskDuration
watch([taskStartTime, formattedAssignmentDeadline], () => {
  if (taskStartTime.value && formattedAssignmentDeadline.value) {
    calculateDuration();
  }
});

// Function to calculate the duration based on formattedAssignmentDeadline and taskStartTime
function calculateDuration() {
  // Manually parse the formattedAssignmentDeadline.value to ensure it's a valid date
  const deadlineDateRaw = formattedAssignmentDeadline.value;

  function parseDeadlineDate(deadlineDateStr) {
    // Extract the parts of the date from the string
    const dateParts = deadlineDateStr.match(
      /(\d+)\s+(\w+)\s+(\d+)\s+at\s+(\d+):(\d+)/
    );

    if (!dateParts) {
      console.error("Invalid date format");
      return null;
    }

    const day = parseInt(dateParts[1]); // Day: 4
    const month = dateParts[2]; // Month: October
    const year = parseInt(dateParts[3]); // Year: 2024
    const hours = parseInt(dateParts[4]); // Hours: 22
    const minutes = parseInt(dateParts[5]); // Minutes: 55

    // Convert month string to a number (e.g., October = 9)
    const monthNumber = new Date(`${month} 1`).getMonth();

    // Create the Date object
    const deadlineDate = new Date(year, monthNumber, day, hours, minutes);

    return deadlineDate;
  }

  // Usage
  const deadlineDateStr = deadlineDateRaw;

  const deadlineDate = parseDeadlineDate(deadlineDateStr);

  // Assuming taskStartTime is the current time
  const taskStart = new Date();
  console.log({ deadlineDate, taskStart });
  // Calculate the difference in milliseconds
  const diffMs = deadlineDate - taskStart;

  // Calculate days, hours, and minutes
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  // Return the duration as a string
  // Return the duration as a string with singular/plural formatting, omitting zero values
  const durationParts = [];
  if (days > 0) {
    durationParts.push(`${days} ${days === 1 ? "day" : "days"}`);
  }
  if (hours > 0) {
    durationParts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }
  if (minutes > 0) {
    durationParts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  }

  taskDuration.value = durationParts.join(", ");
}

// Computed property to format taskDuration as "X days, X hours, X minutes"
const formattedDuration = computed(() => {
  return taskDuration.value;
});

// Define formattedAssignmentDeadline as a ref (not a computed property anymore)

// Watch for changes in taskDate and taskStartTime
watch(
  [taskDate, taskStartTime],
  () => {
    if (taskDate.value && taskStartTime.value) {
      // Parse the date and time, and merge them into one Date object
      const [hours, minutes] = taskStartTime.value.split(":").map(Number);
      const deadlineDate = new Date(taskDate.value);
      deadlineDate.setHours(hours, minutes);

      // Update formattedAssignmentDeadline with the new date-time format
      formattedAssignmentDeadline.value = deadlineDate.toLocaleDateString(
        "en-UK",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      );
    }
  },
  { immediate: true }
); // Immediate will ensure it's run on initial load

// Format the End Time
const formattedEndTime = computed(() => {
  if (!taskEndTime.value) return "";

  return new Date(taskEndTime.value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
});

// Calculate End Time
function calculateEndTime() {
  if (!taskStartTime.value || !taskDuration.value) return;

  const [startHours, startMinutes] = taskStartTime.value.split(":").map(Number);
  const timeParts = taskDuration.value.match(
    /(\d+)\s*(day|days|hour|hours|minute|minutes)/g
  );
  let totalMinutes = startMinutes;
  let totalHours = startHours;

  timeParts.forEach((part) => {
    const value = parseInt(part);
    if (part.includes("day")) {
      totalHours += value * 24;
    } else if (part.includes("hour")) {
      totalHours += value;
    } else if (part.includes("minute")) {
      totalMinutes += value;
    }
  });

  totalHours += Math.floor(totalMinutes / 60);
  totalMinutes %= 60;
  totalHours %= 24;

  const endDate = new Date(taskDate.value);
  endDate.setHours(totalHours, totalMinutes, 0);

  taskEndTime.value = endDate;
}

// Save Assignment Details
async function saveAssignmentDetail() {
  const resource = JSON.parse(resourceStore.task);

  // Handle task detail submission logic here
  // Example usage

  const formDataJson = JSON.stringify({
    assignmentDeadline: formattedAssignmentDeadline.value,
    assignmentDuration: taskDuration.value,
    wipeParticipants: `${clearParticipants.value === true ? "Yes" : "No"}`,
  });

  try {
    // Send the data using axios
    await axios.post(
      `${apiUrl}/resources/uploads/task/update?sessionId=${resource.sessionId}`,
      formDataJson, // The body data to send
      {
        headers: {
          "Content-Type": "application/json", // Ensure content type is set to JSON
        },
      }
    );

    // Handle success response
    success.value = "Assignment updated successfully.";
    setTimeout(() => {
      window.location.reload();
    }, 4200);
  } catch (error) {
    // Handle error
    errorMessage.value = "Error updating task:";
  }
}

const isDateTimeValid = computed(() => {
  return (
    taskDate.value &&
    taskStartTime.value &&
    taskEndTime.value &&
    taskDuration.value
  );
});
</script>
