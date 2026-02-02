import "./MemberHub.css";
import { FaChevronRight } from "react-icons/fa";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LessonsCalendar from "../LessonsCalendar/LessonsCalendar";
import "../LessonsCalendar/LessonsCalendar.css";
import { buildApiUrl } from "../../config/api";

export default function MemberHub() {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpen, menuRef]);

  // fetch lessons
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        const res = await axios.get(buildApiUrl("lessons"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const lessonsData = Array.isArray(res.data?.data) ? res.data.data : [];
        setLessons(lessonsData);
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
      }
    })();
  }, []);

  const recentLessons = lessons.slice(0, 3);

  return (
    <div className="hub-wrapper">
      <section className="welcome-banner">
        <div className="welcome-text">
          <h1>
            <span>Welcome back, </span>
            <br />
            <strong>{user?.name || "Dear user"}!</strong>
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
                onClick={() =>
                  navigate(`/tasks/${l.id}`, { state: { lesson: l } })
                }
              >
                <div className="lesson-meta">
                  <h3>{l.title}</h3>
                  <p className="muted">
                    {l.description || "A brief description of this lesson."}
                  </p>
                  <div className="progress">
                    <div
                      className="bar"
                      style={{ width: `${(l.progress || 0) * 100}%` }}
                    />
                    <span className="ratio">
                      {l.completed || 0}/{l.total || 3}
                    </span>
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
