<template>
  <v-app>
    <!-- Header/Navigation - Fixed positioning -->
    <v-app-bar
      app
      elevation="1"
      color="white"
      class="px-4 px-md-8"
      height="80"
      fixed
      :style="{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }"
    >
      <v-app-bar-title class="d-flex align-center">
        <div class="logo-container">
          <v-icon size="7.5rem" color="primary" class="mr-2"><Logo /></v-icon>
        </div>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <div class="nav-links hidden-sm-and-down">
        <v-btn
          v-for="item in navItems"
          :key="item.id"
          variant="text"
          @click="scrollToSection(item.id)"
          class="nav-btn mx-1"
          size="large"
        >
          {{ item.text }}
        </v-btn>
      </div>

      <div class="auth-buttons hidden-sm-and-down">
        <v-list-item @click="goToLogin" class="mb-2">
          <v-btn variant="outlined" size="x-large" class="px-8 py-0">
            <v-icon start>mdi-cloud-key-outline</v-icon>
            Access Platform
          </v-btn>
        </v-list-item>
      </div>

      <v-app-bar-nav-icon
        size="large"
        class="hidden-md-and-up"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
    </v-app-bar>

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="right"
      width="320"
    >
      <v-list class="pa-4">
        <v-list-item class="mb-4">
          <v-list-item-title class="text-h6 font-weight-bold">
            <v-icon size="42" color="primary" class="mr-2"><Logo /></v-icon>
            EventWave
          </v-list-item-title>
        </v-list-item>

        <v-list-item
          v-for="item in navItems"
          :key="item.id"
          @click="
            scrollToSection(item.id);
            drawer = false;
          "
          class="mb-2"
        >
          <v-list-item-title class="text-body-1">{{
            item.text
          }}</v-list-item-title>
        </v-list-item>

        <v-divider class="my-4"></v-divider>

        <v-list-item @click="goToLogin" class="mb-2">
          <v-btn variant="outlined" size="x-large" class="px-8 py-0">
            <v-icon start>mdi-play-circle</v-icon>
            Access Platform
          </v-btn>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content with top padding to account for fixed header -->
    <v-main :style="{ paddingTop: '80px' }">
      <HeroSection @scroll-to="scrollToSection" />
      <MEALProposition />
      <UseCasesSection />
      <FeaturesSection @scroll-to="scrollToSection" />
      <FieldReadiness />
      <TestimonialsSection />
      <CTASection @open-demo="openTrialDialog" @scroll-to="scrollToSection" />
    </v-main>

    <!-- Demo Request Dialog -->
    <v-dialog v-model="demoDialog" max-width="600">
      <v-card class="pa-6 rounded-xl">
        <v-card-title class="text-h5 font-weight-bold mb-4">
          Request a MEAL Platform Demo
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="submitDemoRequest">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="demoForm.name"
                  label="Full Name"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="demoForm.organization"
                  label="Organization"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="demoForm.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="demoForm.phone"
                  label="Phone"
                  variant="outlined"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="demoForm.useCase"
                  :items="useCaseOptions"
                  label="Primary Use Case"
                  variant="outlined"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="demoForm.message"
                  label="Specific MEAL needs or questions"
                  variant="outlined"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="demoDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="submitDemoRequest" elevation="2">
            Request Demo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Footer -->
    <v-footer class="footer py-12">
      <v-container>
        <v-row>
          <v-col cols="12" lg="4" class="footer-brand">
            <div class="d-flex align-center mb-4">
              <Logo />
              <span class="text-h5 font-weight-bold">EventWave</span>
            </div>

            <p class="text-body-1 text-grey mb-4">
              Real-time MEAL engagement platform transforming trainings,
              workshops, and community events into rich data-generating learning
              experiences.
            </p>

            <div class="footer-newsletter mb-6">
              <p class="text-body-2 font-weight-medium mb-2">
                Get MEAL insights & updates
              </p>
              <v-text-field
                placeholder="Enter your email"
                variant="outlined"
                density="compact"
                hide-details
                class="newsletter-field"
              >
                <template v-slot:append-inner>
                  <v-btn icon color="primary" size="small">
                    <v-icon>mdi-send</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </div>

            <div class="social-links">
              <v-btn
                v-for="social in socialLinks"
                :key="social.name"
                :icon="social.icon"
                variant="text"
                size="small"
                class="mr-2"
                :color="social.color"
              ></v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="6" class="text-md-right">
            <div class="text-body-2 text-grey">
              <div>EventWave</div>
              <div>Ngeno Drive, Suite 120C Langata, Nairobi 00100</div>
              <div>info@eventwave.dev | +254 (700) 378-241</div>
            </div>
            <!-- Scroll to Top Button -->
            <v-btn
              v-show="showScrollTop"
              @click="scrollToTop"
              class="scroll-top-btn"
              color="primary"
              fab
              fixed
              bottom
              right
              small
            >
              <v-icon>mdi-chevron-up</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <v-divider class="my-8"></v-divider>

        <v-row justify="space-between" align="center">
          <v-col cols="12" md="6">
            <p class="text-body-2 text-grey">
              © 2024 - {{ new Date().getFullYear() }} EventWave. All rights
              reserved. Made with
              <v-icon size="16" color="error">mdi-heart</v-icon> for development
              professionals worldwide.
            </p>
          </v-col>
          <v-col cols="12" md="6" class="text-md-right">
            <div class="text-body-2 text-grey">
              <div>EventWave</div>
              <div>Ngeno Drive, Suite 120C Langata, Nairobi 00100</div>
              <div>info@eventwave.dev | +254 (700) 378-241</div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import Logo from "@/layouts/full/logo/LogoDark.vue";
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import HeroSection from "./HeroSection.vue";
import MEALProposition from "./MEALProposition.vue";
import UseCasesSection from "./UseCasesSection.vue";
import FeaturesSection from "./FeaturesSection.vue";
import FieldReadiness from "./FieldReadiness.vue";
import TestimonialsSection from "./TestimonialsSection.vue";
import CTASection from "./CTASection.vue";

