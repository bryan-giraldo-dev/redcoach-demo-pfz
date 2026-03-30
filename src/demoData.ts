export type DemoScenario = "Baseline" | "Peak Season";

type Kpi = {
  label: string;
  value: string;
  delta: string;
};

type Workflow = {
  id: string;
  name: string;
  source: string;
  destination: string;
  status: "Running" | "Warning" | "Paused";
};

type CustomerHealth = {
  name: string;
  plan: string;
  health: "Healthy" | "At risk";
  nextAction: string;
};

export type TimelineEvent = {
  id: string;
  title: string;
  system: string;
  timestamp: string;
};

const BASELINE_KPIS: Kpi[] = [
  { label: "Systems connected", value: "14", delta: "+2 this quarter" },
  { label: "Hours saved / week", value: "120", delta: "+18% vs last month" },
  { label: "Operational errors", value: "6%", delta: "-35% vs baseline" },
  { label: "Monthly savings", value: "$9,000", delta: "5x ROI" },
];

const PEAK_KPIS: Kpi[] = [
  { label: "Systems connected", value: "16", delta: "+4 this quarter" },
  { label: "Hours saved / week", value: "156", delta: "+26% vs baseline" },
  { label: "Operational errors", value: "4.2%", delta: "-48% vs baseline" },
  { label: "Monthly savings", value: "$12,700", delta: "6.1x ROI" },
];

const BASELINE_WORKFLOWS: Workflow[] = [
  {
    id: "wf-1",
    name: "Ticket escalation sync",
    source: "Zendesk",
    destination: "HubSpot + Slack",
    status: "Running",
  },
  {
    id: "wf-2",
    name: "Fleet delay reconciliation",
    source: "FleetOps",
    destination: "CRM + Finance ERP",
    status: "Warning",
  },
  {
    id: "wf-3",
    name: "Revenue forecast refresh",
    source: "Salesforce",
    destination: "NetSuite",
    status: "Running",
  },
  {
    id: "wf-4",
    name: "Refund anomaly monitor",
    source: "Payment Gateway",
    destination: "Risk Dashboard",
    status: "Paused",
  },
];

const PEAK_WORKFLOWS: Workflow[] = [
  {
    id: "wf-1",
    name: "Ticket escalation sync",
    source: "Zendesk",
    destination: "HubSpot + Slack",
    status: "Running",
  },
  {
    id: "wf-2",
    name: "Fleet delay reconciliation",
    source: "FleetOps",
    destination: "CRM + Finance ERP",
    status: "Running",
  },
  {
    id: "wf-3",
    name: "Revenue forecast refresh",
    source: "Salesforce",
    destination: "NetSuite",
    status: "Running",
  },
  {
    id: "wf-4",
    name: "Refund anomaly monitor",
    source: "Payment Gateway",
    destination: "Risk Dashboard",
    status: "Warning",
  },
];

const BASELINE_CUSTOMERS: CustomerHealth[] = [
  {
    name: "RedCoach Miami North",
    plan: "Enterprise",
    health: "Healthy",
    nextAction: "Auto-renewal check in 9 days",
  },
  {
    name: "RedCoach Orlando Hub",
    plan: "Growth",
    health: "At risk",
    nextAction: "Open incident review with operations lead",
  },
  {
    name: "RedCoach Tampa Routes",
    plan: "Enterprise",
    health: "Healthy",
    nextAction: "Upsell proposal: pricing agent module",
  },
];

const PEAK_CUSTOMERS: CustomerHealth[] = [
  {
    name: "RedCoach Miami North",
    plan: "Enterprise",
    health: "Healthy",
    nextAction: "Reassign support capacity for Spring Break demand",
  },
  {
    name: "RedCoach Orlando Hub",
    plan: "Growth",
    health: "At risk",
    nextAction: "Run retention workflow and offer proactive voucher",
  },
  {
    name: "RedCoach Tampa Routes",
    plan: "Enterprise",
    health: "Healthy",
    nextAction: "Schedule premium support checkpoint in 48h",
  },
];

const BASELINE_TIMELINE: TimelineEvent[] = [
  {
    id: "ev-1",
    title: "Delay event pushed to customer success playbook",
    system: "FleetOps",
    timestamp: "2 min ago",
  },
  {
    id: "ev-2",
    title: "Refund mismatch resolved automatically",
    system: "Finance ERP",
    timestamp: "8 min ago",
  },
  {
    id: "ev-3",
    title: "High-priority ticket synced to revenue owner",
    system: "Zendesk",
    timestamp: "15 min ago",
  },
];

const PEAK_TIMELINE: TimelineEvent[] = [
  {
    id: "ev-1",
    title: "High-volume delay cluster auto-routed to incident squad",
    system: "FleetOps",
    timestamp: "1 min ago",
  },
  {
    id: "ev-2",
    title: "Dynamic refund policy propagated to all customer channels",
    system: "Finance ERP",
    timestamp: "4 min ago",
  },
  {
    id: "ev-3",
    title: "At-risk customers assigned to retention workflow",
    system: "HubSpot",
    timestamp: "7 min ago",
  },
];

export function getDemoKpis(scenario: DemoScenario): Kpi[] {
  return scenario === "Peak Season" ? PEAK_KPIS : BASELINE_KPIS;
}

export function getDemoWorkflows(scenario: DemoScenario): Workflow[] {
  return scenario === "Peak Season" ? PEAK_WORKFLOWS : BASELINE_WORKFLOWS;
}

export function getDemoCustomers(scenario: DemoScenario): CustomerHealth[] {
  return scenario === "Peak Season" ? PEAK_CUSTOMERS : BASELINE_CUSTOMERS;
}

export async function fetchDemoTimeline(
  scenario: DemoScenario
): Promise<TimelineEvent[]> {
  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
  return scenario === "Peak Season" ? PEAK_TIMELINE : BASELINE_TIMELINE;
}
