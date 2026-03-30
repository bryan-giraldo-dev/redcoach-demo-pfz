import {
  Activity,
  Gauge,
  Layers3,
  LayoutDashboard,
  MapPinned,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useMemo, type ReactNode } from "react";

export type DashboardSection = "overview" | "fleet-intelligence" | "unified-crm" | "overlay-systems";

type MetricCard = {
  title: string;
  value: string;
  detail?: string;
  icon?: LucideIcon;
};

type DashboardShellProps = {
  sectionTitle?: string;
  activeSection?: DashboardSection;
  onSectionChange?: (section: DashboardSection) => void;
  systemsOverlayed?: number;
  selectedState?: string;
  stateOptions?: string[];
  onStateChange?: (state: string) => void;
  metrics?: MetricCard[];
  logoSlot?: ReactNode;
  children?: ReactNode;
};

const defaultStateOptions = ["Florida", "Texas", "Georgia", "Oklahoma"];

const defaultMetrics: MetricCard[] = [
  { title: "Fleet Visibility", value: "94.2%", detail: "Live units tracked", icon: MapPinned },
  { title: "Unified Leads", value: "1,280", detail: "CRM signals today", icon: UsersRound },
  { title: "Overlay Coverage", value: "6/6", detail: "Systems connected", icon: Layers3 },
  { title: "Operational Pulse", value: "Active", detail: "Engine stable", icon: Activity },
];

export default function DashboardShell({
  sectionTitle = "Operational Overview",
  activeSection = "overview",
  onSectionChange,
  systemsOverlayed = 6,
  selectedState = "Florida",
  stateOptions = defaultStateOptions,
  onStateChange,
  metrics = defaultMetrics,
  logoSlot,
  children,
}: DashboardShellProps) {
  const navItems = useMemo(
    () => [
      { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
      { id: "fleet-intelligence" as const, label: "Fleet Control", icon: Gauge },
      { id: "unified-crm" as const, label: "Customer Hub", icon: UsersRound },
      { id: "overlay-systems" as const, label: "Connectivity", icon: Layers3 },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#0A1413]">
      <div className="min-h-screen md:pl-[280px]">
        <aside className="flex flex-col bg-[#0A1413] px-5 py-6 text-white md:fixed md:inset-y-0 md:left-0 md:w-[280px]">
          <div className="mb-8 flex min-h-16 items-center rounded-xl border border-white/10 bg-white/5 px-3">
            {logoSlot ?? (
              <div className="w-full">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Performanze</p>
                <p className="text-sm font-semibold">Logo Space</p>
              </div>
            )}
          </div>

          <nav className="flex flex-1 flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onSectionChange?.(item.id)}
                  className={`rounded-xl border px-3 py-2.5 text-left transition ${
                    isActive
                      ? "border-[#00D180]/50 bg-[#00D180]/10"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={isActive ? "text-[#00D180]" : "text-white/85"} />
                    <span className="text-[14px] font-medium leading-5">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          <footer className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/65">Engine Status</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D180] opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00D180]" />
              </span>
              <span className="text-sm font-medium text-[#00D180]">Active</span>
            </div>
          </footer>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-[#E5ECE9] bg-white px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl font-bold [font-family:Domine,serif]">{sectionTitle}</h1>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE6E2] bg-[#F7FAF9] px-3 py-1.5 text-sm">
                  <Layers3 size={14} className="text-[#0A1413]/70" />
                  <span>{systemsOverlayed} Systems Online</span>
                </div>
                <label className="inline-flex items-center gap-2 rounded-full border border-[#DCE6E2] bg-white px-3 py-1.5 text-sm">
                  <span className="text-[#38504B]">State</span>
                  <select
                    value={selectedState}
                    onChange={(event) => onStateChange?.(event.target.value)}
                    className="bg-transparent text-[#0A1413] outline-none"
                  >
                    {stateOptions.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </header>

          <main className="flex-1 bg-[#F7FAF9] p-6">
            {metrics.length > 0 ? (
              <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => {
                  const Icon = metric.icon ?? Activity;
                  return (
                    <article
                      key={metric.title}
                      className="rounded-2xl border border-[#E5ECE9] bg-white p-4 shadow-[0_4px_16px_rgba(10,20,19,0.05)]"
                    >
                      <div className="mb-3 inline-flex rounded-lg bg-[#F2F7F5] p-2 text-[#0A1413]">
                        <Icon size={16} />
                      </div>
                      <p className="text-xs uppercase tracking-[0.14em] text-[#5B716C]">{metric.title}</p>
                      <p className="mt-1 text-2xl font-semibold [font-family:Domine,serif]">{metric.value}</p>
                      {metric.detail ? <p className="mt-1 text-sm text-[#617873]">{metric.detail}</p> : null}
                    </article>
                  );
                })}
              </section>
            ) : null}

            {children ? <section className={metrics.length > 0 ? "mt-6" : ""}>{children}</section> : null}
          </main>
        </div>
      </div>
    </div>
  );
}
