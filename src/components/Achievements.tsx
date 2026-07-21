// src/components/Achievements.tsx

'use client';

import { Achievement } from '@/services/db';

interface AchievementsProps {
  achievements: Achievement[];
}

export default function Achievements({ achievements }: AchievementsProps) {
  const visibleAchievements = achievements
    .filter(a => a.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (visibleAchievements.length === 0) return null;

  return (
    <section id="achievements" className="section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Certifications & Achievements</h2>
          <p className="section-subtitle">Verified technical milestones and professional qualifications.</p>
        </div>

        <div className="grid-responsive achievements-grid">
          {visibleAchievements.map((ach) => (
            <div key={ach.id} className="glass-card achievement-card">
              <div className="certificate-wrapper">
                <img 
                  src={ach.imageUrl || '/placeholder-cert.jpg'} 
                  alt={`${ach.title} certificate`} 
                  className="certificate-img"
                  loading="lazy"
                />
              </div>
              <div className="achievement-info">
                <div className="achievement-meta">
                  <span className="issuing-org">{ach.issuingOrg}</span>
                  <span className="issue-date">{ach.issueDate}</span>
                </div>
                <h3 className="achievement-title">{ach.title}</h3>
                <p className="achievement-desc">{ach.description}</p>
                
                {ach.credentialUrl && (
                  <a 
                    href={ach.credentialUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-link"
                  >
                    Verify Credential
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="link-icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .section-padding {
          padding: 8rem 0;
          background-color: var(--bg-primary);
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, var(--text-primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-subtitle {
          color: var(--text-secondary);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .achievements-grid {
          gap: 2.5rem;
        }

        .achievement-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 1.5rem;
        }

        .certificate-wrapper {
          position: relative;
          width: 100%;
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          aspect-ratio: 4/3;
          margin-bottom: 1.5rem;
        }

        .certificate-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .achievement-card:hover .certificate-img {
          transform: scale(1.05);
        }

        .achievement-info {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .achievement-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--accent);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }

        .issue-date {
          color: var(--text-muted);
        }

        .achievement-title {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .achievement-desc {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }

        .btn-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--accent);
          transition: color var(--transition-fast);
          align-self: flex-start;
        }

        .btn-link:hover {
          color: var(--accent-hover);
        }

        .link-icon {
          width: 14px;
          height: 14px;
        }
      `}</style>
    </section>
  );
}
