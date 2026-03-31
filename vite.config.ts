import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ["v-list-recognize-title"].includes(tag),
        },
      },
    }),
    vuetify({
      autoImport: false,
    }),
  ],
  server: {
    host: true,
    port: 5173,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Remove the problematic util alias
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // additionalData: `@use "@/styles/settings.scss" as *;`
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1024 * 1024,
    rollupOptions: {
      output: {
        manualChunks: {
          vuetify: ["vuetify"],
          vendor: ["vue", "vue-router", "pinia"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["vue", "vue-router", "pinia", "vuetify"],
    exclude: ["natural"], // Exclude natural from pre-bundling
    // Don't include util in optimizeDeps
  },
});
