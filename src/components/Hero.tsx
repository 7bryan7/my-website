// src/components/Hero.tsx

'use client';

import { useEffect, useRef } from 'react';
import { HeroSection } from '@/services/db';

interface HeroProps {
  hero: HeroSection;
}

export default function Hero({ hero }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hero.animationType !== 'particles') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      }

      draw(context: CanvasRenderingContext2D, color: string) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = Math.min(Math.floor((width * height) / 15000), 80); // cap count based on screen size

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Handle resizing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const animate = () => {
      // Determine theme accent color for lines
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const colorParticle = isDark ? 'rgba(96, 165, 250, 0.4)' : 'rgba(37, 99, 235, 0.2)';
      const colorLine = isDark ? 'rgba(96, 165, 250, 0.05)' : 'rgba(37, 99, 235, 0.04)';

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw(ctx, colorParticle);

        // Connect particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = colorLine;
            ctx.lineWidth = 1 - dist / 120;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Optimization: Pause animation when offscreen
    let isDrawing = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!isDrawing) {
              isDrawing = true;
              animate();
            }
          } else {
            isDrawing = false;
            cancelAnimationFrame(animationFrameId);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Start initial animation
    if (isDrawing) {
      animate();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [hero.animationType]);

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        window.scrollTo({
          top: el.offsetTop - 80,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <section id="home" className="hero-section" ref={containerRef}>
      {hero.animationType === 'particles' && (
        <canvas ref={canvasRef} className="hero-canvas" />
      )}

      {/* Dynamic Ambient Background Glows */}
      <div className="pulse-bg-circle glow-1" />
      <div className="pulse-bg-circle glow-2" />

      <div className="container hero-container">
        <div className="hero-content">
          {hero.logoUrl && (
            <div className="hero-logo-wrapper">
              <img src={hero.logoUrl} alt="Logo" className="hero-profile-logo" />
            </div>
          )}
          
          <h1 className="hero-title text-balance">
            {hero.heading}
          </h1>
          
          <p className="hero-desc text-balance">
            {hero.introduction}
          </p>

          <div className="hero-ctas">
            <a 
              href={hero.ctaPrimaryHref} 
              onClick={(e) => handleCtaClick(e, hero.ctaPrimaryHref)}
              className="btn btn-primary"
            >
              {hero.ctaPrimaryText}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="cta-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
            
            <a 
              href={hero.ctaSecondaryHref} 
              onClick={(e) => handleCtaClick(e, hero.ctaSecondaryHref)}
              className="btn btn-secondary"
            >
              {hero.ctaSecondaryText}
            </a>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <a href="#achievements" onClick={(e) => handleCtaClick(e, '#achievements')} aria-label="Scroll down">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
        </a>
      </div>

      <style jsx>{`
        .hero-section {
          position: relative;
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: var(--bg-primary);
        }

        .hero-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
        }

        .glow-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%);
          top: -100px;
          left: -100px;
        }

        .glow-2 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(96, 165, 250, 0.12) 0%, transparent 70%);
          bottom: -100px;
          right: -100px;
        }

        .hero-container {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .hero-content {
          max-width: 800px;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: fadeIn var(--transition-slow) forwards;
        }

        .hero-logo-wrapper {
          margin-bottom: 2rem;
          padding: 6px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--accent), transparent);
          box-shadow: var(--shadow-lg);
        }

        .hero-profile-logo {
          width: 100px;
          height: 100px;
          border-radius: var(--radius-full);
          object-fit: cover;
          border: 4px solid var(--bg-secondary);
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
          background: linear-gradient(to right, var(--text-primary) 30%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-desc {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 650px;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .hero-ctas {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .cta-icon {
          width: 18px;
          height: 18px;
        }

        .scroll-indicator {
          position: absolute;
          bottom: 2.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
        }

        .mouse {
          width: 26px;
          height: 42px;
          border: 2px solid var(--text-muted);
          border-radius: 20px;
          display: flex;
          justify-content: center;
          padding-top: 8px;
          opacity: 0.8;
          transition: opacity var(--transition-fast), border-color var(--transition-fast);
        }
        
        .mouse:hover {
          opacity: 1;
          border-color: var(--accent);
        }

        .wheel {
          width: 4px;
          height: 8px;
          background-color: var(--accent);
          border-radius: var(--radius-full);
          animation: scroll 1.5s infinite;
        }

        @keyframes scroll {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-desc {
            font-size: 1.1rem;
          }

          .hero-ctas {
            flex-direction: column;
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </section>
  );
}
