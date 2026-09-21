import React, { useEffect, useState } from "react";
import client from "../api/client";
import CaseForm from "../components/CaseForm";
import EvidenceUpload from "../components/EvidenceUpload";

export default function FieldCollectionView() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [evidenceItems, setEvidenceItems] = useState([]);

  async function loadCases() {
    const { data } = await client.get("/cases");
    setCases(data);
  }

  async function loadEvidence(caseId) {
    const { data } = await client.get(`/cases/${caseId}/evidence`);
    setEvidenceItems(data);
  }

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCase) loadEvidence(selectedCase._id);
  }, [selectedCase]);

  return (
    <div>
      <div className="panel">
        <h2>Create a Case</h2>
        <CaseForm
          onCreated={(newCase) => {
            setCases((prev) => [newCase, ...prev]);
            setSelectedCase(newCase);
          }}
        />
      </div>

      <div className="panel">
        <h2>Cases</h2>
        {cases.length === 0 && <div style={{ color: "var(--muted)" }}>No cases yet.</div>}
        {cases.map((c) => (
          <div
            key={c._id}
            className={`list-item ${selectedCase?._id === c._id ? "selected" : ""}`}
            onClick={() => setSelectedCase(c)}
          >
            <strong>{c.title}</strong>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{c.description}</div>
          </div>
        ))}
      </div>

      {selectedCase && (
        <div className="panel">
          <h2>Acquire Evidence — {selectedCase.title}</h2>
          <EvidenceUpload
            caseId={selectedCase._id}
            onAcquired={() => loadEvidence(selectedCase._id)}
          />

          <div style={{ marginTop: 16 }}>
            <strong style={{ fontSize: 13 }}>Evidence in this case</strong>
            {evidenceItems.length === 0 && (
              <div style={{ color: "var(--muted)", marginTop: 6 }}>No evidence acquired yet.</div>
            )}
            {evidenceItems.map((item) => (
              <div key={item._id} className="list-item">
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
        </div>
      )}
    </div>
  );
}
