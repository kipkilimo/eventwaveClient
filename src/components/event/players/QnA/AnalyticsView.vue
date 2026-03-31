<template>
  <v-container fluid class="pa-0 analytics-dashboard">
    <!-- COMPACT HEADER -->
    <v-card class="mx-2 mt-2 mb-1" flat>
      <v-card-text class="pa-2 d-flex align-center">
        <v-icon color="primary" size="small" class="mr-2">mdi-chart-box</v-icon>
        <span class="text-subtitle-2 font-weight-medium">Q&A Analytics</span>
        <v-spacer></v-spacer>
        <v-chip size="x-small" variant="outlined">
          <v-icon size="x-small" class="mr-1">mdi-refresh</v-icon>
          Live
        </v-chip>
      </v-card-text>
    </v-card>

    <!-- NO DATA STATE -->
    <div v-if="!hasQuestions && !loading" class="text-center py-16">
      <v-icon size="x-large" color="grey" class="mb-4">mdi-chart-line-variant</v-icon>
      <div class="text-h6 text-grey mb-2">No Q&A Data Available</div>
      <div class="text-body-2 text-grey">
        When questions are asked and answered, analytics will appear here.
      </div>
    </div>

    <!-- LOADING STATE -->
    <div v-else-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="48" />
      <div class="text-caption text-grey mt-3">Loading analytics data...</div>
    </div>

    <!-- ANALYTICS CONTENT -->
    <template v-else>
      <!-- COMPACT METRICS GRID -->
      <v-row class="ma-1" dense>
        <v-col cols="6" sm="3">
          <v-card variant="flat" class="text-center pa-2 h-100 card-metric">
            <div class="text-h5 font-weight-bold text-primary">{{ totalQuestions }}</div>
            <div class="text-caption text-grey mt-1">Questions</div>
            <v-divider class="my-1"></v-divider>
            <div class="d-flex align-center justify-center">
              <v-icon size="x-small" color="green" class="mr-1">mdi-trending-up</v-icon>
              <span class="text-caption">{{ questionGrowth }}%</span>
            </div>
          </v-card>
        </v-col>

        <v-col cols="6" sm="3">
          <v-card variant="flat" class="text-center pa-2 h-100 card-metric">
            <div class="text-h5 font-weight-bold text-green">{{ answeredQuestions }}</div>
            <div class="text-caption text-grey mt-1">Answered</div>
            <v-divider class="my-1"></v-divider>
            <div class="d-flex align-center justify-center">
              <v-progress-linear
                :model-value="responseRate"
                height="6"
                color="green"
                rounded
                class="progress-compact"
              ></v-progress-linear>
              <span class="text-caption ml-1">{{ responseRate }}%</span>
            </div>
          </v-card>
        </v-col>

        <v-col cols="6" sm="3">
          <v-card variant="flat" class="text-center pa-2 h-100 card-metric">
            <div class="text-h5 font-weight-bold text-orange">{{ pendingQuestions }}</div>
            <div class="text-caption text-grey mt-1">Pending</div>
            <v-divider class="my-1"></v-divider>
            <v-chip
              size="x-small"
              :color="pendingQuestions > 5 ? 'orange' : 'green'"
              variant="flat"
              density="compact"
            >
              {{ pendingQuestions > 5 ? 'Review' : 'Good' }}
            </v-chip>
          </v-card>
        </v-col>

        <v-col cols="6" sm="3">
          <v-card variant="flat" class="text-center pa-2 h-100 card-metric">
            <div class="text-h5 font-weight-bold text-amber">{{ averageSatisfaction.toFixed(1) }}</div>
            <div class="text-caption text-grey mt-1">Satisfaction</div>
            <v-divider class="my-1"></v-divider>
            <v-rating
              :model-value="averageSatisfaction"
              half-increments
              readonly
              size="x-small"
              density="compact"
              color="amber"
            ></v-rating>
          </v-card>
        </v-col>
      </v-row>

      <!-- SATISFACTION & TOP PERFORMERS IN SINGLE ROW -->
      <v-row class="ma-1" dense>
        <!-- SATISFACTION DISTRIBUTION -->
        <v-col cols="12" md="8">
          <v-card variant="flat" class="h-100">
            <v-card-text class="pa-2">
              <div class="d-flex align-center mb-2">
                <v-icon size="small" color="green" class="mr-2">mdi-chart-bar</v-icon>
                <span class="text-caption font-weight-medium">Satisfaction Distribution</span>
                <v-spacer></v-spacer>
                <span class="text-caption text-grey">{{ totalRatings }} ratings</span>
              </div>
              
              <!-- COMPACT SATISFACTION BARS -->
              <div class="satisfaction-mini-bars">
                <div v-for="(count, index) in satisfactionDistribution" :key="index" class="mb-2">
                  <div class="d-flex align-center">
                    <div class="star-label">
                      <div class="d-flex align-center">
                        <v-icon size="x-small" color="amber" class="mr-1">mdi-star</v-icon>
                        <span class="text-caption">{{ index + 1 }}</span>
                      </div>
                    </div>
                    <v-progress-linear
                      :model-value="answeredQuestions > 0 ? (count / answeredQuestions) * 100 : 0"
                      height="16"
                      :color="getSatisfactionColor(index + 1)"
                      rounded
                      class="ml-2"
                    >
                      <template v-slot:default="{ value }">
                        <div class="text-caption font-weight-bold white--text px-1">
                          {{ count }}
                        </div>
                      </template>
                    </v-progress-linear>
                  </div>
                </div>
              </div>

              <!-- SATISFACTION SUMMARY CHIPS -->
              <div class="d-flex justify-space-between mt-3">
                <v-chip size="x-small" color="green" variant="flat" density="compact">
                  <v-icon size="x-small" class="mr-1">mdi-thumb-up</v-icon>
                  {{ highSatisfactionCount }} High
                </v-chip>
                <v-chip size="x-small" color="orange" variant="flat" density="compact">
                  <v-icon size="x-small" class="mr-1">mdi-minus</v-icon>
                  {{ mediumSatisfactionCount }} Medium
                </v-chip>
                <v-chip size="x-small" color="red" variant="flat" density="compact">
                  <v-icon size="x-small" class="mr-1">mdi-thumb-down</v-icon>
                  {{ lowSatisfactionCount }} Low
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- TOP PERFORMERS -->
        <v-col cols="12" md="4">
          <v-card variant="flat" class="h-100">
            <v-card-text class="pa-2">
              <div class="d-flex align-center mb-2">
                <v-icon size="small" color="blue" class="mr-2">mdi-trophy</v-icon>
                <span class="text-caption font-weight-medium">Top Answers</span>
                <v-spacer></v-spacer>
                <v-icon size="x-small" color="grey">mdi-information</v-icon>
              </div>
              
              <v-list density="compact" class="pa-0">
                <v-list-item
                  v-for="(performer, index) in topPerformers"
                  :key="performer.id"
                  :class="index < 3 ? 'mb-1' : ''"
                  class="pa-0"
                >
                  <template v-slot:prepend>
                    <v-avatar :color="index < 3 ? 'amber' : 'grey-lighten-2'" size="24">
                      <span v-if="index < 3" class="text-caption font-weight-bold white--text">
                        {{ index + 1 }}
                      </span>
                      <v-icon v-else size="x-small" color="white">mdi-numeric</v-icon>
                    </v-avatar>
                  </template>
                  
                  <div class="d-flex flex-column ml-2 performer-info">
                    <span class="text-caption font-weight-medium truncate-text">
                      {{ performer.name }}
                    </span>
                    <span class="text-caption text-grey">
                      {{ performer.answeredCount }} answers
                    </span>
                  </div>
                  
                  <template v-slot:append>
                    <div class="d-flex align-center">
                      <v-rating
                        :model-value="performer.avgScore"
                        readonly
                        size="x-small"
                        density="compact"
                        color="amber"
                        class="mr-1"
                      ></v-rating>
                      <span class="text-caption font-weight-medium">{{ performer.avgScore.toFixed(1) }}</span>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- TIMELINE & POPULAR TAGS -->
      <v-row class="ma-1" dense>
        <!-- HOURLY ACTIVITY -->
        <v-col cols="12" md="6">
          <v-card variant="flat" class="h-100">
            <v-card-text class="pa-2">
              <div class="d-flex align-center mb-2">
                <v-icon size="small" color="purple" class="mr-2">mdi-clock</v-icon>
                <span class="text-caption font-weight-medium">Activity Timeline</span>
                <v-spacer></v-spacer>
                <v-chip size="x-small" variant="outlined" density="compact">
                  <v-icon size="x-small" class="mr-1">mdi-chart-line</v-icon>
                  Peak: {{ peakHour }}
                </v-chip>
              </div>
              
              <div class="mini-timeline">
                <div class="timeline-hour-bars">
                  <div
                    v-for="hour in compactHourlyDistribution"
                    :key="hour.hour"
                    class="hour-bar"
                    :style="{ height: `${hour.height}px` }"
                    :title="`${hour.hour}:00 - ${hour.count} questions`"
                  >
                    <div
                      class="hour-fill"
                      :style="{ height: `${hour.answeredPercent}%` }"
                    ></div>
                  </div>
                </div>
                <div class="d-flex justify-space-between mt-1">
                  <span class="text-caption text-grey">0h</span>
                  <span class="text-caption text-grey">12h</span>
                  <span class="text-caption text-grey">23h</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- POPULAR TAGS -->
        <v-col cols="12" md="6">
          <v-card variant="flat" class="h-100">
            <v-card-text class="pa-2">
              <div class="d-flex align-center mb-2">
                <v-icon size="small" color="indigo" class="mr-2">mdi-tag-multiple</v-icon>
                <span class="text-caption font-weight-medium">Popular Tags</span>
                <v-spacer></v-spacer>
                <span class="text-caption text-grey">{{ popularTags.length }} tags</span>
              </div>
              
              <div class="tag-cloud">
                <v-chip
                  v-for="(tag, index) in popularTags"
                  :key="tag"
                  :color="getTagColor(index)"
                  size="x-small"
                  variant="flat"
                  density="compact"
                  class="ma-1"
                >
                  <v-icon size="x-small" class="mr-1">mdi-tag</v-icon>
                  {{ tag }}
                </v-chip>
              </div>
              
              <!-- QUESTION STATUS SUMMARY -->
              <v-divider class="my-2"></v-divider>
              <div class="d-flex justify-space-around">
                <div class="text-center">
                  <div class="text-caption font-weight-medium">{{ recentQuestionsCount }}</div>
                  <div class="text-caption text-grey">Recent</div>
                </div>
                <v-divider vertical></v-divider>
                <div class="text-center">
                  <div class="text-caption font-weight-medium text-green">{{ pinnedQuestionsCount }}</div>
                  <div class="text-caption text-grey">Pinned</div>
                </div>
                <v-divider vertical></v-divider>
                <div class="text-center">
                  <div class="text-caption font-weight-medium text-orange">{{ anonymousQuestionsCount }}</div>
                  <div class="text-caption text-grey">Anonymous</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- QUICK STATS ROW -->
      <v-row class="ma-1" dense>
        <v-col cols="12">
          <v-card variant="flat">
            <v-card-text class="pa-2">
              <div class="d-flex flex-wrap justify-space-around quick-stats">
                <div class="text-center pa-1 stat-item">
                  <div class="text-caption font-weight-medium">
                    {{ avgResponseTime }}
                  </div>
                  <div class="text-caption text-grey">Avg. Response</div>
                </div>
                <v-divider vertical v-if="$vuetify.display.mdAndUp"></v-divider>
                <div class="text-center pa-1 stat-item">
                  <div class="text-caption font-weight-medium">
                    {{ engagementRate }}%
                  </div>
                  <div class="text-caption text-grey">Engagement</div>
                </div>
                <v-divider vertical v-if="$vuetify.display.mdAndUp"></v-divider>
                <div class="text-center pa-1 stat-item">
                  <div class="text-caption font-weight-medium">
                    {{ topQuestionUpvotes }}
                  </div>
                  <div class="text-caption text-grey">Top Upvotes</div>
                </div>
                <v-divider vertical v-if="$vuetify.display.mdAndUp"></v-divider>
                <div class="text-center pa-1 stat-item">
                  <div class="text-caption font-weight-medium">
                    {{ completionRate }}%
                  </div>
                  <div class="text-caption text-grey">Complete</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useQnAStore } from "@/stores/qna";
