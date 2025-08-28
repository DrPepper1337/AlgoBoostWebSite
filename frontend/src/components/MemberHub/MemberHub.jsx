import './MemberHub.css';
import DropDownProfile from '../DropDownProfile/DropDownProfile';
import SessionContainer from "../SessionContainer/SessionContainer";
import { FaUser, FaChevronRight } from 'react-icons/fa';
import { useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Global.css';
// import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
// import format from 'date-fns/format';
// import parse from 'date-fns/parse';
// import startOfWeek from 'date-fns/startOfWeek';
// import getDay from 'date-fns/getDay';
import LessonsCalendar from '../LessonsCalendar/LessonsCalendar';
import '../LessonsCalendar/LessonsCalendar.css';


// import enUS from "date-fns/locale/en-US";
// import 'react-big-calendar/lib/css/react-big-calendar.css';

// const locales = {
//     'en-US': enUS,
// };

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

            {/* Two-column content */}
            <section className="hub-content">
                {/* Schedule */}

                <LessonsCalendar lessons={lessons} />

                {/* Recent lessons */}
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

                        {/* fallback if no API data yet */}
                        {!recentLessons.length && (
                            <>
                                <div className="lesson-item disabled">
                                    <div className="lesson-meta">
                                        <h3>Greedy Algorithms</h3>
                                        <p className="muted">A brief description of what greedy algorithms are…</p>
                                        <div className="progress">
                                            <div className="bar" style={{ width: '70%' }} />
                                            <span className="ratio">2/3</span>
                                        </div>
                                    </div>
                                    <FaChevronRight className="chev" />
                                </div>
                                <div className="lesson-item disabled">
                                    <div className="lesson-meta">
                                        <h3>Depth‑First Search</h3>
                                        <p className="muted">A brief description of what depth first search is…</p>
                                        <div className="progress">
                                            <div className="bar" style={{ width: '33%' }} />
                                            <span className="ratio">1/3</span>
                                        </div>
                                    </div>
                                    <FaChevronRight className="chev" />
                                </div>
                                <div className="lesson-item disabled">
                                    <div className="lesson-meta">
                                        <h3>Bubble Sort</h3>
                                        <p className="muted">A brief description of what bubble sort algos are…</p>
                                        <div className="progress">
                                            <div className="bar" style={{ width: '100%' }} />
                                            <span className="ratio">3/3</span>
                                        </div>
                                    </div>
                                    <FaChevronRight className="chev" />
                                </div>
                            </>
                        )}
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