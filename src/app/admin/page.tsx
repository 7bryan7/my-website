// src/app/admin/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  SiteSettings, NavbarItem, HeroSection, 
  Achievement, Project, Experience, Category, Service, MediaFile 
} from '@/services/db';
import './admin.css';

type ActiveTab = 'overview' | 'settings' | 'navbar' | 'achievements' | 'projects' | 'experience' | 'services' | 'media' | 'profile';

interface UploadTask {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'waiting' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

function generateUUID(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function AdminDashboard() {
  const router = useRouter();
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Content states
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [navbarItems, setNavbarItems] = useState<NavbarItem[]>([]);
  const [hero, setHero] = useState<HeroSection | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  // UI state
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Media Batch Upload states
  const [uploadQueue, setUploadQueue] = useState<UploadTask[]>([]);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [duplicateBatch, setDuplicateBatch] = useState<{
    files: File[];
    duplicates: File[];
    strategy: 'replace' | 'keep-both' | 'skip';
  } | null>(null);
  
  // Editor state modals
  const [activeModal, setActiveModal] = useState<{
    type: 'achievement' | 'project' | 'experience' | 'service' | 'none';
    mode: 'add' | 'edit';
    item: any;
  }>({ type: 'none', mode: 'add', item: null });

  const [categoryName, setCategoryName] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragSection, setDragSection] = useState<'achievements' | 'projects' | 'experience' | 'services' | null>(null);

  // File upload refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Session verification on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/check');
        if (res.ok) {
          setIsAuthenticated(true);
          fetchDashboardData();
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Fetch all dashboard data
  const fetchDashboardData = async () => {
    setIsLoadingContent(true);
    try {
      const res = await fetch('/api/cms');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setNavbarItems(data.navbarItems);
        setHero(data.hero);
        setAchievements(data.achievements);
        setProjects(data.projects);
        setExperiences(data.experiences);
        setCategories(data.categories);
        setServices(data.services);
      }
      
      // Fetch media library separately
      const mediaRes = await fetch('/api/media');
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        setMediaFiles(mediaData);
      }
    } catch (err) {
      console.error('Failed to load dashboard contents:', err);
      showToast('Error loading dashboard data');
    } finally {
      setIsLoadingContent(false);
    }
  };

