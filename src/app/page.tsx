// src/app/page.tsx

import { getDB } from '@/services/db';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Achievements from '@/components/Achievements';
import Projects from '@/components/Projects';
import ExperienceSection from '@/components/Experience';
import Services from '@/components/Services';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

// Force dynamic rendering to ensure that changes in CMS are immediately visible to visitors
export const revalidate = 0;

export default async function Home() {
  const db = await getDB();

  // Fetch all sections in parallel on the server
  const [
    settings,
    navbarItems,
    hero,
    achievements,
    projects,
    experiences,
    categories,
    services,
    mediaFiles
  ] = await Promise.all([
    db.getSettings(),
    db.getNavbarItems(),
    db.getHero(),
    db.getAchievements(),
    db.getProjects(),
    db.getExperiences(),
    db.getCategories(),
    db.getServices(),
    db.getMediaFiles()
  ]);

  // Resolve logo URL from media ID
  const logoMediaId = settings.otherSocials?.logoMediaId;
  const logoFile = logoMediaId ? mediaFiles.find(f => f.id === logoMediaId) : null;
  const resolvedLogoUrl = logoFile ? logoFile.filepath : '';

  // Resolve profile image URL from media ID
  const profileMediaId = settings.otherSocials?.profileMediaId;
  const profileFile = profileMediaId ? mediaFiles.find(f => f.id === profileMediaId) : null;
  const resolvedProfileUrl = profileFile ? profileFile.filepath : '';

  return (
    <>
      <Navbar logoUrl={resolvedLogoUrl} items={navbarItems} />
      <main>
        <Hero hero={{ ...hero, logoUrl: resolvedProfileUrl }} settings={settings} />
        
        {navbarItems.find(i => i.href === '#achievements')?.isVisible && (
          <Achievements achievements={achievements} />
        )}
        
        {navbarItems.find(i => i.href === '#projects')?.isVisible && (
          <Projects projects={projects} />
        )}
        
        {navbarItems.find(i => i.href === '#experience')?.isVisible && (
          <ExperienceSection experiences={experiences} />
        )}
        
        {navbarItems.find(i => i.href === '#services')?.isVisible && (
          <Services services={services} categories={categories} />
        )}
        
        {navbarItems.find(i => i.href === '#contact')?.isVisible && (
          <Contact settings={{ ...settings, logoUrl: resolvedLogoUrl }} />
        )}
      </main>
      <Footer settings={{ ...settings, logoUrl: resolvedLogoUrl }} items={navbarItems} />
    </>
  );
}
