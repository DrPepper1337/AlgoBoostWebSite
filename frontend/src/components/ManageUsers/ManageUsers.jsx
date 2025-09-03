import "./ManageUsers.css";
import HeaderNavBar from "../HeaderNavBar/Header";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

export default function ManageUsers() {
    const [admins, setAdmins] = useState([]);
    const [members, setMembers] = useState([]);
    const [whitelist, setWhitelist] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editingType, setEditingType] = useState(null);
    const [editData, setEditData] = useState({});

    const startEditing = (id, type, EntryData) => {
        setEditingId(id);
        setEditingType(type);
        setEditData({
            name: EntryData.name || '',
            role: EntryData.role || 'member'
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingType(null);
        setEditData({});
    };

    const saveEdit = async (id, type) => {
        if (!['admin', 'member'].includes(editData.role.toLowerCase())) {
            alert('Role must be either "admin" or "member"');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const originalData = type === "user" ? ([...admins, ...members].find(u => u.id === id)) : ([...whitelist].find(u => u.id === id));
            if (!originalData) {
                alert('Entry not found');
                return;
            }

            const updates = [];

            if (editData.name.trim() !== originalData.name) {
                updates.push({
                    property: 'name',
                    value: editData.name.trim()
                });
            }

            if (editData.role.toLowerCase() !== originalData.role) {
                updates.push({
                    property: 'role',
                    value: editData.role.toLowerCase()
                });
            }

            if (updates.length === 0) {
                alert('No changes detected');
                setEditingId(null);
                setEdititngType(null);
                setEditData({});
                return;
            }

            for (const update of updates) {
                const endpoint = type === "user" ? 'http://localhost:8080/api/admin/edit-user' : 'http://localhost:8080/api/admin/edit-whitelist'
                const response = await axios.post(endpoint, {
                    id: id,
                    property: update.property,
                    value: update.value
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.data.success) {
                    throw new Error(`Failed to update ${update.property}`);
                }
            }

            alert('User updated successfully');
            setEditingId(null);
            setEditingType(null);
            setEditData({});
            fetchAllData();
        } catch (error) {
            console.error('Failed to edit:', error);
            alert('Failed to edit: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id, userName, type) => {
        if (!window.confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const endpoint = type === "user" ? 'http://localhost:8080/api/admin/delete-user' : 'http://localhost:8080/api/admin/delete-email-from-whitelist'

            const response = await axios.post(endpoint, {
                id: id
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                alert('Entry deleted successfully');
                fetchAllData();
            }
        } catch (error) {
            console.error('Failed to delete Entry:', error);
            alert('Failed to delete Entry: ' + (error.response?.data?.message || error.message));
        }
    };

    const fetchAllData = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const [adminsRes, membersRes, whitelistRes] = await Promise.all([
                axios.get('http://localhost:8080/api/admin/admins', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get('http://localhost:8080/api/admin/members', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get('http://localhost:8080/api/admin/whitelist', {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);

            setAdmins(Array.isArray(adminsRes.data?.data) ? adminsRes.data.data : []);
            setMembers(Array.isArray(membersRes.data?.data) ? membersRes.data.data : []);
            setWhitelist(Array.isArray(whitelistRes.data?.data) ? whitelistRes.data.data : []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    return (
        <div className="manage-users-wrapper">
            <HeaderNavBar />
            <h4>Manage Admins ({admins.length})</h4>
            <div className="admin-list">
                {admins.length === 0 ? (
                    <p>No admins found</p>
                ) : (
                    admins.map((a) => (
                        <div key={a.id} className="admin-card user-card">
                            <div className="user-info">
                                <p><strong>Name:</strong>
                                    {editingId === a.id && editingType === "user" ? (
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="edit-input"
                                        />
                                    ) : (
                                        a.name || 'N/A'
                                    )}
                                </p>
                                <p><strong>Email:</strong> {a.email}</p>
                                <p><strong>Role:</strong>
                                    {editingId === a.id && editingType === "user" ? (
                                        <select
                                            value={editData.role}
                                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                            className="edit-select"
                                        >
                                            <option value="admin">admin</option>
                                            <option value="member">member</option>
                                        </select>
                                    ) : (
                                        a.role
                                    )}
                                </p>
                            </div>
                            <div className="user-actions">
                                {editingId === a.id && editingType === "user" ? (
                                    <>
                                        <button
                                            className="save-btn"
                                            onClick={() => saveEdit(a.id, "user")}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={cancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="edit-btn"
                                            onClick={() => startEditing(a.id, "user", { name: a.name, role: a.role })}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(a.id, a.name, "user")}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <h4>Manage Members ({members.length})</h4>
            <div className="member-list">
                {members.length === 0 ? (
                    <p>No members found</p>
                ) : (
                    members.map((m) => (
                        <div key={m.id} className="member-card user-card">
                            <div className="user-info">
                                <p><strong>Name:</strong>
                                    {editingId === m.id && editingType === "user" ? (
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="edit-input"
                                        />
                                    ) : (
                                        m.name || 'N/A'
                                    )}
                                </p>
                                <p><strong>Email:</strong> {m.email}</p>
                                <p><strong>Role:</strong>
                                    {editingId === m.id && editingType === "user" ? (
                                        <select
                                            value={editData.role}
                                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                            className="edit-select"
                                        >
                                            <option value="admin">admin</option>
                                            <option value="member">member</option>
                                        </select>
                                    ) : (
                                        m.role
                                    )}
                                </p>
                            </div>
                            <div className="user-actions">
                                {editingId === m.id && editingType === "user" ? (
                                    <>
                                        <button
                                            className="save-btn"
                                            onClick={() => saveEdit(m.id, "user")}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={cancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="edit-btn"
                                            onClick={() => startEditing(m.id, "user", { name: m.name, role: m.role })}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(m.id, m.name,"user")}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <h4>Manage Whitelist ({whitelist.length})</h4>
            <div className="white-list">
                {whitelist.length === 0 ? (
                    <p>No whitelist entries found</p>
                ) : (
                    whitelist.map((w) => (
                        <div key={w.id} className="whitelist-card user-card">
                            <div className="user-info">
                                <p><strong>Name:</strong>
                                    {editingId === w.id && editingType === "whitelist" ? (
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="edit-input"
                                        />
                                    ) : (
                                        w.name || 'N/A'
                                    )}
                                </p>
                                <p><strong>Email:</strong> {w.email}</p>
                                <p><strong>Role:</strong>
                                    {editingId === w.id && editingType === "whitelist" ? (
                                        <select
                                            value={editData.role}
                                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                            className="edit-select"
                                        >
                                            <option value="admin">admin</option>
                                            <option value="member">member</option>
                                        </select>
                                    ) : (
                                        w.role
                                    )}
                                </p>
                            </div>
                            <div className="user-actions">
                                {editingId === w.id && editingType === "whitelist" ? (
                                    <>
                                        <button
                                            className="save-btn"
                                            onClick={() => saveEdit(w.id, "whitelist")}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={cancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="edit-btn"
                                            onClick={() => startEditing(w.id, "whitelist", { name: w.name, role: w.role })}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(w.id, w.email, "whitelist")}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
