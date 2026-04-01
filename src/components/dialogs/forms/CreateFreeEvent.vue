<template>
  <!-- Same template structure, but with optimizations -->
  <v-card class="event-card" elevation="10" max-width="50rem">
    <!-- CLOSE BUTTON -->
    <v-btn
      icon
      variant="text"
      size="small"
      class="close-btn"
      @click="dialogStore.close()"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>

    <v-card-title class="text-h6 font-weight-bold pb-1">
      Create New Free Event
    </v-card-title>

    <v-divider class="mb-4" />

    <v-card-text class="pa-0">
      <!-- SUCCESS ALERT -->
      <v-alert
        v-if="success"
        type="success"
        variant="tonal"
        density="compact"
        class="mb-4 mx-4 fade-in"
        @click="success = null"
        style="cursor: pointer"
      >
        {{ success }}
      </v-alert>

      <!-- ERROR ALERT -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4 mx-4 shake"
        @click="error = null"
        style="cursor: pointer"
      >
        {{ error }}
      </v-alert>

      <!-- STEPPER -->
      <v-stepper
        v-model="step"
        elevation="0"
        class="stepper-no-scroll"
        hide-actions
      >
        <v-stepper-header>
          <v-stepper-item
            :value="1"
            :complete="step > 1"
            :error="stepErrors.step1"
          >
            <template v-slot:title>
              <span class="text-caption font-weight-medium">Basic Info</span>
            </template>
            <template v-slot:subtitle>
              <span v-if="stepErrors.step1" class="text-error text-caption">
                {{ stepErrors.step1 }}
              </span>
            </template>
          </v-stepper-item>

          <v-divider />

          <v-stepper-item
            :value="2"
            :complete="step > 2"
            :error="stepErrors.step2"
          >
            <template v-slot:title>
              <span class="text-caption font-weight-medium"
                >Location & Capacity</span
              >
            </template>
            <template v-slot:subtitle>
              <span v-if="stepErrors.step2" class="text-error text-caption">
                {{ stepErrors.step2 }}
              </span>
            </template>
          </v-stepper-item>

          <v-divider />

          <v-stepper-item
            :value="3"
            :error="stepErrors.step3"
          >
            <template v-slot:title>
              <span class="text-caption font-weight-medium">Advanced</span>
            </template>
          </v-stepper-item>
        </v-stepper-header>

        <v-stepper-window v-model="step" class="stepper-window">
          <!-- STEP 1: BASIC INFO -->
          <v-stepper-window-item :value="1">
            <div class="pa-4">
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    v-model="form.title"
                    label="Event Title *"
                    prepend-inner-icon="mdi-calendar-star"
                    :rules="[rules.required]"
                    density="compact"
                    variant="outlined"
                    hide-details="auto"
                    :error-messages="
                      touched.title ? rules.required(form.title) : undefined
                    "
                    @blur="touched.title = true"
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="form.description"
                    label="Description"
                    auto-grow
                    rows="2"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-text"
                    hide-details="auto"
                    :counter="500"
                    @blur="generateTags"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.eventType"
                    :items="eventTypes"
                    label="Event Type *"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-shape"
                    :rules="[rules.required]"
                    hide-details="auto"
                    @blur="touched.eventType = true"
                    :error-messages="
                      touched.eventType
                        ? rules.required(form.eventType)
                        : undefined
                    "
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.capacity"
                    label="Maximum Capacity"
                    type="number"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-account-group"
                    placeholder="e.g., 50"
                    :min="1"
                    :max="50"
                    :rules="[rules.capacity]"
                    hint="Max 50 participants"
                    persistent-hint
                    hide-details="auto"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.start"
                    label="Start Date & Time *"
                    type="datetime-local"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-calendar-start"
                    :rules="[rules.required, rules.startTime]"
                    :min="minStartDateTime"
                    :max="maxStartDateTime"
                    hide-details="auto"
                    @blur="touched.start = true"
                    @update:model-value="handleStartDateTimeChange"
                    :error-messages="
                      touched.start && rules.startTime
                        ? rules.startTime(form.start)
                        : undefined
                    "
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.end"
                    label="End Date & Time *"
                    type="datetime-local"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-calendar-end"
                    :rules="[rules.required, rules.endTime]"
                    :min="form.start || minStartDateTime"
                    hide-details="auto"
                    @blur="touched.end = true"
                    @update:model-value="handleEndDateTimeChange"
                    :error-messages="
                      touched.end ? rules.endTime(form.end) : undefined
                    "
                  />
                </v-col>

                <v-col cols="12">
                  <v-chip-group v-if="generatedTags.length" column>
                    <v-chip
                      v-for="tag in generatedTags"
                      :key="tag"
                      size="small"
                      color="primary"
                      variant="flat"
                      closable
                      @click:close="removeTag(tag)"
                    >
                      {{ tag }}
                    </v-chip>
                  </v-chip-group>
                </v-col>

                <v-col cols="12">
                  <v-alert
                    v-if="form.start && form.end && !isDurationValid"
                    type="warning"
                    variant="tonal"
                    density="compact"
                    class="mt-2"
                  >
                    <v-icon left size="small">mdi-clock-alert</v-icon>
                    Event duration exceeds {{ MAX_DURATION_MINUTES }} minutes
                    ({{ MAX_DURATION_MINUTES / 60 }} hours). End time will be
                    adjusted automatically.
                  </v-alert>
                </v-col>
              </v-row>
            </div>
          </v-stepper-window-item>

          <!-- STEP 2: LOCATION & CAPACITY -->
          <v-stepper-window-item :value="2">
            <div class="pa-4">
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.location.venue"
                    label="Venue Hall Name *"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-map-marker"
                    :rules="[rules.required]"
                    hide-details="auto"
                    @blur="touched.locationName = true"
                    :error-messages="
                      touched.locationName
                        ? rules.required(form.location.venue)
                        : undefined
                    "
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.location.address"
                    label="Address location *"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-home-map-marker"
                    :rules="[rules.required]"
                    hide-details="auto"
                    @blur="touched.locationAddress = true"
                    :error-messages="
                      touched.locationAddress
                        ? rules.required(form.location.address)
                        : undefined
                    "
                  />
                </v-col>

                <v-col cols="12" sm="8">
                  <v-text-field
                    v-model="form.location.virtualLink"
                    label="Virtual Meeting Link"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-video"
                    placeholder="https://meet.google.com/..."
                    :rules="[rules.url]"
                    hide-details="auto"
                  />
                </v-col>

                <v-col cols="12" sm="4">
                  <v-switch
                    v-model="form.location.isVirtual"
                    label="Virtual Event"
                    color="primary"
                    density="compact"
                    hide-details
                    class="mt-2"
                  />
                </v-col>

                <v-col cols="12">
                  <v-divider class="my-2" />
                </v-col>

                <v-col cols="12">
                  <div class="d-flex align-center">
                    <v-icon size="small" class="mr-2">mdi-tune</v-icon>
                    <span class="text-subtitle-2 font-weight-medium"
                      >Interactivity Settings</span
                    >
                    <v-btn
                      variant="text"
                      size="x-small"
                      class="ml-2"
                      @click="setDefaultInteractivity"
                    >
                      Reset to Defaults
                    </v-btn>
                  </div>
                </v-col>
                <v-col
                  cols="6"
                  sm="4"
                  md="3"
                  v-for="setting in interactivitySettings"
                  :key="setting.key"
                >
                  <v-switch
                    v-model="form.interactivity[setting.key]"
                    :label="setting.label"
                    color="primary"
                    density="compact"
                    hide-details
                  />
                </v-col>
              </v-row>
            </div>
          </v-stepper-window-item>

          <!-- STEP 3: ADVANCED -->
          <v-stepper-window-item :value="3">
            <div class="pa-4">
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.metadata.timezone"
                    :items="COMMON_TIMEZONES"
                    item-title="label"
                    item-value="value"
                    label="Timezone"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-clock-timezone"
                    hint="Select your timezone"
                    persistent-hint
                    hide-details="auto"
                    clearable
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.metadata.language"
                    :items="COMMON_LANGUAGES"
                    item-title="label"
                    item-value="value"
                    label="Language"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-translate"
                    hint="Select preferred language"
                    persistent-hint
                    hide-details="auto"
                    clearable
                  />
                </v-col>

                <v-col cols="12">
                  <v-divider class="my-2" />
                </v-col>

                <v-col cols="12">
                  <div class="d-flex align-center">
                    <v-icon size="small" class="mr-2">mdi-palette</v-icon>
                    <span class="text-subtitle-2 font-weight-medium"
                      >Branding Settings</span
                    >
                    <v-btn
                      variant="text"
                      size="x-small"
                      class="ml-2"
                      @click="clearBranding"
                    >
                      Clear All
                    </v-btn>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.branding.logoUrl"
                    label="Logo URL"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-image"
                    placeholder="https://..."
                    :rules="[rules.url]"
                    hide-details="auto"
                    @blur="validateUrlInBackground"
                  />
                </v-col>

                <v-col cols="12" sm="3">
                  <v-text-field
                    v-model="form.branding.themeColor"
                    label="Theme Color"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-palette"
                    placeholder="#1772ca"
                    type="color"
                    hide-details="auto"
                  />
                </v-col>

                <v-col cols="12" sm="3">
                  <v-text-field
                    v-model="form.branding.bannerBg"
                    label="Banner Background"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-image"
                    placeholder="https://..."
                    :rules="[rules.url]"
                    hide-details="auto"
                    @blur="validateUrlInBackground"
                  />
                </v-col>
              </v-row>
            </div>
          </v-stepper-window-item>
        </v-stepper-window>
      </v-stepper>
    </v-card-text>

    <v-divider class="my-2" />

    <v-card-actions class="justify-space-between px-4 py-2">
      <v-btn
        v-if="step > 1"
        variant="text"
        @click="step--"
        :disabled="isLoading"
        size="small"
        prepend-icon="mdi-chevron-left"
      >
        Back
      </v-btn>

      <v-spacer v-else />

      <v-btn
        variant="text"
        @click="resetForm"
        :disabled="isLoading"
        size="small"
        prepend-icon="mdi-refresh"
      >
        Clear
      </v-btn>

      <v-btn
        variant="text"
        @click="dialogStore.close()"
        :disabled="isLoading"
        size="small"
        prepend-icon="mdi-close"
      >
        Cancel
      </v-btn>

      <v-btn
        v-if="step < 3"
        color="primary"
        variant="flat"
        @click="nextStep"
        :disabled="!isCurrentStepValid"
        size="small"
        append-icon="mdi-chevron-right"
      >
        Next
      </v-btn>

      <v-btn
        v-else
        color="primary"
        variant="flat"
        :loading="isLoading"
        :disabled="!isFormValid"
        @click="createNewEvent"
        size="small"
        append-icon="mdi-check"
      >
        Create Event
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useEventStore } from "@/stores/event";
import { useDialogStore } from "@/stores/dialog";
import { DateTime } from "luxon";
import { useRouter } from "vue-router";
import nlp from "compromise";

