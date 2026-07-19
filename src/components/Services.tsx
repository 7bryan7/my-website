// src/components/Services.tsx

'use client';

import { useState } from 'react';
import { Service, Category } from '@/services/db';

interface ServicesProps {
  services: Service[];
  categories: Category[];
}

export default function Services({ services, categories }: ServicesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalService, setActiveModalService] = useState<Service | null>(null);

  const visibleServices = services.filter(s => s.isVisible);

  // Filter based on category and search query
  const filteredServices = visibleServices.filter((service) => {
    const matchesCategory = selectedCategory === 'all' || service.categoryId === selectedCategory;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      service.name.toLowerCase().includes(searchLower) ||
      service.shortDescription.toLowerCase().includes(searchLower) ||
      service.fullDescription.toLowerCase().includes(searchLower) ||
      (service.pricing && service.pricing.toLowerCase().includes(searchLower)) ||
      (service.duration && service.duration.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  const handleAvailClick = (serviceName: string) => {
    // Scroll to contact form
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      window.scrollTo({
        top: contactEl.offsetTop - 80,
        behavior: 'smooth',
      });

      // Attempt to pre-fill the contact form subject
      setTimeout(() => {
        const subjectInput = document.getElementById('contact-subject') as HTMLInputElement;
        const messageInput = document.getElementById('contact-message') as HTMLTextAreaElement;
        if (subjectInput) {
          subjectInput.value = `Avail Service: ${serviceName}`;
        }
        if (messageInput) {
          messageInput.value = `Hi, I am interested in availing your service: "${serviceName}". Please share details regarding the next steps.`;
          messageInput.focus();
        }
      }, 500);
    }
    // Close modal if open
    setActiveModalService(null);
  };

  return (
    <section id="services" className="section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Services Marketplace</h2>
          <p className="section-subtitle">Collaborative service offerings tailored for high-impact artificial intelligence and technology integrations.</p>
        </div>

        {/* Filters and Search Bar */}
        <div className="marketplace-controls glass-card">
          <div className="categories-filter">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            >
              All Services
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="search-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="search-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
            </svg>
            <input
              type="text"
              placeholder="Search services, skills, or pricing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div key={service.id} className="glass-card service-card">
                <div className="service-img-wrapper">
                  <img 
                    src={service.imageUrl || '/placeholder-service.jpg'} 
                    alt={service.name} 
                    className="service-img"
                    loading="lazy"
                  />
                  
                  {/* Availability Badge */}
                  <span className={`availability-badge ${service.availabilityStatus}`}>
                    {service.availabilityStatus === 'available' && 'Available Now'}
                    {service.availabilityStatus === 'busy' && 'Busy / Waitlist'}
                    {service.availabilityStatus === 'unavailable' && 'Unavailable'}
                  </span>
                </div>

                <div className="service-content">
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-desc">{service.shortDescription}</p>

                  <div className="service-meta-mini">
                    <span className="meta-item duration">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="meta-icon">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      {service.duration}
                    </span>
                    {service.pricing && (
                      <span className="meta-item pricing">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="meta-icon">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.195-.288c.848-1.256 2.505-2.012 4.195-2.012 1.713 0 3.393.785 4.195 2.012l.196.288M12 6a4.996 4.996 0 0 0-4.195 2.013L7.61 8.3c-.802 1.228-.802 2.766 0 3.994l.195.288c.802 1.228 2.482 2.012 4.196 2.012 1.713 0 3.393-.785 4.195-2.012l.196-.289a4.996 4.996 0 0 0 0-5.992l-.196-.289A4.996 4.996 0 0 0 12 6Z" />
                        </svg>
                        {service.pricing}
                      </span>
                    )}
                  </div>

                  <div className="service-actions">
                    <button 
                      onClick={() => setActiveModalService(service)}
                      className="btn btn-outline btn-full"
                    >
                      See Details
                    </button>
                    <button 
                      onClick={() => handleAvailClick(service.name)}
                      className="btn btn-primary btn-full"
                      disabled={service.availabilityStatus === 'unavailable'}
                    >
                      Avail Service
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state glass-card">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="empty-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
              </svg>
              <h3>No Services Found</h3>
              <p>We couldn't find any services matching your filters or search query. Try resetting your search or picking a different category.</p>
              <button 
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="btn btn-primary"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Modal Overlay */}
      {activeModalService && (
        <div className="modal-overlay" onClick={() => setActiveModalService(null)}>
          <div className="modal-content glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn"
              onClick={() => setActiveModalService(null)}
              aria-label="Close details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="close-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="modal-body-layout">
              <div className="modal-img-column">
                <img 
                  src={activeModalService.imageUrl || '/placeholder-service.jpg'} 
                  alt={activeModalService.name} 
                  className="modal-img"
                />
              </div>

              <div className="modal-info-column">
                <span className={`availability-badge ${activeModalService.availabilityStatus}`}>
                  {activeModalService.availabilityStatus === 'available' && 'Available Now'}
                  {activeModalService.availabilityStatus === 'busy' && 'Waitlist Open'}
                  {activeModalService.availabilityStatus === 'unavailable' && 'Unavailable'}
                </span>
                <h3 className="modal-service-name">{activeModalService.name}</h3>
                
                <div className="modal-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Estimated Duration</span>
                    <span className="detail-value">{activeModalService.duration}</span>
                  </div>
                  {activeModalService.pricing && (
                    <div className="detail-item">
                      <span className="detail-label">Pricing Estimate</span>
                      <span className="detail-value">{activeModalService.pricing}</span>
                    </div>
                  )}
                </div>

                <div className="full-desc-wrapper">
                  <h4 className="desc-title">Description & Scope</h4>
                  <p className="full-description">{activeModalService.fullDescription}</p>
                </div>

                <div className="modal-actions">
                  <button 
                    onClick={() => handleAvailClick(activeModalService.name)}
                    className="btn btn-primary"
                    disabled={activeModalService.availabilityStatus === 'unavailable'}
                  >
                    Avail Service
                  </button>
                  <button 
                    onClick={() => setActiveModalService(null)}
                    className="btn btn-outline"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

        /* Controls styling */
        .marketplace-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 1rem 1.5rem;
          margin-bottom: 3rem;
          background-color: var(--bg-primary);
        }

        .categories-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .category-pill {
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.4rem 1rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }

        .category-pill:hover {
          color: var(--text-primary);
          background-color: var(--bg-tertiary);
        }

        .category-pill.active {
          background-color: var(--accent);
          color: #ffffff;
          border-color: var(--accent);
        }

        .search-wrapper {
          position: relative;
          width: 100%;
          max-width: 320px;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          width: 18px;
          height: 18px;
          color: var(--text-muted);
        }

        .search-input {
          width: 100%;
          padding: 0.5rem 1rem 0.5rem 2.25rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          font-size: 0.9rem;
        }

        /* Services grid */
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }

        .service-card {
          padding: 0;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          background-color: var(--bg-primary);
        }

        .service-img-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16/10;
          overflow: hidden;
          border-bottom: 1px solid var(--border-color);
        }

        .service-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .availability-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .availability-badge.available {
          background-color: var(--success-light);
          color: var(--success);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        
        .availability-badge.busy {
          background-color: var(--warning-light);
          color: var(--warning);
          border: 1px solid rgba(249, 115, 22, 0.2);
        }
        
        .availability-badge.unavailable {
          background-color: var(--danger-light);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .service-content {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .service-name {
          font-size: 1.35rem;
          font-weight: 750;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .service-desc {
          font-size: 0.925rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1.25rem;
          flex-grow: 1;
        }

        .service-meta-mini {
          display: flex;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .meta-icon {
          width: 14px;
          height: 14px;
        }

        .service-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-full {
          flex: 1;
        }

        /* Empty state */
        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 4rem 2rem;
          background-color: var(--bg-primary);
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: var(--text-secondary);
          max-width: 400px;
          margin-bottom: 1.5rem;
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          z-index: 1000;
        }

        .modal-content {
          position: relative;
          width: 100%;
          max-width: 850px;
          background-color: var(--bg-secondary);
          padding: 0;
          overflow: hidden;
          box-shadow: var(--shadow-xl);
        }

        .modal-close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          z-index: 10;
        }

        .modal-close-btn:hover {
          background-color: var(--danger-light);
          color: var(--danger);
          border-color: rgba(220, 38, 38, 0.2);
        }

        .close-icon {
          width: 18px;
          height: 18px;
        }

        .modal-body-layout {
          display: flex;
          max-height: 80vh;
        }

        .modal-img-column {
          width: 45%;
          border-right: 1px solid var(--border-color);
          background-color: var(--bg-primary);
        }

        .modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-info-column {
          width: 55%;
          padding: 3rem 2.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .modal-service-name {
          font-size: 1.75rem;
          font-weight: 800;
          margin-top: 0.75rem;
          margin-bottom: 1.25rem;
          color: var(--text-primary);
        }

        .modal-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1rem;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.15rem;
        }

        .detail-value {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .full-desc-wrapper {
          margin-bottom: 2.5rem;
        }

        .desc-title {
          font-size: 1rem;
          font-weight: 750;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .full-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.7;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: auto;
        }

        @media (max-width: 768px) {
          .marketplace-controls {
            flex-direction: column;
            align-items: stretch;
            padding: 1.5rem;
          }

          .search-wrapper {
            max-width: 100%;
          }

          .modal-body-layout {
            flex-direction: column;
            overflow-y: auto;
          }

          .modal-img-column {
            width: 100%;
            height: 200px;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
          }

          .modal-info-column {
            width: 100%;
            padding: 2rem;
          }
        }
      `}</style>
    </section>
  );
}
