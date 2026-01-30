import './UserProfile.css'
import { FaChevronRight } from 'react-icons/fa';
import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl } from "../../config/api";


export default function UserProfile() {
    const navigate = useNavigate();
    const [_open, setOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({solved: 0, total: 0});
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

    // featch user data
    useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

   // fetch user stats
    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) return;

                const res = await axios.get(buildApiUrl('user/stats'), {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data?.data) {
                    setStats(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        })();
    }, []);

    // // fetch solutions and their task details
    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const token = localStorage.getItem('authToken');
    //             if (!token) return;

    //             const res = await axios.get(buildApiUrl('user/solutions'), {
    //                 headers: { Authorization: `Bearer ${token}` },
    //             });

    //             console.log('Solutions response:', res.data);

    //             const solutions = Array.isArray(res.data?.data) ? res.data.data : [];
                
    //             // Get solutions with status_code not 0 or 2
    //             const inProgressSolutions = solutions.filter(
    //                 s => s.status_code !== 0 && s.status_code !== 2
    //             );

    //             console.log('In progress solutions:', inProgressSolutions);

    //             // Get unique task IDs
    //             const uniqueTaskIds = [...new Set(inProgressSolutions.map(s => s.task_id))];

    //             console.log('Unique task IDs:', uniqueTaskIds);

    //             // Fetch task details for each task_id
    //             const taskPromises = uniqueTaskIds.slice(0, 3).map(taskId =>
    //                 axios.get(buildApiUrl(`tasks/${taskId}`), {
    //                     headers: { Authorization: `Bearer ${token}` },
    //                 })
    //             );

    //             const taskResponses = await Promise.all(taskPromises);
    //             const tasks = taskResponses.map(res => res.data?.data).filter(Boolean);

    //             console.log('Fetched tasks:', tasks);

    //             setInProgressTasks(tasks);
    //         } catch (err) {
    //             console.error('Failed to fetch solutions:', err);
    //         }
    //     })();
    // }, []);

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

    const progressPercent = stats.total > 0 ? (stats.solved / stats.total) * 100 : 0;
    return (
            <div className="hub-wrapper">
                 <section className="welcome-banner">
                <div className="welcome-text">
                    <h1>
                        {/* <span>Your Profile </span><br /> */}
                         <strong>{user?.name || 'User Profile'}</strong>
                    </h1>
                </div>
                <div className="code-glow" aria-hidden />
            </section>
            
    
                <section className="hub-content">
    
            
    
                    <div className="recent-card">
                        <h2>In Progress</h2>
    
                        <div className="lesson-list">
                            {inProgressTasks.length === 0 ? (
                                <p className="muted no-tasks">No tasks in progress</p>
                            ) : (
                                inProgressTasks.map((l) => (
                                    <button
                                        key={l.id}
                                        className="lesson-item"
                                        onClick={() => navigate(`/tasks/${l.id}`, { state: { lesson: l } })}
                                    >
                                        <div className="task-label">
                                            <h3>{l.title}</h3>
                                            <p className="muted">{l.description || 'A brief description of this lesson.'}</p>
                                        </div>
                                        <FaChevronRight className="chev" />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="recent-card">
                        <h2>Statistics</h2>
                        <div className="stats-container">
                            <div className="circular-progress">
                                <svg viewBox="0 0 100 100">
                                    <circle
                                        className="progress-bg"
                                        cx="50"
                                        cy="50"
                                        r="45"
                                    />
                                    <circle
                                        className="progress-bar"
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        style={{
                                            strokeDasharray: `${progressPercent * 2.83} 283`,
                                        }}
                                    />
                                </svg>
                                <div className="progress-text">
                                    {stats.solved}/{stats.total}
                                </div>
                            </div>
                            <div className="stats-label">
                                <h3>Solved</h3>
                                <p className="muted">Practice problems completed</p>
                            </div>
                        </div>
                      
                    </div>
                </section>
            </div>
        );
}