  // 3. Auth Actions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, rememberMe })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        setLoginError(data.error || 'Incorrect password.');
      }
    } catch {
      setLoginError('Server connection error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      // Clean up states
      setSettings(null);
      setNavbarItems([]);
      setHero(null);
      setAchievements([]);
      setProjects([]);
      setExperiences([]);
      setServices([]);
      setMediaFiles([]);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // 4. Save Operations
  const saveCmsData = async (action: string, payload: any) => {
    setIsSaving(true);
    try {
      console.log(`[CMS Save] Action: ${action}`, payload);
      const res = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save changes');
      showToast('Changes saved successfully');
      console.log(`[CMS Save] Action ${action} succeeded.`);
      await fetchDashboardData();
      return data.result;
    } catch (err: any) {
      console.error(`[CMS Save] Action ${action} failed:`, err);
      showToast(err.message || 'Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  // Media upload triggers
  const processSelectedFiles = (selectedFiles: File[]) => {
    const ALLOWED_MIME_TYPES = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf'
    ];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    const validFiles: File[] = [];
    const invalidFiles: { name: string; reason: string }[] = [];
    
    selectedFiles.forEach(file => {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        invalidFiles.push({ name: file.name, reason: 'Only images (JPG/PNG/WEBP/SVG) and PDFs are allowed.' });
      } else if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push({ name: file.name, reason: 'Exceeds 5MB size limit.' });
      } else {
        validFiles.push(file);
      }
    });
    
    if (invalidFiles.length > 0) {
      alert('The following files were skipped:\n' + invalidFiles.map(f => `• ${f.name}: ${f.reason}`).join('\n'));
    }
    
    if (validFiles.length === 0) return;
    
    // Check for duplicates
    const duplicateFiles = validFiles.filter(file => 
      mediaFiles.some(mf => mf.filename === file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_'))
    );
    
    if (duplicateFiles.length > 0) {
      setDuplicateBatch({
        files: validFiles,
        duplicates: duplicateFiles,
        strategy: 'keep-both'
      });
    } else {
      executeUpload(validFiles, 'keep-both');
    }
  };

  const executeUpload = async (files: File[], strategy: 'replace' | 'keep-both' | 'skip') => {
    // Build upload tasks
    const tasks: UploadTask[] = files.map(file => ({
      id: generateUUID(),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'waiting'
    }));
    
    setUploadQueue(tasks);
    setShowUploadProgress(true);
    setIsUploadingBatch(true);
    
    const limit = 3;
    const pendingFiles = [...files];
    
    const runWorker = async () => {
      while (pendingFiles.length > 0) {
        const file = pendingFiles.shift();
        if (!file) break;
        
        // Update task status
        setUploadQueue(prev => prev.map(t => t.name === file.name ? { ...t, status: 'uploading', progress: 10 } : t));
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('duplicateStrategy', strategy);
          
          const progressInterval = setInterval(() => {
            setUploadQueue(prev => prev.map(t => {
              if (t.name === file.name && t.status === 'uploading' && t.progress < 95) {
                return { ...t, progress: t.progress + 15 };
              }
              return t;
            }));
          }, 200);

          const res = await fetch('/api/media', {
            method: 'POST',
            body: formData
          });
          clearInterval(progressInterval);
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Upload failed');
          
          setUploadQueue(prev => prev.map(t => t.name === file.name ? { ...t, status: 'completed', progress: 100 } : t));
        } catch (err: any) {
          console.error(`Upload failed for ${file.name}:`, err);
          setUploadQueue(prev => prev.map(t => t.name === file.name ? { ...t, status: 'failed', error: err.message || 'Upload failed', progress: 100 } : t));
        }
      }
    };
    
    const workers = Array.from({ length: Math.min(limit, files.length) }, runWorker);
    await Promise.all(workers);
    
    showToast('Batch upload process completed');
    fetchDashboardData();
    setIsUploadingBatch(false);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processSelectedFiles(Array.from(files));
    e.target.value = '';
  };

  const handleMediaDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleMediaDelete = async (id: string, filename: string) => {
    if (!confirm('Are you sure you want to delete this file? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/media?id=${id}&filename=${filename}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('File deleted successfully');
        fetchDashboardData();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Deletion failed');
      }
    } catch (err: any) {
      showToast(err.message || 'File deletion failed');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Link copied to clipboard!');
  };

  // Profile password modification
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    await saveCmsData('updateSettings', { passwordPlain: passwordForm.new } as any);
    setPasswordForm({ current: '', new: '', confirm: '' });
    showToast('Password changed successfully');
  };

  // Drag and drop handlers
  const handleDragStart = (index: number, section: typeof dragSection) => {
    setDraggedIndex(index);
    setDragSection(section);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (index: number) => {
    if (draggedIndex === null || !dragSection) return;
    
    if (dragSection === 'achievements') {
      const items = [...achievements];
      const dragged = items[draggedIndex];
      items.splice(draggedIndex, 1);
      items.splice(index, 0, dragged);
      setAchievements(items);
      await saveCmsData('reorderAchievements', { ids: items.map(item => item.id) });
    } else if (dragSection === 'projects') {
      const items = [...projects];
      const dragged = items[draggedIndex];
      items.splice(draggedIndex, 1);
      items.splice(index, 0, dragged);
      setProjects(items);
      await saveCmsData('reorderProjects', { ids: items.map(item => item.id) });
    } else if (dragSection === 'experience') {
      const items = [...experiences];
      const dragged = items[draggedIndex];
      items.splice(draggedIndex, 1);
      items.splice(index, 0, dragged);
      setExperiences(items);
      await saveCmsData('reorderExperiences', { ids: items.map(item => item.id) });
    } else if (dragSection === 'services') {
      const items = [...services];
      const dragged = items[draggedIndex];
      items.splice(draggedIndex, 1);
      items.splice(index, 0, dragged);
      setServices(items);
      await saveCmsData('reorderServices', { ids: items.map(item => item.id) });
    }

    setDraggedIndex(null);
    setDragSection(null);
  };

  // 5. Auth Loading Screen
  if (isAuthenticated === null) {
    return (
      <div className="login-container">
        <div className="spinner"></div>
      </div>
    );
  }

  // 6. Login Screen View
  if (!isAuthenticated) {
    return (
      <div className="login-container admin-body">
        <div className="glass-card login-card animate-fade-in">
          <h1 className="login-title">Admin Access</h1>
          <p className="login-subtitle">Provide administrator credentials to update website content.</p>

          {loginError && <div className="login-error">{loginError}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label htmlFor="admin-pw" className="form-label">Password</label>
              <input
                type="password"
                id="admin-pw"
                required
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
              />
            </div>

            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Keep me logged in
            </label>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Verifying...' : 'Authorize Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 7. Render Dashboard
  return (
    <div className="admin-body">
      <div className="dashboard-layout">
        
        {/* Toast Notification Banner */}
        {toast.show && (
          <div className="toast-notification">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 18, height: 18 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            {toast.message}
          </div>
        )}

        {/* Sidebar Panel */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            AI CMS <span className="sidebar-badge">Portal</span>
          </div>

          <nav className="sidebar-nav">
            <button onClick={() => setActiveTab('overview')} className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}>
              Overview
            </button>
            <button onClick={() => setActiveTab('settings')} className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}>
              Hero & Settings
            </button>
            <button onClick={() => setActiveTab('navbar')} className={`sidebar-link ${activeTab === 'navbar' ? 'active' : ''}`}>
              Navbar Links
            </button>
            <button onClick={() => setActiveTab('achievements')} className={`sidebar-link ${activeTab === 'achievements' ? 'active' : ''}`}>
              Achievements
            </button>
            <button onClick={() => setActiveTab('projects')} className={`sidebar-link ${activeTab === 'projects' ? 'active' : ''}`}>
              Projects
            </button>
            <button onClick={() => setActiveTab('experience')} className={`sidebar-link ${activeTab === 'experience' ? 'active' : ''}`}>
              Experience
            </button>
            <button onClick={() => setActiveTab('services')} className={`sidebar-link ${activeTab === 'services' ? 'active' : ''}`}>
              Services Marketplace
            </button>
            <button onClick={() => setActiveTab('media')} className={`sidebar-link ${activeTab === 'media' ? 'active' : ''}`}>
              Media Library
            </button>
            <button onClick={() => setActiveTab('profile')} className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}>
              Admin Profile
            </button>
          </nav>

          <div className="sidebar-footer">
            <button onClick={handleLogout} className="btn btn-outline btn-full btn-delete-media">
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Editor Panel */}
        <main className="main-content">
          
          {isLoadingContent ? (
            <div className="flex-center" style={{ minHeight: '60vh' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="animate-fade-in">
                  <div className="dashboard-header">
                    <div>
                      <h1 className="dashboard-title">CMS Dashboard</h1>
                      <p className="dashboard-subtitle">Manage portfolio items, images, and visual settings.</p>
                    </div>
                  </div>

                  <div className="stats-grid">
                    <div className="glass-card stat-card">
                      <div className="stat-num">{projects.length}</div>
                      <div className="stat-label">Projects</div>
                    </div>
                    <div className="glass-card stat-card">
                      <div className="stat-num">{experiences.length}</div>
                      <div className="stat-label">Jobs</div>
                    </div>
                    <div className="glass-card stat-card">
                      <div className="stat-num">{achievements.length}</div>
                      <div className="stat-label">Certificates</div>
                    </div>
                    <div className="glass-card stat-card">
                      <div className="stat-num">{services.length}</div>
                      <div className="stat-label">Services</div>
                    </div>
                  </div>

                  <div className="glass-card editor-card">
                    <h3 className="editor-card-title" style={{ marginBottom: '1rem' }}>CMS Local State</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Currently running in <strong>{process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Supabase Sync Mode' : 'Local File Mode'}</strong>.
                      {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
                        <span> Content writes are saved locally to <code>src/data/db.json</code>. Fill in Supabase credentials in your env files to auto-migrate.</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && settings && hero && (
                <div className="animate-fade-in">
                  <h1 className="dashboard-title">Hero & Site Settings</h1>
                  <p className="dashboard-subtitle" style={{ marginBottom: '2.5rem' }}>Configure basic details, headers, contact lists, and SEO options.</p>

                  <div className="glass-card editor-card">
                    <div className="editor-card-header">
                      <h3 className="editor-card-title">Hero Header Block</h3>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Professional Heading</label>
                      <input 
                        type="text" 
                        value={hero.heading} 
                        onChange={(e) => setHero({ ...hero, heading: e.target.value })} 
                        className="form-input" 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Short Introduction</label>
                      <textarea 
                        value={hero.introduction} 
                        onChange={(e) => setHero({ ...hero, introduction: e.target.value })} 
                        className="form-textarea" 
                      />
                    </div>

                    <div className="editor-grid-2">
                      <div className="form-group">
                        <label className="form-label">Background Animation Type</label>
                        <select 
                          value={hero.animationType} 
                          onChange={(e) => setHero({ ...hero, animationType: e.target.value as any })}
                          className="form-select"
                        >
                          <option value="particles">Lightweight Canvas Network</option>
                          <option value="none">Solid Clean Canvas</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Avatar/Logo Image URL</label>
                        <input 
                          type="text" 
                          value={hero.logoUrl} 
                          onChange={(e) => setHero({ ...hero, logoUrl: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                    </div>

                    <div className="editor-grid-2">
                      <div className="form-group">
                        <label className="form-label">Primary CTA Text</label>
                        <input 
                          type="text" 
                          value={hero.ctaPrimaryText} 
                          onChange={(e) => setHero({ ...hero, ctaPrimaryText: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Primary CTA Link</label>
                        <input 
                          type="text" 
                          value={hero.ctaPrimaryHref} 
                          onChange={(e) => setHero({ ...hero, ctaPrimaryHref: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                    </div>

                    <div className="editor-grid-2">
                      <div className="form-group">
                        <label className="form-label">Secondary CTA Text</label>
                        <input 
                          type="text" 
                          value={hero.ctaSecondaryText} 
                          onChange={(e) => setHero({ ...hero, ctaSecondaryText: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Secondary CTA Link</label>
                        <input 
                          type="text" 
                          value={hero.ctaSecondaryHref} 
                          onChange={(e) => setHero({ ...hero, ctaSecondaryHref: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => saveCmsData('updateHero', hero)} 
                      className="btn btn-primary"
                    >
                      Save Hero Block
                    </button>
                  </div>

                  <div className="glass-card editor-card">
                    <div className="editor-card-header">
                      <h3 className="editor-card-title">Contact & Social Info</h3>
                    </div>

                    <div className="editor-grid-2">
                      <div className="form-group">
                        <label className="form-label">Contact Phone</label>
                        <input 
                          type="text" 
                          value={settings.contactPhone} 
                          onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Contact Email</label>
                        <input 
                          type="email" 
                          value={settings.contactEmail} 
                          onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                    </div>

                    <div className="editor-grid-2">
                      <div className="form-group">
                        <label className="form-label">LinkedIn Profile URL</label>
                        <input 
                          type="text" 
                          value={settings.linkedinUrl} 
                          onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">GitHub Profile URL</label>
                        <input 
                          type="text" 
                          value={settings.githubUrl} 
                          onChange={(e) => setSettings({ ...settings, githubUrl: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                    </div>

                    <div className="editor-grid-2">
                      <div className="form-group">
                        <label className="form-label">X/Twitter Profile URL</label>
                        <input 
                          type="text" 
                          value={settings.twitterUrl} 
                          onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Resume PDF URL</label>
                        <input 
                          type="text" 
                          value={settings.resumeUrl} 
                          onChange={(e) => setSettings({ ...settings, resumeUrl: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Copyright Footer Text</label>
                      <input 
                        type="text" 
                        value={settings.copyrightText} 
                        onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })} 
                        className="form-input" 
                      />
                    </div>

                    <button 
                      onClick={() => saveCmsData('updateSettings', settings)} 
                      className="btn btn-primary"
                    >
                      Save Contacts
                    </button>
                  </div>

                  <div className="glass-card editor-card">
                    <div className="editor-card-header">
                      <h3 className="editor-card-title">SEO & Metadata</h3>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Meta HTML Title</label>
                      <input 
                        type="text" 
                        value={settings.seoMetadata.title} 
                        onChange={(e) => setSettings({ 
                          ...settings, 
                          seoMetadata: { ...settings.seoMetadata, title: e.target.value } 
                        })} 
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Meta Description</label>
                      <textarea 
                        value={settings.seoMetadata.description} 
                        onChange={(e) => setSettings({ 
                          ...settings, 
                          seoMetadata: { ...settings.seoMetadata, description: e.target.value } 
                        })} 
                        className="form-textarea" 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Search Keywords (comma-separated)</label>
                      <input 
                        type="text" 
                        value={settings.seoMetadata.keywords} 
                        onChange={(e) => setSettings({ 
                          ...settings, 
                          seoMetadata: { ...settings.seoMetadata, keywords: e.target.value } 
                        })} 
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">OpenGraph Social Share Image URL</label>
                      <input 
                        type="text" 
                        value={settings.seoMetadata.ogImage} 
                        onChange={(e) => setSettings({ 
                          ...settings, 
                          seoMetadata: { ...settings.seoMetadata, ogImage: e.target.value } 
                        })} 
                        className="form-input" 
                      />
                    </div>

                    <button 
                      onClick={() => saveCmsData('updateSettings', settings)} 
                      className="btn btn-primary"
                    >
                      Save SEO
                    </button>
                  </div>
                </div>
              )}

              {/* Navbar Tab */}
              {activeTab === 'navbar' && (
                <div className="animate-fade-in">
                  <h1 className="dashboard-title">Navbar Setup</h1>
                  <p className="dashboard-subtitle" style={{ marginBottom: '2.5rem' }}>Configure navigation links, section titles, and toggle visibility.</p>

                  <div className="glass-card editor-card">
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Label</th>
                            <th>Target Anchors</th>
                            <th>Display Order</th>
                            <th>Visibility Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {navbarItems.map((item, index) => (
                            <tr key={item.id}>
                              <td>
                                <input 
                                  type="text" 
                                  value={item.label} 
                                  onChange={(e) => {
                                    const updated = [...navbarItems];
                                    updated[index].label = e.target.value;
                                    setNavbarItems(updated);
                                  }}
                                  className="form-input"
                                  style={{ padding: '0.4rem 0.75rem' }}
                                />
                              </td>
                              <td><code>{item.href}</code></td>
                              <td>
                                <input 
                                  type="number" 
                                  value={item.displayOrder} 
                                  onChange={(e) => {
                                    const updated = [...navbarItems];
                                    updated[index].displayOrder = parseInt(e.target.value) || index + 1;
                                    setNavbarItems(updated);
                                  }}
                                  className="form-input"
                                  style={{ width: '80px', padding: '0.4rem 0.75rem' }}
                                />
                              </td>
                              <td>
                                <label className="switch">
                                  <input 
                                    type="checkbox" 
                                    checked={item.isVisible} 
                                    onChange={(e) => {
                                      const updated = [...navbarItems];
                                      updated[index].isVisible = e.target.checked;
                                      setNavbarItems(updated);
                                    }}
                                  />
                                  <span className="slider"></span>
                                </label>
                              </td>
                              <td>
                                <span className={`badge-status ${item.isVisible ? 'available' : 'unavailable'}`}>
                                  {item.isVisible ? 'Published' : 'Hidden Draft'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button 
                      onClick={() => saveCmsData('updateNavbar', navbarItems)} 
                      className="btn btn-primary"
                    >
                      Save Navbar Layout
                    </button>
                  </div>
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div className="animate-fade-in">
                  <div className="dashboard-header">
                    <div>
                      <h1 className="dashboard-title">Achievements & Credentials</h1>
                      <p className="dashboard-subtitle">Manage certificates. Drag rows by details to reorder.</p>
                    </div>
                    <button 
                      onClick={() => setActiveModal({
                        type: 'achievement', mode: 'add', item: {
                          id: generateUUID(), title: '', issuingOrg: '', issueDate: '', description: '', imageUrl: '', credentialUrl: '', displayOrder: achievements.length + 1, isVisible: true
                        }
                      })}
                      className="btn btn-primary"
                    >
                      Add Certificate
                    </button>
                  </div>

                  <div className="glass-card editor-card">
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th style={{ width: '40px' }}>Sort</th>
                            <th>Credential Title</th>
                            <th>Issuing Organization</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {achievements.map((ach, idx) => (
                            <tr 
                              key={ach.id}
                              draggable
                              onDragStart={() => handleDragStart(idx, 'achievements')}
                              onDragOver={(e) => handleDragOver(e, idx)}
                              onDrop={() => handleDrop(idx)}
                              className="draggable-row"
                            >
                              <td className="drag-handle">☰</td>
                              <td><strong>{ach.title}</strong></td>
                              <td>{ach.issuingOrg}</td>
                              <td>{ach.issueDate}</td>
                              <td>
                                <span className={`badge-status ${ach.isVisible ? 'available' : 'unavailable'}`}>
                                  {ach.isVisible ? 'Published' : 'Hidden'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button 
                                    onClick={() => setActiveModal({ type: 'achievement', mode: 'edit', item: ach })}
                                    className="btn btn-outline"
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (confirm('Delete achievement?')) {
                                        saveCmsData('deleteAchievement', { id: ach.id });
                                      }
                                    }}
                                    className="btn btn-outline btn-delete-media"
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <div className="animate-fade-in">
                  <div className="dashboard-header">
                    <div>
                      <h1 className="dashboard-title">Projects Portfolio</h1>
                      <p className="dashboard-subtitle">Manage project cards. Drag rows to sort display layout.</p>
                    </div>
                    <button 
                      onClick={() => setActiveModal({
                        type: 'project', mode: 'add', item: {
                          id: generateUUID(), title: '', description: '', technologies: [], imageUrl: '', githubUrl: '', liveUrl: '', docUrl: '', displayOrder: projects.length + 1, isVisible: true
                        }
                      })}
                      className="btn btn-primary"
                    >
                      Add Project Card
                    </button>
                  </div>

                  <div className="glass-card editor-card">
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th style={{ width: '40px' }}>Sort</th>
                            <th>Project Title</th>
                            <th>Tech Stack</th>
                            <th>Visibility</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects.map((proj, idx) => (
                            <tr 
                              key={proj.id}
                              draggable
                              onDragStart={() => handleDragStart(idx, 'projects')}
                              onDragOver={(e) => handleDragOver(e, idx)}
                              onDrop={() => handleDrop(idx)}
                              className="draggable-row"
                            >
                              <td className="drag-handle">☰</td>
                              <td><strong>{proj.title}</strong></td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                  {proj.technologies.slice(0, 3).map((tech, i) => (
                                    <span key={i} className="skill-tag" style={{ fontSize: '0.7rem' }}>{tech}</span>
                                  ))}
                                  {proj.technologies.length > 3 && '...'}
                                </div>
                              </td>
                              <td>
                                <span className={`badge-status ${proj.isVisible ? 'available' : 'unavailable'}`}>
                                  {proj.isVisible ? 'Published' : 'Hidden'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button 
                                    onClick={() => setActiveModal({ type: 'project', mode: 'edit', item: proj })}
                                    className="btn btn-outline"
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (confirm('Delete project?')) {
                                        saveCmsData('deleteProject', { id: proj.id });
                                      }
                                    }}
                                    className="btn btn-outline btn-delete-media"
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Tab */}
              {activeTab === 'experience' && (
                <div className="animate-fade-in">
                  <div className="dashboard-header">
                    <div>
                      <h1 className="dashboard-title">Professional Experience</h1>
                      <p className="dashboard-subtitle">Manage company details, timeline roles, and skill badges.</p>
                    </div>
                    <button 
                      onClick={() => setActiveModal({
                        type: 'experience', mode: 'add', item: {
                          id: generateUUID(), companyName: '', position: '', duration: '', description: '', skills: [], logoUrl: '', displayOrder: experiences.length + 1, isVisible: true
                        }
                      })}
                      className="btn btn-primary"
                    >
                      Add Experience
                    </button>
                  </div>

                  <div className="glass-card editor-card">
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th style={{ width: '40px' }}>Sort</th>
                            <th>Company</th>
                            <th>Position</th>
                            <th>Timeline</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {experiences.map((exp, idx) => (
                            <tr 
                              key={exp.id}
                              draggable
                              onDragStart={() => handleDragStart(idx, 'experience')}
                              onDragOver={(e) => handleDragOver(e, idx)}
                              onDrop={() => handleDrop(idx)}
                              className="draggable-row"
                            >
                              <td className="drag-handle">☰</td>
                              <td><strong>{exp.companyName}</strong></td>
                              <td>{exp.position}</td>
                              <td>{exp.duration}</td>
                              <td>
                                <span className={`badge-status ${exp.isVisible ? 'available' : 'unavailable'}`}>
                                  {exp.isVisible ? 'Published' : 'Hidden'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button 
                                    onClick={() => setActiveModal({ type: 'experience', mode: 'edit', item: exp })}
                                    className="btn btn-outline"
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (confirm('Delete experience?')) {
                                        saveCmsData('deleteExperience', { id: exp.id });
                                      }
                                    }}
                                    className="btn btn-outline btn-delete-media"
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Services Tab */}
              {activeTab === 'services' && (
                <div className="animate-fade-in">
                  <div className="dashboard-header">
                    <div>
                      <h1 className="dashboard-title">Services Marketplace</h1>
                      <p className="dashboard-subtitle">Manage service packages and customize category tags.</p>
                    </div>
                    <button 
                      onClick={() => setActiveModal({
                        type: 'service', mode: 'add', item: {
                          id: generateUUID(), categoryId: categories[0]?.id || '', name: '', shortDescription: '', fullDescription: '', imageUrl: '', availabilityStatus: 'available', duration: '', pricing: '', btnText: 'Avail Service', btnLink: '#contact', displayOrder: services.length + 1, isVisible: true
                        }
                      })}
                      className="btn btn-primary"
                    >
                      Add Service Offer
                    </button>
                  </div>

                  <div className="glass-card editor-card">
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th style={{ width: '40px' }}>Sort</th>
                            <th>Service Name</th>
                            <th>Category</th>
                            <th>Availability</th>
                            <th>Pricing</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {services.map((srv, idx) => (
                            <tr 
                              key={srv.id}
                              draggable
                              onDragStart={() => handleDragStart(idx, 'services')}
                              onDragOver={(e) => handleDragOver(e, idx)}
                              onDrop={() => handleDrop(idx)}
                              className="draggable-row"
                            >
                              <td className="drag-handle">☰</td>
                              <td><strong>{srv.name}</strong></td>
                              <td>{categories.find(c => c.id === srv.categoryId)?.name || 'Unassigned'}</td>
                              <td>
                                <span className={`badge-status ${srv.availabilityStatus}`}>
                                  {srv.availabilityStatus}
                                </span>
                              </td>
                              <td>{srv.pricing || 'Free'}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button 
                                    onClick={() => setActiveModal({ type: 'service', mode: 'edit', item: srv })}
                                    className="btn btn-outline"
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (confirm('Delete service?')) {
                                        saveCmsData('deleteService', { id: srv.id });
                                      }
                                    }}
                                    className="btn btn-outline btn-delete-media"
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Category Management Block */}
                    <div className="category-manager">
                      <h4 className="editor-card-title" style={{ marginBottom: '1rem' }}>Manage Categories</h4>
                      
                      <div className="category-add-row">
                        <input
                          type="text"
                          placeholder="Add new category (e.g. Consulting)"
                          className="form-input"
                          style={{ maxWidth: '300px' }}
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                        />
                        <button
                          onClick={async () => {
                            if (!categoryName.trim()) return;
                            await saveCmsData('saveCategory', {
                              id: `cat-${Date.now()}`,
                              name: categoryName.trim(),
                              displayOrder: categories.length + 1
                            });
                            setCategoryName('');
                          }}
                          className="btn btn-primary"
                        >
                          Add Category
                        </button>
                      </div>

                      <div className="category-tags">
                        {categories.map((cat) => (
                          <div key={cat.id} className="category-tag">
                            {cat.name}
                            <button
                              onClick={() => {
                                if (confirm(`Deleting "${cat.name}" will delete or orphand its corresponding services. Proceed?`)) {
                                  saveCmsData('deleteCategory', { id: cat.id });
                                }
                              }}
                              className="category-delete-btn"
                              title="Delete category"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Media Library Tab */}
              {activeTab === 'media' && (
                <div 
                  className={`animate-fade-in drag-drop-zone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleMediaDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDropFiles}
                  style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', position: 'relative' }}
                >
                  {isDragging && (
                    <div className="drag-drop-overlay">
                      <div className="drag-drop-overlay-box">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 48, height: 48, color: 'var(--accent)', marginBottom: '1rem', display: 'inline-block' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                        </svg>
                        <h3>Drop files here to upload</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Images and PDFs up to 5MB</p>
                      </div>
                    </div>
                  )}

                  <div className="dashboard-header">
                    <div>
                      <h1 className="dashboard-title">Media Library</h1>
                      <p className="dashboard-subtitle">Upload and link certificates, image attachments, or resume PDFs (Max 5MB). Drag-and-drop supported.</p>
                    </div>
                    
                    <div className="file-input-wrapper">
                      <button className="btn btn-primary" disabled={isUploadingBatch}>
                        {isUploadingBatch ? 'Uploading...' : 'Upload Files'}
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleMediaUpload} 
                        accept="image/*,application/pdf"
                        multiple
                        disabled={isUploadingBatch}
                      />
                    </div>
                  </div>

                  <div className="glass-card editor-card">
                    {mediaFiles.length > 0 ? (
                      <div className="media-grid">
                        {mediaFiles.map((file) => (
                          <div key={file.id} className="media-item-card">
                            <div className="media-preview-box">
                              {file.fileType.startsWith('image/') ? (
                                <img src={file.filepath} alt={file.filename} className="media-preview-img" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="media-file-icon">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                              )}
                            </div>

                            <div className="media-meta-box">
                              <span className="media-name" title={file.filename}>{file.filename}</span>
                              <span className="media-size">{(file.sizeBytes / 1024).toFixed(1)} KB</span>
                              
                              <div className="media-actions">
                                <button
                                  onClick={() => copyToClipboard(file.filepath)}
                                  className="btn-icon-only btn-copy-link"
                                  title="Copy relative file URL link"
                                >
                                  Link
                                </button>
                                <button
                                  onClick={() => handleMediaDelete(file.id, file.filename)}
                                  className="btn-icon-only btn-delete-media"
                                  title="Delete file permanently"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="empty-icon">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        <h3>Media Library is Empty</h3>
                        <p>No media files uploaded yet. Upload PDFs or images to start attaching files to your cards.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Profile Tab */}
              {activeTab === 'profile' && (
                <div className="animate-fade-in">
                  <h1 className="dashboard-title">Admin Profile</h1>
                  <p className="dashboard-subtitle" style={{ marginBottom: '2.5rem' }}>Modify security settings and change access passwords.</p>

                  <div className="glass-card editor-card" style={{ maxWidth: '500px' }}>
                    <div className="editor-card-header">
                      <h3 className="editor-card-title">Change Password</h3>
                    </div>

                    {passwordError && <div className="login-error" style={{ marginBottom: '1.5rem' }}>{passwordError}</div>}

                    <form onSubmit={handlePasswordChange}>
                      <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          required
                          value={passwordForm.new}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                          className="form-input"
                          placeholder="At least 6 characters"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                          className="form-input"
                          placeholder="Re-enter new password"
                        />
                      </div>

                      <button type="submit" className="btn btn-primary">
                        Update Password
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Editor Modal Overlays for adding/editing items */}
      {activeModal.type !== 'none' && (
        <div className="modal-overlay" onClick={() => setActiveModal({ type: 'none', mode: 'add', item: null })}>
          <div className="modal-content glass-card animate-fade-in" style={{ padding: '2.5rem', maxWidth: '650px', backgroundColor: 'var(--bg-secondary)' }} onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn"
              onClick={() => setActiveModal({ type: 'none', mode: 'add', item: null })}
              style={{ top: '1.5rem', right: '1.5rem' }}
            >
              ✕
            </button>

            <h3 className="editor-card-title" style={{ marginBottom: '1.5rem' }}>
              {activeModal.mode === 'add' ? 'Add' : 'Edit'} {activeModal.type.charAt(0).toUpperCase() + activeModal.type.slice(1)}
            </h3>

            {/* Modal fields for Achievements */}
            {activeModal.type === 'achievement' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                await saveCmsData('saveAchievement', activeModal.item);
                setActiveModal({ type: 'none', mode: 'add', item: null });
              }}>
                <div className="form-group">
                  <label className="form-label">Certificate Title *</label>
                  <input
                    type="text"
                    required
                    value={activeModal.item.title}
                    onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, title: e.target.value } })}
                    className="form-input"
                  />
                </div>
                <div className="editor-grid-2">
                  <div className="form-group">
                    <label className="form-label">Issuing Org *</label>
                    <input
                      type="text"
                      required
                      value={activeModal.item.issuingOrg}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, issuingOrg: e.target.value } })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issue Date *</label>
                    <input
                      type="text"
                      required
                      value={activeModal.item.issueDate}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, issueDate: e.target.value } })}
                      className="form-input"
                      placeholder="YYYY-MM"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Credential Verification Link</label>
                  <input
                    type="text"
                    value={activeModal.item.credentialUrl || ''}
                    onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, credentialUrl: e.target.value } })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Certificate Image URL *</label>
                  <input
                    type="text"
                    required
                    value={activeModal.item.imageUrl}
                    onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, imageUrl: e.target.value } })}
                    className="form-input"
                    placeholder="/uploads/filename.jpg (Copy from Media Library)"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Brief Description</label>
                  <textarea
                    value={activeModal.item.description}
                    onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, description: e.target.value } })}
                    className="form-textarea"
                  />
                </div>
                <div className="form-group">
                  <label className="switch" style={{ marginRight: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={activeModal.item.isVisible}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, isVisible: e.target.checked } })}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="form-label" style={{ display: 'inline' }}>Publish instantly</span>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Certificate'}
                </button>
              </form>
            )}

            {/* Modal fields for Projects */}
            {activeModal.type === 'project' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                await saveCmsData('saveProject', activeModal.item);
                setActiveModal({ type: 'none', mode: 'add', item: null });
              }}>
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={activeModal.item.title}
                    onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, title: e.target.value } })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Technologies (comma-separated list) *</label>
                  <input
                    type="text"
                    required
                    value={activeModal.item.technologies.join(', ')}
                    onChange={(e) => setActiveModal({ 
                      ...activeModal, 
                      item: { 
                        ...activeModal.item, 
                        technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                      } 
                    })}
                    className="form-input"
                    placeholder="React, Next.js, Python, Pinecone"
                  />
                </div>
                <div className="editor-grid-2">
                  <div className="form-group">
                    <label className="form-label">GitHub URL</label>
                    <input
                      type="text"
                      value={activeModal.item.githubUrl || ''}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, githubUrl: e.target.value } })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Live Demo URL</label>
                    <input
                      type="text"
                      value={activeModal.item.liveUrl || ''}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, liveUrl: e.target.value } })}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="editor-grid-2">
                  <div className="form-group">
                    <label className="form-label">Documentation URL</label>
                    <input
                      type="text"
                      value={activeModal.item.docUrl || ''}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, docUrl: e.target.value } })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Thumbnail Image URL *</label>
                    <input
                      type="text"
                      required
                      value={activeModal.item.imageUrl}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, imageUrl: e.target.value } })}
                      className="form-input"
                      placeholder="/uploads/filename.jpg"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Project Description *</label>
                  <textarea
                    required
                    value={activeModal.item.description}
                    onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, description: e.target.value } })}
                    className="form-textarea"
                  />
                </div>
                <div className="form-group">
                  <label className="switch" style={{ marginRight: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={activeModal.item.isVisible}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, isVisible: e.target.checked } })}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="form-label" style={{ display: 'inline' }}>Publish project</span>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Project'}
                </button>
              </form>
            )}

            {/* Modal fields for Experience */}
            {activeModal.type === 'experience' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                await saveCmsData('saveExperience', activeModal.item);
                setActiveModal({ type: 'none', mode: 'add', item: null });
              }}>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={activeModal.item.companyName}
                    onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, companyName: e.target.value } })}
                    className="form-input"
                  />
                </div>
                <div className="editor-grid-2">
                  <div className="form-group">
                    <label className="form-label">Position Role *</label>
                    <input
                      type="text"
                      required
                      value={activeModal.item.position}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, position: e.target.value } })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration *</label>
                    <input
                      type="text"
                      required
                      value={activeModal.item.duration}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, duration: e.target.value } })}
                      className="form-input"
                      placeholder="e.g. 2024 - Present or 2022 - 2024"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Skills Utilized (comma-separated list) *</label>
                  <input
                    type="text"
                    required
                    value={activeModal.item.skills.join(', ')}
                    onChange={(e) => setActiveModal({ 
                      ...activeModal, 
                      item: { 
                        ...activeModal.item, 
                        skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                      } 
                    })}
                    className="form-input"
                    placeholder="Python, PyTorch, Docker, Kubernetes"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Logo Image URL *</label>
                  <input
                    type="text"
                    required
                    value={activeModal.item.logoUrl}
                    onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, logoUrl: e.target.value } })}
                    className="form-input"
                    placeholder="/uploads/logo-company.png"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description of Accomplishments *</label>
                  <textarea
                    required
                    value={activeModal.item.description}
                    onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, description: e.target.value } })}
                    className="form-textarea"
                  />
                </div>
                <div className="form-group">
                  <label className="switch" style={{ marginRight: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={activeModal.item.isVisible}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, isVisible: e.target.checked } })}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="form-label" style={{ display: 'inline' }}>Publish timeline role</span>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Experience'}
                </button>
              </form>
            )}

            {/* Modal fields for Services */}
            {activeModal.type === 'service' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                await saveCmsData('saveService', activeModal.item);
                setActiveModal({ type: 'none', mode: 'add', item: null });
              }}>
                <div className="form-group">
                  <label className="form-label">Service Package Name *</label>
                  <input
                    type="text"
                    required
                    value={activeModal.item.name}
                    onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, name: e.target.value } })}
                    className="form-input"
                  />
                </div>
                <div className="editor-grid-2">
                  <div className="form-group">
                    <label className="form-label">Marketplace Category *</label>
                    <select
                      value={activeModal.item.categoryId}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, categoryId: e.target.value } })}
                      className="form-select"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Availability Status</label>
                    <select
                      value={activeModal.item.availabilityStatus}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, availabilityStatus: e.target.value as any } })}
                      className="form-select"
                    >
                      <option value="available">Available Now</option>
                      <option value="busy">Waitlist Open</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>
                <div className="editor-grid-2">
                  <div className="form-group">
                    <label className="form-label">Duration Estimate *</label>
                    <input
                      type="text"
                      required
                      value={activeModal.item.duration}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, duration: e.target.value } })}
                      className="form-input"
                      placeholder="e.g. 2-4 weeks"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pricing Estimate (Optional)</label>
                    <input
                      type="text"
                      value={activeModal.item.pricing || ''}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, pricing: e.target.value } })}
                      className="form-input"
                      placeholder="e.g. From $5,000"
                    />
                  </div>
                </div>
                <div className="editor-grid-2">
                  <div className="form-group">
                    <label className="form-label">Button Action Link *</label>
                    <input
                      type="text"
                      required
                      value={activeModal.item.btnLink}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, btnLink: e.target.value } })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Thumbnail Icon Image URL *</label>
                    <input
                      type="text"
                      required
                      value={activeModal.item.imageUrl}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, imageUrl: e.target.value } })}
                      className="form-input"
                      placeholder="/uploads/srv-icon.jpg"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Short Tagline Description *</label>
                  <input
                    type="text"
                    required
                    value={activeModal.item.shortDescription}
                    onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, shortDescription: e.target.value } })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Scope Details (markdown supported) *</label>
                  <textarea
                    required
                    value={activeModal.item.fullDescription}
                    onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, fullDescription: e.target.value } })}
                    className="form-textarea"
                  />
                </div>
                <div className="form-group">
                  <label className="switch" style={{ marginRight: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={activeModal.item.isVisible}
                      onChange={(e) => setActiveModal({ ...activeModal, item: { ...activeModal.item, isVisible: e.target.checked } })}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="form-label" style={{ display: 'inline' }}>Publish service offering</span>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Service Offering'}
                </button>
              </form>
            )}
 
           </div>
         </div>
       )}

      {/* Duplicate Files Modal */}
      {duplicateBatch && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '500px', padding: '2rem' }}>
            <h3 className="editor-card-title" style={{ marginBottom: '1rem' }}>Duplicate Files Detected</h3>
            <p className="dashboard-subtitle" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              The following files already exist in your library. How would you like to resolve the conflicts?
            </p>
            
            <div style={{ maxHeight: '120px', overflowY: 'auto', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
              {duplicateBatch.duplicates.map(f => (
                <div key={f.name} style={{ fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                  📄 {f.name}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="dup-strat" 
                  checked={duplicateBatch.strategy === 'keep-both'} 
                  onChange={() => setDuplicateBatch({ ...duplicateBatch, strategy: 'keep-both' })} 
                />
                Keep Both (auto-rename files)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="dup-strat" 
                  checked={duplicateBatch.strategy === 'replace'} 
                  onChange={() => setDuplicateBatch({ ...duplicateBatch, strategy: 'replace' })} 
                />
                Replace/Overwrite existing files
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="dup-strat" 
                  checked={duplicateBatch.strategy === 'skip'} 
                  onChange={() => setDuplicateBatch({ ...duplicateBatch, strategy: 'skip' })} 
                />
                Skip duplicate files
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setDuplicateBatch(null)} 
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const strategy = duplicateBatch.strategy;
                  const files = duplicateBatch.strategy === 'skip'
                    ? duplicateBatch.files.filter(f => !duplicateBatch.duplicates.some(d => d.name === f.name))
                    : duplicateBatch.files;
                  setDuplicateBatch(null);
                  if (files.length > 0) {
                    executeUpload(files, strategy);
                  }
                }} 
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem' }}
              >
                Proceed Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Upload Progress Box */}
      {showUploadProgress && uploadQueue.length > 0 && (
        <div className="upload-progress-drawer glass-card">
          <div className="upload-drawer-header">
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
              {isUploadingBatch 
                ? `Uploading ${uploadQueue.filter(q => q.status === 'uploading' || q.status === 'waiting').length} items...`
                : 'Upload process complete'
              }
            </span>
            <button 
              onClick={() => {
                if (!isUploadingBatch) {
                  setShowUploadProgress(false);
                  setUploadQueue([]);
                } else {
                  showToast('Uploading in background. Please wait.');
                }
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              ✕
            </button>
          </div>
          
          <div className="upload-drawer-body">
            {/* Overall Progress */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                <span>Overall progress</span>
                <span>
                  {Math.round(uploadQueue.reduce((acc, t) => acc + t.progress, 0) / uploadQueue.length)}%
                </span>
              </div>
              <div style={{ height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    backgroundColor: 'var(--accent)', 
                    width: `${Math.round(uploadQueue.reduce((acc, t) => acc + t.progress, 0) / uploadQueue.length)}%`,
                    transition: 'width 0.2s ease'
                  }} 
                />
              </div>
            </div>
            
            {/* File List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              {uploadQueue.map(task => (
                <div key={task.id} style={{ display: 'flex', flexDirection: 'column', padding: '0.25rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '70%', fontWeight: 500 }} title={task.name}>
                      {task.name}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 600,
                        color: task.status === 'completed' ? 'var(--success)' : 
                               task.status === 'failed' ? 'var(--danger)' : 
                               task.status === 'uploading' ? 'var(--accent)' : 'var(--text-muted)'
                      }}
                    >
                      {task.status === 'completed' && '✓ Done'}
                      {task.status === 'failed' && '✗ Failed'}
                      {task.status === 'uploading' && 'Uploading'}
                      {task.status === 'waiting' && 'Waiting'}
                    </span>
                  </div>
                  {task.status === 'uploading' && (
                    <div style={{ height: '2px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '1px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', backgroundColor: 'var(--accent)', width: `${task.progress}%` }} />
                    </div>
                  )}
                  {task.status === 'failed' && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--danger)', marginTop: '0.1rem' }}>
                      {task.error || 'Upload failed'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
 
     </div>
   );
 }
