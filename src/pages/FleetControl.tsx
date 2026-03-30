import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import {
  BellRing,
  Command,
  MapPinned,
  Pause,
  Play,
  Search,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { FleetGeoPoint } from "../mockData";
import { fleetInsights, fleetRoutes, REDCOACH_DATA } from "../mockData";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

type PositionByRoute = Record<string, FleetGeoPoint>;
type ProgressByRoute = Record<string, number>;
type RegionFilter = "All" | "FL" | "TX" | "GA" | "OK";
type VehicleStatus = "On Time" | "Delayed" | "Re-routing" | "Critical";
type ForecastInsight = { id: string; title: string; detail: string; action: string };
type FleetTripRow = {
  routeId: string;
  vehicleId: string;
  driver: string;
  origin: string;
  destination: string;
  destinationState: RegionFilter;
  state: Exclude<RegionFilter, "All">;
  location: string;
  status: VehicleStatus;
  legacySource: string;
  speedMph: number;
  occupancyRate: number;
  progress: number;
  etaLabel: string;
  position: FleetGeoPoint;
  tripId: string;
};

const SIMULATION_SPEED_FACTOR = 0.08;
const SIMULATION_STEP_MS = 250;
const ROW_HEIGHT = 58;
const VIRTUAL_HEIGHT = 520;
const SHARP_TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const regionOptions: RegionFilter[] = ["All", "FL", "TX", "GA", "OK"];
const cityByState: Record<Exclude<RegionFilter, "All">, string[]> = {
  FL: ["Miami, FL", "Orlando, FL", "Jacksonville, FL", "Tampa, FL"],
  TX: ["Houston, TX", "Dallas, TX", "Austin, TX", "San Antonio, TX"],
  GA: ["Atlanta, GA", "Savannah, GA", "Augusta, GA"],
  OK: ["Oklahoma City, OK", "Tulsa, OK"],
};
const geoByState: Record<Exclude<RegionFilter, "All">, FleetGeoPoint> = {
  FL: { lat: 25.7617, lng: -80.1918 },
  TX: { lat: 29.7604, lng: -95.3698 },
  GA: { lat: 33.749, lng: -84.388 },
  OK: { lat: 35.4676, lng: -97.5164 },
};
const forecastInsights: ForecastInsight[] = [
  {
    id: "f-1",
    title: "AI Prediction",
    detail: "Heavy rain in Houston tomorrow at 4 PM. 12 trips at risk.",
    action: "[Automate Reroute Plan]",
  },
  {
    id: "f-2",
    title: "Revenue Alert",
    detail: "Orlando-Atlanta leg for Friday is at 15% capacity.",
    action: "[Trigger Dynamic Pricing Agent]",
  },
];
const driverPool = [
  "A. Thompson",
  "J. Rivera",
  "M. Clarke",
  "R. Patel",
  "S. Brooks",
  "D. Vasquez",
  "K. Nguyen",
];

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineMeters(start: FleetGeoPoint, end: FleetGeoPoint) {
  const earthRadius = 6371000;
  const dLat = toRadians(end.lat - start.lat);
  const dLng = toRadians(end.lng - start.lng);
  const lat1 = toRadians(start.lat);
  const lat2 = toRadians(end.lat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getRouteLengthMeters(path: FleetGeoPoint[]) {
  if (path.length < 2) return 1;
  let total = 0;
  for (let index = 0; index < path.length - 1; index += 1) {
    total += haversineMeters(path[index], path[index + 1]);
  }
  return Math.max(total, 1);
}

function interpolatePosition(path: FleetGeoPoint[], progress: number): FleetGeoPoint {
  if (path.length === 0) return { lat: 29.7604, lng: -95.3698 };
  if (path.length === 1) return path[0];
  const scaled = progress * (path.length - 1);
  const index = Math.floor(scaled);
  const nextIndex = Math.min(index + 1, path.length - 1);
  const localProgress = scaled - index;
  const start = path[index];
  const end = path[nextIndex];
  return {
    lat: start.lat + (end.lat - start.lat) * localProgress,
    lng: start.lng + (end.lng - start.lng) * localProgress,
  };
}

function MapFocusController({ focusPoints }: { focusPoints: [number, number][] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!focusPoints || focusPoints.length === 0) return;
    if (focusPoints.length === 1) {
      map.setView(focusPoints[0], 8, { animate: true });
      return;
    }
    map.fitBounds(focusPoints, { padding: [50, 50], animate: true, maxZoom: 8 });
  }, [focusPoints, map]);
  return null;
}

function jitterPosition(base: FleetGeoPoint, index: number): FleetGeoPoint {
  const angle = (index % 36) * 10;
  const radius = 0.03 + (index % 10) * 0.004;
  const cos = Math.cos((angle * Math.PI) / 180);
  const sin = Math.sin((angle * Math.PI) / 180);
  return { lat: base.lat + sin * radius, lng: base.lng + cos * radius };
}

function toEtaLabel(minutes: number) {
  const safeMinutes = Math.max(1, Math.round(minutes));
  const h = Math.floor(safeMinutes / 60);
  const m = safeMinutes % 60;
  return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
}

function getStateCode(value: string, fallback: Exclude<RegionFilter, "All">): Exclude<RegionFilter, "All"> {
  const normalized = value.toUpperCase();
  if (normalized.includes("TX")) return "TX";
  if (normalized.includes("GA")) return "GA";
  if (normalized.includes("OK")) return "OK";
  if (normalized.includes("FL")) return "FL";
  return fallback;
}

async function fetchFleetOperationalBase() {
  const [tripsResponse, bookingsResponse] = await Promise.all([
    fetch("https://rchub.subdiagonal.com/trips"),
    fetch("https://rchub.subdiagonal.com/bookings"),
  ]);
  const trips = tripsResponse.ok ? ((await tripsResponse.json()) as Record<string, unknown>[]) : [];
  const bookings = bookingsResponse.ok ? ((await bookingsResponse.json()) as Record<string, unknown>[]) : [];
  return { trips, bookings };
}

export default function FleetControl() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [progressByRoute, setProgressByRoute] = useState<ProgressByRoute>({});
  const [isSimulationPaused, setIsSimulationPaused] = useState(false);
  const [lastUpdateLabel, setLastUpdateLabel] = useState("Real-time");
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("All");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, VehicleStatus>>({});
  const [focusMode, setFocusMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [ledgerScrollTop, setLedgerScrollTop] = useState(0);
  const lastTickRef = useRef<number>(Date.now());

  const operationalBaseQuery = useQuery({
    queryKey: ["fleet-operational-base"],
    queryFn: fetchFleetOperationalBase,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const routeLengthById = useMemo(() => {
    const lengths: Record<string, number> = {};
    for (const route of fleetRoutes) lengths[route.id] = getRouteLengthMeters(route.geoPoints);
    return lengths;
  }, []);

  const filteredVehicles = useMemo(() => {
    const byRegion = regionFilter === "All" ? REDCOACH_DATA : REDCOACH_DATA.filter((vehicle) => vehicle.state === regionFilter);
    if (!focusMode) return byRegion;
    return byRegion.filter((vehicle) => {
      const status = statusOverrides[vehicle.id] ?? vehicle.status;
      return status !== "On Time";
    });
  }, [focusMode, regionFilter, statusOverrides]);

  const filteredRoutes = useMemo(() => {
    const activeVehicleIds = new Set(filteredVehicles.map((vehicle) => vehicle.id));
    return fleetRoutes.filter((route) => activeVehicleIds.has(route.vehicleId));
  }, [filteredVehicles]);

  const positionsByRoute = useMemo<PositionByRoute>(() => {
    return filteredRoutes.reduce<PositionByRoute>((acc, route) => {
      acc[route.id] = interpolatePosition(route.geoPoints, progressByRoute[route.id] ?? 0);
      return acc;
    }, {});
  }, [filteredRoutes, progressByRoute]);

  const selectedVehicle = useMemo(
    () => filteredVehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [filteredVehicles, selectedVehicleId],
  );

  useEffect(() => {
    setLastUpdateLabel(isSimulationPaused ? "Paused" : "Real-time");
  }, [isSimulationPaused]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isSimulationPaused) {
        lastTickRef.current = Date.now();
        return;
      }

      const now = Date.now();
      const elapsedSeconds = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setProgressByRoute((previous) => {
        const nextProgress: ProgressByRoute = { ...previous };
        for (const route of fleetRoutes) {
          const currentProgress = nextProgress[route.id] ?? 0;
          const routeLengthMeters = routeLengthById[route.id] ?? 1;
          const metersPerSecond = route.speedMph * 0.44704;
          const normalizedDelta = (metersPerSecond * SIMULATION_SPEED_FACTOR * elapsedSeconds) / routeLengthMeters;
          const updated = currentProgress + normalizedDelta;
          nextProgress[route.id] = updated > 1 ? updated - 1 : updated;
        }
        return nextProgress;
      });
      setLastUpdateLabel("Real-time");
    }, SIMULATION_STEP_MS);
    return () => clearInterval(interval);
  }, [isSimulationPaused, routeLengthById]);

  useEffect(() => {
    if (!notification) return;
    const clear = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(clear);
  }, [notification]);

  const delayedCount = filteredVehicles.filter((v) => (statusOverrides[v.id] ?? v.status) === "Delayed").length;
  const reroutingCount = filteredVehicles.filter((v) => (statusOverrides[v.id] ?? v.status) === "Re-routing").length;
  const onTimeCount = filteredVehicles.length - delayedCount - reroutingCount;

  const fleetTripRows = useMemo<FleetTripRow[]>(() => {
    const baseFromMock = REDCOACH_DATA.map((vehicle, index) => {
      const route = fleetRoutes.find((item) => item.vehicleId === vehicle.id) ?? fleetRoutes[index % fleetRoutes.length];
      const progress = progressByRoute[route.id] ?? ((index % 70) / 100);
      const current = interpolatePosition(route.geoPoints, progress);
      const totalMinutes = (routeLengthById[route.id] / Math.max(route.speedMph * 26.8224, 1)) * 60;
      const remainingMinutes = totalMinutes * (1 - progress);
      return {
        routeId: route.id,
        vehicleId: vehicle.id,
        driver: driverPool[index % driverPool.length],
        origin: route.geoPoints[0] ? `${vehicle.state} Hub` : "Regional Hub",
        destination: vehicle.destination,
        destinationState: getStateCode(vehicle.destination, vehicle.state),
        state: vehicle.state,
        location: vehicle.location,
        status: (statusOverrides[vehicle.id] ?? vehicle.status) as VehicleStatus,
        legacySource: vehicle.legacySource,
        speedMph: route.speedMph,
        occupancyRate: vehicle.occupancyRate,
        progress,
        etaLabel: toEtaLabel(remainingMinutes),
        position: current,
        tripId: vehicle.tripId,
      };
    });

    const trips = operationalBaseQuery.data?.trips ?? [];
    const bookings = operationalBaseQuery.data?.bookings ?? [];
    const bookingByTrip = new Map<string, Record<string, unknown>>();
    for (const booking of bookings) {
      const key = String(booking.tripId ?? booking.id ?? "");
      if (key) bookingByTrip.set(key, booking);
    }
    const external = trips.slice(0, 180).map((trip, index) => {
      const tripId = String(trip.id ?? trip.tripId ?? `EXT-${index + 1}`);
      const state = (trip.state as Exclude<RegionFilter, "All">) || (["FL", "TX", "GA", "OK"][index % 4] as Exclude<RegionFilter, "All">);
      const route = fleetRoutes[index % fleetRoutes.length];
      const progress = ((index * 9 + Date.now() / 5000) % 100) / 100;
      const position = jitterPosition(geoByState[state], index);
      const booking = bookingByTrip.get(tripId);
      const soldSeats = Number(booking?.soldSeats ?? booking?.booked ?? booking?.seatsBooked ?? 8 + (index % 36));
      const capacity = Number(booking?.capacity ?? booking?.seats ?? 56);
      const occupancyRate = Math.min(100, Math.max(0, Math.round((soldSeats / Math.max(capacity, 1)) * 100)));
      const riskStatus: VehicleStatus = occupancyRate < 20 ? "Critical" : index % 6 === 0 ? "Delayed" : "On Time";
      const destination = String(trip.destination ?? cityByState[state][(index + 1) % cityByState[state].length]);
      const location = String(trip.currentLocation ?? cityByState[state][index % cityByState[state].length]);
      return {
        routeId: `${route.id}-ext-${index}`,
        vehicleId: String(trip.vehicleId ?? `BUS-AI-${(index + 1).toString().padStart(3, "0")}`),
        driver: String(trip.driver ?? driverPool[index % driverPool.length]),
        origin: String(trip.origin ?? `${state} Hub`),
        destination,
        destinationState: getStateCode(destination, state),
        state,
        location,
        status: riskStatus,
        legacySource: String(trip.source ?? (index % 2 === 0 ? "Geotab" : "Samsara")),
        speedMph: Number(trip.speedMph ?? route.speedMph),
        occupancyRate,
        progress,
        etaLabel: toEtaLabel((1 - progress) * (80 + (index % 120))),
        position,
        tripId,
      };
    });

    const normalized = [...baseFromMock, ...external];
    while (normalized.length < 120) {
      const seed = normalized[normalized.length % normalized.length];
      const idx = normalized.length + 1;
      normalized.push({
        ...seed,
        routeId: `${seed.routeId}-scale-${idx}`,
        vehicleId: `${seed.vehicleId}-${idx}`,
        tripId: `${seed.tripId}-${idx}`,
        driver: driverPool[idx % driverPool.length],
        position: jitterPosition(seed.position, idx),
      });
    }
    return normalized;
  }, [operationalBaseQuery.data, progressByRoute, routeLengthById, statusOverrides]);

  const filteredTripRows = useMemo(() => {
    const lowerSearch = searchQuery.trim().toLowerCase();
    return fleetTripRows.filter((row) => {
      if (regionFilter !== "All" && row.state !== regionFilter) return false;
      if (focusMode && row.status === "On Time") return false;
      if (!lowerSearch) return true;
      return (
        row.vehicleId.toLowerCase().includes(lowerSearch) ||
        row.driver.toLowerCase().includes(lowerSearch) ||
        row.destinationState.toLowerCase().includes(lowerSearch)
      );
    });
  }, [fleetTripRows, focusMode, regionFilter, searchQuery]);

  const activeInsights = useMemo(() => {
    return [...fleetInsights, ...forecastInsights.map((item) => ({ id: item.id, level: item.title as "Optimization" | "Safety Alert", message: item.detail }))];
  }, []);

  const virtualWindow = useMemo(() => {
    const overscan = 6;
    const start = Math.max(0, Math.floor(ledgerScrollTop / ROW_HEIGHT) - overscan);
    const visibleCount = Math.ceil(VIRTUAL_HEIGHT / ROW_HEIGHT) + overscan * 2;
    const end = Math.min(filteredTripRows.length, start + visibleCount);
    return { start, end };
  }, [filteredTripRows.length, ledgerScrollTop]);

  const visibleRows = filteredTripRows.slice(virtualWindow.start, virtualWindow.end);

  const baseMarkerIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:9999px;background:#00D180;border:2px solid #06372a;box-shadow:0 0 0 2px rgba(255,255,255,0.8)"></div>`,
        iconSize: [14, 14],
      }),
    [],
  );

  const handleReroute = () => {
    const targetVehicle = filteredTripRows.find((vehicle) => vehicle.status === "On Time");

    if (!targetVehicle) return;
    setStatusOverrides((prev) => ({ ...prev, [targetVehicle.vehicleId]: "Re-routing" }));
    setNotification("Fleet Agent: Route optimized via I-10 due to congestion");
  };

  const focusPoints = null;

  useEffect(() => {
    const onHotkey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onHotkey);
    return () => window.removeEventListener("keydown", onHotkey);
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[#E5ECE9] bg-white p-4 shadow-[0_4px_14px_rgba(10,20,19,0.04)]">
          <p className="text-xs uppercase tracking-[0.12em] text-[#607771]">Active Vehicles</p>
          <p className="mt-1 text-3xl font-bold [font-family:Domine,serif] text-[#0A1413]">{filteredVehicles.length}</p>
        </article>
        <article className="rounded-2xl border border-[#E5ECE9] bg-white p-4 shadow-[0_4px_14px_rgba(10,20,19,0.04)]">
          <p className="text-xs uppercase tracking-[0.12em] text-[#607771]">On Time</p>
          <p className="mt-1 text-3xl font-bold [font-family:Domine,serif] text-[#00D180]">{onTimeCount}</p>
        </article>
        <article className="rounded-2xl border border-[#E5ECE9] bg-white p-4 shadow-[0_4px_14px_rgba(10,20,19,0.04)]">
          <p className="text-xs uppercase tracking-[0.12em] text-[#607771]">Delayed or Re-routing</p>
          <p className="mt-1 text-3xl font-bold [font-family:Domine,serif] text-[#FF7900]">{delayedCount + reroutingCount}</p>
        </article>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-[#d9e5e1] bg-white p-3 shadow-[0_10px_30px_rgba(10,20,19,0.08)]">
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#e3ece9] bg-[#f7faf9] px-3 py-2 text-xs text-[#1f3732]">
          <button
            type="button"
            onClick={() => setIsSimulationPaused((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#d4e1dd] bg-white px-2 py-1 font-medium text-[#1f3732]"
          >
            {isSimulationPaused ? <Play size={12} /> : <Pause size={12} />}
            {isSimulationPaused ? "Resume" : "Pause"}
          </button>
          <label className="inline-flex items-center gap-1 rounded-lg border border-[#d4e1dd] bg-white px-2 py-1">
            <span>Region</span>
            <select
              value={regionFilter}
              onChange={(event) => setRegionFilter(event.target.value as RegionFilter)}
              className="bg-transparent outline-none"
            >
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
          <span className="rounded-lg border border-[#d4e1dd] bg-white px-2 py-1 text-[#3b5650]">
            Last update: {lastUpdateLabel}
          </span>
          <button
            type="button"
            onClick={() => setFocusMode((prev) => !prev)}
            className={`rounded-lg border px-2 py-1 font-medium ${
              focusMode ? "border-[#FF7900]/40 bg-[#FF7900]/12 text-[#B45400]" : "border-[#d4e1dd] bg-white text-[#1f3732]"
            }`}
          >
            Focus Mode {focusMode ? "ON" : "OFF"}
          </button>
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-[#d4e1dd] bg-white px-2 py-1">
            <Search size={12} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Bus ID, Driver, Destination State..."
              className="w-56 bg-transparent text-xs outline-none [font-family:Inter,sans-serif]"
            />
            <button type="button" onClick={() => setPaletteOpen(true)} className="inline-flex items-center gap-1 rounded border border-[#d8e3df] px-1.5 py-0.5">
              <Command size={10} />
              K
            </button>
          </div>
        </div>

        <article className="relative h-[620px] overflow-hidden rounded-2xl">
          <MapContainer center={[28.3, -88.7]} zoom={5} minZoom={4} maxZoom={8} zoomControl={false} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={SHARP_TILE_URL}
              detectRetina
            />
            <MapFocusController focusPoints={focusPoints} />

            {filteredRoutes.map((route) => {
              const current = positionsByRoute[route.id];
              const destination = route.geoPoints[route.geoPoints.length - 1];
              if (!current || !destination) return null;
              return (
                <Polyline
                  key={`${route.id}-active`}
                  positions={[
                    [current.lat, current.lng],
                    [destination.lat, destination.lng],
                  ]}
                  pathOptions={{
                    color: "#3e7266",
                    weight: 1.5,
                    opacity: 0.35,
                    dashArray: "6 8",
                  }}
                />
              );
            })}

            <MarkerClusterGroup chunkedLoading maxClusterRadius={42}>
              {filteredTripRows.map((trip) => (
                <Marker
                  key={trip.routeId}
                  position={[trip.position.lat, trip.position.lng]}
                  icon={baseMarkerIcon}
                  eventHandlers={{ click: () => setSelectedVehicleId(trip.vehicleId) }}
                >
                  <Tooltip direction="top" className="fleet-tooltip" opacity={0.98}>
                    {trip.vehicleId} - {trip.status} - ETA {trip.etaLabel}
                  </Tooltip>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>

          <div className="pointer-events-none absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-xl border border-white/55 bg-white/70 px-3 py-2 text-[#1e3530] backdrop-blur-md">
            <MapPinned size={16} className="text-[#0A1413]/80" />
            <h2 className="text-lg font-bold [font-family:Domine,serif]">Fleet Control Live</h2>
          </div>

          <aside className="absolute right-4 top-4 z-[500] w-full max-w-sm rounded-2xl border border-white/45 bg-[#0A1413]/48 p-5 text-white shadow-[0_8px_30px_rgba(10,20,19,0.3)] backdrop-blur-md">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-[#00D180]" />
              <h2 className="text-xl font-bold [font-family:Domine,serif]">Active Insights</h2>
            </div>
            <ul className="space-y-3">
              {activeInsights.map((insight) => (
                <li key={insight.id} className="rounded-xl border border-white/20 bg-white/[0.06] p-3">
                  <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#00D180]">
                    <ShieldAlert size={12} />
                    {insight.level}
                  </p>
                  <p className="mt-2 text-sm text-white/90">{insight.message}</p>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={handleReroute}
              className="mt-4 inline-flex rounded-lg border border-[#00D180]/40 bg-[#00D180]/15 px-3 py-1.5 text-sm font-medium text-[#00D180] hover:bg-[#00D180]/20"
            >
              [Re-route Trip]
            </button>
            <div className="mt-3 rounded-lg border border-[#ffbd86]/30 bg-[#ff7900]/10 p-2 text-xs">
              <p className="mb-1 inline-flex items-center gap-1 font-semibold text-[#FFD7BE]">
                <TriangleAlert size={12} />
                Next 24h Forecast
              </p>
              {forecastInsights.map((item) => (
                <p key={item.id} className="mb-1 text-[#FFEDE0]">
                  {item.title}: {item.detail} {item.action}
                </p>
              ))}
            </div>
          </aside>

          {notification ? (
            <div className="pointer-events-none absolute left-4 top-[8.4rem] z-[500] rounded-xl border border-[#FF7900]/40 bg-[#1b1816]/80 px-3 py-2 text-sm text-[#FFD7BE] shadow-lg backdrop-blur-sm">
              <p className="inline-flex items-center gap-2 font-medium text-[#FF7900]">
                <BellRing size={14} />
                {notification}
              </p>
            </div>
          ) : null}
        </article>
      </section>

      <section className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-[0_4px_16px_rgba(10,20,19,0.04)]">
        <h2 className="mb-2 text-xl font-bold [font-family:Domine,serif]">High-Volume Trip Ledger</h2>
        <p className="mb-4 text-xs text-[#607771] [font-family:Inter,sans-serif]">
          Virtualized grid for {filteredTripRows.length} trips, with real-time timeline and booking-derived capacity risk.
        </p>
        <div className="grid grid-cols-[1.2fr_1fr_0.8fr_1.5fr_1fr_1fr] gap-2 rounded-lg border border-[#e5ece9] bg-[#f8fbfa] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#607771] [font-family:Inter,sans-serif]">
          <span>Vehicle/Driver</span>
          <span>Location</span>
          <span>Status</span>
          <span>Timeline/Status</span>
          <span>Capacity Alert</span>
          <span>Trip Source</span>
        </div>
        <div
          onScroll={(event) => setLedgerScrollTop(event.currentTarget.scrollTop)}
          style={{ height: `${VIRTUAL_HEIGHT}px` }}
          className="relative mt-2 overflow-auto rounded-lg border border-[#e5ece9] [font-family:Inter,sans-serif]"
        >
          <div style={{ height: `${filteredTripRows.length * ROW_HEIGHT}px` }} className="relative">
            {visibleRows.map((row, idx) => {
              const absoluteIndex = virtualWindow.start + idx;
              const top = absoluteIndex * ROW_HEIGHT;
              const capacityRisk = row.occupancyRate < 20;
              return (
                <div
                  key={row.routeId}
                  style={{ transform: `translateY(${top}px)` }}
                  className="absolute left-0 right-0 grid h-[56px] cursor-pointer grid-cols-[1.2fr_1fr_0.8fr_1.5fr_1fr_1fr] items-center gap-2 border-b border-[#edf2f0] bg-white px-3 text-xs hover:bg-[#f3f8f6]"
                  onClick={() => setSelectedVehicleId(row.vehicleId)}
                >
                  <div>
                    <p className="font-semibold text-[#142825]">{row.vehicleId}</p>
                    <p className="text-[#607771]">{row.driver}</p>
                  </div>
                  <div className="text-[#3F5651]">{row.location}</div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.status === "On Time"
                          ? "bg-[#00D180]/10 text-[#0E9D63]"
                          : row.status === "Critical"
                            ? "bg-[#C92525]/15 text-[#B11D1D]"
                            : "bg-[#FF7900]/15 text-[#C55A00]"
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-[10px] text-[#5a736d]">
                      <span>{row.origin}</span>
                      <span>ETA {row.etaLabel}</span>
                      <span>{row.destination}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#e3ece9]">
                      <div className="h-2 rounded-full bg-[#00D180]" style={{ width: `${Math.round(row.progress * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <span className={`rounded-md px-2 py-1 font-semibold ${capacityRisk ? "bg-[#C92525]/15 text-[#B11D1D]" : "bg-[#00D180]/10 text-[#0E9D63]"}`}>
                      {capacityRisk ? `Risk ${row.occupancyRate}%` : `${row.occupancyRate}%`}
                    </span>
                  </div>
                  <div className="text-[#3F5651]">{row.legacySource}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {selectedVehicle ? (
        <section className="rounded-2xl border border-[#E5ECE9] bg-white p-4 text-sm text-[#2E4540]">
          Selected vehicle {selectedVehicle.id} on trip {selectedVehicle.tripId} heading to {selectedVehicle.destination}. ETA {selectedVehicle.eta}.
        </section>
      ) : null}

      {paletteOpen ? (
        <div className="fixed inset-0 z-[1200] flex items-start justify-center bg-[#091211]/45 pt-20 backdrop-blur-sm" onClick={() => setPaletteOpen(false)}>
          <div className="w-full max-w-2xl rounded-xl border border-[#d9e5e1] bg-white p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-[#d4e1dd] px-3 py-2">
              <Search size={14} className="text-[#607771]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by Bus ID, Driver, Destination State..."
                className="w-full bg-transparent text-sm outline-none"
              />
              <button type="button" className="rounded border border-[#d4e1dd] px-2 py-0.5 text-xs" onClick={() => setPaletteOpen(false)}>
                Esc
              </button>
            </div>
            <div className="max-h-80 overflow-auto">
              {filteredTripRows.slice(0, 10).map((row) => (
                <button
                  key={`${row.routeId}-palette`}
                  type="button"
                  className="mb-1 flex w-full items-center justify-between rounded-md border border-transparent px-3 py-2 text-left text-sm hover:border-[#dbe8e4] hover:bg-[#f6fbf9]"
                  onClick={() => {
                    setSelectedVehicleId(row.vehicleId);
                    setPaletteOpen(false);
                  }}
                >
                  <span>
                    {row.vehicleId} - {row.driver}
                  </span>
                  <span className="text-xs text-[#607771]">{row.destinationState}</span>
                </button>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <button type="button" className="rounded-md border border-[#d4e1dd] px-2 py-1 text-left" onClick={() => setFocusMode((prev) => !prev)}>
                  Toggle Focus Mode
                </button>
                <button type="button" className="rounded-md border border-[#d4e1dd] px-2 py-1 text-left" onClick={handleReroute}>
                  Run Re-route Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
