import './SettingsPage.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl } from "../../config/api";

export default function SettingsPage() {
    const [username, setUsername] = useState('');
    const [saveMessage, setSaveMessage] = useState("");
    
    // Password change state
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordError, setPasswordError] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsed = JSON.parse(userData);
            setUsername(parsed.name || '');
        }
    }, []);

    
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setSaveMessage("Not authenticated");
        return;
      }

      const response = await axios.put(buildApiUrl("/user/details"), {
        name: username,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Update localStorage with new values
        const userData = JSON.parse(localStorage.getItem("userData"));
        userData.name = username;
        localStorage.setItem("userData", JSON.stringify(userData));

        setSaveMessage("Details saved!");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error saving details:", error);
      setSaveMessage("Failed to save details");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const togglePasswordFields = (e) => {
    e.preventDefault();
    setShowPasswordFields(!showPasswordFields);
    setCurrentPassword('');
    setNewPassword('');
    setPasswordMessage('');
    setPasswordError(false);
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordMessage("Both fields are required");
      setPasswordError(true);
      setTimeout(() => setPasswordMessage(""), 3000);
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      return; // Silently fail - user shouldn't see this
    }

    try {
      const response = await fetch(buildApiUrl("/user/password"), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === "current password is incorrect") {
          setPasswordMessage("Current password is incorrect");
          setPasswordError(true);
          setTimeout(() => setPasswordMessage(""), 3000);
        }
        return;
      }

      setPasswordMessage("Password changed successfully!");
      setPasswordError(false);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => {
        setPasswordMessage("");
        setShowPasswordFields(false);
      }, 3000);

    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

    return (
        <div className="settings-wrapper">
            <div className="settings-container">
                <div className="settings-section">
                    <h4>Account Details</h4>
                    
                    <div className="settings-row">
                        <div className="settings-field">
                            <label>Username</label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>


                        <div className="save-btn-wrapper">
                            <button className="settings-btn save" onClick={handleSave}>
                                Save
                            </button>
                            {saveMessage && <p className="settings-message">{saveMessage}</p>}
                        </div>
                    </div>

                    <div className="change-password-link">
                        <a href="#" onClick={togglePasswordFields}>
                            {showPasswordFields ? 'Cancel' : 'Change Password'}
                        </a>
                    </div>

                    {showPasswordFields && (
                        <div className="password-change-section">
                            <div className="settings-field">
                                <label>Current Password</label>
                                <input 
                                    type="password" 
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="settings-field">
                                <label>New Password</label>
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="save-btn-wrapper">
                                <button className="settings-btn save" onClick={handlePasswordChange}>
                                    Save
                                </button>
                                {passwordMessage && (
                                    <p className={`settings-message ${passwordError ? 'error' : 'success'}`}>
                                        {passwordMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}