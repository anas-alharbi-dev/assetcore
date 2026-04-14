import { useEffect, useMemo, useState, type CSSProperties } from "react";

type Asset = {
    id: number;
    name: string;
    device_type: string;
    serial_number: string;
    asset_tag: string;
    is_assigned: boolean;
};

type AssetForm = {
    name: string;
    device_type: string;
    serial_number: string;
    asset_tag: string;
    is_assigned: boolean;
};

const API_BASE = "http://127.0.0.1:8000/api";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc2MTc0ODkxLCJpYXQiOjE3NzYxNzQ1OTEsImp0aSI6IjI3ZmYyZmNhYTM5YTQyZTQ4OTU5ZjI3YzhkOGUyZGU3IiwidXNlcl9pZCI6IjEifQ.SsETBMPc_gsh6nz5c1Y2E941XUQ7Q8NYScsa69z1wa0";

function Assets() {
const [assets, setAssets] = useState<Asset[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [search, setSearch] = useState("");

const [showForm, setShowForm] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [form, setForm] = useState<AssetForm>({
    name: "",
    device_type: "",
    serial_number: "",
    asset_tag: "",
    is_assigned: false,
});

    useEffect(() => {
    fetchAssets();
    }, []);

    const fetchAssets = () => {
    setLoading(true);
    setError("");

fetch(`${API_BASE}/assets/`, {
    headers: {
    Authorization: `Bearer ${TOKEN}`,
    },
})
.then((res: Response) => {
    if (!res.ok) {
        throw new Error("Failed to fetch assets");
    }
    return res.json();
    })
    .then((data: Asset[]) => {
    setAssets(data);
    })
    .catch((err: Error) => {
    setError(err.message);
    })
    .finally(() => {
    setLoading(false);
    });
};


    const filteredAssets = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return assets;

    return assets.filter((asset) =>
    asset.name.toLowerCase().includes(q) ||
    asset.device_type.toLowerCase().includes(q) ||
    asset.serial_number.toLowerCase().includes(q) ||
    asset.asset_tag.toLowerCase().includes(q)
    );
    }, [assets, search]);

    const handleAddAsset = async () => {
    if (
    !form.name.trim() ||
    !form.device_type.trim() ||
    !form.serial_number.trim() ||
    !form.asset_tag.trim()
    ) {
    alert("Please fill all fields.");
    return;
    }

    try {
    setSubmitting(true);

    const res = await fetch(`${API_BASE}/assets/`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(form),
    });

    if (!res.ok) {
        throw new Error("Failed to add asset");
    }

    setForm({
        name: "",
        device_type: "",
        serial_number: "",
        asset_tag: "",
        is_assigned: false,
    });
    setShowForm(false);
    fetchAssets();
    } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    alert(message);
    } finally {
    setSubmitting(false);
    }
};

return (
    <div>
    <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: 0, fontSize: "38px", color: "#ffffff" }}>Assets</h1>
        <p style={{ marginTop: "8px", color: "#94a3b8", fontSize: "16px" }}>
        Manage and monitor all registered IT assets
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
        <h2 style={{ margin: 0, color: "#111827" }}>Assets List</h2>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
        onClick={() => setShowForm((prev) => !prev)}
        style={{
                background: "#111827",
                color: "white",
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
            }}
            >
            {showForm ? "Close Form" : "+ Add Asset"}
            </button>

            <input
            type="text"
            placeholder="Search by name, type, serial, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
                width: "320px",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                outline: "none",
                fontSize: "14px",
            }}
            />
        </div>
        </div>

        {showForm && (
        <div
            style={{
            marginBottom: "22px",
            padding: "18px",
            borderRadius: "14px",
            background: "#F8FAFC",
            border: "1px solid #E5E7EB",
            }}
        >
            <h3 style={{ marginTop: 0, color: "#111827" }}>Add New Asset</h3>

            <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
                marginBottom: "14px",
            }}
            >
            <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
            />
            <input
                placeholder="Device Type"
                value={form.device_type}
                onChange={(e) => setForm({ ...form, device_type: e.target.value })}
                style={inputStyle}
            />
            <input
                placeholder="Serial Number"
                value={form.serial_number}
                onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Asset Tag"
                value={form.asset_tag}
                onChange={(e) => setForm({ ...form, asset_tag: e.target.value })}
                style={inputStyle}
              />
            </div>

            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "14px",
                color: "#374151",
                fontSize: "14px",
              }}
            >
              <input
                type="checkbox"
                checked={form.is_assigned}
                onChange={(e) =>
                  setForm({ ...form, is_assigned: e.target.checked })
                }
              />
              Assigned
            </label>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleAddAsset}
                disabled={submitting}
                style={{
                  background: "#111827",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                {submitting ? "Adding..." : "Save Asset"}
              </button>

              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: "#E5E7EB",
                  color: "#111827",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading && (
          <p style={{ color: "#6B7280", margin: 0 }}>Loading assets...</p>
        )}

        {error && (
          <p style={{ color: "#DC2626", margin: 0 }}>{error}</p>
        )}

        {!loading && !error && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Serial Number</th>
                  <th style={thStyle}>Asset Tag</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={tdStyle}>{asset.name}</td>
                    <td style={tdStyle}>{asset.device_type}</td>
                    <td style={tdStyle}>{asset.serial_number}</td>
                    <td style={tdStyle}>{asset.asset_tag}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: asset.is_assigned ? "#FEE2E2" : "#DCFCE7",
                          color: asset.is_assigned ? "#B91C1C" : "#166534",
                        }}
                      >
                        {asset.is_assigned ? "Assigned" : "Available"}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredAssets.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "24px",
                        textAlign: "center",
                        color: "#6B7280",
                      }}
                    >
                      No assets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #D1D5DB",
  fontSize: "14px",
  outline: "none",
};

 const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "14px 12px",
  color: "#6B7280",
  fontSize: "14px",
  fontWeight: 700,
};

const tdStyle: CSSProperties = {
  padding: "14px 12px",
  color: "#111827",
  fontSize: "14px",
};

export default Assets;