// src/services/localDb.ts

import fs from 'fs/promises';
import path from 'path';
import { 
  DBProvider, SiteSettings, NavbarItem, HeroSection, 
  Achievement, Project, Experience, Category, Service, MediaFile 
} from './db';

const DB_DIR = path.join(process.cwd(), 'src', 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Default hashed password is for the password: "admin"
// Hashed using SHA-256: 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
const DEFAULT_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

const DEFAULT_DATA = {
  settings: {
    logoUrl: '/uploads/logo.svg',
    contactPhone: '+1 (555) 019-2834',
    contactEmail: 'hello@technologyprofessional.ai',
    resumeUrl: '/uploads/resume.pdf',
    linkedinUrl: 'https://linkedin.com/in/technologyprofessional',
    githubUrl: 'https://github.com/technologyprofessional',
    twitterUrl: 'https://twitter.com/ai_practitioner',
    otherSocials: {},
    copyrightText: '© 2026 AI Practitioner. All rights reserved.',
    passwordHash: DEFAULT_PASSWORD_HASH,
    seoMetadata: {
      title: 'AI Practitioner & Technology Professional Portfolio',
      description: 'Portfolio of an expert AI practitioner specializing in LLMs, agentic RAG, cloud scaling, and computer vision.',
      keywords: 'AI, Machine Learning, LLM, Agentic RAG, Cloud Architect, React, Next.js',
      ogImage: '/uploads/og-image.jpg'
    },
    themeSettings: {
      defaultTheme: 'dark',
      accentColor: '#3b82f6'
    }
  } as SiteSettings,
  navbarItems: [
    { id: '1', label: 'Home', href: '#home', displayOrder: 1, isVisible: true },
    { id: '2', label: 'Achievements', href: '#achievements', displayOrder: 2, isVisible: true },
    { id: '3', label: 'Projects', href: '#projects', displayOrder: 3, isVisible: true },
    { id: '4', label: 'Experience', href: '#experience', displayOrder: 4, isVisible: true },
    { id: '5', label: 'Services', href: '#services', displayOrder: 5, isVisible: true },
    { id: '6', label: 'Contact', href: '#contact', displayOrder: 6, isVisible: true }
  ] as NavbarItem[],
  hero: {
    heading: 'Architecting Autonomous Intelligent Systems',
    introduction: 'I design, deploy, and scale production-grade AI agents, LLM architectures, and high-performance machine learning pipelines for complex enterprise workloads.',
    animationType: 'particles',
    logoUrl: '/uploads/logo.svg',
    ctaPrimaryText: 'Explore Projects',
    ctaPrimaryHref: '#projects',
    ctaSecondaryText: 'Get In Touch',
    ctaSecondaryHref: '#contact'
  } as HeroSection,
  achievements: [
    {
      id: 'a1',
      title: 'Professional Cloud Architect',
      issuingOrg: 'Google Cloud',
      issueDate: '2025-06',
      description: 'Validation of expertise in designing, developing, and managing robust, secure, scalable, and highly available GCP solutions.',
      imageUrl: '/uploads/gcp-architect.jpg',
      credentialUrl: 'https://google.com/certification',
      displayOrder: 1,
      isVisible: true
    },
    {
      id: 'a2',
      title: 'TensorFlow Developer Certificate',
      issuingOrg: 'TensorFlow / Google',
      issueDate: '2024-03',
      description: 'Demonstrated proficiency in building and training machine learning models using TensorFlow, including deep learning, computer vision, and NLP.',
      imageUrl: '/uploads/tensorflow-cert.jpg',
      credentialUrl: 'https://tensorflow.org',
      displayOrder: 2,
      isVisible: true
    }
  ] as Achievement[],
  projects: [
    {
      id: 'p1',
      title: 'Agentic RAG Engine',
      description: 'An autonomous Retrieval-Augmented Generation system featuring self-querying, hybrid semantic search, cross-encoder reranking, and web search fallback logic.',
      technologies: ['Next.js', 'FastAPI', 'LangChain', 'Pinecone', 'OpenAI'],
      imageUrl: '/uploads/proj-rag.jpg',
      githubUrl: 'https://github.com/technologyprofessional/agentic-rag',
      liveUrl: 'https://rag-demo.technologyprofessional.ai',
      docUrl: 'https://docs.technologyprofessional.ai/rag',
      displayOrder: 1,
      isVisible: true
    },
    {
      id: 'p2',
      title: 'Distributed LLM Router',
      description: 'A load balancing gateway for LLM requests that optimizes latency, handles provider fallbacks (OpenAI, Anthropic, Gemini), and caches queries semantically.',
      technologies: ['Go', 'Redis', 'Docker', 'Kubernetes', 'HuggingFace'],
      imageUrl: '/uploads/proj-router.jpg',
      githubUrl: 'https://github.com/technologyprofessional/llm-router',
      liveUrl: 'https://router-demo.technologyprofessional.ai',
      displayOrder: 2,
      isVisible: true
    }
  ] as Project[],
  experiences: [
    {
      id: 'e1',
      companyName: 'NeuralFlow Solutions',
      position: 'Lead AI Architect',
      duration: '2024 - Present',
      description: 'Lead the R&D and deployment of agentic workflows. Optimized custom embeddings pipelines and reduced inference latency by 42% through local caching and model quantization.',
      skills: ['LLMs', 'Agentic Workflows', 'Vector DBs', 'PyTorch', 'AWS'],
      logoUrl: '/uploads/logo-neuralflow.png',
      displayOrder: 1,
      isVisible: true
    },
    {
      id: 'e2',
      companyName: 'CloudScale Technologies',
      position: 'Senior ML Engineer',
      duration: '2022 - 2024',
      description: 'Designed and productionized real-time computer vision inference systems at scale. Automated pipeline orchestration using Kubernetes and Kubeflow.',
      skills: ['Computer Vision', 'Kubernetes', 'FastAPI', 'TensorFlow', 'GCP'],
      logoUrl: '/uploads/logo-cloudscale.png',
      displayOrder: 2,
      isVisible: true
    }
  ] as Experience[],
  categories: [
    { id: 'cat1', name: 'AI Engineering', displayOrder: 1 },
    { id: 'cat2', name: 'Cloud Architecture', displayOrder: 2 },
    { id: 'cat3', name: 'Strategic Advisory', displayOrder: 3 }
  ] as Category[],
  services: [
    {
      id: 's1',
      categoryId: 'cat1',
      name: 'Custom LLM & RAG Orchestration',
      shortDescription: 'Build domain-specific LLM applications and agent systems integrated with your company database.',
      fullDescription: 'We build enterprise-grade retrieval-augmented generation systems and agentic workflows. This includes custom document chunking pipelines, embedding fine-tuning, metadata filtering, semantic cache implementations, and robust evaluation suites. Each system is designed with strict boundaries to eliminate hallucinations and secure proprietary data.',
      imageUrl: '/uploads/srv-llm.jpg',
      availabilityStatus: 'available',
      duration: '4-8 weeks',
      pricing: 'From $8,500',
      btnText: 'Avail Service',
      btnLink: '#contact',
      displayOrder: 1,
      isVisible: true
    },
    {
      id: 's2',
      categoryId: 'cat2',
      name: 'Scalable ML Infrastructure Audit',
      shortDescription: 'Audit your current inference/training infrastructure and design a cost-efficient cloud migration strategy.',
      fullDescription: 'Complete audit of your existing model hosting setup. We review GPU utilization, cold-start latencies, serverless inference bottlenecks, and container scheduling. You will receive an actionable terraform-based deployment design that cuts monthly cloud billing by up to 50% while scaling smoothly under traffic spikes.',
      imageUrl: '/uploads/srv-infra.jpg',
      availabilityStatus: 'available',
      duration: '2 weeks',
      pricing: 'From $4,000',
      btnText: 'Avail Service',
      btnLink: '#contact',
      displayOrder: 2,
      isVisible: true
    }
  ] as Service[],
  mediaFiles: [] as MediaFile[]
};

type DBData = typeof DEFAULT_DATA;

export class LocalDBProvider implements DBProvider {
  private data: DBData | null = null;

  private async load(): Promise<DBData> {
    if (this.data) return this.data;

    try {
      await fs.mkdir(DB_DIR, { recursive: true });
      const content = await fs.readFile(DB_FILE, 'utf-8');
      this.data = JSON.parse(content);
      return this.data!;
    } catch {
      // File doesn't exist, create it with default data
      this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      await this.saveAll();
      return this.data!;
    }
  }

  private async saveAll(): Promise<void> {
    if (!this.data) return;
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  async getSettings(): Promise<SiteSettings> {
    const data = await this.load();
    return data.settings;
  }

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const data = await this.load();
    data.settings = { ...data.settings, ...settings };
    await this.saveAll();
    return data.settings;
  }

  async getNavbarItems(): Promise<NavbarItem[]> {
    const data = await this.load();
    return [...data.navbarItems].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async updateNavbarItems(items: NavbarItem[]): Promise<NavbarItem[]> {
    const data = await this.load();
    data.navbarItems = items;
    await this.saveAll();
    return data.navbarItems;
  }

  async getHero(): Promise<HeroSection> {
    const data = await this.load();
    return data.hero;
  }

  async updateHero(hero: Partial<HeroSection>): Promise<HeroSection> {
    const data = await this.load();
    data.hero = { ...data.hero, ...hero };
    await this.saveAll();
    return data.hero;
  }

  async getAchievements(): Promise<Achievement[]> {
    const data = await this.load();
    return [...data.achievements].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async saveAchievement(achievement: Achievement): Promise<Achievement> {
    const data = await this.load();
    const idx = data.achievements.findIndex(a => a.id === achievement.id);
    if (idx > -1) {
      data.achievements[idx] = achievement;
    } else {
      data.achievements.push(achievement);
    }
    await this.saveAll();
    return achievement;
  }

  async deleteAchievement(id: string): Promise<void> {
    const data = await this.load();
    data.achievements = data.achievements.filter(a => a.id !== id);
    await this.saveAll();
  }

  async reorderAchievements(ids: string[]): Promise<void> {
    const data = await this.load();
    data.achievements.forEach(ach => {
      const index = ids.indexOf(ach.id);
      if (index > -1) ach.displayOrder = index + 1;
    });
    await this.saveAll();
  }

  async getProjects(): Promise<Project[]> {
    const data = await this.load();
    return [...data.projects].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async saveProject(project: Project): Promise<Project> {
    const data = await this.load();
    const idx = data.projects.findIndex(p => p.id === project.id);
    if (idx > -1) {
      data.projects[idx] = project;
    } else {
      data.projects.push(project);
    }
    await this.saveAll();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    const data = await this.load();
    data.projects = data.projects.filter(p => p.id !== id);
    await this.saveAll();
  }

  async reorderProjects(ids: string[]): Promise<void> {
    const data = await this.load();
    data.projects.forEach(p => {
      const index = ids.indexOf(p.id);
      if (index > -1) p.displayOrder = index + 1;
    });
    await this.saveAll();
  }

  async getExperiences(): Promise<Experience[]> {
    const data = await this.load();
    return [...data.experiences].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async saveExperience(experience: Experience): Promise<Experience> {
    const data = await this.load();
    const idx = data.experiences.findIndex(e => e.id === experience.id);
    if (idx > -1) {
      data.experiences[idx] = experience;
    } else {
      data.experiences.push(experience);
    }
    await this.saveAll();
    return experience;
  }

  async deleteExperience(id: string): Promise<void> {
    const data = await this.load();
    data.experiences = data.experiences.filter(e => e.id !== id);
    await this.saveAll();
  }

  async reorderExperiences(ids: string[]): Promise<void> {
    const data = await this.load();
    data.experiences.forEach(e => {
      const index = ids.indexOf(e.id);
      if (index > -1) e.displayOrder = index + 1;
    });
    await this.saveAll();
  }

  async getCategories(): Promise<Category[]> {
    const data = await this.load();
    return [...data.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async saveCategory(category: Category): Promise<Category> {
    const data = await this.load();
    const idx = data.categories.findIndex(c => c.id === category.id);
    if (idx > -1) {
      data.categories[idx] = category;
    } else {
      data.categories.push(category);
    }
    await this.saveAll();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    const data = await this.load();
    data.categories = data.categories.filter(c => c.id !== id);
    // Remove services mapping to this category or leave orphaned?
    // Let's cascade delete services matching this category for database cleanliness
    data.services = data.services.filter(s => s.categoryId !== id);
    await this.saveAll();
  }

  async getServices(): Promise<Service[]> {
    const data = await this.load();
    return [...data.services].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async saveService(service: Service): Promise<Service> {
    const data = await this.load();
    const idx = data.services.findIndex(s => s.id === service.id);
    if (idx > -1) {
      data.services[idx] = service;
    } else {
      data.services.push(service);
    }
    await this.saveAll();
    return service;
  }

  async deleteService(id: string): Promise<void> {
    const data = await this.load();
    data.services = data.services.filter(s => s.id !== id);
    await this.saveAll();
  }

  async reorderServices(ids: string[]): Promise<void> {
    const data = await this.load();
    data.services.forEach(s => {
      const index = ids.indexOf(s.id);
      if (index > -1) s.displayOrder = index + 1;
    });
    await this.saveAll();
  }

  async getMediaFiles(): Promise<MediaFile[]> {
    const data = await this.load();
    return [...data.mediaFiles].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async saveMediaFile(file: MediaFile): Promise<MediaFile> {
    const data = await this.load();
    const idx = data.mediaFiles.findIndex(m => m.id === file.id || m.filename === file.filename);
    if (idx > -1) {
      data.mediaFiles[idx] = file;
    } else {
      data.mediaFiles.push(file);
    }
    await this.saveAll();
    return file;
  }

  async deleteMediaFile(id: string): Promise<void> {
    const data = await this.load();
    data.mediaFiles = data.mediaFiles.filter(m => m.id !== id);
    await this.saveAll();
  }
}
