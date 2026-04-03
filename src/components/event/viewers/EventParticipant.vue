<template>
    <v-container fluid class="pa-2 pa-md-3">
      <v-card class="main-card" elevation="3" rounded="xl">
        <!-- Loading -->
        <v-row v-if="eventStore.isLoading" class="pa-8">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate color="primary" size="64" />
            <p class="mt-4 text-body-1">Loading event details...</p>
          </v-col>
        </v-row>

        <!-- Error -->
        <v-row v-else-if="eventStore.error" class="pa-8">
          <v-col cols="12" class="text-center">
            <v-icon size="64" color="error">mdi-alert-circle</v-icon>
            <p class="mt-4 text-body-1">{{ eventStore.error }}</p>
            <v-btn color="primary" @click="retryLoad">Retry</v-btn>
          </v-col>
        </v-row>

        <!-- Content -->
        <template v-else-if="event"> 
          <!-- HERO -->
          <div class="hero-section" :style="heroStyle">
            <div class="hero-content">
              <div class="d-flex align-center ga-4 flex-wrap">

                <v-avatar size="80" rounded="lg" class="hero-logo elevation-3">
                  <v-img :src="event?.branding?.logoUrl" contain />
                </v-avatar>

                <div class="hero-text">
                  <div class="text-h3 font-weight-bold text-white">
                    {{ event.title }}
                  </div>

                  <div class="text-subtitle-1 text-white text-opacity-90 mt-1">
                    {{ event?.branding?.tagline || 'Professional Training Event' }}
                  </div>

                  <!-- Status Chips -->
<div class="d-flex flex-wrap ga-2 mt-3">

  <!-- Temporal Status -->
  <v-chip
    :style="{
      backgroundColor: temporalStatus.color || '#1976D2',
      color: '#fff',
      fontWeight: 500
    }"
    size="small"
  >
    <v-icon start size="small" style="color:#fff">
      {{ temporalStatus.icon }}
    </v-icon>
    {{ temporalStatus.label }}
  </v-chip>

  <!-- Event Status -->
  <v-chip
    :style="{
      backgroundColor: statusColor || '#2E7D32',
      color: '#fff',
      fontWeight: 500
    }"
    size="small"
  >
    <v-icon start size="small" style="color:#fff">
      mdi-check-circle
    </v-icon>
    {{ event.status }}
  </v-chip>

  <!-- Event Type -->
  <v-chip
    :style="{
      backgroundColor: eventTypeColor || '#6D4C41',
      color: '#fff',
      fontWeight: 500,
      border: 'none'
    }"
    size="small"
  >
    {{ event.eventType }}
  </v-chip>

