<template>
  <v-list-item
    :to="item.to"
    :disabled="item.disabled"
    :active="isActive"
    class="nav-item-with-tooltip"
  >
    <!-- ICON -->
    <template #prepend>
      <component :is="item.icon" />
    </template>

    <!-- TEXT (WHEN NOT COLLAPSED) -->
    <v-list-item-title v-if="!hideText">
      {{ item.title }}
    </v-list-item-title>

    <!-- TOOLTIP (WHEN COLLAPSED) -->
    <v-tooltip v-if="hideText" location="top">
      <template #activator="{ props }">
        <div class="tooltip-activator-wrapper" v-bind="props">
          <!-- Empty wrapper that covers the entire list item -->
        </div>
      </template>
      {{ item.title }}
    </v-tooltip>
  </v-list-item>
</template>

<script setup lang="ts">
defineProps({
  item: Object,
  hideText: Boolean,
  isActive: Boolean,
});
</script>

<style scoped>
.nav-item-with-tooltip {
  position: relative;
}

.tooltip-activator-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  cursor: pointer;
  z-index: 1;
}
</style>
