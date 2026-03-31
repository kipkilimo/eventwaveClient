<template>
  <v-container>
    <v-file-input
      v-model="files"
      accept=".csv, .json, .xml, .parquet, .xlsx, .txt, .tsv, .sql"
      label="Upload Dataset Files"
      prepend-icon="mdi-file-table"
      :multiple="true"
      :counter="true"
      :rules="fileRules"
      :chips="true"
      @change="validateFiles"
      show-size
    ></v-file-input>

    <v-row justify="center" class="mt-4">
      <v-col cols="auto">
        <v-btn @click="uploadFiles" :disabled="files.length === 0 || uploading">
          <v-icon class="mr-2">mdi-cloud-upload</v-icon>Upload
        </v-btn>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" class="mt-4">
      {{ error }}
    </v-alert>

    <v-progress-linear
      v-if="uploading"
      :value="uploadProgress"
      height="6"
      color="green darken-2"
      class="mt-4"
    ></v-progress-linear>

    <div v-if="isUploadSuccessful" class="custom-alert">
      <v-alert
        :text="isUploadSuccessful"
        title="Files uploaded successfully!"
        type="success"
        class="custom-alert"
      ></v-alert>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import { useResourceStore } from "../../../stores/resources";
import { useRouter } from "vue-router";

const resourceStore = useResourceStore();
const apiUrl = import.meta.env.VITE_BASE_URL;

const router = useRouter();

const files = ref([]);
const uploading = ref(false);
const uploadProgress = ref(0);
const isUploadSuccessful = ref(false);
const error = ref(null);

const maxItems = 3;
const maxTotalSizeMB = 20;

const fileRules = computed(() => [
  () =>
    files.value.length <= maxItems || `You can upload up to ${maxItems} files.`,
  () =>
    totalFileSizeMB.value <= maxTotalSizeMB ||
    `Total file size must be under ${maxTotalSizeMB} MB.`,
]);

const totalFileSizeMB = computed(() =>
  files.value
    .reduce((total, file) => total + file.size / 1024 / 1024, 0)
    .toFixed(2)
);

const validateFiles = () => {
  error.value = null;

  if (files.value.length > maxItems) {
    error.value = `You can upload a maximum of ${maxItems} files.`;
    files.value = [];
  } else if (totalFileSizeMB.value > maxTotalSizeMB) {
    error.value = `Total file size must not exceed ${maxTotalSizeMB} MB.`;
    files.value = [];
  }
};

const uploadFiles = async () => {
  uploading.value = true;
  uploadProgress.value = 0;

  if (files.value.length === 0) {
    console.error("No files selected");
    error.value = "Please select files to upload.";
    uploading.value = false;
    return;
  }

  const resourceId = resourceStore.resource.id;
  const resourceType = resourceStore.resource.contentType;
  const fileCreationStage = "CONTENT";

  const formData = new FormData();
  files.value.forEach((file) => {
    formData.append("files", file);
  });

  const url = `${apiUrl}/resources/uploads?resourceId=${encodeURIComponent(
    resourceId
  )}&resourceType=${encodeURIComponent(
    resourceType
  )}&fileCreationStage=${encodeURIComponent(fileCreationStage)}`;

  try {
    const response = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          uploadProgress.value = percentCompleted;

          // Log progress for debugging
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      },
    });

    if (response.status === 200) {
      isUploadSuccessful.value = true;
      // Delay the reload to ensure progress is visible
      setTimeout(() => {
        window.location.reload();
      }, 1000); // 1-second delay
    }
  } catch (err) {
    console.error("Failed to upload files:", err);
    error.value = "Failed to upload files. Please try again.";
  } finally {
    uploading.value = false;
  }
};

</script>

<style scoped>
.custom-alert {
  background-color: #ffffff; /* Dark background */
  padding: 20px;
  border-radius: 5px;
}

.custom-alert * {
  color: white !important;
}
</style>


