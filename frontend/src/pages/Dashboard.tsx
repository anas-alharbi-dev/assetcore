import { useEffect, useState } from "react";
import { authFetch } from "../lib/auth";
type Asset = {
  id: number;
  name: string;
  device_type: string;
  serial_number: string;
  asset_tag: string;
  purchase_date: string | null;
  is_assigned: boolean;
};

type Summary = {
  total_assets: number;
  assigned_assets: number;
  available_assets: number;
  total_employees: number; 
};

const API_BASE = "http://127.0.0.1:8000/api";

function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  Promise.all([
    authFetch(`${API_BASE}/assets/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch assets");
        }
        return res.json();
      })
      .then((data: Asset[]) => setAssets(data)),

    authFetch(`${API_BASE}/reports/summary/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch summary");
        }
        return res.json();
      })
      .then((data: Summary) => setSummary(data)),
  ])
    .catch((err: Error) => setError(err.message))
    .finally(() => setLoading(false));
}, []);
  
  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "48px",
            color: "#ffffff",
            letterSpacing: "-1px",
          }}
        >
          Dashboard
        </h1>
        <p style={{ marginTop: "8px", color: "#94a3b8", fontSize: "16px" }}>
          Welcome, Anas 👋
        </p>
      </div>

      {loading && <p style={{ color: "#cbd5e1" }}>Loading dashboard...</p>}
      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      {!loading && !error && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
              gap: "18px",
              marginBottom: "24px",
            }}
          >
            <StatCard title="Total Assets" value={summary?.total_assets ?? 0} />
            <StatCard title="Assigned Assets" value={summary?.assigned_assets ?? 0} />
            <StatCard title="Available Assets" value={summary?.available_assets ?? 0} />
            <StatCard title="Employees" value={summary?.total_employees ?? 0} />
          
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "18px",
                alignItems: "center",
              }}
            >
              <h2 style={{ margin: 0, color: "#111827" }}>Recent Assets</h2>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>
                Live from API
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Serial Number</th>
                    <th style={thStyle}>Asset Tag</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.slice(0, 5).map((asset) => (
                    <tr key={asset.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={tdStyle}>{asset.name}</td>
                      <td style={tdStyle}>{asset.device_type}</td>
                      <td style={tdStyle}>{asset.serial_number}</td>
                      <td style={tdStyle}>{asset.asset_tag}</td>
                      <td style={tdStyle}>
                        <StatusBadge isAssigned={asset.is_assigned} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.95)",
        borderRadius: "18px",
        padding: "24px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>{title}</p>
      <h3
        style={{
          margin: "12px 0 0",
          color: "#111827",
          fontSize: "36px",
          letterSpacing: "-1px",
        }}
      >
        {value}
      </h3>
    </div>
  );
}

function StatusBadge({ isAssigned }: { isAssigned: boolean }) {
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 700,
        background: isAssigned ? "#FEE2E2" : "#DCFCE7",
        color: isAssigned ? "#B91C1C" : "#166534",
      }}
    >
      {isAssigned ? "Assigned" : "Available"}
    </span>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 12px",
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: 700,
};

const tdStyle: React.CSSProperties = {
  padding: "14px 12px",
  color: "#111827",
  fontSize: "14px",
};

export default Dashboard;