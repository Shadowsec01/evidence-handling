import React, { useState } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Login from "./components/Login";
import FieldCollectionView from "./views/FieldCollectionView";
import InvestigatorView from "./views/InvestigatorView";
import OfficerHeadView from "./views/OfficerHeadView";

const TABS = [
  { key: "field", label: "Field Collection", roles: ["field_officer"], Component: FieldCollectionView },
  { key: "investigator", label: "Investigator", roles: ["investigator"], Component: InvestigatorView },
  { key: "head", label: "Officer Head", roles: ["officer_head"], Component: OfficerHeadView }
];

function Shell() {
  const { auth, logout } = useAuth();
  const availableTabs = TABS.filter((t) => t.roles.includes(auth.role));
  const [activeTab, setActiveTab] = useState(availableTabs[0]?.key);

  const current = TABS.find((t) => t.key === activeTab) || availableTabs[0];
  const ActiveComponent = current?.Component;

  return (
    <div className="app-shell">
      <div className="header">
        <h1>Digital Evidence Integrity Platform</h1>
        <div className="who">
          {auth.name} ({auth.role}){" "}
          <button className="secondary" onClick={logout} style={{ marginLeft: 10 }}>
            Log out
          </button>
        </div>
      </div>

      <div className="tabs">
        {availableTabs.map((t) => (
          <button
            key={t.key}
            className={`tab ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {ActiveComponent && <ActiveComponent />}
    </div>
  );
}

function Gate() {
  const { auth } = useAuth();
  return auth ? <Shell /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
