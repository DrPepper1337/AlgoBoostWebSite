import "./ManageUsers.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { buildApiUrl } from "../../config/api";

const TABS = ["Admins", "Members", "Whitelist"];

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState("Admins");
  const [admins, setAdmins] = useState([]);
  const [members, setMembers] = useState([]);
  const [whitelist, setWhitelist] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [editData, setEditData] = useState({});

  const [addData, setAddData] = useState({ name: "", email: "", role: "member" });
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  const startEditing = (id, type, data) => {
    setEditingId(id);
    setEditingType(type);
    setEditData({ name: data.name || "", role: data.role || "member" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingType(null);
    setEditData({});
  };

  const saveEdit = async (id, type) => {
    if (!["admin", "member"].includes(editData.role.toLowerCase())) {
      alert('Role must be "admin" or "member"');
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const original =
        type === "user"
          ? [...admins, ...members].find((u) => u.id === id)
          : whitelist.find((w) => w.id === id);
      if (!original) return;

      const updates = [];
      if (editData.name.trim() !== original.name)
        updates.push({ property: "name", value: editData.name.trim() });
      if (editData.role.toLowerCase() !== original.role)
        updates.push({ property: "role", value: editData.role.toLowerCase() });

      if (updates.length === 0) { cancelEdit(); return; }

      const endpoint =
        type === "user"
          ? buildApiUrl("admin/edit-user")
          : buildApiUrl("admin/edit-whitelist");

      for (const u of updates) {
        await axios.post(endpoint, { id, property: u.property, value: u.value }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      cancelEdit();
      fetchAllData();
    } catch (err) {
      alert("Failed to save: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id, label, type) => {
    if (!window.confirm(`Delete "${label}"?`)) return;
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const endpoint =
        type === "user"
          ? buildApiUrl("admin/delete-user")
          : buildApiUrl("admin/delete-email-from-whitelist");
      await axios.post(endpoint, { id }, { headers: { Authorization: `Bearer ${token}` } });
      fetchAllData();
    } catch (err) {
      alert("Failed to delete: " + (err.response?.data?.message || err.message));
    }
  };

  const addEmailToWhitelist = async () => {
    setAddError("");
    setAddSuccess("");
    if (!addData.email || !addData.name || !addData.role) {
      setAddError("All fields are required.");
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      await axios.post(
        buildApiUrl("admin/add-email-to-whitelist"),
        { email: addData.email, name: addData.name, role: addData.role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddSuccess("Added to whitelist!");
      setAddData({ name: "", email: "", role: "member" });
      fetchAllData();
    } catch (err) {
      setAddError(err.response?.data?.message || err.message);
    }
  };

  const fetchAllData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const [a, m, w] = await Promise.all([
        axios.get(buildApiUrl("admin/admins"), { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(buildApiUrl("admin/members"), { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(buildApiUrl("admin/whitelist"), { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setAdmins(Array.isArray(a.data?.data) ? a.data.data : []);
      setMembers(Array.isArray(m.data?.data) ? m.data.data : []);
      setWhitelist(Array.isArray(w.data?.data) ? w.data.data : []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const counts = { Admins: admins.length, Members: members.length, Whitelist: whitelist.length };

  const rows =
    activeTab === "Admins" ? admins :
    activeTab === "Members" ? members :
    whitelist;

  const rowType = activeTab === "Whitelist" ? "whitelist" : "user";

  return (
    <div className="mu-page">
      <div className="mu-header">
        <h1 className="mu-title">Manage Users</h1>
        <p className="mu-subtitle">Control team access and roles</p>
      </div>

      <div className="mu-body">
        <div className="mu-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`mu-tab${activeTab === tab ? " mu-tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className="mu-tab-count">{counts[tab]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mu-loading"><div className="mu-spinner" /></div>
        ) : (
          <>
            <div className="mu-list">
              {rows.length === 0 ? (
                <p className="mu-empty">No entries found.</p>
              ) : (
                rows.map((entry) => {
                  const isEditing = editingId === entry.id && editingType === rowType;
                  return (
                    <div key={entry.id} className="mu-row">
                      <div className="mu-row-avatar">
                        {(entry.name || entry.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="mu-row-info">
                        {isEditing ? (
                          <input
                            className="mu-input"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            placeholder="Name"
                          />
                        ) : (
                          <span className="mu-row-name">{entry.name || "—"}</span>
                        )}
                        <span className="mu-row-email">{entry.email}</span>
                      </div>
                      <div className="mu-row-role">
                        {isEditing ? (
                          <select
                            className="mu-select"
                            value={editData.role}
                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                          >
                            <option value="admin">admin</option>
                            <option value="member">member</option>
                          </select>
                        ) : (
                          <span className={`mu-badge mu-badge--${entry.role}`}>{entry.role}</span>
                        )}
                      </div>
                      <div className="mu-row-actions">
                        {isEditing ? (
                          <>
                            <button className="mu-btn mu-btn--save" onClick={() => saveEdit(entry.id, rowType)}>Save</button>
                            <button className="mu-btn mu-btn--cancel" onClick={cancelEdit}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button
                              className="mu-btn mu-btn--edit"
                              onClick={() => startEditing(entry.id, rowType, { name: entry.name, role: entry.role })}
                            >Edit</button>
                            <button
                              className="mu-btn mu-btn--delete"
                              onClick={() => handleDelete(entry.id, entry.name || entry.email, rowType)}
                            >Delete</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {activeTab === "Whitelist" && (
              <div className="mu-add-card">
                <h3 className="mu-add-title">Add to Whitelist</h3>
                <div className="mu-add-form">
                  <input className="mu-input" placeholder="Name" value={addData.name}
                    onChange={(e) => setAddData({ ...addData, name: e.target.value })} />
                  <input className="mu-input" placeholder="Email" type="email" value={addData.email}
                    onChange={(e) => setAddData({ ...addData, email: e.target.value })} />
                  <select className="mu-select" value={addData.role}
                    onChange={(e) => setAddData({ ...addData, role: e.target.value })}>
                    <option value="admin">admin</option>
                    <option value="member">member</option>
                  </select>
                  <button className="mu-btn mu-btn--primary" onClick={addEmailToWhitelist}>Add</button>
                </div>
                {addError && <p className="mu-error">{addError}</p>}
                {addSuccess && <p className="mu-success">{addSuccess}</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
