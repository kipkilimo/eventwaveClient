// PublicRoutes.ts
const PublicRoutes = {
  path: "/", // parent path
  component: () => import("@/layouts/blank/BlankLayout.vue"),
  meta: {
    requiresAuth: false,
  },
  redirect: "/home", // optional: redirect root to landing page
  children: [
    {
      name: "Authentication",
      path: "login",
      component: () => import("@/views/authentication/LoginPage.vue"),
    },
    {
      name: "Facilitator",
      path: "facilitator-login",
      component: () =>
        import("@/views/authentication/auth/FacilitatorPage.vue"),
    },
    {
      name: "LoginAlt",
      path: "login1",
      component: () => import("@/views/authentication/auth/LoginPage.vue"),
    },
    {
      name: "Register",
      path: "register",
      component: () => import("@/views/authentication/auth/RegisterPage.vue"),
    },
    {
      name: "LandingPage",
      path: "home",
      component: () => import("@/views/landing/index.vue"),
    },
    {
      name: "Error404",
      path: "error",
      component: () =>
        import("@/views/pages/maintenance/error/Error404Page.vue"),
    },
  ],
};

export default PublicRoutes;