let natural = null;

const loadNatural = async () => {
  if (natural) return natural;
  try {
    const naturalModule = await import("natural");
    natural = naturalModule.default || naturalModule;
    return natural;
  } catch (error) {
    console.error("Failed to load natural library:", error);
    natural = {
      TfIdf: class {
        addDocument() {}
        tfidf() {
          return 0;
        }
      },
    };
    return natural;
  }
};

const router = useRouter();

// Stores
const userStore = useUserStore();
const eventStore = useEventStore();
const dialogStore = useDialogStore();

// Refs
const isLoading = ref(false);
const error = ref(null);
const success = ref(null);
const step = ref(1);
const generatedTags = ref([]);
const touched = ref({
  title: false,
  eventType: false,
  start: false,
  end: false,
  locationName: false,
  locationAddress: false,
});

// Constants
const eventTypes = [
  { title: "Meeting", value: "MEETING" },
  { title: "Workshop", value: "WORKSHOP" },
  { title: "Training", value: "TRAINING" },
  { title: "Seminar", value: "SEMINAR" },
  { title: "Conference", value: "CONFERENCE" },
  { title: "Webinar", value: "WEBINAR" },
];

const COMMON_TIMEZONES = [
  { label: "UTC (Coordinated Universal Time)", value: "UTC" },
  { label: "GMT (Greenwich Mean Time)", value: "Europe/London" },
  { label: "EAT (East Africa Time)", value: "Africa/Nairobi" },
  { label: "CAT (Central Africa Time)", value: "Africa/Harare" },
  { label: "WAT (West Africa Time)", value: "Africa/Lagos" },
  { label: "CET (Central European Time)", value: "Europe/Paris" },
  { label: "EST (Eastern Standard Time)", value: "America/New_York" },
  { label: "CST (Central Standard Time)", value: "America/Chicago" },
  { label: "MST (Mountain Standard Time)", value: "America/Denver" },
  { label: "PST (Pacific Standard Time)", value: "America/Los_Angeles" },
  { label: "IST (India Standard Time)", value: "Asia/Kolkata" },
  { label: "JST (Japan Standard Time)", value: "Asia/Tokyo" },
  { label: "CST (China Standard Time)", value: "Asia/Shanghai" },
  { label: "AEST (Australian Eastern Time)", value: "Australia/Sydney" },
  { label: "BRT (Brasilia Time)", value: "America/Sao_Paulo" },
];

