import './UserProfile.css'
import { FaChevronRight } from 'react-icons/fa';
import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl } from "../../config/api";


export default function UserProfile() {
    const navigate = useNavigate();
    const [_open, setOpen] = useState(false);
    const [inProgressTasks, setInProgressTasks] = useState([]);
    const menuRef = useRef(null);

    // close profile dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // fetch solutions and their task details
    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) return;

                const res = await axios.get(buildApiUrl('user/solutions'), {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log('Solutions response:', res.data);

                const solutions = Array.isArray(res.data?.data) ? res.data.data : [];
                
                // Get solutions with status_code not 0 or 2
                const inProgressSolutions = solutions.filter(
                    s => s.status_code !== 0 && s.status_code !== 2
                );

                console.log('In progress solutions:', inProgressSolutions);

                // Get unique task IDs
                const uniqueTaskIds = [...new Set(inProgressSolutions.map(s => s.task_id))];

                console.log('Unique task IDs:', uniqueTaskIds);

                // Fetch task details for each task_id
                const taskPromises = uniqueTaskIds.slice(0, 3).map(taskId =>
                    axios.get(buildApiUrl(`tasks/${taskId}`), {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                );

                const taskResponses = await Promise.all(taskPromises);
                const tasks = taskResponses.map(res => res.data?.data).filter(Boolean);

                console.log('Fetched tasks:', tasks);

                setInProgressTasks(tasks);
            } catch (err) {
                console.error('Failed to fetch solutions:', err);
            }
        })();
    }, []);

    return (
            <div className="hub-wrapper">
                 <section className="welcome-banner">
                <div className="welcome-text">
                    <h1>
                        <span>Your Profile </span><br />
                    </h1>
                </div>
                <div className="code-glow" aria-hidden />
            </section>
            
    
                <section className="hub-content">
    
            
    
                    <div className="recent-card">
                        <h2>In Progress</h2>
    
                        <div className="lesson-list">
                            {inProgressTasks.map((l) => (
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
            </div>
        );
}