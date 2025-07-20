import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginRegister from './components/LoginRegister/LoginRegister';
import LessonsPage from './components/LessonsPage/Lessons';
import TasksPage from './components/TasksPage/TasksPage';
import VerifyPage from './components/LoginRegister/VerifyPage';

import './App.css';
import Home from './Home';


function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Home />} />
       <Route path="/login" element={<LoginRegister />} />
        <Route path="/lessons" element={<LessonsPage />} />
         <Route path="/tasks/:lessonId" element={<TasksPage />} />
         <Route path="/verify" element={<VerifyPage />} />

  </Routes>
</>
  )
}

export default App;
