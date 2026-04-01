<template>
  <v-card
    class="mx-auto pa-4 pa-sm-6"
    elevation="8"
    max-width="600"
    rounded="sm"
  >
    <!-- HEADER -->
    <v-card-title class="text-h5 font-weight-bold mb-1 d-flex align-center">
      <v-icon color="primary" class="mr-3" size="30">
        mdi-cloud-upload-outline
      </v-icon>
      PDF Document Upload for {{ orgName }}({{ organizationId }})
    </v-card-title>

    <v-card-text class="text-medium-emphasis">
      Required: Signed Attestation of Support and Terms & Conditions as a single
      PDF file (max {{ maxSizeMB }} MB).
    </v-card-text>

    <v-divider class="my-4" />

    <!-- FILE INPUT -->
    <v-file-input
      v-model="file"
      accept="application/pdf"
      label="Select PDF File"
      prepend-icon="mdi-file-pdf-box"
      variant="outlined"
      density="comfortable"
      :rules="fileRules"
      show-size
      clearable
      :disabled="uploading"
    />

    <!-- ERROR -->
    <v-alert
      v-if="error"
      type="error"
      class="mb-4"
      variant="tonal"
      density="compact"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-alert-circle-outline</v-icon>
        {{ error }}
      </div>
    </v-alert>

    <!-- PROGRESS -->
    <v-progress-linear
      v-if="uploading"
      :model-value="uploadProgress"
      height="8"
      color="success"
      class="mt-4 rounded-pill"
      striped
      :indeterminate="uploadProgress === 0"
    >
      <template v-slot:default="{ value }">
        <strong class="text-caption">
          {{ value > 0 ? `${Math.round(value)}%` : "Initializing upload..." }}
        </strong>
      </template>
    </v-progress-linear>

    <!-- SUCCESS -->
    <v-alert
      v-if="isUploadSuccessful"
      type="success"
      class="mt-4"
      variant="flat"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-check-circle-outline</v-icon>
        <strong>Success!</strong> PDF uploaded successfully. Refreshing page...
      </div>
    </v-alert>

    <!-- BUTTON -->
    <v-row justify="end" class="mt-4">
      <v-col cols="12">
        <v-btn
          @click="uploadFile"
          :disabled="!isFileValid || uploading"
          color="primary"
          size="large"
          block
          :loading="uploading"
        >
          <v-icon class="mr-2">mdi-cloud-upload</v-icon>
          {{ uploading ? "Uploading..." : "Upload File" }}
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import axios from "axios";
import { useOrganizationStore } from "@/stores/organization";

// PROPS
 

const emit = defineEmits(["upload-complete"]);

// STORE
const orgStore = useOrganizationStore();
const orgName = computed(
  () => orgStore.currentOrganization?.name || "Organization"
);

// ENV
const apiUrl = import.meta.env.VITE_API_URL;

// STATE
const file = ref(null); // ✅ SINGLE FILE FIX
const uploading = ref(false);
const uploadProgress = ref(0);
const isUploadSuccessful = ref(false);
const error = ref(null);

// CONSTANTS
const maxSizeMB = 20;
const maxSizeBytes = maxSizeMB * 1024 * 1024;

// COMPUTED
const isFileValid = computed(() => {
  if (!file.value) return false;

  const isPDF =
    file.value.type === "application/pdf" ||
    file.value.name?.toLowerCase().endsWith(".pdf");

  const isValidSize = file.value.size <= maxSizeBytes;

  return isPDF && isValidSize;
});

// RULES
const fileRules = [
  (v) => {
    if (!v) return "Please upload a PDF file.";

    const isPDF =
      v.type === "application/pdf" ||
      v.name?.toLowerCase().endsWith(".pdf");

    if (!isPDF) return "File must be a PDF (.pdf).";

    if (v.size > maxSizeBytes) {
      return `File must be under ${maxSizeMB} MB.`;
    }

    return true;
  },
];

// RESET STATE ON FILE CHANGE
watch(file, () => {
  error.value = null;
  isUploadSuccessful.value = false;
});

  const organizationId = orgStore.currentOrganization?.id;
// UPLOAD
const uploadFile = async () => {
  if (!isFileValid.value) {
    error.value = "Please select a valid PDF file.";
    return;
  }

  if (!organizationId) {
    error.value = "Organization ID is missing.";
    return;
  }

  uploading.value = true;
  uploadProgress.value = 0;
  error.value = null;

  const formData = new FormData();
  formData.append("file", file.value);

  try {
    const response = await axios.post(
      `${apiUrl}/api/auth/uploads`,
      formData,
      {
        params: { orgId: organizationId },
        onUploadProgress: (ev) => {
          if (ev.lengthComputable) {
            uploadProgress.value = Math.round(
              (ev.loaded / ev.total) * 100
            );
          }
        },
      }
    );

    if (response.status === 200) {
      isUploadSuccessful.value = true;
      file.value = null;

      emit("upload-complete", response.data);

      setTimeout(() => window.location.reload(), 1000);
    }
  } catch (err) {
    console.error("Upload failed:", err);
    error.value =
      err.response?.data?.message ||
      "Failed to upload the PDF. Please try again.";
    uploadProgress.value = 0;
  } finally {
    uploading.value = false;
  }
};
</script>