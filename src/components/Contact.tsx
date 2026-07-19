// src/components/Contact.tsx

'use client';

import { useState } from 'react';
import { SiteSettings } from '@/services/db';

interface ContactProps {
  settings: SiteSettings;
}

export default function Contact({ settings }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    honeypot: '' // spam protection
  });

  const [status, setStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset status
    setStatus({ type: 'loading', message: 'Sending message...' });

    // Client-side validations
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setStatus({ type: 'error', message: 'Name must be at least 2 characters.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      setStatus({ type: 'error', message: 'Subject must be at least 3 characters.' });
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setStatus({ type: 'error', message: 'Message must be at least 10 characters.' });
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form.');
      }

      setStatus({
        type: 'success',
        message: data.message || 'Your message has been sent successfully!'
      });

      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        honeypot: ''
      });
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || 'An unexpected error occurred. Please try again.'
      });
    }
  };

  return (
    <section id="contact" className="section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">Let's discuss your next project, architecture audit, or speaking engagement.</p>
        </div>

        <div className="contact-layout">
          {/* Left Column: Info & Socials */}
          <div className="glass-card contact-info-card">
            {settings.logoUrl && (
              <div className="contact-logo-container">
                <img src={settings.logoUrl} alt="Organization logo" className="contact-logo-img" />
              </div>
            )}

            <div className="info-items">
              {settings.contactEmail && (
                <div className="info-item">
                  <div className="info-icon-box">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="info-icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div className="info-content">
                    <span className="info-label">Email Address</span>
                    <a href={`mailto:${settings.contactEmail}`} className="info-link">{settings.contactEmail}</a>
                  </div>
                </div>
              )}

              {settings.contactPhone && (
                <div className="info-item">
                  <div className="info-icon-box">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="info-icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a20.373 20.373 0 0 1-6.722-6.722c-.155-.44.01-1.09.387-1.376l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  </div>
                  <div className="info-content">
                    <span className="info-label">Phone Number</span>
                    <a href={`tel:${settings.contactPhone}`} className="info-link">{settings.contactPhone}</a>
                  </div>
                </div>
              )}
            </div>

            {settings.resumeUrl && (
              <a 
                href={settings.resumeUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-outline resume-btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="btn-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Resume (PDF)
              </a>
            )}

            {/* Social Links */}
            <div className="socials-container">
              <span className="socials-title">Follow Me</span>
              <div className="social-links">
                {settings.githubUrl && (
                  <a href={settings.githubUrl} target="_blank" rel="noopener noreferrer" className="social-circle" aria-label="GitHub">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="social-icon"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                )}
                {settings.linkedinUrl && (
                  <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="social-circle" aria-label="LinkedIn">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="social-icon"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                )}
                {settings.twitterUrl && (
                  <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="social-circle" aria-label="Twitter">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="social-icon"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="glass-card contact-form-card">
            {status.type !== 'idle' && (
              <div className={`status-banner ${status.type}`}>
                {status.type === 'loading' && (
                  <div className="spinner"></div>
                )}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              {/* Spam Protection Honeypot field (hidden from users) */}
              <div style={{ display: 'none' }}>
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={handleChange}
                  placeholder="Do not fill this"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="contact-name" className="form-label">Full Name *</label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Bryan Dev"
                  />
                </div>
                <div className="form-group flex-1">
                  <label htmlFor="contact-email" className="form-label">Email Address *</label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. bryan@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="contact-phone" className="form-label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="contact-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. +1 (555) 000-0000"
                  />
                </div>
                <div className="form-group flex-1">
                  <label htmlFor="contact-subject" className="form-label">Subject *</label>
                  <input
                    type="text"
                    id="contact-subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Project Consultation"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contact-message" className="form-label">Message *</label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Write details about your requirements, timeline, and expectations..."
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary submit-btn"
                disabled={status.type === 'loading'}
              >
                {status.type === 'loading' ? 'Sending Message...' : 'Send Inquiry'}
                {status.type !== 'loading' && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="btn-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                )}
              </button>
            </form>
          </div>
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

        .contact-layout {
          display: grid;
          grid-template-columns: 38% 58%;
          gap: 4%;
        }

        .contact-info-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 3rem 2.5rem;
          background-color: var(--bg-primary);
        }

        .contact-logo-container {
          width: 90px;
          height: 90px;
          border-radius: var(--radius-full);
          overflow: hidden;
          background-color: var(--bg-secondary);
          border: 3px solid var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          margin-bottom: 2.5rem;
          box-shadow: var(--shadow-lg);
        }

        .contact-logo-img {
          width: 100%;
          height: 100%;
          border-radius: var(--radius-full);
          object-fit: cover;
        }

        .info-items {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-align: left;
        }

        .info-icon-box {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background-color: var(--accent-light);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-icon {
          width: 20px;
          height: 20px;
        }

        .info-content {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .info-link {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          transition: color var(--transition-fast);
        }

        .info-link:hover {
          color: var(--accent);
        }

        .resume-btn {
          width: 100%;
          margin-bottom: 2.5rem;
        }

        .btn-icon {
          width: 16px;
          height: 16px;
        }

        .socials-container {
          width: 100%;
          border-top: 1px solid var(--border-color);
          padding-top: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .socials-title {
          font-size: 0.85rem;
          font-weight: 750;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }

        .social-links {
          display: flex;
          gap: 0.75rem;
        }

        .social-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }

        .social-circle:hover {
          color: #ffffff;
          background-color: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.15);
        }

        .social-icon {
          width: 18px;
          height: 18px;
        }

        /* Form styling */
        .contact-form-card {
          padding: 3rem;
          background-color: var(--bg-primary);
        }

        .status-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          margin-bottom: 2rem;
          font-weight: 600;
          animation: fadeIn var(--transition-fast) forwards;
        }

        .status-banner.loading {
          background-color: var(--accent-light);
          color: var(--accent);
          border: 1px solid rgba(var(--accent-rgb), 0.2);
        }

        .status-banner.success {
          background-color: var(--success-light);
          color: var(--success);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .status-banner.error {
          background-color: var(--danger-light);
          color: var(--danger);
          border: 1px solid rgba(220, 38, 38, 0.2);
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid var(--accent);
          border-top-color: transparent;
          border-radius: var(--radius-full);
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .form-row {
          display: flex;
          gap: 1.5rem;
        }

        .flex-1 {
          flex: 1;
        }

        .submit-btn {
          width: 100%;
          padding: 0.9rem;
          font-size: 1rem;
          margin-top: 1rem;
        }

        @media (max-width: 900px) {
          .contact-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 576px) {
          .form-row {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
    </section>
  );
}
