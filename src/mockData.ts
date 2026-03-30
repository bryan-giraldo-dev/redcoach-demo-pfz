export type UnifiedMetric = {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "success";
};

export type ConnectedSystem = {
  id: string;
  name: string;
  apiUptime: string;
  syncStatus: "Stable" | "Degraded";
};

export type AgentActivity = {
  id: string;
  agent: string;
  message: string;
};

export type FleetVehicle = {
  id: string;
  label: string;
  state: "FL" | "TX" | "GA" | "OK";
  location: string;
  status: "On Time" | "Delayed";
  legacySource: "Geotab" | "Samsara";
  tripId: string;
  occupancyRate: number;
  destination: string;
  eta: string;
  mapPosition: {
    top: string;
    left: string;
  };
};

export type FleetInsight = {
  id: string;
  level: "Optimization" | "Safety Alert";
  message: string;
};

export type FleetRoutePoint = {
  x: number;
  y: number;
};

export type FleetGeoPoint = {
  lat: number;
  lng: number;
};

export type FleetRoute = {
  id: string;
  vehicleId: string;
  registration: string;
  speedMph: number;
  points: FleetRoutePoint[];
  geoPoints: FleetGeoPoint[];
};

export const unifiedMetrics: UnifiedMetric[] = [
  {
    label: "Total Monthly Savings",
    value: "$9,200",
    detail: "Finance impact from live optimization",
    tone: "success",
  },
  {
    label: "Unified Systems",
    value: "6",
    detail: "Geotab API, Salesforce, Zendesk, Legacy ERP, HubSpot, Power BI",
  },
  {
    label: "Fleet Utilization",
    value: "94.2%",
    detail: "+2.1% vs last shift",
  },
];

export const connectivitySystems: ConnectedSystem[] = [
  { id: "sys-1", name: "Geotab API", apiUptime: "99.97%", syncStatus: "Stable" },
  { id: "sys-2", name: "Salesforce", apiUptime: "99.92%", syncStatus: "Stable" },
  { id: "sys-3", name: "Zendesk", apiUptime: "99.89%", syncStatus: "Stable" },
  { id: "sys-4", name: "Legacy ERP", apiUptime: "99.41%", syncStatus: "Degraded" },
  { id: "sys-5", name: "HubSpot", apiUptime: "99.95%", syncStatus: "Stable" },
  { id: "sys-6", name: "Power BI", apiUptime: "99.90%", syncStatus: "Stable" },
];

export const aiAgentsActivity: AgentActivity[] = [
  {
    id: "ag-1",
    agent: "Fleet Agent",
    message: "Optimized 42 routes in FL/TX today.",
  },
  {
    id: "ag-2",
    agent: "Pricing Agent",
    message: "Dynamic adjustment for Miami-Orlando leg active.",
  },
  {
    id: "ag-3",
    agent: "Revenue Agent",
    message: "Detected uplift trend and synchronized reporting signals.",
  },
];

