<template>
  <v-app>
    <v-main>
      <v-container fluid class="pa-2 pa-md-3">
        <!-- Header Section -->
        <v-card class="mb-3" variant="outlined">
          <v-card-text class="pa-3">
            <v-row align="center" no-gutters>
              <v-col cols="12" md="6" class="d-flex align-center">
                <v-icon color="primary" class="mr-3">mdi-chart-timeline</v-icon>
                <div>
                  <h1 class="text-h5 font-weight-bold">Live Analytics Dashboard</h1>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ eventStore.currentEvent?.title || "No Event Selected" }}
                    <v-chip v-if="eventStore.currentEvent" size="x-small" class="ml-2">
                      ID: {{ eventStore.currentEvent.id.slice(0, 8) }}
                    </v-chip>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="6" class="d-flex align-center justify-end pt-2 pt-md-0">
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-chip
                      v-bind="props"
                      :color="getConnectionColor"
                      :variant="socketConnected ? 'flat' : 'outlined'"
                      class="mr-2"
                      @click="handleConnectClick"
                      :loading="isLoading"
                      size="small"
                    >
                      <v-icon start :size="isFullyConnected ? 'small' : 'x-small'">
                        {{ getConnectionIcon }}
                      </v-icon>
                      {{ socketStatus }}
                      <v-icon v-if="!socketConnected" end size="x-small">
                        mdi-connection
                      </v-icon>
                    </v-chip>
                  </template>
                  <span>{{ getConnectionTooltip }}</span>
                </v-tooltip>

                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn icon variant="text" size="small" v-bind="props">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="refreshData" prepend-icon="mdi-refresh" title="Refresh Data" />
                    <v-list-item @click="exportAnalytics" prepend-icon="mdi-download" title="Export Report" />
                    <v-divider></v-divider>
                    <v-list-item @click="toggleAutoRefresh">
                      <template v-slot:prepend>
                        <v-icon :color="autoRefreshEnabled ? 'primary' : undefined">
                          {{ autoRefreshEnabled ? 'mdi-autorenew' : 'mdi-autorenew-off' }}
                        </v-icon>
                      </template>
                      <v-list-item-title>
                        {{ autoRefreshEnabled ? 'Disable Auto Refresh' : 'Enable Auto Refresh' }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Connection Alert -->
        <v-alert
          v-if="socketError"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-3"
          closable
          @click:close="clearError"
          :border-color="socketConnected ? 'success' : 'error'"
          border="start"
        >
          <v-row align="center" no-gutters>
            <v-col cols="auto">
              <v-icon class="mr-2">mdi-wifi-strength-alert-outline</v-icon>
            </v-col>
            <v-col class="text-truncate">
              <strong>Connection Issue:</strong> Check 
            </v-col>
            <v-col cols="auto">
              <v-btn
                size="small"
                variant="tonal"
                @click="reconnectSocket"
                :loading="isLoading"
                class="ml-2"
              >
                Reconnect
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>

        <!-- Time & Data Controls -->
        <v-card class="mb-3" variant="outlined">
          <v-card-text class="pa-3">
            <v-row align="center" justify="space-between">
              <v-col cols="12" md="auto">
                <div class="d-flex align-center mb-2">
                  <v-icon size="small" class="mr-2">mdi-clock-outline</v-icon>
                  <span class="text-subtitle-2 font-weight-bold">Time Range</span>
                </div>
                <v-btn-toggle
                  v-model="selectedTimeRange"
                  mandatory
                  size="small"
                  color="primary"
                  variant="outlined"
                  density="compact"
                >
                  <v-tooltip v-for="({ value, label, icon }, i) in timeRangeOptions" :key="i" location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn :value="value" v-bind="props">
                        <v-icon v-if="icon" size="small">{{ icon }}</v-icon>
                        <span v-else>{{ label }}</span>
                      </v-btn>
                    </template>
                    <span>{{ label }}</span>
                  </v-tooltip>
                </v-btn-toggle>
              </v-col>

              <v-col cols="12" md="auto" class="text-center py-2 py-md-0 order-md-2">
                <div class="text-subtitle-2 font-weight-bold mb-1">Last Updated</div>
                <v-chip
                  size="small"
                  :color="isDataFresh ? 'green' : 'warning'"
                  variant="flat"
                  :prepend-icon="isDataFresh ? 'mdi-check-circle' : 'mdi-clock-alert'"
                >
                  {{ formatTime(lastUpdated) }}
                </v-chip>
              </v-col>

              <v-col cols="12" md="auto" class="text-md-end order-md-3">
                <div class="text-subtitle-2 font-weight-bold mb-1">Data Source</div>
                <v-chip size="small" :color="isFullyConnected ? 'primary' : 'grey'" variant="flat">
                  <v-icon start size="small">
                    {{ isFullyConnected ? 'mdi-database-sync' : 'mdi-database' }}
                  </v-icon>
                  {{ isFullyConnected ? 'Live Feed' : 'Cached Data' }}
                  <v-icon v-if="!isFullyConnected" end size="x-small">mdi-alert-circle</v-icon>
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- KPI Metrics -->
        <v-row class="mb-3">
          <v-col cols="12">
            <v-card variant="outlined">
              <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
                <v-icon color="primary" size="small" class="mr-2">mdi-chart-donut</v-icon>
                Key Performance Indicators
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-3">
                <v-row>
                  <v-col
                    cols="6"
                    sm="3"
                    v-for="metric in kpiMetrics"
                    :key="metric.label"
                  >
                    <v-card
                      :color="metric.color"
                      variant="flat"
                      class="text-white h-100"
                      :class="metric.glow && 'glow-effect'"
                    >
                      <v-card-text class="pa-3">
                        <div class="d-flex align-center mb-2">
                          <v-avatar :color="metric.darkColor" size="36" class="mr-2">
                            <v-icon size="small">{{ metric.icon }}</v-icon>
                          </v-avatar>
                          <div class="flex-grow-1">
                            <div class="text-h5 font-weight-bold">
                              {{ metric.value }}
                            </div>
                            <div class="text-caption font-weight-medium">
                              {{ metric.label }}
                            </div>
                          </div>
                        </div>
                        <v-divider class="my-2 opacity-100" :color="metric.darkColor"></v-divider>
                        <div class="d-flex justify-space-between align-center">
                          <div class="text-caption">
                            {{ metric.change >= 0 ? '+' : '' }}{{ metric.change }}%
                          </div>
                          <div class="text-caption d-flex align-center">
                            <v-icon
                              size="x-small"
                              :color="metric.change >= 0 ? 'white' : 'warning'"
                              class="mr-1"
                            >
                              {{ metric.change >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                            </v-icon>
                            vs. previous
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Main Charts Section -->
        <v-row class="mb-3">
          <!-- Activity Timeline Chart -->
          <v-col cols="12" lg="8">
            <v-card variant="outlined" class="h-100">
              <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
                <v-icon color="primary" size="small" class="mr-2">mdi-chart-bar</v-icon>
                Activity Timeline
                <v-spacer></v-spacer>
                <v-chip
                  v-if="isFullyConnected"
                  size="x-small"
                  color="green"
                  variant="outlined"
                  prepend-icon="mdi-pulse"
                  class="mr-2"
                >
                  LIVE
                </v-chip>
                <v-chip size="x-small" variant="tonal" color="info">
                  {{ getTimeRangeLabel(selectedTimeRange) }}
                </v-chip>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-3">
                <div class="activity-chart-container">
                  <div class="d-flex align-end" style="height: 200px;">
                    <template v-for="(hour, index) in enhancedHourlyData" :key="index">
                      <div class="bar-container flex-grow-1 mx-1">
                        <v-tooltip location="top">
                          <template v-slot:activator="{ props }">
                            <div
                              v-bind="props"
                              class="bar mx-auto position-relative"
                              :style="{
                                height: `${hour.percentage}%`,
                                background: hour.gradient,
                                width: '80%',
                                borderRadius: '4px 4px 0 0',
                                cursor: 'pointer',
                                minHeight: '8px'
                              }"
                              @click="zoomToHour(hour)"
                            >
                              <div class="bar-value text-caption font-weight-bold">
                                {{ hour.count }}
                              </div>
                            </div>
                          </template>
                          <span>
                            <strong>{{ hour.label }}</strong><br>
                            {{ hour.count }} posts<br>
                            {{ hour.trend }}% vs avg
                          </span>
                        </v-tooltip>
                        <div class="text-center mt-1">
                          <div class="text-caption font-weight-medium">
                            {{ hour.time }}
                          </div>
                          <v-icon
                            size="x-small"
                            :color="getTrendColor(hour.trend)"
                          >
                            {{ getTrendIcon(hour.trend) }}
                          </v-icon>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
                <v-divider class="my-3"></v-divider>
                <div class="d-flex justify-space-between align-center">
                  <div class="text-caption text-medium-emphasis">
                    <v-icon size="x-small" class="mr-1">mdi-information</v-icon>
                    Click bars for detailed hour view
                  </div>
                  <div class="d-flex align-center">
                    <v-icon
                      :color="peakActivity.isRecent ? 'red' : 'primary'"
                      size="small"
                      class="mr-1"
                    >
                      mdi-chart-line-variant
                    </v-icon>
                    <span class="text-caption font-weight-bold">
                      Peak: {{ peakActivity.hour }} ({{ peakActivity.count }} posts)
                    </span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Distribution & Engagement -->
          <v-col cols="12" lg="4">
            <v-row class="fill-height">
              <v-col cols="12" sm="6" lg="12">
                <v-card variant="outlined" class="h-100">
                  <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
                    <v-icon color="primary" size="small" class="mr-2">mdi-pie-chart</v-icon>
                    Content Distribution
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text class="pa-3">
                    <div v-for="(type, index) in postTypesDistribution" :key="type.type">
                      <div class="d-flex align-center mb-2">
                        <v-avatar
                          :color="getTypeColor(type.type)"
                          size="32"
                          class="font-weight-bold mr-3"
                        >
                          <span class="text-white text-caption">{{ type.type.charAt(0) }}</span>
                        </v-avatar>
                        <div class="flex-grow-1">
                          <div class="d-flex justify-space-between">
                            <span class="text-caption font-weight-bold">{{ type.type }}</span>
                            <span class="text-caption font-weight-bold">{{ type.percentage }}%</span>
                          </div>
                          <v-progress-linear
                            :model-value="type.percentage"
                            height="6"
                            :color="getTypeColor(type.type)"
                            rounded
                          ></v-progress-linear>
                        </div>
                      </div>
                      <v-divider v-if="index < postTypesDistribution.length - 1" class="my-2"></v-divider>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6" lg="12">
                <v-card variant="outlined" class="h-100">
                  <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
                    <v-icon color="primary" size="small" class="mr-2">mdi-heart-pulse</v-icon>
                    Engagement Rate
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text class="pa-3 text-center">
                    <v-progress-circular
                      :model-value="engagementRate"
                      :size="120"
                      :width="12"
                      :color="getEngagementColor(engagementRate)"
                    >
                      <div>
                        <div class="text-h4 font-weight-bold">{{ engagementRate }}%</div>
                        <div class="text-caption text-medium-emphasis">Engagement</div>
                      </div>
                    </v-progress-circular>
                    <div class="mt-3">
                      <v-chip
                        size="small"
                        :color="getEngagementColor(engagementRate)"
                        variant="tonal"
                        prepend-icon="mdi-target"
                      >
                        {{ getEngagementLevel }}
                      </v-chip>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Sentiment & Active Users -->
        <v-row class="mb-3">
          <!-- Sentiment Analysis -->
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="h-100">
              <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
                <v-icon color="primary" size="small" class="mr-2">mdi-emoticon</v-icon>
                Sentiment Analysis
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-3">
                <v-row>
                  <v-col
                    cols="4"
                    v-for="sentiment in enhancedSentimentAnalysis"
                    :key="sentiment.type"
                  >
                    <v-card
                      :color="sentiment.color"
                      variant="flat"
                      class="text-center text-white h-100"
                    >
                      <v-card-text class="pa-3 d-flex flex-column justify-space-between h-100">
                        <div>
                          <v-avatar
                            :color="sentiment.darkColor"
                            size="40"
                            class="mb-2"
                          >
                            <v-icon>{{ sentiment.icon }}</v-icon>
                          </v-avatar>
                          <div class="text-h5 font-weight-bold mb-1">
                            {{ sentiment.percentage }}%
                          </div>
                          <div class="text-caption font-weight-medium">
                            {{ sentiment.type }}
                          </div>
                        </div>
                        <div class="text-caption mt-2">
                          {{ sentiment.count }} posts
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                <v-divider class="my-3"></v-divider>
                <div class="text-center">
                  <v-chip
                    size="small"
                    :color="getOverallSentiment.color"
                    variant="flat"
                    prepend-icon="mdi-chart-bell-curve"
                  >
                    {{ getOverallSentiment.label }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Active Contributors -->
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="h-100 d-flex flex-column">
              <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
                <v-icon color="primary" size="small" class="mr-2">mdi-account-group</v-icon>
                Active Contributors
                <v-spacer></v-spacer>
                <v-chip
                  v-if="hasNewActiveUsers"
                  size="x-small"
                  color="red"
                  variant="flat"
                  prepend-icon="mdi-star"
                >
                  NEW
                </v-chip>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-0 flex-grow-1" style="max-height: 400px; overflow-y: auto">
                <v-list lines="two" density="compact">
                  <v-list-item
                    v-for="(user, index) in activeUsers"
                    :key="user.id"
                    :value="user.id"
                    :class="{ 'bg-green-lighten-5': user.isNew }"
                  >
                    <template v-slot:prepend>
                      <v-badge
                        :color="index < 3 ? getRankColor(index + 1) : 'grey'"
                        :content="index + 1"
                        bordered
                      >
                        <v-avatar :color="getUserColor(user.role)" size="40">
                          <span class="text-white font-weight-bold">
                            {{ getUserInitial(user.name) }}
                          </span>
                        </v-avatar>
                      </v-badge>
                    </template>

                    <v-list-item-title class="font-weight-bold">
                      {{ user.name }}
                      <v-chip
                        v-if="user.role !== 'participant'"
                        size="x-small"
                        density="compact"
                        :color="getRoleColor(user.role)"
                        class="ml-2"
                      >
                        {{ user.role }}
                      </v-chip>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ user.posts }} posts • Last active {{ formatTimeAgo(user.lastActive) }}
                    </v-list-item-subtitle>

                    <template v-slot:append>
                      <div class="text-center">
                        <v-icon color="red" size="small" class="d-block mb-1">
                          mdi-heart
                        </v-icon>
                        <span class="text-caption font-weight-bold">
                          {{ user.totalReactions }}
                        </span>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-card-actions class="pa-3">
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  prepend-icon="mdi-account-multiple"
                  @click="viewAllUsers"
                >
                  View All {{ totalActiveUsers }} Users
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- Top Content & Activity Stream -->
        <v-row class="mb-3">
          <!-- Top Performing Content -->
          <v-col cols="12" lg="8">
            <v-card variant="outlined" class="h-100">
              <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
                <v-icon color="primary" size="small" class="mr-2">mdi-trophy</v-icon>
                Top Performing Content
                <v-spacer></v-spacer>
                <v-chip
                  v-if="hasNewTopPosts"
                  size="x-small"
                  color="red"
                  variant="flat"
                  prepend-icon="mdi-fire"
                >
                  TRENDING
                </v-chip>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-0">
                <v-table density="compact" hover>
                  <thead>
                    <tr>
                      <th class="text-left" style="width: 50px">Rank</th>
                      <th class="text-left">Content</th>
                      <th class="text-left">Author</th>
                      <th class="text-left">Type</th>
                      <th class="text-left">Engagement</th>
                      <th class="text-left" style="width: 60px">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(post, index) in enhancedTopPosts"
                      :key="post.id"
                      :class="{ 'bg-amber-lighten-5': index < 3, 'new-post': post.isNew }"
                    >
                      <td>
                        <v-avatar
                          :size="28"
                          :color="getRankColor(index + 1)"
                          class="font-weight-bold"
                        >
                          <span class="text-white text-caption">{{ index + 1 }}</span>
                        </v-avatar>
                      </td>
                      <td>
                        <div class="d-flex align-center">
                          <v-icon
                            :color="getTypeColor(post.type)"
                            size="small"
                            class="mr-2 flex-shrink-0"
                          >
                            {{ getTypeIcon(post.type) }}
                          </v-icon>
                          <div class="text-truncate">
                            <v-tooltip location="top" :text="post.content">
                              <template v-slot:activator="{ props }">
                                <div v-bind="props" class="font-weight-bold text-caption text-truncate" style="max-width: 200px">
                                  {{ post.content?.substring(0, 60) || 'No content' }}{{ post.content?.length > 60 ? '...' : '' }}
                                </div>
                              </template>
                            </v-tooltip>
                            <div class="text-caption text-medium-emphasis">
                              {{ formatTimeAgo(post.createdAt) }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="d-flex align-center">
                          <v-avatar size="24" class="mr-2" :color="getUserColor(post.author?.role)">
                            <span class="text-caption font-weight-bold text-white">
                              {{ getUserInitial(post.author?.name) }}
                            </span>
                          </v-avatar>
                          <span class="text-caption">{{ post.author?.name || 'Anonymous' }}</span>
                        </div>
                      </td>
                      <td>
                        <v-chip
                          size="x-small"
                          :color="getTypeColor(post.type)"
                          variant="flat"
                        >
                          {{ post.type }}
                        </v-chip>
                      </td>
                      <td>
                        <div class="d-flex align-center">
                          <div class="text-center mr-3">
                            <v-icon size="x-small" color="red" class="d-block mb-1">
                              mdi-heart
                            </v-icon>
                            <span class="text-caption font-weight-bold">{{ post.reactionCount || 0 }}</span>
                          </div>
                          <div class="text-center">
                            <v-icon size="x-small" color="blue" class="d-block mb-1">
                              mdi-comment
                            </v-icon>
                            <span class="text-caption font-weight-bold">{{ post.commentCount || 0 }}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <v-btn
                          size="x-small"
                          icon
                          variant="text"
                          color="primary"
                          @click="viewPost(post.id)"
                        >
                          <v-icon>mdi-open-in-new</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Live Activity Stream -->
          <v-col cols="12" lg="4">
            <v-card variant="outlined" class="h-100 d-flex flex-column">
              <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
                <v-icon color="primary" size="small" class="mr-2">mdi-rss</v-icon>
                Live Activity Stream
                <v-spacer></v-spacer>
                <v-chip
                  v-if="isFullyConnected"
                  size="x-small"
                  color="green"
                  variant="outlined"
                  prepend-icon="mdi-pulse"
                >
                  LIVE
                </v-chip>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-0 flex-grow-1" style="max-height: 400px; overflow-y: auto">
                <v-timeline density="compact" align="start" truncate-line="both" class="py-2 pl-2">
                  <v-timeline-item
                    v-for="activity in recentActivity"
                    :key="activity.id"
                    :dot-color="getActivityColor(activity.type)"
                    size="small"
                    :icon="getActivityIcon(activity.type)"
                  >
                    <div class="d-flex justify-space-between align-start">
                      <div>
                        <div class="text-caption font-weight-bold text-truncate" style="max-width: 220px;">
                          {{ activity.user }}
                          <span class="text-medium-emphasis ml-1">
                            {{ formatActivityAction(activity.type) }}
                          </span>
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          {{ formatTimeAgo(activity.timestamp) }}
                        </div>
                      </div>
                      <v-btn
                        size="x-small"
                        icon
                        variant="text"
                        @click="viewActivityDetail(activity.id)"
                        class="ml-2"
                      >
                        <v-icon size="small">mdi-eye-outline</v-icon>
                      </v-btn>
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
              <v-card-actions class="pa-3">
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  prepend-icon="mdi-history"
                  @click="viewFullActivityLog"
                >
                  View Full Log
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- Data Quality Footer -->
        <v-card variant="outlined">
          <v-card-text class="pa-3">
            <v-row align="center">
              <v-col cols="12" md="4">
                <div class="d-flex align-center">
                  <v-icon color="info" class="mr-2">mdi-database</v-icon>
                  <div>
                    <div class="text-subtitle-2 font-weight-bold">Data Quality</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ liveFeedStore.feeds.length }} posts analyzed
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="4" class="text-center">
                <v-progress-linear
                  :model-value="dataCompleteness"
                  height="6"
                  :color="dataCompleteness > 90 ? 'success' : dataCompleteness > 70 ? 'warning' : 'error'"
                  rounded
                  class="mb-1"
                ></v-progress-linear>
                <div class="text-caption">
                  Completeness: {{ dataCompleteness }}%
                </div>
              </v-col>
              <v-col cols="12" md="4" class="text-end">
                <v-chip
                  size="small"
                  :color="isFullyConnected ? 'success' : 'warning'"
                  variant="tonal"
                  prepend-icon="mdi-shield-check"
                >
                  {{ isFullyConnected ? 'Real-time Analytics' : 'Cached Analytics' }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Quick Stats Footer -->
        <v-footer class="px-3 py-2 mt-3" color="surface" app>
          <div class="d-flex justify-space-between align-center w-100 flex-wrap">
            <div class="text-caption text-medium-emphasis">
              <v-icon size="x-small" class="mr-1">mdi-update</v-icon>
              Auto-refresh: {{ autoRefreshEnabled ? 'On' : 'Off' }} • 
              Next update: {{ formatTime(nextAutoRefresh) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              <v-icon size="x-small" class="mr-1">mdi-chart-box</v-icon>
              Showing data for {{ getTimeRangeLabel(selectedTimeRange) }} • 
              Generated {{ formatTime(new Date()) }}
            </div>
            <div class="text-caption">
              <v-btn
                size="x-small"
                variant="text"
                color="primary"
                prepend-icon="mdi-cog"
                @click="openSettings"
              >
                Dashboard Settings
              </v-btn>
            </div>
          </div>
        </v-footer>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useEventStore } from "@/stores/event";
import { useLiveFeedStore } from "@/stores/livefeed";
import { useUserStore } from "@/stores/user";
import { useLiveFeedSocket } from "@/composables/useLiveFeedSocket";

const router = useRouter();
const eventStore = useEventStore();
const liveFeedStore = useLiveFeedStore();
const userStore = useUserStore();
const liveFeedSocket = useLiveFeedSocket();

// State
const selectedTimeRange = ref("24h");
const lastUpdated = ref(new Date());
const refreshing = ref(false);
const hasNewTopPosts = ref(false);
const hasNewActiveUsers = ref(false);
const autoRefreshEnabled = ref(true);
const autoRefreshInterval = ref<NodeJS.Timeout | null>(null);
const nextAutoRefresh = ref(new Date(Date.now() + 30000));
const dataCompleteness = ref(85);

// Socket states
const isConnected = computed(() => liveFeedSocket.isConnected.value);
const isSubscribed = computed(() => liveFeedSocket.isSubscribed.value);
const isLoading = computed(() => liveFeedSocket.isLoading.value);
const socketError = computed(() => liveFeedSocket.error.value);

const isFullyConnected = computed<boolean>(
  () => userStore.isAuthenticated && isConnected.value && isSubscribed.value
);

const socketConnected = computed(() => isConnected.value && isSubscribed.value);

// Time range options
const timeRangeOptions = [
  { value: '1h', label: 'Last 1 Hour' },
  { value: 'today', label: "Today's Activity" },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: 'custom', label: 'Custom Range', icon: 'mdi-calendar' },
];

/* --------------------------- REAL ANALYTICS COMPUTED FROM LIVEFEED STORE ---------------------------- */

// Total posts count
const totalPosts = computed(() => {
  return liveFeedStore.feeds?.length || 0;
});

// Total reactions count
const totalReactions = computed(() => {
  if (!liveFeedStore.feeds?.length) return 0;
  return liveFeedStore.feeds.reduce((sum: number, feed: any) => {
    const reactionCount = feed.reactions?.reduce((rSum: number, reaction: any) => 
      rSum + (reaction.count || 0), 0) || 0;
    return sum + reactionCount;
  }, 0);
});

// Total unique users who posted
const totalActiveUsers = computed(() => {
  if (!liveFeedStore.feeds?.length) return 0;
  const userSet = new Set<string>();
  liveFeedStore.feeds.forEach((feed: any) => {
    if (feed.author?.id) {
      userSet.add(feed.author.id);
    }
  });
  return userSet.size;
});

// Average reactions per post
const averageReactionsPerPost = computed(() => {
  if (totalPosts.value === 0) return "0.0";
  return (totalReactions.value / totalPosts.value).toFixed(1);
});

// Post types distribution
const postTypesDistribution = computed(() => {
  if (!liveFeedStore.feeds?.length) return [];
  
  const counts: Record<string, number> = {};
  liveFeedStore.feeds.forEach((feed: any) => {
    const type = feed.type || "TEXT";
    counts[type] = (counts[type] || 0) + 1;
  });
  
  const total = totalPosts.value || 1;
  return Object.entries(counts)
    .map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
});

// Hourly post distribution (last 12 hours)
const hourlyPosts = computed(() => {
  const now = new Date();
  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = new Date(now.getTime() - (11 - i) * 2 * 60 * 60 * 1000);
    const hourNum = hour.getHours();
    return {
      hour: hourNum,
      label: `${hourNum.toString().padStart(2, "0")}:00`,
      time: `${hourNum.toString().padStart(2, "0")}:00`,
      count: 0,
    };
  });

  if (!liveFeedStore.feeds?.length) return hours;

  liveFeedStore.feeds.forEach((feed: any) => {
    const postDate = new Date(feed.createdAt);
    const postHour = postDate.getHours();
    
    // Check if post is within last 24 hours
    const hoursDiff = Math.abs(now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
    if (hoursDiff <= 24) {
      const hourIndex = hours.findIndex((h) => h.hour === postHour);
      if (hourIndex !== -1) {
        hours[hourIndex].count++;
      }
    }
  });

  return hours;
});

