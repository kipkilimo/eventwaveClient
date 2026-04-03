<template>
  <v-navigation-drawer
    left
    v-model="customizer.Sidebar_drawer"
    elevation="0"
    rail-width="75"
    mobile-breakpoint="lg"
    app
    class="leftSidebar"
    :rail="customizer.mini_sidebar"
    expand-on-hover
  >
    <!-- Logo section -->
    <div @click="reloadPage" class="pa-3 text-left" style="cursor: pointer">
      <Logo />
      <v-divider color="#c4d3e9" class="ma-2" />
      <span
        v-if="!customizer.mini_sidebar"
        class="text-overline d-inline-block text-truncate"
        style="max-width: 26ch; line-height: 1.1"
      >
        {{ currentEvent?.title || 'No Event Selected' }}
      </span>
    </div>

    <perfect-scrollbar class="scrollnavbar">
      <!-- Navigation items -->
      <v-list class="pa-1" density="compact" nav>
        <template v-for="(item, i) in sidebarMenu" :key="i">
          
          <!-- Section header -->
          <NavGroup
            v-if="item.header && !customizer.mini_sidebar"
            :item="item"
          />

          <!-- Divider -->
          <v-divider
            v-else-if="item.divider && !customizer.mini_sidebar"
            class="my-1"
          />

          <!-- Collapsible group -->
          <NavCollapse
            v-else-if="item.children && !customizer.mini_sidebar"
            :item="item"
            :level="0"
            class="leftPadding"
          />

          <!-- Single item -->
          <template v-else>
            
            <!-- External link -->
            <v-list-item
              v-if="item.type === 'external'"
              :href="item.to"
              target="_blank"
              rel="noopener noreferrer"
              class="leftPadding"
            >
              <template #prepend>
                <v-icon v-if="item.icon" size="20">
                  mdi-timeline-question-outline
                </v-icon>

              <v-list-item-title class="ml-2" v-if="!customizer.mini_sidebar">
                {{ item.title }}
              </v-list-item-title>
              </template>
            </v-list-item>

            <!-- Internal / tool item -->
            <NavItem
              v-else
              :item="item"
              :mini="customizer.mini_sidebar"
              :hide-text="customizer.mini_sidebar"
              class="leftPadding"
              @click="item.tool ? handleToolClick(item.tool) : null"
            />
          
          </template>

        </template>
      </v-list>

      <!-- Extra box -->
      <div v-if="!customizer.mini_sidebar" class="pa-2">
        <ExtraBox />
      </div>
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { shallowRef, defineAsyncComponent, watch, computed } from "vue";
import { useRouter } from "vue-router";
import NavGroup from "./NavGroup/NavGroup.vue";
import NavItem from "./NavItem/NavItem.vue";
import NavCollapse from "./NavCollapse/NavCollapse.vue";
import ExtraBox from "./extrabox/ExtraBox.vue";
import Logo from "../logo/LogoMain.vue";

import { useCustomizerStore } from "../../../stores/customizer";
import { usePlayerStore } from "@/stores/player";
import { useSidebarItems } from "@/composables/useSidebarItems";
import { useEventStore } from "@/stores/event";

const router = useRouter();

// Store instances
const customizer = useCustomizerStore();
const playerStore = usePlayerStore();
const eventStore = useEventStore();

// Reactive event
const currentEvent = computed(() => eventStore.currentEvent);

// Reactive sidebar menu
const { sidebarItems: sidebarMenu } = useSidebarItems();

/* ---------------- TOOL HANDLING ---------------- */

const reloadPage = () => {
  playerStore.setActiveTool("");
};

const toolComponents: Record<string, () => Promise<any>> = {
  chat: () => import("@/components/event/players/Chat.vue"),
  feedback: () => import("@/components/event/players/Feedback.vue"),
  test: () => import("@/components/event/players/Test.vue"),
  poll: () => import("@/components/event/players/Poll.vue"),
  qna: () => import("@/components/event/players/QnA.vue"),
  media: () => import("@/components/event/players/MediaPlayer.vue"),
  livefeed: () => import("@/components/event/players/LiveFeed.vue"),
};

const activeToolComponent = shallowRef<any>(null);

// Watch for tool changes
watch(
  () => playerStore.activeTool,
  (tool) => {
    if (tool && toolComponents[tool]) {
      activeToolComponent.value = defineAsyncComponent(toolComponents[tool]);
    } else {
      activeToolComponent.value = null;
    }
  },
  { immediate: true }
);

function handleToolClick(tool: string) {
  playerStore.setActiveTool(tool);
}

// Provide activeToolComponent to child components if needed
defineExpose({
  activeToolComponent
});
</script>

<style scoped>
.scrollnavbar {
  height: calc(100vh - 70px);
  overflow-y: auto;
}

.leftSidebar :deep(.v-navigation-drawer__content) {
  overflow: hidden;
}

/* --- Navigation Item Styling for Modern Glow and Divider on Hover --- */

/* Target the list items inside the navigation drawer content */
.leftSidebar :deep(.v-list-item) {
  /* Initial state: no border, mild transition for smooth effects */
  border-left: 2px solid transparent;
  transition: all 0.2s ease-in-out;
  margin-bottom: 2px;
  border-radius: 0 8px 8px 0;
}

/* Style on Hover */
.leftSidebar :deep(.v-list-item:hover) {
  /* Thin vertical divider effect */
  border-left-color: #4caf50;
  
  /* Apply a mild, modern glow */
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.4);
  
  /* Lighten background slightly on hover */
  background-color: rgba(76, 175, 80, 0.05);
}

/* Active state styling */
.leftSidebar :deep(.v-list-item--active) {
  border-left-color: #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
}

/* Ensure active item has stronger visual feedback */
.leftSidebar :deep(.v-list-item--active:hover) {
  background-color: rgba(76, 175, 80, 0.15);
}

/* Icon styling within list items */
.leftSidebar :deep(.v-list-item__prepend) {
  margin-right: 12px;
}

/* Title styling when sidebar is not minimized */
.leftSidebar :deep(.v-list-item-title) {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pa-5 {
    padding: 1rem !important;
  }

  .pa-4 {
    padding: 0.75rem !important;
  }
  
  .scrollnavbar {
    height: calc(100vh - 60px);
  }
}

/* Smooth scrolling for perfect-scrollbar */
.scrollnavbar :deep(.ps__rail-y) {
  opacity: 0.6;
}

.scrollnavbar :deep(.ps__thumb-y) {
  background-color: #c4d3e9;
  border-radius: 4px;
}
</style>