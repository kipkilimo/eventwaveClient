<template>
  <v-container class="py-4">

    <!-- DRAG & DROP ZONE -->
    <div
      class="drop-zone"
      @dragover.prevent
      @dragenter.prevent
      @drop.prevent="handleDrop"
      @click="openPicker"
    >
      <v-icon size="40" class="mb-2">mdi-cloud-upload-outline</v-icon>
      <div class="text-subtitle-2">Drag & drop your MP4 here</div>
      <div class="text-caption text-grey">or click to browse</div>

      <v-file-input
        class="d-none"
        ref="fileInput"
        v-model="file"
        accept="video/mp4"
        show-size
        @change="validateFile"
      />
    </div>

    <!-- SELECTED FILE -->
    <v-card
      v-if="file"
      class="mt-4 px-3 py-2 d-flex justify-space-between align-center"
      variant="outlined"
      rounded="lg"
    >
      <div>
        <div class="font-weight-medium">{{ file.name }}</div>
        <div class="text-caption grey--text">
          {{ (file.size / 1024 / 1024).toFixed(2) }} MB
        </div>
      </div>

      <v-btn icon="mdi-close" variant="text" color="grey" @click="removeFile" />
    </v-card>

    <!-- ERROR -->
    <v-alert v-if="error" type="error" class="mt-3" density="compact">
      {{ error }}
    </v-alert>

    <!-- SUCCESS -->
    <v-alert
      v-if="success"
      type="success"
      class="mt-3"
      density="comfortable"
      border="start"
    >
      Video ready to upload
    </v-alert>

    <!-- UPLOAD BUTTON -->
    <v-btn
      class="mt-4"
      color="primary"
      block
      :disabled="!file || uploading"
      @click="uploadVideo"
    >
      <v-icon class="mr-2">mdi-cloud-upload</v-icon>
      {{ uploading ? "Uploading..." : "Upload Video" }}
    </v-btn>

    <!-- PROGRESS BAR -->
    <div v-if="uploading" class="mt-4">
      <div class="text-caption mb-1 text-grey">{{ progress }}% complete</div>
      <v-progress-linear
        height="8"
        rounded
        :value="progress"
        color="blue-darken-2"
        striped
      />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useSocket } from "@/composables/useSocket";
import { useLiveFeedStore } from "@/stores/livefeed";

// Use the new socket composable with aggregator/transmitter pattern
const { socket, events } = useSocket();
const liveFeedStore = useLiveFeedStore();

const emit = defineEmits<{
  (e: "uploaded", payload: { url: string }): void;
  (e: "close"): void;
}>();

const file = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const progress = ref(0);

const error = ref<string | null>(null);
const success = ref(false);

const maxSizeMB = 200;

// ---------------------- VALIDATION ----------------------
function validateFile() {
  error.value = null;
  success.value = false;

  if (!file.value) return;

  const mb = file.value.size / 1024 / 1024;
  if (mb > maxSizeMB) {
    error.value = `File must be under ${maxSizeMB}MB`;
    file.value = null;
    return;
  }

  success.value = true;
}

function removeFile() {
  file.value = null;
  error.value = null;
  success.value = false;
}

// ---------------------- DRAG & DROP ----------------------
function handleDrop(e: DragEvent) {
  const dropped = e.dataTransfer?.files?.[0];
  if (!dropped) return;
  file.value = dropped;
  validateFile();
}

function openPicker() {
  fileInput.value?.click();
}

// ---------------------- SOCKET EVENT HANDLERS ----------------------
function handleMediaUploadSuccess(payload: { url: string; type: string; filename: string }) {
  progress.value = 100;

  // Update store media array
  liveFeedStore.addMedia({
    type: "video",
    url: payload.url,
    caption: "",
  });

  // Notify parent
  emit("uploaded", { url: payload.url });

  setTimeout(() => {
    uploading.value = false;
    progress.value = 0;
    success.value = true;
  }, 600);
}

function handleSocketError(payload: { message: string }) {
  console.error("Socket upload error:", payload.message);
  error.value = `Upload failed: ${payload.message}`;
  uploading.value = false;
  progress.value = 0;
}

// ---------------------- SOCKET UPLOAD ----------------------
async function uploadVideo() {
  if (!file.value) {
    error.value = "Please select a video first.";
    return;
  }

  uploading.value = true;
  progress.value = 20;
  error.value = null;
  success.value = false;

  try {
    const arrayBuffer = await file.value.arrayBuffer();
    progress.value = 50;

    const feedId = liveFeedStore.currentFeed?.id;
    if (!feedId) {
      error.value = "No active LiveFeed.";
      uploading.value = false;
      return;
    }

    // --- REGISTER SUCCESS/ERROR HANDLERS ---
    socket.once("mediaUploadSuccess", handleMediaUploadSuccess);
    socket.once("error", handleSocketError);

    // --- USE TYPED EVENT TRANSMITTER ---
    events.uploadLiveFeedMedia({
      feedId,
      filename: file.value.name,
      file: arrayBuffer,
      type: "video",
    });

  } catch (err) {
    console.error("File processing error:", err);
    error.value = "Failed to process video file.";
    uploading.value = false;
    progress.value = 0;
  }
}

// ---------------------- CLEANUP ----------------------
onUnmounted(() => {
  // Remove any pending socket listeners to prevent memory leaks
  socket.off("mediaUploadSuccess", handleMediaUploadSuccess);
  socket.off("error", handleSocketError);
});
</script>

<style scoped>
.drop-zone {
  border: 2px dashed #9e9e9e;
  border-radius: 12px;
  padding: 35px 20px;
  text-align: center;
  cursor: pointer;
  transition: 0.2s ease;
}
.drop-zone:hover {
  background: #f5f5f5;
  border-color: #1976d2;
}
</style>