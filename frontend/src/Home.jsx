import AnimatedCodeBackground from './components/AnimatedCodeBackground';
import { useNavigate } from 'react-router-dom';
import Login from './components/Login/Login';
import './App.css';
export default function Home() {

  const navigate = useNavigate();
  return (
    <>
      <header>
        <div className="menu-container">
          <svg className="menu-button" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round">
            <line className="menu-line" x1="4" y1="12" x2="20" y2="12" />
            <line className="menu-line" x1="4" y1="6" x2="20" y2="6" />
            <line className="menu-line" x1="4" y1="18" x2="20" y2="18" />
          </svg>

          <nav className="navbar">
            <a className="navbarLink" href="#">About Us</a>
            <a className="navbarLink" href="#">Lectures</a>
            <a className="navbarLink" href="#">Schedule</a>
            <a className="navbarLink" href="#">Resources</a>
          </nav>
        </div>
          <button className="login" onClick={() => navigate('/login')}>
          Login
          </button>
      </header>
      <hr className="border-line" />

      <div style={{ position: 'relative' }}>
        <div className="ombre-top"></div>
        <div id="background"><AnimatedCodeBackground /></div>
        <div className="a-container">
          <p className="glitch">ALGOBOOST</p>
        </div>
        <div className="ombre-bottom"></div>
      </div>

      <hr className="border-line" />
    </>
  );
}

