<template>
  <div class="notification-container">
    <v-snackbar
      v-for="notification in notifications"
      :key="notification.id"
      v-model="snackbarVisible[notification.id]"
      :timeout="notification.duration"
      :color="getColor(notification.type)"
      location="top end"
      variant="flat"
      :multi-line="true"
    >
      <div class="d-flex align-center">
        <v-icon :icon="getIcon(notification.type)" class="mr-3" size="24" />
        <div class="flex-grow-1">
          <div v-if="notification.title" class="font-weight-bold">
            {{ notification.title }}
          </div>
          <div>{{ notification.message }}</div>
        </div>
        <v-btn
          variant="text"
          icon="mdi-close"
          density="comfortable"
          @click="closeNotification(notification.id)"
        />
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNotification } from '@/composables/useNotification'

const { notifications, removeNotification } = useNotification()

// Track visibility for each notification
const snackbarVisible = ref<Record<string, boolean>>({})

// Watch for new notifications
watch(notifications, (newNotifications) => {
  newNotifications.forEach(notification => {
    if (!snackbarVisible.value[notification.id]) {
      snackbarVisible.value[notification.id] = true
    }
  })
}, { deep: true })

// Watch for visibility changes
watch(snackbarVisible, (newValue) => {
  Object.entries(newValue).forEach(([id, visible]) => {
    if (!visible) {
      removeNotification(id)
    }
  })
}, { deep: true })

const getColor = (type: string) => {
  switch (type) {
    case 'success': return 'success'
    case 'error': return 'error'
    case 'warning': return 'warning'
    case 'info': return 'info'
    default: return 'primary'
  }
}

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return 'mdi-check-circle'
    case 'error': return 'mdi-alert-circle'
    case 'warning': return 'mdi-alert'
    case 'info': return 'mdi-information'
    default: return 'mdi-bell'
  }
}

const closeNotification = (id: string) => {
  snackbarVisible.value[id] = false
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

:deep(.v-snackbar) {
  margin-bottom: 10px;
}
</style>