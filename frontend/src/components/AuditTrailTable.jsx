import React, { useEffect, useState } from "react";
import client from "../api/client";

export default function AuditTrailTable({ evidenceId }) {
  const [events, setEvents] = useState([]);
  const [chainValid, setChainValid] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!evidenceId) return;
    setLoading(true);
    try {
      const { data } = await client.get(`/evidence/${evidenceId}/audit-trail`);
      setEvents(data.events);
      setChainValid(data.chainValid);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [evidenceId]);

  if (!evidenceId) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <strong style={{ fontSize: 13 }}>Audit Trail</strong>
        <button className="secondary" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {chainValid !== null && (
        <div style={{ marginBottom: 8 }}>
          <span className={`badge ${chainValid ? "pass" : "fail"}`}>
            {chainValid ? "AUDIT CHAIN INTACT" : "AUDIT CHAIN BROKEN"}
          </span>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Action</th>
            <th>Actor</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => (
            <tr key={ev._id}>
              <td>{new Date(ev.timestamp).toLocaleTimeString()}</td>
              <td>{ev.action}</td>
              <td>{ev.actor?.name || "—"} <span style={{ color: "var(--muted)" }}>({ev.actor?.role})</span></td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr><td colSpan={3} style={{ color: "var(--muted)" }}>No events yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
