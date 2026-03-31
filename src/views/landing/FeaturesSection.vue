<template>
  <section ref="featuresRef" id="features" class="features-section py-12">
    <v-container>
      <div class="text-center mb-12">
        <v-chip color="success" variant="tonal" class="mb-4" size="large">
          ✨ Complete Engagement Stack
        </v-chip>

        <h2 class="text-h3 text-md-h2 font-weight-black mb-4">
          MEAL-Ready <span class="primary--text">Engagement Tools</span>
        </h2>

        <p class="text-h6 text-grey max-width-600 mx-auto">
          Don't pitch features. Pitch capabilities and value for MEAL
          frameworks.
        </p>
      </div>

      <v-row class="mb-8">
        <v-col
          v-for="feature in features"
          :key="feature.title"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            class="feature-card pa-6 h-100"
            elevation="2"
            rounded="xl"
            :class="{ 'feature-card-highlight': feature.highlight }"
          >
            <div class="feature-icon mb-4">
              <v-avatar
                size="64"
                :color="feature.color"
                variant="tonal"
                rounded="lg"
              >
                <v-icon size="32" :color="feature.color">{{
                  feature.icon
                }}</v-icon>
              </v-avatar>
            </div>

            <h3 class="text-h5 font-weight-bold mb-3">{{ feature.title }}</h3>

            <p class="text-body-1 text-grey mb-4">{{ feature.description }}</p>

            <div class="meal-value mb-4">
              <div class="d-flex align-center mb-2">
                <v-icon small color="success" class="mr-2"
                  >mdi-chart-line</v-icon
                >
                <span class="text-caption font-weight-bold">MEAL Value:</span>
              </div>
              <p class="text-body-2 mb-0">{{ feature.mealValue }}</p>
            </div>

            <v-btn
              variant="text"
              color="primary"
              class="mt-2"
              @click="emit('scroll-to', 'demo')"
            >
              See in Action
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <!-- MEAL Data Output -->
      <v-card class="pa-6 mb-8" color="grey-lighten-4" rounded="xl">
        <v-row align="center">
          <v-col cols="12" md="6">
            <div class="highlight-content">
              <v-chip color="primary" variant="tonal" class="mb-4" size="small">
                📄 MEAL-Ready Reports
              </v-chip>

              <h3 class="text-h4 font-weight-bold mb-4">
                Auto-Generated MEAL Reports
              </h3>

              <p class="text-body-1 mb-4">
                After every event, automatically receive donor-ready reports
                including:
              </p>

              <v-list class="transparent">
                <v-list-item
                  v-for="item in mealReportItems"
                  :key="item"
                  class="px-0"
                >
                  <template v-slot:prepend>
                    <v-avatar size="32" color="primary" variant="tonal" rounded>
                      <v-icon color="primary" size="18">mdi-check</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-1">{{
                    item
                  }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="highlight-visual rounded-xl" elevation="2">
              <v-img
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                height="300"
                cover
                class="rounded-xl"
              ></v-img>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "scroll-to", sectionId: string): void;
}>();

const features = [
  {
    icon: "mdi-poll",
    title: "Live Polling & Tests",
    description:
      "Real-time knowledge testing and engagement measurement during events.",
    color: "primary",
    mealValue:
      "Measures learning outcomes, identifies knowledge gaps, provides quantitative engagement data for MEAL indicators.",
    highlight: true,
  },
  {
    icon: "mdi-chat",
    title: "Real-time Chat & Q&A",
    description:
      "Structured conversations with moderation and upvoting capabilities.",
    color: "success",
    mealValue:
      "Captures qualitative insights, identifies community priorities, provides traceable feedback loops.",
    highlight: false,
  },
  {
    icon: "mdi-form-select",
    title: "Feedback Forms",
    description:
      "Instant feedback collection with sentiment analysis and categorization.",
    color: "warning",
    mealValue:
      "Generates satisfaction metrics, identifies improvement areas, creates accountability evidence.",
    highlight: false,
  },
  {
    icon: "mdi-chart-timeline",
    title: "Analytics Dashboard",
    description: "Comprehensive MEAL metrics and engagement analytics.",
    color: "info",
    mealValue:
      "Provides evidence for donor reports, tracks KPIs, visualizes engagement patterns.",
    highlight: false,
  },
  {
    icon: "mdi-file-export",
    title: "Exportable Reports",
    description:
      "Donor-ready reports in multiple formats with customizable templates.",
    color: "purple",
    mealValue:
      "Reduces reporting workload, ensures compliance, standardizes MEAL documentation.",
    highlight: false,
  },
  {
    icon: "mdi-account-supervisor",
    title: "Participant Management",
    description:
      "Track attendance, engagement levels, and participation patterns.",
    color: "teal",
    mealValue:
      "Provides attendance evidence, identifies active participants, supports targeting analysis.",
    highlight: false,
  },
];

const mealReportItems = [
  "Participation statistics",
  "Engagement metrics",
  "Learning outcome scores",
  "Sentiment analysis map",
  "Key questions asked",
  "Feedback clusters",
  "Exportable as PDF/Excel/Word",
];
</script>

<style scoped>
.features-section {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.max-width-600 {
  max-width: 600px;
}

.h-100 {
  height: 100%;
}

.feature-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-color: #6366f1;
}

.feature-card-highlight {
  border: 2px solid #6366f1;
  background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
}

.meal-value {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #10b981;
}

.transparent {
  background: transparent !important;
}
</style>
