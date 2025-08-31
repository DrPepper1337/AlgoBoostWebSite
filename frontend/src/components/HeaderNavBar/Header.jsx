import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaChevronRight } from 'react-icons/fa';
import './Header.css';
import '../MemberHub/MemberHub.css';
import DropDownProfile from '../DropDownProfile/DropDownProfile';


export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown if clicking outside the user-menu div
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
   

  const handleLinkClick = () => {
    setMenuOpen(false); // Close menu when a link is clicked
  };

  // The entire <header> JSX is moved here from Home.jsx
  return (
    <header className="site-header">
      <div className="logo-container">
        <img src="/logo-no-text.svg" alt="AlgoBoost Logo" className="logo" />
      </div>

      <button className="menu-toggle" onClick={() => setMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
        <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}></div>
      </button>

      <div className={`nav-container ${isMenuOpen ? 'open' : ''}`}>
        <nav className="navbar">
          <a className="navbarLink" href="/#about" onClick={handleLinkClick}>About us</a>
          <a className="navbarLink" href="/#offer" onClick={handleLinkClick}>What we offer</a>
          <a className="navbarLink" href="/#events" onClick={handleLinkClick}>Events</a>
          <a className="navbarLink" href="/#documents" onClick={handleLinkClick}>Documents</a>
        </nav>

        <div className="menu-buttons">
          {!isAuthenticated ? (
            <>
              <button className="menu-btn" id="login" onClick={() => { navigate('/login'); handleLinkClick(); }}>
                Login
              </button>
              <button className="menu-btn" id="register" onClick={() => { navigate('/login?mode=register'); handleLinkClick(); }}>
                Register
              </button>
              <button className="menu-btn" id="become-a-member" onClick={() => { window.open('https://www.yourunion.net/activities/societies/explore/algoboostsociety'); handleLinkClick(); }}>
                Become a Member
              </button>
            </>
          ) : (
            <>
              <button className="menu-btn" onClick={() => { navigate('/memberHub'); handleLinkClick(); }}>
                Member Hub
              </button>
              <button className="menu-btn" onClick={() => { navigate('/lessons'); handleLinkClick(); }}>
                Lessons
              </button>
              <button className="menu-btn" id="logout" onClick={() => {
                logout();
                navigate('/');
                handleLinkClick();
              }}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
       {isAuthenticated && (
      <div className="user-menu" ref={menuRef}>
        <FaUser className="user-menu-button" onClick={() => setOpen(!open)} />
        <DropDownProfile isActive={open} />
      </div>
    )}
    </header>
  );
}
