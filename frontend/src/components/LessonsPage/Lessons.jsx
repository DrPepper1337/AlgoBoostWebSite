import './Lessons.css';
import DropDownProfile from '../DropDownProfile/DropDownProfile';
import SessionContainer from "../SessionContainer/SessionContainer";
import { FaUser, FaLaptopCode, FaBook } from 'react-icons/fa';
import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Global.css';

export default function Lessons() {

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [lessons, setLessons] = useState([]);

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


  useEffect(() => {
    // getting lessons from the backend
    const fetchLessons = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No auth token found');
          return;
        }

        const res = await axios.get('http://localhost:8080/api/lessons', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.data?.success || !Array.isArray(res.data.data)) {
          console.error('Unexpected response structure:', res.data);
          return;
        }

      const lessonsData = res.data.data;
        setLessons(lessonsData);
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
      }
    };

    fetchLessons();
  }, []);


  return (

    <div className="lessons-wrapper">

      <header className="header">
            <div className="logo-container">
            <img src="../public/logo-no-text.svg" alt="AlgoBoost Logo" className="logo" />
          </div>
        <div className="user-menu" ref={menuRef}>
          <FaUser
            className="user-menu-button"
            onClick={() => setOpen(!open)}
          />
         <DropDownProfile isActive={open} />
        </div>
      </header>

      <h2>Coming Soon!</h2>
      
      {/*for now */}

    {/* <div className="sessions-wrapper">
  {lessons.map((lesson) => (
    <SessionContainer
      key={lesson.id}
      topic={lesson.title}
      onLearnClick={() => navigate(`/tasks/${lesson.id}`, { state: { lesson } })}
    />
  ))}
</div> */}
    </div>
  );

}