const maxHourlyPosts = computed(() => {
  if (!hourlyPosts.value.length) return 1;
  const max = Math.max(...hourlyPosts.value.map((h) => h.count));
  return max > 0 ? max : 1;
});

// Top posts by reactions
const topPosts = computed(() => {
  if (!liveFeedStore.feeds?.length) return [];
  
  return [...liveFeedStore.feeds]
    .map((post: any) => ({
      ...post,
      reactionCount: post.reactions?.reduce((sum: number, reaction: any) => 
        sum + (reaction.count || 0), 0) || 0,
      commentCount: post.comments?.length || 0,
    }))
    .sort((a, b) => {
      return b.reactionCount - a.reactionCount;
    })
    .slice(0, 5);
});

// Active users (based on posting activity)
const activeUsers = computed(() => {
  if (!liveFeedStore.feeds?.length) return [];
  
  const userMap = new Map<
    string,
    {
      id: string;
      name: string;
      role: string;
      posts: number;
      lastActive: string;
      totalReactions: number;
      isNew?: boolean;
    }
  >();

  liveFeedStore.feeds.forEach((feed: any) => {
    if (feed.author?.id) {
      const existing = userMap.get(feed.author.id);
      const reactionCount = feed.reactions?.reduce((sum: number, r: any) => sum + (r.count || 0), 0) || 0;
      
      if (existing) {
        existing.posts++;
        existing.totalReactions += reactionCount;
        if (new Date(feed.createdAt) > new Date(existing.lastActive)) {
          existing.lastActive = feed.createdAt;
        }
      } else {
        userMap.set(feed.author.id, {
          id: feed.author.id,
          name: feed.author.name || "Unknown",
          role: feed.author.role || "participant",
          posts: 1,
          totalReactions: reactionCount,
          lastActive: feed.createdAt,
          isNew: hasNewActiveUsers.value,
        });
      }
    }
  });

  return Array.from(userMap.values())
    .sort((a, b) => {
      const dateA = new Date(a.lastActive);
      const dateB = new Date(b.lastActive);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);
});

// Engagement rate (posts with reactions / total posts)
const engagementRate = computed(() => {
  if (!liveFeedStore.feeds?.length || totalPosts.value === 0) return 0;
  
  const postsWithReactions = liveFeedStore.feeds.filter(
    (feed: any) => feed.reactions && feed.reactions.length > 0
  ).length;
  
  return Math.round((postsWithReactions / totalPosts.value) * 100);
});

// Sentiment analysis (simplified based on reaction types)
const sentimentAnalysis = computed(() => {
  if (!liveFeedStore.feeds?.length) {
    return [
      { type: "Positive", percentage: 0, icon: "mdi-emoticon-happy", color: "green" },
      { type: "Neutral", percentage: 100, icon: "mdi-emoticon-neutral", color: "grey" },
      { type: "Negative", percentage: 0, icon: "mdi-emoticon-sad", color: "red" },
    ];
  }

  const positiveEmojis = ["👍", "❤️", "🎉", "👏", "😊", "😄", "😍", "🥰", "🔥"];
  const negativeEmojis = ["👎", "😢", "😠", "😡", "😔", "😞", "😫"];
  
  let positive = 0;
  let negative = 0;
  let neutral = 0;

  liveFeedStore.feeds.forEach((feed: any) => {
    if (feed.reactions && feed.reactions.length > 0) {
      const reactionEmojis = feed.reactions.map((r: any) => r.emoji);
      const hasPositive = reactionEmojis.some((emoji: string) => 
        positiveEmojis.includes(emoji)
      );
      const hasNegative = reactionEmojis.some((emoji: string) => 
        negativeEmojis.includes(emoji)
      );

      if (hasPositive && !hasNegative) {
        positive++;
      } else if (hasNegative && !hasPositive) {
        negative++;
      } else {
        neutral++;
      }
    } else {
      neutral++;
    }
  });

  const total = liveFeedStore.feeds.length;
  return [
    {
      type: "Positive",
      percentage: Math.round((positive / total) * 100),
      icon: "mdi-emoticon-happy",
      color: "green",
    },
    {
      type: "Neutral",
      percentage: Math.round((neutral / total) * 100),
      icon: "mdi-emoticon-neutral",
      color: "grey",
    },
    {
      type: "Negative",
      percentage: Math.round((negative / total) * 100),
      icon: "mdi-emoticon-sad",
      color: "red",
    },
  ];
});

// Recent activity feed
const recentActivity = computed(() => {
  const activities: Array<{
    id: string;
    user: string;
    type: string;
    timestamp: string;
    isLive?: boolean;
  }> = [];

  if (!liveFeedStore.feeds?.length) return activities;

  // Add post creation activities
  liveFeedStore.feeds.slice(0, 10).forEach((feed: any) => {
    activities.push({
      id: `post-${feed.id}`,
      user: feed.author?.name || "Unknown",
      type: "post",
      timestamp: feed.createdAt,
      isLive: isFullyConnected.value,
    });
  });

  // Add reaction activities
  liveFeedStore.feeds.forEach((feed: any) => {
    if (feed.reactions && feed.reactions.length > 0) {
      feed.reactions.forEach((reaction: any) => {
        if (reaction.count > 0) {
          activities.push({
            id: `reaction-${feed.id}-${reaction.emoji}`,
            user: `${reaction.count} people`,
            type: "reaction",
            timestamp: feed.updatedAt || feed.createdAt,
            isLive: isFullyConnected.value,
          });
        }
      });
    }
  });

  // Sort by time (newest first) and take top 10
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
});

// Enhanced computed properties
const isDataFresh = computed(() => {
  const now = new Date();
  const diffMs = now.getTime() - lastUpdated.value.getTime();
  return diffMs < 5 * 60 * 1000; // 5 minutes
});

const enhancedHourlyData = computed(() => {
  const hours = hourlyPosts.value;
  const avg = hours.reduce((sum, h) => sum + h.count, 0) / hours.length || 1;
  
  return hours.map(hour => {
    const trend = avg > 0 ? ((hour.count - avg) / avg) * 100 : 0;
    return {
      ...hour,
      percentage: (hour.count / maxHourlyPosts.value) * 100,
      gradient: hour.count > 0 
        ? `linear-gradient(to top, ${isFullyConnected.value ? '#4CAF50' : '#9E9E9E'}, ${isFullyConnected.value ? '#81C784' : '#BDBDBD'})`
        : '#F5F5F5',
      trend: Math.round(trend)
    };
  });
});

const peakActivity = computed(() => {
  const hours = enhancedHourlyData.value;
  const peak = hours.reduce((max, hour) => hour.count > max.count ? hour : max, { count: 0, hour: '', time: '', label: '' });
  const isRecent = hours.slice(-3).some(h => h.count === peak.count);
  return { ...peak, isRecent };
});

const enhancedSentimentAnalysis = computed(() => {
  const base = sentimentAnalysis.value;
  const colors = {
    Positive: { light: '#4CAF50', dark: '#388E3C' },
    Neutral: { light: '#9E9E9E', dark: '#616161' },
    Negative: { light: '#F44336', dark: '#D32F2F' }
  };
  
  const total = liveFeedStore.feeds.length;
  
  return base.map(sent => ({
    ...sent,
    color: colors[sent.type].light,
    darkColor: colors[sent.type].dark,
    count: Math.round((sent.percentage / 100) * total),
    icon: sent.type === 'Positive' ? 'mdi-emoticon-happy-outline' :
           sent.type === 'Negative' ? 'mdi-emoticon-sad-outline' :
           'mdi-emoticon-neutral-outline'
  }));
});

const getOverallSentiment = computed(() => {
  const positive = enhancedSentimentAnalysis.value.find(s => s.type === 'Positive')?.percentage || 0;
  const negative = enhancedSentimentAnalysis.value.find(s => s.type === 'Negative')?.percentage || 0;
  const diff = positive - negative;
  
  if (diff > 20) return { label: 'Very Positive', color: 'success' };
  if (diff > 10) return { label: 'Positive', color: 'success' };
  if (diff > -10) return { label: 'Neutral', color: 'info' };
  if (diff > -20) return { label: 'Negative', color: 'warning' };
  return { label: 'Very Negative', color: 'error' };
});

const enhancedTopPosts = computed(() => {
  return topPosts.value.map((post, index) => ({
    ...post,
    engagementScore: (post.reactionCount || 0) + (post.commentCount || 0) * 2,
    isNew: index < 2 && hasNewTopPosts.value,
    trend: index === 0 ? 'up' : index === 1 ? 'stable' : 'down'
  }));
});

const kpiMetrics = computed(() => [
  {
    icon: 'mdi-newspaper-variant-multiple',
    label: 'Total Content',
    value: totalPosts.value,
    change: 12,
    color: 'blue',
    darkColor: '#1976D2',
    glow: totalPosts.value > 0
  },
  {
    icon: 'mdi-heart-multiple',
    label: 'Engagements',
    value: totalReactions.value,
    change: 18,
    color: 'red',
    darkColor: '#D32F2F',
    glow: totalReactions.value > 100
  },
  {
    icon: 'mdi-account-group',
    label: 'Active Users',
    value: totalActiveUsers.value,
    change: 8,
    color: 'green',
    darkColor: '#388E3C',
    glow: hasNewActiveUsers.value
  },
  {
    icon: 'mdi-chart-timeline-variant',
    label: 'Avg Engagement',
    value: averageReactionsPerPost.value,
    change: -2,
    color: 'amber',
    darkColor: '#F57C00',
    glow: parseFloat(averageReactionsPerPost.value) > 5
  }
]);

const getEngagementLevel = computed(() => {
  if (engagementRate.value > 70) return 'Excellent';
  if (engagementRate.value > 50) return 'Good';
  if (engagementRate.value > 30) return 'Average';
  return 'Low';
});

// Socket status
const socketStatus = computed(() => {
  if (!userStore.isAuthenticated) return "Login Required";
  if (isLoading.value) return "Connecting...";
  if (socketError.value) return "Error";
  if (!isConnected.value) return "Offline";
  if (!isSubscribed.value) return "Ready";
  return "Connected";
});

// Connection status enhancements
const getConnectionColor = computed(() => {
  if (!userStore.isAuthenticated) return 'grey';
  if (socketError.value) return 'error';
  if (isFullyConnected.value) return 'success';
  if (isConnected.value) return 'warning';
  return 'grey';
});

const getConnectionIcon = computed(() => {
  if (isFullyConnected.value) return 'mdi-wifi-strength-4';
  if (isConnected.value) return 'mdi-wifi-strength-2';
  return 'mdi-wifi-strength-alert-outline';
});

const getConnectionTooltip = computed(() => {
  if (!userStore.isAuthenticated) return 'Login required for live data';
  if (socketError.value) return `Error: ${socketError.value}`;
  if (isFullyConnected.value) return 'Live connection active';
  if (isConnected.value) return 'Connected, awaiting subscription';
  return 'Disconnected - click to connect';
});

/* --------------------------- SOCKET & DATA METHODS ---------------------------- */

const joinLiveFeed = async () => {
  if (!userStore.isAuthenticated) {
    alert("Please log in to view analytics");
    return;
  }
  if (!eventStore.currentEvent?.id) {
    console.error("No event selected");
    return;
  }
  try {
    await liveFeedSocket.joinLiveFeed(eventStore.currentEvent.id);
  } catch (error) {
    console.error("Failed to join live feed:", error);
  }
};

const handleConnectClick = async () => {
  if (!userStore.isAuthenticated) {
    router.push("/login");
    return;
  }
  if (!isConnected.value) {
    await liveFeedSocket.connect();
  } else if (!isSubscribed.value) {
    await joinLiveFeed();
  } else {
    liveFeedSocket.disconnect();
  }
};

const reconnectSocket = () => {
  liveFeedSocket.error.value = null;
  if (eventStore.currentEvent?.id) {
    joinLiveFeed();
  }
};

const refreshData = async () => {
  refreshing.value = true;
  try {
    if (eventStore.currentEvent?.id) {
      // Refresh feeds from server
      await liveFeedStore.fetchFeedsByEvent(eventStore.currentEvent.id);
      lastUpdated.value = new Date();
      
      // Show visual feedback for new data
      hasNewTopPosts.value = true;
      hasNewActiveUsers.value = true;
      setTimeout(() => {
        hasNewTopPosts.value = false;
        hasNewActiveUsers.value = false;
      }, 2000);
    }
  } catch (error) {
    console.error("Failed to refresh data:", error);
  } finally {
    refreshing.value = false;
  }
};

const clearError = () => {
  liveFeedSocket.error.value = null;
};

/* --------------------------- UI UTILITIES ---------------------------- */

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const formatTime = (date: Date | string) => {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatTimeAgo = (date: Date | string) => {
  return formatTime(date);
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    TEXT: "#2196F3",
    ANNOUNCEMENT: "#4CAF50",
    UPDATE: "#9C27B0",
    NEWS: "#FF9800",
    ALERT: "#F44336",
    IMAGE: "#00BCD4",
    VIDEO: "#E91E63",
    LINK: "#795548"
  };
  return colors[type] || "#9E9E9E";
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    TEXT: 'mdi-text',
    ANNOUNCEMENT: 'mdi-bullhorn',
    UPDATE: 'mdi-update',
    NEWS: 'mdi-newspaper',
    ALERT: 'mdi-alert',
    IMAGE: 'mdi-image',
    VIDEO: 'mdi-video',
    LINK: 'mdi-link'
  };
  return icons[type] || 'mdi-help-circle';
};

