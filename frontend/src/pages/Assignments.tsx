function Assignments() {
  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: 0, fontSize: "38px", color: "#ffffff" }}>
          Assignments
        </h1>
        <p style={{ marginTop: "8px", color: "#94a3b8", fontSize: "16px" }}>
          Track which assets are assigned to which employees
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
        <h2 style={{ marginTop: 0, color: "#111827" }}>Assignments Page</h2>
        <p style={{ color: "#6b7280" }}>
          Next step: connect Assignments API and show assignment history here.
        </p>
      </div>
    </div>
  );
}

export default Assignments;