<template>
  <section id="cta" class="cta-section py-12">
    <v-container>
      <v-card color="primary" class="pa-8 pa-md-12 rounded-xl" elevation="4">
        <v-row align="center" justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h2 class="text-h3 text-md-h2 font-weight-black white--text mb-4">
              Ready to Transform Your MEAL Framework?
            </h2>

            <p class="text-h5 white--text mb-6 opacity-80">
              Join development professionals who use EventWave to create
              smarter, more accountable, and data-driven events.
            </p>

            <div
              class="meal-value-proposition white--text pa-4 rounded-lg mb-6"
            >
              <p class="text-body-1 mb-2 font-weight-bold">
                EventWave helps organizations:
              </p>
              <div class="d-flex flex-wrap justify-center gap-2">
                <span class="text-caption">✓ Improve participation</span>
                <span class="text-caption">✓ Reduce reporting time</span>
                <span class="text-caption">✓ Ensure data traceability</span>
                <span class="text-caption">✓ Enhance accountability</span>
                <span class="text-caption">✓ Strengthen learning outcomes</span>
                <span class="text-caption">✓ Meet donor compliance</span>
              </div>
            </div>

           <div class="d-flex flex-wrap justify-center gap-3">
              <v-btn
                color="#1e3b91"
                size="x-large"
                class="mr-2"
                to="/login"
              >
                <v-icon start>mdi-rocket</v-icon>
                Start Free Trial
              </v-btn>

              <v-btn
                variant="outlined"
                size="x-large"
                color="#f1f1f1"
                @click="emit('open-demo')"
              >
                <v-icon start>mdi-play-circle</v-icon>
                See Platform Demo
              </v-btn>
            </div>

            <!-- <div class="d-flex flex-wrap justify-center gap-3 mb-1">
              <v-btn
                color="secondary"
                size="x-large"
                class="px-8 py-0"
                elevation="2"
                @click="emit('scroll-to', 'cta')"
              >
                <v-icon start>mdi-rocket</v-icon>
                Start Free Trial
              </v-btn>

              <v-btn
                variant="outlined"
                size="x-large"
                color="white"
                class="px-8 py-0"
                @click="emit('open-demo')"
              >
                <v-icon start>mdi-play-circle</v-icon>
                Request Platform Demo
              </v-btn>
            </div> -->

            <div class="cta-features mt-4">
              <v-chip
                v-for="feature in ctaFeatures"
                :key="feature"
                variant="outlined"
                color="white"
                size="small"
                class="ma-1"
              >
                <v-icon start size="16">mdi-check</v-icon>
                {{ feature }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "scroll-to", sectionId: string): void;
  (e: "open-demo"): void;
}>();

const ctaFeatures = [
  "14-day free trial",
  "No credit card required",
  "GDPR compliant",
  "24/7 MEAL support",
  "Donor-compliant reports",
];
</script>

<style scoped>
.cta-section {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
}

.meal-value-proposition {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.opacity-80 {
  opacity: 0.8;
}

.cta-features {
  margin-top: 16px;
}
</style>
