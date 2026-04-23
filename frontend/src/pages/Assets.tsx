import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { authFetch } from "../lib/auth";

type Asset = {
  id: number;
  name: string;
  device_type: string;
  serial_number: string;
  asset_tag: string;
  purchase_date?: string | null;
  is_assigned: boolean;
};

type AssetForm = {
  name: string;
  device_type: string;
  serial_number: string;
  asset_tag: string;
  purchase_date: string;
  is_assigned: boolean;
};

const API_BASE = "http://127.0.0.1:8000/api";

function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const [showForm, setShowForm] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [form, setForm] = useState<AssetForm>({
    name: "",
    device_type: "",
    serial_number: "",
    asset_tag: "",
    purchase_date: "",
    is_assigned: false,
  });

  const fetchAssets = () => {
    setLoading(true);
    setError("");

    authFetch(`${API_BASE}/assets/`)
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

  useEffect(() => {
    fetchAssets();
  }, []);

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

const handleEdit = (asset: Asset) => {
  setForm({
    name: asset.name,
    device_type: asset.device_type,
    serial_number: asset.serial_number,
    asset_tag: asset.asset_tag,
    purchase_date: asset .purchase_date || "",
    is_assigned: asset.is_assigned,
  });

  setEditingAsset(asset);
  setShowForm(true);
};

const handleDelete = async (id: number) => {
  if (!confirm("Are you sure you want to delete this asset?")) return;

  try {
    const res = await authFetch(`${API_BASE}/assets/${id}/`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete asset");
    }

    fetchAssets();
  } catch (err) {
    alert("Error deleting asset");
  }
};

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

      const res = await authFetch(
  editingAsset
    ? `${API_BASE}/assets/${editingAsset.id}/`
    : `${API_BASE}/assets/`,
  {
    method: editingAsset ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: form.name,
      device_type: form.device_type,
      serial_number: form.serial_number,
      asset_tag: form.asset_tag,
      purchase_date: form.purchase_date || null,
      is_assigned: form.is_assigned,
    }),
  }
);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to add asset");
      }

      setForm({
  name: "",
  device_type: "",
  serial_number: "",
  asset_tag: "",
  purchase_date: "",
  is_assigned: false,
});

setShowForm(false);
setEditingAsset(null);
fetchAssets();

    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "38px",
            color: "#ffffff",
          }}
        >
          Assets
        </h1>
        <p
          style={{
            marginTop: "8px",
            color: "#94a3b8",
            fontSize: "16px",
          }}
        >
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
          <h2
            style={{
              margin: 0,
              color: "#111827",
            }}
          >
            Assets List
          </h2>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button onClick={() => setShowForm(!showForm)} style={buttonStyle}>
              {showForm ? "Close Form" : "+ Add Asset"}
            </button>

            <input
              placeholder="Search by name, type, serial, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                ...inputStyle,
                minWidth: "280px",
              }}
            />
          </div>
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
            <h3
              style={{
                marginTop: 0,
                color: "#111827",
              }}
            >
              Add New Asset
            </h3>

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
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                style={inputStyle}
              />

              <select
                value={form.device_type}
                onChange={(e) =>
                  setForm({ ...form, device_type: e.target.value })
                }
                style={inputStyle}
              >
                <option value="">Select Type</option>
                <option value="laptop">Laptop</option>
                <option value="desktop">Desktop</option>
                <option value="monitor">Monitor</option>
                <option value="printer">Printer</option>
                <option value="phone">Phone</option>
                <option value="tablet">Tablet</option>
                <option value="other">Other</option>
              </select>

              <input
                placeholder="Serial Number"
                value={form.serial_number}
                onChange={(e) =>
                  setForm({ ...form, serial_number: e.target.value })
                }
                style={inputStyle}
              />

              <input
                placeholder="Asset Tag"
                value={form.asset_tag}
                onChange={(e) =>
                  setForm({ ...form, asset_tag: e.target.value })
                }
                style={inputStyle}
              />

              <input
                type="date"
                value={form.purchase_date}
                onChange={(e) =>
                  setForm({ ...form, purchase_date: e.target.value })
                }
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

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={handleAddAsset}
                disabled={submitting}
                style={buttonStyle}
              >
                {submitting ? "Adding..." : "Save Asset"}
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
          <p style={{ color: "#6b7280" }}>Loading assets...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filteredAssets.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No assets found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Serial Number</th>
                  <th style={thStyle}>Asset Tag</th>
                  <th style={thStyle}>Purchase Date</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={tdStyle}>{asset.name}</td>
                    <td style={tdStyle}>{asset.device_type}</td>
                    <td style={tdStyle}>{asset.serial_number}</td>
                    <td style={tdStyle}>{asset.asset_tag}</td>
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
                  <td>
                <button onClick={() => handleEdit(asset)}>Edit</button>
                <button onClick={() => handleDelete(asset.id)}>Delete</button>
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
export default Assets;