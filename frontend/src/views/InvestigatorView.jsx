import React, { useEffect, useState } from "react";
import client from "../api/client";
import VerifyButton from "../components/VerifyButton";
import TamperDemoButton from "../components/TamperDemoButton";
import AuditTrailTable from "../components/AuditTrailTable";
import EvidenceFileList from "../components/EvidenceFileList";

export default function InvestigatorView() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [detail, setDetail] = useState(null);

  async function loadCases() {
    const { data } = await client.get("/cases");
    setCases(data);
  }

  async function loadEvidence(caseId) {
    const { data } = await client.get(`/cases/${caseId}/evidence`);
    setEvidenceItems(data);
  }

  async function loadDetail(evidenceId) {
    const { data } = await client.get(`/evidence/${evidenceId}`);
    setDetail(data);
  }

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCase) loadEvidence(selectedCase._id);
  }, [selectedCase]);

  useEffect(() => {
    if (selectedEvidence) loadDetail(selectedEvidence._id);
  }, [selectedEvidence]);

  function refreshEvidence() {
    if (selectedCase) loadEvidence(selectedCase._id);
    if (selectedEvidence) loadDetail(selectedEvidence._id);
  }

  return (
    <div>
      <div className="panel">
        <h2>Select a Case</h2>
        {cases.length === 0 && <div style={{ color: "var(--muted)" }}>No cases yet — ask a Field Officer to create one.</div>}
        {cases.map((c) => (
          <div
            key={c._id}
            className={`list-item ${selectedCase?._id === c._id ? "selected" : ""}`}
            onClick={() => { setSelectedCase(c); setSelectedEvidence(null); setDetail(null); }}
          >
            <strong>{c.title}</strong>
          </div>
        ))}
      </div>

      {selectedCase && (
        <div className="panel">
          <h2>Evidence in {selectedCase.title}</h2>
          {evidenceItems.length === 0 && <div style={{ color: "var(--muted)" }}>No evidence yet.</div>}
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

      {selectedEvidence && detail && (
        <div className="panel">
          <h2>{selectedEvidence.label}</h2>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Locked baseline (H0):</div>
            <div className="hash">{detail.baseline?.baselineHash}</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <strong style={{ fontSize: 13 }}>Files</strong>
            <div style={{ marginTop: 8 }}>
              <EvidenceFileList evidenceId={selectedEvidence._id} files={detail.version?.files} />
            </div>
          </div>

          <VerifyButton evidenceId={selectedEvidence._id} onVerified={refreshEvidence} />
          <TamperDemoButton evidenceId={selectedEvidence._id} />

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <strong style={{ fontSize: 13 }}>Previous checks</strong>
            <table style={{ marginTop: 8 }}>
              <thead>
                <tr><th>Time</th><th>Type</th><th>Result</th></tr>
              </thead>
              <tbody>
                {(detail.checks || []).map((chk) => (
                  <tr key={chk._id}>
                    <td>{new Date(chk.checkedAt).toLocaleTimeString()}</td>
                    <td>{chk.checkpointType}</td>
                    <td><span className={`badge ${chk.result === "pass" ? "pass" : "fail"}`}>{chk.result}</span></td>
                  </tr>
                ))}
                {(!detail.checks || detail.checks.length === 0) && (
                  <tr><td colSpan={3} style={{ color: "var(--muted)" }}>No checks yet</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <AuditTrailTable evidenceId={selectedEvidence._id} />
          </div>
        </div>
      )}
    </div>
  );
}
