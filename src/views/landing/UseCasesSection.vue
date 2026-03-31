<template>
  <section id="use-cases" class="use-cases-section py-12">
    <v-container>
      <div class="text-center mb-12">
        <v-chip color="secondary" variant="tonal" class="mb-4" size="large">
          🎯 NGO & Government Priorities
        </v-chip>

        <h2 class="text-h3 text-md-h2 font-weight-black mb-4">
          Built for <span class="primary--text">Development Impact</span>
        </h2>

        <p class="text-h6 text-grey max-width-600 mx-auto">
          Directly match donor and NGO priorities with MEAL-ready engagement
          tools.
        </p>
      </div>

      <v-row>
        <v-col
          v-for="useCase in useCases"
          :key="useCase.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            class="use-case-card pa-6 h-100"
            elevation="1"
            rounded="xl"
            :class="`use-case-${useCase.id}`"
          >
            <v-avatar
              size="80"
              :color="useCase.color"
              variant="tonal"
              class="mb-4"
            >
              <v-icon size="40" :color="useCase.color">{{
                useCase.icon
              }}</v-icon>
            </v-avatar>

            <h3 class="text-h5 font-weight-bold mb-3">{{ useCase.title }}</h3>

            <p class="text-body-1 mb-4">{{ useCase.description }}</p>

            <div class="meal-benefits mb-4">
              <div class="d-flex align-center mb-2">
                <v-icon small color="primary" class="mr-2"
                  >mdi-chart-timeline</v-icon
                >
                <span class="text-caption font-weight-bold"
                  >MEAL Benefits:</span
                >
              </div>
              <v-chip
                v-for="benefit in useCase.mealBenefits"
                :key="benefit"
                variant="outlined"
                size="small"
                class="ma-1"
                color="primary"
              >
                {{ benefit }}
              </v-chip>
            </div>

            <v-btn :color="useCase.color" variant="text" class="mt-2">
              Explore Tools
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const useCases = [
  {
    id: "training",
    icon: "mdi-school",
    title: "Training & Capacity Development",
    description:
      "Transform learning sessions into measurable outcomes with real-time knowledge assessment.",
    color: "primary",
    mealBenefits: [
      "Pre/post knowledge measurement",
      "Learning outcome evaluation",
      "Trainer performance insights",
      "Session highlights for reports",
    ],
  },
  {
    id: "community",
    icon: "mdi-account-group",
    title: "Community Consultations",
    description:
      "Engage communities with real-time feedback and capture evidence for policy briefs.",
    color: "success",
    mealBenefits: [
      "Anonymous Q&A channels",
      "Community priority polling",
      "Real-time concern capture",
      "Automated policy summaries",
    ],
  },
  {
    id: "accountability",
    icon: "mdi-shield-check",
    title: "Accountability & Safeguarding",
    description:
      "Ensure transparent feedback loops and maintain audit-ready engagement records.",
    color: "warning",
    mealBenefits: [
      "Anonymous reporting",
      "Sentiment analysis",
      "Date-stamped audit logs",
      "Safeguarding compliance",
    ],
  },
];
</script>

<style scoped>
.use-cases-section {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.max-width-600 {
  max-width: 600px;
}

.h-100 {
  height: 100%;
}

.use-case-card {
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.use-case-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
}

.use-case-training:hover {
  border-color: #3b82f6;
}

.use-case-community:hover {
  border-color: #10b981;
}

.use-case-accountability:hover {
  border-color: #f59e0b;
}

.meal-benefits {
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
}
</style>
