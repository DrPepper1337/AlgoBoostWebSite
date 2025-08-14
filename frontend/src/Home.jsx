import AnimatedCodeBackground from './components/AnimatedCodeBackground';
import { useNavigate } from 'react-router-dom';
import './styles/Home.css';
export default function Home() {

  const navigate = useNavigate();
  return (


    <div className="home-wrapper">
    <>
      <header>
        <div className="menu-container">
          <svg className="menu-button" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round">
            <line className="menu-line" x1="4" y1="12" x2="20" y2="12" />
            <line className="menu-line" x1="4" y1="6" x2="20" y2="6" />
            <line className="menu-line" x1="4" y1="18" x2="20" y2="18" />
          </svg>

          <nav className="navbar">
            <a className="navbarLink" href="#about">About Us</a>
            <a className="navbarLink" href="#schedule">Schedule</a>
            <a className="navbarLink" href="#resources">Resources</a>
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
  <div className="spacer" />

  <section id="about" className="section">
    <h2>About Us</h2>
    <p>
      The AlgoBoost Society (ABS) is a community devoted to career readiness, problem-solving, and technical excellence.
      We strive to provide a supportive environment for students to hone their coding skills, master data structures &
      algorithms, and prepare for technical interviews.
    </p>
    <p>
      Whether you’re aiming for a tech internship, a software engineering role, or simply love tackling coding challenges,
      AlgoBoost is the place for you!
    </p>
    <p>
      Our society offers a mix of lecture-style sessions, interactive problem-solving tutorials, and mock interviews,
      helping students build both technical proficiency and strategic thinking.
    </p>
  </section>


  <section id="schedule" className="section">
    <h2>Schedule</h2>
    <p><strong>DSA Talks:</strong> Mondays 5–6 PM</p>
    <p><strong>Problem-Solving:</strong> Fridays 5–6 PM</p>
  </section>

  <section id="resources" className="section">
    <h2>Resources</h2>
    <p>
    YAP YAP YAP
    </p>
  </section>
</>
    </div>
  );
}
