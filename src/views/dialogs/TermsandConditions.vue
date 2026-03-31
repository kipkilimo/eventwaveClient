<template>
  <v-dialog v-model="dialogStore.visible" max-width="800">
    <v-card class="help-center-dialog-card" v-if="dialogStore.name === 'termsDialog'">
      
      <v-toolbar color="primary" dark>
        <v-toolbar-title>
          <v-icon icon="mdi-help-circle" class="mr-2"></v-icon>
          eventwave Africa Help Center
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="dialogStore.visible = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="help-center-scroll-content">
        <v-container class="help-center-container pa-0">
          
          <!-- <div class="mb-4 text-center">
            <v-btn variant="outlined" @click="isLoggedIn = !isLoggedIn">
              {{ isLoggedIn ? "Log Out" : "Log In" }}
            </v-btn>
          </div> -->

          <v-card class="mb-6">
            <v-card-text>
              <v-text-field
                v-model="searchQuery"
                label="Search help articles"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                clearable
                @update:model-value="handleSearch"
                id="search"
              ></v-text-field>
            </v-card-text>
          </v-card>

          <v-expansion-panels class="mb-6" variant="accordion">
            <v-expansion-panel>
              <v-expansion-panel-title class="font-weight-bold">
                <v-icon icon="mdi-menu" class="mr-2"></v-icon>
                Jump to Section
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-list density="compact">
                  <v-list-item
                    v-for="item in navItems.slice(1)" :key="item.title"
                    :value="item"
                    @click="scrollToSection(item.id)"
                    link
                  >
                    <template v-slot:prepend>
                      <v-icon :icon="item.icon"></v-icon>
                    </template>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
          
          <v-card id="terms" class="mb-6 content-section">
            <v-card-title class="section-title">
              <v-icon icon="mdi-file-document" class="mr-2"></v-icon>
              Terms of Service
            </v-card-title>
            <v-card-text>
              <v-alert type="info" class="mb-4">
                Last updated: August 20, 2025 - CountySquare
                Business Solutions (Conducting Business as eventwave Africa)
              </v-alert>

              <v-list>
                <v-list-item v-for="term in terms" :key="term.id" class="px-0">
                  <v-list-item-title class="font-weight-bold mb-2"
                    >{{ term.id }}. {{ term.title }}</v-list-item-title
                  >
                  <v-list-item-subtitle class="text-body-1">{{
                    term.content
                  }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-alert type="warning" class="mt-4">
                <strong>Important Notice:</strong> Section 9 contains binding
                arbitration and class action waiver provisions. Please read
                carefully as it may affect your legal rights.
              </v-alert>
            </v-card-text>
          </v-card>

          <v-card id="privacy" class="mb-6 content-section">
            <v-card-title class="section-title">
              <v-icon icon="mdi-shield-account" class="mr-2"></v-icon>
              Privacy & Data Protection
            </v-card-title>
            <v-card-text>
              <v-alert type="success" class="mb-4">
                <strong>EU GDPR & Kenyan Data Protection Act Compliance</strong>
              </v-alert>

              <v-expansion-panels>
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon icon="mdi-shield-check" class="mr-2"></v-icon>
                    Data Processing Under EU GDPR
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <p>
                      <strong>For EU Users:</strong> CountySquare Business
                      Solutions acts as a data processor for EU personal data.
                      We comply with Chapter 5 of GDPR for international
                      transfers.
                    </p>
                    <v-list>
                      <v-list-item>
                        <v-list-item-title
                          >Lawful Basis for Processing</v-list-item-title
                        >
                        <v-list-item-subtitle
                          >Consent, contract necessity, legitimate
                          interests</v-list-item-subtitle
                        >
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title
                          >Data Subject Rights</v-list-item-title
                        >
                        <v-list-item-subtitle
                          >Access, rectification, erasure, restriction,
                          portability</v-list-item-subtitle
                        >
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title
                          >International Transfers</v-list-item-title
                        >
                        <v-list-item-subtitle
                          >Adequate safeguards for Kenya-EU data
                          transfers</v-list-item-subtitle
                        >
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>

                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon icon="mdi-earth" class="mr-2"></v-icon>
                    Kenyan Data Protection Act 2019
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <p>
                      As a Kenyan-based company, we fully comply with the Data
                      Protection Act, 2019:
                    </p>
                    <v-list>
                      <v-list-item>
                        <v-list-item-title
                          >Data Commissioner Registration</v-list-item-title
                        >
                        <v-list-item-subtitle
                          >Fully registered and compliant</v-list-item-subtitle
                        >
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>Data Localization</v-list-item-title>
                        <v-list-item-subtitle
                          >Primary data processing within East African
                          Community</v-list-item-subtitle
                        >
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>Consumer Rights</v-list-item-title>
                        <v-list-item-subtitle
                          >Access, correction, deletion in line with Kenyan
                          law</v-list-item-subtitle
                        >
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-card class="mt-4" variant="outlined">
                <v-card-text>
                  <v-icon
                    icon="mdi-information"
                    color="info"
                    class="mr-2"
                  ></v-icon>
                  <strong>Data Protection Officer:</strong> For GDPR or Data
                  Protection Act inquiries, contact:
                  <a href="mailto:dpo@countysquare.co.ke"
                    >dpo@countysquare.co.ke</a
                  >
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>

          <v-card id="organizer" class="mb-6 content-section">
            <v-card-title class="section-title">
              <v-icon icon="mdi-account-group" class="mr-2"></v-icon>
              Organizer Resources
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-card variant="outlined" class="h-100">
                    <v-card-title>
                      <v-icon icon="mdi-ticket" class="mr-2"></v-icon>
                      Event Ticketing
                    </v-card-title>
                    <v-card-text>
                      <p>
                        Flexible ticketing solutions for African event
                        organizers:
                      </p>
                      <v-list density="compact">
                        <v-list-item>
                          <v-list-item-title
                            >Custom ticket types</v-list-item-title
                          >
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title
                            >Mobile check-in apps</v-list-item-title
                          >
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title
                            >Real-time sales tracking</v-list-item-title
                          >
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12">
                  <v-card variant="outlined" class="h-100">
                    <v-card-title>
                      <v-icon icon="mdi-chart-bar" class="mr-2"></v-icon>
                      Analytics & Reporting
                    </v-card-title>
                    <v-card-text>
                      <p>Comprehensive insights for event organizers:</p>
                      <v-list density="compact">
                        <v-list-item>
                          <v-list-item-title
                            >Real-time attendance data</v-list-item-title
                          >
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title
                            >Sales performance metrics</v-list-item-title
                          >
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title
                            >Audience demographics</v-list-item-title
                          >
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-alert type="info" class="mt-4">
                <strong>African Market Specialization:</strong> Our platform is
                optimized for local payment methods including M-Pesa, Airtel
                Money, and other mobile money solutions popular across Africa.
              </v-alert>
            </v-card-text>
          </v-card>

          <v-card id="user" class="mb-6 content-section">
            <v-card-title class="section-title">
              <v-icon icon="mdi-account" class="mr-2"></v-icon>
              User Guidelines
            </v-card-title>
            <v-card-text>
              <v-alert type="warning" class="mb-4">
                <strong>Community Guidelines:</strong> All users must adhere to
                our community standards to ensure a safe and respectful
                environment.
              </v-alert>

              <v-row>
                <v-col cols="12">
                  <v-card variant="outlined">
                    <v-card-title class="bg-blue-lighten-5">
                      <v-icon
                        icon="mdi-check-circle"
                        color="success"
                        class="mr-2"
                      ></v-icon>
                      Permitted Activities
                    </v-card-title>
                    <v-card-text>
                      <v-list density="compact">
                        <v-list-item>
                          <v-list-item-title
                            >Legitimate event creation and
                            promotion</v-list-item-title
                          >
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title
                            >Respectful communication between
                            users</v-list-item-title
                          >
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title
                            >Compliance with local event
                            regulations</v-list-item-title
                          >
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title
                            >Transparent pricing and refund
                            policies</v-list-item-title
                          >
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12">
                  <v-card variant="outlined">
                    <v-card-title class="bg-red-lighten-5">
                      <v-icon
                        icon="mdi-close-circle"
                        color="error"
                        class="mr-2"
                      ></v-icon>
                      Prohibited Activities
                    </v-card-title>
                    <v-card-text>
                      <v-list density="compact">
                        <v-list-item>
                          <v-list-item-title
                            >Fraudulent event listings</v-list-item-title
                          >
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title
                            >Unauthorized ticket reselling</v-list-item-title
                          >
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title
                            >Harassment or hate speech</v-list-item-title
                          >
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title
                            >Violation of intellectual property
                            rights</v-list-item-title
                          >
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-card class="mt-4" color="grey-lighten-4">
                <v-card-text>
                  <v-icon icon="mdi-headphones" class="mr-2"></v-icon>
                  <strong>Need Help?</strong> Contact our African support team:
                  <a href="mailto:support@eventwave.africa"
                    >support@eventwave.africa</a
                  >
                  or call +254 700 000 000
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
          
          <v-card class="mt-6" flat>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <h4 class="mb-2">CountySquare Business Solutions</h4>
                  <p>Trading as <strong>eventwave Africa</strong></p>
                  <p>Nairobi, Kenya</p>
                  <p>Email: info@countysquare.co.ke</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-list density="compact">
                    <v-list-subtitle>QUICK LINKS</v-list-subtitle>
                    <v-list-item link>
                      <v-list-item-title>About Us</v-list-item-title>
                    </v-list-item>
                    <v-list-item link>
                      <v-list-item-title>Blog</v-list-item-title>
                    </v-list-item>
                    <v-list-item link>
                      <v-list-item-title>Careers</v-list-item-title>
                    </v-list-item>
                    <v-list-item link>
                      <v-list-item-title>Security</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
              <v-divider class="my-4"></v-divider>
              <div class="text-center">
                <p>
                  &copy; 2025 CountySquare Business Solutions (eventwave Africa).
                  All rights reserved.
                </p>
                <!-- <v-chip-group>
                  <v-chip variant="outlined" size="small" link>Terms</v-chip>
                  <v-chip variant="outlined" size="small" link>Privacy</v-chip>
                  <v-chip variant="outlined" size="small" link>Accessibility</v-chip>
                  <v-chip variant="outlined" size="small" link>Cookies</v-chip>
                </v-chip-group> -->
              </div>
            </v-card-text>
          </v-card>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
// Assuming dialogStore is correctly imported and available
import { useDialogStore } from "@/stores/dialog";

const dialogStore = useDialogStore();

// Reactive data
const searchQuery = ref("");
const isLoggedIn = ref(false);

// Navigation items - Used for the new Expansion Panel navigation
const navItems = ref([
  { title: "Search Help Articles", icon: "mdi-magnify", id: "search" },
  { title: "Terms of Service", icon: "mdi-file-document", id: "terms" },
  {
    title: "Privacy & Data Protection",
    icon: "mdi-shield-account",
    id: "privacy",
  },
  { title: "Organizer Resources", icon: "mdi-account-group", id: "organizer" },
  { title: "User Guidelines", icon: "mdi-account", id: "user" },
]);

// Terms data (kept as is)
const terms = ref([
  {
    id: 1,
    title: "Accepting These Terms",
    content:
      "By accessing eventwave Africa Services, you agree to these Terms which incorporate our Privacy Policy and all referenced policies. CountySquare Business Solutions operates under Kenyan law while complying with international standards.",
  },
  {
    id: 2,
    title: "eventwave Africa Services and Role",
    content:
      "We provide an events management platform for Organizers and Consumers across Africa. We facilitate event creation, ticketing, and promotion but are not the creator, organizer, or owner of events listed on our platform.",
  },
  {
    id: 3,
    title: "Privacy and Consumer Information (EU GDPR & Kenyan DPA Compliance)",
    content:
      "We comply with GDPR requirements for EU users while fully adhering to Kenyan Data Protection Act, 2019. All personal data is processed with appropriate safeguards for international transfers.",
  },
  {
    id: 4,
    title: "Term; Termination",
    content:
      "These Terms apply when you access our Services. We reserve the right to terminate accounts for violations of these Terms or applicable laws.",
  },
  {
    id: 5,
    title: "Export Controls and Restricted Countries",
    content:
      "As a Kenyan company with global operations, we comply with applicable trade controls and sanctions laws.",
  },
  {
    id: 14,
    title: "Fees and Refunds",
    content:
      "CountySquare Business Solutions charges transparent fees for paid events. Our fee structure supports local payment methods including M-Pesa. Refund requests must be directed to the event organizer, in compliance with Kenyan consumer protection laws.",
  },
  {
    id: 25,
    title: "Additional Clauses for Users in Certain Locations",
    content:
      "Special provisions apply for EU users under GDPR, while maintaining full compliance with Kenyan data protection regulations. Our platform is optimized for the African market with local payment integrations and support.",
  },
]);

// Search functionality (kept as is)
const handleSearch = () => {
  if (searchQuery.value) {
    console.log("Searching for:", searchQuery.value);
    // Implement actual search logic here
  }
};

// Scroll to section function (kept as is, targeting IDs within the scrollable area)
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    // Scroll the actual scrollable content area, not the whole window
    const scrollContainer = document.querySelector('.help-center-scroll-content');
    if (scrollContainer) {
      // Calculate position relative to the scroll container
      const elementRect = element.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      
      scrollContainer.scrollTo({
        top: element.offsetTop - 16, // scroll to the element's position, minus a small margin
        behavior: "smooth"
      });
    }
  }
};
</script>

<style scoped>
/*
* OPTIMIZED STYLES FOR DIALOG/SCROLLABLE VIEW
*/

/* Removed .help-center-container max-width for full dialog width utilization (max-width="800" on v-dialog handles sizing) */
.help-center-container {
  /* Set max-width on v-dialog instead of v-container. Keep padding to zero inside card-text */
  max-width: none;
}

/* New class for the main scrollable content area */
.help-center-scroll-content {
  /* Enforce max height and enable vertical scrolling. Adjust height as needed. */
  max-height: 80vh; /* 80% of viewport height */
  overflow-y: auto;
}

/* Removed Sidebar Nav styles as the sidebar is gone */
/* Removed .sidebar-nav and .active-nav-item styles */

.section-title {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.content-section {
  /* Important for smooth scrolling to sections when header/toolbar is sticky */
  scroll-margin-top: 64px; /* Adjust based on toolbar height */
}

.v-list-item {
  min-height: 48px;
}

.v-card {
  border-radius: 8px;
}
</style>