import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./MdEditor.css";

export default function MdEditor({ value, onChange, placeholder = "Write in **Markdown**…", rows = 5 }) {
  const [tab, setTab] = useState("write");

  return (
    <div className="mde-root">
      <div className="mde-tabs">
        <button
          type="button"
          className={`mde-tab${tab === "write" ? " mde-tab--active" : ""}`}
          onClick={() => setTab("write")}
        >Write</button>
        <button
          type="button"
          className={`mde-tab${tab === "preview" ? " mde-tab--active" : ""}`}
          onClick={() => setTab("preview")}
        >Preview</button>
      </div>

      {tab === "write" ? (
        <textarea
          className="mde-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <div className="mde-preview">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <span className="mde-preview-empty">Nothing to preview.</span>
          )}
        </div>
      )}
    </div>
  );
}
