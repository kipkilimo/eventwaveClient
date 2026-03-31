<template>
  <v-card>
    <v-stepper v-model="step" vertical>
      <v-stepper-step step="1" header="Assignment Details">
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          v-if="showingAssignmentCreator"
        >
          <v-select
            v-model="assignmentType"
            :items="assignmentTypes"
            label="Select Assignment Type"
            required
            :menu-props="{ maxHeight: 'none' }"
          ></v-select>

          <v-card-text class="mb-2 ml-2 h4"> Set Task Deadline </v-card-text>
          <!-- Time Input Fields with Increment/Decrement Controls -->
          <v-container>
            <v-row class="d-flex justify-center">
              <v-col
                v-for="field in timeFields"
                :key="field.label"
                class="text-center"
              >
                <v-container>
                  <v-row>
                    <!-- Increment Button Above Value -->
                    <v-col class="d-flex justify-center align-center">
                      <v-icon @click="increment(field.ref, field.max)"
                        >mdi-chevron-up</v-icon
                      >
                    </v-col>
                  </v-row>
                  <!-- Display Current Value -->
                  <v-row>
                    <v-col class="d-flex justify-center align-center">
                      {{ field.ref.value }} {{ field.label }}
                    </v-col>
                  </v-row>
                  <!-- Decrement Button Below Value -->
                  <v-row>
                    <v-col class="d-flex justify-center align-center">
                      <v-icon @click="decrement(field.ref, field.min)"
                        >mdi-chevron-down</v-icon
                      >
                    </v-col>
                  </v-row>
                </v-container>
              </v-col>
            </v-row>
          </v-container>

          <!-- Display Dynamic Assignment Duration -->
          <p>Duration: {{ assignmentDuration }}</p>
          <p>Deadline: {{ getDeadline(assignmentDuration) }}</p>

          <!-- Validation Error Message for Time Fields -->
          <p v-if="!isTimeValid">Please set at least one time duration.</p>

          <v-divider />
          <v-text-field
            v-model="assignmentTitle"
            label="Assignment Title"
            required
          ></v-text-field>
          <v-textarea
            v-model="assignmentDescription"
            label="Assignment Description"
            required
          ></v-textarea>

          <!-- <v-card-actions>
            <v-btn @click="submitAssignment">Submit Assignment</v-btn>
          </v-card-actions> -->
        </v-form>
      </v-stepper-step>

      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="outlined"
          width="7.5rem"
          @click="submitAssignment"
          :disabled="!isTimeValid"
        >
          Submit
        </v-btn>
        <v-spacer />
      </v-card-actions>
    </v-stepper>
    <v-dialog max-width="500" v-model="uploadingQuestionsSet">
      <v-card title="Upload Assignment Set Task">
        <v-divider />
        <TaskUploader />
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from "vue";

// Initial state variables
const valid = ref(false);
const step = ref(1);
const assignmentType = ref("");
const assignmentTitle = ref("");
const assignmentDescription = ref("");
const uploadingQuestionsSet = ref(false);
const assignmentDuration = ref("10 minutes");
const assignmentTypes = ["Test Tasks", "Project", "Essay", "Research"];
// Time fields with default 3 days set
const minutes = ref(15);
const hours = ref(0);
const days = ref(0);
const weeks = ref(0);
const months = ref(0);

// Time fields with v-model
const timeFields = [
  { ref: minutes, label: "Minutes", min: 0, max: 59 },
  { ref: hours, label: "Hours", min: 0, max: 23 },
  { ref: days, label: "Days", min: 0, max: 7 },
  { ref: weeks, label: "Weeks", min: 0, max: 4 },
  { ref: months, label: "Months", min: 0, max: 12 },
];

// Increment and decrement functions for fields
const increment = (field, max) => {
  if (field.value < max) field.value++;
};
const decrement = (field, min) => {
  if (field.value > min) field.value--;
};

// Check if at least one time field is set to a non-zero value
const isTimeValid = computed(() => {
  return (
    minutes.value > 0 ||
    hours.value > 0 ||
    days.value > 0 ||
    weeks.value > 0 ||
    months.value > 0
  );
});

// Watch time fields and update duration string dynamically
watch([minutes, hours, days, weeks, months], () => {
  const totalDuration = [];
  if (months.value)
    totalDuration.push(`${months.value} month${months.value > 1 ? "s" : ""}`);
  if (weeks.value)
    totalDuration.push(`${weeks.value} week${weeks.value > 1 ? "s" : ""}`);
  if (days.value)
    totalDuration.push(`${days.value} day${days.value > 1 ? "s" : ""}`);
  if (hours.value)
    totalDuration.push(`${hours.value} hour${hours.value > 1 ? "s" : ""}`);
  if (minutes.value)
    totalDuration.push(
      `${minutes.value} minute${minutes.value > 1 ? "s" : ""}`,
    );

  assignmentDuration.value = totalDuration.join(", ") || "15 minutes";
});

// Function to calculate the deadline based on assignment duration
function getDeadline(durationStr) {
  const now = new Date(); // Get current date and time

  // Define time units in milliseconds
  const timeUnits = {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000, // Approximation for month (30 days)
  };

  // Split the duration string into individual components
  const durationParts = durationStr.split(",").map((part) => part.trim());

  // Add each component's value to the current time
  durationParts.forEach((part) => {
    const [value, unit] = part.split(" ").map((p) => p.trim());
    const unitKey = unit.replace(/s$/, ""); // Remove plural form (minutes -> minute)

    if (timeUnits[unitKey]) {
      now.setTime(now.getTime() + parseInt(value) * timeUnits[unitKey]);
    }
  });

  // Format the final date and time
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short",
  };

  return now.toLocaleString("en-US", options); // Returns in local time format
}

// Example usage

// Form validation for assignment fields
const isAssignmentValid = computed(
  () =>
    assignmentType.value &&
    assignmentTitle.value &&
    assignmentDescription.value,
);

// Submit the assignment with time validation
const submitAssignment = () => {
  if (valid.value && isTimeValid.value) {
    const formData = {
      assignmentType: assignmentType.value,
      assignmentTitle: assignmentTitle.value,
      assignmentDescription: assignmentDescription.value,
      assignmentDuration: assignmentDuration.value,
      assignmentDeadline: getDeadline(assignmentDuration.value),
    };
    console.log("Assignment Submitted", formData);
    localStorage.setItem("assignmentMetaInfo", JSON.stringify(formData));

    uploadingQuestionsSet.value = true;
  } else {
    console.error(
      "Please fill in all required fields and ensure the time duration is set.",
    );
  }
};

// Toggle assignment creator form visibility
const showingAssignmentCreator = ref(true);
</script>
