import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";

const HeroSection = () => {
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const canvasRef = useRef(null);
  const emojiContainerRef = useRef(null);

  useEffect(() => {
    // Text animations
    const elements = [titleRef.current, subtitleRef.current, buttonRef.current];
    elements.forEach((el, index) => {
      if (el) {
        setTimeout(() => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }, index * 200 + 300);
      }
    });

    // Animated gradient background - DARK VERSION
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const drawAnimatedGradient = () => {
      if (!ctx) return;
      
      time += 0.005;
      
      // Clear with dark background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create animated green gradients
      const gradient = ctx.createLinearGradient(
        0, 0, 
        canvas.width, 
        canvas.height
      );
      
      // Animated green color stops
      const hue1 = 140 + Math.sin(time * 0.4) * 10; // Emerald green
      const hue2 = 160 + Math.sin(time * 0.6) * 8;  // Mint green
      const hue3 = 120 + Math.sin(time * 0.8) * 12; // Forest green
      
      gradient.addColorStop(0, `hsla(${hue1}, 70%, 60%, 0.25)`);
      gradient.addColorStop(0.3, `hsla(${hue2}, 80%, 55%, 0.2)`);
      gradient.addColorStop(0.6, `hsla(${hue3}, 90%, 50%, 0.15)`);
      gradient.addColorStop(1, `hsla(${hue1}, 70%, 60%, 0.25)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw floating green shapes
      drawFloatingShapes(ctx, canvas, time);
      
      animationId = requestAnimationFrame(drawAnimatedGradient);
    };

    const drawFloatingShapes = (ctx, canvas, time) => {
      // Draw floating green circles
      for (let i = 0; i < 12; i++) {
        const x = Math.sin(time * 0.3 + i * 0.7) * canvas.width * 0.4 + canvas.width / 2;
        const y = Math.cos(time * 0.25 + i * 0.9) * canvas.height * 0.3 + canvas.height / 2;
        const radius = Math.sin(time * 0.6 + i) * 12 + 35;
        
        const hue = (140 + time * 15 + i * 25) % 180 + 100; // Keep in green range
        const alpha = 0.15 + Math.sin(time * 0.4 + i) * 0.05;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${alpha * 0.8})`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw animated green particles
      for (let i = 0; i < 10; i++) {
        const x = Math.sin(time * 0.35 + i * 1.3) * canvas.width * 0.3 + canvas.width * 0.7;
        const y = Math.cos(time * 0.45 + i * 1.6) * canvas.height * 0.2 + canvas.height * 0.3;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${(140 + time * 30 + i * 40) % 180 + 100}, 100%, 60%, 0.4)`;
        ctx.fill();
      }
    };

    resizeCanvas();
    drawAnimatedGradient();

    window.addEventListener('resize', resizeCanvas);

    // Create floating food emojis
    const emojiContainer = emojiContainerRef.current;
    if (emojiContainer) {
      const foodEmojis = ['🍅', '🥦', '🧄', '🥕', '🌶️', '🍋', '🥑', '🍄', '🌽', '🥬', '🍆', '🥒', '🧅', '🥔', '🍠'];
      
      for (let i = 0; i < 15; i++) {
        const emoji = document.createElement('div');
        emoji.className = 'floating-emoji';
        emoji.textContent = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
        emoji.style.left = `${Math.random() * 100}%`;
        emoji.style.top = `${Math.random() * 100}%`;
        emoji.style.fontSize = `${Math.random() * 24 + 20}px`;
        emoji.style.opacity = `${Math.random() * 0.3 + 0.1}`;
        emoji.style.animationDelay = `${Math.random() * 10}s`;
        emoji.style.animationDuration = `${Math.random() * 20 + 30}s`;
        emojiContainer.appendChild(emoji);
      }
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <section className="hero">
      {/* Animated canvas background */}
      <canvas 
        ref={canvasRef} 
        className="hero-canvas"
      />
      
      {/* Additional animated shapes */}
      <div className="hero-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      {/* Floating food emojis */}
      <div ref={emojiContainerRef} className="floating-emojis"></div>

      <div className="hero-inner">
        <h1 
          ref={titleRef}
          className="hero-title"
        >
          Cook smarter with{" "}
          <span className="hero-highlight">
            <span className="highlight-text">ingredients you have</span>
            <span className="highlight-glow"></span>
          </span>
        </h1>

        <p 
          ref={subtitleRef}
          className="hero-subtitle"
        >
          Search recipes, check ingredients, and find what's missing — 
          all in one seamless experience.
        </p>

        <div className="hero-cta">
          <button
            ref={buttonRef}
            className="hero-btn"
            onClick={() => navigate("/recipes")}
          >
            <span className="btn-text">Browse Recipes</span>
            <span className="btn-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="btn-shine"></span>
            <span className="btn-glow"></span>
          </button>
        </div>

        {/* Animated preview indicators - Professional SVG icons */}
        <div className="hero-preview">
          <div className="preview-item preview-animate-1">
            <span className="preview-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <span className="preview-text">Smart Search</span>
          </div>
          <div className="preview-item preview-animate-2">
            <span className="preview-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </span>
            <span className="preview-text">Save Favorites</span>
          </div>
          <div className="preview-item preview-animate-3">
            <span className="preview-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </span>
            <span className="preview-text">All in One</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;