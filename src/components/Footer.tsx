// src/components/Footer.tsx

'use client';

import { SiteSettings, NavbarItem } from '@/services/db';

interface FooterProps {
  settings: SiteSettings;
  items: NavbarItem[];
}

export default function Footer({ settings, items }: FooterProps) {
  const visibleItems = items
    .filter(item => item.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
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
    <footer className="portfolio-footer">
      <div className="container footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo-text">AI Practitioner</span>
            <p className="footer-motto">Building reliable, production-ready intelligent systems for the modern web.</p>
          </div>

          <div className="footer-links-group">
            <h5 className="footer-title">Navigation</h5>
            <div className="footer-links">
              {visibleItems.map(item => (
                <a 
                  key={item.id} 
                  href={item.href} 
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="footer-link"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-links-group">
            <h5 className="footer-title">Connect</h5>
            <div className="footer-links">
              {settings.linkedinUrl && <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>}
              {settings.githubUrl && <a href={settings.githubUrl} target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>}
              {settings.twitterUrl && <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="footer-link">X (Twitter)</a>}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright-text">{settings.copyrightText}</p>
          
          <div className="footer-meta-links">
            <a href="#" className="footer-meta-link">Privacy Policy</a>
            <span className="meta-divider">•</span>
            <a href="#" className="footer-meta-link">Terms & Conditions</a>
            <span className="meta-divider">•</span>
            <a href="/admin" className="footer-meta-link admin-entry">Admin Portal</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .portfolio-footer {
          background-color: var(--bg-tertiary);
          border-top: 1px solid var(--border-color);
          padding: 5rem 0 3rem 0;
          color: var(--text-secondary);
        }

        .footer-top {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 4rem;
          margin-bottom: 4rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 3rem;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-logo-text {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--text-primary);
          background: linear-gradient(135deg, var(--text-primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .footer-motto {
          font-size: 0.95rem;
          max-width: 320px;
          line-height: 1.6;
        }

        .footer-title {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1.25rem;
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-link {
          font-size: 0.925rem;
          transition: color var(--transition-fast);
        }

        .footer-link:hover {
          color: var(--accent);
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .footer-meta-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer-meta-link {
          transition: color var(--transition-fast);
        }

        .footer-meta-link:hover {
          color: var(--text-primary);
        }

        .meta-divider {
          color: var(--border-color);
        }

        .admin-entry {
          font-weight: 600;
          color: var(--text-secondary);
        }
        
        .admin-entry:hover {
          color: var(--accent) !important;
        }

        @media (max-width: 768px) {
          .footer-top {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
