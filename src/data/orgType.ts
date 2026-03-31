interface IndustryVertical {
  vertical: string;
  useCase: string;
}
interface OrgTypes {
  industryVerticals: IndustryVertical[];
}
export const orgTypes: OrgTypes = {
  industryVerticals: [
    {
      vertical: "Financial Services & Insurance",
      useCase:
        "Compliance training, advisor workshops, and real-time audience sentiment tracking during investor conferences.",
    },
    {
      vertical: "Government & Public Sector",
      useCase:
        "Public consultation workshops, civil service training, and live audience feedback during town halls.",
    },
    {
      vertical: "Healthcare & Life Sciences",
      useCase:
        "CME (Continuing Medical Education) events, clinical trial training sessions, and live polling during medical symposiums.",
    },
    {
      vertical: "Education",
      useCase:
        "University workshops, K-12 teacher training, online course live sessions with interactive quizzes and feedback loops.",
    },
    {
      vertical: "Internet & Technology",
      useCase:
        "Developer conferences, product launch workshops, hackathons with live coding polls, and certification testing.",
    },
    {
      vertical: "Retail & Consumer Packaged Goods",
      useCase:
        "Sales team training, product knowledge workshops, and live Q&A during retail partner summits.",
    },
    {
      vertical: "Manufacturing & Industrial",
      useCase:
        "Safety training workshops, equipment certification tests, and live polling during operational excellence seminars.",
    },
    {
      vertical: "Travel & Hospitality",
      useCase:
        "Staff training programs, partner summits, and live guest feedback sessions during hospitality expos.",
    },
    {
      vertical: "Media & Entertainment",
      useCase:
        "Live fan events, interactive award show backstage feeds, audience voting, and real-time engagement during premieres.",
    },
    {
      vertical: "Automotive",
      useCase:
        "Dealership training, new model launch workshops, and technician certification exams.",
    },
    {
      vertical: "Energy & Utilities",
      useCase:
        "Field workforce training, safety drills with real-time assessments, and remote expert-led workshops.",
    },
    {
      vertical: "Agriculture",
      useCase:
        "Farmer education workshops, equipment training sessions, and live advisory sessions during agricultural fairs.",
    },
    {
      vertical: "Aerospace & Satellite",
      useCase:
        "Engineering training sessions, technical certification tests, and real-time Q&A during industry symposiums.",
    },
  ],
};
