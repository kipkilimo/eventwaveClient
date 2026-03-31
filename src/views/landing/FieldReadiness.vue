<template>
  <section id="field" class="field-section py-12">
    <v-container>
      <div class="text-center mb-12">
        <v-chip color="warning" variant="tonal" class="mb-4" size="large">
          🌍 Field-Friendly Design
        </v-chip>

        <h2 class="text-h3 text-md-h2 font-weight-black mb-4">
          Built for <span class="primary--text">Real-World Settings</span>
        </h2>

        <p class="text-h6 text-grey max-width-600 mx-auto">
          Designed to work in the most challenging environments where
          development work happens.
        </p>
      </div>

      <v-row>
        <v-col
          v-for="feature in fieldFeatures"
          :key="feature.title"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card class="text-center pa-6 h-100" elevation="1" rounded="xl">
            <v-avatar
              size="64"
              :color="feature.color"
              variant="tonal"
              class="mb-4"
            >
              <v-icon size="32" :color="feature.color">{{
                feature.icon
              }}</v-icon>
            </v-avatar>

            <h4 class="text-h6 font-weight-bold mb-2">{{ feature.title }}</h4>
            <p class="text-body-2 text-grey">{{ feature.description }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const fieldFeatures = [
  {
    icon: "mdi-cellphone",
    title: "Mobile-First",
    description: "Works on any smartphone, no app download required",
    color: "primary",
  },
  {
    icon: "mdi-wifi-off",
    title: "Offline-Ready",
    description: "Functions in low-connectivity areas",
    color: "success",
  },
  {
    icon: "mdi-speedometer-slow",
    title: "Low Data Usage",
    description: "Optimized for limited bandwidth",
    color: "warning",
  },
  {
    icon: "mdi-account-group",
    title: "Easy Onboarding",
    description: "No technical training needed",
    color: "info",
  },
];
</script>

<style scoped>
.field-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.max-width-600 {
  max-width: 600px;
}

.h-100 {
  height: 100%;
}
</style>