const COMMON_LANGUAGES = [
  { label: "English (US)", value: "en-US" },
  { label: "English (UK)", value: "en-GB" },
  { label: "Swahili (Kenya)", value: "sw-KE" },
  { label: "French (France)", value: "fr-FR" },
  { label: "French (Canada)", value: "fr-CA" },
  { label: "Arabic (Saudi Arabia)", value: "ar-SA" },
  { label: "Hindi (India)", value: "hi-IN" },
  { label: "Spanish (Spain)", value: "es-ES" },
  { label: "Spanish (Mexico)", value: "es-MX" },
  { label: "Portuguese (Brazil)", value: "pt-BR" },
  { label: "German (Germany)", value: "de-DE" },
  { label: "Italian (Italy)", value: "it-IT" },
  { label: "Russian (Russia)", value: "ru-RU" },
  { label: "Japanese (Japan)", value: "ja-JP" },
  { label: "Korean (Korea)", value: "ko-KR" },
  { label: "Chinese (Simplified)", value: "zh-CN" },
  { label: "Chinese (Traditional)", value: "zh-TW" },
];

const interactivitySettings = [
  { key: "allowChat", label: "Chat" },
  { key: "allowPrivateMessages", label: "Private Messages" },
  { key: "allowPolls", label: "Polls" },
  { key: "allowQnA", label: "Q&A" },
  { key: "allowFeedback", label: "Feedback" },
  { key: "allowScreenSharing", label: "Screen Sharing" },
  { key: "allowBreakoutRooms", label: "Breakout Rooms" },
  { key: "allowWhiteboard", label: "Whiteboard" },
  { key: "liveReactions", label: "Live Reactions" },
  { key: "raiseHandFeature", label: "Raise Hand" },
];