export const fleetVehicles: FleetVehicle[] = [
  {
    id: "BUS-RD-402",
    label: "Miami Hub",
    state: "FL",
    location: "Miami, FL",
    status: "Delayed",
    legacySource: "Geotab",
    tripId: "FL-ORL-204",
    occupancyRate: 81,
    destination: "Orlando, FL",
    eta: "2h 05m",
    mapPosition: { top: "68%", left: "72%" },
  },
  {
    id: "BUS-RD-118",
    label: "Orlando Node",
    state: "FL",
    location: "Orlando, FL",
    status: "On Time",
    legacySource: "Samsara",
    tripId: "FL-MIA-118",
    occupancyRate: 76,
    destination: "Miami, FL",
    eta: "3h 10m",
    mapPosition: { top: "58%", left: "67%" },
  },
  {
    id: "BUS-TX-225",
    label: "Dallas Relay",
    state: "TX",
    location: "Dallas, TX",
    status: "On Time",
    legacySource: "Geotab",
    tripId: "TX-DAL-102",
    occupancyRate: 84,
    destination: "Houston, TX",
    eta: "4h 12m",
    mapPosition: { top: "53%", left: "38%" },
  },
  {
    id: "BUS-TX-531",
    label: "Houston Link",
    state: "TX",
    location: "Houston, TX",
    status: "Delayed",
    legacySource: "Samsara",
    tripId: "TX-HOU-531",
    occupancyRate: 88,
    destination: "Dallas, TX",
    eta: "4h 55m",
    mapPosition: { top: "63%", left: "44%" },
  },
  {
    id: "BUS-GA-089",
    label: "Atlanta Core",
    state: "GA",
    location: "Atlanta, GA",
    status: "On Time",
    legacySource: "Geotab",
    tripId: "GA-ATL-089",
    occupancyRate: 72,
    destination: "Jacksonville, FL",
    eta: "5h 02m",
    mapPosition: { top: "49%", left: "62%" },
  },
  {
    id: "BUS-OK-304",
    label: "Oklahoma City",
    state: "OK",
    location: "Oklahoma City, OK",
    status: "On Time",
    legacySource: "Samsara",
    tripId: "OK-TUL-304",
    occupancyRate: 69,
    destination: "Dallas, TX",
    eta: "3h 48m",
    mapPosition: { top: "45%", left: "34%" },
  },
];

export const REDCOACH_DATA = fleetVehicles;

export const fleetInsights: FleetInsight[] = [
  {
    id: "ins-1",
    level: "Optimization",
    message: "Route Miami-Orlando adjusted to avoid I-95 congestion.",
  },
  {
    id: "ins-2",
    level: "Safety Alert",
    message:
      "Driver BUS-RD-402 exceeds resting threshold. AI Agent suggested schedule swap.",
  },
  {
    id: "ins-3",
    level: "Optimization",
    message: "Dallas-Austin corridor rebalanced after demand spike forecast.",
  },
];

export const fleetRoutes: FleetRoute[] = [
  {
    id: "route-1",
    vehicleId: "BUS-RD-402",
    registration: "3816 TX",
    speedMph: 62,
    points: [
      { x: 40, y: 66 },
      { x: 47, y: 64 },
      { x: 56, y: 66 },
      { x: 64, y: 70 },
      { x: 74, y: 74 },
    ],
    geoPoints: [
      { lat: 29.7604, lng: -95.3698 },
      { lat: 29.4241, lng: -98.4936 },
      { lat: 30.2672, lng: -97.7431 },
      { lat: 29.9511, lng: -90.0715 },
      { lat: 30.3322, lng: -81.6557 },
      { lat: 28.5383, lng: -81.3792 },
      { lat: 25.7617, lng: -80.1918 },
    ],
  },
  {
    id: "route-2",
    vehicleId: "BUS-TX-225",
    registration: "9021 TX",
    speedMph: 58,
    points: [
      { x: 25, y: 58 },
      { x: 31, y: 54 },
      { x: 38, y: 52 },
      { x: 47, y: 54 },
      { x: 55, y: 57 },
    ],
    geoPoints: [
      { lat: 32.7767, lng: -96.797 },
      { lat: 31.7619, lng: -106.485 },
      { lat: 29.7604, lng: -95.3698 },
      { lat: 29.4241, lng: -98.4936 },
      { lat: 30.2672, lng: -97.7431 },
      { lat: 32.7555, lng: -97.3308 },
    ],
  },
  {
    id: "route-3",
    vehicleId: "BUS-GA-089",
    registration: "5110 GA",
    speedMph: 64,
    points: [
      { x: 58, y: 48 },
      { x: 63, y: 47 },
      { x: 67, y: 50 },
      { x: 72, y: 55 },
      { x: 76, y: 60 },
    ],
    geoPoints: [
      { lat: 33.749, lng: -84.388 },
      { lat: 32.0809, lng: -81.0912 },
      { lat: 30.3322, lng: -81.6557 },
      { lat: 29.9511, lng: -90.0715 },
      { lat: 29.7604, lng: -95.3698 },
      { lat: 32.7767, lng: -96.797 },
    ],
  },
];
