import React, { useEffect, useRef } from "react";
import "./Features.css";

const Features = () => {
  const cardsRef = useRef([]);

  useEffect(() => {
    // Animate cards on scroll
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

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      cardsRef.current.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, []);

  return (
    <section className="features">
      {/* Background decorative elements */}
      <div className="features-background">
        <div className="features-bg-blob features-bg-blob-1"></div>
        <div className="features-bg-blob features-bg-blob-2"></div>
      </div>

      <div className="features-inner">
        <h2 className="features-title">
          Why You'll Love <span className="features-title-highlight">RecipeFinder</span>
        </h2>
        <p className="features-subtitle">
          Everything you need to discover, plan, and cook with ease.
        </p>

        <div className="features-grid">
          <div 
            ref={el => cardsRef.current[0] = el}
            className="feature-card feature-animate-1"
          >
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <path d="M11 8v5M8 11h6"></path>
              </svg>
            </div>
            <h3>Smart Recipe Search</h3>
            <p>
              Search recipes by name or by ingredients you already have at home.
            </p>
          </div>

          <div 
            ref={el => cardsRef.current[1] = el}
            className="feature-card feature-animate-2"
          >
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h3>Save Favorites</h3>
            <p>
              Like a recipe? Save it to your favorites and find it anytime.
            </p>
          </div>

          <div 
            ref={el => cardsRef.current[2] = el}
            className="feature-card feature-animate-3"
          >
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
              </svg>
            </div>
            <h3>Recent Searches</h3>
            <p>
              Quickly revisit recipes you searched for earlier without starting over.
            </p>
          </div>

          <div 
            ref={el => cardsRef.current[3] = el}
            className="feature-card feature-animate-4"
          >
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <h3>Missing Ingredients</h3>
            <p>
              Instantly see what's missing and order ingredients from nearby stores.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;