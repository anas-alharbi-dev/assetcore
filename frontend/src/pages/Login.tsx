import { useState } from "react";
import { saveTokens } from "../lib/auth";

const API_BASE = "http://127.0.0.1:8000/api";

type LoginProps = {
  onLoginSuccess: () => void;
};

function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Invalid username or password.");
      }

      saveTokens(data.access, data.refresh);
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #111827 40%, #1e293b 100%)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: "8px",
            fontSize: "32px",
            color: "#111827",
          }}
        >
          AssetCore
        </h1>

        <p
          style={{
            marginTop: 0,
            marginBottom: "24px",
            color: "#6b7280",
            fontSize: "15px",
          }}
        >
          Sign in to access the IT Asset Management System
        </p>

        <div style={{ display: "grid", gap: "14px" }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
            }}
          />

          {error && (
            <p style={{ margin: 0, color: "#b91c1c", fontSize: "14px" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              background: "#0f172a",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              padding: "14px 16px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;