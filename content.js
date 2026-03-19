const LANDING_DATA = {
  navigation: {
    brand: "Selfware",
    byline: "by Performanze",
    cta: "Talk to the team"
  },
  hero: {
    title: "Your tools don't talk to each other. We fix that.",
    description:
      "Stop paying engineers to copy-paste between systems. Selfware creates intelligent overlays that make your disconnected software stack work as one unified platform.",
    primaryCTA: "Book a demo",
    secondaryCTA: "See case study",
    image: {
      src: "assets/hero-overlay-v2.png",
      alt: "Selfware Performanze overlay unifying fragmented systems"
    }
  },
  frankenstein: {
    eyebrow: "THE FRANKENSTEIN STACK",
    title: "Every integration is custom. Every update breaks something.",
    badge: "12+ tools. 0 shared context.",
    statValue: "$150-300K/year",
    statLabel: "in manual overhead",
    description:
      "The hidden tax of brittle integrations shows up everywhere in your operation — and your best people are the ones paying it.",
    bullets: [
      "Engineers manually syncing data between systems.",
      "Sales reps updating multiple CRMs just to keep deals straight.",
      "Finance team reconciling mismatched records at month end.",
      "Support escalations from broken automations nobody remembers owning."
    ],
    image: {
      src: "assets/FrankestainImage.png",
      alt: "Frankenstein stack of tools with broken integrations"
    }
  },
  steps: {
    eyebrow: "THE OVERLAY SOLUTION",
    title: "Three steps to unified operations",
    subtitle:
      "No rip-and-replace. No migration projects. Just an intelligent layer that sits on top of your existing infrastructure.",
    items: [
      {
        step: "01",
        title: "Connect",
        description:
          "Map your existing systems without changing a single line of code. We integrate with your stack as-is."
      },
      {
        step: "02",
        title: "Unify",
        description:
          "Create a single source of truth. Our semantic layer translates between your tools automatically."
      },
      {
        step: "03",
        title: "Execute",
        description:
          "Deploy specialized AI agents that execute workflows across your entire stack. Zero manual work."
      }
    ]
  },
  redCoachCase: {
    label: "Case study",
    title: "From Fragmented Operations to Unified Intelligence.",
    subtitle:
      "RedCoach used Selfware to unify fragmented operations into a single, AI-powered layer — without replatforming or rewriting their stack.",
    metrics: [
      { value: "$9,000/mo", label: "Cost Savings" },
      { value: "4 months", label: "Deployment Time" },
      { value: "5x ROI", label: "Return on Investment" }
    ],
    bottomMetrics: [
      { value: "14", label: "Systems Unified" },
      { value: "120", label: "Hours Saved/Week" },
      { value: "94%", label: "Error Reduction" }
    ],
    quote:
      "We tried building custom integrations. Tried hiring a data team. Nothing worked until Selfware. Now our systems actually talk to each other—and our team can focus on growth, not data entry.",
    author: "Rubén Mendiguchía Hernández",
    role: "CEO at RedCoach",
    image: {
      src: "assets/CEO-RedCoach.png",
      alt: "Rubén Mendiguchía Hernández, CEO at RedCoach"
    },
    challengeTitle: "The Challenge",
    challengeBody:
      "RedCoach’s fleet management relied on 14 disconnected systems. Data sync demanded three full-time employees, and errors cost over $12K every month in operational delays.",
    pdf: {
      label: "Download full case study (PDF)",
      href: "assets/redcoach-case-study.pdf"
    }
  },
  aiAgents: {
    eyebrow: "AI agents for real work",
    title: "AI agents that know your business",
    subtitle:
      "These aren’t chatbots. They are always-on teammates that read, write, and reconcile data across your tools — with human-level context and audit trails.",
    cards: [
      {
        name: "Revenue Ops Agent",
        tag: "Pipeline hygiene",
        description:
          "Keeps CRM, billing, and marketing in lockstep — closing the gap between what sales says, finance books, and what product delivers.",
        metrics: [
          { label: "Stale opps cleared", value: "35%" },
          { label: "Forecast accuracy", value: "+18 pts" }
        ]
      },
      {
        name: "Customer Ops Agent",
        tag: "Onboarding & renewals",
        description:
          "Tracks every customer commitment across tickets, docs, and emails so nothing slips through the cracks before renewal.",
        metrics: [
          { label: "Time-to-value", value: "-27%" },
          { label: "Renewal coverage", value: "98%" }
        ]
      },
      {
        name: "Service Ops Agent",
        tag: "Incident response",
        description:
          "Monitors signals across tools, routes the right playbook, and updates every system when something goes wrong.",
        metrics: [
          { label: "MTTR", value: "-32%" },
          { label: "Manual escalations", value: "-41%" }
        ]
      }
    ]
  },
  comparison: {
    eyebrow: "COMPARISON",
    title: "How we stack up",
    subtitle:
      "See how Performanze compares to stitching together custom integrations or buying another iPaaS you’ll never fully implement.",
    columns: ["Manual integrations", "iPaaS", "Performanze"],
    rows: [
      {
        label: "Time to first live workflow",
        values: ["3–6 months", "4–8 weeks", "30 days"]
      },
      {
        label: "Ongoing maintenance",
        values: ["Full-time ops engineer", "Dedicated specialist", "Included in fee"]
      },
      {
        label: "Coverage across tools",
        values: ["Only what’s hard-coded", "Connector catalog", "Any tool with an API or export"],
      },
      {
        label: "Business context",
        values: ["Lives in people's heads", "Per workflow", "Continuous, across every customer and deal"]
      },
      {
        label: "AI-native",
        values: ["No", "Add-on", "Built into every workflow"]
      }
    ]
  },
  footer: {
    title: "See it in action. Try the demo.",
    subtitle:
      "Share a bit about your stack and we’ll show you exactly how an AI operations layer would work for your team.",
    cta: "Get the demo",
    note: "No spam. No SDR sequence. Just one 30-minute working session.",
    fields: [
      {
        id: "company",
        label: "Company",
        placeholder: "Acme Corp"
      },
      {
        id: "role",
        label: "Your role",
        placeholder: "Head of Ops, RevOps, COO…"
      },
      {
        id: "email",
        label: "Work email",
        placeholder: "you@company.com"
      },
      {
        id: "stack",
        label: "Current tools",
        placeholder: "Salesforce, HubSpot, Zendesk, Netsuite…"
      }
    ],
    legal:
      "By submitting, you agree to hear from Performanze about this demo and related product updates. You can opt out anytime.",
    footerNav: ["Status", "Security", "Docs", "Privacy", "Terms"],
    copyright: "© 2026 Performanze. All rights reserved."
  }
};

export default LANDING_DATA;