import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FaUser } from "react-icons/fa";
import "./Header.css";
import "../../styles/Global.css";
import DropDownProfile from "../DropDownProfile/DropDownProfile";
import { useMediaQuery } from "react-responsive";

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  const isHomePage = location.pathname === "/";
  const isMobile = useMediaQuery({ maxWidth: 992 });

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpen(false);
  }, [location]);

  // Add/remove blur effect to body when menu opens/closes
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [isMenuOpen]);

  if (location.pathname === "/verify") {
    return null;
  }

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  // Check if user is admin
  const isAdmin = isAuthenticated && user?.role === "admin";

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="logo-container">
          <img src="/logo-no-text.svg" alt="AlgoBoost Logo" className="logo" />
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className={`hamburger ${isMenuOpen ? "open" : ""}`}></div>
        </button>

        {/* Mobile Navigation Overlay */}
        <div className={`nav-container ${isMenuOpen ? "open" : ""}`}>
          {/* Background blur element */}
          <div className="blur-backdrop"></div>
          <nav className="navbar">
            {!isAuthenticated && !(location.pathname === "/register") && (
              <a
                className="navbarLink"
                id="become-a-member"
                onClick={() => {
                  window.open(
                    "https://www.yourunion.net/activities/societies/explore/algoboostsociety",
                  );
                  handleLinkClick();
                }}
              >
                Become a Member
              </a>
            )}

              {/* Login/Register links for mobile menu */}
            {!isAuthenticated && isMobile && (
              <>
                <button
                  className="navbarLink"
                  onClick={() => {
                    navigate("/login");
                    handleLinkClick();
                  }}
                >
                  Login
                </button>
                <button
                  className="navbarLink"
                  onClick={() => {
                    navigate("/login?mode=register");
                    handleLinkClick();
                  }}
                >
                  Register
                </button>
              </>
            )}


            {isHomePage && !isAdmin && (
              <a
                className="navbarLink"
                href="/#about"
                onClick={handleLinkClick}
              >
                About us
              </a>
            )}
            {isHomePage && !isAdmin && (
              <a
                className="navbarLink"
                href="/#offer"
                onClick={handleLinkClick}
              >
                What we offer
              </a>
            )}
            {isHomePage && !isAdmin && (
              <a
                className="navbarLink"
                href="/#gallery"
                onClick={handleLinkClick}
              >
                Gallery
              </a>
            )}
            {isHomePage && !isAdmin && (
              <a
                className="navbarLink"
                href="/#documents"
                onClick={handleLinkClick}
              >
                Documents
              </a>
            )}
            {!isHomePage && !isAuthenticated && (
              <button
                className="navbarLink"
                onClick={() => {
                  navigate("/");
                  handleLinkClick();
                }}
              >
                Welcome Page
              </button>
            )}

            {isAuthenticated && !isHomePage && (
              <button
                className="navbarLink"
                onClick={() => {
                  navigate("/");
                  handleLinkClick();
                }}
              >
                Welcome Page
              </button>
            )}
            {isAuthenticated && !(location.pathname === "/memberHub") && (
              <button
                className="navbarLink"
                onClick={() => {
                  navigate("/memberHub");
                  handleLinkClick();
                }}
              >
                Member Hub
              </button>
            )}
            {isAuthenticated && !(location.pathname === "/lessons") && (
              <button
                className="navbarLink"
                onClick={() => {
                  navigate("/lessons");
                  handleLinkClick();
                }}
              >
                Lessons
              </button>
            )}
            {isAdmin && (
              <>
                {!(location.pathname === "/manageUsers") && (
                  <button
                    className="navbarLink admin-link"
                    onClick={() => {
                      navigate("/manageUsers");
                      handleLinkClick();
                    }}
                  >
                    Manage Users
                  </button>
                )}
                {!(location.pathname === "/manageLessons") && (
                  <button
                    className="navbarLink admin-link"
                    onClick={() => {
                      navigate("/manageLessons");
                      handleLinkClick();
                    }}
                  >
                    Manage Lessons
                  </button>
                )}
              </>
            )}
          </nav>
        </div>

        <div className="right-controls">
          {!isAuthenticated ? (
            <div className="menu-buttons">
              <button
                className="menu-btn"
                id="login"
                onClick={() => {
                  navigate("/login");
                  handleLinkClick();
                }}
              >
                Login
              </button>
              <button
                className="menu-btn"
                id="register"
                onClick={() => {
                  navigate("/login?mode=register");
                  handleLinkClick();
                }}
              >
                Register
              </button>
              <button
                className="menu-btn"
                id="become-a-member"
                onClick={() => {
                  window.open(
                    "https://www.yourunion.net/activities/societies/explore/algoboostsociety",
                  );
                  handleLinkClick();
                }}
              >
                Become a Member
              </button>
            </div>
          ) : (
            <div className="user-menu" ref={menuRef}>
              <FaUser
                className="user-menu-button"
                onClick={() => setOpen((prev) => !prev)}
              />
              {open && <DropDownProfile isActive={open} />}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
