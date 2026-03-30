import {
  Cable,
  ChartNoAxesCombined,
  CircleDollarSign,
  Clock3,
  ServerCog,
  ShieldCheck,
} from "lucide-react";
import AIAgentChat from "../components/AIAgentChat";
import { connectivitySystems, unifiedMetrics } from "../mockData";

const metricIcons = [CircleDollarSign, ChartNoAxesCombined, Clock3];

export default function Overview() {
  return (
    <div className="space-y-6">
      <section aria-label="Operational impact metrics" className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {unifiedMetrics.map((metric, index) => {
          const Icon = metricIcons[index] ?? ChartNoAxesCombined;
          const isSuccess = metric.tone === "success";
          return (
            <article
              key={metric.label}
              className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-[0_4px_16px_rgba(10,20,19,0.04)]"
            >
              <div className="mb-4 inline-flex rounded-lg bg-[#F2F7F5] p-2 text-[#0A1413]">
                <Icon size={17} />
              </div>
              <p className="text-xs uppercase tracking-[0.14em] text-[#5B716C]">{metric.label}</p>
              <p className={`mt-2 text-3xl font-bold [font-family:Domine,serif] ${isSuccess ? "text-[#00D180]" : ""}`}>
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-[#627A74]">{metric.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-[0_4px_16px_rgba(10,20,19,0.04)]">
          <div className="mb-4 flex items-center gap-2">
            <Cable size={16} className="text-[#0A1413]/80" />
            <h2 className="text-xl font-bold [font-family:Domine,serif]">Systems Connectivity Status</h2>
          </div>
          <ul className="space-y-2">
            {connectivitySystems.map((system) => (
              <li
                key={system.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E8EFEC] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <ServerCog size={15} className="text-[#38504B]" />
                  <div>
                    <p className="text-sm font-medium text-[#0A1413]">{system.name}</p>
                    <p className="text-xs text-[#6C827D]">API Uptime: {system.apiUptime}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                    system.syncStatus === "Stable"
                      ? "border-[#00D180]/25 bg-[#00D180]/10 text-[#0F9F67]"
                      : "border-[#FF7900]/30 bg-[#FF7900]/10 text-[#BC5A00]"
                  }`}
                >
                  <ShieldCheck size={13} />
                  Sync Status: {system.syncStatus}
                </span>
              </li>
            ))}
          </ul>
        </article>
        <AIAgentChat />
      </section>
    </div>
  );
}
