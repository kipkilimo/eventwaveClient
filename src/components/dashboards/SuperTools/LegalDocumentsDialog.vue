<template>
  <v-container width="81%">
    <v-card variant="outlined" class="mx-4 mb-4">
      <v-card-title class="d-flex align-center bg-blue-grey-lighten-5">
        <v-icon icon="mdi-file-document" class="mr-2"></v-icon>
        Legal Documents - {{ orgStore.currentOrganization?.name || "N/A" }}
        <v-spacer></v-spacer>
        <v-btn icon @click="closeDialog" density="compact"
          ><v-icon>mdi-close</v-icon></v-btn
        >
      </v-card-title>

      <v-card-text v-if="documentSource" class="pa-0">
        <div class="pdf-viewer-container">
          <VuePdfEmbed
            :key="documentSource"
            :source="documentSource"
            class="vue-pdf-embed"
            :page="1"
            scale="1.0"
            :height="800"
          />
        </div>
      </v-card-text>

      <v-card-text v-else class="text-center py-8">
        <v-icon
          icon="mdi-file-remove"
          size="64"
          color="grey-lighten-1"
          class="mb-2"
        ></v-icon>
        <div class="text-h6">No Document Available</div>
        <div class="text-caption text-disabled">
          The legal document URL could not be loaded or is not set.
        </div>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn
          @click="publishOrganization(orgStore.currentOrganization)"
          color="success"
          variant="flat"
          v-if="
            orgStore.currentOrganization?.isBlocked === true &&
            orgStore.currentOrganization?.orgLegalDocuments.length > 5
          "
          ><v-icon
            icon="mdi-paperclip-check"
            size="17"
            color="grey-lighten-1"
          ></v-icon
          >Publish</v-btn
        >
        <v-btn @click="closeDialog" color="primary" variant="flat">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed } from "vue"; // Import computed
import { useOrganizationStore } from "@/stores/organization";
import VuePdfEmbed from "vue-pdf-embed";

import { router } from "@/router";
const orgStore = useOrganizationStore();

const apiUrl = import.meta.env.VITE_API_URL;
// 1. FIX: Use a computed property for the document source.
// This ensures that if the store's state changes (e.g., after an upload),
// the documentSource will automatically update, which in turn updates the PDF viewer.
const documentSource = computed(() => {
  const docUrl = orgStore.currentOrganization?.orgLegalDocuments;
  // Check if the value is a valid string/URL and not the 'Not set' placeholder
  return docUrl && docUrl !== "Not set" ? docUrl : null;
});

// In your component's methods/actions
const publishOrganization = async (organization) => {
  const orgId = organization.id; // Get the unique ID
  const updateData = {
    isBlocked: false, // The change you want to send
  };

  try {
    // ⚠️ CORRECTED: Construct the URL to carry orgId as a query parameter (?orgId=...)
    // Assuming your base endpoint is something like '/api/organizations/publish'
    const endpoint = `${apiUrl}/api/organization/publish?orgId=${orgId}`;

    const response = await fetch(endpoint, {
      method: "PUT", // or 'PATCH'
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if required (e.g., 'Authorization': `Bearer ${token}`)
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    router.push("/");

    // Success: Update the client-side store after a successful server response
    // this.orgStore.updateOrganization(orgId, updateData);
  } catch (error) {
    console.error("Error publishing organization:", error);
    // Handle error state (e.g., show an alert to the user)
  }
};
const closeDialog = () => {
  // Assuming this function is correctly implemented in your store
  orgStore.closeDialog("legal");
};
</script>

<style scoped>
/* Optional: Add basic styling for the container */
.pdf-viewer-container {
  /* Use a fixed height for consistency and set overflow */
  max-height: 75vh; /* Slightly reduced height for better fit */
  min-height: 75vh; /* Ensure a minimum size */
  overflow-y: auto;
  border-top: 1px solid #e0e0e0; /* Added a divider line */
}

/* Ensure the VuePdfEmbed component takes the full width of its container */
.vue-pdf-embed {
  width: 100%;
}
</style>
