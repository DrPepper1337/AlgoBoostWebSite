import AnimatedCodeBackground from './components/CodeAnimate/AnimatedCodeBackground';
import { useNavigate } from 'react-router-dom';
import './styles/Home.css';
import Tilt from "./components/TiltEffect/Tilt";
import RevealOnScroll from "./components/TextReveal/RevealOnScroll";
import "./components/TextReveal/Reveal.css";
import "./components/TiltEffect/Tilt.css";
import OfferElement from "./components/OfferElement/OfferElement";
import './components/OfferElement/Offer.css';

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
            <button className="menu-btn" id="become-a-member" onClick={() => window.open('https://www.yourunion.net/activities/societies/explore/algoboostsociety')}>
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

        <RevealOnScroll as="section" id="about" threshold={0.5} rootMargin="0px 0px -10% 0px">
          <div className="about-text reveal" data-sr="up" style={{ "--sr-order": 0, "--sr-dur": "2s" }}>
            <h1 className="reveal" data-sr="up" style={{ "--sr-order": 0 }}>Who we are</h1>
            <h3 className="reveal" data-sr="up" style={{ "--sr-order": 1 }}>And what we usually do</h3>
            <p className="reveal" data-sr="up" style={{ "--sr-order": 2 }}>
              And here is some body copy. Modi qui dero offici- et quati te moluptatem volorrorum reritatio et que non cor. Ibus utatemporum Aximinctecto quiscie nimodio rrorisciam, sitati am, officienis re volluptae dunt, istempelis ne vellitius volorep.
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
              text="Really good materials you will definitely use every day"
              order={2}
            />
            <OfferElement
              iconName="up"
              text="Weekly sessions to guide you through the process"
              order={3}
            />
            <OfferElement
              iconName="user"
              text="Platform for our members with materials, and practice questions"
              order={4}
            />
            <OfferElement
              iconName="heart"
              text="Community and occasional snacks. when we have the money."
              order={5}
            />
          </div>
        </RevealOnScroll>

        <div style={{ position: 'relative' }}>
          {/* <div className="ombre-top"></div> */}
          <div id="background"><AnimatedCodeBackground /></div>
          {/* <div className="ombre-bottom"></div> */}
        </div>

        {/* <section id="schedule" className="section">
          <h2>Schedule</h2>
          <p><strong>DSA Talks:</strong> Mondays 5–6 PM</p>
          <p><strong>Problem-Solving:</strong> Fridays 5–6 PM</p>
        </section>

        <section id="resources" className="section">
          <h2>Resources</h2>
          <p>
            YAP YAP YAP
          </p>
        </section> */}
      </>
    </div >
  );
}
