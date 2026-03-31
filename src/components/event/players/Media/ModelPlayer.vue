<template>
  <v-card>
    <v-img
      height="36rem"
      src="https://t3.ftcdn.net/jpg/03/05/37/66/360_F_305376648_zoCxkyTctDI9df0yrzlDYeXPMjJzIKC7.jpg"
    ></v-img>
<v-card-actions class="justify-center">
  <v-btn 
    text="NEMBio+ Models"
    border
    variant="outlined"
    rounded="sm"
    class="mr-8"
    color="green"
    disabled
  ></v-btn>
<v-tooltip text="Use MEDCal+ Clinical Prediction Models" location="top">
  <template v-slot:activator="{ props }">
    <img
      v-bind="props"
      style="cursor: pointer; border-radius: 9px; height: 3.6rem;"
      @click="openMdCalc"
      src="../../../assets/Screenshot from 2024-09-07 21-28-54.png"
    ></img>
  </template>
</v-tooltip>

</v-card-actions>

  </v-card>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useResourceStore } from "@/stores/resources";

const resourceStore = useResourceStore();

// Slide URLs
const retrievedParamsRaw = resourceStore.resource.content;

// Sort the URLs
// Assuming you have retrieved paramsObjRaw from storage or API
const retrievedParams = JSON.parse(retrievedParamsRaw);
const currentModel = retrievedParams[0];

const patientParams = reactive({});
const isFormValid = ref(false);
const predictionResult = ref(null);
const rules = {
  required: (value) => !!value || "This field is required",
};

const loading = ref(false); // State for managing loader visibility

const submitPrediction = async () => {
  loading.value = true; // Show loader
  const queryParams = [
    {
      currentModelId: currentModel.value.id,
      patientParams: patientParams.value,
    },
  ];
  try {
    const prediction = await resourceStore.getClinicalPrediction(
      JSON.stringify(queryParams)
    ); // Assume this fetches prediction from server
    predictionResult.value = prediction;
  } catch (error) {
    console.error("Error fetching prediction:", error);
  } finally {
    loading.value = false; // Hide loader
  }
};
function openMdCalc() {
  const newWindow = window.open('https://www.mdcalc.com/#Popular', '_blank');
  if (newWindow) {
    newWindow.focus();
  }
}

</script>
