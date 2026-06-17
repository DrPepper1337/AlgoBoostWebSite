import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { FaBook, FaCode, FaCheckCircle, FaTimesCircle, FaCircle, FaRegCircle, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { buildApiUrl } from '../../config/api';
import './TasksPage.css';

export default function TasksPage() {
  const { lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(location.state?.lesson ?? null);
  const [loading, setLoading] = useState(!location.state?.lesson);
  const [error, setError] = useState(null);

  // ── Initial lesson fetch (direct URL navigation) ──
  useEffect(() => {
    if (lesson) return;

    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) { setError("Not authenticated."); setLoading(false); return; }
        const res = await axios.get(buildApiUrl("lessons"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success && Array.isArray(res.data.data)) {
          const found = res.data.data.find((l) => String(l.id) === String(lessonId));
          if (found) setLesson(found);
          else setError("Lesson not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load lesson.");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  // ── Background enrich: fetch is_practice for each task if missing ──
  useEffect(() => {
    if (!lesson?.tasks?.length) return;
    if (!lesson.tasks.some((t) => t.is_practice === undefined)) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    let cancelled = false;

    Promise.all(
      lesson.tasks.map(async (t) => {
        if (t.is_practice !== undefined) return t;
        try {
          const res = await axios.get(buildApiUrl(`tasks/${t.id}`), {
            headers: { Authorization: `Bearer ${token}` },
          });
          return res.data?.success ? { ...t, ...res.data.data } : t;
        } catch {
          return t;
        }
      })
    ).then((enriched) => {
      if (!cancelled) {
        setLesson((prev) => prev ? { ...prev, tasks: enriched } : prev);
      }
    });

    return () => { cancelled = true; };
  }, [lesson?.id]);

  const handleTaskClick = (task) => {
    navigate(`/tasks/${lessonId}/${task.id}`, { state: { lesson } });
  };

  // ── Skeleton loading ──
  if (loading) {
    return (
      <div className="tasks-page">
        <div className="tasks-topbar tasks-topbar--skeleton">
          <div className="tsk-skel tsk-skel--back" />
          <div className="tsk-skel tsk-skel--title" />
          <div className="tasks-topbar-spacer" />
        </div>
        <div className="tasks-content">
          <div className="tasks-lesson-header">
            <div className="tsk-skel tsk-skel--h1" />
            <div className="tsk-skel tsk-skel--desc" />
          </div>
          <ul className="task-list">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="task-item task-item--skeleton" aria-hidden="true">
                <div className="tsk-skel tsk-skel--num" />
                <div className="tsk-skel tsk-skel--icon" />
                <div className="task-item__body">
                  <div className="tsk-skel tsk-skel--task-title" />
                  <div className="tsk-skel tsk-skel--task-type" />
                </div>
                <div className="tsk-skel tsk-skel--status" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="tasks-page">
        <div className="tasks-center">
          <p className="tasks-error">{error ?? "Lesson not found."}</p>
          <button className="tasks-back-btn" onClick={() => navigate("/lessons")}>
            <FaArrowLeft /> Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  const tasks = lesson.tasks ?? [];

  return (
    <div className="tasks-page">
      <div className="tasks-topbar">
        <button className="tasks-back-btn" onClick={() => navigate("/lessons")}>
          <FaArrowLeft /> Lessons
        </button>
        <span className="tasks-topbar-title">{lesson.title}</span>
        <div className="tasks-topbar-spacer" />
      </div>

      <div className="tasks-content">
        <div className="tasks-lesson-header">
          <h1 className="tasks-lesson-title">{lesson.title}</h1>
          {lesson.description && (
            <p className="tasks-lesson-desc">{lesson.description}</p>
          )}
          <div className="tasks-lesson-meta">
            <span className="tasks-lesson-count">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="tasks-center">
            <span className="tasks-empty-icon">📋</span>
            <p className="tasks-empty">No tasks in this lesson yet.</p>
          </div>
        ) : (
          <ul className="task-list">
            {tasks.map((task, idx) => {
              const s = task.status;
              const accepted = s === 2;
              return (
                <li
                  key={task.id}
                  className={`task-item${accepted ? " task-item--done" : ""}`}
                  onClick={() => handleTaskClick(task)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleTaskClick(task)}
                  role="button"
                >
                  <div className="task-item__num">{idx + 1}</div>
                  <div className="task-item__icon">
                    {task.is_practice === true ? <FaCode /> : <FaBook />}
                  </div>
                  <div className="task-item__body">
                    <span className="task-title">{task.title}</span>
                    {task.is_practice !== undefined && (
                      <span className="task-type">
                        {task.is_practice ? "Practice" : "Lecture"}
                      </span>
                    )}
                  </div>
                  <div className="task-item__status">
                    {task.is_practice === false ? null
                      : s === 2 ? <FaCheckCircle className="task-status-icon task-status-icon--accepted" title="Accepted" />
                      : s === 1 ? <FaCircle      className="task-status-icon task-status-icon--pending"  title="Pending" />
                      : s >= 3  ? <FaTimesCircle className="task-status-icon task-status-icon--error"    title="Wrong answer" />
                      :           <FaRegCircle   className="task-status-icon task-status-icon--none"     title="Not attempted" />
                    }
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
