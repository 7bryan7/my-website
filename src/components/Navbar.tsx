// src/components/Navbar.tsx

'use client';

import { useState, useEffect } from 'react';
import { NavbarItem } from '@/services/db';

interface NavbarProps {
  logoUrl: string;
  items: NavbarItem[];
}

export default function Navbar({ logoUrl, items }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Filter visible items and sort by display order
  const visibleItems = items
    .filter(item => item.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Dynamic active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120; // offset

      for (const item of visibleItems) {
        const id = item.href.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleItems]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 80, // nav height offset
        behavior: 'smooth',
      });
      setActiveSection(id);
      window.history.pushState(null, '', href);
    }
  };

  return (
    <header className="navbar-header">
      <div className="container nav-container">
        <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="nav-logo">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="logo-img" />
          ) : (
            <span className="logo-text">AI Practitioner</span>
          )}
        </a>

        {/* Mobile menu toggle */}
        <button 
          className={`hamburger ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation Menu"
          aria-expanded={isOpen}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        {/* Navigation links */}
        <nav className={`nav-menu ${isOpen ? 'active' : ''}`}>
          {visibleItems.map((item) => {
            const sectionId = item.href.replace('#', '');
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`nav-link ${activeSection === sectionId ? 'active' : ''}`}
              >
                {item.label}
              </a>
            );
          })}

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label="Toggle Theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              // Moon Icon
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="theme-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            ) : (
              // Sun Icon
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="theme-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M9.75 15.75a3 3 0 0 0 3-3m-3 3a3 3 0 0 1-3-3m3 3a3 3 0 0 0 3 3m0 0a3 3 0 0 0 3-3m-3 3v1.125m0-13.5V5.25M6.22 6.22l1.06 1.06m8.48 8.48l1.06 1.06m-10.6-1.06l1.06-1.06m8.48-8.48l1.06-1.06M21 12h-2.25m-13.5 0H3m16.5 5.625a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            )}
          </button>
        </nav>
      </div>

      <style jsx>{`
        .navbar-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--nav-height);
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-color);
          z-index: 100;
          transition: background-color var(--transition-normal), border-color var(--transition-normal);
        }

        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--text-primary);
        }

        .logo-img {
          height: 40px;
          width: auto;
        }

        .logo-text {
          background: linear-gradient(135deg, var(--text-primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link {
          font-family: var(--font-heading);
          font-weight: 500;
          font-size: 0.95rem;
          color: var(--text-secondary);
          position: relative;
          padding: 0.5rem 0;
          transition: color var(--transition-fast);
        }

        .nav-link:hover, .nav-link.active {
          color: var(--text-primary);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background-color: var(--accent);
          transition: width var(--transition-fast);
        }

        .nav-link.active::after, .nav-link:hover::after {
          width: 100%;
        }

        .theme-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }

        .theme-toggle-btn:hover {
          color: var(--text-primary);
          background-color: var(--border-color);
        }

        .theme-icon {
          width: 20px;
          height: 20px;
        }

        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 30px;
          height: 21px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 10;
        }

        .hamburger .bar {
          width: 100%;
          height: 3px;
          background-color: var(--text-primary);
          border-radius: 10px;
          transition: all var(--transition-normal);
        }

        @media (max-width: 768px) {
          .hamburger {
            display: flex;
          }

          .hamburger.active .bar:nth-child(2) {
            opacity: 0;
          }

          .hamburger.active .bar:nth-child(1) {
            transform: translateY(9px) rotate(45deg);
          }

          .hamburger.active .bar:nth-child(3) {
            transform: translateY(-9px) rotate(-45deg);
          }

          .nav-menu {
            position: fixed;
            left: -100%;
            top: var(--nav-height);
            flex-direction: column;
            background-color: var(--bg-primary);
            width: 100%;
            height: calc(100vh - var(--nav-height));
            text-align: center;
            transition: 0.3s;
            box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
            gap: 2.5rem;
            padding: 3rem 0;
          }

          .nav-menu.active {
            left: 0;
          }

          .nav-link {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </header>
  );
}
