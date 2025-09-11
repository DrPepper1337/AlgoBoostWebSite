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
import EventsCarouselMobile from './components/EventsCarousel/EventsCarouselMobile';
import DocElement from './components/DocElement/DocElement';
import { useMediaQuery } from 'react-responsive';

export default function Home() {
  const isMobile = useMediaQuery({
  maxWidth: 1024,
  orientation: 'portrait',
});

  console.log('Current window width:', window.innerWidth, 'isMobile:', isMobile);

  return (
    <div className="home-wrapper">
      <>
        <section id="top">
          <div className="square-wrapper">
            {!isMobile ? <Tilt className="square" maxTilt={10} perspective={800}>
              <p>Want to get better at coding challenges and ace that technical interview? You are in the right place!
                We are here to help you succeed through workshops, tutorials, mock interviews and hackathons.
              </p>
            </Tilt> : <div className="square-wrapper-mobile"> <div className="square">
              <p>Want to get better at coding challenges and ace that technical interview? You are in the right place!
              </p> </div>
            </div>
            }
          </div>
          <img src="/square-logo.svg" alt="AlgoBoost Logo" className="big-logo" />
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
            {!isMobile ? <Tilt id="logo-tilt" className="uni-logo" maxTilt={10} perspective={800}>
              <img src="/uni-logo.svg" alt="University Logo" />
            </Tilt> : <img src="/uni-logo.svg" alt="University Logo" className="uni-logo" />}
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
          {isMobile ? <EventsCarouselMobile /> : <EventsCarousel />}

        </section>

        <RevealOnScroll as="section" id="documents" className="section"
          threshold={0.4}
          rootMargin="0px 0px -10% 0px"
          sectionFirst
          sectionDur={1000}
          sectionDir="up">
            {isMobile && (<h1 className="reveal" data-sr="up" style={{ textAlign: 'center', marginBottom: '2rem', color: '#eaeaea', "--sr-order": 0 }}>Documents</h1>)}
            {!isMobile && (<h1 className="reveal" data-sr="up" style={{ textAlign: 'center', marginBottom: '2rem', color: '#eaeaea', "--sr-order": 0 }}>Our Documents</h1>)}
          <div className="docs-container">
            {isMobile && (
              <DocElement
                iconName="sponsorship"
                title="Sponsorship Proposal"
                text="Learn about partnership opportunities with AlgoBoost Society."
                document="sponsorship"
              />
            )}
            {isMobile && (
              <DocElement
                iconName="constitution"
                title="Constitution"
                text="Learn about the governance and structure of AlgoBoost Society."
                document="constitution"
              />
            )}
            {!isMobile && (
              <DocElement
                iconName="sponsorship"
                title="Sponsorship Proposal"
                text="Click to download our sponsorship proposal and learn about partnership opportunities with AlgoBoost Society."
                document="sponsorship"
              />)}
            {!isMobile && (
              <DocElement
                iconName="constitution"
                title="Constitution"
                text="Click to download the official AlgoBoost Society constitution and learn about our structure and governance."
                document="constitution"
              />
            )}
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
