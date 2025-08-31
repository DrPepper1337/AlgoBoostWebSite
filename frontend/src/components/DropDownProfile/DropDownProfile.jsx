import React, { useEffect, useState } from 'react';
import './DropDownProfile.css';
import { useNavigate } from 'react-router-dom';
import { FaCog, FaUser, FaSignOutAlt } from 'react-icons/fa';
import DropDownItem from './DropDownItem';

const DropDownProfile = ({ isActive }) => {
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShouldRender(true);         
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);             
      const timeoutId = setTimeout(() => setShouldRender(false), 120); 
      return () => clearTimeout(timeoutId);
    }
  }, [isActive]);

  if (!shouldRender) return null;

  return (
    <div className={`dropdown-menu ${visible ? 'active' : 'inactive'}`}>
      <ul>
        <DropDownItem icon={FaUser} text="My Profile" onClick={() => navigate('/userProfile')}/>
        <DropDownItem icon={FaCog} text="Settings" />
      </ul>
    </div>
  );
};

export default DropDownProfile;