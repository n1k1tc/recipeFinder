import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaUtensils, 
  FaInfoCircle, 
  FaHistory, 
  FaHeart, 
  FaUser, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";
import "./Header.css";
import logo from "../assets/logo.png";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");

    if (token) {
      setIsLoggedIn(true);
      setUserName(name || "User");
    } else {
      setIsLoggedIn(false);
      setUserName("");
    }
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserName("");
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  const navItems = [
    { path: "/", label: "Home", icon: <FaHome /> },
    { path: "/recipes", label: "Recipes", icon: <FaUtensils /> },
    { path: "/about", label: "About", icon: <FaInfoCircle /> },
  ];

  const loggedInNavItems = [
    { path: "/recent-searches", label: "Recent Searches", icon: <FaHistory /> },
    { path: "/favorites", label: "Favorites", icon: <FaHeart className="favorite-icon" /> },
  ];

  return (
    <>
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-container">
          {/* Logo */}
          <Link to="/" className="logo-link" onClick={closeMenu}>
            <div className="logo">
              <img src={logo} alt="RecipeFinder" className="logo-img" />
              <span className="logo-text">RecipeFinder</span>
              {!isLoggedIn && <span className="guest-badge">Guest</span>}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${
                      location.pathname === item.path ? "active" : ""
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              
              {isLoggedIn && loggedInNavItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${
                      location.pathname === item.path ? "active" : ""
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Actions */}
          <div className="user-actions">
            {isLoggedIn ? (
              <div className="user-menu">
                <div className="user-info">
                  <FaUser className="user-icon" />
                  <span className="user-name">{userName}</span>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-btn">
                  Login
                </Link>
                <Link to="/signup" className="signup-btn">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <nav className={`mobile-nav ${menuOpen ? "open" : ""}`}>
        <div className="mobile-nav-header">
          {isLoggedIn ? (
            <div className="mobile-user-info">
              <FaUser />
              <span>{userName}</span>
            </div>
          ) : (
            <span>Menu</span>
          )}
        </div>
        
        <ul className="mobile-nav-list">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`mobile-nav-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
                onClick={closeMenu}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          
          {isLoggedIn && loggedInNavItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`mobile-nav-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
                onClick={closeMenu}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="mobile-auth-actions">
          {isLoggedIn ? (
            <button className="mobile-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="mobile-login-btn" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/signup" className="mobile-signup-btn" onClick={closeMenu}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
      
      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div className="mobile-overlay" onClick={closeMenu}></div>
      )}
    </>
  );
};

export default Header;