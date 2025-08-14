import AnimatedCodeBackground from './components/AnimatedCodeBackground';
import { useNavigate } from 'react-router-dom';
import './styles/Home.css';
import Tilt from "./components/Tilt";
export default function Home() {

  const navigate = useNavigate();
  return (
    <div className="home-wrapper">
      <>
        <header>
          <div className="logo-container">
            <img src="../public/logo-no-text.svg" alt="AlgoBoost Logo" className="logo" />
          </div>
          <nav className="navbar">
            <a className="navbarLink" href="#about">About us</a>
            <a className="navbarLink" href="#offer">What we offer</a>
            <a className="navbarLink" href="#events">Events</a>
            <a className="navbarLink" href="#documents">Documents</a>
            <a className="navbarLink" href="#">Partnership</a>
          </nav>
          <div className="menu-buttons">
            <button className="menu-btn" id="login" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="menu-btn" id="register" onClick={() => navigate('/register')}>
              Register
            </button>
            <button className="menu-btn" id="become-a-member" onClick={() => navigate('https://www.yourunion.net/activities/societies/explore/algoboostsociety')}>
              Become a Member
            </button>
          </div>
        </header>

        <section id="top">
          <div className="square-wrapper">
            <Tilt className="square" maxTilt={10} perspective={800}>
              <p>Some really good tagline and
                small into, to summarise the entire
                landing page. lorem ipsum dhdhd jh
                hjdhjs sjdjsnd sjdjhshd ksjdks skjdk
                shdsjd js wkwoq th most erciful thing</p>
            </Tilt>
          </div>
          <img src="../public/square-logo.svg" alt="AlgoBoost Logo" className="big-logo" />

        </section>

        <div style={{ position: 'relative' }}>
          <div className="ombre-top"></div>
          <div id="background"><AnimatedCodeBackground /></div>
          <div className="a-container">
            <p className="glitch">ALGOBOOST</p>
          </div>
          <div className="ombre-bottom"></div>
        </div>

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
    </div >
  );
}
