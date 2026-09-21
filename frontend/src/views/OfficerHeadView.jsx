import React, { useEffect, useState } from "react";
import client from "../api/client";
import AuditTrailTable from "../components/AuditTrailTable";
import EvidenceFileList from "../components/EvidenceFileList";

export default function OfficerHeadView() {
  const [cases, setCases] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [evidenceDetail, setEvidenceDetail] = useState(null);

  async function loadAll() {
    const [casesRes, incidentsRes] = await Promise.all([
      client.get("/cases"),
      client.get("/incidents")
    ]);
    setCases(casesRes.data);
    setIncidents(incidentsRes.data);
  }

  async function loadEvidence(caseId) {
    const { data } = await client.get(`/cases/${caseId}/evidence`);
    setEvidenceItems(data);
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (selectedCase) loadEvidence(selectedCase._id);
  }, [selectedCase]);

  useEffect(() => {
    async function loadDetail() {
      if (!selectedEvidence) return setEvidenceDetail(null);
      const { data } = await client.get(`/evidence/${selectedEvidence._id}`);
      setEvidenceDetail(data);
    }
    loadDetail();
  }, [selectedEvidence]);

  return (
    <div>
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Incidents</h2>
          <button className="secondary" onClick={loadAll}>Refresh</button>
        </div>
        {incidents.length === 0 && (
          <div style={{ color: "var(--muted)", marginTop: 8 }}>No incidents recorded. All verified evidence currently matches its H0 baseline.</div>
        )}
        {incidents.map((inc) => (
          <div key={inc._id} className="list-item">
            <span className="badge fail">HASH MISMATCH</span>{" "}
            <strong>{inc.evidenceItemId?.label || "Unknown evidence"}</strong>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              Detected {new Date(inc.detectedAt).toLocaleString()} — {inc.notes}
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
        <h2>All Cases</h2>
        {cases.map((c) => (
          <div
            key={c._id}
            className={`list-item ${selectedCase?._id === c._id ? "selected" : ""}`}
            onClick={() => { setSelectedCase(c); setSelectedEvidence(null); }}
          >
            <strong>{c.title}</strong>{" "}
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              — created by {c.createdBy?.name} ({c.createdBy?.role})
            </span>
          </div>
        ))}
      </div>

      {selectedCase && (
        <div className="panel">
          <h2>Evidence in {selectedCase.title}</h2>
          {evidenceItems.map((item) => (
            <div
              key={item._id}
              className={`list-item ${selectedEvidence?._id === item._id ? "selected" : ""}`}
              onClick={() => setSelectedEvidence(item)}
            >
              <strong>{item.label}</strong>{" "}
              <span className={`badge ${
                item.currentStatus === "verified" ? "pass"
                : item.currentStatus === "mismatch" ? "fail"
                : "neutral"
              }`}>
                {item.currentStatus}
              </span>
            </div>
          ))}
        </div>
      )}

      {selectedEvidence && (
        <div className="panel">
          <h2>{selectedEvidence.label}</h2>

          <div style={{ marginBottom: 16 }}>
            <strong style={{ fontSize: 13 }}>Files</strong>
            <div style={{ marginTop: 8 }}>
              <EvidenceFileList evidenceId={selectedEvidence._id} files={evidenceDetail?.version?.files} />
            </div>
          </div>

          <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <strong style={{ fontSize: 13 }}>Audit Trail</strong>
            <div style={{ marginTop: 8 }}>
              <AuditTrailTable evidenceId={selectedEvidence._id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
