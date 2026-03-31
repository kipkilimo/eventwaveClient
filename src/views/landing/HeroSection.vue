<template>
  <section id="hero" class="hero-section">
    <v-container fluid class="pa-0">
      <v-row no-gutters align="center" class="min-height-100">
        <!-- LEFT CONTENT -->
        <v-col cols="12" md="6" class="hero-content pa-8 pa-md-12">
          <div class="hero-text">
            <v-chip
              color="primary"
              variant="outlined"
              class="mb-4"
              size="small"
            >
              🚀 MEAL-Driven Platform
            </v-chip>

            <h1 class="text-h3 text-md-h2 text-lg-h1 font-weight-black mb-4">
              Transform Events into
              <span class="primary--text">Actionable MEAL Insights</span>
            </h1>

            <p class="text-h6 text-md-h5 text-lg-h4 mb-6 hero-subtitle">
              The real-time MEAL engagement platform that transforms trainings,
              workshops, and community events into rich data-generating learning
              experiences.
            </p>

            <div class="d-flex flex-wrap gap-3">
              <v-btn
                color="primary"
                size="x-large"
                @click="scrollToSection('cta')"
              >
                <v-icon start>mdi-rocket</v-icon>
                Start Free Trial
              </v-btn>

              <v-btn
                variant="outlined"
                size="x-large"
                @click="scrollToSection('features')"
              >
                <v-icon start>mdi-play-circle</v-icon>
                See Platform Demo
              </v-btn>
            </div>
          </div>
        </v-col>

        <!-- RIGHT VISUAL -->
        <v-col cols="12" md="6" class="hero-visual">
          <div class="visual-container">
            <v-img
              :src="heroImage"
              height="600"
              cover
              class="hero-image"
              :class="{ 'mobile-image': isMobile }"
            >
              <!-- FLOATING CARDS - Each with independent random motion -->
              <div class="floating-elements">
                <div
                  v-for="(item, index) in floatingCards"
                  :key="index"
                  class="floating-card"
                  :style="getCardStyle(index)"
                  :class="`card-${index}`"
                >
                  <v-icon :color="item.color" size="24">{{ item.icon }}</v-icon>
                  <span class="card-text">{{ item.title }}</span>
                </div>
              </div>
            </v-img>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from "vue";

// Image import (adjust path as needed)
import heroImage from "@/assets/images/group-meeting-vector-hd-png-images-group-people-meeting-people-clipart-business-discussion_969863-32701.avif";

// 6 FLOATING FEATURES with enhanced MEAL-focused titles
const floatingCards = ref([
  { title: "MEAL Reports", icon: "mdi-chart-bar", color: "primary" },
  {
    title: "Community Engagement",
    icon: "mdi-account-group",
    color: "success",
  },
  {
    title: "Improved Accountability",
    icon: "mdi-file-document",
    color: "warning",
  },
  { title: "Real-time Polls", icon: "mdi-poll", color: "info" },
  {
    title: "Analytics Dashboard",
    icon: "mdi-monitor-dashboard",
    color: "secondary",
  },
  { title: "Exportable Reports", icon: "mdi-file-export", color: "accent" },
]);

// Responsive state
const isMobile = ref(false);

// Store animation keyframes for each card
const cardAnimations = reactive<
  Array<{ name: string; duration: number; delay: number }>
>([]);