</div>
                </div>

              </div>
            </div>
          </div>

          <!-- BODY -->
          <v-container fluid class="pa-6">
            <v-row>

              <!-- LEFT COLUMN -->
              <v-col cols="12" lg="8">

                <!-- Description -->
                <v-card class="mb-6" variant="outlined" rounded="lg">
                  <v-card-title class="text-h6 font-weight-bold pa-4 pb-2">
                    <v-icon start class="mr-2">mdi-information</v-icon>
                    About This Event
                  </v-card-title>
                  <v-divider />
                  <v-card-text class="pa-2">
                    <p class="text-body-1">
                      {{ event.description }}
                    </p>
                  </v-card-text>
                </v-card>

                <!-- Access Credentials -->
                <v-card v-if="event.eventSecret" class="mb-6" variant="outlined" rounded="lg">
                  <v-card-title class="text-h6 font-weight-bold pa-4 pb-2">
                    <v-icon start class="mr-2">mdi-key</v-icon>
                    Access Credentials
                  </v-card-title>
                  <v-divider />
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center ga-2">
                      <v-icon color="primary">mdi-lock</v-icon>
                      <div>
                        <div class="text-caption text-grey">Event Secret</div>
                        <div class="text-h6 font-mono">{{ event.eventSecret }}</div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Date & Time -->
                <v-card class="mb-6" variant="outlined" rounded="lg">
                  <v-card-title class="text-h6 font-weight-bold pa-4 pb-2">
                    <v-icon start class="mr-2">mdi-calendar-clock</v-icon>
                    Date & Time
                  </v-card-title>
                  <v-divider />
                  <v-card-text class="pa-4">
                    <v-row>
                      <v-col cols="12" sm="6">
                        <div class="d-flex align-center ga-3">
                          <v-icon color="primary" size="36">mdi-calendar-start</v-icon>
                          <div>
                            <div class="text-caption text-grey">Start</div>
                            <div class="text-h6 font-weight-medium">{{ formattedStartDate }}</div>
                            <div class="text-body-2 text-grey">{{ formattedStartTime }}</div>
                          </div>
                        </div>
                      </v-col>

                      <v-col cols="12" sm="6">
                        <div class="d-flex align-center ga-3">
                          <v-icon color="error" size="36">mdi-calendar-end</v-icon>
                          <div>
                            <div class="text-caption text-grey">End</div>
                            <div class="text-h6 font-weight-medium">{{ formattedEndDate }}</div>
                            <div class="text-body-2 text-grey">{{ formattedEndTime }}</div>
                          </div>
                        </div>
                      </v-col>
                    </v-row>

                    <v-divider class="my-3" />

                    <div class="d-flex flex-wrap ga-2">
                      <v-chip size="small" color="primary" variant="tonal">
                        <v-icon start size="small">mdi-clock-outline</v-icon>
                        Duration: {{ durationFormatted }}
                      </v-chip>
                      <v-chip size="small" color="info" variant="tonal">
                        <v-icon start size="small">mdi-map-marker</v-icon>
                        {{ event?.metadata?.timezone || 'Africa/Nairobi' }}
                      </v-chip>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Location -->
                <v-card class="mb-6" variant="outlined" rounded="lg">
                  <v-card-title class="text-h6 font-weight-bold pa-4 pb-2">
                    <v-icon start class="mr-2">mdi-map-marker</v-icon>
                    Location
                  </v-card-title>
                  <v-divider />
                  <v-card-text class="pa-4">
                    <div class="d-flex align-start ga-3">
                      <v-icon :color="event?.location?.isVirtual ? 'success' : 'primary'" size="32">
                        {{ event?.location?.isVirtual ? 'mdi-video' : 'mdi-office-building' }}
                      </v-icon>
                      <div>
                        <div class="text-h6">{{ event?.location?.name || 'Location TBA' }}</div>
                        <div class="text-body-2 text-grey">{{ event?.location?.address || 'Address to be announced' }}</div>
                        <v-chip
                          v-if="event?.location?.isVirtual && event?.location?.virtualLink"
                          size="small"
                          color="success"
                          class="mt-2"
                          @click="openVirtualLink"
                        >
                          <v-icon start size="small">mdi-webcam</v-icon>
                          Join Virtual Event
                        </v-chip>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Interactive Features -->
                <v-card class="mb-6" variant="outlined" rounded="lg">
                  <v-card-title class="text-h6 font-weight-bold pa-4 pb-2">
                    <v-icon start class="mr-2">mdi-connection</v-icon>
                    Interactive Features
                  </v-card-title>
                  <v-divider />
                  <v-card-text class="pa-4">
                    <v-row dense>
                      <v-col
                        v-for="feature in interactivityFeatures"
                        :key="feature.key"
                        cols="6"
                        sm="4"
                        md="3"
                      >
                        <div class="d-flex align-center ga-2">
                          <v-icon :color="feature.enabled ? 'success' : 'grey'" size="20">
                            {{ feature.enabled ? 'mdi-check-circle' : 'mdi-close-circle' }}
                          </v-icon>
                          <span :class="{ 'text-grey': !feature.enabled }">{{ feature.label }}</span>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

              </v-col>

              <!-- RIGHT COLUMN - SIDEBAR -->
              <v-col cols="12" lg="4">

                <!-- Countdown Card -->
                <v-card v-if="temporalStatus.type === 'upcoming'" class="mb-6" elevation="2" rounded="lg">
                  <v-card-text class="pa-4 text-center">
                    <div class="text-caption text-grey mb-2">Event Starts In</div>
                    <div class="countdown-timer">
                      <div class="countdown-block">
                        <span class="countdown-value">{{ countdown.days }}</span>
                        <span class="countdown-label">days</span>
                      </div>
                      <div class="countdown-block">
                        <span class="countdown-value">{{ countdown.hours }}</span>
                        <span class="countdown-label">hrs</span>
                      </div>
                      <div class="countdown-block">
                        <span class="countdown-value">{{ countdown.minutes }}</span>
                        <span class="countdown-label">mins</span>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Live Now Card -->
                <v-card v-if="temporalStatus.type === 'live'" class="mb-6" elevation="2" rounded="lg" color="error" dark>
                  <v-card-text class="pa-4 text-center">
                    <v-icon size="32" color="white" class="mb-2">mdi-record-rec</v-icon>
                    <div class="text-h6 font-weight-bold text-white">Live Now</div>
                    <div class="text-body-2 text-white text-opacity-90">Join the event in progress</div>
                  </v-card-text>
                </v-card>

                <!-- Event Stats -->
                <v-card class="mb-6" variant="outlined" rounded="lg">
                  <v-card-title class="text-h6 font-weight-bold pa-4 pb-2">
                    <v-icon start class="mr-2">mdi-chart-box</v-icon>
                    Event Overview
                  </v-card-title>
                  <v-divider />
                  <v-card-text class="pa-0">
                    <v-list density="compact">
                      <v-list-item>
                        <template #prepend><v-icon>mdi-account-group</v-icon></template>
                        <v-list-item-title>Capacity</v-list-item-title>
                        <template #append>
                          <v-chip color="primary" size="small">{{ event.capacity }} attendees</v-chip>
                        </template>
                      </v-list-item>
                      <v-divider inset />
                      <v-list-item>
                        <template #prepend><v-icon>mdi-cash</v-icon></template>
                        <v-list-item-title>Pricing</v-list-item-title>
                        <template #append>
                          <v-chip :color="event.isFreeEvent ? 'success' : 'warning'" size="small">
                            {{ event.isFreeEvent ? 'Free' : `Paid (${event?.billing?.currency || 'USD'})` }}
                          </v-chip>
                        </template>
                      </v-list-item>
                      <v-divider inset />
                      <v-list-item>
                        <template #prepend><v-icon>mdi-chart-timeline-variant</v-icon></template>
                        <v-list-item-title>Billing Status</v-list-item-title>
                        <template #append>
                          <v-chip :color="billingStatusColor" size="small">
                            {{ event?.billing?.status || 'N/A' }}
                          </v-chip>
                        </template>
                      </v-list-item>
                      <v-divider inset />
                      <v-list-item>
                        <template #prepend><v-icon>mdi-account-multiple</v-icon></template>
                        <v-list-item-title>Participants</v-list-item-title>
                        <template #append>
                          <v-chip color="info" size="small">{{ event?.participants?.length || 0 }} registered</v-chip>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>

                <!-- Facilitators -->
                <v-card v-if="event.facilitators?.length" class="mb-6" variant="outlined" rounded="lg">
                  <v-card-title class="text-h6 font-weight-bold pa-4 pb-2">
                    <v-icon start class="mr-2">mdi-school</v-icon>
                    Facilitators
                  </v-card-title>
                  <v-divider />
                  <v-card-text class="pa-0">
                    <v-list>
                      <v-list-item v-for="facilitator in event.facilitators" :key="facilitator.name">
                        <template #prepend>
                          <v-avatar size="36" color="primary-lighten-4">
                            <v-icon color="primary">mdi-account-tie</v-icon>
                          </v-avatar>
                        </template>
                        <v-list-item-title>{{ facilitator.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ facilitator.role }}</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>

                <!-- Admins -->
                <v-card v-if="event.admins?.length" class="mb-6" variant="outlined" rounded="lg">
                  <v-card-title class="text-h6 font-weight-bold pa-4 pb-2">
                    <v-icon start class="mr-2">mdi-shield-account</v-icon>
                    Event Admins
                  </v-card-title>
                  <v-divider />
                  <v-card-text class="pa-0">
                    <v-list>
                      <v-list-item v-for="admin in event.admins" :key="admin.name">
                        <template #prepend>
                          <v-avatar size="36" color="grey-lighten-3">
                            <v-icon color="grey">mdi-account-cog</v-icon>
                          </v-avatar>
                        </template>
                        <v-list-item-title>{{ admin.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ admin.role }}</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>

                <!-- Categories & Tags -->
                <v-card class="mb-6" variant="outlined" rounded="lg">
                  <v-card-title class="text-h6 font-weight-bold pa-4 pb-2">
                    <v-icon start class="mr-2">mdi-tag-multiple</v-icon>
                    Categories & Tags
                  </v-card-title>
                  <v-divider />
                  <v-card-text class="pa-4">
                    <div v-if="event.categories?.length" class="mb-3">
                      <div class="text-caption text-grey mb-2">Categories</div>
                      <div class="d-flex flex-wrap ga-2">
                        <v-chip v-for="category in event.categories" :key="category" color="primary" size="small">
                          {{ category }}
                        </v-chip>
                      </div>
                    </div>
                    <div v-if="event.tags?.length">
                      <div class="text-caption text-grey mb-2">Tags</div>
                      <div class="d-flex flex-wrap ga-2">
                        <v-chip v-for="tag in event.tags" :key="tag" color="secondary" variant="tonal" size="small">
                          #{{ tag }}
                        </v-chip>
                      </div>
                    </div>
                    <div v-if="!event.categories?.length && !event.tags?.length" class="text-grey text-center py-2">
                      No categories or tags
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Action Buttons -->
                <v-card class="mb-6" elevation="2" rounded="lg">
                  <v-card-text class="pa-4">
                    <v-alert
                      v-if="eventStore.registrationStatus === 'success'"
                      type="success"
                      variant="tonal"
                      class="mb-3"
                      closable
                      @click:close="eventStore.clearRegistrationStatus"
                    >
                      Successfully registered for this event!
                    </v-alert>

                    <v-alert
                      v-if="eventStore.registrationStatus === 'error'"
                      type="error"
                      variant="tonal"
                      class="mb-3"
                      closable
                      @click:close="eventStore.clearRegistrationStatus"
                    >
                      Registration failed. Please try again.
                    </v-alert>

                    <v-alert
                      v-if="eventStore.calendarAdded"
                      type="info"
                      variant="tonal"
                      class="mb-3"
                      closable
                      @click:close="eventStore.clearCalendarAdded"
                    >
                      Event added to your calendar!
                    </v-alert>

                    <v-btn
                      block
                      color="primary"
                      size="large"
                      class="mb-3"
                      :loading="eventStore.registrationStatus === 'loading'"
                      @click="eventStore.registerForEvent"
                      :disabled="temporalStatus.type === 'past'"
                    >
                      <v-icon start>mdi-account-plus</v-icon>
                      {{ temporalStatus.type === 'past' ? 'Event Ended' : 'Register for Event' }}
                    </v-btn>

                    <v-btn
                      block
                      variant="outlined"
                      color="primary"
                      @click="eventStore.addToCalendar"
                      :disabled="temporalStatus.type === 'past'"
                    >
                      <v-icon start>mdi-calendar-plus</v-icon>
                      Add to Calendar
                    </v-btn>
                  </v-card-text>
                </v-card>

              </v-col>

            </v-row>
          </v-container>

        </template>

      </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useEventStore } from '@/stores/event'

