<script setup lang="ts">
import { ref } from 'vue';
import { useCustomizerStore } from '../../../stores/customizer';
import { BellIcon, SettingsIcon, Menu2Icon } from 'vue-tabler-icons';
import { useUserStore } from '@/stores/user';
import NotificationDD from './NotificationDD.vue';
import ProfileDD from './ProfileDD.vue';

const userStore = useUserStore();
const customizer = useCustomizerStore();
</script>

<template>
  <v-app-bar 
    elevation="0" 
    height="56"
    class="app-header"
  >
    <!-- Left Section: Navigation Controls -->
    <div class="d-flex align-center">
      <!-- Desktop Sidebar Toggle -->
      <v-btn
        class="hidden-md-and-down"
        icon
        variant="text"
        size="small"
        @click.stop="customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)"
      >
        <Menu2Icon size="20" stroke-width="1.5" />
      </v-btn>

      <!-- Mobile Sidebar Toggle -->
      <v-btn
        class="hidden-lg-and-up"
        icon
        variant="text"
        size="small"
        @click.stop="customizer.SET_SIDEBAR_DRAWER"
      >
        <Menu2Icon size="20" stroke-width="1.5" />
      </v-btn>
    </div>

    <v-spacer />

    <!-- Right Section: Actions -->
    <div class="d-flex align-center">
      <!-- Notification -->
      <v-menu 
        :close-on-content-click="false"
        location="bottom end"
        offset="8"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            variant="text"
            size="small"
            class="action-btn"
            v-bind="props"
          >
            <BellIcon stroke-width="1.5" size="20" />
          </v-btn>
        </template>
        <v-card 
          class="dropdown-card" 
          width="320" 
          elevation="8"
        >
          <NotificationDD />
        </v-card>
      </v-menu>

      <!-- User Profile -->
      <v-menu 
        :close-on-content-click="false"
        location="bottom end"
        offset="8"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            variant="text"
            class="profile-btn"
            v-bind="props"
          >
            <v-avatar size="28" class="mr-2">
              <img 
                src="@/assets/images/profile/user-round.svg" 
                alt="User Profile"
                class="profile-img"
              />
            </v-avatar>
            <SettingsIcon stroke-width="1.5" size="18" />
          </v-btn>
        </template>
        <v-card 
          class="dropdown-card" 
          width="320" 
          elevation="8"
        >
          <ProfileDD />
        </v-card>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<style scoped>
.app-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  padding: 0 16px;
  min-height: 56px;
}

.action-btn {
  margin: 0 4px;
  color: rgba(0, 0, 0, 0.6);
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: rgba(0, 0, 0, 0.87);
  background: rgba(0, 0, 0, 0.04);
}

.profile-btn {
  margin-left: 8px;
  color: rgba(0, 0, 0, 0.87);
  border-radius: 20px;
  padding: 4px 8px 4px 4px;
  min-width: auto;
  text-transform: none;
  letter-spacing: normal;
}

.profile-btn:hover {
  background: rgba(0, 0, 0, 0.04);
}

.profile-img {
  border: 1.5px solid rgba(0, 0, 0, 0.08);
}

.dropdown-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

/* Mobile Optimizations */
@media (max-width: 959px) {
  .app-header {
    padding: 0 12px;
  }
  
  .action-btn {
    margin: 0 2px;
  }
  
  .profile-btn {
    margin-left: 4px;
    padding: 2px 6px 2px 2px;
  }
}

/* Desktop Enhancements */
@media (min-width: 960px) {
  .app-header {
    padding: 0 24px;
  }
  
  .action-btn,
  .profile-btn {
    border-radius: 8px;
  }
}

/* Touch-friendly targets for mobile */
@media (max-width: 599px) {
  .v-btn {
    min-height: 40px;
    min-width: 40px;
  }
}
</style>