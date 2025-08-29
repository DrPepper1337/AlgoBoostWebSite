import AnimatedCodeBackground from './components/CodeAnimate/AnimatedCodeBackground';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './styles/Home.css';
import Tilt from "./components/TiltEffect/Tilt";
import RevealOnScroll from "./components/TextReveal/RevealOnScroll";
import "./components/TextReveal/Reveal.css";
import "./components/TiltEffect/Tilt.css";
import OfferElement from "./components/OfferElement/OfferElement";
import './components/OfferElement/Offer.css';
import EventsCarousel from './components/EventsCarousel/EventsCarousel';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  return (
    <div className="home-wrapper">
      <>
        <header>
          <div className="logo-container">
            <img src="../public/logo-no-text.svg" alt="AlgoBoost Logo" className="logo" />
          </div>
          <nav className="navbar">
            <a className="navbarLink" href="#about">About us</a>
            <>
              <a className="navbarLink" href="#offer">What we offer</a>
              <a className="navbarLink" href="#events">Events</a>
              <a className="navbarLink" href="#documents">Documents</a>
              {/* <a className="navbarLink" href="#partnership">Partnership</a> */}
            </>

          </nav>
          <div className="menu-buttons">
            {!isAuthenticated ? (
              <>
                <button className="menu-btn" id="login" onClick={() => navigate('/login')}>
                  Login
                </button>
                <button className="menu-btn" id="register" onClick={() => navigate('/login?mode=register')}>
                  Register
                </button>
                <button className="menu-btn" id="become-a-member" onClick={() => window.open('https://www.yourunion.net/activities/societies/explore/algoboostsociety')}>
                  Become a Member
                </button>
              </>
            ) : (
              <>
                <button className="menu-btn" onClick={() => navigate('/memberHub')}>
                  Member Hub
                </button>
                <button className="menu-btn" onClick={() => navigate('/lessons')}>
                  Lessons
                </button>
                <button className="menu-btn" id="logout" onClick={() => {
                  logout();
                  navigate('/');
                }}>
                  Logout
                </button>
              </>
            )}
          </div>
        </header>

        <section id="top">
          <div className="square-wrapper">
            <Tilt className="square" maxTilt={10} perspective={800}>
              <p>Want to get better at coding challenges and ace that technical interview?<br/><br/>
              You are in the right place!</p>
            </Tilt>
          </div>
          <img src="../public/square-logo.svg" alt="AlgoBoost Logo" className="big-logo" />
        </section>

        <RevealOnScroll as="section" id="about" threshold={0.5} rootMargin="0px 0px -10% 0px">
          <div className="about-text reveal" data-sr="up" style={{ "--sr-order": 0, "--sr-dur": "2s" }}>
            <h1 className="reveal" data-sr="up" style={{ "--sr-order": 0 }}>Who we are</h1>
            <h3 className="reveal" data-sr="up" style={{ "--sr-order": 1 }}>And what we usually do</h3>
            <p className="reveal" data-sr="up" style={{ "--sr-order": 2 }}>
              <br/>AlgoBoost helps you master data structures and algorithms while preparing for technical interviews in a supprtive and collaborative environment.<br/><br/>
              From workshops and tutorials to mock interviews and hackathons, we make sure LeetCode is never boring again!
            </p>
          </div>
          <div className="reveal" data-sr="up" style={{ "--sr-order": 3 }}>
            <Tilt id="logo-tilt" className="uni-logo" maxTilt={10} perspective={800}>
              <img src="../public/uni-logo.svg" alt="University Logo" />
            </Tilt>
          </div>
        </RevealOnScroll>

        <div style={{ position: 'relative' }}>
          {/* <div className="ombre-top"></div> */}
          <div id="background"><AnimatedCodeBackground /></div>
          {/* <div className="ombre-bottom"></div> */}
        </div>


        <RevealOnScroll
          as="section"
          id="offer"
          className="offer-section"
          threshold={0.4}
          rootMargin="0px 0px -10% 0px"
          sectionFirst
          sectionDur={1000}
          sectionDir="up"
        >
          <h1 className="offer-title reveal" data-sr="up" style={{ "--sr-order": 0 }}>
            What we offer
          </h1>
          <div className="offer-grid">
            <OfferElement
              iconName="calendar"
              text="Weekly sessions to guide you through the process"
              order={1}
            />
            <OfferElement
              iconName="book"
              text="High-quality materials you might actually use"
              order={2}
            />
            <OfferElement
              iconName="up"
              text="Space to build your algorithmic skills and confidence"
              order={3}
            />
            <OfferElement
              iconName="user"
              text="Platform with practice questions, resources, and an events timetable"
              order={4}
            />
            <OfferElement
              iconName="heart"
              text="Community and occasional snacks. Yes we are bribing you"
              order={5}
            />
          </div>
        </RevealOnScroll>

        <div style={{ position: 'relative' }}>
          {/* <div className="ombre-top"></div> */}
          <div id="background"><AnimatedCodeBackground /></div>
          {/* <div className="ombre-bottom"></div> */}
        </div>

                <>
          <section id="events" className="section">
            <h2 style={{ textAlign: 'center', fontSize: '3rem', fontWeight: '700', marginBottom: '2rem', color: '#eaeaea' }}>Our Events</h2>
            <EventsCarousel />
          </section>

          <section id="documents" className="section" >
            <h2>Documents</h2>
          </section>

          <section id="partnership" className="section" >
            <h2>Partnership</h2>
          </section>
        </>
      </>
    </div >
  );
}
