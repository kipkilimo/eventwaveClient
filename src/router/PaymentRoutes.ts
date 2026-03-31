const PaymentRoutes = {
  path: "/billing",
  meta: {
    requiresAuth: false,
  },
  redirect: "/billing/pay", // Changed: Add /billing prefix
  component: () => import("@/layouts/full/FullLayout.vue"),
  children: [
    {
      name: "Pay",
      path: "pay", // Changed: Remove leading slash
      component: () => import("@/views/payments/ProPaymentHandler.vue"),
    },
  ],
};

export default PaymentRoutes;