// Generate unique random animation for each card
const generateRandomAnimation = (index: number) => {
  // Each card gets unique animation duration between 4-8 seconds for varied speeds
  const duration = 10.5 + Math.random() * 10.5; // 5-10 seconds
  const delay = Math.random() * 1; // 0-2 seconds delay

  // Create unique animation name per card
  const animationName = `floatRandom${index}`;

  // Generate random movement boundaries based on quadrant
  // Define quadrant boundaries (as percentages of container)
  const quadrants = [
    { xRange: [-3, 12], yRange: [-4, 8] }, // Top-left quadrant (card 0)
    { xRange: [-12, 3], yRange: [-4, 8] }, // Top-right quadrant (card 1)
    { xRange: [-3, 12], yRange: [-6, 12] }, // Middle-left (card 2)
    { xRange: [-12, 3], yRange: [-6, 12] }, // Middle-right (card 3)
    { xRange: [-4, 10], yRange: [-8, 4] }, // Bottom-left (card 4)
    { xRange: [-10, 4], yRange: [-8, 4] }, // Bottom-right (card 5)
  ];

  const quadrant = quadrants[index];

  // Generate 5-8 random keyframes for smooth, unpredictable movement
  const keyframeCount = 6 + Math.floor(Math.random() * 5); // 6-10 keyframes
  let keyframes = [];

  for (let i = 0; i <= keyframeCount; i++) {
    const percent = (i / keyframeCount) * 100;

    // Random X and Y offsets within quadrant boundaries
    const minX = quadrant.xRange[0];
    const maxX = quadrant.xRange[1];
    const minY = quadrant.yRange[0];
    const maxY = quadrant.yRange[1];

    // Add some randomness but ensure smooth transitions
    let xOffset = minX + Math.random() * (maxX - minX);
    let yOffset = minY + Math.random() * (maxY - minY);

    // Ensure first and last keyframes return to near-original position for smooth loop
    if (i === 0 || i === keyframeCount) {
      xOffset = 0;
      yOffset = 0;
    }

    // Occasionally add diagonal emphasis
    const useDiagonal = Math.random() > 0.6;

    keyframes.push({
      percent,
      x: xOffset,
      y: yOffset,
      diagonal: useDiagonal,
    });
  }

  // Build CSS keyframes string
  let keyframeString = `@keyframes ${animationName} {\n`;
  keyframes.forEach((kf) => {
    keyframeString += `  ${kf.percent}% {\n`;
    keyframeString += `    transform: translate(${kf.x}px, ${kf.y}px);\n`;
    keyframeString += `  }\n`;
  });
  keyframeString += `}\n`;

  // Inject keyframes into document
  if (!document.querySelector(`style[data-animation="${animationName}"]`)) {
    const style = document.createElement("style");
    style.setAttribute("data-animation", animationName);
    style.textContent = keyframeString;
    document.head.appendChild(style);
  }

  return { name: animationName, duration, delay };
};

// Get card style with unique animation
const getCardStyle = (index: number) => {
  // Predefined base positions (quadrant anchors)
  const basePositions = [
    { top: "5%", left: "3%" }, // Top-left
    { top: "8%", right: "3%" }, // Top-right
    { top: "32%", left: "2%" }, // Middle-left
    { top: "38%", right: "2%" }, // Middle-right
    { bottom: "12%", left: "4%" }, // Bottom-left
    { bottom: "10%", right: "4%" }, // Bottom-right
  ];

  // Get or create animation for this card
  if (!cardAnimations[index]) {
    cardAnimations[index] = generateRandomAnimation(index);
  }

  const anim = cardAnimations[index];

  // Tablet adjustments
  const isTablet = window.innerWidth <= 960 && window.innerWidth > 600;
  let adjustedPositions = { ...basePositions[index] };

  if (isTablet) {
    if (index === 0) adjustedPositions = { top: "4%", left: "2%" };
    if (index === 1) adjustedPositions = { top: "6%", right: "2%" };
    if (index === 2) adjustedPositions = { top: "30%", left: "2%" };
    if (index === 3) adjustedPositions = { top: "36%", right: "2%" };
    if (index === 4) adjustedPositions = { bottom: "14%", left: "3%" };
    if (index === 5) adjustedPositions = { bottom: "12%", right: "3%" };
  }

  return {
    position: "absolute",
    maxWidth: "200px",
    minWidth: "140px",
    width: "auto",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    padding: "10px 16px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.05)",
    fontWeight: "600",
    fontSize: "14px",
    zIndex: 10,
    cursor: "default",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    whiteSpace: "nowrap",
    letterSpacing: "0.3px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    animation: `${anim.name} ${anim.duration}s ease-in-out infinite`,
    animationDelay: `${anim.delay}s`,
    willChange: "transform",
    ...adjustedPositions,
  };
};

