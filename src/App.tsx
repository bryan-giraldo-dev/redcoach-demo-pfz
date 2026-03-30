import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  getDemoCustomers,
  getDemoKpis,
  getDemoWorkflows,
  fetchDemoTimeline,
  type DemoScenario,
  type TimelineEvent,
} from "./demoData";

function App() {
  const [scenario, setScenario] = useState<DemoScenario>("Baseline");

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">RedCoach demo environment</p>
          <h1>Selfware Operations Console</h1>
        </div>
        <nav className="nav-links">
          <NavLink to="/overview" className={getNavClass}>
            Overview
          </NavLink>
          <NavLink to="/workflows" className={getNavClass}>
            Workflows
          </NavLink>
          <NavLink to="/customers" className={getNavClass}>
            Customers
          </NavLink>
        </nav>
      </header>

      <section className="toolbar panel">
        <div>
          <p className="toolbar-label">Scenario</p>
          <p className="section-description">
            Switch the business context during your sales call.
          </p>
        </div>
        <div className="scenario-buttons">
          <button
            type="button"
            className={scenario === "Baseline" ? "btn-primary btn-active" : "btn-secondary"}
            onClick={() => setScenario("Baseline")}
          >
            Baseline
          </button>
          <button
            type="button"
            className={scenario === "Peak Season" ? "btn-primary btn-active" : "btn-secondary"}
            onClick={() => setScenario("Peak Season")}
          >
            Peak Season
          </button>
        </div>
      </section>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<OverviewPage scenario={scenario} />} />
          <Route path="/workflows" element={<WorkflowPage scenario={scenario} />} />
          <Route path="/customers" element={<CustomersPage scenario={scenario} />} />
        </Routes>
      </main>
    </div>
  );
}

function getNavClass({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-link nav-link-active" : "nav-link";
}

function PresentationGuide() {
  const location = useLocation();
  const navigate = useNavigate();

  const routeOrder = ["/overview", "/workflows", "/customers"];
  const currentIndex = routeOrder.indexOf(location.pathname);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const isLastStep = safeIndex === routeOrder.length - 1;

  const stepTitle = useMemo(() => {
    if (location.pathname === "/overview") {
      return "Step 1/3: Show business impact first";
    }
    if (location.pathname === "/workflows") {
      return "Step 2/3: Explain the automation engine";
    }
    return "Step 3/3: Close with customer outcomes";
  }, [location.pathname]);

  const goToNextStep = () => {
    if (isLastStep) {
      navigate("/overview");
      return;
    }
    navigate(routeOrder[safeIndex + 1]);
  };

  return (
    <aside className="panel guide-panel">
      <h3>Presentation mode</h3>
      <p className="guide-title">{stepTitle}</p>
      <button type="button" className="btn-primary" onClick={goToNextStep}>
        {isLastStep ? "Restart tour" : "Next screen"}
      </button>
    </aside>
  );
}

function OverviewPage({ scenario }: { scenario: DemoScenario }) {
  const kpis = getDemoKpis(scenario);
  const timelineQuery = useQuery({
    queryKey: ["timeline", scenario],
    queryFn: () => fetchDemoTimeline(scenario),
  });

  return (
    <section className="page-layout">
      <PresentationGuide />

      <div className="grid-layout">
        <article className="panel">
          <h2>Business KPIs</h2>
          <div className="kpi-grid">
            {kpis.map((kpi) => (
              <div className="kpi-card" key={kpi.label}>
                <p className="kpi-value">{kpi.value}</p>
                <p className="kpi-label">{kpi.label}</p>
                <p className="kpi-delta">{kpi.delta}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <h2>Live activity timeline</h2>
          {timelineQuery.isLoading ? (
            <p>Loading recent events...</p>
          ) : (
            <ul className="timeline">
              {(timelineQuery.data as TimelineEvent[]).map((event) => (
                <li key={event.id}>
                  <p className="timeline-title">{event.title}</p>
                  <p className="timeline-meta">
                    {event.system} · {event.timestamp}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
}

function WorkflowPage({ scenario }: { scenario: DemoScenario }) {
  const workflows = getDemoWorkflows(scenario);

  return (
    <section className="page-layout">
      <PresentationGuide />
      <article className="panel">
        <h2>Active automation workflows</h2>
        <p className="section-description">
          This screen simulates what your operations team sees when Selfware
          orchestrates updates across disconnected tools.
        </p>

        <ul className="workflow-list">
          {workflows.map((workflow) => (
            <li key={workflow.id} className="workflow-item">
              <div>
                <p className="workflow-title">{workflow.name}</p>
                <p className="workflow-meta">
                  {workflow.source} → {workflow.destination}
                </p>
              </div>
              <span className={`pill pill-${workflow.status.toLowerCase()}`}>
                {workflow.status}
              </span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

function CustomersPage({ scenario }: { scenario: DemoScenario }) {
  const customers = getDemoCustomers(scenario);

  return (
    <section className="page-layout">
      <PresentationGuide />
      <article className="panel">
        <h2>Customer health signals</h2>
        <p className="section-description">
          A simple, clear view for demos: account status, risk and next action.
        </p>
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Plan</th>
              <th>Health</th>
              <th>Next action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.plan}</td>
                <td>{row.health}</td>
                <td>{row.nextAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}

export default App;
