import { createRouter, createWebHistory } from "vue-router";
import MainRoutes from "./MainRoutes";
import PublicRoutes from "./PublicRoutes";

import PaymentRoutes from "./PaymentRoutes";
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...(Array.isArray(MainRoutes) ? MainRoutes : [MainRoutes]),
    ...(Array.isArray(PublicRoutes) ? PublicRoutes : [PublicRoutes]),
    ...(Array.isArray(PaymentRoutes) ? PaymentRoutes : [PaymentRoutes]),// PaymentRoutes

    {
      path: "/auth/verify",
      name: "VerifyLink",
      component: () => import("@/views/authentication/auth/VerifyLink.vue"),
      meta: { public: true },
    },

    {
      path: "/:pathMatch(.*)*",
      component: () =>
        import("@/views/pages/maintenance/error/Error404Page.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token"); // <-- 🔑 Problem Area
  const isAuthenticated = !!token && token !== "undefined";

  // ... publicPaths list ...

  // 1️⃣ Unauthenticated user trying to access protected page
  if (!isAuthenticated && to.meta.requiresAuth) { // <-- This condition is met!
    return next("/login"); // force login
  }

  // 2️⃣ Authenticated user accessing a PUBLIC page → REDIRECT to Dashboard
  // ... skipped, as to.path is not public ...

  // 3️⃣ Authenticated navigating anywhere else or Unauthenticated navigating to a public page → allow
  // ... skipped, due to return in 1️⃣ ...

  next();
});