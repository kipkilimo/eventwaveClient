<template>
  <div
    class="logo"
    style="
      cursor:pointer;
      display:flex;
      justify-content:center;
      align-items:center;
      width:100%;
    "
  >
    <v-img
      :src="logoImage"
      alt="Eventwave Logo"
      class="logo-image"
      :width="logoWidth"
      :height="logoHeight"
      contain
      transition="scale-transition"
    />
  </div>
</template>


<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import logoImage from '@/assets/images/logos/eventwave.png';

// Responsive logo sizing
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

const logoWidth = computed(() => isMobile.value ? '6rem' : '10.5rem');
const logoHeight = computed(() => isMobile.value ? '3rem' : '4.5rem');

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

