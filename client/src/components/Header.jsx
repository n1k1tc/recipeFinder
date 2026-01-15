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
  FaTimes,
  FaCrown
} from "react-icons/fa";
import "./Header.css";
import logo from "../assets/logo.png";

const ADMIN_EMAIL = "nikitapal580@gmail.com";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");

    if (token) {
      setIsLoggedIn(true);
      setUserName(name || "User");
      setUserEmail(email || "");
    } else {
      setIsLoggedIn(false);
      setUserName("");
      setUserEmail("");
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
    setUserEmail("");
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  const isAdmin = isLoggedIn && userEmail === ADMIN_EMAIL;

  // Core navigation items (always visible)
  const coreNavItems = [
    { path: "/", label: "Home", icon: <FaHome /> },
    { path: "/recipes", label: "Recipes", icon: <FaUtensils /> },
  ];

  // User-specific navigation items (only for logged-in users)
  const userNavItems = [
    { 
      path: "/recent-searches", 
      label: "Recent", 
      icon: <FaHistory />,
      fullLabel: "Recent Searches"
    },
    { 
      path: "/favorites", 
      label: "Favorites", 
      icon: <FaHeart className="favorite-icon" />,
      fullLabel: "Favorites"
    },
  ];

  // Admin navigation item
  const adminNavItem = {
    path: "/admin",
    label: "Admin",
    icon: <FaCrown className="admin-icon" />,
    fullLabel: "Admin Panel"
  };

  return (
    <>
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-container">
          {/* Logo */}
          <Link to="/" className="logo-link" onClick={closeMenu}>
            <div className="logo">
              <img src={logo} alt="RecipeFinder" className="logo-img" />
              <span className="logo-text">RecipeFinder</span>
              {/* Guest Badge */}
              {!isLoggedIn && <span className="guest-badge">Guest</span>}
              {/* Admin Crown Badge */}
              {isAdmin && <span className="admin-crown-badge"><FaCrown /> Admin</span>}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <ul className="nav-list">
              {/* Core Navigation */}
              {coreNavItems.map((item) => (
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

              {/* About Link (only for desktop) */}
              <li className="nav-item">
                <Link
                  to="/about"
                  className={`nav-link ${
                    location.pathname === "/about" ? "active" : ""
                  }`}
                >
                  <FaInfoCircle />
                  <span>About</span>
                </Link>
              </li>

              {/* User Navigation (logged in users) */}
              {isLoggedIn && userNavItems.map((item) => (
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

              {/* Admin Link (with crown icon) */}
              {isAdmin && (
                <li className="nav-item">
                  <Link
                    to={adminNavItem.path}
                    className={`nav-link admin-nav-link ${
                      location.pathname === adminNavItem.path ? "active" : ""
                    }`}
                  >
                    {adminNavItem.icon}
                    <span>{adminNavItem.label}</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* User Actions */}
          <div className="user-actions">
            {isLoggedIn ? (
              <div className="user-menu">
                <div className="user-info">
                  <FaUser className="user-icon" />
                  <div className="user-details">
                    <span className="user-name">{userName}</span>
                  </div>
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

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${menuOpen ? "open" : ""}`}>
        <div className="mobile-nav-header">
          {isLoggedIn ? (
            <div className="mobile-user-info">
              <FaUser />
              <div className="mobile-user-details">
                <span className="mobile-user-name">{userName}</span>
                {isAdmin && (
                  <span className="mobile-admin-badge">
                    <FaCrown /> Admin
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span>Menu</span>
          )}
        </div>
        
        <ul className="mobile-nav-list">
          {/* Core Navigation */}
          {coreNavItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={closeMenu}
                className={`mobile-nav-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}

          {/* About Link */}
          <li>
            <Link
              to="/about"
              onClick={closeMenu}
              className={`mobile-nav-link ${
                location.pathname === "/about" ? "active" : ""
              }`}
            >
              <FaInfoCircle />
              <span>About</span>
            </Link>
          </li>

          {/* User Navigation */}
          {isLoggedIn && userNavItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={closeMenu}
                className={`mobile-nav-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                {item.icon}
                <span>{item.fullLabel}</span>
              </Link>
            </li>
          ))}

          {/* Admin Link */}
          {isAdmin && (
            <li>
              <Link
                to={adminNavItem.path}
                onClick={closeMenu}
                className={`mobile-nav-link admin-mobile-link ${
                  location.pathname === adminNavItem.path ? "active" : ""
                }`}
              >
                {adminNavItem.icon}
                <span>{adminNavItem.fullLabel}</span>
              </Link>
            </li>
          )}
        </ul>

        {/* Mobile Auth Actions */}
        {isLoggedIn ? (
          <div className="mobile-auth-actions">
            <button className="mobile-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        ) : (
          <div className="mobile-auth-actions">
            <Link to="/login" className="mobile-login-btn" onClick={closeMenu}>
              Login
            </Link>
            <Link to="/signup" className="mobile-signup-btn" onClick={closeMenu}>
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {menuOpen && <div className="mobile-overlay" onClick={closeMenu}></div>}
    </>
  );
};

export default Header;