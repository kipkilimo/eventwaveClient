const MainRoutes = {
  path: "/main",
  meta: {
    requiresAuth: true,
  },
  redirect: "/events",
  component: () => import("@/layouts/full/FullLayout.vue"),
  children: [
    {
      name: "Event",
      path: "/events", // no leading slash
      component: () => import("@/views/event/EventViewer.vue"),
    },
    {
      name: "Default",
      path: "/dashboard", // no leading slash
      component: () => import("@/views/dashboards/DefaultDashboard.vue"),
    },
    {
      name: "Starter",
      path: "starter", // no leading slash
      component: () => import("@/views/StarterPage.vue"),
    },
  ],
};

export default MainRoutes;
