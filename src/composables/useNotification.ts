import { ref, readonly } from "vue";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
}

// Global notification state
const notifications = ref<Notification[]>([]);

// Notification listeners (if you need event-based notifications)
const notificationListeners = ref<Array<(notification: Notification) => void>>(
  [],
);

export function useNotification() {
  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      id,
      ...notification,
      duration: notification.duration || 3000,
    };

    notifications.value.push(newNotification);

    // Notify all listeners
    notificationListeners.value.forEach((listener) => {
      listener(newNotification);
    });

    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };

  const clearAll = () => {
    notifications.value = [];
  };

  // Helper methods for different notification types
  const showNotification = (options: Omit<Notification, "id">) => {
    return addNotification(options);
  };

  const showSuccess = (message: string, title?: string, duration?: number) => {
    return addNotification({ type: "success", message, title, duration });
  };

  const showError = (message: string, title?: string, duration?: number) => {
    return addNotification({ type: "error", message, title, duration });
  };

  const showWarning = (message: string, title?: string, duration?: number) => {
    return addNotification({ type: "warning", message, title, duration });
  };

  const showInfo = (message: string, title?: string, duration?: number) => {
    return addNotification({ type: "info", message, title, duration });
  };

  // Subscribe to notifications (if needed for event-based handling)
  const onNotification = (callback: (notification: Notification) => void) => {
    notificationListeners.value.push(callback);
    return () => {
      const index = notificationListeners.value.indexOf(callback);
      if (index !== -1) {
        notificationListeners.value.splice(index, 1);
      }
    };
  };

  return {
    notifications: readonly(notifications),
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAll,
    onNotification,
  };
}
