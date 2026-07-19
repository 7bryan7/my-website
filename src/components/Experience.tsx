// src/components/Experience.tsx

import { Experience } from '@/services/db';

interface ExperienceProps {
  experiences: Experience[];
}

export default function ExperienceSection({ experiences }: ExperienceProps) {
  const visibleExperiences = experiences
    .filter(e => e.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (visibleExperiences.length === 0) return null;

  return (
    <section id="experience" className="section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Work Experience</h2>
          <p className="section-subtitle">Professional career history, leadership roles, and technical achievements.</p>
        </div>

        <div className="timeline-container">
          <div className="timeline-line"></div>

          {visibleExperiences.map((exp, index) => (
            <div key={exp.id} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
              <div className="timeline-dot"></div>
              
              <div className="glass-card experience-card">
                <div className="experience-header">
                  {exp.logoUrl && (
                    <div className="company-logo-wrapper">
                      <img 
                        src={exp.logoUrl} 
                        alt={`${exp.companyName} logo`} 
                        className="company-logo"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="company-info">
                    <span className="duration-badge">{exp.duration}</span>
                    <h3 className="position-title">{exp.position}</h3>
                    <h4 className="company-name">{exp.companyName}</h4>
                  </div>
                </div>

                <p className="experience-desc">{exp.description}</p>

                <div className="skills-tags">
                  {exp.skills.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
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
          margin-bottom: 5rem;
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

        .timeline-container {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
        }

        .timeline-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, var(--accent), var(--border-color) 90%);
          transform: translateX(-50%);
        }

        .timeline-item {
          position: relative;
          width: 50%;
          padding: 0 2.5rem 3rem 2.5rem;
        }

        .timeline-item.left {
          left: 0;
          text-align: right;
        }

        .timeline-item.right {
          left: 50%;
          text-align: left;
        }

        .timeline-dot {
          position: absolute;
          left: 50%;
          top: 10px;
          width: 16px;
          height: 16px;
          border-radius: var(--radius-full);
          background-color: var(--bg-primary);
          border: 3px solid var(--accent);
          transform: translateX(-50%);
          z-index: 5;
          transition: background-color var(--transition-fast);
        }

        .timeline-item:hover .timeline-dot {
          background-color: var(--accent);
        }

        .timeline-item.left .timeline-dot {
          left: 100%;
        }

        .timeline-item.right .timeline-dot {
          left: 0%;
        }

        .experience-card {
          padding: 2rem;
          background-color: var(--bg-secondary);
          text-align: left;
        }

        .experience-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .timeline-item.left .experience-header {
          /* Keep text inside card left aligned */
          text-align: left;
        }

        .company-logo-wrapper {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          flex-shrink: 0;
        }

        .company-logo {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .company-info {
          display: flex;
          flex-direction: column;
        }

        .duration-badge {
          align-self: flex-start;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent);
          background-color: var(--accent-light);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-sm);
          margin-bottom: 0.35rem;
          letter-spacing: 0.05em;
        }

        .position-title {
          font-size: 1.25rem;
          font-weight: 750;
          color: var(--text-primary);
        }

        .company-name {
          font-size: 0.95rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .experience-desc {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .skill-tag {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-sm);
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        @media (max-width: 768px) {
          .timeline-line {
            left: 20px;
          }

          .timeline-item {
            width: 100%;
            padding: 0 0 2.5rem 3rem;
          }

          .timeline-item.left {
            left: 0;
            text-align: left;
          }

          .timeline-item.right {
            left: 0;
            text-align: left;
          }

          .timeline-item.left .timeline-dot,
          .timeline-item.right .timeline-dot {
            left: 20px;
            transform: translateX(-50%);
          }

          .timeline-item.left .experience-header {
            text-align: left;
          }
        }
      `}</style>
    </section>
  );
}