import type { QnA } from "@/stores/qna";
import { format, parseISO, differenceInHours } from "date-fns";

// --------------------
// Stores
// --------------------
const qnaStore = useQnAStore();
const { loading, allQnA } = storeToRefs(qnaStore);

// --------------------
// Types
// --------------------
interface Performer {
  id: string;
  name: string;
  role: string;
  avgScore: number;
  answeredCount: number;
}

// --------------------
// Computed Properties
// --------------------
const hasQuestions = computed(() => allQnA.value.length > 0);
const totalQuestions = computed(() => allQnA.value.length);
const answeredQuestions = computed(() => allQnA.value.filter(q => q.isAnswered).length);
const pendingQuestions = computed(() => allQnA.value.filter(q => !q.isAnswered).length);

const responseRate = computed(() => {
  if (totalQuestions.value === 0) return 0;
  return Math.round((answeredQuestions.value / totalQuestions.value) * 100);
});

const questionGrowth = computed(() => {
  // Simple growth calculation based on recent questions
  const recentHours = 24; // Last 24 hours
  const now = new Date();
  const recentQuestions = allQnA.value.filter(q => {
    const created = parseISO(q.createdAt);
    return differenceInHours(now, created) <= recentHours;
  }).length;
  
  if (allQnA.value.length === 0) return 0;
  return Math.round((recentQuestions / allQnA.value.length) * 100);
});

