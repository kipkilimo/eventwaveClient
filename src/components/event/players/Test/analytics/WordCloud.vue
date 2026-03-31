<template>
    <div id="wc">
        <vue-word-cloud :words="processedWords" :color="colorFn" font-family="Roboto" :rotation-unit="rotationUnit"
            :animation-duration="2000" :font-size-ratio="5" style="height: 480px; width: 640px;" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import VueWordCloud from 'vuewordcloud';

const props = defineProps({
    responses: {
        type: Array,
        required: true,
    },
});

const colorFn = ([, weight]) => (weight > 10 ? 'DeepPink' : weight > 5 ? 'RoyalBlue' : 'Indigo');
const rotationUnit = 'deg';

const processedWords = computed(() => {
    const wordCounts = {};

    props.responses.forEach((response) => {
        const words = response.toLowerCase().split(/\s+/);
        words.forEach((word) => {
            if (word && word.length > 2) { //Filter out words with less than 3 characters
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        });
    });

    return Object.keys(wordCounts).map((word) => [word, wordCounts[word]]);
});


</script>

<style>
#wc {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 60px;
}
</style>