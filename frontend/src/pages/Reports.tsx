import { useEffect, useState } from "react";
import { authFetch } from "../lib/auth";

type Summary = {
  total_assets: number;
  assigned_assets: number;
  available_assets: number;
  total_employees: number;
  total_assignments: number;
};

type Asset = {
  id: number;
  name: string;
  device_type: string;
  serial_number: string;
  asset_tag: string;
  purchase_date: string | null;
  is_assigned: boolean;
};

const API_BASE = "http://127.0.0.1:8000/api";

function Reports() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assetStatus, setAssetStatus] = useState("");
const [assetType, setAssetType] = useState("");

 const handleDownloadExcel = () => {
  const params = new URLSearchParams();

  if (assetStatus) params.append("status", assetStatus);
  if (assetType) params.append("type", assetType);

  authFetch(`${API_BASE}/reports/export-excel/?${params.toString()}`)
    .then((res) => res.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "assets_report.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
};

  useEffect(() => {
    Promise.all([
      authFetch(`${API_BASE}/reports/summary/`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch reports");
          }
          return res.json();
        })
        .then((data: Summary) => setSummary(data)),

      authFetch(`${API_BASE}/assets/`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch assets");
          }
          return res.json();
        })
        .then((data: Asset[]) => setAssets(data)),
    ])
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: "32px", marginBottom: "20px", color: "#ffffff" }}>
        Reports
      </h1>

      {loading && <p style={{ color: "#cbd5e1" }}>Loading reports...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          <StatCard title="Total Assets" value={summary.total_assets} />
          <StatCard title="Assigned Assets" value={summary.assigned_assets} />
          <StatCard title="Available Assets" value={summary.available_assets} />
          <StatCard title="Employees" value={summary.total_employees} />
          <StatCard title="Assignments" value={summary.total_assignments} />
        </div>
      )}

      {!loading && !error && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "20px",
            marginTop: "24px",
          }}
        >
         <div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px"
}}>
  <h2 style={{ margin: 0 }}>Assets Report</h2>

  <button
    onClick={handleDownloadExcel}
    style={{
      background: "#2563eb",
      color: "#fff",
      border: "none",
      padding: "10px 16px",
      borderRadius: "8px",
      cursor: "pointer",
    }}
  >
    Download Excel
  </button>
</div>
<div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
  <select value={assetStatus} onChange={(e) => setAssetStatus(e.target.value)}>
    <option value="">All Status</option>
    <option value="available">Available</option>
    <option value="assigned">Assigned</option>
  </select>

  <select value={assetType} onChange={(e) => setAssetType(e.target.value)}>
    <option value="">All Types</option>
    <option value="laptop">Laptop</option>
    <option value="printer">Printer</option>
  </select>
</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Serial Number</th>
                  <th style={thStyle}>Asset Tag</th>
                  <th style={thStyle}>Purchase Date</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td style={tdStyle}>{asset.name}</td>
                    <td style={tdStyle}>{asset.device_type}</td>
                    <td style={tdStyle}>{asset.serial_number}</td>
                    <td style={tdStyle}>{asset.asset_tag}</td>
                    <td style={tdStyle}>{asset.purchase_date || "-"}</td>
                    <td style={tdStyle}>
                      {asset.is_assigned ? "Assigned" : "Available"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <p style={{ color: "#666" }}>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

const thStyle = {
  textAlign: "left" as const,
  padding: "12px",
  borderBottom: "1px solid #e5e7eb",
  color: "#6b7280",
  fontSize: "14px",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #f1f5f9",
  color: "#111827",
  fontSize: "14px",
};

export default Reports;