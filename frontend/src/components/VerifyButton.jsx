import React, { useState } from "react";
import client from "../api/client";

export default function VerifyButton({ evidenceId, onVerified }) {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState("");

  async function handleVerify() {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.post(`/evidence/${evidenceId}/verify`);
      setLastResult(data.result);
      onVerified?.(data);
    } catch (err) {
      setError(err?.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying against H0..." : "Verify Integrity"}
      </button>
      {lastResult && (
        <span style={{ marginLeft: 10 }}>
          <span className={`badge ${lastResult === "pass" ? "pass" : "fail"}`}>
            {lastResult === "pass" ? "PASS" : "MISMATCH"}
          </span>
        </span>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
