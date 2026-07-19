// src/services/supabaseDb.ts

import { createClient } from '@supabase/supabase-js';
import { 
  DBProvider, SiteSettings, NavbarItem, HeroSection, 
  Achievement, Project, Experience, Category, Service, MediaFile 
} from './db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize client only if env vars are present
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null;

// Helpers to map camelCase (app) to snake_case (DB)
const mapSettingsToDb = (s: Partial<SiteSettings>) => ({
  logo_url: s.logoUrl,
  contact_phone: s.contactPhone,
  contact_email: s.contactEmail,
  resume_url: s.resumeUrl,
  linkedin_url: s.linkedinUrl,
  github_url: s.githubUrl,
  twitter_url: s.twitterUrl,
  other_socials: s.otherSocials,
  copyright_text: s.copyrightText,
  password_hash: s.passwordHash,
  seo_metadata: s.seoMetadata,
  theme_settings: s.themeSettings
});

const mapSettingsFromDb = (row: any): SiteSettings => ({
  logoUrl: row.logo_url,
  contactPhone: row.contact_phone,
  contactEmail: row.contact_email,
  resumeUrl: row.resume_url,
  linkedinUrl: row.linkedin_url,
  githubUrl: row.github_url,
  twitterUrl: row.twitter_url,
  otherSocials: row.other_socials || {},
  copyrightText: row.copyright_text,
  passwordHash: row.password_hash,
  seoMetadata: row.seo_metadata || {},
  themeSettings: row.theme_settings || {}
});

const mapNavbarToDb = (item: NavbarItem) => ({
  id: item.id,
  label: item.label,
  href: item.href,
  display_order: item.displayOrder,
  is_visible: item.isVisible
});

const mapNavbarFromDb = (row: any): NavbarItem => ({
  id: row.id,
  label: row.label,
  href: row.href,
  displayOrder: row.display_order,
  isVisible: row.is_visible
});

const mapHeroToDb = (h: Partial<HeroSection>) => ({
  heading: h.heading,
  introduction: h.introduction,
  animation_type: h.animationType,
  logo_url: h.logoUrl,
  cta_primary_text: h.ctaPrimaryText,
  cta_primary_href: h.ctaPrimaryHref,
  cta_secondary_text: h.ctaSecondaryText,
  cta_secondary_href: h.ctaSecondaryHref
});

const mapHeroFromDb = (row: any): HeroSection => ({
  heading: row.heading,
  introduction: row.introduction,
  animationType: row.animation_type,
  logoUrl: row.logo_url,
  ctaPrimaryText: row.cta_primary_text,
  ctaPrimaryHref: row.cta_primary_href,
  ctaSecondaryText: row.cta_secondary_text,
  ctaSecondaryHref: row.cta_secondary_href
});

const mapAchievementToDb = (a: Achievement) => ({
  id: a.id,
  title: a.title,
  issuing_org: a.issuingOrg,
  issue_date: a.issueDate,
  description: a.description,
  image_url: a.imageUrl,
  credential_url: a.credentialUrl,
  display_order: a.displayOrder,
  is_visible: a.isVisible
});

const mapAchievementFromDb = (row: any): Achievement => ({
  id: row.id,
  title: row.title,
  issuingOrg: row.issuing_org,
  issueDate: row.issue_date,
  description: row.description,
  imageUrl: row.image_url,
  credentialUrl: row.credential_url,
  displayOrder: row.display_order,
  isVisible: row.is_visible
});

const mapProjectToDb = (p: Project) => ({
  id: p.id,
  title: p.title,
  description: p.description,
  technologies: p.technologies,
  image_url: p.imageUrl,
  github_url: p.githubUrl,
  live_url: p.liveUrl,
  doc_url: p.docUrl,
  display_order: p.displayOrder,
  is_visible: p.isVisible
});

const mapProjectFromDb = (row: any): Project => ({
  id: row.id,
  title: row.title,
  description: row.description,
  technologies: row.technologies || [],
  imageUrl: row.image_url,
  githubUrl: row.github_url,
  liveUrl: row.live_url,
  docUrl: row.doc_url,
  displayOrder: row.display_order,
  isVisible: row.is_visible
});

const mapExperienceToDb = (e: Experience) => ({
  id: e.id,
  company_name: e.companyName,
  position: e.position,
  duration: e.duration,
  description: e.description,
  skills: e.skills,
  logo_url: e.logoUrl,
  display_order: e.displayOrder,
  is_visible: e.isVisible
});

