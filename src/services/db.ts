// src/services/db.ts

export interface SiteSettings {
  logoUrl: string;
  contactPhone: string;
  contactEmail: string;
  resumeUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  twitterUrl: string;
  otherSocials: Record<string, string>;
  copyrightText: string;
  passwordHash: string; // SHA-256 / PBKDF2 hash of admin password
  seoMetadata: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
  themeSettings: {
    defaultTheme: 'light' | 'dark';
    accentColor: string;
  };
}

export interface NavbarItem {
  id: string;
  label: string;
  href: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface HeroSection {
  heading: string;
  introduction: string;
  animationType: 'particles' | 'grid' | 'waves' | 'none';
  logoUrl: string;
  ctaPrimaryText: string;
  ctaPrimaryHref: string;
  ctaSecondaryText: string;
  ctaSecondaryHref: string;
}

export interface Achievement {
  id: string;
  title: string;
  issuingOrg: string;
  issueDate: string;
  description: string;
  imageUrl: string;
  credentialUrl?: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  githubUrl: string;
  liveUrl: string;
  docUrl?: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface Experience {
  id: string;
  companyName: string;
  position: string;
  duration: string;
  description: string;
  skills: string[];
  logoUrl: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface Category {
  id: string;
  name: string;
  displayOrder: number;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  availabilityStatus: 'available' | 'busy' | 'unavailable';
  duration: string; // e.g. "2 weeks"
  pricing?: string; // e.g. "$1,500"
  btnText: string;
  btnLink: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface MediaFile {
  id: string;
  filename: string;
  filepath: string;
  fileType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface DBProvider {
  getSettings(): Promise<SiteSettings>;
  updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings>;
  
  getNavbarItems(): Promise<NavbarItem[]>;
  updateNavbarItems(items: NavbarItem[]): Promise<NavbarItem[]>;
  
  getHero(): Promise<HeroSection>;
  updateHero(hero: Partial<HeroSection>): Promise<HeroSection>;
  
  getAchievements(): Promise<Achievement[]>;
  saveAchievement(achievement: Achievement): Promise<Achievement>;
  deleteAchievement(id: string): Promise<void>;
  reorderAchievements(ids: string[]): Promise<void>;
  
  getProjects(): Promise<Project[]>;
  saveProject(project: Project): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  reorderProjects(ids: string[]): Promise<void>;
  
  getExperiences(): Promise<Experience[]>;
  saveExperience(experience: Experience): Promise<Experience>;
  deleteExperience(id: string): Promise<void>;
  reorderExperiences(ids: string[]): Promise<void>;
  
  getCategories(): Promise<Category[]>;
  saveCategory(category: Category): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  
  getServices(): Promise<Service[]>;
  saveService(service: Service): Promise<Service>;
  deleteService(id: string): Promise<void>;
  reorderServices(ids: string[]): Promise<void>;
  
  getMediaFiles(): Promise<MediaFile[]>;
  saveMediaFile(file: MediaFile): Promise<MediaFile>;
  deleteMediaFile(id: string): Promise<void>;
}

// Singleton instances for providers
let dbInstance: DBProvider | null = null;

export async function getDB(): Promise<DBProvider> {
  if (dbInstance) return dbInstance;

  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (isSupabaseConfigured) {
    const { SupabaseDBProvider } = await import('./supabaseDb');
    dbInstance = new SupabaseDBProvider();
  } else {
    const { LocalDBProvider } = await import('./localDb');
    dbInstance = new LocalDBProvider();
  }

  return dbInstance;
}
