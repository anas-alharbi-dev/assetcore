import { useEffect, useState } from "react";
import { authFetch } from "../lib/auth";

const API_BASE = "http://127.0.0.1:8000/api";

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
  status: string;
};

type Employee = {
  id: number;
  name: string;
  employee_id: string;
};

type Assignment = {
  asset_name: string;
  asset_tag: string;
  employee_name: string;
  employee_id: string;
  assigned_at: string;
  returned_at: string | null;
  status: string;
};

export default function Reports() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [assetStatus, setAssetStatus] = useState("");
  const [assetType, setAssetType] = useState("");

  // ================= FETCH =================
  useEffect(() => {
   Promise.all([
  authFetch(`${API_BASE}/reports/summary/`).then(r => r.json()),
  authFetch(`${API_BASE}/assets/`).then(r => r.json()),
  authFetch(`${API_BASE}/employees/`).then(r => r.json()),
  authFetch(`${API_BASE}/assignments/`).then(r => r.json()),
])
      .then(([summary, assets, employees, assignments]) => {
        setSummary(summary);
        setAssets(assets);
        setEmployees(employees);
        setAssignments(assignments);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  // ================= DOWNLOAD =================
 const handleDownloadExcel = () => {
  const params = new URLSearchParams();

  if (assetStatus) params.append("status", assetStatus);
  if (assetType) params.append("type", assetType);

 authFetch(`${API_BASE}/reports/export-excel/?${params.toString()}`)
  .then((res) => {
    if (!res.ok) throw new Error("Download failed");
    return res.blob(); // ✅ هنا نحول إلى ملف
  })
  .then((blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assets_report.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
  })
  .catch((err) => console.error("Download error:", err));
 };
  // ================= FILTER =================
  const filteredAssets = assets.filter(a => {
    if (assetStatus && a.status !== assetStatus) return false;
    if (assetType && a.device_type !== assetType) return false;
    return true;
  });

  // ================= UI =================
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Reports</h1>

      {/* SUMMARY */}
      {summary && (
        <div style={{ display: "flex", gap: "10px" }}>
          <Card title="Assets" value={summary.total_assets} />
          <Card title="Employees" value={summary.total_employees} />
          <Card title="Assignments" value={summary.total_assignments} />
        </div>
      )}

      {/* FILTER + DOWNLOAD */}
      <div style={{ marginTop: "20px" }}>
        <select onChange={(e) => setAssetStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
        </select>

        <select onChange={(e) => setAssetType(e.target.value)}>
          <option value="">All Types</option>
          <option value="laptop">Laptop</option>
          <option value="printer">Printer</option>
        </select>

        <button onClick={handleDownloadExcel}>Download Excel</button>
      </div>

      {/* ASSETS */}
      <h2>Assets</h2>
      <table border={1}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Serial</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredAssets.map(a => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.device_type}</td>
              <td>{a.serial_number}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* EMPLOYEES */}
      <h2>Employees</h2>
      <table border={1}>
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(e => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>{e.employee_id}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ASSIGNMENTS */}
      <h2>Assignments</h2>
      <table border={1}>
        <thead>
          <tr>
            <th>Asset</th>
            <th>Employee</th>
            <th>Assigned</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a, i) => (
            <tr key={i}>
              <td>{a.asset_name}</td>
              <td>{a.employee_name}</td>
              <td>{a.assigned_at}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ================= CARD =================
function Card({ title, value }: { title: string; value: number }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "10px" }}>
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
  );
}

