import React, { useEffect, useRef } from "react";
import "./About.css";

// Icons
import {
  FiBook,
  FiHelpCircle,
  FiStar,
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiShoppingCart,
  FiHeart,
  FiClock,
  FiCpu
} from "react-icons/fi";
import { GiCook } from "react-icons/gi";

// ✅ IMPORT LOGOS PROPERLY (THIS FIXES THE ISSUE)
import reactLogo from "../assets/React-icon.svg";
import nodeLogo from "../assets/Node.js_logo.svg";
import mongoLogo from "../assets/MongoDB.svg";

const About = () => {
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = "1";
              entry.target.style.transform = "translateY(0)";
            }, index * 150);
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionRefs.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  return (
    <section className="about">
      {/* Background blobs */}
      <div className="about-background">
        <div className="about-bg-blob about-bg-blob-1"></div>
        <div className="about-bg-blob about-bg-blob-2"></div>
        <div className="about-bg-blob about-bg-blob-3"></div>
      </div>

      <div className="about-container">
        {/* Header */}
        <div
          ref={(el) => (sectionRefs.current[0] = el)}
          className="about-header about-animate-1"
        >
          <h1 className="about-title">
            About <span className="about-title-highlight">RecipeFinder</span>
          </h1>
          <p className="about-subtitle">
            Making everyday cooking simpler, smarter, and stress-free.
          </p>
        </div>

        {/* What is RecipeFinder */}
        <div
          ref={(el) => (sectionRefs.current[1] = el)}
          className="about-section about-animate-2"
        >
          <div className="section-header">
            <div className="section-icon">
              <FiBook size={24} />
            </div>
            <h2>What is RecipeFinder?</h2>
          </div>
          <p>
            RecipeFinder is a smart recipe discovery app that helps you decide
            what to cook using the ingredients you already have. Instead of
            guessing or endlessly scrolling, you get clear, useful results.
          </p>
        </div>

        {/* Why RecipeFinder */}
        <div
          ref={(el) => (sectionRefs.current[2] = el)}
          className="about-section about-animate-3"
        >
          <div className="section-header">
            <div className="section-icon">
              <FiHelpCircle size={24} />
            </div>
            <h2>Why RecipeFinder?</h2>
          </div>
          <p>
            Many times we have ingredients at home but don’t know what to make.
            RecipeFinder bridges that gap by helping you search smarter, track
            missing ingredients, and plan meals with confidence.
          </p>
        </div>

        {/* Features */}
        <div
          ref={(el) => (sectionRefs.current[3] = el)}
          className="about-section about-animate-4"
        >
          <div className="section-header">
            <div className="section-icon">
              <FiStar size={24} />
            </div>
            <h2>What You Can Do</h2>
          </div>

          <ul className="about-list">
            <li>
              <span className="list-icon"><FiSearch /></span>
              Search recipes by name or ingredients
            </li>
            <li>
              <span className="list-icon"><FiFileText /></span>
              View detailed cooking steps and timings
            </li>
            <li>
              <span className="list-icon"><FiCheckCircle /></span>
              Check which ingredients are missing
            </li>
            <li>
              <span className="list-icon"><FiShoppingCart /></span>
              Get links to buy missing ingredients
            </li>
            <li>
              <span className="list-icon"><FiHeart /></span>
              Save favorite recipes
            </li>
            <li>
              <span className="list-icon"><FiClock /></span>
              View recent searches
            </li>
          </ul>
        </div>

        {/* Tech Stack */}
        <div
          ref={(el) => (sectionRefs.current[4] = el)}
          className="about-section about-animate-5"
        >
          <div className="section-header">
            <div className="section-icon">
              <FiCpu size={24} />
            </div>
            <h2>Built With</h2>
          </div>

          <p>
            RecipeFinder is built using the MERN stack, focusing on performance,
            simplicity, and clean user experience.
          </p>

          <ul className="about-tech">
            <li>
              <div className="tech-item">
                <div className="tech-icon">
                  <img src={reactLogo} alt="React" className="tech-logo" />
                </div>
                <div>
                  <strong>React</strong>
                  <p className="tech-desc">Frontend user interface</p>
                </div>
              </div>
            </li>

            <li>
              <div className="tech-item">
                <div className="tech-icon">
                  <img src={nodeLogo} alt="Node.js" className="tech-logo" />
                </div>
                <div>
                  <strong>Node.js & Express</strong>
                  <p className="tech-desc">Backend & APIs</p>
                </div>
              </div>
            </li>

            <li>
              <div className="tech-item">
                <div className="tech-icon">
                  <img src={mongoLogo} alt="MongoDB" className="tech-logo" />
                </div>
                <div>
                  <strong>MongoDB</strong>
                  <p className="tech-desc">Database layer</p>
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* Closing */}
        <div
          ref={(el) => (sectionRefs.current[5] = el)}
          className="about-footer-note about-animate-6"
        >
          <div className="footer-icon">
            <GiCook />
          </div>
          <p>
            RecipeFinder is designed to make cooking easier — not complicated.
            Simple ideas, simple food, better everyday meals.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