const props = defineProps<{
  eventId?: string
  eventData?: any
}>()

const eventStore = useEventStore()
const now = ref(new Date())
let countdownInterval: ReturnType<typeof setInterval> | null = null

// Computed for easy access
const event = computed(() => eventStore.currentEvent)

const heroStyle = computed(() => {
  const color = event.value?.branding?.themeColor || '#1772ca'
  const banner = event.value?.branding?.bannerBg || ''
  const gradient = `linear-gradient(135deg, ${color}cc, ${color}99)`

  return {
    backgroundImage: banner ? `url(${banner}), ${gradient}` : gradient,
    backgroundSize: banner ? 'cover' : 'auto',
    backgroundPosition: 'center',
    backgroundBlend: 'overlay'
  }
})
// Methods
const handleDialogClose = (dialogName) => {
  dialogStore.handleDialogClose(dialogName)
}
// Temporal Status (Upcoming, Live, Past)
const temporalStatus = computed(() => {
  if (!event.value?.dateTime?.start || !event.value?.dateTime?.end) {
    return { type: 'unknown', label: 'Status Unknown', color: 'grey', icon: 'mdi-help-circle' }
  }
  
  const nowDate = now.value
  const startDate = new Date(event.value.dateTime.start)
  const endDate = new Date(event.value.dateTime.end)
  
  if (nowDate < startDate) {
    const diffMs = startDate.getTime() - nowDate.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    const diffHours = diffMs / (1000 * 60 * 60)
    
    if (diffHours < 1) {
      const minutes = Math.floor(diffMs / (1000 * 60))
      return { 
        type: 'upcoming', 
        label: `Starts in ${minutes} minute${minutes !== 1 ? 's' : ''}`, 
        color: 'warning',
        icon: 'mdi-timer-sand'
      }
    } else if (diffHours < 24) {
      const hours = Math.floor(diffHours)
      return { 
        type: 'upcoming', 
        label: `Starts in ${hours} hour${hours !== 1 ? 's' : ''}`, 
        color: 'warning',
        icon: 'mdi-clock-alert'
      }
    } else if (diffDays < 7) {
      return { 
        type: 'upcoming', 
        label: `Starts in ${Math.floor(diffDays)} day${Math.floor(diffDays) !== 1 ? 's' : ''}`, 
        color: 'info',
        icon: 'mdi-calendar-clock'
      }
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return { 
        type: 'upcoming', 
        label: `Starts in ${weeks} week${weeks !== 1 ? 's' : ''}`, 
        color: 'info',
        icon: 'mdi-calendar-week'
      }
    } else {
      const months = Math.floor(diffDays / 30)
      return { 
        type: 'upcoming', 
        label: `Starts in ${months} month${months !== 1 ? 's' : ''}`, 
        color: 'secondary',
        icon: 'mdi-calendar-month'
      }
    }
  } else if (nowDate >= startDate && nowDate <= endDate) {
    const diffMs = endDate.getTime() - nowDate.getTime()
    const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60))
    const minsLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hoursLeft === 0 && minsLeft > 0) {
      return { 
        type: 'live', 
        label: `Live • ${minsLeft} min${minsLeft !== 1 ? 's' : ''} left`, 
        color: 'error',
        icon: 'mdi-record-rec'
      }
    } else if (hoursLeft > 0) {
      return { 
        type: 'live', 
        label: `Live • ${hoursLeft} hr${hoursLeft !== 1 ? 's' : ''} left`, 
        color: 'error',
        icon: 'mdi-record-rec'
      }
    }
    return { 
      type: 'live', 
      label: 'Live Now', 
      color: 'error',
      icon: 'mdi-record-rec'
    }
  } else {
    const diffMs = nowDate.getTime() - endDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays < 1) {
      return { type: 'past', label: 'Ended today', color: 'grey', icon: 'mdi-check-decagram' }
    } else if (diffDays === 1) {
      return { type: 'past', label: 'Ended yesterday', color: 'grey', icon: 'mdi-check-decagram' }
    }
    return { type: 'past', label: `Ended ${diffDays} days ago`, color: 'grey', icon: 'mdi-check-decagram' }
  }
})

