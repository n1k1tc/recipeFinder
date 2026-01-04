import React, { useEffect, useRef } from "react";
import "./HowItWorks.css";

const HowItWorks = () => {
  const stepsRef = useRef([]);

  useEffect(() => {
    // Animate steps on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = "1";
              entry.target.style.transform = "translateY(0)";
            }, index * 200);
          }
        });
      },
      { threshold: 0.2 }
    );

    stepsRef.current.forEach((step) => {
      if (step) observer.observe(step);
    });

    return () => {
      stepsRef.current.forEach((step) => {
        if (step) observer.unobserve(step);
      });
    };
  }, []);

  return (
    <section className="how">
      {/* Background decorative elements */}
      <div className="how-background">
        <div className="how-bg-blob how-bg-blob-1"></div>
        <div className="how-bg-blob how-bg-blob-2"></div>
        <div className="how-bg-blob how-bg-blob-3"></div>
      </div>

      <div className="how-inner">
        <h2 className="how-title">
          How It <span className="how-title-highlight">Works</span>
        </h2>
        <p className="how-subtitle">
          Find the right recipe and cook with confidence in just a few steps.
        </p>

        <div className="how-steps">
          <div 
            ref={el => stepsRef.current[0] = el}
            className="how-step step-animate-1"
          >
            <div className="step-number">
              <span className="step-number-text">1</span>
              <span className="step-number-glow"></span>
            </div>
            <div className="step-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3>Search recipes</h3>
            <p>
              Search by recipe name or by ingredients you already have at home.
            </p>
          </div>

          <div 
            ref={el => stepsRef.current[1] = el}
            className="how-step step-animate-2"
          >
            <div className="step-number">
              <span className="step-number-text">2</span>
              <span className="step-number-glow"></span>
            </div>
            <div className="step-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>Check ingredients</h3>
            <p>
              See what ingredients you have and identify what's missing instantly.
            </p>
          </div>

          <div 
            ref={el => stepsRef.current[2] = el}
            className="how-step step-animate-3"
          >
            <div className="step-number">
              <span className="step-number-text">3</span>
              <span className="step-number-glow"></span>
            </div>
            <div className="step-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20"></path>
                <path d="m4.93 4.93 14.14 14.14"></path>
                <path d="m19.07 4.93-14.14 14.14"></path>
              </svg>
            </div>
            <h3>Cook or order</h3>
            <p>
              Buy missing ingredients and start cooking your favorite recipe.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;