const router = useRouter();

function goToLogin() {
  router.push("/login");
}

// Scroll to top visibility state
const showScrollTop = ref(false);

// Method to scroll to top
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

// Handle scroll event to show/hide button
const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300;
};

// Add scroll event listener
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

// Remove scroll event listener
onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

// Navigation state
const drawer = ref(false);
const demoDialog = ref(false);

// Navigation items with click handlers
const navItems = [
  { id: "meal-proposition", text: "MEAL Layer" },
  { id: "use-cases", text: "Use Cases" },
  { id: "features", text: "Features" },
  { id: "field", text: "Field Ready" },
  { id: "testimonials", text: "Testimonials" },
];

// Demo request form
const demoForm = reactive({
  name: "",
  organization: "",
  email: "",
  phone: "",
  useCase: "",
  message: "",
});

const useCaseOptions = [
  "Training & Capacity Development",
  "Community Consultations",
  "Accountability & Safeguarding",
  "Project Reviews & Reflection",
  "Other",
];

// Social links
const socialLinks = [
  { name: "Twitter", icon: "mdi-twitter", color: "blue" },
  { name: "LinkedIn", icon: "mdi-linkedin", color: "blue-darken-2" },
  { name: "Facebook", icon: "mdi-facebook", color: "indigo" },
  { name: "YouTube", icon: "mdi-youtube", color: "red" },
];

// Methods
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const offset = 80; // Account for fixed header height
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
  drawer.value = false;
};

const openTrialDialog = () => {
  demoDialog.value = true;
};

const submitDemoRequest = () => {
  console.log("Demo request submitted:", demoForm);
  demoDialog.value = false;

  // Reset form
  Object.assign(demoForm, {
    name: "",
    organization: "",
    email: "",
    phone: "",
    useCase: "",
    message: "",
  });

  alert(
    "Thank you! Your demo request has been submitted. Our MEAL team will contact you within 24 hours.",
  );
};
</script>

<style scoped>
/* Global Styles */
:deep(.v-container) {
  max-width: 1400px !important;
}

.max-width-600 {
  max-width: 600px;
}

.max-width-800 {
  max-width: 800px;
}

.min-height-100 {
  min-height: 100vh;
}

.cursor-pointer {
  cursor: pointer;
}

/* Navigation - Ensure it stays on top */
.v-app-bar {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 1000 !important;
}

.nav-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: normal;
}

.auth-buttons {
  display: flex;
  align-items: center;
}

/* Footer */
.footer {
  background: #0f172a;
  color: white;
}

.footer :deep(.text-grey) {
  color: #94a3b8 !important;
}

.footer-brand {
  padding-right: 48px;
}

.newsletter-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.newsletter-field :deep(.v-field__input) {
  color: white;
}

.social-links {
  margin-top: 16px;
}

/* Responsive Design */
@media (max-width: 960px) {
  .footer-brand {
    padding-right: 0;
  }
}

/* Utility Classes */
.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.h-100 {
  height: 100%;
}

.transparent {
  background: transparent !important;
}
</style>
