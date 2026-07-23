// src/components/Hero.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { HeroSection, SiteSettings } from '@/services/db';

interface HeroProps {
  hero: HeroSection;
  settings?: SiteSettings;
}

export default function Hero({ hero, settings }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

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

  // Read CMS settings
  const otherSocials = settings?.otherSocials || {};
  const ribbonVisible = otherSocials.ribbonVisible !== 'false';
  const flowingTextRaw = otherSocials.flowingText || "AI Practitioner, Tech Explorer, Blockchain Enthusiast";
  const textArray = flowingTextRaw.split(',').map((s: string) => s.trim());
  const separator = " • ";
  const concatenatedText = textArray.join(separator) + separator;
  
  // Create a long continuous string for seamless looping
  const repeatedText = Array(8).fill(concatenatedText).join('');
  
  // Animation speed configurations
  const animSpeedRaw = otherSocials.animationSpeed || 'slow';
  let duration = '25s';
  if (animSpeedRaw === 'fast') duration = '12s';
  if (animSpeedRaw === 'medium') duration = '18s';
  if (animSpeedRaw.endsWith('s')) duration = animSpeedRaw; // allow direct input of e.g. "30s"

  const ribbonColor = otherSocials.ribbonColor || 'var(--accent)';
  const ribbonOpacity = parseFloat(otherSocials.ribbonOpacity || '0.85');

  return (
    <section id="home" className="hero-section" ref={containerRef}>
      {hero.animationType === 'particles' && (
        <canvas ref={canvasRef} className="hero-canvas" />
      )}

      {/* Dynamic Ambient Background Glows */}
      <div className="pulse-bg-circle glow-1" />
      <div className="pulse-bg-circle glow-2" />

      <div className="container hero-container">
        <div className="hero-grid">
          <div className="hero-left-column">
            <div className="hero-content">
              <h1 className="hero-title text-balance">
                <span className="hero-name">Bryan Roger B</span>
                <span className="hero-subtitle">{hero.heading}</span>
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

          <div className="hero-right-column">
            <div className="hero-branding-wrapper" aria-label="Branded profile avatar visual">
              <div className="profile-image-container">
                <img 
                  src={hero.logoUrl || '/uploads/logo.svg'} 
                  alt="Bryan Roger B Profile Picture" 
                  className="profile-picture" 
                />
              </div>

              {ribbonVisible && (
                <div className="flowing-ribbon-container">
                  <svg viewBox="0 0 500 500" width="100%" height="100%" className="ribbon-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <defs>
                      <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity={ribbonOpacity} />
                        <stop offset="50%" stopColor="#c084fc" stopOpacity={ribbonOpacity} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={ribbonOpacity} />
                      </linearGradient>
                      
                      <path 
                        id="textPathCurve" 
                        d="M 20,320 C 120,400 200,420 250,400 C 300,380 380,360 480,310" 
                        fill="none" 
                      />
                    </defs>

                    <path 
                      d="M 20,320 C 120,400 200,420 250,400 C 300,380 380,360 480,310" 
                      fill="none" 
                      stroke={ribbonColor === 'var(--accent)' ? 'url(#ribbonGrad)' : ribbonColor} 
                      strokeWidth="38" 
                      strokeLinecap="round"
                      style={{
                        filter: 'drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.35))',
                      }}
                    />

                    <text fill="#ffffff" dy="5" style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                      <textPath href="#textPathCurve" startOffset="-100%">
                        {repeatedText}
                        {!prefersReducedMotion && (
                          <animate 
                            attributeName="startOffset" 
                            from="-100%" 
                            to="0%" 
                            dur={duration} 
                            repeatCount="indefinite" 
                          />
                        )}
                      </textPath>
                    </text>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-section {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: var(--bg-primary);
          padding: 6rem 0 3rem;
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
          width: 100%;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 4rem;
          width: 100%;
          align-items: center;
        }

        .hero-left-column {
          display: flex;
          justify-content: flex-start;
          text-align: left;
        }

        .hero-content {
          max-width: 650px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          animation: fadeIn var(--transition-slow) forwards;
        }

        .hero-title {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero-name {
          font-size: 4.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(to right, var(--text-primary) 30%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: block;
        }

        .hero-subtitle {
          font-size: 3rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          background: linear-gradient(to right, var(--text-primary) 30%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: block;
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
          justify-content: flex-start;
        }

        .cta-icon {
          width: 18px;
          height: 18px;
        }

        .hero-right-column {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-branding-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 480px;
          height: 480px;
        }

        .profile-image-container {
          position: relative;
          width: 360px;
          height: 360px;
          border-radius: var(--radius-full);
          padding: 4px;
          background: linear-gradient(135deg, var(--accent), #c084fc);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
          animation: float-image 6s ease-in-out infinite;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
          z-index: 2;
        }

        .profile-image-container:hover {
          transform: scale(1.04);
          box-shadow: 0 30px 60px rgba(var(--accent-rgb), 0.3);
        }

        .profile-picture {
          width: 100%;
          height: 100%;
          border-radius: var(--radius-full);
          object-fit: cover;
          border: 4px solid var(--bg-secondary);
        }

        .flowing-ribbon-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 3;
          pointer-events: none;
          animation: float-ribbon 5s ease-in-out infinite alternate;
        }

        .ribbon-svg {
          width: 100%;
          height: 100%;
        }

        @keyframes float-image {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes float-ribbon {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @media (max-width: 991px) {
          .hero-grid {
            grid-template-columns: 1.4fr 0.6fr;
            gap: 2rem;
          }

          .hero-branding-wrapper {
            width: 380px;
            height: 380px;
          }

          .profile-image-container {
            width: 280px;
            height: 280px;
          }
        }

        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .hero-right-column {
            display: flex;
            margin-top: 2rem;
            margin-bottom: 2rem;
          }

          .hero-branding-wrapper {
            width: 280px;
            height: 280px;
          }

          .profile-image-container {
            width: 200px;
            height: 200px;
          }

          .hero-left-column {
            text-align: center;
            justify-content: center;
          }

          .hero-content {
            align-items: center;
          }

          .hero-name {
            font-size: 3rem;
          }
          
          .hero-subtitle {
            font-size: 2rem;
          }
          
          .hero-desc {
            font-size: 1.1rem;
          }

          .hero-ctas {
            flex-direction: column;
            width: 100%;
            max-width: 300px;
            justify-content: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .profile-image-container,
          .flowing-ribbon-container {
            animation: none !important;
          }
          .profile-image-container:hover {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
