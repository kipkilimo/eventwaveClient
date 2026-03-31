<script setup lang="ts">
import { ref, computed } from 'vue'
import { subDays, format as dateFnsFormat } from 'date-fns'

const refreshing = ref(false)
const error = ref<string | null>(null)
const lastUpdate = ref(new Date())
const timeRange = ref({ label: 'Last 7 days', value: '7d' })
const timeRanges = [
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'All time', value: 'all' }
]

const selectedQuestionId = ref<string>('')
const selectedSentiment = ref<string>('')

// ===== DUMMY ANALYTICS DATA =====
const analytics = ref<any>({
  totalSubmissions: 124,
  averageRating: 4.2,
  completionRate: 0.83,
  submissionTrend: [
    { date: dateFnsFormat(subDays(new Date(), 6), 'yyyy-MM-dd'), count: 10 },
    { date: dateFnsFormat(subDays(new Date(), 5), 'yyyy-MM-dd'), count: 12 },
    { date: dateFnsFormat(subDays(new Date(), 4), 'yyyy-MM-dd'), count: 9 },
    { date: dateFnsFormat(subDays(new Date(), 3), 'yyyy-MM-dd'), count: 15 },
    { date: dateFnsFormat(subDays(new Date(), 2), 'yyyy-MM-dd'), count: 14 },
    { date: dateFnsFormat(subDays(new Date(), 1), 'yyyy-MM-dd'), count: 16 },
    { date: dateFnsFormat(new Date(), 'yyyy-MM-dd'), count: 18 }
  ],
  sentimentDistribution: {
    veryPositive: 50,
    positive: 30,
    neutral: 20,
    negative: 15,
    veryNegative: 5,
    total: 120
  },
  questionAnalytics: [
    { questionId: 'q1', questionText: 'How satisfied are you with the event?', averageRating: 4.5, responseCount: 30 },
    { questionId: 'q2', questionText: 'How useful was the session?', averageRating: 4.2, responseCount: 28 },
    { questionId: 'q3', questionText: 'Rate the speakers', averageRating: 4.0, responseCount: 25 },
    { questionId: 'q4', questionText: 'Rate the venue', averageRating: 3.8, responseCount: 20 },
    { questionId: 'q5', questionText: 'Would you recommend this event?', averageRating: 4.3, responseCount: 32 }
  ]
})

// ===== COMPUTED PROPERTIES =====
const submissionTrend = computed(() => {
  const trend = analytics.value.submissionTrend
  if (trend.length < 2) return 0
  const current = trend[trend.length - 1].count
  const previous = trend[trend.length - 2].count
  if (previous === 0) return 100
  return ((current - previous) / previous) * 100
})

const ratingTrend = computed(() => analytics.value.averageRating)

const positiveSentimentCount = computed(() => analytics.value.sentimentDistribution.positive + analytics.value.sentimentDistribution.veryPositive)
const neutralSentimentCount = computed(() => analytics.value.sentimentDistribution.neutral)
const negativeSentimentCount = computed(() => analytics.value.sentimentDistribution.negative + analytics.value.sentimentDistribution.veryNegative)

const sentimentItems = computed(() => {
  const dist = analytics.value.sentimentDistribution
  const total = dist.total || 1
  return [
    { type: 'very-positive', label: 'Very Positive', count: dist.veryPositive, percentage: ((dist.veryPositive / total) * 100).toFixed(0), color: '#4CAF50', icon: 'mdi-emoticon-excited' },
    { type: 'positive', label: 'Positive', count: dist.positive, percentage: ((dist.positive / total) * 100).toFixed(0), color: '#8BC34A', icon: 'mdi-emoticon-happy' },
    { type: 'neutral', label: 'Neutral', count: dist.neutral, percentage: ((dist.neutral / total) * 100).toFixed(0), color: '#FFC107', icon: 'mdi-emoticon-neutral' },
    { type: 'negative', label: 'Negative', count: dist.negative, percentage: ((dist.negative / total) * 100).toFixed(0), color: '#FF9800', icon: 'mdi-emoticon-sad' },
    { type: 'very-negative', label: 'Very Negative', count: dist.veryNegative, percentage: ((dist.veryNegative / total) * 100).toFixed(0), color: '#F44336', icon: 'mdi-emoticon-angry' }
  ]
})

const topQuestions = computed(() => analytics.value.questionAnalytics)

const submissionTrendData = computed(() => {
  return analytics.value.submissionTrend.map((item, index) => ({
    date: item.date,
    value: (item.count / 10) + 3,
    label: dateFnsFormat(new Date(item.date), 'MMM dd'),
    isCurrent: index === analytics.value.submissionTrend.length - 1
  }))
})

const last7Days = computed(() => {
  return analytics.value.submissionTrend.map(item => ({
    date: item.date,
    label: dateFnsFormat(new Date(item.date), 'EEE'),
    count: item.count
  }))
})

const maxDailySubmissions = computed(() => Math.max(...last7Days.value.map(d => d.count), 1))

// ===== HELPERS =====
const formatDate = (date: Date) => dateFnsFormat(date, 'HH:mm:ss')
const formatNumber = (num: number) => new Intl.NumberFormat().format(num)
const truncateText = (text: string, maxLength: number) => text.length > maxLength ? text.substring(0, maxLength) + '...' : text

const refreshAnalytics = async () => {
  refreshing.value = true
  error.value = null
  setTimeout(() => {
    refreshing.value = false
    lastUpdate.value = new Date()
  }, 1000)
}
</script>