const getRankColor = (rank: number) => {
  if (rank === 1) return "#FFC107";
  if (rank === 2) return "#9E9E9E";
  if (rank === 3) return "#795548";
  return "#607D8B";
};

const getUserInitial = (name?: string) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name[0].toUpperCase();
};

const getActivityColor = (type: string) => {
  const colors: Record<string, string> = {
    reaction: "#F44336",
    post: "#2196F3",
    comment: "#4CAF50",
    pin: "#E91E63",
    breaking: "#FF5722",
    update: "#9C27B0",
  };
  return colors[type] || "#9E9E9E";
};

const getActivityIcon = (type: string) => {
  const icons: Record<string, string> = {
    reaction: "mdi-heart",
    post: "mdi-newspaper",
    comment: "mdi-comment",
    pin: "mdi-pin",
    breaking: "mdi-alert",
    update: "mdi-update",
  };
  return icons[type] || "mdi-help-circle";
};

const getUserColor = (role?: string) => {
  const colors: Record<string, string> = {
    admin: 'red',
    moderator: 'orange',
    speaker: 'purple',
    participant: 'blue',
    guest: 'grey'
  };
  return colors[role || 'participant'] || 'blue';
};

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    admin: 'red-darken-2',
    moderator: 'orange-darken-2',
    speaker: 'purple-darken-2',
    participant: 'blue-darken-2'
  };
  return colors[role] || 'grey';
};

