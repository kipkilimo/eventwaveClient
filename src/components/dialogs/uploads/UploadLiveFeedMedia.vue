<template>
  <v-card class="pa-4">
    <v-card-title class="text-h6 font-weight-bold">
      Upload Media for: {{ currentFeed?.title || "Live Feed" }}
    </v-card-title>

    <v-divider class="my-3" />

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-6">
      <v-progress-circular indeterminate size="45" />
    </div>

    <!-- ERROR -->
    <v-alert v-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>

    <!-- SINGLE FILE UPLOADER -->
    <div v-if="!loading" class="upload-container">
      <v-card variant="outlined" class="pa-4 mb-4">
        <v-card-title class="text-subtitle-1 font-weight-medium">
          Upload Media File
        </v-card-title>
        
        <v-card-text>
          <div class="mb-4">
            <p class="text-caption text-medium-emphasis mb-2">
              Supported formats:
            </p>
            <v-chip-group class="mt-1">
              <v-chip size="small" color="primary" variant="outlined">Image (jpg, png, gif, webp)</v-chip>
              <v-chip size="small" color="primary" variant="outlined">Video (mp4, webm, avi, mov)</v-chip>
              <v-chip size="small" color="primary" variant="outlined">Audio (mp3, wav, ogg)</v-chip>
              <v-chip size="small" color="primary" variant="outlined">PDF (pdf)</v-chip>
            </v-chip-group>
            <p class="text-caption text-medium-emphasis mt-3">
              Maximum file size: 50MB
            </p>
          </div>

          <!-- FILE INPUT -->
          <v-file-input
            v-model="selectedFile"
            :loading="uploading"
            :disabled="uploading"
            :accept="supportedFormats"
            label="Choose file"
            prepend-icon="mdi-paperclip"
            variant="outlined"
            clearable
            show-size
            single-line
            :error="!!fileError"
            :error-messages="fileError"
            @update:model-value="validateFile"
          >
            <template #selection="{ fileNames }">
              <template v-for="fileName in fileNames" :key="fileName">
                <v-chip class="me-2">
                  <v-icon start :icon="getFileIcon(fileName)"></v-icon>
                  {{ truncateFileName(fileName, 30) }}
                </v-chip>
              </template>
            </template>
          </v-file-input>

          <!-- PREVIEW SECTION -->
          <div v-if="previewUrl && selectedFile" class="mt-4">
            <v-card variant="outlined" class="pa-3">
              <v-card-title class="text-subtitle-2 font-weight-medium">
                Preview
              </v-card-title>
              
              <div class="preview-container">
                <!-- Image Preview -->
                <v-img
                  v-if="isImage"
                  :src="previewUrl"
                  :max-height="200"
                  cover
                  class="preview-image rounded"
                />

                <!-- Video Preview -->
                <video
                  v-else-if="isVideo"
                  :src="previewUrl"
                  controls
                  :height="200"
                  class="preview-video rounded"
                />

                <!-- Audio Preview -->
                <div v-else-if="isAudio" class="audio-preview pa-4">
                  <v-icon size="40" class="mb-2">mdi-music-note</v-icon>
                  <p class="text-caption mb-2">{{ selectedFile.name }}</p>
                  <audio :src="previewUrl" controls class="mt-2" />
                </div>

                <!-- PDF Preview -->
                <div v-else-if="isPDF" class="pdf-preview pa-4">
                  <v-icon size="40" class="mb-2">mdi-file-pdf-box</v-icon>
                  <p class="text-caption">{{ selectedFile.name }}</p>
                  <p class="text-caption text-medium-emphasis mt-1">
                    PDF files cannot be previewed in browser
                  </p>
                </div>
              </div>
            </v-card>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-btn
            :disabled="!selectedFile || !!fileError || uploading"
            :loading="uploading"
            color="primary"
            variant="flat"
            @click="uploadFile"
          >
            <v-icon start>mdi-upload</v-icon>
            Upload File
          </v-btn>
          
          <v-btn
            variant="text"
            color="grey"
            @click="clearFile"
          >
            Clear
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <v-divider class="my-4" />

    <v-card-actions>
      <v-btn variant="text" color="grey" @click="close">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useLiveFeedStore } from "@/stores/livefeed";
import type { UploadMediaPayload } from "@/types/media";

// Pinia Store
const liveFeedStore = useLiveFeedStore();

const dialog = computed({
  get: () => liveFeedStore.mediaDialog,
  set: (v) => (liveFeedStore.mediaDialog = v),
});

const currentFeed = computed(() => liveFeedStore.currentFeed);
const loading = computed(() => liveFeedStore.loading);
const error = computed(() => liveFeedStore.error);

// Reactive state
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const fileError = ref<string>("");
const uploading = ref(false);

