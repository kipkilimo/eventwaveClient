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
      <v-icon size="42" class="mb-2">mdi-image-multiple-outline</v-icon>
      <div class="text-subtitle-2 font-weight-medium">Drag & drop images here</div>
      <div class="text-caption text-grey">or click to browse</div>

      <v-file-input
        ref="fileInput"
        v-model="files"
        class="d-none"
        accept=".jpg, .jpeg, .png, .gif, .svg, .avif, .webp"
        multiple
        show-size
        @change="validateFiles"
      />
    </div>

    <!-- PREVIEW GRID -->
    <v-row v-if="files.length" class="mt-4" dense>
      <v-col v-for="(img, index) in files" :key="index" cols="6" sm="4" md="3">
        <v-card rounded="lg" elevation="2" class="preview-card">
          <v-img :src="getImageUrl(img)" height="110px" cover />

          <v-card-actions class="py-1 px-2 justify-space-between">
            <div class="text-caption">
              {{ img.name.substring(0, 12) }}...
            </div>

            <v-btn
              icon="mdi-close"
              size="small"
              variant="text"
              color="red"
              @click="removeFile(index)"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- ERROR -->
    <v-alert v-if="error" type="error" class="mt-4" density="comfortable">
      {{ error }}
    </v-alert>

    <!-- SUCCESS -->
    <v-alert
      v-if="isUploadSuccessful"
      type="success"
      class="mt-4"
      border="start"
      density="comfortable"
    >
      Images uploaded successfully!
    </v-alert>

    <!-- UPLOAD BUTTON -->
    <v-btn
      class="mt-4"
      color="primary"
      block
      :disabled="files.length === 0 || uploading"
      @click="uploadFiles"
    >
      <v-icon class="mr-2">mdi-cloud-upload</v-icon>
      {{ uploading ? "Uploading..." : "Upload Images" }}
    </v-btn>

    <!-- PROGRESS BAR -->
    <div v-if="uploading" class="mt-4">
      <div class="text-caption mb-1 text-grey">
        {{ uploadProgress }}% complete
      </div>
      <v-progress-linear
        :value="uploadProgress"
        height="8"
        rounded
        striped
        color="green-darken-2"
      />
    </div>

  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import { useResourceStore } from "../../../stores/resources";

const resourceStore = useResourceStore();
const apiUrl = import.meta.env.VITE_BASE_URL;

const fileInput = ref(null);
const files = ref([]);
const uploading = ref(false);
const uploadProgress = ref(0);
const isUploadSuccessful = ref(false);
const error = ref(null);

const maxItems = 40;
const maxTotalSizeMB = 80;

const totalFileSizeMB = computed(() =>
  files.value.reduce((total, file) => total + file.size / 1024 / 1024, 0).toFixed(2)
);

const fileRules = computed(() => [
  () => files.value.length <= maxItems || `You can upload max ${maxItems} files.`,
  () =>
    totalFileSizeMB.value <= maxTotalSizeMB ||
    `Total size must be under ${maxTotalSizeMB} MB.`,
]);

/* ------------------------
    IMAGE HANDLING
-------------------------*/
const openPicker = () => fileInput.value?.click();

const handleDrop = (e) => {
  const droppedFiles = [...e.dataTransfer.files];
  files.value.push(...droppedFiles);
  validateFiles();
};

const getImageUrl = (file) => URL.createObjectURL(file);

const removeFile = (index) => {
  files.value.splice(index, 1);
};

/* ------------------------
    VALIDATION
-------------------------*/
const validateFiles = () => {
  error.value = null;

  if (files.value.length > maxItems) {
    error.value = `You can upload a maximum of ${maxItems} images.`;
    files.value = [];
    return;
  }

  if (totalFileSizeMB.value > maxTotalSizeMB) {
    error.value = `Total file size must not exceed ${maxTotalSizeMB} MB.`;
    files.value = [];
  }
};

/* ------------------------
    UPLOAD
-------------------------*/
const uploadFiles = async () => {
  uploading.value = true;
  uploadProgress.value = 0;

  if (files.value.length === 0) {
    error.value = "Please select images to upload.";
    uploading.value = false;
    return;
  }

  const resourceId = resourceStore.resource.id;
  const resourceType = resourceStore.resource.contentType;
  const fileCreationStage = "CONTENT";

  const formData = new FormData();
  files.value.forEach((file) => formData.append("files", file));

  const url = `${apiUrl}/resources/uploads?resourceId=${encodeURIComponent(
    resourceId
  )}&resourceType=${encodeURIComponent(resourceType)}&fileCreationStage=${encodeURIComponent(
    fileCreationStage
  )}`;

  try {
    const response = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (pe) => {
        if (pe.lengthComputable) {
          uploadProgress.value = Math.round((pe.loaded * 100) / pe.total);
        }
      },
    });

    if (response.status === 200) {
      isUploadSuccessful.value = true;

      setTimeout(() => {
        window.location.reload();
      }, 900);
    }
  } catch (err) {
    console.error("Upload failed:", err);
    error.value = "Failed to upload. Please try again.";
  } finally {
    uploading.value = false;
  }
};
</script>

<style scoped>
.drop-zone {
  border: 2px dashed #9e9e9e;
  padding: 40px 20px;
  border-radius: 14px;
  text-align: center;
  cursor: pointer;
  transition: 0.25s ease;
}
.drop-zone:hover {
  background: #f1f8e9;
  border-color: #4caf50;
}
.preview-card {
  cursor: pointer;
  transition: 0.15s ease;
}
.preview-card:hover {
  transform: scale(1.03);
}
</style>