const averageSatisfaction = computed(() => {
  const answered = allQnA.value.filter(q => q.isAnswered);
  if (answered.length === 0) return 0;
  
  let totalScore = 0;
  let totalRatings = 0;
  
  answered.forEach(q => {
    if (q.satisfactionScores && q.satisfactionScores.length > 0) {
      const questionScore = q.satisfactionScores.reduce((sum, score) => sum + score.score, 0);
      totalScore += questionScore / q.satisfactionScores.length;
      totalRatings += q.satisfactionScores.length;
    }
  });
  
  return totalRatings > 0 ? totalScore / answered.length : 0;
});

const satisfactionDistribution = computed(() => {
  const distribution = [0, 0, 0, 0, 0];
  
  allQnA.value.forEach(q => {
    if (q.satisfactionScores) {
      q.satisfactionScores.forEach(score => {
        if (score.score >= 1 && score.score <= 5) {
          distribution[score.score - 1]++;
        }
      });
    }
  });
  
  return distribution;
});

const highSatisfactionCount = computed(() => {
  return allQnA.value.filter(q => {
    const scores = q.satisfactionScores;
    if (!scores || scores.length === 0) return false;
    const avg = scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
    return avg >= 4;
  }).length;
});

const mediumSatisfactionCount = computed(() => {
  return allQnA.value.filter(q => {
    const scores = q.satisfactionScores;
    if (!scores || scores.length === 0) return false;
    const avg = scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
    return avg >= 3 && avg < 4;
  }).length;
});

