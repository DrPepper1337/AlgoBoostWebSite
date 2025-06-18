import './Lessons.css';
import DropDownProfile from '../DropDownProfile/DropDownProfile';
import { FaUser, FaLaptopCode, FaBook } from 'react-icons/fa';
import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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


export default function Lessons() {

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

    const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (

  <div className="lessons-wrapper">

     <header className="header">
        <button className="login" onClick={() => navigate('/')}>
      Logout
    </button>
        <div className="user-menu" ref={menuRef}>
           <FaUser
            className="user-menu-button text-3xl cursor-pointer"
            onClick={() => setOpen(!open)}
          />
          {open && <DropDownProfile />}
    </div>
  </header>

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

}