// Supported formats
const supportedFormats = ".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.avi,.mov,.mp3,.wav,.ogg,.pdf";

// File type detection
const isImage = computed(() => {
  return selectedFile.value?.type.startsWith('image/') || 
         /\.(jpg|jpeg|png|gif|webp)$/i.test(selectedFile.value?.name || '');
});

const isVideo = computed(() => {
  return selectedFile.value?.type.startsWith('video/') || 
         /\.(mp4|webm|avi|mov)$/i.test(selectedFile.value?.name || '');
});

const isAudio = computed(() => {
  return selectedFile.value?.type.startsWith('audio/') || 
         /\.(mp3|wav|ogg)$/i.test(selectedFile.value?.name || '');
});

const isPDF = computed(() => {
  return selectedFile.value?.type === 'application/pdf' || 
         /\.pdf$/i.test(selectedFile.value?.name || '');
});

// Get file icon based on type
function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
    return 'mdi-image';
  } else if (['mp4', 'webm', 'avi', 'mov'].includes(ext || '')) {
    return 'mdi-video';
  } else if (['mp3', 'wav', 'ogg'].includes(ext || '')) {
    return 'mdi-music';
  } else if (ext === 'pdf') {
    return 'mdi-file-pdf';
  }
  return 'mdi-file';
}

// Truncate file name for display
function truncateFileName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name;
  const extension = name.split('.').pop();
  const nameWithoutExt = name.slice(0, name.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.slice(0, maxLength - extension!.length - 4);
  return `${truncatedName}... .${extension}`;
}

// Validate selected file
function validateFile(file: File | null) {
  fileError.value = "";
  
  if (!file) {
    previewUrl.value = null;
    return;
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  if (file.size > maxSize) {
    fileError.value = `File size exceeds 50MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`;
    selectedFile.value = null;
    previewUrl.value = null;
    return;
  }

  // Check file type
  const fileName = file.name.toLowerCase();
  const isValidType = 
    /\.(jpg|jpeg|png|gif|webp|mp4|webm|avi|mov|mp3|wav|ogg|pdf)$/i.test(fileName);

  if (!isValidType) {
    fileError.value = "Unsupported file format. Please select an image, video, audio, or PDF file.";
    selectedFile.value = null;
    previewUrl.value = null;
    return;
  }

  // Create preview URL
  if (isImage.value || isVideo.value || isAudio.value) {
    previewUrl.value = URL.createObjectURL(file);
  } else {
    previewUrl.value = null;
  }
}

// Clear file selection
function clearFile() {
  selectedFile.value = null;
  previewUrl.value = null;
  fileError.value = "";
}

// Upload file to server
async function uploadFile() {
  if (!selectedFile.value || fileError.value) return;

  uploading.value = true;
  fileError.value = "";

  try {
    // Determine media type
    let mediaType: string;
    if (isImage.value) mediaType = "image";
    else if (isVideo.value) mediaType = "video";
    else if (isAudio.value) mediaType = "audio";
    else if (isPDF.value) mediaType = "document";
    else {
      throw new Error("Unsupported file type");
    }

    // Create form data
    const formData = new FormData();
    formData.append("file", selectedFile.value);
    formData.append("type", mediaType);
    formData.append("feedId", currentFeed.value?.id || "");
    
    // Here you would call your API endpoint
    // Example:
    // const response = await uploadMedia(formData);
    
    // For now, simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update store with uploaded media
    const mediaPayload: UploadMediaPayload = {
      url: previewUrl.value || URL.createObjectURL(selectedFile.value),
      type: mediaType,
      name: selectedFile.value.name,
      size: selectedFile.value.size,
      timestamp: new Date().toISOString()
    };

    // Update the feed with new media
    if (currentFeed.value) {
      liveFeedStore.updateFeedMedia(currentFeed.value.id, mediaPayload);
    }

    // Show success message
    // You might want to use a snackbar/toast here
    console.log("File uploaded successfully:", mediaPayload);
    
    // Close dialog after successful upload
    close();
    
  } catch (err) {
    fileError.value = err instanceof Error ? err.message : "Failed to upload file";
    console.error("Upload error:", err);
  } finally {
    uploading.value = false;
  }
}

function close() {
  // Clean up object URLs
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  
  dialog.value = false;
  clearFile();
}

// Clean up on unmount
import { onBeforeUnmount } from "vue";
onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});
</script>

<style scoped>
.upload-container {
  max-width: 600px;
  margin: 0 auto;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.preview-image {
  object-fit: contain;
}

.preview-video {
  width: 100%;
  max-height: 300px;
  background-color: #000;
}

.audio-preview,
.pdf-preview {
  text-align: center;
  width: 100%;
}
</style>