const MINUTES_BUFFER = 15;
const MAX_TAGS = 10;
const MAX_DURATION_MINUTES = 180;
const DEFAULT_DURATION_MINUTES = 120;

// Stop words for tag generation
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

// Optimized URL validation - lightweight and non-blocking
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return true;
  
  // Trim whitespace
  url = url.trim();
  
  if (url === "") return true;
  
  try {
    // Quick check for common URL patterns without regex
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Check for basic validity - this is fast and doesn't block
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    }
    
    // Check for common patterns without protocol
    if (url.includes('.') && !url.includes(' ')) {
      // Try to construct URL with https:// for validation
      try {
        new URL(`https://${url}`);
        return true;
      } catch {
        return false;
      }
    }
    
    return false;
  } catch {
    return false;
  }
};

// Validation rules with optimized URL validation
const rules = {
  required: (v) => !!v?.trim() || "This field is required",

  startTime: (v) => {
    if (!v) return true;
    const selected = DateTime.fromISO(v);
    const min = DateTime.now().plus({ minutes: MINUTES_BUFFER });
    if (selected < min) {
      return `Start time must be at least ${MINUTES_BUFFER} minutes from now`;
    }
    return true;
  },

  endTime: (v) => {
    if (!v || !form.value.start) return true;
    const start = DateTime.fromISO(form.value.start);
    const end = DateTime.fromISO(v);
    if (end <= start) {
      return "End time must be after start time";
    }
    const durationMinutes = end.diff(start, "minutes").minutes;
    if (durationMinutes > MAX_DURATION_MINUTES) {
      return `Event cannot exceed ${MAX_DURATION_MINUTES} minutes (${MAX_DURATION_MINUTES / 60} hours)`;
    }
    return true;
  },

  capacity: (v) => {
    if (!v) return true;
    if (v < 1) return "Capacity must be at least 1";
    if (v > 50) return "Maximum capacity is 50 participants";
    if (!Number.isInteger(v)) return "Capacity must be a whole number";
    return true;
  },

  maxTags: (v) => {
    if (!v) return true;
    if (v.length > MAX_TAGS) return `Maximum ${MAX_TAGS} tags allowed`;
    return true;
  },

  // Optimized URL validation - synchronous and fast
  url: (v) => {
    if (!v) return true;
    const isValid = isValidUrl(v);
    return isValid || "Please enter a valid URL (e.g., https://example.com)";
  },
};

