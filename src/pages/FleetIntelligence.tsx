import { BellRing, MapPinned, Pause, Play, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Polyline, TileLayer } from "react-leaflet";
import MovingBus from "../components/MovingBus";
import type { FleetGeoPoint } from "../mockData";
import { fleetInsights, fleetRoutes, fleetVehicles } from "../mockData";

type PositionByRoute = Record<string, FleetGeoPoint>;
type ProgressByRoute = Record<string, number>;

const SIMULATION_SPEED_FACTOR = 0.08;
const SIMULATION_STEP_MS = 250;
const BASE_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const LIGHT_TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const SHARP_TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const regionOptions = ["All", "FL", "TX", "GA", "OK"] as const;
type RegionFilter = (typeof regionOptions)[number];

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

export default function FleetIntelligence() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [stoppedVehicleIds, setStoppedVehicleIds] = useState<string[]>(["BUS-RD-402"]);
  const [stopNotification, setStopNotification] = useState<string | null>(
    "Fleet Agent: Detecting unplanned stop. Contacting driver...",
  );
  const [progressByRoute, setProgressByRoute] = useState<ProgressByRoute>({});
  const [isSimulationPaused, setIsSimulationPaused] = useState(false);
  const [mapStyle, setMapStyle] = useState<"sharp" | "outdoor" | "light">("sharp");
  const [lastUpdateLabel, setLastUpdateLabel] = useState("Real-time");
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("All");
  const lastTickRef = useRef<number>(Date.now());

  const selectedVehicle = useMemo(
    () => fleetVehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [selectedVehicleId],
  );

  const routeLengthById = useMemo(() => {
    const lengths: Record<string, number> = {};
    for (const route of fleetRoutes) {
      lengths[route.id] = getRouteLengthMeters(route.geoPoints);
    }
    return lengths;
  }, []);

  const filteredVehicles = useMemo(() => {
    if (regionFilter === "All") return fleetVehicles;
    return fleetVehicles.filter((vehicle) => vehicle.state === regionFilter);
  }, [regionFilter]);

  const filteredRoutes = useMemo(() => {
    const activeVehicleIds = new Set(filteredVehicles.map((vehicle) => vehicle.id));
    return fleetRoutes.filter((route) => activeVehicleIds.has(route.vehicleId));
  }, [filteredVehicles]);

  const delayedCount = filteredVehicles.filter((vehicle) => vehicle.status === "Delayed").length;
  const onTimeCount = filteredVehicles.length - delayedCount;

  const positionsByRoute = useMemo<PositionByRoute>(() => {
    return filteredRoutes.reduce<PositionByRoute>((acc, route) => {
      acc[route.id] = interpolatePosition(route.geoPoints, progressByRoute[route.id] ?? 0);
      return acc;
    }, {});
  }, [filteredRoutes, progressByRoute]);

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
          if (stoppedVehicleIds.includes(route.vehicleId)) {
            nextProgress[route.id] = currentProgress;
            continue;
          }

          const routeLengthMeters = routeLengthById[route.id] ?? 1;
          const metersPerSecond = route.speedMph * 0.44704;
          const normalizedDelta =
            ((metersPerSecond * SIMULATION_SPEED_FACTOR * elapsedSeconds) /
              routeLengthMeters) *
            1;
          const updated = currentProgress + normalizedDelta;
          nextProgress[route.id] = updated > 1 ? updated - 1 : updated;
        }

        return nextProgress;
      });
      setLastUpdateLabel("Real-time");
    }, SIMULATION_STEP_MS);

    return () => clearInterval(interval);
  }, [isSimulationPaused, routeLengthById, stoppedVehicleIds]);

  useEffect(() => {
    const cycleStops = setInterval(() => {
      setStoppedVehicleIds((current) => {
        const next = current.includes("BUS-RD-402") ? ["BUS-TX-225"] : ["BUS-RD-402"];
        setStopNotification("Fleet Agent: Detecting unplanned stop. Contacting driver...");
        return next;
      });
    }, 12000);
    return () => clearInterval(cycleStops);
  }, []);

  useEffect(() => {
    if (!stopNotification) return;
    const clear = setTimeout(() => setStopNotification(null), 4500);
    return () => clearTimeout(clear);
  }, [stopNotification]);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-[#E5ECE9] bg-white p-4 shadow-[0_4px_14px_rgba(10,20,19,0.04)]">
          <p className="text-xs uppercase tracking-[0.12em] text-[#607771]">Active Buses</p>
          <p className="mt-1 text-3xl font-bold [font-family:Domine,serif] text-[#0A1413]">{filteredVehicles.length}</p>
        </article>
        <article className="rounded-2xl border border-[#E5ECE9] bg-white p-4 shadow-[0_4px_14px_rgba(10,20,19,0.04)]">
          <p className="text-xs uppercase tracking-[0.12em] text-[#607771]">On Time</p>
          <p className="mt-1 text-3xl font-bold [font-family:Domine,serif] text-[#00A966]">{onTimeCount}</p>
        </article>
        <article className="rounded-2xl border border-[#E5ECE9] bg-white p-4 shadow-[0_4px_14px_rgba(10,20,19,0.04)]">
          <p className="text-xs uppercase tracking-[0.12em] text-[#607771]">Delayed / Stopped</p>
          <p className="mt-1 text-3xl font-bold [font-family:Domine,serif] text-[#FF7900]">
            {delayedCount + stoppedVehicleIds.length}
          </p>
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
            <span>Style</span>
            <select
              value={mapStyle}
              onChange={(event) => setMapStyle(event.target.value as "sharp" | "outdoor" | "light")}
              className="bg-transparent outline-none"
            >
              <option value="sharp">Sharp</option>
              <option value="outdoor">Outdoor</option>
              <option value="light">Light</option>
            </select>
          </label>

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
        </div>

        <article className="relative h-[620px] overflow-hidden rounded-2xl">
          <MapContainer
            center={[28.3, -88.7]}
            zoom={5}
            minZoom={4}
            maxZoom={8}
            zoomControl={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={
                mapStyle === "sharp" ? SHARP_TILE_URL : mapStyle === "outdoor" ? BASE_TILE_URL : LIGHT_TILE_URL
              }
              detectRetina
            />

            {filteredRoutes.map((route) => (
              <Polyline
                key={`${route.id}-line`}
                positions={route.geoPoints.map((point) => [point.lat, point.lng])}
                pathOptions={{ color: "#3e7266", weight: 1.3, opacity: 0.25, dashArray: "4 8" }}
              />
            ))}

            {filteredRoutes.map((route, index) => (
              <MovingBus
                key={route.id}
                registration={route.registration}
                speedMph={route.speedMph}
                position={positionsByRoute[route.id]}
                iconType={index % 2 === 0 ? "bus" : "truck"}
                markerStatus={stoppedVehicleIds.includes(route.vehicleId) ? "delayed" : "on-time"}
                onClick={() => setSelectedVehicleId(route.vehicleId)}
              />
            ))}
          </MapContainer>

          <div className="pointer-events-none absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-xl border border-white/55 bg-white/70 px-3 py-2 text-[#1e3530] backdrop-blur-md">
            <MapPinned size={16} className="text-[#0A1413]/80" />
            <h2 className="text-lg font-bold [font-family:Domine,serif]">Fleet Command Center Live</h2>
          </div>

          <div className="pointer-events-none absolute left-4 top-20 z-[500] rounded-xl border border-white/55 bg-white/65 px-3 py-2 text-xs text-[#2A403C] backdrop-blur-md">
            AI Analyzing traffic patterns on I-10
          </div>

          <div className="pointer-events-none absolute bottom-3 left-3 z-[500] inline-flex items-center gap-4 rounded-xl border border-white/50 bg-white/75 px-3 py-2 text-xs text-[#2A403C] backdrop-blur-md">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#00A966]" /> On Time
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#FF7900]" /> Delayed/Stopped
            </span>
          </div>

          <aside className="absolute right-4 top-4 z-[500] w-full max-w-sm rounded-2xl border border-white/45 bg-[#0A1413]/48 p-5 text-white shadow-[0_8px_30px_rgba(10,20,19,0.3)] backdrop-blur-md">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-[#00D180]" />
              <h2 className="text-xl font-bold [font-family:Domine,serif]">Active Insights</h2>
            </div>
            <ul className="space-y-3">
              {fleetInsights.map((insight) => (
                <li key={insight.id} className="rounded-xl border border-white/20 bg-white/[0.06] p-3">
                  <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#00D180]">
                    <ShieldAlert size={12} />
                    {insight.level}
                  </p>
                  <p className="mt-2 text-sm text-white/90">{insight.message}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl border border-white/20 bg-white/[0.05] p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-white/70">Agent Queue</p>
              <p className="mt-1 text-sm text-white/90">Next action: Verify stop reason for BUS-RD-402</p>
            </div>
          </aside>

          {selectedVehicle ? (
            <div className="pointer-events-none absolute bottom-3 left-3 z-[500] max-w-sm rounded-xl border border-[#00D180]/25 bg-[#0F1F1E]/90 p-3 text-sm text-white shadow-lg backdrop-blur-sm">
              <p className="font-semibold text-[#00D180]">{selectedVehicle.id}</p>
              <p className="mt-1 text-white/85">
                AI Overlay: Monitoring fuel efficiency & real-time ETA via legacy sensor data.
              </p>
            </div>
          ) : null}

          {stopNotification ? (
            <div className="pointer-events-none absolute left-4 top-[8.4rem] z-[500] rounded-xl border border-[#FF7900]/40 bg-[#1b1816]/80 px-3 py-2 text-sm text-[#FFD7BE] shadow-lg backdrop-blur-sm">
              <p className="inline-flex items-center gap-2 font-medium text-[#FF7900]">
                <BellRing size={14} />
                {stopNotification}
              </p>
            </div>
          ) : null}
        </article>
      </section>

      <section className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-[0_4px_16px_rgba(10,20,19,0.04)]">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="mb-4 text-xl font-bold [font-family:Domine,serif]">Fleet Vehicles</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#607771]">
                      Vehicle ID
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#607771]">
                      Current Location
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#607771]">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#607771]">
                      Legacy Source
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="cursor-pointer rounded-xl border border-[#E7EEEB] bg-[#FAFCFB] transition hover:bg-[#F1F7F5]"
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                    >
                      <td className="rounded-l-xl px-3 py-3 text-sm font-semibold text-[#142825]">{vehicle.id}</td>
                      <td className="px-3 py-3 text-sm text-[#3F5651]">{vehicle.location}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            stoppedVehicleIds.includes(vehicle.id)
                              ? "bg-[#FF7900]/15 text-[#C55A00]"
                              : vehicle.status === "On Time"
                                ? "bg-[#00D180]/10 text-[#0E9D63]"
                                : "bg-[#F5A524]/15 text-[#B57600]"
                          }`}
                        >
                          {stoppedVehicleIds.includes(vehicle.id) ? "Stopped" : vehicle.status}
                        </span>
                      </td>
                      <td className="rounded-r-xl px-3 py-3 text-sm text-[#3F5651]">{vehicle.legacySource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-2xl border border-[#E5ECE9] bg-[#F7FAF9] p-4">
            <h3 className="text-lg font-bold [font-family:Domine,serif]">Recent Events</h3>
            <ul className="mt-3 space-y-2">
              <li className="rounded-xl border border-[#E6EEEA] bg-white p-3 text-sm text-[#3f5651]">
                2 min ago - BUS-TX-225 resumed normal ETA.
              </li>
              <li className="rounded-xl border border-[#E6EEEA] bg-white p-3 text-sm text-[#3f5651]">
                5 min ago - I-10 traffic density updated by Fleet Agent.
              </li>
              <li className="rounded-xl border border-[#E6EEEA] bg-white p-3 text-sm text-[#3f5651]">
                8 min ago - Safety check confirmed for BUS-RD-402.
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}
