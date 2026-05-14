import { useEffect, useMemo, useState } from "react";
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

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const [form, setForm] = useState<AssetForm>({
    name: "",
    device_type: "",
    serial_number: "",
    asset_tag: "",
    purchase_date: "",
    is_assigned: false,
  });


  const buttonStyle: React.CSSProperties = {
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  };

  const inputStyle: React.CSSProperties = {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  };

  
  const fetchAssets = async () => {
    const res = await authFetch(`${API_BASE}/assets/`);
    const data = await res.json();
    setAssets(data);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  
  const filteredAssets = useMemo(() => {
    const q = search.toLowerCase();
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.device_type.toLowerCase().includes(q) ||
        a.serial_number.toLowerCase().includes(q) ||
        a.asset_tag.toLowerCase().includes(q)
    );
  }, [assets, search]);

  
  const handleAddAsset = async () => {
    if (!form.name || !form.device_type) {
      alert("Fill all fields");
      return;
    }

    const res = await authFetch(
      editingAsset
        ? `${API_BASE}/assets/${editingAsset.id}/`
        : `${API_BASE}/assets/`,
      {
        method: editingAsset ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    if (!res.ok) {
      alert("Error saving asset");
      return;
    }

    setForm({
      name: "",
      device_type: "",
      serial_number: "",
      asset_tag: "",
      purchase_date: "",
      is_assigned: false,
    });

    setEditingAsset(null);
    setShowForm(false);
    fetchAssets();
  };


  const handleDelete = async (id: number) => {
    if (!confirm("Delete this asset?")) return;

    await authFetch(`${API_BASE}/assets/${id}/`, {
      method: "DELETE",
    });

    fetchAssets();
  };


  const handleUploadAssets = async () => {
    if (!file) {
      alert("Select file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await authFetch(`${API_BASE}/import-assets/`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      alert(`Imported ${data.created} assets`);
      fetchAssets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1>Assets</h1>

      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={inputStyle}
      />

      
      <div style={{ marginTop: "10px" }}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button onClick={handleUploadAssets} style={buttonStyle}>
          Upload Excel
        </button>
      </div>

      
      <button
        onClick={() => setShowForm(!showForm)}
        style={{ ...buttonStyle, marginTop: "10px" }}
      >
        {showForm ? "Close" : "+ Add Asset"}
      </button>

      {showForm && (
        <div>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
          <input
            placeholder="Type"
            value={form.device_type}
            onChange={(e) =>
              setForm({ ...form, device_type: e.target.value })
            }
          />
          <button onClick={handleAddAsset}>Save</button>
        </div>
      )}

    
      <ul>
        {filteredAssets.map((a) => (
          <li key={a.id}>
            {a.name} - {a.device_type}
            <button onClick={() => handleDelete(a.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}