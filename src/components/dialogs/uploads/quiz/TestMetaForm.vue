<template>
  <v-container>
    <v-stepper v-model="step" vertical>
      <!-- Exam Details Step -->
      <v-stepper-step step="1" header="Exam Details">
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          v-if="showingDateTimePicker"
        >
          <v-row>
            <v-col cols="6">
              <v-select
                v-model="selectedHour"
                :items="hourOptions"
                label="Select Hours Duration"
                required
                :menu-props="{ maxHeight: 'none' }"
              ></v-select>
            </v-col>

            <v-col cols="6">
              <v-select
                v-model="selectedMinute"
                :items="minuteOptions"
                label="Select Minutes"
                required
                :menu-props="{ maxHeight: 'none' }"
              ></v-select>
            </v-col>
          </v-row>

          <p>Exam Duration: {{ formattedDuration }}</p>
          <v-divider />
          <v-row>
            <v-col cols="5">
              <v-time-picker
                v-model="examStartTime"
                :allowed-minutes="allowedMinutes"
                format="24hr"
                :min="minTime"
                hint="Exam Start Time"
                label="Select Exam Start Time"
                required
              ></v-time-picker>
            </v-col>
            <v-col cols="5">
              <v-date-picker
                v-model="examDate"
                label="Select Exam Date"
                required
              ></v-date-picker>
            </v-col>

            <v-col cols="2">
              <v-select
                :items="timeZones"
                density="compact"
                v-model="timeZone"
                label="Time zone"
              ></v-select>
            </v-col>
          </v-row>

          <p>
            Exam Date:
            {{ combineDateAndTime(examDate, examStartTime) }} | Duration:
            {{ formattedDuration }} | Ends at {{ examEndTime }}
          </p>
          <v-divider />
          <v-card-actions>
            <v-btn @click="calculateEndTime">Set End Time</v-btn>
            <v-btn @click="showExamCreator" :disabled="!isDateTimeValid">
              Next
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-stepper-step>

      <!-- Test Creation Step -->
      <v-stepper-step step="2" header="Test Creation">
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          v-if="showingExamCreator"
        >
          <v-select
            v-model="selectedTypes"
            :items="testTypes"
            label="Select Test Type(s)"
            multiple
            required
            chips
            clearable
            solo
            :menu-props="{ maxHeight: 'none' }"
          ></v-select>

          <div v-for="(type, index) in selectedTypes" :key="index">
            <v-text-field
              v-model="numberOfQuestions[type]"
              :label="`Enter Number of ${type} Questions`"
              type="number"
              :max="getMaxQuestions(type)"
              min="1"
              required
            ></v-text-field>

            <v-textarea
              v-if="isSectionAType(type)"
              v-model="markingSchemes[type]"
              :label="`Enter Marking Scheme for ${type}`"
              :placeholder="getMarkingSchemePlaceholder(type)"
              :rules="getMarkingSchemeRules(type)"
              required
            ></v-textarea>
          </div>
          <v-card-actions>
            <v-btn @click="showDateTimePicker">Previous</v-btn>
          </v-card-actions>
        </v-form>
      </v-stepper-step>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="outlined"
          width="7.5rem"
          @click="submitForm"
          :disabled="!isTestCreationValid"
        >
          Submit
        </v-btn>
        <v-spacer />
      </v-card-actions>
    </v-stepper>

    <v-dialog max-width="500" v-model="uploadingQuestionsSet">
      <v-card title="Upload Exam Set Questions">
        <v-divider />
        <TestUploader />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import { VTimePicker } from "vuetify/labs/VTimePicker";

