import React, { useState } from "react";
import client from "../api/client";

/**
 * DEMO-ONLY control. Clearly labeled so nobody mistakes this for a real
 * feature - it deliberately mutates stored evidence so you can show the
 * Verify Integrity check failing live for judges.
 */
export default function TamperDemoButton({ evidenceId }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleTamper() {
    setLoading(true);
    setMessage("");
    try {
      const { data } = await client.post(`/evidence/${evidenceId}/tamper-demo`);
      setMessage(data.message);
    } catch (err) {
      setMessage(err?.response?.data?.error || "Demo tamper failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 10 }}>
      <button className="danger" onClick={handleTamper} disabled={loading}>
        {loading ? "Applying..." : "⚠ Demo: Simulate Tampering"}
      </button>
      {message && <div style={{ fontSize: 13, marginTop: 6, color: "var(--muted)" }}>{message}</div>}
    </div>
  );
}
