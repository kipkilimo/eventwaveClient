import { defineStore } from "pinia";

export const usePlayerStore = defineStore("player", {
  state: () => ({
    activeTool: "",
    toolsLoaded: {} as Record<string, boolean>
  }),

  getters: {
    isToolActive: (state) => (tool: string) => state.activeTool === tool,
    hasToolBeenLoaded: (state) => (tool: string) => state.toolsLoaded[tool] ?? false,
    currentActiveTool: (state) => state.activeTool,
    showToolComponent: (state) => state.activeTool !== ""
  },

  actions: {
    setActiveTool(tool: string) {
      this.activeTool = tool;
      this.toolsLoaded[tool] = true;
    },

    clearActiveTool() {
      this.activeTool = "";
    },

    toggleTool(tool: string) {
      if (this.activeTool === tool) {
        this.clearActiveTool();
      } else {
        this.setActiveTool(tool);
      }
    }
  }
});