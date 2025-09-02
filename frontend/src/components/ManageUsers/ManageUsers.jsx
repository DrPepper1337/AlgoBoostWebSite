import "./ManageUsers.css";
import HeaderNavBar from "../HeaderNavBar/Header";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

export default function ManageUsers() {
    const [admins, setAdmins] = useState([]);
    const [members, setMembers] = useState([]);
    const [whitelist, setWhitelist] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editingWhitelist, setEditingWhitelist] = useState(null);
    const [editData, setEditData] = useState({});

    const startEditingUser = (userId, userData) => {
        setEditingUser(userId);
        setEditData({
            name: userData.name || '',
            role: userData.role || 'member'
        });
    };

    const cancelEditUser = () => {
        setEditingUser(null);
        setEditData({});
    };

    const saveEditUser = async (userId) => {
        if (!['admin', 'member'].includes(editData.role.toLowerCase())) {
            alert('Role must be either "admin" or "member"');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;


            const prop = editData.name.trim() ? 'name' : 'role';
            const value = editData.name.trim() ? editData.name.trim() : editData.role.toLowerCase();

            const response = await axios.post('http://localhost:8080/api/admin/edit-user', {
                user_id: userId,
                property: prop,
                value: value
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                alert('User updated successfully');
                setEditingUser(null);
                setEditData({});
                fetchAllData();
            }
        } catch (error) {
            console.error('Failed to edit user:', error);
            alert('Failed to edit user: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await axios.post('http://localhost:8080/api/admin/delete-user', {
                user_id: userId
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                alert('User deleted successfully');
                fetchAllData();
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteFromWhitelist = async (email) => {
        if (!window.confirm(`Are you sure you want to remove "${email}" from whitelist?`)) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await axios.post('http://localhost:8080/api/admin/delete-email-from-whitelist', {
                email: email
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                alert('Email removed from whitelist successfully');
                fetchAllData();
            }
        } catch (error) {
            console.error('Failed to remove email from whitelist:', error);
            alert('Failed to remove email: ' + (error.response?.data?.message || error.message));
        }
    };

    const startEditingWhitelist = (whitelistId, whitelistData) => {
        setEditingWhitelist(whitelistId);
        setEditData({
            name: whitelistData.name || '',
            role: whitelistData.role || 'member'
        });
    };

    const cancelEditWhitelist = () => {
        setEditingWhitelist(null);
        setEditData({});
    };

    const saveEditWhitelist = async (whitelistId) => {
        if (!['admin', 'member'].includes(editData.role.toLowerCase())) {
            alert('Role must be either "admin" or "member"');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await axios.post('http://localhost:8080/api/admin/edit-whitelist', {
                id: whitelistId,
                name: editData.name.trim(),
                role: editData.role.toLowerCase()
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                alert('Whitelist entry updated successfully');
                setEditingWhitelist(null);
                setEditData({});
                fetchAllData();
            }
        } catch (error) {
            console.error('Failed to edit whitelist entry:', error);
            alert('Failed to edit whitelist entry: ' + (error.response?.data?.message || error.message));
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
            <h3>Manage Admins ({admins.length})</h3>
            <div className="admin-list">
                {admins.length === 0 ? (
                    <p>No admins found</p>
                ) : (
                    admins.map((a) => (
                        <div key={a.id} className="admin-card user-card">
                            <div className="user-info">
                                <p><strong>Name:</strong>
                                    {editingUser === a.id ? (
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({...editData, name: e.target.value})}
                                            className="edit-input"
                                        />
                                    ) : (
                                        a.name || 'N/A'
                                    )}
                                </p>
                                <p><strong>Email:</strong> {a.email}</p>
                                <p><strong>Role:</strong>
                                    {editingUser === a.id ? (
                                        <select
                                            value={editData.role}
                                            onChange={(e) => setEditData({...editData, role: e.target.value})}
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
                                {editingUser === a.id ? (
                                    <>
                                        <button
                                            className="save-btn"
                                            onClick={() => saveEditUser(a.id)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={cancelEditUser}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="edit-btn"
                                            onClick={() => startEditingUser(a.id, { name: a.name, role: a.role })}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteUser(a.id, a.name)}
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
            <h3>Manage Members ({members.length})</h3>
            <div className="member-list">
                {members.length === 0 ? (
                    <p>No members found</p>
                ) : (
                    members.map((m) => (
                        <div key={m.id} className="member-card user-card">
                            <div className="user-info">
                                <p><strong>Name:</strong>
                                    {editingUser === m.id ? (
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({...editData, name: e.target.value})}
                                            className="edit-input"
                                        />
                                    ) : (
                                        m.name || 'N/A'
                                    )}
                                </p>
                                <p><strong>Email:</strong> {m.email}</p>
                                <p><strong>Role:</strong>
                                    {editingUser === m.id ? (
                                        <select
                                            value={editData.role}
                                            onChange={(e) => setEditData({...editData, role: e.target.value})}
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
                                {editingUser === m.id ? (
                                    <>
                                        <button
                                            className="save-btn"
                                            onClick={() => saveEditUser(m.id)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={cancelEditUser}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="edit-btn"
                                            onClick={() => startEditingUser(m.id, { name: m.name, role: m.role })}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteUser(m.id, m.name)}
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
            <h3>Manage Whitelist ({whitelist.length})</h3>
            <div className="white-list">
                {whitelist.length === 0 ? (
                    <p>No whitelist entries found</p>
                ) : (
                    whitelist.map((w) => (
                        <div key={w.id} className="whitelist-card user-card">
                            <div className="user-info">
                                <p><strong>Name:</strong>
                                    {editingWhitelist === w.id ? (
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({...editData, name: e.target.value})}
                                            className="edit-input"
                                        />
                                    ) : (
                                        w.name || 'N/A'
                                    )}
                                </p>
                                <p><strong>Email:</strong> {w.email}</p>
                                <p><strong>Role:</strong>
                                    {editingWhitelist === w.id ? (
                                        <select
                                            value={editData.role}
                                            onChange={(e) => setEditData({...editData, role: e.target.value})}
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
                                {editingWhitelist === w.id ? (
                                    <>
                                        <button
                                            className="save-btn"
                                            onClick={() => saveEditWhitelist(w.id)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={cancelEditWhitelist}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="edit-btn"
                                            onClick={() => startEditingWhitelist(w.id, { name: w.name, role: w.role })}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteFromWhitelist(w.email)}
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
