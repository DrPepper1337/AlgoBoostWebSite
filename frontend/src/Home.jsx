import React, { useState } from 'react';
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
import DocElement from './components/DocElement/DocElement';


export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const [isMenuOpen, setMenuOpen] = useState(false);

  const handleLinkClick = () => {
      setMenuOpen(false); // Close menu when a link is clicked
  };

  const downloadSponsorshipProposal = () => {
    const link = document.createElement('a');
    link.href = sponsorshipPDF;
    link.download = 'AlgoBoost_Sponsorship_Proposal.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // const downloadConstitution = () => {
  //   const link = document.createElement('a');
  //   link.href = constitutionPDF;
  //   link.download = 'AlgoBoost_Society_Constitution.pdf';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  return (
    <div className="home-wrapper">
      <>
        <header className="site-header">
            <div className="logo-container">
                <img src="/logo-no-text.svg" alt="AlgoBoost Logo" className="logo" />
            </div>

            <button className="menu-toggle" onClick={() => setMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}></div>
            </button>

            {/* This is the container that is toggled on mobile */}
            <div className={`nav-container ${isMenuOpen ? 'open' : ''}`}>
                
                <nav className="navbar">
                    <a className="navbarLink" href="#about" onClick={handleLinkClick}>About us</a>
                    <a className="navbarLink" href="#offer" onClick={handleLinkClick}>What we offer</a>
                    <a className="navbarLink" href="#events" onClick={handleLinkClick}>Events</a>
                    <a className="navbarLink" href="#documents" onClick={handleLinkClick}>Documents</a>
                </nav>

                <div className="menu-buttons">
                    {!isAuthenticated ? (
                        <>
                            <button className="menu-btn" id="login" onClick={() => { navigate('/login'); handleLinkClick(); }}>
                                Login
                            </button>
                            <button className="menu-btn" id="register" onClick={() => { navigate('/login?mode=register'); handleLinkClick(); }}>
                                Register
                            </button>
                            <button className="menu-btn" id="become-a-member" onClick={() => { window.open('https://www.yourunion.net/activities/societies/explore/algoboostsociety'); handleLinkClick(); }}>
                                Become a Member
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="menu-btn" onClick={() => { navigate('/memberHub'); handleLinkClick(); }}>
                                Member Hub
                            </button>
                            <button className="menu-btn" onClick={() => { navigate('/lessons'); handleLinkClick(); }}>
                                Lessons
                            </button>
                            <button className="menu-btn" id="logout" onClick={() => {
                                logout();
                                navigate('/');
                                handleLinkClick();
                            }}>
                                Logout
                            </button>
                        </>
                    )}
                </div>
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
          <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#eaeaea' }}>Our Events</h1>
          <EventsCarousel />
        </section>

        <RevealOnScroll as="section" id="documents" className="section"
          threshold={0.4}
          rootMargin="0px 0px -10% 0px"
          sectionFirst
          sectionDur={1000}
          sectionDir="up">
          <h1 className="reveal" data-sr="up" style={{ textAlign: 'center', marginBottom: '2rem', color: '#eaeaea', "--sr-order": 0 }}>Our Documents</h1>
          <div className="docs-container">
            <DocElement
              iconName="sponsorship"
              title="Sponsorship Proposal"
              text="Click to download our sponsorship proposal and learn about partnership opportunities with AlgoBoost Society."
              document="sponsorship"
            />
            <DocElement
              iconName="constitution"
              title="Constitution"
              text="Click to download the official AlgoBoost Society constitution and learn about our structure and governance."
              document="constitution"
            />
          </div>
        </RevealOnScroll>

        <section id="footer" className="section">
          <div className='footer-links'>
            <a href="https://linktr.ee/algoboost">LinkTree</a>
            <a href="https://www.instagram.com/algoboost_usta?igsh=MXFrYXFxNmRhbWhhMw%3D%3D&utm_source=qr">Instagram</a>
            <a href="https://www.linkedin.com/company/algoboost-society/?viewAsMember=true">LinkedIn</a>
            <a href="mailto:algoboost@st-andrews.ac.uk">algoboost@st-andrews.ac.uk</a>
          </div>
          <div className="footer-copyright">
            <p>&copy; 2025 St Andrews Algoboost Society. All Rights Reserved.</p>
          </div>
          
        </section>

      </>
    </div>
  );
}
