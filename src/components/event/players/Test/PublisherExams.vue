<template>
  <v-card flat color="#dbdbdb" min-width="1080">
    <!-- Wrapping card container -->
    <v-row
      class="overflow-y-auto mt-1"
      style="height: 95vh; max-height: 95vh; overflow-y: auto"
    >
      <v-col v-for="(item, index) in parsedExams" :key="index" cols="12">
        <v-card
          class="mx-auto my-4"
          max-width="51rem"
          min-width="51rem"
          style="
            background-image: url(&quot;https://img.freepik.com/free-vector/hand-drawn-school-supplies-pattern-background_23-2150855728.jpg&quot;);
            background-size: cover;
            background-position: center;
          "
        >
          <v-card-title>{{ item.title }}</v-card-title>
          <v-card-title class="text-overline"
            >{{ item.subject }} EXAMINATION</v-card-title
          >
          <v-divider />
          <v-card-subtitle color="#0c0c0c">
            <h3 color="#0c0c0c">
              <strong>
                DATE:
                {{ formatDateTime(item.examMetaInfo.examDate) }}
                | START: {{ item.examMetaInfo.examStartTime }} | DURATION:
                {{ item.examMetaInfo.examDuration }} | END:
                {{ item.examMetaInfo.examEndTime }}</strong
              >
            </h3>
          </v-card-subtitle>
          <v-card-text>{{ item.description }}</v-card-text>
          <v-row>
            <v-col>
              <v-chip-group column active-class="v-chip--active">
                <!-- Iterate over test metadata -->
                <v-chip
                  v-for="(metaItem, index) in item.examMetaInfo.testMeta"
                  :key="index"
                  color="primary"
                  outlined
                  class="ma-2"
                >
                  Type: <strong> {{ metaItem.testType }} </strong> | Number of
                  Questions: <strong> {{ metaItem.numberOfQuestions }} </strong>
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
          <v-divider />
          <v-card-actions>
            <v-spacer /><v-spacer /><v-spacer />
            <v-btn
              variant="outlined"
              @click="handleGetLinkDialog(item), (getLinkDialog = true)"
            >
              <v-icon size="32">mdi-link</v-icon> Participants link</v-btn
            >
            <v-spacer />
            <v-btn
              @click="
                setPapericipants(item), (manageExamParticipantsDialog = true)
              "
              >Manage Participants</v-btn
            >
            <v-spacer />
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  color="red"
                  v-if="hasExamLapsed(item.examMetaInfo.examStartTime, item.examMetaInfo.examDuration)"
                  icon="mdi-note-check-outline"
                  size="large"
                  @click="showExamGrader=true"
                ></v-btn>
              </template>
              <span>Grade submitted responses</span>
            </v-tooltip>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  color=""
                  icon="mdi-clipboard-text-clock-outline"
                  size="large"
                  @click="
                    (resourceStore.exam = JSON.stringify(item)),
                      (showEditDialog = true)
                  "
                ></v-btn>
              </template>
              <span>Update Exam Start Date and time</span>
            </v-tooltip>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <!-- QR Link -->
    <v-dialog v-model="getLinkDialog" width="auto">
      <v-card min-width="540">
        <v-card-text
          ><v-icon class="mr-2">mdi-multicast</v-icon> Share enrollment link
          with participants</v-card-text
        >
        <v-divider />
        <div ref="participantInvite">
          <img
            style="height: 12rem; cursor: pointer"
            :src="qrCodeUrl"
            alt="QR Code"
          />
          <p class="ma-4">{{ urlData }}</p>
          <v-divider />
        </div>
        <v-card-actions>
          <v-spacer />
          <v-btn
            class="ms-auto"
            text="Save"
            color="info"
            variant="outlined"
            width="7.5rem"
            @click="saveLink"
            ><v-icon class="mr-2">mdi-cloud-download-outline</v-icon>SAVE</v-btn
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
      </v-card>
    </v-dialog>
    <!-- Participant management dialog -->
    <v-dialog v-model="manageExamParticipantsDialog" max-width="66%">
      <!-- Display participants when available -->
      <v-card min-height="7.5em">
        <h4
          color="#55565a"
          class="ma-4"
          v-if="pendingParticipants.length === 0"
        >
          No pending participants
        </h4>
        <h4 color="#55565a" class="ma-4" v-if="pendingParticipants.length >= 1">
          Pending participants
        </h4>
        <v-row
          class="overflow-y-auto mt-1"
          style="height: 95vh; max-height: 95vh"
        >
          <v-col
            cols="12"
            md="6"
            v-for="(participant, index) in pendingParticipants"
            :key="index"
          >
            <v-card
              :loading="loading"
              class="mx-auto my-3"
              max-width="33rem"
              color="#dbdbdf"
            >
              <v-card
                flat
                color="transparent"
                class="mx-auto"
                prepend-icon="mdi-account-check"
                :subtitle="participant.userId"
              >
                <template v-slot:title>
                  <span class="font-weight-black">{{
                    participant.participantName
                  }}</span>
                </template>
              </v-card>
              <v-divider class="mx-4 mb-1" />
              <v-card-actions>
                <!-- Action buttons for participant request -->
                <v-btn color="red" text @click="rejectRequest(participant)"
                  >REJECT</v-btn
                >
                <v-spacer />
                <v-btn
                  color="green"
                  variant="text"
                  @click="acceptRequest(participant)"
                  >ACCEPT
                </v-btn>
                <v-spacer />
                <!-- Accept all button, shown only if the user is the creator 
              v-if="userId === participant.createdBy.id"-->
                <v-btn
                  color="success"
                  variant="outlined"
                  @click="acceptAllRequests"
                  rounded
                >
                  <v-icon size="32">mdi-cloud-lock-open-outline</v-icon>
                  ACCEPT ALL REQUESTS
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
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
      </v-card>
    </v-dialog>

    <!-- Participant  //   const acceptedRequests = ref([]);
    
  // const rejectedRequests = ref([]); management dialog -->

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
    <v-dialog width="81%" v-model="showEditDialog">
      <v-card>
        <update-date-time />
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import QRCode from "qrcode";
import axios from "axios";
import jsPDF from "jspdf";
import { useResourceStore } from "@/stores/resources";

const resourceStore = useResourceStore();
const getLinkDialog = ref(false);
const showEditDialog = ref(false);
const showExamGrader = ref(false);
const manageExamParticipantsDialog = ref(false);
const qrCodeUrl = ref("");
const parsedExams = ref([]);
const apiUrl = import.meta.env.VITE_CLIENT_URL;
const serverUrl = import.meta.env.VITE_BASE_URL;
const parsedParticipantsData = ref([]);
const urlData = ref(
  `${apiUrl}/exam/participant?sessionId=${parsedExams.value.length > 0 ? parsedExams.value[0].sessionId : ""}`
);
const participants = ref([]);
const pendingParticipants = ref([]);
const success = ref(null);
const errorMessage = ref(null);

function setPapericipants(item) {
  participants.value = JSON.parse(item.participants);
  pendingParticipants.value = participants.value.filter(
    (p) => p.requestStatus === "PENDING"
  );
}

import { DateTime, Duration } from "luxon";

// Function to determine if the exam has lapsed
function hasExamLapsed(startTimeStr, durationStr) {
  // Step 1: Parse the start time and timezone from the string '09:00 EAT'
  const [startTime, timezone] = startTimeStr.split(" ");
  const [startHour, startMinute] = startTime.split(":").map(Number);

  // Step 2: Parse the duration string '3 hrs : 0 mins'
  const durationMatch = durationStr.match(/(\d+)\s*hrs\s*:\s*(\d+)\s*mins/);
  const durationHours = parseInt(durationMatch[1], 10);
  const durationMinutes = parseInt(durationMatch[2], 10);

  // Step 3: Create start time using Luxon with dynamic timezone
  const startDateTime = DateTime.fromObject(
    { hour: startHour, minute: startMinute },
    { zone: timezone }
  );

  // Step 4: Create the exam duration
  const examDuration = Duration.fromObject({
    hours: durationHours,
    minutes: durationMinutes,
  });

  // Step 5: Calculate the end time by adding the duration to the start time
  const endDateTime = startDateTime.plus(examDuration);

  // Step 6: Get the current time in the same timezone
  const currentTime = DateTime.now().setZone(timezone);

  // Step 7: Determine if the exam has lapsed
  return currentTime > endDateTime;
}

const saveLink = () => {
  const padding = 4;
  const lineThickness = 0.1;
  const doc = new jsPDF();

  // Add the QR code
  doc.addImage(qrCodeUrl.value, "PNG", padding, padding + 10, 180, 160);

  const lineY = padding + 180 + 5;
  doc.setLineWidth(lineThickness);
  doc.line(padding, lineY, 205, lineY);

  const textY = lineY + 10;
  doc.text("Participants enrollment link (Via NEMBio Exams).", padding, textY);
  doc.text(urlData.value, padding, textY + 10);

  // Add a repeating image (link) as a background for top and bottom 25% of the page
  const logoUrl =
    "https://png.pngtree.com/png-vector/20230227/ourmid/pngtree-block-blue-logo-png-image_6621541.png"; // Image URL (example)
  const linkWidth = 50; // Width of the repeating image
  const linkHeight = 20; // Height of the repeating image
  const linkOpacity = 0.4;

  // Set opacity for watermark images
  doc.setGState(new doc.GState({ opacity: linkOpacity }));

  // Top 12.5% repeating background
  const topHeight = doc.internal.pageSize.height * 0.12; // Calculate 12.5% of the page height
  for (let y = 10; y < topHeight; y += linkHeight + 10) {
    for (let x = 5; x < 200; x += linkWidth + 10) {
      doc.addImage(logoUrl, "PNG", x, y, linkWidth, linkHeight);
    }
  }
  // Bottom 25% repeating background
  for (let y = 260; y < 290; y += linkHeight + 10) {
    for (let x = 5; x < 200; x += linkWidth + 10) {
      doc.addImage(logoUrl, "PNG", x, y, linkWidth, linkHeight);
    }
  }

  // Reset opacity for other elements
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Add the main logo at the bottom of the PDF
  const mainLogoWidth = 67;
  const mainLogoHeight = 60;
  const logoX = padding;
  const logoY = textY + 20;

  doc.addImage(logoUrl, "PNG", logoX, logoY, mainLogoWidth, mainLogoHeight);

  // Save the PDF with the participant link
  doc.save(`participant_link_${parsedExams.value[0].sessionId}.pdf`);

  getLinkDialog.value = false;
};

// Arrays to manage requests
const pendingRequests = computed(() =>
  parsedParticipantsData.value.filter(
    (request) => request.requestStatus === "PENDING"
  )
);
const acceptedRequests = ref([]);
const rejectedRequests = ref([]);

// TIME
function formatDateTime(examDate) {
  // Create a Date object from the examDate string
  const date = new Date(examDate);

  // Get the local date string (without time)
  const options = { year: "numeric", month: "long", day: "numeric" };
  const fullDate = date.toLocaleDateString(undefined, options);

  return fullDate;
}

// Consolidated function to update request status and move between lists
const updateRequestStatus = (request, newStatus, fromList, toList) => {
  request.requestStatus = newStatus;
  fromList.value = fromList.value.filter((r) => r.userId !== request.userId);
  toList.value.push(request);
};

// Manage acceptance and rejection
const handleAcceptRequest = (request) => {
  updateRequestStatus(request, "ACCEPTED", pendingRequests, acceptedRequests);
};

const handleRejectRequest = (request) => {
  updateRequestStatus(request, "REJECTED", pendingRequests, rejectedRequests);
};

// Restore a rejected request to pending
const handleRestoreRequest = (request) => {
  updateRequestStatus(request, "PENDING", rejectedRequests, pendingRequests);
};

// Undo an accepted request to pending
const handleUndoAccept = (request) => {
  updateRequestStatus(request, "PENDING", acceptedRequests, pendingRequests);
};

// Save final participant list
const saveParticipantsList = async () => {
  //   const acceptedRequests = ref([]);
  // const rejectedRequests = ref([]);
  //
  const data = {
    sessionId: parsedExams.value[0].sessionId,
    participantsList: JSON.stringify(
      { ACCEPTED: acceptedRequests.value },
      { REJECTED: rejectedRequests.value }
    ),
  };

  try {
    const response = await axios.post(
      `${serverUrl}/resources/uploads/exam/enroll`,
      data
    );
    console.log("Enrollment request submitted successfully:", response);
  } catch (error) {
    console.error("Error saving participant list:", error);
  }
};

const handleGetLinkDialog = (item) => {
  generateQRCode(item.sessionId);
  urlData.value = `${apiUrl}/exam/participant?sessionId=${parsedExams.value.length > 0 ? item.sessionId : ""}`;
};
// Parse the exams data
onMounted(() => {
  parsedExams.value = JSON.parse(resourceStore.exams);
  if (parsedExams.value.length > 0) {
    generateQRCode(parsedExams.value[0].sessionId);
    parsedParticipantsData.value = JSON.parse(
      parsedExams.value[0].participants
    ); // parseJsonArray();
  }
});

// Parse participant JSON data
function parseJsonArray() {
  return parsedExams.value[0].participants
    .map((item) => {
      try {
        return JSON.parse(item);
      } catch (error) {
        console.error("Invalid JSON format:", item);
        return null;
      }
    })
    .filter((item) => item !== null); // Remove null entries
}

// Generate QR code
const generateQRCode = async (sessionId) => {
  try {
    const data = `${apiUrl}/exam/participant?sessionId=${sessionId}`;
    const url = await QRCode.toDataURL(data, { type: "png" });
    qrCodeUrl.value = url;
  } catch (err) {
    console.error(err);
  }
};

const acceptRequest = async (participant) => {
  console.log("ACCEPT", {
    participantId: participant.userId,
    action: "REJECT",
    sessionId: participant.sessionId,
  });
  try {
    await axios.post(`${serverUrl}/resources/uploads/exam/enroll`, {
      participantId: participant.userId,
      action: "ACCEPT",
      sessionId: participant.sessionId,
    });

    success.value = `Participant ${participant.participantName} enrolled.`;
    setTimeout(() => {
      success.value = "";
    }, 4200);
    // Filter out the enrolled participant from the pendingParticipants array
    pendingParticipants.value = pendingParticipants.value.filter(
      (p) => p.userId !== participant.userId
    );
  } catch (error) {
    errorMessage.value = `Error rejecting ${participant.participantName}: ${error.message}`;
  }
};

const rejectRequest = async (participant) => {
  console.log("REJECT", {
    participantId: participant.userId,
    action: "REJECT",
    sessionId: participant.sessionId,
  });
  try {
    await axios.post(`${serverUrl}/resources/uploads/exam/enroll`, {
      participantId: participant.userId,
      action: "REJECT",
      sessionId: participant.sessionId,
    });

    success.value = `Participant ${participant.participantName} rejected.`;
    setTimeout(() => {
      success.value = "";
    }, 4200);
    // Filter out the rejected participant from the pendingParticipants array
    pendingParticipants.value = pendingParticipants.value.filter(
      (p) => p.userId !== participant.userId
    );
  } catch (error) {
    errorMessage.value = `Error rejecting ${participant.participantName}: ${error.message}`;
  }
};

const acceptAllRequests = async () => {
  try {
    const participantIds = pendingParticipants.value.map((p) => p.userId);
    await axios.post(`${serverUrl}/resources/uploads/exam/enroll`, {
      participantIds,
      action: "ACCEPT_ALL",
      sessionId: pendingParticipants.value[0].sessionId,
    });

    success.value = "All participant requests accepted successfully.";
    window.location.reload();
  } catch (error) {
    errorMessage.value = `Error accepting all participants: ${error.message}`;
  }
};
</script>
