import { useEffect, useState, type CSSProperties } from "react";
import { authFetch } from "../lib/auth";

type Employee = {
  id: number;
  full_name: string;
  employee_id: string;
  email: string;
  department: number;
};

const API_BASE = "http://127.0.0.1:8000/api";

function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");

  const fetchEmployees = () => {
    setLoading(true);
    setError("");

    authFetch(`${API_BASE}/employees/`)
      .then((res: Response) => {
        if (!res.ok) {
          throw new Error("Failed to fetch employees");
        }
        return res.json();
      })
      .then((data: Employee[]) => {
        setEmployees(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEdit = (employee: Employee) => {
  setFullName(employee.full_name);
  setEmployeeId(employee.employee_id);
  setEmail(employee.email);
  setDepartment(String(employee.department));
  setEditingEmployee(employee);
  setShowForm(true);
};

const handleDelete = async (id: number) => {
  if (!confirm("Are you sure you want to delete this employee?")) return;

  try {
    const res = await authFetch(`${API_BASE}/employees/${id}/`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete employee");
    }

    fetchEmployees();
  } catch (err) {
    alert("Error deleting employee");
  }
};

  const handleAddEmployee = async () => {
    if (
      !fullName.trim() ||
      !employeeId.trim() ||
      !email.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await authFetch(
  editingEmployee
    ? `${API_BASE}/employees/${editingEmployee.id}/`
    : `${API_BASE}/employees/`,
  {
    method: editingEmployee ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      full_name: fullName,
      employee_id: employeeId,
      email,
      department: Number(department) || 1,
    }),
  }
);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to add employee");
      }

      setFullName("");
setEmployeeId("");
setEmail("");
setDepartment("");
setShowForm(false);
setEditingEmployee(null);

fetchEmployees();


    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: 0, fontSize: "38px", color: "#ffffff" }}>
          Employees
        </h1>
        <p style={{ marginTop: "8px", color: "#94a3b8", fontSize: "16px" }}>
          Manage employee records and IT ownership details
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
          <h2 style={{ margin: 0, color: "#111827" }}>Employees List</h2>

          <button onClick={() => setShowForm(!showForm)} style={buttonStyle}>
            {showForm ? "Close Form" : "+ Add Employee"}
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
            <h3 style={{ marginTop: 0, marginBottom: "16px", color: "#111827" }}>
              Add New Employee
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <input
                style={inputStyle}
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <input
                style={inputStyle}
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />

              <input
                style={inputStyle}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                style={inputStyle}
                placeholder="Department ID"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={handleAddEmployee}
                disabled={submitting}
                style={buttonStyle}
              >
                {submitting
                ? "Saving..."
                : editingEmployee
                ? "Update Employee"
                : "Save Employee"}
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
          <p style={{ color: "#6b7280" }}>Loading employees...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : employees.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No employees found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={thStyle}>Full Name</th>
                  <th style={thStyle}>Employee ID</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}>{emp.full_name}</td>
                    <td style={tdStyle}>{emp.employee_id}</td>
                    <td style={tdStyle}>{emp.email}</td>
                    <td style={tdStyle}>{emp.department}</td>
                  <td style={tdStyle}> </td>
                    <button onClick={() => handleEdit(emp)}>Edit</button>
                    <button onClick={() => handleDelete(emp.id)}>Delete</button>

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

export default Employees;