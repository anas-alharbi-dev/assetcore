import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Employees from "./pages/Employees";
import Assignments from "./pages/Assignments";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="assets" element={<Assets />} />
          <Route path="employees" element={<Employees />} />
          <Route path="assignments" element={<Assignments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;