const getTrendColor = (trend: number) => {
  if (trend > 10) return 'success';
  if (trend < -10) return 'error';
  return 'grey';
};

const getTrendIcon = (trend: number) => {
  if (trend > 10) return 'mdi-arrow-up';
  if (trend < -10) return 'mdi-arrow-down';
  return 'mdi-minus';
};

const getEngagementColor = (rate: number) => {
  if (rate > 70) return 'success';
  if (rate > 50) return 'warning';
  return 'error';
};

const getTimeRangeLabel = (range: string) => {
  const option = timeRangeOptions.find(opt => opt.value === range);
  return option?.label || range;
};

const formatActivityAction = (type: string) => {
  const actions: Record<string, string> = {
    reaction: 'reacted to content',
    post: 'posted new content',
    comment: 'commented on post',
    pin: 'pinned content',
    breaking: 'posted breaking news',
    update: 'updated content'
  };
  return actions[type] || 'performed an action';
};

/* --------------------------- ENHANCED METHODS ---------------------------- */

const zoomToHour = (hour: any) => {
  console.log('Zoom to hour:', hour);
  // Implement zoom functionality
  alert(`Zooming to ${hour.label} with ${hour.count} posts`);
};

const toggleAutoRefresh = () => {
  autoRefreshEnabled.value = !autoRefreshEnabled.value;
  if (autoRefreshEnabled.value) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
};

