import './Lessons.css';
import DropDownProfile from '../DropDownProfile/DropDownProfile';
import SessionContainer from "../SessionContainer/SessionContainer";
import { FaUser, FaLaptopCode, FaBook } from 'react-icons/fa';
import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/algo-logo.png';

  const sessions = [
    "Introduction to Algorithms",
    "Sorting Techniques",
    "Graph Theory Basics",
    "Dynamic Programming",
  ];




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
        <img
          src={logo}
          alt="Logo"
          className="algo-logo"
        />
        <div className="user-menu" ref={menuRef}>
          <FaUser
            className="user-menu-button text-3xl cursor-pointer"
            onClick={() => setOpen(!open)}
          />
          <DropDownProfile isActive={open} />
        </div>
      </header>

    <div className="sessions-wrapper">
      {sessions.map((topic) => (
        <SessionContainer key={topic} topic={topic} />
      ))}
    </div>
    </div>
  );

}