const mapExperienceFromDb = (row: any): Experience => ({
  id: row.id,
  companyName: row.company_name,
  position: row.position,
  duration: row.duration,
  description: row.description,
  skills: row.skills || [],
  logoUrl: row.logo_url,
  displayOrder: row.display_order,
  isVisible: row.is_visible
});

const mapServiceToDb = (s: Service) => ({
  id: s.id,
  category_id: s.categoryId,
  name: s.name,
  short_description: s.shortDescription,
  full_description: s.fullDescription,
  image_url: s.imageUrl,
  availability_status: s.availabilityStatus,
  duration: s.duration,
  pricing: s.pricing,
  btn_text: s.btnText,
  btn_link: s.btnLink,
  display_order: s.displayOrder,
  is_visible: s.isVisible
});

const mapServiceFromDb = (row: any): Service => ({
  id: row.id,
  categoryId: row.category_id,
  name: row.name,
  shortDescription: row.short_description,
  fullDescription: row.full_description,
  imageUrl: row.image_url,
  availabilityStatus: row.availability_status,
  duration: row.duration,
  pricing: row.pricing,
  btnText: row.btn_text,
  btnLink: row.btn_link,
  displayOrder: row.display_order,
  isVisible: row.is_visible
});

const mapMediaFromDb = (row: any): MediaFile => ({
  id: row.id,
  filename: row.filename,
  filepath: row.filepath,
  fileType: row.file_type,
  sizeBytes: row.size_bytes,
  createdAt: row.created_at
});

const mapMediaToDb = (m: MediaFile) => ({
  id: m.id,
  filename: m.filename,
  filepath: m.filepath,
  file_type: m.fileType,
  size_bytes: m.sizeBytes,
  created_at: m.createdAt
});

export class SupabaseDBProvider implements DBProvider {
  constructor() {
    if (!supabase) {
      throw new Error('Supabase Client could not be initialized. Missing credentials.');
    }
  }

  async getSettings(): Promise<SiteSettings> {
    const { data, error } = await supabase!
      .from('settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) {
      // Seed fallback if settings row does not exist
      const { settings } = await import('./localDb').then(m => new m.LocalDBProvider().getSettings() as any);
      const dbRow = { id: 'default', ...mapSettingsToDb(settings) };
      await supabase!.from('settings').upsert(dbRow);
      return settings;
    }

    return mapSettingsFromDb(data);
  }

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const dbRow = mapSettingsToDb(settings);
    const { data, error } = await supabase!
      .from('settings')
      .update(dbRow)
      .eq('id', 'default')
      .select()
      .single();

