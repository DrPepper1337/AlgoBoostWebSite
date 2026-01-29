import { Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute';
import LoginRegister from './components/LoginRegister/LoginRegister';
import LessonsPage from './components/LessonsPage/Lessons';
import TasksPageTemp from './components/TasksPage/TasksPageTemp';
import VerifyPage from './components/LoginRegister/VerifyPage';
import PasswordReset from './components/LoginRegister/PasswordReset';
import PasswordResetSuccess from './components/LoginRegister/PasswordResetSuccess';
import MemberHub from './components/MemberHub/MemberHub';
import UserProfile from './components/UserProfile/UserProfile';
import ManageUsers from './components/ManageUsers/ManageUsers';
import ManageLessons from './components/ManageLessons/ManageLessons';
import './styles/App.css';
import Home from './Home';
import Header from './components/HeaderNavBar/Header';
import SettingsPage from './components/SettingsPage/SettingsPage';

function MainLayout() {
  return (
    <>
      <Header />
      <main className="main-content">
        <Outlet /> {/* Child routes will render here */}
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/reset-password" element={<PasswordReset />} />

          {/* Protected Routes */}
          <Route path="/memberHub" element={
            <ProtectedRoute>
              <MemberHub />
            </ProtectedRoute>
          } />
          <Route path="/userProfile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/lessons" element={
            <ProtectedRoute>
              <LessonsPage />
            </ProtectedRoute>
          } />
          <Route path="/tasks/:lessonId" element={
            <ProtectedRoute>
              <TasksPageTemp />
            </ProtectedRoute>
          } />
        </Route>

        {/* Admin Routes */}
        <Route path="/manageLessons" element={
          <AdminRoute>
            <ManageLessons />
          </AdminRoute>
        } />
        <Route path="/manageUsers" element={
          <AdminRoute>
            <ManageUsers />
          </AdminRoute>
        } />

      </Routes>
    </AuthProvider>
  )
}

export default App;
