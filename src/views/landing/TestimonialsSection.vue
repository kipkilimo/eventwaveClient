<template>
  <section id="testimonials" class="testimonials-section py-12">
    <v-container>
      <div class="text-center mb-12">
        <v-chip color="info" variant="tonal" class="mb-4" size="large">
          💬 Development Sector Proven
        </v-chip>

        <h2 class="text-h3 text-md-h2 font-weight-black mb-4">
          Trusted by <span class="primary--text">MEAL Professionals</span>
        </h2>

        <p class="text-h6 text-grey max-width-600 mx-auto">
          See how organizations are transforming their MEAL frameworks with
          EventWave.
        </p>
      </div>

      <v-row>
        <v-col
          v-for="testimonial in testimonials"
          :key="testimonial.name"
          cols="12"
          md="4"
        >
          <v-card
            class="testimonial-card pa-6 h-100"
            elevation="2"
            rounded="xl"
          >
            <div class="d-flex align-start mb-4">
              <v-avatar size="60" class="mr-4">
                <v-img :src="testimonial.avatar"></v-img>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">
                  {{ testimonial.name }}
                </div>
                <div class="text-body-2 text-grey">{{ testimonial.role }}</div>
                <div class="text-caption text-grey">
                  {{ testimonial.organization }}
                </div>
              </div>
            </div>

            <div class="rating mb-3">
              <v-icon
                v-for="n in 5"
                :key="n"
                size="20"
                :color="n <= testimonial.rating ? 'amber' : 'grey-lighten-1'"
              >
                mdi-star
              </v-icon>
            </div>

            <p class="text-body-1 font-italic testimonial-quote">
              "{{ testimonial.quote }}"
            </p>

            <v-divider class="my-4"></v-divider>

            <div class="testimonial-stats">
              <div
                class="stat"
                v-for="stat in testimonial.mealStats"
                :key="stat.label"
              >
                <div class="value text-h6 font-weight-bold primary--text">
                  {{ stat.value }}
                </div>
                <div class="label text-caption text-grey">{{ stat.label }}</div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const testimonials = [
  {
    name: "Dr. Achieng Odhiambo",
    role: "Health Program Coordinator",
    organization: "Busia County Community Health Alliance",
    avatar:
      "https://static.vecteezy.com/system/resources/thumbnails/006/390/348/small/simple-flat-isolated-people-icon-free-vector.jpg",
    quote:
      "With EventWave, our community health campaigns are now data-driven. Immunization tracking improved from 48% to 87% coverage across Busia sub-counties.",
    rating: 5,
    mealStats: [
      { value: "87%", label: "Immunization Coverage" },
      { value: "4x", label: "Faster Reporting" },
      { value: "96%", label: "Community Satisfaction" },
    ],
  },
  {
    name: "Owino Barasa",
    role: "Smart Agriculture Officer",
    organization: "Luyha Farmers Cooperative",
    avatar:
      "https://static.vecteezy.com/system/resources/thumbnails/006/390/348/small/simple-flat-isolated-people-icon-free-vector.jpg",
    quote:
      "EventWave's monitoring tools have transformed our farmer trainings. Crop yield reporting is now automated, saving us 15 hours per week.",
    rating: 5,
    mealStats: [
      { value: "15hrs", label: "Time Saved" },
      { value: "100%", label: "Reporting Accuracy" },
      { value: "4.7/5", label: "Farmer Impact Score" },
    ],
  },
  {
    name: "Adhiambo Onyango",
    role: "Community Engagement Lead",
    organization: "Western Kenya Women's Empowerment Network",
    avatar:
      "https://static.vecteezy.com/system/resources/thumbnails/006/390/348/small/simple-flat-isolated-people-icon-free-vector.jpg",
    quote:
      "Our village meetings are more inclusive than ever. Anonymous feedback increased participation among marginalized groups by 280%.",
    rating: 5,
    mealStats: [
      { value: "280%", label: "Increased Participation" },
      { value: "92%", label: "Issue Resolution" },
      { value: "5/5", label: "Inclusion Score" },
    ],
  },
];
</script>

<style scoped>
.testimonials-section {
  background: #0f172a;
  color: white;
}

.testimonials-section :deep(.text-grey) {
  color: #94a3b8 !important;
}

.max-width-600 {
  max-width: 600px;
}

.h-100 {
  height: 100%;
}

.testimonial-card {
  background: #1e293b;
  border: 1px solid #334155;
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-4px);
  border-color: #6366f1;
  box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.2);
}

.testimonial-quote {
  line-height: 1.7;
  color: #cbd5e1;
}

.testimonial-stats {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.testimonial-stats .stat {
  text-align: center;
  flex: 1;
}
</style>
