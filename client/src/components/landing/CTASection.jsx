import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CTASection.css";

const CTASection = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const circles = [];
    const COUNT = 12;

    for (let i = 0; i < COUNT; i++) {
      circles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 22 + 22,
        vx: Math.random() * 0.25 - 0.125,
        vy: Math.random() * 0.25 - 0.125,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      circles.forEach(c => {
        c.x += c.vx;
        c.y += c.vy;

        if (c.x > canvas.width + 80) c.x = -80;
        if (c.x < -80) c.x = canvas.width + 80;
        if (c.y > canvas.height + 80) c.y = -80;
        if (c.y < -80) c.y = canvas.height + 80;

        // Big glow
        const g1 = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * 3);
        g1.addColorStop(0, "rgba(255,255,255,0.18)");
        g1.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r * 3, 0, Math.PI * 2);
        ctx.fill();

        // Inner glow
        const g2 = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * 1.4);
        g2.addColorStop(0, "rgba(255,255,255,0.35)");
        g2.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r * 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="cta">
      <canvas ref={canvasRef} className="cta-canvas" />

      <div className="cta-inner">
        <h2 className="cta-title">
          Ready to cook something{" "}
          <span className="highlight-text">delicious</span> today?
        </h2>

        <p className="cta-text">
          Find recipes, check ingredients, and start cooking in minutes.
        </p>

        <button className="cta-btn" onClick={() => navigate("/recipes")}>
          Browse Recipes →
        </button>
      </div>
    </section>
  );
};

export default CTASection;
