<template>
  <div v-if="resourceStore.resource.content" color="transparent" class="pa-2">
    <div class="pdf-container" ref="pdfContainer"></div>
    <v-divider />
    <rate-fav-share-resource />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import PDFObject from "pdfobject";
import { useResourceStore } from "../../../stores/resources";

const resourceStore = useResourceStore();
const pdfContainer = ref(null);

const extractValidUrl = (rawContent) => {
  try {
    // Check if content is an array-like string
    const parsedContent = JSON.parse(rawContent);
    if (Array.isArray(parsedContent) && parsedContent.length > 0) {
      return parsedContent[0]; // Extract the first URL from the array
    }
  } catch (error) {
    // If parsing fails, assume it's already a valid URL
    return rawContent;
  }
  return null;
};

const embedPDF = (pdfUrl) => {
  if (pdfUrl && pdfContainer.value) {
    PDFObject.embed(pdfUrl, pdfContainer.value, { height: "85vh" });
  }
};

watch(
  () => resourceStore.resource.content,
  (newUrl) => {
    const validUrl = extractValidUrl(newUrl);
    if (validUrl) {
      embedPDF(validUrl);
    }
  }
);

onMounted(() => {
  const validUrl = extractValidUrl(resourceStore.resource.content);
  if (validUrl) {
    embedPDF(validUrl);
  }
});
</script>


<style scoped>
.pdf-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 85vh;
}
</style>
