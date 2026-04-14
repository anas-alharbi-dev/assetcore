function Employees() {
  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: 0, fontSize: "38px", color: "#ffffff" }}>
          Employees
        </h1>
        <p style={{ marginTop: "8px", color: "#94a3b8", fontSize: "16px" }}>
          Employee management module is ready for backend integration
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
        <h2 style={{ marginTop: 0, color: "#111827" }}>Employees Page</h2>
        <p style={{ color: "#6b7280" }}>
          Next step: connect Employees API and show employee records here.
        </p>
      </div>
    </div>
  );
}

export default Employees;