const valid = ref(false);
const step = ref(1);
const selectedTypes = ref([]);
const numberOfQuestions = ref({});
const markingSchemes = ref({});
const testTypes = ["SCQ", "MCQ", "ATF", "ETF", "VSAQ", "SAQ", "LEQ"];
const testMeta = ref([]);
const sectionAAnswerKeys = ref([]);
const uploadingQuestionsSet = ref(false);
const formDataJson = ref("");
const showingDateTimePicker = ref(true);
const showingExamCreator = ref(false);
const timeZonesAll = [
  { name: "GMT", region: "Greenwich Mean Time", iana: "GMT" },
  { name: "CET", region: "Central European Time", iana: "Europe/Berlin" },
  { name: "EET", region: "Eastern European Time", iana: "Europe/Helsinki" },
  { name: "CAT", region: "Central Africa Time", iana: "Africa/Harare" },
  { name: "WAT", region: "West Africa Time", iana: "Africa/Lagos" },
  { name: "EAT", region: "East Africa Time", iana: "Africa/Nairobi" },
  { name: "EST", region: "Eastern Standard Time", iana: "America/New_York" },
  { name: "PST", region: "Pacific Standard Time", iana: "America/Los_Angeles" },
  { name: "IST", region: "India Standard Time", iana: "Asia/Kolkata" },
];

// Example usage 

const timeZones = computed(() => {
  const tz = timeZonesAll.map((z) => {
    return z.region;
  });
  return tz;
});
const examStartTime = ref(null);
const examDate = ref(new Date(Date.now() + 86400000));
const examDuration = ref("");
const timeZone = ref("");
const examEndTime = ref(null);
const allowedMinutes = (val) => [0, 15, 30, 45].includes(val);
const selectedHour = ref("0");
const selectedMinute = ref("00");
const hourOptions = ["0", "1", "2", "3", "4"];
const minuteOptions = ["00", "15", "30", "45"];

function showDateTimePicker() {
  showingDateTimePicker.value = true;
  showingExamCreator.value = false;
}

function showExamCreator() {
  showingDateTimePicker.value = false;
  showingExamCreator.value = true;
}

const formattedDuration = computed(() => {
  const hours = parseInt(selectedHour.value || "0", 10);
  const minutes = parseInt(selectedMinute.value || "0", 10);
  if (isNaN(hours) || isNaN(minutes)) return "Invalid duration";
  const hourText = hours === 1 ? "hr" : "hrs";
  const minuteText = minutes === 1 ? "min" : "mins";
  examDuration.value = `${hours} ${hourText} : ${minutes} ${minuteText}`;
  return `${hours} ${hourText} : ${minutes} ${minuteText}`;
});

function calculateEndTime() {
  if (!examStartTime.value || !examDuration.value) return;
  const startTime = examStartTime.value;
  const duration = examDuration.value;
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const durationParts = duration.match(/(\d+)\s*hrs?\s*:\s*(\d+)\s*mins?/);
  if (!durationParts) return;
  const durationHours = parseInt(durationParts[1], 10);
  const durationMinutes = parseInt(durationParts[2], 10);
  let totalMinutes = startMinutes + durationMinutes;
  let totalHours = startHours + durationHours + Math.floor(totalMinutes / 60);
  totalMinutes = totalMinutes % 60;
  totalHours = totalHours % 24;
  const endHours = String(totalHours).padStart(2, "0");
  const endMinutes = String(totalMinutes).padStart(2, "0");
  examEndTime.value = `${endHours}:${endMinutes}`;
  return `${endHours}:${endMinutes}`;
}

const isDateTimeValid = computed(() => {
  return (
    examDate.value &&
    examStartTime.value &&
    selectedHour.value &&
    selectedMinute.value &&
    formattedDuration.value &&
    examEndTime.value
  );
});

const isTestCreationValid = computed(() => {
  return (
    selectedTypes.value.length > 0 &&
    Object.keys(numberOfQuestions.value).length ===
      selectedTypes.value.length &&
    selectedTypes.value.every((type) =>
      isValidMarkingScheme(type, markingSchemes.value[type])
    )
  );
});