const lowSatisfactionCount = computed(() => {
  return allQnA.value.filter(q => {
    const scores = q.satisfactionScores;
    if (!scores || scores.length === 0) return false;
    const avg = scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
    return avg < 3;
  }).length;
});

const totalRatings = computed(() => {
  return allQnA.value.reduce((sum, q) => sum + (q.satisfactionScores?.length || 0), 0);
});

const topPerformers = computed(() => {
  const performers = new Map<string, Performer>();
  
  allQnA.value.forEach(q => {
    if (q.isAnswered && q.answeredBy) {
      const performerId = q.answeredBy.id;
      const existing = performers.get(performerId);
      
      const scores = q.satisfactionScores || [];
      const avgScore = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score.score, 0) / scores.length
        : 0;
      
      if (existing) {
        const totalScore = existing.avgScore * existing.answeredCount + avgScore;
        existing.answeredCount++;
        existing.avgScore = totalScore / existing.answeredCount;
      } else {
        performers.set(performerId, {
          id: performerId,
          name: q.answeredBy.name,
          role: q.answeredBy.role || 'Facilitator',
          avgScore,
          answeredCount: 1
        });
      }
    }
  });
  
  return Array.from(performers.values())
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);
});

const popularTags = computed(() => {
  const tagCounts = new Map<string, number>();
  
  allQnA.value.forEach(q => {
    if (q.tags) {
      q.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    }
  });
  
  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag]) => tag);
});

const compactHourlyDistribution = computed(() => {
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: i.toString().padStart(2, '0'),
    count: 0,
    answered: 0
  }));
  
  allQnA.value.forEach(q => {
    try {
      const date = parseISO(q.createdAt);
      const hour = date.getHours();
      hours[hour].count++;
      if (q.isAnswered) hours[hour].answered++;
    } catch (e) {
      // Skip invalid dates
    }
  });
  
  return hours.map(hour => ({
    ...hour,
    height: Math.min(hour.count * 3, 60), // Scale for visibility
    answeredPercent: hour.count > 0 ? (hour.answered / hour.count) * 100 : 0
  }));
});

const peakHour = computed(() => {
  const maxCount = Math.max(...compactHourlyDistribution.value.map(h => h.count));
  const peak = compactHourlyDistribution.value.find(h => h.count === maxCount);
  return peak ? `${peak.hour}:00` : 'N/A';
});

