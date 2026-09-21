import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  }

  function fillDemo(role) {
    const map = {
      field_officer: "field@demo.com",
      investigator: "investigator@demo.com",
      officer_head: "head@demo.com"
    };
    setEmail(map[role]);
    setPassword("Passw0rd!");
  }

  return (
    <div className="app-shell" style={{ maxWidth: 400, paddingTop: 80 }}>
      <div className="panel">
        <h2>Sign in</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: 16, fontSize: 12, color: "var(--muted)" }}>
          Demo accounts (password: <code>Passw0rd!</code>) — run <code>npm run seed</code> in the
          backend first, then click to autofill:
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          <button className="secondary" onClick={() => fillDemo("field_officer")}>Field Officer</button>
          <button className="secondary" onClick={() => fillDemo("investigator")}>Investigator</button>
          <button className="secondary" onClick={() => fillDemo("officer_head")}>Officer Head</button>
        </div>
      </div>
    </div>
  );
}
