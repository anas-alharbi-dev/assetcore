import { useEffect, useState, type CSSProperties } from "react";
import { authFetch } from "../lib/auth";

type Asset = {
  id: number;
  name: string;
  asset_tag: string;
  is_assigned: boolean;
};

type Employee = {
  id: number;
  full_name: string;
  employee_id: string;
};

type Assignment = {
  id: number;
  asset: number;
  employee: number;
  assigned_at: string;
  returned_at: string | null;
  notes: string;
};

const API_BASE = "http://127.0.0.1:8000/api";

function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);

  const [form, setForm] = useState({
    asset: "",
    employee: "",
    assigned_at: "",
    notes: "",
  });

  const fetchAssignments = async () => {
    const res = await authFetch(`${API_BASE}/assignments/`);
    if (!res.ok) throw new Error("Failed to fetch assignments");
    return res.json();
  };

  const fetchAssets = async () => {
    const res = await authFetch(`${API_BASE}/assets/`);
    if (!res.ok) throw new Error("Failed to fetch assets");
    return res.json();
  };

  const fetchEmployees = async () => {
    const res = await authFetch(`${API_BASE}/employees/`);
    if (!res.ok) throw new Error("Failed to fetch employees");
    return res.json();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [assignmentsData, assetsData, employeesData] = await Promise.all([
        fetchAssignments(),
        fetchAssets(),
        fetchEmployees(),
      ]);

      setAssignments(assignmentsData);
      setAssets(assetsData);
      setEmployees(employeesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

     const handleEdit = (assignment: any) => {
      setEditingAssignment(assignment);

  setForm({
    asset: assignment.asset,
    employee: assignment.employee,
    assigned_at: assignment.assigned_at,
    notes: assignment.notes || "",
  });

  setShowForm(true);
};
const handleDelete = async (id: number) => {
  if (!confirm("Are you sure you want to delete this assignment?")) return;

  try {
    const res = await authFetch(`${API_BASE}/assignments/${id}/`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete assignment");
    }

    await loadData();
  } catch (err) {
    alert("Error deleting assignment");
  }
};
  
   const handleReturn = async (id: number) => {
  try {
    const res = await authFetch(`${API_BASE}/assignments/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        returned_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to return asset");
    }

    await loadData();
  } catch (err) {
    alert(err instanceof Error ? err.message : "Unexpected error");
  }
};
  const handleAddAssignment = async () => {
    if (!form.asset || !form.employee || !form.assigned_at) {
      alert("Please fill required fields.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await authFetch(`${API_BASE}/assignments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asset: Number(form.asset),
          employee: Number(form.employee),
          assigned_at: form.assigned_at,
          notes: form.notes,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to add assignment");
      }

      setForm({
        asset: "",
        employee: "",
        assigned_at: "",
        notes: "",
      });

      setShowForm(false);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  const getAssetName = (assetId: number) => {
    const asset = assets.find((a) => a.id === assetId);
    return asset ? `${asset.name} (${asset.asset_tag})` : assetId;
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee ? `${employee.full_name} (${employee.employee_id})`: employeeId;
  };

  const availableAssets = assets.filter((asset) => !asset.is_assigned);

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: 0, fontSize: "38px", color: "#ffffff" }}>
          Assignments
        </h1>
        <p style={{ marginTop: "8px", color: "#94a3b8", fontSize: "16px" }}>
          Manage asset assignments to employees
        </p>
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
            alignItems: "center",
            marginBottom: "20px",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ margin: 0, color: "#111827" }}>Assignments List</h2>

          <button onClick={() => setShowForm(!showForm)} style={buttonStyle}>
            {showForm ? "Close Form" : "+ Add Assignment"}
          </button>
        </div>

        {showForm && (
          <div
            style={{
              marginBottom: "24px",
              padding: "20px",
              background: "#f8fafc",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#111827" }}>Add New Assignment</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
                marginBottom: "14px",
              }}
            >
              <select
                value={form.asset}
                onChange={(e) => setForm({ ...form, asset: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Asset</option>
                {availableAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.asset_tag})
                  </option>
                ))}
              </select>

              <select
                value={form.employee}
                onChange={(e) => setForm({ ...form, employee: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name} ({employee.employee_id})
                  </option>
                ))}
              </select>

              <input
                type="datetime-local"
                value={form.assigned_at}
                onChange={(e) => setForm({ ...form, assigned_at: e.target.value })}
                style={inputStyle}
              />

              <input
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={handleAddAssignment}
                disabled={submitting}
                style={buttonStyle}
              >
                {submitting ? "Saving..." : "Save Assignment"}
              </button>

              <button
                onClick={() => setShowForm(false)}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ color: "#6b7280" }}>Loading assignments...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : assignments.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No assignments found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                  <th style={thStyle}>Asset</th>
                  <th style={thStyle}>Employee</th>
                  <th style={thStyle}>Assigned At</th>
                  <th style={thStyle}>Returned At</th>
                  <th style={thStyle}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                <tr key={assignment.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={tdStyle}>{getAssetName(assignment.asset)}</td>
                <td style={tdStyle}>{getEmployeeName(assignment.employee)}</td>
                <td style={tdStyle}>{assignment.assigned_at || "-"}</td>
                <td style={tdStyle}>{assignment.returned_at || "-"}</td>
                <td style={tdStyle}>{assignment.notes || "-"}</td>
                <td style={tdStyle}>
  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
    {!assignment.returned_at && (
      <button onClick={() => handleReturn(assignment.id)}>Return</button>
    )}

    <button onClick={() => handleDelete(assignment.id)}>Delete</button>

    <button onClick={() => handleEdit(assignment)}>Edit</button>
  </div>
</td>
</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const buttonStyle: CSSProperties = {
  background: "#0f172a",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  padding: "12px 18px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
};

const secondaryButtonStyle: CSSProperties = {
  background: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: "10px",
  padding: "12px 18px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
};

const inputStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  outline: "none",
  background: "#ffffff",
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "14px 12px",
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: 700,
};

const tdStyle: CSSProperties = {
  padding: "14px 12px",
  color: "#111827",
  fontSize: "14px",
};

export default Assignments;