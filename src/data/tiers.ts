export type Tier = {
  id: "basic" | "professional" | "business";
  name: string;
  target: string;
  monthlyPricing: string;
  annualPricing?: string;
  maxParticipants: number;
  features: string[];
  summary: string;
  emoji: string;
  highlight?: boolean;
  ctaText?: string;
};

export const tiers: Tier[] = [
  {
    id: "basic",
    name: "Basic",
    target: "Pilots, demos, and very small meetings",
    monthlyPricing: "Free",
    maxParticipants: 25,
    features: [
      "1 Active Event",
      "Basic Registration",
      "Text-only Q&A",
      "Simple Feedback Form",
      "Email-based Support",
    ],
    summary:
      "A lightweight entry point for testing event engagement or hosting small internal sessions.",
    emoji: "🧩",
  },
  {
    id: "professional",
    name: "Professional (PRO)",
    target: "NGOs, hotels, trainings & regional workshops",
    monthlyPricing: "USD 9.50 per event per day",
    annualPricing: "Per-event pricing",
    maxParticipants: 200,
    features: [
      "Unlimited Sessions Within Same Day",
      "Live Polls & Surveys",
      "Moderated Q&A",
      "Attendance & Engagement Metrics",
      "Basic MEAL Indicators",
      "CSV Export (Single File)",
      "Self-serve Documentation & Email Support",
      "Fair-use Policy Applied",
    ],
    summary:
      "Professional MEAL-grade event engagement at NGO-accessible pricing — built for routine use.",
    emoji: "🔵",
  },
  {
    id: "business",
    name: "Enterprise",
    target: "Large NGOs, corporates, universities & multi-day conferences",
    monthlyPricing: "As per organizational needs",
    annualPricing: "Custom contracts available",
    maxParticipants: 1000,
    features: [
      "1,000+ Participants",
      "White Labeling & Custom Branding",
      "Advanced MEAL Dashboards",
      "Custom Indicators & Reports",
      "Integrations (Kobo, DHIS2, CRM)",
      "Dedicated Support & SLA",
      "Multi-day & Multi-event Contracts",
      "Optional Live Event Support",
    ],
    summary:
      "Scalable enterprise-grade engagement with deep analytics, integrations, and dedicated support.",
    emoji: "🟣",
    highlight: true,
    ctaText: "Talk to Sales",
  },
];