// Countdown timer values
const countdown = computed(() => {
  if (!event.value?.dateTime?.start || temporalStatus.value.type !== 'upcoming') {
    return { days: 0, hours: 0, minutes: 0 }
  }
  
  const nowDate = now.value
  const startDate = new Date(event.value.dateTime.start)
  const diffMs = startDate.getTime() - nowDate.getTime()
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  return { days, hours, minutes }
})

// Status colors
const statusColor = computed(() => {
  const status = event.value?.status?.toUpperCase()
  switch (status) {
    case 'PUBLISHED': return 'success'
    case 'DRAFT': return 'warning'
    case 'CANCELLED': return 'error'
    case 'COMPLETED': return 'info'
    default: return 'primary'
  }
})

const eventTypeColor = computed(() => {
  const type = event.value?.eventType?.toUpperCase()
  switch (type) {
    case 'TRAINING': return 'primary'
    case 'WORKSHOP': return 'secondary'
    case 'SEMINAR': return 'info'
    case 'CONFERENCE': return 'warning'
    default: return 'grey'
  }
})

const billingStatusColor = computed(() => {
  const status = event.value?.billing?.status?.toUpperCase()
  switch (status) {
    case 'PAID': return 'success'
    case 'PENDING': return 'warning'
    case 'FAILED': return 'error'
    default: return 'info'
  }
})

