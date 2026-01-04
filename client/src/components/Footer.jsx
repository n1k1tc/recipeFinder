import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Footer.css";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-content">

          {/* Brand Section */}
          <div className="footer-section brand">
            <div className="footer-brand">
              <img
                src={logo}
                alt="RecipeFinder Logo"
                className="footer-logo"
              />
              <h3 className="footer-title">RecipeFinder</h3>
            </div>
            <p className="footer-text">
              Discover recipes, check ingredients, and cook smarter with what you have.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li onClick={() => navigate("/")}>Home</li>
              <li onClick={() => navigate("/recipes")}>Recipes</li>
              <li onClick={() => navigate("/about")}>About</li>
            </ul>
          </div>

          {/* Action */}
          <div className="footer-section">
            <h4 className="footer-heading">Get Started</h4>
            <button
              className="footer-btn"
              onClick={() => navigate("/recipes")}
            >
              Browse Recipes
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>
            Built with MERN Stack • © {new Date().getFullYear()} • Nikita Pal
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
