import { useState } from "react";
import DashboardShell, { type DashboardSection } from "./components/DashboardShell";
import FleetControl from "./pages/FleetControl";
import Overview from "./pages/Overview";

function App() {
  const [selectedState, setSelectedState] = useState("Florida");
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");

  const sectionTitleBySection: Record<DashboardSection, string> = {
    overview: "Operational Overview",
    "fleet-intelligence": "Fleet Control",
    "unified-crm": "Customer Hub",
    "overlay-systems": "Connectivity",
  };

  return (
    <DashboardShell
      sectionTitle={sectionTitleBySection[activeSection]}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      selectedState={selectedState}
      onStateChange={setSelectedState}
      metrics={[]}
      logoSlot={
        <div className="w-full">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Performanze</p>
          <p className="text-sm font-semibold text-white">Operations Control</p>
        </div>
      }
    >
      {activeSection === "fleet-intelligence" ? <FleetControl /> : <Overview />}
    </DashboardShell>
  );
}

export default App;
