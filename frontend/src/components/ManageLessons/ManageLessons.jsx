import "./ManageLessons.css";
import TaskItem from "./TaskItem";
import MdEditor from "./MdEditor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";
import axios from "axios";
import { buildApiUrl } from "../../config/api";

export default function ManageLessons() {
  const [lessons,         setLessons]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [selectedId,      setSelectedId]      = useState(null);
  const [isEditMode,      setIsEditMode]      = useState(false);

  // add lesson form
  const [showAddLesson,   setShowAddLesson]   = useState(false);
  const [newTitle,        setNewTitle]        = useState("");
  const [newDesc,         setNewDesc]         = useState("");
  const [lessonErr,       setLessonErr]       = useState("");

  // edit lesson form
  const [editingLesson,   setEditingLesson]   = useState(false);
  const [editLessonTitle, setEditLessonTitle] = useState("");
  const [editLessonDesc,  setEditLessonDesc]  = useState("");
  const [editLessonErr,   setEditLessonErr]   = useState("");

  // add task form
  const [showAddTask,     setShowAddTask]     = useState(false);
  const [taskTitle,       setTaskTitle]       = useState("");
  const [taskDesc,        setTaskDesc]        = useState("");
  const [taskTime,        setTaskTime]        = useState("");
  const [taskMem,         setTaskMem]         = useState("");
  const [taskPractice,    setTaskPractice]    = useState(false);
  const [zipFile,         setZipFile]         = useState(null);
  const [zipStatus,       setZipStatus]       = useState("");
  const [taskErr,         setTaskErr]         = useState("");
  const [taskSuccess,     setTaskSuccess]     = useState("");

  const selectedLesson = lessons.find((l) => l.id === selectedId) || null;

  async function fetchTaskDetails(taskID, token) {
    try {
      const res = await axios.get(buildApiUrl(`tasks/${taskID}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.success ? res.data.data : null;
    } catch { return null; }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        const res = await axios.get(buildApiUrl("lessons"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = Array.isArray(res.data.data) ? res.data.data : [];
        const detailed = await Promise.all(
          raw.map(async (l) => {
            if (!l.tasks?.length) return { ...l, tasks: [] };
            const tasks = await Promise.all(l.tasks.map((t) => fetchTaskDetails(t.id, token)));
            return { ...l, tasks: tasks.filter(Boolean) };
          })
        );
        setLessons(detailed);
        if (detailed.length) setSelectedId(detailed[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Select lesson ──
  const selectLesson = (id) => {
    setSelectedId(id);
    setShowAddTask(false);
    setTaskErr("");
    setTaskSuccess("");
    setEditingLesson(false);
    setEditLessonErr("");
  };

  // ── Visibility toggle ──
  async function handleToggleVisibility(lessonId, currentOpen) {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      await axios.post(
        buildApiUrl("admin/set-lesson-visibility"),
        { lesson_id: lessonId, open: !currentOpen },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      setLessons((prev) =>
        prev.map((l) => l.id === lessonId ? { ...l, open: !currentOpen } : l)
      );
    } catch (err) {
      console.error("Failed to toggle visibility:", err);
    }
  }

  // ── Add lesson ──
  async function handleAddLesson(e) {
    e.preventDefault();
    setLessonErr("");
    if (!newTitle.trim() || !newDesc.trim()) { setLessonErr("Title and description required."); return; }
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await axios.post(
        buildApiUrl("admin/add-lesson"),
        { title: newTitle, description: newDesc },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data?.success) {
        const newLesson = { id: res.data.data.lesson_id, title: newTitle, description: newDesc, open: false, tasks: [] };
        setLessons((prev) => [...prev, newLesson]);
        setSelectedId(newLesson.id);
        setNewTitle(""); setNewDesc(""); setShowAddLesson(false);
      } else { setLessonErr(res.data.message || "Failed."); }
    } catch (err) { setLessonErr(err.response?.data?.message || err.message); }
  }

  // ── Delete lesson ──
  async function handleDeleteLesson(lessonId) {
    if (!window.confirm("Delete this lesson and all its tasks?")) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      await axios.post(
        buildApiUrl("admin/delete-lesson"),
        { lesson_id: lessonId },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      setSelectedId((prev) => {
        const remaining = lessons.filter((l) => l.id !== lessonId);
        return remaining.length ? remaining[0].id : null;
      });
    } catch (err) { console.error(err); }
  }

  // ── Edit lesson ──
  const startEditLesson = () => {
    setEditLessonTitle(selectedLesson.title);
    setEditLessonDesc(selectedLesson.description || "");
    setEditLessonErr("");
    setEditingLesson(true);
  };

  async function handleEditLesson(e) {
    e.preventDefault();
    setEditLessonErr("");
    if (!editLessonTitle.trim()) { setEditLessonErr("Title is required."); return; }
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await axios.post(
        buildApiUrl("admin/edit-lesson"),
        { lesson_id: selectedLesson.id, title: editLessonTitle, description: editLessonDesc },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data?.success || res.status === 200) {
        setLessons((prev) =>
          prev.map((l) =>
            l.id === selectedLesson.id
              ? { ...l, title: editLessonTitle, description: editLessonDesc }
              : l
          )
        );
        setEditingLesson(false);
      } else {
        setEditLessonErr(res.data?.message || "Failed to save.");
      }
    } catch (err) {
      setEditLessonErr(err.response?.data?.message || err.message);
    }
  }

  // ── Upload tests zip ──
  async function uploadTestsZip(taskId, token) {
    if (!zipFile) return;
    const fd = new FormData();
    fd.append("file", zipFile);
    fd.append("task_id", taskId);
    try {
      const res = await axios.post(buildApiUrl(`admin/upload-tests/${taskId}`), fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setZipStatus(res.data?.success ? "Tests uploaded!" : "Upload failed: " + (res.data?.message || ""));
    } catch (err) {
      setZipStatus("Upload failed: " + (err.response?.data?.message || err.message));
    }
  }

  // ── Add task ──
  async function handleAddTask(e) {
    e.preventDefault();
    setTaskErr(""); setTaskSuccess("");
    if (!taskTitle.trim() || !taskDesc.trim()) { setTaskErr("Title and description required."); return; }
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await axios.post(
        buildApiUrl("admin/add-task"),
        { title: taskTitle, description: taskDesc, time_limit: parseInt(taskTime) || 0, memory_limit: parseInt(taskMem) || 0, is_practice: taskPractice },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (!res.data?.success) { setTaskErr(res.data.message || "Failed to create task"); return; }
      const taskId = res.data.data.task_id;

      const attach = await axios.post(
        buildApiUrl("admin/add-task-to-lesson"),
        { task_id: taskId, lesson_id: selectedId },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (!attach.data?.success) { setTaskErr(attach.data.message || "Failed to attach task"); return; }

      await uploadTestsZip(taskId, token);

      const newTask = { id: taskId, title: taskTitle, description: taskDesc, time_limit: parseInt(taskTime) || 0, memory_limit: parseInt(taskMem) || 0, is_practice: taskPractice };
      setLessons((prev) => prev.map((l) => l.id === selectedId ? { ...l, tasks: [...(l.tasks || []), newTask] } : l));
      setTaskSuccess("Task added!");
      setTaskTitle(""); setTaskDesc(""); setTaskTime(""); setTaskMem(""); setTaskPractice(false); setZipFile(null); setShowAddTask(false);
    } catch (err) { setTaskErr(err.response?.data?.message || err.message); }
  }

  const onTaskDeleted = (deletedId, fromLessonId) => {
    setLessons((prev) =>
      prev.map((l) =>
        !fromLessonId || l.id === fromLessonId
          ? { ...l, tasks: l.tasks.filter((t) => t.id !== deletedId) }
          : l
      )
    );
  };

  if (loading) return (
    <div className="ml-page">
      <div className="ml-loading"><div className="ml-spinner" /></div>
    </div>
  );

  return (
    <div className="ml-page">
      <div className="ml-layout">

        {/* ── Sidebar ── */}
        <aside className="ml-sidebar">
          <div className="ml-sidebar-head">
            <span className="ml-sidebar-title">Lessons</span>
            <div className="ml-sidebar-actions">
              <button
                className={`ml-icon-btn${isEditMode ? " ml-icon-btn--active" : ""}`}
                title="Edit mode"
                onClick={() => { setIsEditMode((v) => !v); setEditingLesson(false); }}
              >✎</button>
              <button
                className="ml-icon-btn ml-icon-btn--orange"
                title="Add lesson"
                onClick={() => { setShowAddLesson((v) => !v); setLessonErr(""); }}
              >+</button>
            </div>
          </div>

          {showAddLesson && (
            <form className="ml-add-lesson-form" onSubmit={handleAddLesson}>
              <input className="ml-input" placeholder="Title" value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)} required />
              <MdEditor value={newDesc} onChange={setNewDesc} placeholder="Description (markdown)" rows={3} />
              {lessonErr && <p className="ml-err">{lessonErr}</p>}
              <div className="ml-form-btns">
                <button type="submit" className="ml-btn ml-btn--orange">Create</button>
                <button type="button" className="ml-btn" onClick={() => setShowAddLesson(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="ml-lesson-nav">
            {lessons.length === 0 ? (
              <p className="ml-nav-empty">No lessons yet.</p>
            ) : lessons.map((l) => (
              <div
                key={l.id}
                className={`ml-nav-item${selectedId === l.id ? " ml-nav-item--active" : ""}`}
                onClick={() => selectLesson(l.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && selectLesson(l.id)}
              >
                <span className="ml-nav-item-title">{l.title}</span>
                <span className="ml-nav-item-count">{l.tasks?.length ?? 0}</span>
                {isEditMode && (
                  <button
                    className={`ml-vis-btn${l.open ? " ml-vis-btn--open" : ""}`}
                    onClick={(e) => { e.stopPropagation(); handleToggleVisibility(l.id, l.open); }}
                    title={l.open ? "Published — click to lock" : "Locked — click to publish"}
                  >
                    {l.open ? "🔓" : "🔒"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main panel ── */}
        <main className="ml-panel">
          {!selectedLesson ? (
            <div className="ml-panel-empty">
              <p>Select a lesson from the list, or create one.</p>
            </div>
          ) : (
            <>
              {/* Lesson header / edit form */}
              {editingLesson ? (
                <form className="ml-edit-lesson-form" onSubmit={handleEditLesson}>
                  <h2 className="ml-edit-lesson-heading">Edit Lesson</h2>
                  <label className="ml-label">
                    Title
                    <input
                      className="ml-input"
                      value={editLessonTitle}
                      onChange={(e) => setEditLessonTitle(e.target.value)}
                      required
                    />
                  </label>
                  <label className="ml-label">
                    Description
                    <MdEditor value={editLessonDesc} onChange={setEditLessonDesc} rows={5} />
                  </label>
                  {editLessonErr && <p className="ml-err">{editLessonErr}</p>}
                  <div className="ml-form-btns">
                    <button type="submit" className="ml-btn ml-btn--orange">Save</button>
                    <button type="button" className="ml-btn" onClick={() => setEditingLesson(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="ml-panel-head">
                  <div className="ml-panel-head-info">
                    <h1 className="ml-panel-title">{selectedLesson.title}</h1>
                    <div className="ml-panel-desc">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedLesson.description || ""}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="ml-panel-head-actions">
                    <button
                      className={`ml-btn ml-btn--sm ml-btn--dark${selectedLesson.open ? " ml-btn--vis-open" : ""}`}
                      onClick={() => handleToggleVisibility(selectedLesson.id, selectedLesson.open)}
                      title={selectedLesson.open ? "Published — click to lock" : "Locked — click to publish"}
                    >
                      {selectedLesson.open ? "🔓 Published" : "🔒 Locked"}
                    </button>
                    {isEditMode && (
                      <>
                        <button
                          className="ml-btn ml-btn--sm ml-btn--dark"
                          onClick={startEditLesson}
                        >
                          Edit
                        </button>
                        <button
                          className="ml-btn ml-btn--danger ml-btn--sm"
                          onClick={() => handleDeleteLesson(selectedLesson.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Tasks section */}
              <div className="ml-tasks-section">
                <div className="ml-tasks-head">
                  <h2 className="ml-tasks-title">
                    Tasks
                    <span className="ml-tasks-count">{selectedLesson.tasks?.length ?? 0}</span>
                  </h2>
                  {isEditMode && (
                    <button
                      className={`ml-btn ml-btn--sm${showAddTask ? "" : " ml-btn--orange"}`}
                      onClick={() => { setShowAddTask((v) => !v); setTaskErr(""); setTaskSuccess(""); }}
                    >
                      {showAddTask ? "Cancel" : "+ Add Task"}
                    </button>
                  )}
                </div>

                {showAddTask && (
                  <form className="ml-task-form" onSubmit={handleAddTask}>
                    <label className="ml-label">
                      Title
                      <input className="ml-input" value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)} required />
                    </label>
                    <label className="ml-label">
                      Description
                      <MdEditor value={taskDesc} onChange={setTaskDesc} placeholder="Task description (markdown)" rows={14} />
                    </label>

                    <label className="ml-label ml-label--check ml-label--practice">
                      <input type="checkbox" checked={taskPractice}
                        onChange={(e) => {
                          setTaskPractice(e.target.checked);
                          if (!e.target.checked) { setTaskTime(""); setTaskMem(""); setZipFile(null); setZipStatus(""); }
                        }} />
                      Practice task
                    </label>

                    {taskPractice && (
                      <>
                        <div className="ml-task-meta-row">
                          <label className="ml-label">
                            Time limit (s)
                            <input className="ml-input ml-input--sm" type="number" value={taskTime}
                              onChange={(e) => setTaskTime(e.target.value)} />
                          </label>
                          <label className="ml-label">
                            Memory (MB)
                            <input className="ml-input ml-input--sm" type="number" value={taskMem}
                              onChange={(e) => setTaskMem(e.target.value)} />
                          </label>
                        </div>

                        <div className="ml-zip-section">
                          <label className="ml-label">Tests (.zip)</label>
                          <div className="ml-zip-row">
                            <label className="ml-zip-btn" htmlFor={`zip-${selectedId}`}>
                              {zipFile ? zipFile.name : "Choose ZIP"}
                            </label>
                            <input id={`zip-${selectedId}`} type="file" accept=".zip" className="ml-zip-hidden"
                              onChange={(e) => { setZipFile(e.target.files[0] || null); setZipStatus(""); }} />
                            {zipFile && (
                              <button type="button" className="ml-zip-clear"
                                onClick={() => { setZipFile(null); setZipStatus(""); }}>✕</button>
                            )}
                          </div>
                          <span className="ml-hint">Format: 1.in / 1.out, 2.in / 2.out …</span>
                          {zipStatus && <p className={zipStatus.includes("failed") ? "ml-err" : "ml-ok"}>{zipStatus}</p>}
                        </div>
                      </>
                    )}

                    {taskErr     && <p className="ml-err">{taskErr}</p>}
                    {taskSuccess && <p className="ml-ok">{taskSuccess}</p>}
                    <button type="submit" className="ml-btn ml-btn--orange">Add Task</button>
                  </form>
                )}

                {selectedLesson.tasks?.length === 0 && !showAddTask ? (
                  <p className="ml-no-tasks">No tasks yet.{isEditMode ? ' Click "+ Add Task" to create one.' : ""}</p>
                ) : (
                  <ul className="ml-task-list">
                    {selectedLesson.tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        isEditMode={isEditMode}
                        lessonId={selectedLesson.id}
                        onTaskDeleted={onTaskDeleted}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