const startAutoRefresh = () => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value);
  }
  autoRefreshInterval.value = setInterval(() => {
    if (isFullyConnected.value) {
      refreshData();
      nextAutoRefresh.value = new Date(Date.now() + 30000);
    }
  }, 30000);
};

const stopAutoRefresh = () => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value);
    autoRefreshInterval.value = null;
  }
};

const exportAnalytics = () => {
  const data = {
    timestamp: new Date().toISOString(),
    event: eventStore.currentEvent,
    metrics: kpiMetrics.value,
    sentiment: enhancedSentimentAnalysis.value,
    topPosts: enhancedTopPosts.value,
    activeUsers: activeUsers.value
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const viewPost = (postId: string) => {
  console.log('View post:', postId);
  // Navigate to post detail
};

const viewActivityDetail = (activityId: string) => {
  console.log('View activity detail:', activityId);
  // Navigate to activity detail
};

const viewAllUsers = () => {
  console.log('View all users');
  // Navigate to users view
};

const viewFullActivityLog = () => {
  console.log('View full activity log');
  // Navigate to activity history
};

const openSettings = () => {
  console.log('Open dashboard settings');
  // Open settings dialog
};

/* --------------------------- LIFECYCLE ---------------------------- */

onMounted(() => {
  if (!userStore.isAuthenticated) {
    console.log("User not authenticated, analytics will use stored data");
  }

  // Set up socket listeners for real-time updates
  liveFeedSocket.on("livefeed:post:new", (data: { post: any }) => {
    console.log("New post detected for analytics:", data);
    refreshData();
  });

  liveFeedSocket.on("livefeed:post:updated", (data: { post: any }) => {
    console.log("Post updated for analytics:", data);
    refreshData();
  });

  liveFeedSocket.on("livefeed:post:deleted", (data: { postId: string }) => {
    console.log("Post deleted for analytics:", data.postId);
    refreshData();
  });

  // Auto-join if authenticated and has event
  if (eventStore.currentEvent?.id && userStore.isAuthenticated) {
    console.log("Auto-joining event for analytics:", eventStore.currentEvent.id);
    setTimeout(() => joinLiveFeed(), 1000);
  }

  // Start auto-refresh if enabled
  if (autoRefreshEnabled.value) {
    startAutoRefresh();
  }

  // Watch for event changes
  watch(
    () => eventStore.currentEvent?.id,
    (newId, oldId) => {
      if (newId && newId !== oldId) {
        console.log("Event changed for analytics:", oldId, "->", newId);
        if (newId && userStore.isAuthenticated) {
          setTimeout(() => joinLiveFeed(), 100);
        }
      }
    }
  );

  // Watch for authentication changes
  watch(
    () => userStore.isAuthenticated,
    (auth) => {
      console.log("User auth changed for analytics:", auth);
      if (auth && eventStore.currentEvent?.id) {
        setTimeout(() => joinLiveFeed(), 500);
      } else if (!auth) {
        liveFeedSocket.disconnect();
        stopAutoRefresh();
      }
    }
  );
});

onUnmounted(() => {
  console.log("Cleaning up analytics component...");
  
  // Cleanup socket listeners
  liveFeedSocket.off("livefeed:post:new");
  liveFeedSocket.off("livefeed:post:updated");
  liveFeedSocket.off("livefeed:post:deleted");
  
  // Leave live feed if joined
  if (isSubscribed.value && eventStore.currentEvent?.id) {
    liveFeedSocket.leaveLiveFeed(eventStore.currentEvent.id);
  }
  
  // Disconnect socket
  liveFeedSocket.disconnect();
  
  // Stop auto-refresh
  stopAutoRefresh();
});
</script>

<style scoped>
/* Scoped styles for unique effects */
.glow-effect {
  box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.5);
  transition: box-shadow 0.3s ease-in-out;
}

.glow-effect:hover {
  box-shadow: 0 0 15px rgba(var(--v-theme-primary), 0.7);
}

.bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

.bar {
  transition: all 0.3s ease;
  position: relative;
}

.bar:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  white-space: nowrap;
  color: #424242;
}

