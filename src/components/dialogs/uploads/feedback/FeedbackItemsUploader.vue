<template>
  <v-container>
    <v-file-input
      v-model="file"
      accept=".csv,.xlsx,.xls,.json"
      label="Upload Feedback Questions File"
      prepend-icon="mdi-file-table"
      :multiple="false"
      :rules="fileRules"
      show-size
      clearable
    />

    <v-row justify="center" class="mt-4">
      <v-btn
        color="primary"
        :loading="uploading"
        :disabled="!file || uploading"
        @click="uploadQuestions"
      >
        <v-icon start>mdi-cloud-upload</v-icon>
        Upload Questions
      </v-btn>

      <v-btn
        variant="text"
        class="ml-2"
        @click="closeUploader"
      >
        Close
      </v-btn>
    </v-row>

    <v-progress-linear
      v-if="uploading"
      :value="uploadProgress"
      height="6"
      class="mt-4"
    />

    <v-alert v-if="error" type="error" class="mt-4">
      {{ error }}
    </v-alert>

    <v-alert
      v-if="success"
      type="success"
      class="mt-4"
      title="Feedback Activated"
    >
      Questions uploaded successfully. Feedback is now live.
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import axios from "axios";

const apiUrl = import.meta.env.VITE_BASE_URL;

/* -----------------------------
   Props & Emits
----------------------------- */
const props = defineProps<{
  feedbackId: string;
}>();

const emit = defineEmits<{
  (e: "success"): void;
  (e: "error", message: string): void;
  (e: "close"): void;
}>();

/* -----------------------------
   State
----------------------------- */
const file = ref<File | null>(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const success = ref(false);
const error = ref<string | null>(null);

/* -----------------------------
   Validation
----------------------------- */
const MAX_SIZE_MB = 7;

const allowedMimeTypes = [
  "text/csv",
  "application/json",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const fileRules = computed(() => [
  () =>
    !file.value ||
    file.value.size / 1024 / 1024 <= MAX_SIZE_MB ||
    `File must be under ${MAX_SIZE_MB} MB`,
]);

/* -----------------------------
   Helpers
----------------------------- */
const resetState = () => {
  file.value = null;
  uploadProgress.value = 0;
  uploading.value = false;
  success.value = false;
  error.value = null;
};

const closeUploader = () => {
  resetState();
  emit("close");
};

/* -----------------------------
   Upload
----------------------------- */
const uploadQuestions = async () => {
  if (!file.value) return;

  if (!allowedMimeTypes.includes(file.value.type)) {
    const msg = "Unsupported file type. Upload CSV, XLSX or JSON only.";
    error.value = msg;
    emit("error", msg);
    return;
  }

  error.value = null;
  success.value = false;
  uploading.value = true;

  const formData = new FormData();
  formData.append("file", file.value);

  try {
    const res = await axios.post(
      `${apiUrl}/feedback/bulk-create?feedbackId=${props.feedbackId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) {
            uploadProgress.value = Math.round(
              (e.loaded * 100) / e.total
            );
          }
        },
      }
    );

    if (res.data?.success) {
      success.value = true;
      emit("success");
    } else {
      throw new Error("Upload failed");
    }
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      "Failed to upload feedback questions";
    error.value = msg;
    emit("error", msg);
  } finally {
    uploading.value = false;
  }
};
</script>
