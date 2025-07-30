import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginRegister from './components/LoginRegister/LoginRegister';
import LessonsPage from './components/LessonsPage/Lessons';
import TasksPage from './components/TasksPage/TasksPage';
import VerifyPage from './components/LoginRegister/VerifyPage';
import PasswordReset from './components/LoginRegister/PasswordReset';
import PasswordResetSuccess from './components/LoginRegister/PasswordResetSuccess';
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
         <Route path="/reset-password" element={<PasswordReset/>} />
         {/* <Route path="/reset-password-success" element={<VerifyPage/>} /> */}

  </Routes>
</>
  )
}

export default App;