// Date formatting
const formattedStartDate = computed(() => {
  if (!event.value?.dateTime?.start) return ''
  const date = new Date(event.value.dateTime.start)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const formattedStartTime = computed(() => {
  if (!event.value?.dateTime?.start) return ''
  const date = new Date(event.value.dateTime.start)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })
})

const formattedEndDate = computed(() => {
  if (!event.value?.dateTime?.end) return ''
  const date = new Date(event.value.dateTime.end)
  const startDate = event.value.dateTime.start ? new Date(event.value.dateTime.start) : null
  if (startDate && date.toDateString() === startDate.toDateString()) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const formattedEndTime = computed(() => {
  if (!event.value?.dateTime?.end) return ''
  const date = new Date(event.value.dateTime.end)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })
})

// Duration formatting
const durationFormatted = computed(() => {
  if (event.value?.eventDuration) {
    const dur = event.value.eventDuration
    if (dur.hours >= 1) {
      const mins = dur.minutes % 60
      return mins > 0 ? `${dur.hours} hr ${mins} min` : `${dur.hours} hr`
    }
    return `${dur.minutes} min`
  }
  if (event.value?.dateTime?.start && event.value?.dateTime?.end) {
    const start = new Date(event.value.dateTime.start)
    const end = new Date(event.value.dateTime.end)
    const diffMs = end.getTime() - start.getTime()
    const diffHrs = diffMs / (1000 * 60 * 60)
    if (diffHrs >= 1) {
      const hrs = Math.floor(diffHrs)
      const mins = Math.round((diffHrs - hrs) * 60)
      return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`
    }
    const mins = Math.round(diffMs / (1000 * 60))
    return `${mins} min`
  }
  return 'N/A'
})

// Interactivity features
const interactivityFeatures = computed(() => {
  const interactivity = event.value?.interactivity || {}
  return [
    { key: 'chat', label: 'Live Chat', enabled: interactivity.allowChat ?? true },
    { key: 'privateMessages', label: 'Private Messages', enabled: interactivity.allowPrivateMessages ?? false },
    { key: 'polls', label: 'Live Polls', enabled: interactivity.allowPolls ?? true },
    { key: 'qnA', label: 'Q&A Session', enabled: interactivity.allowQnA ?? true },
    { key: 'feedback', label: 'Feedback', enabled: interactivity.allowFeedback ?? true },
    { key: 'screenSharing', label: 'Screen Sharing', enabled: interactivity.allowScreenSharing ?? false },
    { key: 'breakoutRooms', label: 'Breakout Rooms', enabled: interactivity.allowBreakoutRooms ?? false },
    { key: 'whiteboard', label: 'Whiteboard', enabled: interactivity.allowWhiteboard ?? false },
    { key: 'reactions', label: 'Live Reactions', enabled: interactivity.liveReactions ?? true },
    { key: 'raiseHand', label: 'Raise Hand', enabled: interactivity.raiseHandFeature ?? true }
  ]
})

// Methods
const retryLoad = () => {
  if (props.eventId) {
    eventStore.fetchEvent(props.eventId)
  }
}

const openVirtualLink = () => {
  if (event.value?.location?.virtualLink) {
    window.open(event.value.location.virtualLink, '_blank')
  }
}

// Start countdown timer (updates every minute)
const startCountdownTimer = () => {
  if (countdownInterval) clearInterval(countdownInterval)
  countdownInterval = setInterval(() => {
    now.value = new Date()
  }, 60000)
}

// Lifecycle
onMounted(() => {
  // if (props.eventData) {
  //   eventStore.currentEvent(props.eventData)
  // } else if (props.eventId) {
  //   eventStore.fetchEvent(props.eventId)
  // }
  startCountdownTimer()
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
.event-viewer {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef2f5 100%);
}

.main-card {
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px !important;
  height: auto;
  max-height: 84vh;
  scrollbar-width: thin; /* For Firefox - optional */
}

/* For WebKit browsers (Chrome, Safari, Edge) - optional */
.main-card::-webkit-scrollbar {
  width: 8px;
}

.main-card::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.main-card::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.main-card::-webkit-scrollbar-thumb:hover {
  background: #555;
}
.hero-section {
  min-height: 280px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  position: relative;
}

.hero-content {
  padding: 32px 40px;
  width: 100%;
}

.hero-logo {
  background: white;
  padding: 8px;
  border: 2px solid white;
}

.hero-text {
  max-width: 600px;
}

.countdown-timer {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.countdown-block {
  text-align: center;
  min-width: 60px;
}

.countdown-value {
  font-size: 32px;
  font-weight: 700;
  color: #1772ca;
  display: block;
  line-height: 1.2;
}

.countdown-label {
  font-size: 11px;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 0.5px;
}

.leading-relaxed {
  line-height: 1.7;
}

.font-mono {
  font-family: 'Roboto Mono', monospace;
  letter-spacing: 0.5px;
}
</style>