// Background URL validation for user feedback (optional)
const validateUrlInBackground = async (event) => {
  const url = event?.target?.value;
  if (url && !isValidUrl(url)) {
    // Optionally show a non-blocking toast notification
    console.log('Invalid URL detected:', url);
  }
};

// Default date calculations
const getDefaultStartDateTime = () => {
  const tomorrow = DateTime.now()
    .plus({ days: 1 })
    .set({ hour: 9, minute: 0, second: 0, millisecond: 0 });
  return tomorrow.toISO({ includeOffset: false });
};

const getAdjustedEndDateTime = (
  startDateTime,
  targetDurationMinutes = DEFAULT_DURATION_MINUTES,
) => {
  if (!startDateTime) return "";
  const start = DateTime.fromISO(startDateTime);
  const duration = Math.min(targetDurationMinutes, MAX_DURATION_MINUTES);
  const end = start.plus({ minutes: duration });
  return end.toISO({ includeOffset: false });
};

// Initialize form with defaults
const initializeForm = () => ({
  title: "",
  description: "",
  organizer: userStore.user?.id || "",
  eventType: "WORKSHOP",
  start: getDefaultStartDateTime(),
  end: getAdjustedEndDateTime(
    getDefaultStartDateTime(),
    DEFAULT_DURATION_MINUTES,
  ),
  location: {
    venue: "",
    address: "",
    virtualLink: "",
    isVirtual: false,
  },
  capacity: 50,
  tags: [],
  interactivity: {
    allowChat: true,
    allowPrivateMessages: false,
    allowPolls: true,
    allowQnA: true,
    allowFeedback: true,
    allowScreenSharing: false,
    allowBreakoutRooms: false,
    allowWhiteboard: false,
    liveReactions: true,
    raiseHandFeature: true,
  },
  branding: {
    logoUrl: "",
    themeColor: "#1772ca",
    bannerBg: "",
  },
  metadata: {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language || "en-US",
  },
});

const form = ref(initializeForm());

// Handle start date/time change with auto-adjustment of end time
const handleStartDateTimeChange = (newStart) => {
  if (!newStart) return;

  const start = DateTime.fromISO(newStart);
  const newEnd = start.plus({ minutes: DEFAULT_DURATION_MINUTES });

  const duration = newEnd.diff(start, "minutes").minutes;
  if (duration > MAX_DURATION_MINUTES) {
    form.value.end = start
      .plus({ minutes: MAX_DURATION_MINUTES })
      .toISO({ includeOffset: false });
  } else {
    form.value.end = newEnd.toISO({ includeOffset: false });
  }
};

// Handle manual end date/time change with validation
const handleEndDateTimeChange = (newEnd) => {
  if (!newEnd || !form.value.start) return;

  const start = DateTime.fromISO(form.value.start);
  const end = DateTime.fromISO(newEnd);
  const duration = end.diff(start, "minutes").minutes;

  if (duration > MAX_DURATION_MINUTES) {
    const adjustedEnd = start.plus({ minutes: MAX_DURATION_MINUTES });
    form.value.end = adjustedEnd.toISO({ includeOffset: false });
  }
};

