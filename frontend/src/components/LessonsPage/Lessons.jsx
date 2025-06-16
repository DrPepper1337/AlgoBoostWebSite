import './Lessons.css';
import { FaLaptopCode, FaBook } from 'react-icons/fa';

const topics = [
  { title: 'Topic 1' },
  { title: 'Topic 2' },
];

const lectures = [
  { title: 'Theory 1' },
  { title: 'Theory 2' },

];

const practices = [
  { title: 'Practice 1' },
  { title: 'Practice 2' },

];

const sessions = topics.map((lec, i) => ({
  lecture: lec.title,
  practice: practices[i]?.title,
}));

const Lessons = () => (
  <div className="lessons-wrapper">
    {sessions.map((sess, idx) => (
      <div key={idx} className="session-container">
        <h2 className="session-title">{sess.lecture}</h2>
        <div className="session-buttons">
          <button className="session-btn theory">
            <FaBook className="btn-icon" /> Theory
          </button>
          <button className="session-btn practice">
            <FaLaptopCode className="btn-icon" /> Practice
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default Lessons;