.new-post {
  animation: pulse-bg 2s ease;
  background-color: rgba(255, 193, 7, 0.05);
}

@keyframes pulse-bg {
  0% {
    background-color: rgba(255, 193, 7, 0.1);
  }
  50% {
    background-color: rgba(255, 193, 7, 0.2);
  }
  100% {
    background-color: rgba(255, 193, 7, 0.05);
  }
}

.h-100 {
  height: 100%;
}

.position-relative {
  position: relative;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.opacity-100 {
  opacity: 1 !important;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .activity-chart-container {
    height: 150px;
  }
  
  .bar-value {
    font-size: 8px;
    top: -16px;
  }
}

@media (max-width: 600px) {
  .text-h5 {
    font-size: 1.25rem;
  }
  
  .v-btn-toggle {
    flex-wrap: wrap;
  }
  
  .v-btn-toggle .v-btn {
    min-width: 36px;
    padding: 0 8px;
    font-size: 0.7rem;
  }
}

/* Scrollbar styling for overflow containers */
.v-card-text::-webkit-scrollbar {
  width: 4px;
}

.v-card-text::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
}

.v-card-text::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.v-card-text::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Timeline adjustments */
.v-timeline-item {
  padding-bottom: 8px;
}

.v-timeline-item:last-child {
  padding-bottom: 0;
}

/* Chip adjustments */
.v-chip {
  transition: all 0.2s ease;
}

.v-chip:hover {
  transform: translateY(-1px);
}

/* Table hover effects */
.v-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02) !important;
}

/* Progress circular adjustments */
.v-progress-circular {
  transition: all 0.3s ease;
}

/* Card hover effects */
.v-card {
  transition: box-shadow 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

/* Footer adjustments */
.v-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.v-footer:hover {
  background-color: rgba(0, 0, 0, 0.01);
}
</style>