import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

type LayoutProps = {
  onLogout: () => void;
};

function Layout({ onLogout }: LayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
      }}
    >
      <Sidebar onLogout={onLogout} />

      <main
        style={{
          padding: "32px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #111827 40%, #1e293b 100%)",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;