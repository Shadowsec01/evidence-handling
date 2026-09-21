import React, { useState } from "react";
import client from "../api/client";

export default function EvidenceUpload({ caseId, onAcquired }) {
  const [label, setLabel] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!label.trim()) return setError("Label is required");
    if (files.length === 0) return setError("Select at least one file");

    const formData = new FormData();
    formData.append("label", label);
    Array.from(files).forEach((f) => formData.append("files", f));

    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await client.post(`/cases/${caseId}/evidence`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(data);
      setLabel("");
      setFiles([]);
      onAcquired?.(data);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to acquire evidence");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        placeholder="Evidence label (e.g. CCTV Footage, Suspect Phone Export)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        style={{ marginBottom: 10 }}
      />
      <div>
        <button type="submit" disabled={loading}>
          {loading ? "Hashing & establishing baseline..." : "Acquire Evidence"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
          <div><span className="badge pass">H0 ESTABLISHED</span></div>
          <div style={{ marginTop: 6 }}>Baseline hash:</div>
          <div className="hash">{result.baseline.baselineHash}</div>
        </div>
      )}
    </form>
  );
}
