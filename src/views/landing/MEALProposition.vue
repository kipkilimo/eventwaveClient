<template>
  <section id="meal-proposition" class="meal-proposition-section py-12">
    <v-container>
      <div class="text-center mb-12">
        <v-chip color="primary" variant="tonal" class="mb-4" size="large">
          📊 MEAL Intelligence Layer
        </v-chip>

        <h2 class="text-h3 text-md-h2 font-weight-black mb-4">
          The <span class="primary--text">MEAL Layer</span> That Transforms
          Events
        </h2>

        <p class="text-h6 text-grey max-width-800 mx-auto">
          EventWave doesn't change how you work—it strengthens your existing
          MEAL frameworks by adding real-time engagement intelligence and
          automated data capture.
        </p>
      </div>

      <v-row class="mb-8">
        <v-col cols="12" md="6">
          <v-card class="h-100 pa-6" elevation="2" rounded="xl">
            <h3 class="text-h5 font-weight-bold mb-4 primary--text">
              Standard Event Activities
            </h3>
            <v-list>
              <v-list-item
                v-for="activity in standardActivities"
                :key="activity"
                class="px-0"
              >
                <v-divider color="#d0d0d0" width="50%" class="mb-2" />
                <template v-slot:prepend>
                  <v-icon color="success" class="mr-4">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-1">{{
                  activity
                }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card
            class="h-100 pa-6"
            elevation="0"
            rounded="xl"
            style="
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
              position: relative;
              overflow: hidden;
              transition:
                transform 0.4s ease,
                box-shadow 0.4s ease;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
              backdrop-filter: blur(10px);
            "
            @mouseover="
              (e) =>
                (e.currentTarget.style.transform =
                  'translateY(-8px) scale(1.02)')
            "
            @mouseleave="
              (e) =>
                (e.currentTarget.style.transform = 'translateY(0) scale(1)')
            "
          >
            <!-- Animated glow background -->
            <div
              class="glow-background"
              style="
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(
                  circle,
                  rgba(255, 255, 255, 0.15),
                  transparent 60%
                );
              "
            ></div>

            <!-- Content -->
            <div style="position: relative; z-index: 2">
              <h3
                style="
                  font-size: 1.4rem;
                  font-weight: 700;
                  margin-bottom: 16px;
                  letter-spacing: 0.5px;
                "
              >
                EventWave MEAL Layer
              </h3>

              <v-list style="background: transparent; padding: 0">
                <v-list-item
                  v-for="(layer, index) in mealLayers"
                  :key="layer.text"
                  class="meal-layer-item"
                  :style="`animation-delay: ${index * 0.1}s`"
                  @mouseover="
                    (e) => (e.currentTarget.style.transform = 'translateX(6px)')
                  "
                  @mouseleave="
                    (e) => (e.currentTarget.style.transform = 'translateX(0)')
                  "
                >
                  <v-divider color="#7070e4" width="50%" class="mb-2" />
                  <template v-slot:prepend>
                    <v-icon
                      class="meal-layer-icon"
                      style="margin-right: 12px; color: #ffffff"
                      @mouseover="
                        (e) =>
                          (e.currentTarget.style.transform =
                            'scale(1.2) rotate(8deg)')
                      "
                      @mouseleave="
                        (e) =>
                          (e.currentTarget.style.transform =
                            'scale(1) rotate(0deg)')
                      "
                    >
                      {{ layer.icon }}
                    </v-icon>
                  </template>

                  <v-list-item-title
                    class="meal-layer-title"
                    style="font-size: 1rem; opacity: 0.95"
                  >
                    {{ layer.text }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <div class="text-center mt-8">
        <p class="text-body-1 text-grey mb-4">
          This makes EventWave practical, familiar, and immediately valuable to
          MEAL managers and program directors.
        </p>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const standardActivities = [
  "Training sessions",
  "Group discussions",
  "Presentations",
  "Participant attendance",
  "Feedback collection",
  "Post-event reporting",
];

const mealLayers = [
  { icon: "mdi-poll", text: "Real-time polls & Tests" },
  { icon: "mdi-chat", text: "Live chat + moderated Q&A" },
  { icon: "mdi-presentation", text: "Integrated media + guided prompts" },
  { icon: "mdi-account-check", text: "Automated check-ins" },
  { icon: "mdi-form-select", text: "Instant feedback forms" },
  { icon: "mdi-file-chart", text: "Auto-generated MEAL reports" },
];
</script>

<style scoped>
.meal-proposition-section {
  background: white;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.max-width-800 {
  max-width: 800px;
}

.h-100 {
  height: 100%;
}

.transparent {
  background: transparent !important;
}

/* Keyframes animations */
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotateGlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Apply animations to elements */
.meal-layer-item {
  padding: 10px 0;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  animation: fadeSlideIn 0.5s ease forwards;
  opacity: 0;
}

.meal-layer-icon {
  transition: transform 0.3s ease;
}

.meal-layer-title {
  transition: opacity 0.3s ease;
}

.glow-background {
  animation: rotateGlow 10s linear infinite;
}
</style>
