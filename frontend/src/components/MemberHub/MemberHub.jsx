import './MemberHub.css';
import DropDownProfile from '../DropDownProfile/DropDownProfile';
import SessionContainer from "../SessionContainer/SessionContainer";
import { FaUser, FaChevronRight } from 'react-icons/fa';
import { useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Global.css';
import LessonsCalendar from '../LessonsCalendar/LessonsCalendar';
import '../LessonsCalendar/LessonsCalendar.css';

export default function MemberHub() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [lessons, setLessons] = useState([]);
    const menuRef = useRef(null);

    // close profile dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // fetch lessons
    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) return;
                const res = await axios.get('http://localhost:8080/api/lessons', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const lessonsData = Array.isArray(res.data?.data) ? res.data.data : [];
                setLessons(lessonsData);
            } catch (err) {
                console.error('Failed to fetch lessons:', err);
            }
        })();
    }, []);

    // helpers
    const recentLessons = lessons.slice(0, 3);

    return (
        <div className="hub-wrapper">
            <header>
                <div className="logo-container">
                    <img src="../public/logo-no-text.svg" alt="AlgoBoost Logo" className="logo" />
                </div>
                <nav className="navbar">
                    <Link to="/" className="tab">Welcome Page</Link>
                    <span className="tab active">Member Home Page</span>
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
                        <span>Welcome back,</span><br />
                        <strong>Test Guy !</strong>
                    </h1>
                </div>
                <div className="code-glow" aria-hidden />
            </section>

            <section className="hub-content">

                <LessonsCalendar lessons={lessons} />

                <div className="recent-card">
                    <h2>Recent lessons</h2>

                    <div className="lesson-list">
                        {recentLessons.map((l) => (
                            <button
                                key={l.id}
                                className="lesson-item"
                                onClick={() => navigate(`/tasks/${l.id}`, { state: { lesson: l } })}
                            >
                                <div className="lesson-meta">
                                    <h3>{l.title}</h3>
                                    <p className="muted">{l.description || 'A brief description of this lesson.'}</p>
                                    <div className="progress">
                                        <div className="bar" style={{ width: `${(l.progress || 0) * 100}%` }} />
                                        <span className="ratio">{l.completed || 0}/{l.total || 3}</span>
                                    </div>
                                </div>
                                <FaChevronRight className="chev" />
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* (Optional) All lessons list you already had:
      <section className="sessions-wrapper">
        {lessons.map((lesson) => (
          <SessionContainer
            key={lesson.id}
            topic={lesson.title}
            onLearnClick={() => navigate(`/tasks/${lesson.id}`, { state: { lesson } })}
          />
        ))}
      </section> */}
        </div>
    );
}