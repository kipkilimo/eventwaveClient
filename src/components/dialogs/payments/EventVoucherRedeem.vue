<template>
  <v-card class="voucher-card py-2 px-2 mx-auto my-2" elevation="10" max-width="45rem">

    <!-- CLOSE -->
    <v-btn
      icon
      variant="text"
      size="small"
      class="close-btn"
      @click="dialogStore.close()"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>

    <!-- MAIN CONTENT -->
    <div v-if="!dialogStore.isDialogOpen('createBusinessEventDialog')">

      <v-card-title class="text-h6 font-weight-bold pb-1">
        Scan QR & Create Event
      </v-card-title>

      <v-divider class="mb-4" />

      <v-card-text>

        <!-- ALERTS -->
        <v-alert v-if="success" type="success" class="mb-4" @click="success = ''">
          {{ success }}
        </v-alert>

        <v-alert v-if="error" type="error" class="mb-4" @click="error = ''">
          {{ error }}
        </v-alert>

        <!-- QR STEP -->
        <div v-if="!voucherDetails" class="text-center">

          <v-icon size="64" class="mb-2">mdi-qrcode-scan</v-icon>

          <h3 class="mb-2">Scan Eventwave Organization QR</h3>
          <p class="text-caption mb-4">
            Hotels or venues will provide a QR code
          </p>

          <v-btn color="primary" @click="openScanner">
            Scan QR Code
          </v-btn>

        </div>

        <!-- LOADING -->
        <div v-else-if="isLoading" class="text-center py-6">
          <v-progress-circular indeterminate />
          <div class="mt-2">Verifying QR...</div>
        </div>

      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="dialogStore.close()">Cancel</v-btn>
      </v-card-actions>

    </div>

    <!-- QR SCANNER DIALOG -->
    <v-dialog persistent v-model="showQrScanner" width="400">
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          Scan QR
          <v-btn size="x-small" variant="outlined" icon @click="closeScanner">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
          <v-divider/>

        <v-card-text>
          <qr-stream
            v-if="isCameraActive"
            @decode="onQrDecode"
            @error="onCameraError"
            class="qr-stream"
          />

          <v-progress-circular v-else indeterminate />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ✅ EVENT CREATOR CONTROLLED BY DIALOG STORE -->
    <CreateBusinessEvent
      v-if="dialogStore.isDialogOpen('createBusinessEventDialog')"
      :voucher-details="voucherDetails"
    />

  </v-card>
</template>
<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { QrStream } from "vue3-qr-reader";
import { useUserStore } from "@/stores/user";
import { useDialogStore, DIALOG_NAMES } from "@/stores/dialog";

import CreateBusinessEvent from "@/components/dialogs/forms/CreateBusinessEvent.vue";

const userStore = useUserStore();
const dialogStore = useDialogStore();

// UI STATE
const showQrScanner = ref(false);
const isCameraActive = ref(false);

const voucherDetails = ref<any>(null);

const error = ref("");
const success = ref("");
const isLoading = ref(false);

// ----------------------
// QR HELPERS
// ----------------------
function extractOrgId(input: string): string | null {
  if (!input) return null;

  const match =
    input.match(/organizationId=([a-zA-Z0-9-_]+)/) ||
    input.match(/\b([a-zA-Z0-9-_]{6,})\b/);

  return match?.[1] || null;
}

// ----------------------
// SCANNER
// ----------------------
function openScanner() {
  showQrScanner.value = true;
  isCameraActive.value = true;
}

function closeScanner() {
  showQrScanner.value = false;
  isCameraActive.value = false;
}

function onCameraError() {
  error.value = "Camera access denied";
  isCameraActive.value = false;
}

// ----------------------
// QR FLOW
// ----------------------
async function onQrDecode(result: string) {
  const orgId = extractOrgId(result);
  if (!orgId) return;

  closeScanner();
  await redeemFromQR(orgId);
}

// ----------------------
// API CALL
// ----------------------
async function redeemFromQR(organizationId: string) {
  try {
    isLoading.value = true;

    const res = await axios.post("/api/event/redeem-from-qr", {
      organizationId,
      facilitatorEmail: userStore.user.email,
    });

    voucherDetails.value = res.data;

    success.value = "QR verified successfully";

    // ✅ OPEN GLOBAL DIALOG
    dialogStore.open(DIALOG_NAMES.CREATE_BUSINESS_EVENT);

  } catch (err: any) {
    error.value = err.response?.data?.message || "Invalid QR";
  } finally {
    isLoading.value = false;
  }
}
</script>