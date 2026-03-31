<template>
  <v-container>
    <v-card max-width="900" class="mx-auto">
      <v-card-title class="font-weight-bold"> Create Feedback </v-card-title>

      <v-divider />

      <!-- STEP 1: BASIC FEEDBACK DETAILS -->
      <v-form ref="formRef" v-model="isValid">
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.title"
                label="Feedback Title"
                :rules="[rules.required]"
                required
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="Description"
                rows="3"
              />
            </v-col>

            <v-col cols="6">
              <v-select
                v-model="form.targetType"
                :items="targetTypes"
                label="Target Type"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="form.targetId"
                label="Target ID"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="6">
              <v-select
                v-model="form.responseWindowDuration"
                :items="responseDurations"
                label="Response Window"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="form.closesAt"
                label="Closes At (ISO)"
                hint="Optional – ISO date string"
                persistent-hint
              />
            </v-col>

            <v-col cols="12">
              <v-switch
                v-model="form.isAnonymous"
                label="Anonymous Responses"
              />
            </v-col>

            <v-col cols="12">
              <v-switch
                v-model="form.allowMultipleSubmissions"
                label="Allow Multiple Submissions"
              />
            </v-col>
          </v-row>

          <!-- INFO -->
          <v-alert type="info" variant="tonal" class="mt-4">
            Questions will be uploaded in the next step (CSV / XLSX / JSON).
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn
            color="primary"
            :loading="creating"
            :disabled="!isValid"
            @click="submitFeedback"
          >
            Create Feedback
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>

    <!-- STEP 2: UPLOAD QUESTIONS -->
    <v-dialog v-mode="uploadFeedbackItems">
      <FeedbackItemsUploader />
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import FeedbackItemsUploader from "@/components/dialogs/uploads/feedback/FeedbackItemsUploader.vue";
import { CREATE_FEEDBACK } from "@/graphql/feedback";

/* -----------------------------
   Form State
----------------------------- */
const formRef = ref();
const isValid = ref(false);
const creating = ref(false);
const showUploader = ref(false);

const createdFeedback = ref<{ id: string } | null>(null);

const form = ref({
  title: "",
  description: "",
  targetId: "",
  targetType: null as string | null,
  isAnonymous: true,
  allowMultipleSubmissions: false,
  closesAt: "",
  metadata: "",
  responseWindowDuration: "OPEN",
});

/* -----------------------------
   Select Options
----------------------------- */
const targetTypes = [
  "EVENT",
  "COURSE",
  "SESSION",
  "PRODUCT",
  "INSTRUCTOR",
  "SYSTEM",
];

const responseDurations = [
  "MINUTES_15",
  "HOUR_1",
  "HOURS_3",
  "DAY_1",
  "WEEK_1",
  "OPEN",
];

/* -----------------------------
   Validation
----------------------------- */
const rules = {
  required: (v: any) => !!v || "Required",
};

/* -----------------------------
   GraphQL
----------------------------- */
const { mutate: createFeedback } = useMutation(CREATE_FEEDBACK);

/* -----------------------------
   Actions
----------------------------- */
const submitFeedback = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  creating.value = true;

  try {
    const { data } = await createFeedback({
      ...form.value,
      questions: [], // uploaded in step 2
    });

    createdFeedback.value = data.createFeedback;
    showUploader.value = true;
  } catch (err) {
    console.error("Create feedback failed:", err);
  } finally {
    creating.value = false;
  }
};

const onUploadSuccess = () => {
  showUploader.value = false;
};

const onUploadError = (err: any) => {
  console.error("Upload failed:", err);
};
</script>
