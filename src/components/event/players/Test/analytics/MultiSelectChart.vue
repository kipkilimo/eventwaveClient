<template>
    <div class="multi-select-chart">
        <canvas ref="chartRef"></canvas>

        <!-- Response Details Table -->
        <v-table v-if="showDetails" class="mt-4">
            <thead>
                <tr>
                    <th>Option</th>
                    <th>Count</th>
                    <th>Percentage</th>
                    <th>Correct</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(option, index) in options" :key="index">
                    <td>{{ option }}</td>
                    <td>{{ responseCounts[index] }}</td>
                    <td>{{ responsePercentages[index] }}%</td>
                    <td>
                        <v-icon :color="isCorrectOption(option) ? 'success' : 'error'">
                            {{ isCorrectOption(option) ? 'mdi-check' : 'mdi-close' }}
                        </v-icon>
                    </td>
                </tr>
            </tbody>
        </v-table>

        <v-btn class="mt-2" size="small" variant="text" @click="showDetails = !showDetails">
            {{ showDetails ? 'Hide Details' : 'Show Details' }}
        </v-btn>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
    responses: {
        type: Array,
        required: true
    },
    options: {
        type: Array,
        required: true
    },
    correctAnswers: {
        type: Array,
        default: () => []
    }
})

const chartRef = ref(null)
let chartInstance = null
const showDetails = ref(false)

// Process responses to count selections for each option
const responseCounts = computed(() => {
    const counts = new Array(props.options.length).fill(0)

    props.responses.forEach(response => {
        response.selectedAnswers?.forEach(answer => {
            const index = props.options.indexOf(answer)
            if (index !== -1) {
                counts[index]++
            }
        })
    })

    return counts
})

const responsePercentages = computed(() => {
    const totalResponses = props.responses.length
    return responseCounts.value.map(count =>
        totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0
    )
})

const isCorrectOption = (option) => {
    return props.correctAnswers?.includes(option)
}

const renderChart = () => {
    if (!chartRef.value) return

    const ctx = chartRef.value.getContext('2d')
    if (chartInstance) chartInstance.destroy()

    // Prepare data for the chart
    const backgroundColors = props.options.map(option =>
        isCorrectOption(option) ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)'
    )

    const borderColors = props.options.map(option =>
        isCorrectOption(option) ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
    )

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: props.options,
            datasets: [{
                label: 'Number of selections',
                data: responseCounts.value,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of selections'
                    },
                    ticks: {
                        precision: 0
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Answer Options'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const totalSelections = responseCounts.value.reduce((a, b) => a + b, 0)
                            const percentage = totalSelections > 0
                                ? Math.round((context.raw / totalSelections) * 100)
                                : 0
                            return `${context.raw} selections (${percentage}% of total selections)`
                        },
                        footer: (context) => {
                            const option = props.options[context[0].dataIndex]
                            return isCorrectOption(option)
                                ? '✓ Correct Answer'
                                : '✗ Incorrect Answer'
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    })
}

// Watch for changes and re-render chart
watch(() => [props.responses, props.options], () => {
    renderChart()
}, { deep: true })

onMounted(() => {
    renderChart()
})

onBeforeUnmount(() => {
    if (chartInstance) chartInstance.destroy()
})
</script>

<style scoped>
.multi-select-chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
  position: relative;
}

canvas {
  width: 100% !important;
  height: 300px !important;
}

.v-table {
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
</style>