    if (error) throw error;
    return mapSettingsFromDb(data);
  }

  async getNavbarItems(): Promise<NavbarItem[]> {
    const { data, error } = await supabase!
      .from('navbar_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    
    // Seed default if empty
    if (!data || data.length === 0) {
      const items = await import('./localDb').then(m => new m.LocalDBProvider().getNavbarItems());
      const dbRows = items.map(mapNavbarToDb);
      await supabase!.from('navbar_items').insert(dbRows);
      return items;
    }

    return data.map(mapNavbarFromDb);
  }

  async updateNavbarItems(items: NavbarItem[]): Promise<NavbarItem[]> {
    const dbRows = items.map(mapNavbarToDb);
    const { error } = await supabase!.from('navbar_items').upsert(dbRows);
    if (error) throw error;
    return items;
  }

  async getHero(): Promise<HeroSection> {
    const { data, error } = await supabase!
      .from('hero_section')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) {
      const hero = await import('./localDb').then(m => new m.LocalDBProvider().getHero());
      const dbRow = { id: 'default', ...mapHeroToDb(hero) };
      await supabase!.from('hero_section').upsert(dbRow);
      return hero;
    }

    return mapHeroFromDb(data);
  }

  async updateHero(hero: Partial<HeroSection>): Promise<HeroSection> {
    const dbRow = mapHeroToDb(hero);
    const { data, error } = await supabase!
      .from('hero_section')
      .update(dbRow)
      .eq('id', 'default')
      .select()
      .single();

    if (error) throw error;
    return mapHeroFromDb(data);
  }

  async getAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase!
      .from('achievements')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      const items = await import('./localDb').then(m => new m.LocalDBProvider().getAchievements());
      const dbRows = items.map(mapAchievementToDb);
      await supabase!.from('achievements').insert(dbRows);
      return items;
    }

    return data.map(mapAchievementFromDb);
  }

  async saveAchievement(achievement: Achievement): Promise<Achievement> {
    const dbRow = mapAchievementToDb(achievement);
    const { error } = await supabase!.from('achievements').upsert(dbRow);
    if (error) throw error;
    return achievement;
  }

  async deleteAchievement(id: string): Promise<void> {
    const { error } = await supabase!.from('achievements').delete().eq('id', id);
    if (error) throw error;
  }

  async reorderAchievements(ids: string[]): Promise<void> {
    // Perform bulk display order update in transaction/parallel queries
    const updates = ids.map((id, index) => 
      supabase!.from('achievements').update({ display_order: index + 1 }).eq('id', id)
    );
    await Promise.all(updates);
  }

  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase!
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      const items = await import('./localDb').then(m => new m.LocalDBProvider().getProjects());
      const dbRows = items.map(mapProjectToDb);
      await supabase!.from('projects').insert(dbRows);
      return items;
    }

    return data.map(mapProjectFromDb);
  }

  async saveProject(project: Project): Promise<Project> {
    const dbRow = mapProjectToDb(project);
    const { error } = await supabase!.from('projects').upsert(dbRow);
    if (error) throw error;
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase!.from('projects').delete().eq('id', id);
    if (error) throw error;
  }

  async reorderProjects(ids: string[]): Promise<void> {
    const updates = ids.map((id, index) => 
      supabase!.from('projects').update({ display_order: index + 1 }).eq('id', id)
    );
    await Promise.all(updates);
  }

  async getExperiences(): Promise<Experience[]> {
    const { data, error } = await supabase!
      .from('experiences')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      const items = await import('./localDb').then(m => new m.LocalDBProvider().getExperiences());
      const dbRows = items.map(mapExperienceToDb);
      await supabase!.from('experiences').insert(dbRows);
      return items;
    }

    return data.map(mapExperienceFromDb);
  }

  async saveExperience(experience: Experience): Promise<Experience> {
    const dbRow = mapExperienceToDb(experience);
    const { error } = await supabase!.from('experiences').upsert(dbRow);
    if (error) throw error;
    return experience;
  }

  async deleteExperience(id: string): Promise<void> {
    const { error } = await supabase!.from('experiences').delete().eq('id', id);
    if (error) throw error;
  }

  async reorderExperiences(ids: string[]): Promise<void> {
    const updates = ids.map((id, index) => 
      supabase!.from('experiences').update({ display_order: index + 1 }).eq('id', id)
    );
    await Promise.all(updates);
  }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase!
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      const items = await import('./localDb').then(m => new m.LocalDBProvider().getCategories());
      const dbRows = items.map(c => ({ id: c.id, name: c.name, display_order: c.displayOrder }));
      await supabase!.from('categories').insert(dbRows);
      return items;
    }

    return data.map(row => ({ id: row.id, name: row.name, displayOrder: row.display_order }));
  }

  async saveCategory(category: Category): Promise<Category> {
    const { error } = await supabase!
      .from('categories')
      .upsert({ id: category.id, name: category.name, display_order: category.displayOrder });
    if (error) throw error;
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase!.from('categories').delete().eq('id', id);
    if (error) throw error;
  }

  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase!
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      const items = await import('./localDb').then(m => new m.LocalDBProvider().getServices());
      const dbRows = items.map(mapServiceToDb);
      await supabase!.from('services').insert(dbRows);
      return items;
    }

    return data.map(mapServiceFromDb);
  }

  async saveService(service: Service): Promise<Service> {
    const dbRow = mapServiceToDb(service);
    const { error } = await supabase!.from('services').upsert(dbRow);
    if (error) throw error;
    return service;
  }

  async deleteService(id: string): Promise<void> {
    const { error } = await supabase!.from('services').delete().eq('id', id);
    if (error) throw error;
  }

  async reorderServices(ids: string[]): Promise<void> {
    const updates = ids.map((id, index) => 
      supabase!.from('services').update({ display_order: index + 1 }).eq('id', id)
    );
    await Promise.all(updates);
  }

  async getMediaFiles(): Promise<MediaFile[]> {
    const { data, error } = await supabase!
      .from('media_library')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapMediaFromDb);
  }

  async saveMediaFile(file: MediaFile): Promise<MediaFile> {
    const dbRow = mapMediaToDb(file);
    const { error } = await supabase!.from('media_library').insert(dbRow);
    if (error) throw error;
    return file;
  }

  async deleteMediaFile(id: string): Promise<void> {
    const { error } = await supabase!.from('media_library').delete().eq('id', id);
    if (error) throw error;
  }
}
