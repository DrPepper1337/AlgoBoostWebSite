import "./TaskDetailPage.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Editor from "@monaco-editor/react";
import { buildApiUrl } from "../../config/api";
import {
  FaArrowLeft,
  FaClock,
  FaServer,
  FaPlay,
  FaListUl,
  FaAlignLeft,
} from "react-icons/fa";

const LANGUAGES = [
  { id: "python", label: "Python" },
  { id: "cpp",    label: "C++" },
  { id: "java",   label: "Java" },
  { id: "go",     label: "Go" },
];

const MONACO_LANG = { python: "python", cpp: "cpp", java: "java", go: "go" };

const DEFAULT_CODE = {
  python: `def solution():\n    # Write your solution here\n    pass\n`,
  cpp:    `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
  java:   `import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n`,
  go:     `package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your solution here\n    fmt.Println("Hello")\n}\n`,
};

const STATUS_MAP = {
  0: { label: "Accepted",             cls: "sol-status--accepted" },
  1: { label: "Pending",              cls: "sol-status--pending"  },
  2: { label: "Wrong Answer",         cls: "sol-status--error"    },
  3: { label: "Time Limit Exceeded",  cls: "sol-status--error"    },
  4: { label: "Memory Limit Exceeded",cls: "sol-status--error"    },
};

function getStatusInfo(code) {
  return STATUS_MAP[code] ?? { label: "Unknown", cls: "sol-status--pending" };
}

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS  = 30_000;

export default function TaskDetailPage() {
  const { lessonId, taskId } = useParams();
  const location  = useLocation();
  const navigate  = useNavigate();
  const lesson    = location.state?.lesson;

  const [task,            setTask]            = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [activeTab,       setActiveTab]       = useState("description");
  const [mobileTab,       setMobileTab]       = useState("problem");

  const [lang,            setLang]            = useState("python");
  const [code,            setCode]            = useState(DEFAULT_CODE.python);
  const [submitting,      setSubmitting]      = useState(false);
  const [submitResult,    setSubmitResult]    = useState(null);
  const [judging,         setJudging]         = useState(false);

  const [solutions,       setSolutions]       = useState([]);
  const [solutionsLoading,setSolutionsLoading]= useState(false);
  const [solutionsTick,   setSolutionsTick]   = useState(0);

  const pollRef    = useRef(null);
  const pollStart  = useRef(0);

  // ── Cleanup poll on unmount ──
  useEffect(() => () => clearInterval(pollRef.current), []);

  // ── Fetch task ──
  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        const res = await axios.get(buildApiUrl(`tasks/${taskId}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success) setTask(res.data.data);
      } catch (err) {
        console.error("Failed to fetch task:", err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [taskId]);

  // ── Fetch solutions (triggered by tab change or solutionsTick) ──
  const fetchSolutions = useCallback(async () => {
    setSolutionsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const res = await axios.get(buildApiUrl("user/solutions"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setSolutions(
          (res.data.data || []).filter((s) => s.task_id === parseInt(taskId))
        );
      }
    } catch (err) {
      console.error("Failed to fetch solutions:", err);
    } finally {
      setSolutionsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (activeTab !== "solutions") return;
    fetchSolutions();
  }, [activeTab, solutionsTick, fetchSolutions]);

  // ── Polling for verdict ──
  const startPolling = useCallback((solutionId) => {
    if (!solutionId) return;
    clearInterval(pollRef.current);
    setJudging(true);
    pollStart.current = Date.now();

    pollRef.current = setInterval(async () => {
      if (Date.now() - pollStart.current >= POLL_TIMEOUT_MS) {
        clearInterval(pollRef.current);
        setJudging(false);
        return;
      }
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(buildApiUrl(`solutions/${solutionId}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sol = res.data?.data;
        if (sol && sol.status_code !== 1) {
          clearInterval(pollRef.current);
          setJudging(false);
          setSolutionsTick((t) => t + 1);
          setActiveTab("solutions");
        }
      } catch { /* keep polling */ }
    }, POLL_INTERVAL_MS);
  }, []);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    setCode(DEFAULT_CODE[newLang]);
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    setSubmitResult(null);

    const token    = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");
    const userId   = userData ? JSON.parse(userData).id : null;

    try {
      const res = await axios.post(
        buildApiUrl("submit"),
        { compiler: lang, code, task_id: parseInt(taskId), user_id: userId },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      if (res.data?.success) {
        const solutionId = res.data.data?.solution_id ?? res.data.data?.id;
        setSubmitResult({ ok: true, message: "Solution submitted!" });
        startPolling(solutionId);
      } else {
        setSubmitResult({ ok: false, message: res.data?.message || "Submission failed." });
      }
    } catch (err) {
      setSubmitResult({
        ok: false,
        message: err.response?.data?.message || "Submission failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared topbar ──
  const topbar = (
    <div className="tdp-topbar">
      <button
        className="tdp-back"
        onClick={() => navigate(`/tasks/${lessonId}`, { state: { lesson } })}
      >
        <FaArrowLeft />
        {lesson ? lesson.title : "Back"}
      </button>
      <span className="tdp-topbar-title">
        {loading ? "Loading…" : (task?.title ?? `Task #${taskId}`)}
      </span>
      <div className="tdp-topbar-spacer" />
    </div>
  );

  if (loading) {
    return (
      <div className="tdp">
        {topbar}
        <div className="tdp-center"><div className="tdp-spinner" /></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="tdp">
        {topbar}
        <div className="tdp-center tdp-muted">Task not found.</div>
      </div>
    );
  }

  /* ── Lecture view ── */
  if (!task.is_practice) {
    return (
      <div className="tdp tdp--lecture">
        {topbar}
        <div className="tdp-lecture-scroll">
          <article className="tdp-lecture-body">
            <h1 className="tdp-lecture-title">{task.title}</h1>

            {(task.time_limit > 0 || task.memory_limit > 0) && (
              <div className="tdp-meta tdp-lecture-meta">
                {task.time_limit   > 0 && <span className="tdp-badge"><FaClock /> {task.time_limit}s</span>}
                {task.memory_limit > 0 && <span className="tdp-badge"><FaServer /> {task.memory_limit} MB</span>}
              </div>
            )}

            <div className="tdp-desc tdp-markdown tdp-lecture-content">
              {task.description
                ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.description}</ReactMarkdown>
                : <p className="tdp-muted-text">No content provided.</p>
              }
            </div>
          </article>
        </div>
      </div>
    );
  }

  /* ── Practice view ── */
  return (
    <div className="tdp">
      {topbar}

      <div className="tdp-split">
        {/* ════ LEFT PANEL ════ */}
        <div className={`tdp-left${mobileTab === "code" ? " tdp-panel-hidden" : ""}`}>
          <div className="tdp-tabs">
            <button
              className={`tdp-tab${activeTab === "description" ? " tdp-tab--active" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              <FaAlignLeft className="tdp-tab-icon" /> Description
            </button>
            <button
              className={`tdp-tab${activeTab === "solutions" ? " tdp-tab--active" : ""}`}
              onClick={() => setActiveTab("solutions")}
            >
              <FaListUl className="tdp-tab-icon" /> My Solutions
            </button>
          </div>

          {activeTab === "description" && (
            <div className="tdp-panel">
              <h2 className="tdp-task-title">{task.title}</h2>
              <div className="tdp-meta">
                {task.time_limit   > 0 && <span className="tdp-badge"><FaClock /> {task.time_limit}s</span>}
                {task.memory_limit > 0 && <span className="tdp-badge"><FaServer /> {task.memory_limit} MB</span>}
                <span className="tdp-badge tdp-badge--practice">Practice</span>
              </div>
              <div className="tdp-desc tdp-markdown">
                {task.description
                  ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.description}</ReactMarkdown>
                  : <p className="tdp-muted-text">No description provided.</p>
                }
              </div>
            </div>
          )}

          {activeTab === "solutions" && (
            <div className="tdp-panel">
              <h3 className="tdp-section-title">My Submissions</h3>
              {solutionsLoading ? (
                <div className="tdp-center"><div className="tdp-spinner" /></div>
              ) : solutions.length === 0 ? (
                <p className="tdp-muted-text">No submissions yet for this task.</p>
              ) : (
                <div className="tdp-table-wrap">
                  <table className="tdp-table">
                    <thead>
                      <tr><th>#</th><th>Language</th><th>Status</th><th>Time</th><th>Memory</th></tr>
                    </thead>
                    <tbody>
                      {solutions.map((sol, i) => {
                        const st = getStatusInfo(sol.status_code);
                        return (
                          <tr
                            key={sol.id}
                            className="tdp-table-row--link"
                            onClick={() => navigate(`/submissions/${sol.id}`, {
                              state: { taskId, lessonId, taskTitle: task.title, lesson },
                            })}
                          >
                            <td>{i + 1}</td>
                            <td className="tdp-lang-cell">{sol.compiler}</td>
                            <td><span className={`sol-status ${st.cls}`}>{st.label}</span></td>
                            <td>{sol.time   ? `${sol.time.toFixed(2)}s`    : "—"}</td>
                            <td>{sol.memory ? `${sol.memory.toFixed(1)} MB` : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ════ RIGHT PANEL ════ */}
        <div className={`tdp-right${mobileTab === "problem" ? " tdp-panel-hidden" : ""}`}>
          <div className="tdp-editor-bar">
            <select
              className="tdp-lang-select"
              value={lang}
              onChange={(e) => handleLangChange(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>

            {judging && (
              <span className="tdp-judging-badge">
                <span className="tdp-judging-dot" /> Judging…
              </span>
            )}
          </div>

          <div className="tdp-editor-wrap">
            <Editor
              height="100%"
              language={MONACO_LANG[lang]}
              value={code}
              theme="vs-dark"
              onChange={(val) => setCode(val ?? "")}
              options={{
                fontSize: 14,
                fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                tabSize: 2,
                insertSpaces: true,
                wordWrap: "off",
                renderLineHighlight: "line",
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>

          {submitResult && (
            <div className={`tdp-result${submitResult.ok ? " tdp-result--ok" : " tdp-result--err"}`}>
              {submitResult.message}
            </div>
          )}

          <div className="tdp-actions">
            <button
              className="tdp-submit-btn"
              onClick={handleSubmit}
              disabled={submitting || judging}
            >
              <FaPlay />
              {submitting ? "Submitting…" : judging ? "Judging…" : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile tab bar (≤ 880 px) ── */}
      <div className="tdp-mobile-bar">
        <button
          className={`tdp-mobile-tab${mobileTab === "problem" ? " tdp-mobile-tab--active" : ""}`}
          onClick={() => setMobileTab("problem")}
        >
          <FaAlignLeft /> Problem
        </button>
        <button
          className={`tdp-mobile-tab${mobileTab === "code" ? " tdp-mobile-tab--active" : ""}`}
          onClick={() => setMobileTab("code")}
        >
          <FaPlay /> Code
        </button>
      </div>
    </div>
  );
}
