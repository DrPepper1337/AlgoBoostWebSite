import './Lessons.css';
import { FaLaptopCode } from 'react-icons/fa';

const lessons = [
  { type: 'Lecture', title: 'Lecture 1' },
  { type: 'Practice', title: 'Practice 1' },
];

const Lessons = () => {
  return (
    <div className="lessons-wrapper">
      <div className="lessons-page">
        <header className="lessons-header">
          <h1>
            <FaLaptopCode className="header-icon" />Lessons
          </h1>
        </header>

        <main className="lessons-content">
          <ul className="lessons-list">
            {lessons.map((lesson, index) => (
              <li key={index} className="lesson-item">
                {lesson.title}
              </li>
            ))}
          </ul>
        </main>
      </div>

    </div>
  );
};

export default Lessons;