// Updated generateTags function using dynamic import
const generateTags = async () => {
  const text =
    `${form.value.title || ""} ${form.value.description || ""}`.trim();

  if (!text) {
    generatedTags.value = [];
    return;
  }

  const clean = text.toLowerCase();

  // -------------------------------
  // 1. NLP Extraction (compromise)
  // -------------------------------
  const doc = nlp(clean);

  const nouns = doc.nouns().out("array");
  const adjectives = doc.adjectives().out("array");
  const verbs = doc.verbs().out("array");

  const rawWords = [...nouns, ...adjectives, ...verbs];

  // -------------------------------
  // 2. Strong filtering
  // -------------------------------
  const EXTENDED_STOP_WORDS = new Set([
    ...STOP_WORDS,
    "will",
    "they",
    "them",
    "their",
    "this",
    "that",
    "with",
    "from",
    "have",
    "has",
    "had",
    "were",
    "been",
    "being",
    "into",
    "about",
    "over",
  ]);

  const words = [
    ...new Set(
      rawWords
        .map((w) => w.toLowerCase().trim())
        .filter(
          (w) =>
            w.length > 3 && /^[a-z]+$/.test(w) && !EXTENDED_STOP_WORDS.has(w),
        ),
    ),
  ];

  if (!words.length) {
    generatedTags.value = fallbackTags();
    return;
  }

  // -------------------------------
  // 3. TF-IDF scoring
  // -------------------------------
  try {
    const naturalLib = await loadNatural();

    if (!naturalLib?.TfIdf) {
      generatedTags.value = fallbackTags();
      return;
    }

    const tfidf = new naturalLib.TfIdf();
    tfidf.addDocument(clean);

    const nounSet = new Set(nouns);
    const adjSet = new Set(adjectives);

    const scored = words.map((word) => {
      let score = tfidf.tfidf(word, 0);

      if (nounSet.has(word)) score *= 1.3;
      else if (adjSet.has(word)) score *= 1.1;

      return { word, score };
    });

    // -------------------------------
    // 4. Rank + select
    // -------------------------------
    const finalTags = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((t) => t.word);

    // -------------------------------
    // 5. Ensure meaningful output
    // -------------------------------
    generatedTags.value =
      finalTags.length >= 3
        ? finalTags
        : [...finalTags, ...fallbackTags(finalTags)].slice(0, 5);
  } catch (err) {
    console.error("Tag generation error:", err);
    generatedTags.value = fallbackTags();
  }
};

// Reusable fallback helper
const fallbackTags = (existing = []) => {
  const defaults = ["workshop", "training", "event", "learning", "meeting"];
  return defaults.filter((tag) => !existing.includes(tag)).slice(0, 5);
};

// Remove tag
const removeTag = (tagToRemove) => {
  generatedTags.value = generatedTags.value.filter(
    (tag) => tag !== tagToRemove,
  );
};

// Computed properties
const minStartDateTime = computed(() => {
  const now = DateTime.now().plus({ minutes: MINUTES_BUFFER });
  return now.toISO({ includeOffset: false });
});

const maxStartDateTime = computed(() => {
  const max = DateTime.now().plus({ months: 3 });
  return max.toISO({ includeOffset: false });
});

const isDurationValid = computed(() => {
  if (!form.value.start || !form.value.end) return true;
  const start = DateTime.fromISO(form.value.start);
  const end = DateTime.fromISO(form.value.end);
  const durationMinutes = end.diff(start, "minutes").minutes;
  return durationMinutes <= MAX_DURATION_MINUTES;
});

const stepErrors = computed(() => ({
  step1: !validateStep1() ? "Please complete all required fields" : null,
  step2: !validateStep2() ? "Venue and address are required" : null,
  step3: null,
}));

const isCurrentStepValid = computed(() => {
  if (step.value === 1) return validateStep1();
  if (step.value === 2) return validateStep2();
  return true;
});

const isFormValid = computed(() => {
  return validateStep1() && validateStep2();
});

// Validation functions
const validateStep1 = () => {
  return !!(
    form.value.title?.trim() &&
    form.value.eventType &&
    form.value.start &&
    form.value.end &&
    rules.startTime(form.value.start) === true &&
    rules.endTime(form.value.end) === true
  );
};

const validateStep2 = () => {
  return !!(
    form.value.location.venue?.trim() && form.value.location.address?.trim()
  );
};

const validateStep3 = () => true;

// Methods
const nextStep = () => {
  if (isCurrentStepValid.value) {
    step.value++;
  }
};

const setDefaultInteractivity = () => {
  form.value.interactivity = {
    allowChat: true,
    allowPrivateMessages: false,
    allowPolls: true,
    allowQnA: true,
    allowFeedback: true,
    allowScreenSharing: false,
    allowBreakoutRooms: false,
    allowWhiteboard: false,
    liveReactions: true,
    raiseHandFeature: true,
  };
};

