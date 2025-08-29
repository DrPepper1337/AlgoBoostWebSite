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
import OfferIcon from "./components/LottieIcon/Lottie";
import { useState } from "react";
import sponsorshipPDF from './assets/documents/sponsorship_proposal.pdf';
import constitutionPDF from './assets/documents/Constitution of AlgoBoost Society.pdf';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const downloadSponsorshipProposal = () => {
    const link = document.createElement('a');
    link.href = sponsorshipPDF;
    link.download = 'AlgoBoost_Sponsorship_Proposal.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadConstitution = () => {
    const link = document.createElement('a');
    link.href = constitutionPDF;
    link.download = 'AlgoBoost_Society_Constitution.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <p>Want to get better at coding challenges and ace that technical interview? You are in the right place!
                We are here to help you succeed through workshops, tutorials, mock interviews and hackathons.
              </p>
            </Tilt>
          </div>
          <img src="../public/square-logo.svg" alt="AlgoBoost Logo" className="big-logo" />
        </section>

        <RevealOnScroll as="section" id="about" threshold={0.5} rootMargin="0px 0px -10% 0px">
          <div className="about-text reveal" data-sr="up" style={{ "--sr-order": 0, "--sr-dur": "2s" }}>
            <h1 className="reveal" data-sr="up" style={{ "--sr-order": 0 }}>Who we are</h1>
            <h3 className="reveal" data-sr="up" style={{ "--sr-order": 1 }}>And what we usually do</h3>
            <p className="reveal" data-sr="up" style={{ "--sr-order": 2 }}>
              AlgoBoost helps you master data structures and algorithms while preparing for technical interviews in a supportive and collaborative environment.
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

          <section id="events" className="section">
            <h1 style={{ textAlign: 'center', fontWeight: '700', marginBottom: '2rem', color: '#eaeaea' }}>Our Events</h1>
            <EventsCarousel />
          </section>

          <section id="documents" className="section" >
            <h1 style={{ textAlign: 'center', fontWeight: '700', marginBottom: '2rem', color: '#eaeaea' }}>Our Documents</h1>
            <div className="docs-container">
              <div className="doc-card"
                onClick={downloadSponsorshipProposal}
                onMouseEnter={() => { setIsHovered(true); }}
                onMouseLeave={() => { setIsHovered(false); }}>
                <div className="doc-icon-wrap">
                  <OfferIcon id="sponsorship" iconName={"sponsorship"} isHovered={isHovered} />
                </div>
                  <h5>Sponsorship Proposal</h5>
                  <p>Click to download our sponsorship proposal and learn about partnership opportunities with AlgoBoost Society.</p>
              </div>
              <div className="doc-card"
                onClick={downloadConstitution}
                onMouseEnter={() => { setIsHovered(true); }}
                onMouseLeave={() => { setIsHovered(false); }}>
                <div className="doc-icon-wrap">
                  <OfferIcon id="constitution" iconName={"constitution"} isHovered={isHovered} />
                </div>
                <h5>Constitution</h5>
                <p>Click to download the official AlgoBoost Society constitution and learn about our structure and governance.</p>
              </div>
            </div>
          </section>

          <section id="footer" className="section">
            <p>© 2025 AlgoBoost Society. All rights reserved.</p>
            <p>Contact us: <a href="mailto:algoboost@st-andrews.ac.uk">algoboost@st-andrews.ac.uk</a></p>
          </section>

        </>
    </div>
  );
}
