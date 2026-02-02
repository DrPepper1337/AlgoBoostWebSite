import './SettingsPage.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl } from "../../config/api";

export default function SettingsPage() {
    const [username, setUsername] = useState('');
    const [saveMessage, setSaveMessage] = useState("");

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsed = JSON.parse(userData);
            setUsername(parsed.name || '');
        }
    }, []);

    
  const handleSave = async () => {
    try {
      const response = await axios.put(buildApiUrl("/user/details"), {
        name: username,
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

                        {/* <div className="settings-field">
                            <label>Email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div> */}

                        <button className="settings-btn save" onClick={handleSave}>
                            Save
                        </button>
                           {saveMessage && <p className="settings-message">{saveMessage}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}