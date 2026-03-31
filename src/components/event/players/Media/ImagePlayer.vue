<template>
 <div>
    <!-- Button to trigger an action, e.g., showing images in a viewer -->
    <v-btn type="button" variant="outlined" class="mb-2" color="#9dc9dc" @click="show">
      Click on image to show
    </v-btn>

    <!-- Image cards -->
    <div class="images" v-viewer>
      <v-row>
        <v-col v-for="(src, index) in images" :key="index" cols="12" md="4" lg="3">
          <v-card class="mx-auto" max-width="344" @click="show">
            <v-img :src="src" aspect-ratio="1" class="white--text"></v-img>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Optional viewer component -->
    <viewer :images="images">
      <img v-for="src in images" :key="src" :src="src" />
    </viewer>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent } from "vue";
import { api as viewerApi } from "v-viewer";
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useResourceStore } from "../../../stores/resources"; // Replace with actual path

const resourceStore = useResourceStore();
const images = ref(JSON.parse(resourceStore.resource.content));

const show = async () => {
  // Use async function for potential errors
  try {
    await viewerApi({
      images: images.value,
    });
  } catch (error) {
    console.error("Error showing viewer:", error);
  }
};
</script>
