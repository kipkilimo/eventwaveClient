<template>
  <v-card
    class="mx-auto"
    max-width="425"
  >
    <v-list lines="two">
      <h3>Onboarding Steps</h3>
      <v-divider/>

      <v-list-item
        prepend-icon="mdi-account-star-outline"
        title="Facilitator Login"
      >
        <template v-slot:subtitle>
          <span class="font-weight-bold">Facilitator role:</span> Log in to the system with your <strong>Facilitator</strong> credentials.
        </template>
      </v-list-item>

      <v-divider inset></v-divider>

      <v-list-item
        prepend-icon="mdi-plus-circle-multiple-outline"
        title="Create Free Trial Application"
      >
        <template v-slot:subtitle>
          <span class="font-weight-bold">Admin Activation:</span> Set up a <strong>free trial application</strong> to test our features.
        </template>
      </v-list-item>

      <v-divider inset></v-divider>

      <v-list-item
        prepend-icon="mdi-domain-plus"
        title="Establish Organization"
      >
        <template v-slot:subtitle>
          <span class="font-weight-bold">Configuration:</span> Define and create your <strong>Organization</strong> profile within the platform (max 5).
        </template>
      </v-list-item>

      <v-divider inset></v-divider>

      <v-list-item
        prepend-icon="mdi-cloud-upload-multiple"
        title="Document Upload"
      >
        <template v-slot:subtitle>
          <span class="font-weight-bold">Compliance:</span> Upload the <strong>signed Terms</strong> and your <strong>Attestation of Support</strong> documentation.
        </template>
      </v-list-item>

      <v-divider inset></v-divider>

      <v-list-item
        prepend-icon="mdi-credit-card-fast-outline"
        title="Finalize Payment"
      >
        <template v-slot:subtitle>
          <span class="font-weight-bold">Activation:</span> Complete the process by making a payment via your <strong>convenient choice</strong>.
        </template>
      </v-list-item>

    </v-list>
  </v-card>
</template>