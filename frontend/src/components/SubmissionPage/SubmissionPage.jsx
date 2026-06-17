import "./SubmissionPage.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { buildApiUrl } from "../../config/api";
import { FaArrowLeft, FaClock, FaServer } from "react-icons/fa";

const STATUS_MAP = {
  0: { label: "Accepted",              cls: "sp-status--accepted" },
  1: { label: "Pending",               cls: "sp-status--pending"  },
  2: { label: "Wrong Answer",          cls: "sp-status--error"    },
  3: { label: "Time Limit Exceeded",   cls: "sp-status--error"    },
  4: { label: "Memory Limit Exceeded", cls: "sp-status--error"    },
};

const MONACO_LANG = { python: "python", cpp: "cpp", java: "java", go: "go" };

export default function SubmissionPage() {
  const { solutionId } = useParams();
  const location       = useLocation();
  const navigate       = useNavigate();
  const state          = location.state || {};

  const [solution, setSolution] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res   = await axios.get(buildApiUrl(`solutions/${solutionId}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success) setSolution(res.data.data);
        else setError("Submission not found.");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load submission.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [solutionId]);

  const goBack = () => {
    if (state.lessonId && state.taskId) {
      navigate(`/tasks/${state.lessonId}/${state.taskId}`, {
        state: { lesson: state.lesson },
      });
    } else {
      navigate(-1);
    }
  };

  const st = STATUS_MAP[solution?.status_code] ?? { label: "Unknown", cls: "sp-status--pending" };

  return (
    <div className="sp-page">
      <div className="sp-topbar">
        <button className="sp-back" onClick={goBack}>
          <FaArrowLeft />
          {state.taskTitle || "Back"}
        </button>
        <span className="sp-topbar-title">Submission #{solutionId}</span>
        <div className="sp-topbar-spacer" />
      </div>

      {loading ? (
        <div className="sp-center"><div className="sp-spinner" /></div>
      ) : error ? (
        <div className="sp-center sp-muted">{error}</div>
      ) : (
        <div className="sp-body">
          <div className="sp-header">
            <span className={`sp-status ${st.cls}`}>{st.label}</span>
            <div className="sp-meta">
              <span className="sp-badge sp-badge--lang">{solution.compiler}</span>
              {solution.time   > 0 && (
                <span className="sp-badge"><FaClock /> {solution.time.toFixed(2)}s</span>
              )}
              {solution.memory > 0 && (
                <span className="sp-badge"><FaServer /> {solution.memory.toFixed(1)} MB</span>
              )}
            </div>
          </div>

          <div className="sp-editor-wrap">
            <Editor
              height="100%"
              language={MONACO_LANG[solution.compiler] ?? "plaintext"}
              value={solution.code || ""}
              theme="vs-dark"
              options={{
                readOnly: true,
                fontSize: 14,
                fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: "line",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
