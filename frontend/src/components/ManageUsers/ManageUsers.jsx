import "./ManageUsers.css";
import HeaderNavBar from "../HeaderNavBar/Header";
import { useState, useEffect } from "react";
import axios from 'axios';


export default function ManageUsers() {
    const [admins, setAdmins] = useState([]);
    const [members, setMembers] = useState([]);
    const [whitelist, setWhitelist] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) return;
                const res = await axios.get('http://localhost:8080/api/get-admins', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const AdminsData = Array.isArray(res.data?.data) ? res.data.data : [];
                setAdmins(AdminsData)
            } catch (error) {
                console.error('Failed to fetch admins:', err);
            }
        })
    })

    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) return;
                const res = await axios.get('http://localhost:8080/api/get-members', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const MembersData = Array.isArray(res.data?.data) ? res.data.data : [];
                setMembers(MembersData)
            } catch (error) {
                console.error('Failed to fetch members:', err);
            }
        })
    })

    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) return;
                const res = await axios.get('http://localhost:8080/api/get-whitelist', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const MembersData = Array.isArray(res.data?.data) ? res.data.data : [];
                setWhitelist(MembersData)
            } catch (error) {
                console.error('Failed to fetch whitelist:', err);
            }
        })
    })

    return (
        <div className="manage-users-wrapper">
            <HeaderNavBar />
            <h1>Manage Admins</h1>
            <div className="admin-list">
                {/* {admins.map((a) => (

                ))} */}
            </div>
            <h1>Manage Members</h1>
            <div className="member-list">
            </div>
            <h1>Manage Whitelist</h1>
            <div className="white-list">
            </div>
        </div>
    )
}
