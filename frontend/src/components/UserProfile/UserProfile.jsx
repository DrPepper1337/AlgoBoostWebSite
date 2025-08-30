import './UserProfile.css'
import '../MemberHub/MemberHub.css';
import '../../styles/Global.css';
import DropDownProfile from '../DropDownProfile/DropDownProfile';
import { useRef, useState} from 'react';
import { FaUser, FaChevronRight } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
export default function UserProfile() {

    const menuRef = useRef(null);
    const [open, setOpen] = useState(false);
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
                            <span>Your Profile</span><br />
                        </h1>
                    </div>
                    <div className="code-glow" aria-hidden />
                </section>

        </div>
    );
}