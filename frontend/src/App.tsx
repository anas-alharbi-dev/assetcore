import { useEffect, useState } from "react";

type Asset = {
  id: number;
  name: string;
  device_type: string;
  serial_number: string;
  asset_tag: string;
  is_assigned: boolean;
};

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/assets/", {
      headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc2MDY2NDE2LCJpYXQiOjE3NzYwNjYxMTYsImp0aSI6IjJmYjBhOWU3M2M4ODQxOTNhZjA0NzljM2JiZjc0ZGNjIiwidXNlcl9pZCI6IjEifQ.YOy3afguG66Gy0QNZdDS77XAIqw99ryfyl-N5QIfq98",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch assets");
        }
        return res.json();
      })
      .then((data) => {
        setAssets(data);
        console.log("Assets:", data);
      })
      .catch((err: Error) => {
        console.error("Error:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <aside
        style={{
          width: "250px",
          background: "#111827",
          color: "white",
          padding: "20px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>AssetCore</h2>
        <p style={{ color: "#9CA3AF" }}>IT Department</p>

        <nav
          style={{
            marginTop: "30px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <span>Dashboard</span>
          <span>Assets</span>
          <span>Employees</span>
          <span>Assignments</span>
          <span>Reports</span>
        </nav>
      </aside>

      <main
        style={{
          flex: 1,
          background: "#F3F4F6",
          padding: "30px",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Dashboard</h1>
        <p>Welcome, Anas 👋</p>

        <div
          style={{
            marginTop: "24px",
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Assets</h2>

          {loading && <p>Loading assets...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                  <th style={{ padding: "12px" }}>Name</th>
                  <th style={{ padding: "12px" }}>Type</th>
                  <th style={{ padding: "12px" }}>Serial Number</th>
                  <th style={{ padding: "12px" }}>Asset Tag</th>
                  <th style={{ padding: "12px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px" }}>{asset.name}</td>
                    <td style={{ padding: "12px" }}>{asset.device_type}</td>
                    <td style={{ padding: "12px" }}>{asset.serial_number}</td>
                    <td style={{ padding: "12px" }}>{asset.asset_tag}</td>
                    <td style={{ padding: "12px" }}>
                      {asset.is_assigned ? "Assigned" : "Available"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;