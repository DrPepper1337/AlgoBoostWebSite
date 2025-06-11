import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login/Login';
import LessonsPage from './components/LessonsPage/Lessons';

import './App.css';
import Home from './Home';


function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Home />} />
       <Route path="/login" element={<Login />} />
        <Route path="/lessons" element={<LessonsPage />} />
  </Routes>
</>
  )
}

export default App;