const clearBranding = () => {
  form.value.branding = {
    logoUrl: "",
    themeColor: "",
    bannerBg: "",
  };
};

const createNewEvent = async () => {
  error.value = null;
  success.value = null;

  if (!validateStep1() || !validateStep2()) {
    error.value = "Please complete all required fields";
    return;
  }

  isLoading.value = true;

  try {
    let startDateTime = DateTime.fromISO(form.value.start);
    let endDateTime = DateTime.fromISO(form.value.end);

    if (!startDateTime.isValid || !endDateTime.isValid) {
      throw new Error("Invalid date format");
    }

    const durationMinutes = endDateTime.diff(startDateTime, "minutes").minutes;
    if (durationMinutes > MAX_DURATION_MINUTES) {
      endDateTime = startDateTime.plus({ minutes: MAX_DURATION_MINUTES });
    }

    const payload = {
      title: form.value.title.trim(),
      description: form.value.description?.trim() || null,
      organizer: userStore.user.id,
      eventType: form.value.eventType,
      start: startDateTime.toISO(),
      end: endDateTime.toISO(),
      location: {
        name: form.value.location.venue,
        address: form.value.location.address,
        virtualLink: form.value.location.virtualLink?.trim() || null,
        isVirtual: form.value.location.isVirtual,
      },
      capacity: form.value.capacity || 50,
      tags: generatedTags.value.length ? generatedTags.value : null,
      interactivity: { ...form.value.interactivity },
      metadata: {
        timezone: form.value.metadata.timezone || null,
        language: form.value.metadata.language || null,
      },
      branding: {
        logoUrl: form.value.branding.logoUrl || null,
        themeColor: form.value.branding.themeColor || null,
        bannerBg: form.value.branding.bannerBg || null,
      },
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === null || payload[key] === undefined) {
        delete payload[key];
      }
    });

    if (payload.tags && payload.tags.length === 0) delete payload.tags;
    if (
      payload.metadata &&
      !payload.metadata.timezone &&
      !payload.metadata.language
    )
      delete payload.metadata;
    if (
      payload.branding &&
      !payload.branding.logoUrl &&
      !payload.branding.themeColor &&
      !payload.branding.bannerBg
    )
      delete payload.branding;
 await eventStore.createFreeEvent(payload);

    success.value = "Event created successfully!";

    setTimeout(async () => {
      dialogStore.close();
      await userStore.refreshDashboard();
      router.go("/dashboard");
    }, 1500);
  } catch (err) {
    console.error("Event creation error:", err);
    error.value = err.message || "Failed to create event. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  form.value = initializeForm();
  generatedTags.value = [];
  step.value = 1;
  success.value = null;
  error.value = null;
  touched.value = {
    title: false,
    eventType: false,
    start: false,
    end: false,
    locationName: false,
    locationAddress: false,
  };
};

// Generate initial tags when title/description changes
watch(
  () => [form.value.title, form.value.description, form.value.eventType],
  () => {
    generateTags();
  },
  { deep: true },
);

onMounted(async () => {
  if (userStore.user?.id) {
    form.value.organizer = userStore.user.id;
  }
  await generateTags();
});
</script>

<style scoped>
.event-card {
  border-radius: 18px;
  animation: fadeIn 0.3s ease-in-out;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.stepper-no-scroll {
  background: transparent;
}

.stepper-no-scroll :deep(.v-stepper-window) {
  overflow-y: auto;
  max-height: calc(90vh - 180px);
  scrollbar-width: thin;
}

.stepper-no-scroll :deep(.v-stepper-window::-webkit-scrollbar) {
  width: 6px;
}

.stepper-no-scroll :deep(.v-stepper-window::-webkit-scrollbar-track) {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.stepper-no-scroll :deep(.v-stepper-window::-webkit-scrollbar-thumb) {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

:deep(.v-stepper-header) {
  box-shadow: none;
  padding: 0 16px;
}

:deep(.v-stepper-item) {
  padding: 8px 0;
}

:deep(.v-field) {
  font-size: 0.875rem;
}

:deep(.v-switch) {
  margin-top: 4px;
  margin-bottom: 4px;
}

.fade-in {
  animation: fadeIn 0.35s ease-in-out;
}

.shake {
  animation: shake 0.25s linear;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  50% {
    transform: translateX(4px);
  }
  75% {
    transform: translateX(-4px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>