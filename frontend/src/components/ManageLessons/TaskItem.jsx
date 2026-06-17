import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./TaskItem.css";
import axios from "axios";
import { buildApiUrl } from "../../config/api";

export default function TaskItem({ task, isEditMode, onTaskDeleted, lessonId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteFromLesson = async () => {
    const token = localStorage.getItem("authToken");
    try {
      setIsDeleting(true);
      await axios.post(
        buildApiUrl("admin/delete-task-from-lesson"),
        { task_id: task.id, lesson_id: lessonId },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      onTaskDeleted(task.id, lessonId);
    } catch (err) {
      console.error("Error deleting task from lesson:", err);
      alert("Failed to delete task. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteTask = async () => {
    const token = localStorage.getItem("authToken");
    try {
      setIsDeleting(true);
      await axios.post(
        buildApiUrl("admin/delete-task"),
        { task_id: task.id },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      onTaskDeleted(task.id);
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = async () => {
    const fromLesson = window.confirm(
      `Delete "${task.title}" from this lesson only?\n\nOK = remove from lesson\nCancel = delete permanently`
    );
    if (fromLesson) {
      await handleDeleteFromLesson();
    } else {
      await handleDeleteFromLesson();
      await handleDeleteTask();
    }
  };

  return (
    <li className="ti-item">
      <div className="ti-row" onClick={() => setIsOpen((v) => !v)}>
        <span className={`ti-arrow${isOpen ? " ti-arrow--open" : ""}`}>▶</span>
        <span className="ti-title">{task.title}</span>
        <div className="ti-badges">
          {task.is_practice && <span className="ti-badge ti-badge--practice">Practice</span>}
          {task.time_limit > 0 && <span className="ti-badge">{task.time_limit}s</span>}
          {task.memory_limit > 0 && <span className="ti-badge">{task.memory_limit}MB</span>}
        </div>
        {isEditMode && (
          <button
            className="ti-delete-btn"
            disabled={isDeleting}
            title="Delete task"
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(); }}
          >
            {isDeleting ? "…" : "✕"}
          </button>
        )}
      </div>

      {isOpen && (
        <div className="ti-details">
          {task.description ? (
            <div className="ti-desc-md">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.description}</ReactMarkdown>
            </div>
          ) : (
            <p className="ti-no-desc">No description.</p>
          )}
          <div className="ti-meta-row">
            {task.time_limit > 0 && <span className="ti-meta-item">⏱ {task.time_limit}s time limit</span>}
            {task.memory_limit > 0 && <span className="ti-meta-item">💾 {task.memory_limit} MB memory</span>}
            {task.is_practice && <span className="ti-meta-item ti-meta-practice">Practice task</span>}
          </div>
        </div>
      )}
    </li>
  );
}
