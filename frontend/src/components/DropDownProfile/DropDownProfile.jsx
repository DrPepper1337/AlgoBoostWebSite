import React from 'react';
import './DropDownProfile.css';
import {FaCog, FaUser, FaBookmark, FaSignOutAlt} from 'react-icons/fa';

function DropDownItem({ icon: Icon, text }) {
    return (
        <li className = 'dropdownItem'>
            <Icon className="icon" />
            <span>{text}</span>
        </li>
    );

}

const DropDownProfile = () => {

    return (
          <div className="dropdown-menu">
                <h3>Name<br/>Surname</h3>
                <ul>
                    <DropDownItem icon={FaUser} text={"My Profile"} />
                    <DropDownItem icon={FaBookmark} text={"Saved Topics"}/>
                    <DropDownItem icon={FaCog} text={"Settings"} />
                    <DropDownItem icon={FaSignOutAlt} text="Logout" />
                </ul>
        </div>
    )

}
export default DropDownProfile;