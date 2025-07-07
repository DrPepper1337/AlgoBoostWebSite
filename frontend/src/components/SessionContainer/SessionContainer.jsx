import React, { useState } from 'react';
import { FaBookmark, FaBook, FaLaptopCode } from 'react-icons/fa';
import './SessionContainer.css'

export default function SessionContainer({ topic }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="session-container">
      <div className="image-placeholder" />

      <div className="content">
        <h3 className="session-title">{topic}</h3>

        <div className="session-buttons">
          <button className="session-btn">
            <FaBook className="btn-icon"></FaBook>
            Theory</button>
          <button className="session-btn">
            <FaLaptopCode className="btn-icon"></FaLaptopCode>
            Practice</button>
        </div>
      </div>

      <FaBookmark
        className={`save-icon ${saved ? "saved" : ""}`}
        onClick={() => setSaved(!saved)}
        title={saved ? "Saved" : "Save for later"}
      />
    </div>
  );
}