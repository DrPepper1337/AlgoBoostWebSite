// import './UserProfile.css'
import '../MemberHub/MemberHub.css';
import DropDownProfile from '../DropDownProfile/DropDownProfile';
import { useRef, useState} from 'react';
import { FaUser, FaChevronRight } from 'react-icons/fa';
import {Link } from 'react-router-dom';
import axios from 'axios';
import { useEffect} from 'react';


export default function UserProfile() {

    const menuRef = useRef(null);
    const [open, setOpen] = useState(false);

    const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No auth token found');
          return;
        }

        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } else {
          console.error('No user data found in localStorage');
        }

        // setUser(res.data.data); // set the user info (name, email, role, etc.)
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

    if (!user) return <div>Loading user info...</div>;


    return (
        <div className="hub-wrapper">
        <header>
                    <div className="logo-container">
                        <img src="../public/logo-no-text.svg" alt="AlgoBoost Logo" className="logo" />
                    </div>
                    <nav className="navbar">
                        <Link to="/" className="tab">Welcome Page</Link>
                        <Link to="/memberHub" className="tab">Member Home Page</Link>
                        <Link to="/resources" className="tab">Resources</Link>
                        <Link to="/lessons" className="tab">Lessons</Link>
                        <Link to="/contact" className="tab">Contact</Link>
                    </nav>
                    <div className="user-menu" ref={menuRef}>
                        <FaUser className="user-menu-button" onClick={() => setOpen(!open)} />
                        <DropDownProfile isActive={open} />
                    </div>
                </header>
                {/* Welcome banner */}
                <section className="welcome-banner">
                    <div className="welcome-text">
                        <h1>
                            <span>Welcome, {user.name}! </span><br />
                        </h1>
                    </div>
                    <div className="code-glow" aria-hidden />
                </section>

        </div>
    );
}