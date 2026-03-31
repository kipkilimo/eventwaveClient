<template>
  <RouterView />

  <!-- Flash alert with proper visibility handling -->
  <transition name="flash">
    <div
      v-if="alert.visible"
      :class="['flash-alert', alert.type]"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ alert.message }}
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { RouterView } from 'vue-router';
import { socketService } from '@/plugins/socket';
import { useSocketStore } from '@/stores/socket';

// Types
type AlertType = 'info' | 'success' | 'error' | 'connecting';

interface AlertState {
  visible: boolean;
  message: string;
  type: AlertType;
}

// Constants
const ALERT_DURATION = 2000; // ms

// Store
const socketStore = useSocketStore();

// Reactive state
const alert = ref<AlertState>({
  visible: false,
  message: '',
  type: 'info',
});

let alertTimeout: ReturnType<typeof setTimeout> | null = null;
let cleanupListeners: (() => void) | null = null;

// ------------------- ALERT UTILS -------------------
const clearAlertTimer = () => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }
};

const hideAlert = () => {
  alert.value.visible = false;
};

const showAlert = (message: string, type: AlertType = 'info') => {
  clearAlertTimer();

  alert.value = {
    visible: true,
    message,
    type,
  };

  alertTimeout = setTimeout(() => {
    hideAlert();
    alertTimeout = null;
  }, ALERT_DURATION);
};

// ------------------- SOCKET HANDLERS -------------------
const handleConnecting = () => {
  if (socketStore) {
    socketStore.isConnecting = true;
  }
  showAlert('Connecting to server...', 'connecting');
};

const handleConnect = () => {
  if (socketStore) {
    socketStore.isConnecting = false;
    socketStore.isConnected = true;
  }
  showAlert('Connected', 'success');
};

const handleDisconnect = (reason?: string) => {
  if (socketStore) {
    socketStore.isConnected = false;
    socketStore.isConnecting = false;
  }

  const message = reason?.includes('transport close') || reason === 'io client disconnect'
    ? 'Disconnected: Page navigation'
    : 'Disconnected from server';

  showAlert(message, 'error');
};

const handleConnectError = (error?: Error) => {
  if (socketStore) {
    socketStore.isConnecting = false;
  }

  const message = error?.message?.includes('timeout')
    ? 'Connection timeout. Please check your network.'
    : 'Connection error. Please check your internet connection.';

  showAlert(message, 'error');
};

// ------------------- SOCKET SETUP -------------------
const setupSocketListeners = (): (() => void) | null => {
  try {
    // Determine socket interface
    const hasDirectAPI = typeof socketService?.on === 'function';
    const hasSocketAPI = socketService?.socket && typeof socketService.socket.on === 'function';

    if (!hasDirectAPI && !hasSocketAPI) {
      console.warn('Socket service not properly initialized');
      showAlert('Connection service unavailable', 'error');
      return null;
    }

    // Get on/off methods
    const on = hasDirectAPI
      ? socketService.on.bind(socketService)
      : socketService.socket.on.bind(socketService.socket);

    const off = hasDirectAPI
      ? socketService.off.bind(socketService)
      : socketService.socket.off.bind(socketService.socket);

    // Register event handlers
    const events: Array<[string, (...args: any[]) => void]> = [
      ['connecting', handleConnecting],
      ['connect', handleConnect],
      ['disconnect', handleDisconnect],
      ['connect_error', handleConnectError],
    ];

    events.forEach(([event, handler]) => {
      on(event, handler);
    });

    // Return cleanup function
    return () => {
      events.forEach(([event, handler]) => {
        try {
          off(event, handler);
        } catch (e) {
          console.debug('Error removing listener:', e);
        }
      });
    };
  } catch (err) {
    console.error('Socket setup error:', err);
    handleConnectError(err as Error);
    return null;
  }
};

// ------------------- LIFECYCLE -------------------
onMounted(() => {
  // Setup socket listeners
  cleanupListeners = setupSocketListeners();

  // Attempt connection if method exists
  try {
    socketService?.connect?.();
  } catch (err) {
    console.error('Socket connection error:', err);
    handleConnectError(err as Error);
  }
});

onUnmounted(() => {
  // Clean up listeners (safe call)
  if (cleanupListeners) {
    cleanupListeners();
    cleanupListeners = null;
  }

  // Clean up socket resources
  try {
    socketService?.cleanup?.();
  } catch (err) {
    console.debug('Socket cleanup error:', err);
  }

  // Clear alert timer
  clearAlertTimer();
});

// Optional: Watch connection status for debugging
watch(
  () => socketStore?.isConnected,
  (isConnected) => {
    if (!isConnected && socketStore?.isConnecting === false) {
      console.debug('Socket disconnected');
    }
  }
);
</script>

<style scoped>
/* Flash alert styling - optimized for performance and accessibility */
.flash-alert {
  --alert-bg: #cfe2ff;
  --alert-color: #084298;
  --alert-border: #0d6efd;
  
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  min-width: 220px;
  max-width: 90%;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
  cursor: default;
  backdrop-filter: blur(2px);
  border-left: 3px solid var(--alert-border);
  transition: all 0.25s ease;
}

/* Variant colors */
.flash-alert.connecting {
  --alert-bg: #fff3cd;
  --alert-color: #856404;
  --alert-border: #ffc107;
  background: var(--alert-bg);
  color: var(--alert-color);
}

.flash-alert.success {
  --alert-bg: #d4edda;
  --alert-color: #155724;
  --alert-border: #28a745;
  background: var(--alert-bg);
  color: var(--alert-color);
}

.flash-alert.error {
  --alert-bg: #f8d7da;
  --alert-color: #721c24;
  --alert-border: #dc3545;
  background: var(--alert-bg);
  color: var(--alert-color);
}

.flash-alert.info {
  --alert-bg: #cfe2ff;
  --alert-color: #084298;
  --alert-border: #0d6efd;
  background: var(--alert-bg);
  color: var(--alert-color);
}

/* Animation - smooth and performant */
.flash-enter-active,
.flash-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.flash-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
}

.flash-enter-to {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.flash-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.flash-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

/* Responsive design */
@media (max-width: 600px) {
  .flash-alert {
    top: 12px;
    min-width: 180px;
    max-width: calc(100% - 24px);
    padding: 8px 12px;
    font-size: 0.8125rem;
  }
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .flash-enter-active,
  .flash-leave-active {
    transition: opacity 0.1s ease;
  }
  
  .flash-enter-from,
  .flash-leave-to {
    transform: translateX(-50%);
  }
}
</style>