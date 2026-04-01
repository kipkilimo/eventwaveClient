<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Logo from "@/layouts/full/logo/LogoDark.vue";
import AuthRegister from "../authForms/AuthRegister.vue";

const promoImages = ref([
  "https://rock-the-prototype.com/wp-content/uploads/2023/10/Vuetify-UI-Framework-fuer-Vue.jsNuxt.jpg",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop"
]);

const currentImageIndex = ref(0);
let intervalId: ReturnType<typeof setInterval> | null = null;

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % promoImages.value.length;
};

onMounted(() => {
  intervalId = setInterval(nextImage, 13500); // 10.5 seconds for more relaxed pacing
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<template>
  <v-row class="h-screen" no-gutters>
    <v-col cols="12">
      <v-container
        elevation="10"
        width="100%"
        class="rounded-lg overflow-hidden pa-2"
      >
        <transition name="fade" mode="out-in">
          <v-img
            :key="promoImages[currentImageIndex]"
            :src="promoImages[currentImageIndex]"
            cover
            class="promo-image mt-10 ml-2 mr-2"
          >
            <!-- Optional subtle overlay for better text contrast if content is added -->
            <div class="overlay"></div>
          </v-img>
        </transition>
      </v-container>
    </v-col>
  </v-row>
</template>

<style lang="scss" scoped>
.promo-image {
  height: 81vh;
  border-radius: 12px; // small rounded corners
  transition: transform 0.3s ease;
  position: relative;
  
  // Optional: slight hover effect for desktop
  &:hover {
    transform: scale(1.01);
  }
}

// Subtle overlay for better readability
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: inherit;
  pointer-events: none; // Allows clicking through to the image
}

// Gentle crossfade transition - no zoom, just smooth opacity change
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

// Optional: Add a subtle scale effect only on entry for a softer feel
.fade-enter-active {
  transition: opacity 1.2s ease-in-out;
}

.registerBox {
  max-width: 475px;
  margin: 0 auto;
}

.bg-black-opacity {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>