const recentQuestionsCount = computed(() => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return allQnA.value.filter(q => {
    try {
      return parseISO(q.createdAt) > oneDayAgo;
    } catch {
      return false;
    }
  }).length;
});

const pinnedQuestionsCount = computed(() => {
  return allQnA.value.filter(q => q.isPinned).length;
});

const anonymousQuestionsCount = computed(() => {
  return allQnA.value.filter(q => q.isAnonymous).length;
});

const avgResponseTime = computed(() => {
  const answeredQuestionsWithTime = allQnA.value.filter(q => q.isAnswered && q.answer);
  if (answeredQuestionsWithTime.length === 0) return '0h';
  
  let totalHours = 0;
  let validQuestions = 0;
  
  answeredQuestionsWithTime.forEach(q => {
    try {
      const askTime = parseISO(q.createdAt).getTime();
      const answerTime = parseISO(q.updatedAt).getTime();
      const hours = (answerTime - askTime) / (1000 * 60 * 60);
      if (hours > 0) {
        totalHours += hours;
        validQuestions++;
      }
    } catch {
      // Skip invalid dates
    }
  });
  
  if (validQuestions === 0) return '0h';
  
  const avgHours = totalHours / validQuestions;
  return avgHours < 1 ? '<1h' : `${Math.round(avgHours)}h`;
});

const engagementRate = computed(() => {
  const totalUpvotes = allQnA.value.reduce((sum, q) => sum + (q.upvoteCount || 0), 0);
  const avgUpvotesPerQuestion = totalQuestions.value > 0 ? totalUpvotes / totalQuestions.value : 0;
  return Math.min(Math.round(avgUpvotesPerQuestion * 20), 100);
});

const topQuestionUpvotes = computed(() => {
  if (allQnA.value.length === 0) return 0;
  return Math.max(...allQnA.value.map(q => q.upvoteCount || 0));
});

const completionRate = computed(() => {
  return responseRate.value;
});

// --------------------
// Methods
// --------------------
const getSatisfactionColor = (score: number): string => {
  if (score >= 4) return 'green';
  if (score === 3) return 'orange';
  return 'red';
};

const getTagColor = (index: number): string => {
  const colors = ['primary', 'green', 'orange', 'purple', 'indigo', 'teal'];
  return colors[index % colors.length];
};
</script>

<style scoped>
.analytics-dashboard {
  overflow-y: auto;
  max-height: calc(72vh - 56px);
  min-height: calc(72vh - 56px);
}

.h-100 {
  height: 100%;
}

.card-metric {
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.progress-compact {
  width: 60%;
}

/* Compact satisfaction bars */
.satisfaction-mini-bars {
  max-height: 140px;
  overflow: hidden;
}

.star-label {
  min-width: 40px;
}

/* Mini timeline */
.mini-timeline {
  height: 100px;
  display: flex;
  flex-direction: column;
}

.timeline-hour-bars {
  display: flex;
  align-items: flex-end;
  height: 60px;
  gap: 2px;
  flex: 1;
}

.hour-bar {
  flex: 1;
  background: #e3f2fd;
  border-radius: 2px 2px 0 0;
  position: relative;
  min-height: 4px;
  transition: height 0.3s ease;
}

.hour-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #4caf50;
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease;
}

/* Tag cloud */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-height: 80px;
  overflow-y: auto;
  padding: 2px;
}

/* Text truncation */
.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.performer-info {
  min-width: 0;
}

/* Quick stats */
.quick-stats {
  min-height: 60px;
}

.stat-item {
  min-width: 80px;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .analytics-dashboard {
    padding: 4px !important;
  }
  
  .card-metric {
    min-height: 70px;
  }
  
  .timeline-hour-bars {
    gap: 1px;
  }
  
  .hour-bar {
    min-width: 2px;
  }
  
  .tag-cloud {
    max-height: 60px;
  }
  
  .truncate-text {
    max-width: 60px;
  }
  
  .stat-item {
    min-width: 70px;
  }
}

/* Ensure no vertical scrolling in lists */
:deep(.v-list) {
  overflow: hidden;
}

:deep(.v-list-item) {
  min-height: 32px !important;
}

/* Scrollbar styling */
.analytics-dashboard::-webkit-scrollbar {
  width: 6px;
}

.analytics-dashboard::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.analytics-dashboard::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.analytics-dashboard::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>