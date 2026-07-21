// src/components/Projects.tsx

'use client';

import { Project } from '@/services/db';

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const visibleProjects = projects
    .filter(p => p.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (visibleProjects.length === 0) return null;

  return (
    <section id="projects" className="section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Featured Projects</h2>
          <p className="section-subtitle">A curated selection of machine learning applications, backend orchestrations, and open-source contributions.</p>
        </div>

        <div className="grid-responsive projects-grid">
          {visibleProjects.map((proj) => (
            <div key={proj.id} className="glass-card project-card">
              <div className="project-img-wrapper">
                <img 
                  src={proj.imageUrl || '/placeholder-project.jpg'} 
                  alt={proj.title} 
                  className="project-img"
                  loading="lazy"
                />
              </div>
              
              <div className="project-content">
                <h3 className="project-title">{proj.title}</h3>
                <p className="project-desc">{proj.description}</p>
                
                <div className="tech-tags">
                  {proj.technologies.map((tech, i) => (
                    <span key={i} className="tech-tag">{tech}</span>
                  ))}
                </div>

                <div className="project-links">
                  {proj.githubUrl && (
                    <a 
                      href={proj.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-project-link"
                      title="View source code on GitHub"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="link-icon-svg">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                  )}

                  {proj.liveUrl && (
                    <a 
                      href={proj.liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-project-link highlight"
                      title="View live demo website"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="link-icon-svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      Demo
                    </a>
                  )}

                  {proj.docUrl && (
                    <a 
                      href={proj.docUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-project-link"
                      title="View project documentation"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="link-icon-svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      Docs
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .section-padding {
          padding: 8rem 0;
          background-color: var(--bg-secondary);
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

        .projects-grid {
          gap: 2.5rem;
        }

        .project-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 0;
          overflow: hidden;
          background-color: var(--bg-primary);
        }

        .project-img-wrapper {
          width: 100%;
          aspect-ratio: 16/9;
          overflow: hidden;
          border-bottom: 1px solid var(--border-color);
        }

        .project-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .project-card:hover .project-img {
          transform: scale(1.05);
        }

        .project-content {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .project-title {
          font-size: 1.5rem;
          font-weight: 750;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
          transition: color var(--transition-fast);
        }

        .project-card:hover .project-title {
          color: var(--accent);
        }

        .project-desc {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }

        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .tech-tag {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .project-links {
          display: flex;
          gap: 1rem;
          margin-top: auto;
        }

        .btn-project-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          transition: all var(--transition-fast);
        }

        .btn-project-link:hover {
          color: var(--text-primary);
          border-color: var(--text-muted);
          background-color: var(--bg-tertiary);
        }

        .btn-project-link.highlight {
          color: var(--accent);
          border-color: rgba(var(--accent-rgb), 0.2);
          background-color: var(--accent-light);
        }

        .btn-project-link.highlight:hover {
          color: #ffffff;
          border-color: var(--accent);
          background-color: var(--accent);
          box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.15);
        }

        .link-icon-svg {
          width: 16px;
          height: 16px;
        }
      `}</style>
    </section>
  );
}
