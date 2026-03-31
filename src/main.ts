// src/main.js
// IMPORT POLYFILLS FIRST - This must be the first import
import "./utils/polyfills";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

import { router } from "./router";
import vuetify from "./plugins/vuetify";
import { apolloPlugin } from "./plugins/apollo";

// UI & vendor plugins
import { PerfectScrollbarPlugin } from "vue3-perfect-scrollbar";
import VueApexCharts from "vue3-apexcharts";
import VueTablerIcons from "vue-tabler-icons";
import print from "vue3-print-nb";

import "@/scss/style.scss";
import "@mdi/font/css/materialdesignicons.css";

// Stores & socket
import { useUserStore } from "@/stores/user";
import { socketService } from "@/plugins/socket";

async function bootstrap() {
  try {
    const app = createApp(App);

    // 1️⃣ Setup Pinia first
    const pinia = createPinia();
    app.use(pinia);

    // 2️⃣ Load user state before initializing socket auth
    const userStore = useUserStore();
    await userStore.initialize();

    // 3️⃣ Initialize socket (but do not connect automatically)
    socketService.initialize();

    // 4️⃣ Install plugins
    app.use(router);
    app.use(apolloPlugin);
    app.use(PerfectScrollbarPlugin);
    app.use(VueApexCharts);
    app.use(VueTablerIcons);
    app.use(print);
    app.use(vuetify);

    // 5️⃣ Mount
    app.mount("#app");

    console.log("Application bootstrapped successfully");
  } catch (error) {
    console.error("Failed to bootstrap application:", error);
    // Show error in UI if needed
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #f44336;
      color: white;
      padding: 15px 20px;
      border-radius: 4px;
      z-index: 9999;
      font-family: monospace;
      max-width: 80%;
      text-align: center;
    `;
    errorDiv.innerHTML = `
      <strong>Application Error:</strong><br>
      ${error}<br>
      <small>Check console for details</small>
    `;
    document.body.appendChild(errorDiv);
  }
}

// Add global error handlers for uncaught errors
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled Promise Rejection:", event.reason);
  if (event.reason?.message?.includes("util.inherits")) {
    console.warn(
      "Natural.js error detected - ensure polyfills are loaded correctly",
    );
  }
});

window.addEventListener("error", (event) => {
  console.error("Uncaught Error:", event.error);
  if (event.error?.message?.includes("util.inherits")) {
    console.warn(
      "Natural.js error detected - ensure polyfills are loaded correctly",
    );
  }
});

bootstrap();
