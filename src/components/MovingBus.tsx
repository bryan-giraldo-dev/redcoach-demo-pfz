import { Bus, Truck } from "lucide-react";
import L from "leaflet";
import { useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker, Tooltip } from "react-leaflet";
import type { FleetGeoPoint } from "../mockData";

type MovingBusProps = {
  registration: string;
  speedMph: number;
  position: FleetGeoPoint;
  markerStatus?: "on-time" | "delayed" | "critical";
  iconType?: "bus" | "truck";
  onClick?: () => void;
};

export default function MovingBus({
  registration,
  speedMph,
  position,
  markerStatus = "on-time",
  iconType = "bus",
  onClick,
}: MovingBusProps) {
  const ActiveIcon = iconType === "truck" ? Truck : Bus;
  const markerIcon = useMemo(() => {
    const svg = renderToStaticMarkup(<ActiveIcon size={14} strokeWidth={2.2} />);
    const color = "#ffffff";
    const palette =
      markerStatus === "critical"
        ? { border: "rgba(196,29,29,0.85)", bg: "#C92525" }
        : markerStatus === "delayed"
          ? { border: "rgba(255,121,0,0.75)", bg: "#FF7900" }
          : { border: "rgba(0,209,128,0.85)", bg: "#00D180" };

    return L.divIcon({
      className: "",
      iconAnchor: [14, 14],
      iconSize: [28, 28],
      html: `<div style="height:28px;width:28px;border-radius:999px;border:1px solid ${palette.border};display:flex;align-items:center;justify-content:center;background:${palette.bg};color:${color};box-shadow:0 6px 14px rgba(10,20,19,0.26)">${svg}</div>`,
    });
  }, [ActiveIcon, markerStatus]);

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={markerIcon}
      eventHandlers={onClick ? { click: onClick } : undefined}
    >
      <Tooltip direction="top" offset={[0, -16]} opacity={1} className="fleet-tooltip">
        Reg: {registration} • Speed: {speedMph} mph • Last update: Real-time
      </Tooltip>
    </Marker>
  );
}
