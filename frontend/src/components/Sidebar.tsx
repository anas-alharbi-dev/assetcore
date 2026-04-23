import { NavLink } from "react-router-dom";

type SidebarProps = {
  onLogout: () => void;
};

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: "block",
  padding: "12px 14px",
  borderRadius: "10px",
  color: isActive ? "#ffffff" : "#cbd5e1",
  textDecoration: "none",
  background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
  fontWeight: isActive ? 700 : 500,
  marginBottom: "8px",
  transition: "all 0.2s ease",
});

function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside
      style={{
        padding: "28px 18px",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "32px",
            fontWeight: 800,
            letterSpacing: "-1px",
          }}
        >
          AssetCore
        </h1>

        <p
          style={{
            margin: "8px 0 0",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          IT Department
        </p>
      </div>

      <nav>
        <NavLink to="/dashboard" style={linkStyle}>
          Dashboard
        </NavLink>

        <NavLink to="/assets" style={linkStyle}>
          Assets
        </NavLink>

        <NavLink to="/employees" style={linkStyle}>
          Employees
        </NavLink>

        <NavLink to="/assignments" style={linkStyle}>
          Assignments
        </NavLink>

        <NavLink to="/reports" style={linkStyle}>
          Reports
        </NavLink>
      </nav>

      <div style={{ marginTop: "auto" }}>
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            background: "#ef4444",
            color: "#ffffff",
            border: "none",
            padding: "12px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 600,
            marginTop: "20px",
            fontSize: "14px",
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;