function combineDateAndTime(isoDate, time) {
  const date = new Date(isoDate);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateTime = new Date(`${formattedDate} ${time}`);
  const formattedTime = dateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${formattedDate}, ${formattedTime}`;
}

function getMaxQuestions(type) {
  switch (type) {
    case "SCQ":
      return 200;
    case "MCQ":
      return 60;
    case "ATF":
      return 20;
    case "ETF":
      return 5;
    case "VSAQ":
      return 10;
    case "SAQ":
      return 7;
    case "LEQ":
      return 2;
    default:
      return 0;
  }
}

function getMarkingSchemePlaceholder(type) {
  switch (type) {
    case "SCQ":
      return "Enter answers in the format CBABCDE..., no spaces from first to last";
    case "MCQ":
      return "Enter correct answers as letters BCD#CDE ..., each question separated by #, from first to last";
    case "ATF":
      return "Enter a string of TFTTF..., from first to last";
    case "ETF":
      return "Enter answers as TFTFT#TTTTT#FTFTT..., from first to last";
    default:
      return "Upload image files";
  }
}

function getMarkingSchemeRules(type) {
  return [
    (v) => !!v || "Marking scheme is required.",
    (v) => isValidMarkingScheme(type, v) || `Invalid ${type} marking scheme.`,
  ];
}

function isValidMarkingScheme(type, markingScheme) {
  const numberOfQs = numberOfQuestions.value[type];
  switch (type) {
    case "SCQ":
      return (
        markingScheme.length === Number(numberOfQs) &&
        /^[ABCDE]+$/.test(markingScheme)
      );
    case "MCQ":
      const answers = markingScheme.split("#");
      return (
        answers.length === Number(numberOfQs) &&
        answers.every((ans) => /^[ABCDE]+$/.test(ans))
      );
    case "ATF":
      return (
        markingScheme.length === Number(numberOfQs) &&
        /^[TF]+$/.test(markingScheme)
      );
    case "ETF":
      const totalLength = 5 * Number(numberOfQs);
      const etfAnswers = markingScheme.split("#");
      return (
        markingScheme.replace(/#/g, "").length === totalLength &&
        etfAnswers.every((ans) => /^[TF]+$/.test(ans) && ans.length === 5)
      );
    default:
      return true;
  }
}

function isSectionAType(type) {
  return ["SCQ", "MCQ", "ATF", "ETF"].includes(type);
}

function submitForm() {
  selectedTypes.value.forEach((type) => {
    const numberOfQuestionsForType = numberOfQuestions.value[type];
    const markingSchemeForType = markingSchemes.value[type];
    const existingIndex = testMeta.value.findIndex(
      (meta) => meta.testType === type
    );
    if (existingIndex > -1) {
      testMeta.value[existingIndex].numberOfQuestions =
        numberOfQuestionsForType;
    } else {
      testMeta.value.push({
        testType: type,
        numberOfQuestions: numberOfQuestionsForType,
      });
    }
    if (isSectionAType(type)) {
      sectionAAnswerKeys.value.push({
        testType: type,
        markingScheme: markingSchemeForType,
      });
    }
  });
  if (valid.value) {
    function getTimeZoneAbbreviation(region) {
      // Find the time zone with the matching region
      const timeZone = timeZonesAll.find((tz) => tz.region === region);

      // Return the name (abbreviation) if found, otherwise return null or an error message
      return timeZone ? timeZone.name : null;
    }

    // Example usage
    const selectedRegion = timeZone.value;
    const timeZoneAbbreviation = getTimeZoneAbbreviation(selectedRegion);
    console.log(timeZoneAbbreviation); // Output: EAT

    formDataJson.value = JSON.stringify({
      examDate: examDate.value,
      examStartTime: `${examStartTime.value} ${timeZoneAbbreviation}`,
      examDuration: examDuration.value,
      examEndTime: examEndTime.value,
      selectedTypes: selectedTypes.value,
      numberOfQuestions: numberOfQuestions.value,
      markingSchemes: markingSchemes.value,
      testMeta: testMeta.value,
      sectionAAnswerKeys: sectionAAnswerKeys.value,
    });
    console.log("Form Submitted", formDataJson.value);
    localStorage.setItem("examMetaInfo", formDataJson.value);
    uploadingQuestionsSet.value = true;
  }
}
</script>
