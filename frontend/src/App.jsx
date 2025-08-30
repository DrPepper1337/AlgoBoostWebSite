import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginRegister from './components/LoginRegister/LoginRegister';
import LessonsPage from './components/LessonsPage/Lessons';
import TasksPage from './components/TasksPage/TasksPage';
import VerifyPage from './components/LoginRegister/VerifyPage';
import PasswordReset from './components/LoginRegister/PasswordReset';
import PasswordResetSuccess from './components/LoginRegister/PasswordResetSuccess';
import MemberHub from './components/MemberHub/MemberHub';
import UserProfile from './components/UserProfile/UserProfile';
import './styles/App.css';
import Home from './Home';


function App() {

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/reset-password" element={<PasswordReset/>} />

        {/* Protected Routes */}
        <Route path="/memberHub" element={
          <ProtectedRoute>
            <MemberHub />
          </ProtectedRoute>
        } />
          <Route path="/userProfile" element={
          <ProtectedRoute>
            <UserProfile/>
          </ProtectedRoute>
        } />
        <Route path="/lessons" element={
          <ProtectedRoute>
            <LessonsPage />
          </ProtectedRoute>
        } />
        <Route path="/tasks/:lessonId" element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App;