// Check if mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 600;
};

// Scroll to section
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

// Regenerate animations on window resize to maintain boundaries
const regenerateAnimations = () => {
  // Clear existing animations
  Object.keys(cardAnimations).forEach((key) => {
    delete cardAnimations[parseInt(key)];
  });

  // Remove existing style elements
  const existingStyles = document.querySelectorAll(
    'style[data-animation^="floatRandom"]',
  );
  existingStyles.forEach((style) => style.remove());

  // Force re-render by triggering reactive update
  floatingCards.value = [...floatingCards.value];
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
  window.addEventListener("resize", regenerateAnimations);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
  window.removeEventListener("resize", regenerateAnimations);

  // Clean up generated styles
  const existingStyles = document.querySelectorAll(
    'style[data-animation^="floatRandom"]',
  );
  existingStyles.forEach((style) => style.remove());
});
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  overflow-x: hidden;
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.min-height-100 {
  min-height: 100vh;
}

.hero-content {
  display: flex;
  align-items: center;
  z-index: 5;
}

.hero-text {
  max-width: 600px;
  margin: 0 auto;
}

.primary--text {
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.hero-subtitle {
  color: #1e293b;
  line-height: 1.4;
  font-weight: 400;
  opacity: 0.85;
}

.gap-3 {
  gap: 1rem;
}

.hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visual-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.hero-image {
  position: relative;
  border-radius: 28px;
  overflow: hidden !important;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
  transition: transform 0.4s ease;
  max-width: 100%;
}

.hero-image:hover {
  transform: scale(1.01);
}

.floating-elements {
  position: absolute;
  inset: 0;
  overflow: hidden !important;
  pointer-events: none;
  border-radius: inherit;
}

.floating-card {
  pointer-events: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  line-height: 1.2;
  transform-origin: center;
}

.floating-card:hover {
  transform: translateY(-4px) scale(1.03) !important;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 1);
  border-color: rgba(25, 118, 210, 0.3);
  transition: all 0.2s ease;
  z-index: 20;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .hero-section {
    padding: 2rem 0;
  }

  .hero-image {
    border-radius: 20px;
    height: 500px !important;
  }

  .floating-card {
    padding: 8px 12px;
    min-width: 120px;
  }

  .card-text {
    font-size: 12px;
  }

  .floating-card .v-icon {
    font-size: 20px !important;
  }
}

@media (max-width: 600px) {
  .hero-image {
    height: 400px !important;
    margin-top: 2rem;
  }

  .floating-card {
    display: none;
  }

  .hero-section {
    min-height: auto;
    padding: 1rem 0 3rem 0;
  }

  .min-height-100 {
    min-height: auto;
  }

  .hero-content {
    text-align: center;
    padding: 2rem 1rem !important;
  }

  .hero-text {
    max-width: 100%;
  }

  .d-flex.flex-wrap {
    justify-content: center;
  }
}

@media (min-width: 601px) and (max-width: 960px) {
  .floating-card {
    min-width: 110px !important;
    padding: 6px 12px !important;
  }

  .card-text {
    font-size: 11px !important;
  }
}

@media (min-width: 1920px) {
  .hero-image {
    max-width: 90%;
    margin: 0 auto;
  }

  .floating-card {
    max-width: 240px;
    padding: 12px 20px;
    font-size: 16px;
  }
}

body {
  overflow-x: hidden;
}

.v-btn {
  transition: all 0.3s ease;
}

.v-btn:hover {
  transform: translateY(-2px);
}

.v-chip {
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style>
