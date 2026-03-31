<template>
  <div class="">
    <div v-if="showExamPlayer">
      <TestPlayer />
    </div>
    <div v-if="!showExamPlayer">
      <v-row>
        <v-col cols="12" sm="9" class="text-left mb-4">
          <img
            style="width: 100%; max-height: 9rem; object-fit: cover"
            src="https://www.vevox.com/getmedia/d6e9e7d0-b98a-455b-b404-da9687ffd488/Live-polling_Hero_1166x523.png?width=1107"
            alt="Live Poll"
          />
        </v-col>
        <v-col cols="12" sm="3" class="text-left mb-4">
          <router-link to="/welcome" class="d-flex align-center">
            <v-img
              src="https://a2z-v0.s3.eu-central-1.amazonaws.com/Screenshot+from+2024-10-22+16-31-16.png"
              width="100"
              height="40"
            />
          </router-link>
          <div class="mt-3">
            <v-row>
              <v-col cols="9">
                <h1 class="text-h6">Exam Participant Enrollment</h1>
                <p>Exam ID: {{ sessionId }}</p>
                <p>Session ID: {{ userId }}</p>
              </v-col>
              <v-col cols="3">
                <v-img
                  style="cursor: pointer"
                  @click="reRenderView"
                  height="3rem"
                  src="https://cdn-icons-png.flaticon.com/128/10619/10619786.png"
                ></v-img>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="submitParticipantData"
          >Request Exam Enrollment</v-btn
        >

        <v-btn
          variant="outlined"
          prepend-icon="mdi-book-edit-outline"
          v-if="participantIsEnrolled"
          @click="showExamPlayer = true"
          >Attempt this exam</v-btn
        >
        <v-spacer />
      </v-card-actions>

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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { useResourceStore } from "@/stores/resources";

const resourceStore = useResourceStore();
const apiUrl = import.meta.env.VITE_BASE_URL;
const showExamPlayer = ref(false);

const route = useRoute();
const sessionId = ref(route.query.sessionId || route.params.sessionId); // Fetch sessionId from query or params
const userId = ref(localStorage.getItem("sessionId")); // Retrieve userId from local storage
const success = ref(null);
const errorMessage = ref(null);
const participantIsEnrolled = ref(false); // Declare a ref to hold the value

// Function to check enrollment status
const checkParticipantEnrollment = () => {
  // Safely access the participants array
  const participantsRaw = JSON.parse(resourceStore.exam);
  const participants = JSON.parse(participantsRaw.participants);

  console.log({ participants });
  // Filter the participants array based on userId
  const participantRaw = participants.filter(
    (participant) => participant.userId === userId.value
  );

  // Safely access the first participant from the filtered list
  const participant = participantRaw[0];

  // Check if the participant exists and their requestStatus is "ENROLLED"
  participantIsEnrolled.value = participant.requestStatus === "ENROLLED";
};
// Method to check if the user is enrolled

onMounted(async () => {
  await resourceStore.getCurrentExam(sessionId.value);
  // Example userId to check (replace this with the actual userId you want to check)
  const userIdToCheck = userId.value;
});
const submitParticipantAttemptTest = async () => {
  console.log("Attempt this exam");
  await resourceStore.getCurrentExam(sessionId.value);
  // Example userId to check (replace this with the actual userId you want to check)
  checkParticipantEnrollment();

  // check time if within start/stop period
  // render the exam player
};

const submitParticipantData = async () => {
  try {
    const data = {
      sessionId: sessionId.value,
      userId: userId.value,
    };
    // Submit data to server
    const response = await axios.post(
      `${apiUrl}/resources/uploads/exam/participant`,
      data
    );
    console.log({ response });
    if (response.data.message) {
      success.value = "Enrollment request submitted successfully.";
      setTimeout(() => {
        success.value = "";
      }, 4200);
      submitParticipantAttemptTest();
    }
  } catch (error) {
    console.log({ error });
    if (axios.isAxiosError(error)) {
      // Capture the error details
      errorMessage.value = error.response.data.error;
      setTimeout(() => {
        window.location.reload();
      }, 4200);
    }
  }
};
</script>
