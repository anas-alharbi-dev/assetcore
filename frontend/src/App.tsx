import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/assets/", {
      headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc1OTk5OTc3LCJpYXQiOjE3NzU5OTk2NzcsImp0aSI6ImQwYTA3M2Q3ODI3NzQ3MjlhYWM3OTMyNTBmZmRjNzQwIiwidXNlcl9pZCI6IjEifQ.9s4_BL_OsXw6MpdgiOLYrMD99TP9foctEq257-57GMs",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Assets:", data);
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "250px",
          background: "#111827",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>AssetCore</h2>
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
        <h1>Dashboard</h1>
        <p>Welcome, Anas 👋</p>
      </main>
    </div>
  );
}

export default App;