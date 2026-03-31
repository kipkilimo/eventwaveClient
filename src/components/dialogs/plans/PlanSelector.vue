<template>
  <!-- ❌ REMOVED v-model LOCAL STATE -->
  <!-- EVERYTHING IS NOW CONTROLLED BY dialogStore -->

  <v-dialog
    :model-value="dialogStore.isDialogOpen(DIALOG_NAMES.PLANS)"
    persistent
    max-width="81%"
  >
    <v-card min-width="81%">

      <v-card-title class="text-h5 d-flex align-center justify-space-between">
        Subscription Tiers & Feature Matrix

        <v-btn
          color="primary"
          variant="tonal"
          @click="dialogStore.close()"
        >
          Close
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row>

          <v-col
            v-for="tier in tiers"
            :key="tier.id"
            cols="12"
            md="4"
          >
            <v-card
              :elevation="tier.highlight ? 10 : 2"
              class="tier-card pa-4"
              :class="{ highlight: tier.highlight }"
              :disabled="isTierDisabled(tier)"
            >

              <!-- NAME -->
              <div class="text-h6 font-weight-bold mb-1">
                {{ tier.emoji }} {{ tier.name }}
              </div>

              <div class="text-caption mb-2 text-medium-emphasis">
                {{ tier.target }}
              </div>

              <!-- PRICING (SAFE) -->
              <div class="text-subtitle-1 font-weight-bold mb-2">
                {{ tier.monthlyPricing || tier.pricing }}
                <span v-if="isTierDisabled(tier)">
                  (Requires organization)
                </span>
              </div>

              <!-- WARNING -->
              <v-alert
                v-if="isTierDisabled(tier)"
                color="#ffc115"
                density="compact"
                variant="tonal"
                class="mb-2"
              >
                <v-icon size="18" class="mr-2">mdi-alert</v-icon>
                Create an organization first to select Business tier
              </v-alert>

              <v-divider class="mb-3" />

              <!-- FEATURES -->
              <div class="feature-matrix">

                <div
                  v-for="(feat, index) in tier.features"
                  :key="index"
                  class="d-flex align-center py-1"
                >
                  <v-icon
                    size="18"
                    class="mr-2"
                    :color="
                      feat.toLowerCase().includes('plus') ||
                      feat.startsWith('All')
                        ? 'primary'
                        : 'grey'
                    "
                  >
                    {{
                      feat.toLowerCase().includes("plus") ||
                      feat.startsWith("All")
                        ? "mdi-check-circle"
                        : "mdi-check-circle-outline"
                    }}
                  </v-icon>

                  <span>{{ feat }}</span>
                </div>

              </div>

              <v-alert
                type="info"
                density="compact"
                variant="tonal"
                class="mt-4 text-body-2"
              >
                {{ tier.summary }}
              </v-alert>

              <!-- ACTION -->
              <v-card-actions>
                <v-btn
                  block
                  color="primary"
                  variant="flat"
                  :disabled="isTierDisabled(tier)"
                  @click="openTierDialog(tier)"
                >
                  Continue with {{ tier.name }}
                </v-btn>
              </v-card-actions>

            </v-card>
          </v-col>

        </v-row>
      </v-card-text>

    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useOrganizationStore } from "@/stores/organization";
import { useDialogStore, DIALOG_NAMES } from "@/stores/dialog";
import { tiers } from "@/data/tiers";

const orgStore = useOrganizationStore();
const dialogStore = useDialogStore();

const hasOrganization = computed(() => !!orgStore.currentOrganization);

interface Tier {
  id: string;
  name: string;
  target: string;
  pricing?: string;
  monthlyPricing?: string;
  annualPricing?: string;
  features: string[];
  summary: string;
  emoji: string;
  highlight?: boolean;
}

// ----------------------
// OPEN LOGIC (FIXED)
// ----------------------
const openTierDialog = (tier: Tier) => {
  const name = tier.name.toLowerCase();

  if (name.includes("basic")) {
    dialogStore.open(DIALOG_NAMES.CREATE_FREE_EVENT);
  }

  else if (name.includes("pro")) {
    dialogStore.open(DIALOG_NAMES.VOUCHER);
  }

  else if (name.includes("enterprise")) {
    // safer: ensure organization exists before opening payment
    if (!hasOrganization.value) return;
    dialogStore.open(DIALOG_NAMES.PAYMENT);
  }
};

// ----------------------
// DISABLE RULES
// ----------------------
const isTierDisabled = (tier: Tier) => {
  return (
    tier.name.toLowerCase().includes("business") &&
    !hasOrganization.value
  );
};
</script>