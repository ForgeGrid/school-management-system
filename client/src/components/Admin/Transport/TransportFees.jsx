import React, { useState } from "react";
import TransportFeeOverview from "./TransportFeeOverview";
import TransportFeeConfig from "./Bus Routes/TransportConfig";

// ── font and style injection ────────────────────────────────────────────────
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .tfc-root * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
    .tfc-root input::placeholder { color: #94a3b8; font-weight: 500; font-size: 13px; }
    .tfc-root select { appearance: none; }
    .tfc-row-highlight { border-left: 3px solid #f97316 !important; }
    .tfc-row-inactive  { background: #fffbeb; }
    .tfc-status-configured { background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .tfc-status-partial { background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .tfc-status-pending { background-color: #fef2f2; color: #b91c1c; border: 1px solid #fca5a5; }
    .tfc-status-archived { background-color: #f8fafc; color: #475569; border: 1px solid #cbd5e1; }
  `}</style>
);

export default function TransportFees() {
  // ── view switcher: "overview" | "configure" ───────────────────────────────
  const [view, setView] = useState("overview");
  // The route object passed when user clicks "Configure Fees" in the overview
  const [configRoute, setConfigRoute] = useState(null);

  const handleConfigureRoute = (route) => {
    setConfigRoute(route);
    setView("configure");
  };

  const handleBackToOverview = () => {
    setConfigRoute(null);
    setView("overview");
  };

  return (
    <div className="tfc-root h-full">
      <FontStyle />

      {view === "overview" ? (
        <TransportFeeOverview onConfigureRoute={handleConfigureRoute} />
      ) : (
        <TransportFeeConfig
          initialRoute={configRoute}
          onBack={handleBackToOverview}
        />
      )}
    </div>
  );
}