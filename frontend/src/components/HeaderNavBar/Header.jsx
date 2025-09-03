import { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser } from 'react-icons/fa';
import './Header.css';
import '../../styles/Global.css';
import DropDownProfile from '../DropDownProfile/DropDownProfile';

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user, deleteUserDataFromLocalStorage } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpen(false);
  }, [location]);

  if (location.pathname === '/verify') {
    return null;
  }

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  // Check if user is admin
  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="logo-container">
          <img src="/logo-no-text.svg" alt="AlgoBoost Logo" className="logo" />
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}></div>
        </button>

        <div className="right-controls">
          {!isAuthenticated ? (
            <div className="menu-buttons">
              <button className="menu-btn" id="login" onClick={() => { navigate('/login'); handleLinkClick(); }}>Login</button>
              <button className="menu-btn" id="register" onClick={() => { navigate('/login?mode=register'); handleLinkClick(); }}>Register</button>
              <button className="menu-btn" id="become-a-member" onClick={() => { window.open('https://www.yourunion.net/activities/societies/explore/algoboostsociety'); handleLinkClick(); }}>Become a Member</button>
            </div>
          ) : (
            <div className="user-menu" ref={menuRef}>
              <FaUser className="user-menu-button" onClick={() => setOpen((prev) => !prev)} />
              {open && <DropDownProfile isActive={open} />}
            </div>
          )}
        </div>
      </div>

      <div className={`nav-container ${isMenuOpen ? 'open' : ''}`}>
        {isHomePage && (
          <nav className="navbar">
            <a className="navbarLink" href="/#about" onClick={handleLinkClick}>About us</a>
            <a className="navbarLink" href="/#offer" onClick={handleLinkClick}>What we offer</a>
            <a className="navbarLink" href="/#events" onClick={handleLinkClick}>Events</a>
            <a className="navbarLink" href="/#documents" onClick={handleLinkClick}>Documents</a>
          </nav>
        )}

        {isAuthenticated && (
          <nav className="navbar">
            <button className="navbarLink" onClick={() => { navigate('/'); handleLinkClick(); }}>Welcome Page</button>
            <button className="navbarLink" onClick={() => { navigate('/memberHub'); handleLinkClick(); }}>Member Hub</button>
            <button className="navbarLink" onClick={() => { navigate('/lessons'); handleLinkClick(); }}>Lessons</button>
            {isAdmin && (
              <>
                <button className="navbarLink admin-link" onClick={() => { navigate('/manage-users'); handleLinkClick(); }}>Manage Users</button>
                <button className="navbarLink admin-link" onClick={() => { navigate('/manage-lessons'); handleLinkClick(); }}>Manage Lessons</button>
              </>
            )}
            <button className="navbarLink" id="logout" onClick={() => { deleteUserDataFromLocalStorage(); navigate('/'); handleLinkClick(); }}>Logout</button>
          </nav>
        )}
      </div>
    </header>
  );
}
