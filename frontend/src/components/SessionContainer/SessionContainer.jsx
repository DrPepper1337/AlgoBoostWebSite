import React, { useState } from 'react';
import { FaBookmark, FaBook } from 'react-icons/fa';
import './SessionContainer.css';

export default function SessionContainer({ topic, onLearnClick }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="session-container">
      <div className="image-placeholder" />

      <div className="content">
        <h3 className="session-title">{topic}</h3>

        <button className="session-btn" onClick={onLearnClick}>
          <FaBook className="btn-icon" />
          Learn More
        </button>
      </div>

      <FaBookmark
        className={`save-icon ${saved ? 'saved' : ''}`}
        onClick={() => setSaved(!saved)}
        title={saved ? 'Saved' : 'Save for later'}
      />
    </div>
  );
}
