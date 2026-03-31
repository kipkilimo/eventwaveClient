<template>
  <v-card color="#f4f6f7"
    fluid
    v-if="resourceStore.resource.content"
    :style="{  
      position: 'relative',
      paddingBottom: '20px'
    }"
  >
    <!-- Inner carousel wrapper -->
    <div
      class="carousel-wrapper"
      ref="carouselWrapper"
      :class="{ fullscreen: isFullScreen }"
    >
      <!-- Inner card with audio player -->
      <v-card
        color="transparent"
        flat
        style="border-radius:2px 2px 0px 0px;"
        class="carousel-slide"
        :class="{ 'fullscreen-slide': isFullScreen }"
        :style="{
          backgroundImage: `url(${podcastBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          borderRadius:'2px 2px 0px 0px !important'
        }"
      >
        <vuetify-audio
          :file="currentSlide"
          color="#16539c"
          autoPlay
          :ended="audioFinish"
          class="audio-player"
        ></vuetify-audio>
      </v-card>
    </div>

    <!-- Silvery Bottom Strip on the outer card -->
    <div
      :style="{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '100%',
        height: '5px',
        backgroundColor: 'silver',
        borderRadius: '0 0 1px 1px',
      }"
    ></div>

    <v-divider></v-divider>

    <v-card-actions>
      <v-row no-gutters align="center" justify="space-between" class="w-100">
        <v-col cols="5"></v-col>
        <v-col cols="5">
          <v-row no-gutters>
            <v-col cols="auto">
              <v-btn icon @click="skipPrev">
                <v-icon>mdi-skip-previous</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn icon @click="prev">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn icon @click="next">
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn icon @click="skipNext">
                <v-icon>mdi-skip-next</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="2">
          <v-row no-gutters>
            <v-col cols="auto">
              <v-btn disabled icon @click="fullScreen">
                <v-icon>mdi-fullscreen</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useResourceStore } from "../../../stores/resources"; // Replace with actual path
import VuetifyAudio from "vuetify3-audio-player";

const resourceStore = useResourceStore();
const urls = ref<string[]>(JSON.parse(resourceStore.resource.content));

const sortedUrls = ref<string[]>(
  urls.value.sort((a, b) => {
    const getPageNumber = (url: string) => {
      const match = url.match(/page-(\d+)\.jpg/);
      return match ? parseInt(match[1], 10) : 0;
    };
    return getPageNumber(a) - getPageNumber(b);
  })
);

const currentIndex = ref<number>(0);
const currentSlide = ref<string>(sortedUrls.value[0]);
const isFullScreen = ref<boolean>(false);
const carouselWrapper = ref<HTMLElement | null>(null);
const podcastBg = ref(
  "https://www.yourwealth.com/wp-content/uploads/2023/06/Podcast-Retire-Sooner-iStock.jpg"
);
const updateSlide = () => {
  currentSlide.value = sortedUrls.value[currentIndex.value];
};

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1;
  }
};

const audioFinish = () => {
  if (currentIndex.value < sortedUrls.value.length - 1) {
    currentIndex.value += 1;
  }
};
const next = () => {
  if (currentIndex.value < sortedUrls.value.length - 1) {
    currentIndex.value += 1;
  }
};

const skipPrev = () => {
  currentIndex.value = 0;
};

const skipNext = () => {
  currentIndex.value = sortedUrls.value.length - 1;
};

// Fullscreen functionality
const fullScreen = () => {
  if (carouselWrapper.value) {
    if (document.fullscreenElement) {
      document
        .exitFullscreen()
        .then(() => {
          isFullScreen.value = false;
          resetHeight(); // Reset height when exiting fullscreen
        })
        .catch((err) => {
          console.error("Failed to exit full screen mode:", err);
        });
    } else {
      carouselWrapper.value
        .requestFullscreen()
        .then(() => {
          isFullScreen.value = true;
        })
        .catch((err) => {
          console.error("Failed to enter full screen mode:", err);
        });
    }
  }
};

const resetHeight = () => {
  if (carouselWrapper.value) {
    carouselWrapper.value.style.height = "72vh"; // Reset to default height
  }
};

// Handle fullscreen change event
const handleFullscreenChange = () => {
  if (!document.fullscreenElement) {
    window.location.reload();
  }
};

const handleKeyboardNavigation = (event: KeyboardEvent) => {
  if (event.key === "ArrowLeft") {
    prev();
  } else if (event.key === "ArrowRight") {
    next();
  }
};
const handleClick = (event: MouseEvent) => {
  if (isFullScreen.value === true) {
    return;
  }
  if (carouselWrapper.value) {
    const { clientX } = event;
    const { offsetWidth } = carouselWrapper.value;

    // Calculate boundaries for the left 10% and right 10% of the width
    const leftBoundary = offsetWidth * 1;
    const rightBoundary = offsetWidth * 1;

    // Respond to clicks only if they are within the left 10% or right 10% of the width
    if (clientX <= leftBoundary) {
      prev();
    } else if (clientX >= rightBoundary) {
      next();
    }

    // No response if click is in between the left and right 10%
  }
};

watch(currentIndex, updateSlide);

onMounted(() => {
  updateSlide();
  window.addEventListener("keydown", handleKeyboardNavigation);
  document.addEventListener("fullscreenchange", handleFullscreenChange);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyboardNavigation);
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
});
</script>

<style scoped>
.carousel-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition:
    width 0.3s,
    height 0.3s; /* Smooth transition */
  height: 67vh; /* Default height */
}

.carousel-wrapper.fullscreen {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000; /* Ensure it’s on top */
  background: black; /* Optional: To prevent background Consultations */
}

.carousel-slide {
  flex: 1;
  text-align: center;
  overflow: hidden; /* Prevents overflow Consultations */
  height: 100%; /* Ensure it takes full height of the container */
}

.carousel-slide.fullscreen-slide {
  width: 100%;
  height: 100%;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.left-btn {
  left: 0;
}

.right-btn {
  right: 0;
}

.v-img {
  object-fit: contain; /* Ensures image fits within the container without distortion */
  width: 100%;
  height: 100%;
}
.carousel-background {
  background-image: url("your-image-url.jpg");
  background-size: cover;
  width: 100%;
  background-position: center;
}
</style>
<style>
.audio-player {
  position: absolute;
  bottom: 1%;
  left: 50%;
  opacity: 0.83;
  transform: translateX(-50%);
  width: 95%; /* Adjust width as needed */
}
</style>
