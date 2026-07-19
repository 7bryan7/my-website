// scripts/verify.ts

import fs from 'fs/promises';
import path from 'path';
import { getDB } from '../src/services/db';

async function verify() {
  console.log('--- STARTING VERIFICATION SYSTEM ---');

  // 1. Verify Project Directory structure
  const requiredPaths = [
    'src/services/db.ts',
    'src/services/localDb.ts',
    'src/services/supabaseDb.ts',
    'src/services/auth.ts',
    'src/components/Navbar.tsx',
    'src/components/Hero.tsx',
    'src/components/Achievements.tsx',
    'src/components/Projects.tsx',
    'src/components/Experience.tsx',
    'src/components/Services.tsx',
    'src/components/Contact.tsx',
    'src/components/Footer.tsx',
    'src/app/page.tsx',
    'src/app/layout.tsx',
    'src/app/globals.css',
    'src/app/admin/page.tsx',
    'src/app/admin/admin.css',
    'src/app/api/auth/login/route.ts',
    'src/app/api/auth/logout/route.ts',
    'src/app/api/auth/check/route.ts',
    'src/app/api/cms/route.ts',
    'src/app/api/media/route.ts',
    'src/app/api/contact/route.ts'
  ];

  console.log('Checking required files presence...');
  for (const relPath of requiredPaths) {
    const fullPath = path.join(process.cwd(), relPath);
    try {
      await fs.access(fullPath);
      console.log(`✓ Found: ${relPath}`);
    } catch {
      throw new Error(`✗ Missing file: ${relPath}`);
    }
  }

  // 2. Test Local Database provider initialization
  console.log('\nTesting Database Provider initialization...');
  const db = await getDB();
  console.log('✓ Database instance initialized.');

  // 3. Test content fetching
  console.log('\nTesting database content retrieval...');
  const settings = await db.getSettings();
  console.log(`✓ Fetched settings: Title = "${settings.seoMetadata.title}"`);
  
  const hero = await db.getHero();
  console.log(`✓ Fetched hero: Heading = "${hero.heading}"`);

  const navbar = await db.getNavbarItems();
  console.log(`✓ Fetched navbar: Found ${navbar.length} items.`);

  const projects = await db.getProjects();
  console.log(`✓ Fetched projects: Found ${projects.length} entries.`);

  const experiences = await db.getExperiences();
  console.log(`✓ Fetched experience: Found ${experiences.length} entries.`);

  const services = await db.getServices();
  console.log(`✓ Fetched services: Found ${services.length} entries.`);

  // 4. Verify generated asset presence
  console.log('\nVerifying generated graphic assets...');
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const files = await fs.readdir(uploadDir);
  console.log(`✓ Found ${files.length} uploaded files in public/uploads directory.`);

  console.log('\n--- VERIFICATION COMPLETED SUCCESSFULLY ---');
}

verify().catch(err => {
  console.error('\n--- VERIFICATION FAILED ---');
  console.error(err);
  process.exit(1);
});
