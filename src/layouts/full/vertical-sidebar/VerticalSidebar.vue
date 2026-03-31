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
        {{ currentEvent?.title }}
      </span>
    </div>

    <perfect-scrollbar class="scrollnavbar">
      <!-- Navigation items -->
      <v-list class="pa-1" density="compact" nav>
        <template v-for="(item, i) in sidebarMenu" :key="i">
          <!-- Section header (e.g. Support) - hide when collapsed -->
          <NavGroup
            v-if="item.header && !customizer.mini_sidebar"
            :item="item"
          />

          <!-- Divider - hide when collapsed -->
          <v-divider
            v-else-if="item.divider && !customizer.mini_sidebar"
            class="my-1"
          />

          <!-- Collapsible group - hide when collapsed -->
          <NavCollapse
            v-else-if="item.children && !customizer.mini_sidebar"
            :item="item"
            :level="0"
            class="leftPadding"
          />

          <!-- Single item - show with conditional text visibility -->
          <NavItem
            v-else
            :item="item"
            :mini="customizer.mini_sidebar"
            class="leftPadding"
            :hide-text="customizer.mini_sidebar"
            @click="item.tool ? handleToolClick(item.tool) : null"
          />
        </template>
      </v-list>

      <!-- Extra box (only when expanded) -->
      <div v-if="!customizer.mini_sidebar" class="pa-2">
        <ExtraBox />
      </div>
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { shallowRef, defineAsyncComponent, watch, computed } from "vue";
import NavGroup from "./NavGroup/NavGroup.vue";
import NavItem from "./NavItem/NavItem.vue";
import NavCollapse from "./NavCollapse/NavCollapse.vue";
import ExtraBox from "./extrabox/ExtraBox.vue";
import Logo from "../logo/LogoMain.vue";

import { useCustomizerStore } from "../../../stores/customizer";
import { usePlayerStore } from "@/stores/player";
import { useSidebarItems } from "@/composables/useSidebarItems";
import { useEventStore } from "@/stores/event";
import { useRouter } from "vue-router";

const router = useRouter();

const customizer = useCustomizerStore();
const playerStore = usePlayerStore();
const eventStore = useEventStore();

// ✅ reactive event
const currentEvent = computed(() => eventStore.currentEvent);

// ✅ reactive sidebar menu
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

watch(
  () => playerStore.activeTool,
  (tool) => {
    activeToolComponent.value =
      tool && toolComponents[tool]
        ? defineAsyncComponent(toolComponents[tool])
        : null;
  },
  { immediate: true },
);

function handleToolClick(tool: string) {
  playerStore.setActiveTool(tool);
}
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

/* Target the list items inside the navigation drawer content.
Using :deep() is necessary to style the internal components (NavItem, NavCollapse) 
that render as v-list-item.
*/
.leftSidebar :deep(.v-list-item) {
  /* Initial state: no border, mild transition for smooth effects */
  border-left: 2px solid transparent;
  transition: all 0.2s ease-in-out;
}

/* Style on Hover and Active State */
.leftSidebar :deep(.v-list-item:hover),
.leftSidebar :deep(.v-list-item--active) {
  /* Thin vertical divider (v-divider) effect: 2px wide, mild color */
  border-left-color: #4caf50; /* A mild glow color (e.g., green/teal or primary color) */

  /* Apply a mild, modern glow (subtle box-shadow) */
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.4); /* Adjust color and opacity for desired glow */

  /* Optional: Lighten background color slightly on hover for visual feedback */
  background-color: rgba(76, 175, 80, 0.05); /* Very slight background tint */
}

/* Ensure active item has a slightly stronger, persistent glow/color */
.leftSidebar :deep(.v-list-item--active) {
  background-color: rgba(76, 175, 80, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pa-5 {
    padding: 1rem !important;
  }

  .pa-4 {
    padding: 0.75rem !important;
  }
}
</style>
