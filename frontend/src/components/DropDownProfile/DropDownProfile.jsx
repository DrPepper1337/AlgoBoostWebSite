import React from 'react';
import './DropDownProfile.css';
import { useNavigate } from 'react-router-dom';
import {FaCog, FaUser, FaBookmark, FaSignOutAlt} from 'react-icons/fa';

function DropDownItem({ icon: Icon, text, onClick }) {
    return (
        <li className = 'dropdownItem' onClick={onClick}>
            <Icon className="icon" />
            <span>{text}</span>
        </li>
    );

}

const DropDownProfile = ({isActive}) => {

    const navigate = useNavigate();

      const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  }

    return (
           <div className={`dropdown-menu ${isActive ? 'active' : 'inactive'}`}>
                <h3>Name<br/>Surname</h3>
                <ul>
                    <DropDownItem icon={FaUser} text={"My Profile"} />
                    <DropDownItem icon={FaBookmark} text={"Saved Topics"}/>
                    <DropDownItem icon={FaCog} text={"Settings"} />
                    <DropDownItem icon={FaSignOutAlt} text="Logout" onClick={handleLogout} />
                </ul>
        </div>
    )

}
export default DropDownProfile;