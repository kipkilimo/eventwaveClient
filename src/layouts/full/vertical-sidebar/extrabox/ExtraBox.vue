<script setup lang="ts">
import { computed } from "vue";

import EventVoucherRedeem from "@/components/dialogs/payments/EventVoucherRedeem.vue";
import PaymentHandler from "@/components/dialogs/payments/PaymentHandler.vue";
import CreateFreeEvent from "@/components/dialogs/forms/CreateFreeEvent.vue";
import CreateOrganization from "@/components/dialogs/forms/CreateOrganization.vue";

import { useDialogStore, DIALOG_NAMES } from "@/stores/dialog";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const dialogStore = useDialogStore();

/* -----------------------------
   REACTIVE DIALOG STATES
------------------------------ */
const showOrganizationForm = computed({
  get: () => dialogStore.isDialogOpen(DIALOG_NAMES.CREATE_ORGANIZATION),
  set: (val) => {
    if (!val) dialogStore.close(DIALOG_NAMES.CREATE_ORGANIZATION);
  },
});

const showEventForm = computed({
  get: () => dialogStore.isDialogOpen(DIALOG_NAMES.CREATE_FREE_EVENT),
  set: (val) => {
    if (!val) dialogStore.close(DIALOG_NAMES.CREATE_FREE_EVENT);
  },
});

 

const showVoucherDialog = computed({
  get: () => dialogStore.isDialogOpen(DIALOG_NAMES.VOUCHER),
  set: (val) => {
    if (!val) dialogStore.close(DIALOG_NAMES.VOUCHER);
  },
});

const showPaymentDialog = computed({
  get: () => dialogStore.isDialogOpen(DIALOG_NAMES.PAYMENT),
  set: (val) => {
    if (!val) dialogStore.close(DIALOG_NAMES.PAYMENT);
  },
});

/* -----------------------------
   OPEN ACTIONS
------------------------------ */

const openCreateEventDialog = () => {
  dialogStore.openCreateFreeEvent(userStore.user?.id || "1", {
    defaultDuration: 60,
    defaultEventType: "MEETING",
  });
};

const openCreateOrganizationDialog = () => {
  dialogStore.openCreateOrganization(userStore.user?.id || "1", {
    defaultType: "COMPANY",
  });
};

/* -----------------------------
   CALLBACKS
------------------------------ */

const handleEventCreated = (event: any) => {
  console.log("Event created:", event);
  dialogStore.closeCreateFreeEvent();
};

const handleOrganizationCreated = (org: any) => {
  console.log("Organization created:", org);
  dialogStore.closeCreateOrganization();
};
</script>

<template>
  <div class="premium-entry">

    <!-- =========================
         MAIN PREMIUM CARD
    ========================== -->
    <v-card
      v-if="userStore.user?.role !== 'PARTICIPANT'"
      class="go-premium-card"
      elevation="5"
      color="primary"
      variant="elevated"
      @click="dialogStore.open(DIALOG_NAMES.PLANS)"
    >
      <div class="text-white ml-2 mt-2 font-weight-bold">
        Realtime Interactivity Tools
      </div>

      <v-divider />

      <v-row no-gutters align="center" justify="space-between" class="pa-2">
        <div class="live-pulse-container w-10 h-10 rounded-full">
          <v-icon size="15">mdi-crown</v-icon>
        </div>

        <v-col class="pl-2">
          <div class="text-white text-caption">Schedule now</div>
        </v-col>

        <v-col cols="auto">
          <v-btn size="small" color="white" variant="tonal">
            Create Event
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- =========================
         CREATE ORGANIZATION
    ========================== -->
    <v-card
      v-if="userStore.user?.role !== 'PARTICIPANT'"
      class="create-org-card mt-3"
      elevation="5"
      variant="elevated"
      @click="openCreateOrganizationDialog"
    >
      <v-row no-gutters align="center" justify="space-between" class="pa-2">
        <div class="live-pulse-container w-10 h-10 rounded-full">
          <v-icon size="15" color="white">mdi-domain-plus</v-icon>
        </div>

        <v-col class="pl-2">
          <div class="text-white text-caption">Create Organization</div>
        </v-col>

        <v-col cols="auto">
          <v-btn size="small" color="white" variant="tonal">
            Create
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

  </div>

  <!-- =========================
       CREATE EVENT DIALOG
  ========================== -->
  <v-dialog v-model="showEventForm" max-width="630">
    <CreateFreeEvent
      :visible="showEventForm"
      :payload="dialogStore.dialogPayload"
      @close="dialogStore.closeCreateFreeEvent"
      @success="handleEventCreated"
    />
  </v-dialog>

  <!-- =========================
       CREATE ORGANIZATION DIALOG
  ========================== -->
<!-- <v-dialog v-model="showOrganizationForm" max-width="800">
  <CreateOrganization
    :visible="showOrganizationForm"
    :payload="dialogStore.dialogPayload"
    @close="dialogStore.closeCreateOrganization"
    @success="handleOrganizationCreated"
  />
</v-dialog> -->


  <!-- =========================
       VOUCHER DIALOG
  ========================== -->
  <v-dialog v-model="showVoucherDialog" persistent max-width="48rem">
    <v-card>
      <EventVoucherRedeem />
    </v-card>
  </v-dialog>

  <!-- =========================
       PAYMENT DIALOG
  ========================== -->
  <v-dialog v-model="showPaymentDialog" width="66%">
    <PaymentHandler />
  </v-dialog>

</template>

<style scoped>
.go-premium-card,
.create-org-card {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.go-premium-card:hover,
.create-org-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3) !important;
}

@keyframes ripple {
  0% { transform: scale(0.6); opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
}

.live-pulse-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.live-pulse-container::before,
.live-pulse-container::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0;
  z-index: -1;
  animation: ripple 2.7s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.live-pulse-container::after {
  animation-delay: 0.3s;
}

.create-org-card {
  background: linear-gradient(135deg, #800080 0%, #9b4d9b 100%);
}
</style>