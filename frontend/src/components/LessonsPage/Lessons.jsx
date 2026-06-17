import "./Lessons.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { buildApiUrl } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";

export default function Lessons() {
  const [lessons,   setLessons]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const navigate  = useNavigate();
  const { isAuthenticated } = useAuth();
  const gridRef = useRef(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const token   = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res     = await axios.get(buildApiUrl("lessons"), { headers });
        if (!res.data?.success || !Array.isArray(res.data.data)) return;
        setLessons(res.data.data.filter((l) => l.open));
      } catch (err) {
        if (err.response?.status === 401) setNeedsAuth(true);
        else console.error("Failed to fetch lessons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [isAuthenticated]);

  const handleClick = (lesson) => {
    if (!lesson.open) return;
    if (!isAuthenticated) { navigate("/login"); return; }
    navigate(`/tasks/${lesson.id}`, { state: { lesson } });
  };

  // ── Arrow-key navigation across lesson cards ──
  const handleGridKeyDown = (e) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const cards = Array.from(
      gridRef.current?.querySelectorAll('[role="button"]:not([aria-disabled="true"])') || []
    );
    const idx = cards.indexOf(document.activeElement);
    if (idx === -1) return;
    const next = (e.key === "ArrowRight" || e.key === "ArrowDown")
      ? cards[idx + 1]
      : cards[idx - 1];
    next?.focus();
  };

  // ── Skeleton grid ──
  if (loading) {
    return (
      <div className="lessons-page">
        <div className="lessons-hero">
          <h1 className="lessons-hero__title">Lessons</h1>
          <p className="lessons-hero__sub">Master algorithms one step at a time</p>
        </div>
        <div className="lessons-grid" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="lesson-card lesson-card--skeleton">
              <div className="ls-skel ls-skel--index" />
              <div className="lesson-card__body">
                <div className="ls-skel ls-skel--title" />
                <div className="ls-skel ls-skel--desc" />
                <div className="ls-skel ls-skel--footer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className="lessons-page">
        <div className="lessons-hero">
          <h1 className="lessons-hero__title">Lessons</h1>
          <p className="lessons-hero__sub">Master algorithms one step at a time</p>
        </div>
        <div className="lessons-center lessons-auth-wall">
          <div className="lessons-auth-wall__icon">🔐</div>
          <p className="lessons-auth-wall__text">Login to view available lessons</p>
          <button className="lessons-auth-wall__btn" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="lessons-page">
        <div className="lessons-hero">
          <h1 className="lessons-hero__title">Lessons</h1>
          <p className="lessons-hero__sub">Master algorithms one step at a time</p>
        </div>
        <div className="lessons-center lessons-empty">
          <div className="lessons-empty__icon">📚</div>
          <p className="lessons-empty__text">No lessons yet — check back soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lessons-page">
      <div className="lessons-hero">
        <h1 className="lessons-hero__title">Lessons</h1>
        <p className="lessons-hero__sub">Master algorithms one step at a time</p>
      </div>

      <div
        className="lessons-grid"
        ref={gridRef}
        onKeyDown={handleGridKeyDown}
      >
        {lessons.map((lesson, idx) => {
          const taskCount    = lesson.tasks?.length ?? 0;
          const locked       = !lesson.open;
          const requireLogin = !isAuthenticated && !locked;
          return (
            <div
              key={lesson.id}
              className={`lesson-card${locked ? " lesson-card--locked" : ""}`}
              onClick={() => handleClick(lesson)}
              role="button"
              tabIndex={locked ? -1 : 0}
              onKeyDown={(e) => e.key === "Enter" && handleClick(lesson)}
              aria-disabled={locked}
            >
              <div className="lesson-card__index">
                {locked ? "🔒" : idx + 1}
              </div>
              <div className="lesson-card__body">
                <h3 className="lesson-card__title">{lesson.title}</h3>
                {lesson.description && (
                  <p className="lesson-card__desc">{lesson.description}</p>
                )}
                <div className="lesson-card__footer">
                  <span className="lesson-card__count">
                    {taskCount} task{taskCount !== 1 ? "s" : ""}
                  </span>
                  {!locked && !requireLogin && (
                    <span className="lesson-card__arrow">→</span>
                  )}
                  {!locked && requireLogin && (
                    <span className="lesson-card__login-tag">Login to access</span>
                  )}
                  {locked && (
                    <span className="lesson-card__locked-tag">Locked</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
