// src/app/api/cms/route.ts

import { NextResponse } from 'next/server';
import { getDB } from '@/services/db';
import { getSession } from '@/services/auth';

// Public GET to fetch page contents
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');
    const db = await getDB();

    if (!section) {
      // Fetch all public sections in one call to optimize loading performance
      const [settings, navbarItems, hero, achievements, projects, experiences, categories, services] = await Promise.all([
        db.getSettings(),
        db.getNavbarItems(),
        db.getHero(),
        db.getAchievements(),
        db.getProjects(),
        db.getExperiences(),
        db.getCategories(),
        db.getServices()
      ]);

      // Remove password hash from public response
      const publicSettings = { ...settings };
      delete (publicSettings as any).passwordHash;

      return NextResponse.json({
        settings: publicSettings,
        navbarItems,
        hero,
        achievements,
        projects,
        experiences,
        categories,
        services
      });
    }

    switch (section) {
      case 'settings':
        const settings = await db.getSettings();
        const publicSettings = { ...settings };
        delete (publicSettings as any).passwordHash;
        return NextResponse.json(publicSettings);
      case 'navbar':
        return NextResponse.json(await db.getNavbarItems());
      case 'hero':
        return NextResponse.json(await db.getHero());
      case 'achievements':
        return NextResponse.json(await db.getAchievements());
      case 'projects':
        return NextResponse.json(await db.getProjects());
      case 'experiences':
        return NextResponse.json(await db.getExperiences());
      case 'categories':
        return NextResponse.json(await db.getCategories());
      case 'services':
        return NextResponse.json(await db.getServices());
      default:
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Secure POST to modify page contents
export async function POST(req: Request) {
  try {
    // 1. Session verification
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request action
    const { action, payload } = await req.json();
    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    const db = await getDB();
    let result: any = null;

    switch (action) {
      case 'updateSettings':
        result = await db.updateSettings(payload);
        break;
      case 'updateNavbar':
        result = await db.updateNavbarItems(payload);
        break;
      case 'updateHero':
        result = await db.updateHero(payload);
        break;
      case 'saveAchievement':
        result = await db.saveAchievement(payload);
        break;
      case 'deleteAchievement':
        await db.deleteAchievement(payload.id);
        break;
      case 'reorderAchievements':
        await db.reorderAchievements(payload.ids);
        break;
      case 'saveProject':
        result = await db.saveProject(payload);
        break;
      case 'deleteProject':
        await db.deleteProject(payload.id);
        break;
      case 'reorderProjects':
        await db.reorderProjects(payload.ids);
        break;
      case 'saveExperience':
        result = await db.saveExperience(payload);
        break;
      case 'deleteExperience':
        await db.deleteExperience(payload.id);
        break;
      case 'reorderExperiences':
        await db.reorderExperiences(payload.ids);
        break;
      case 'saveCategory':
        result = await db.saveCategory(payload);
        break;
      case 'deleteCategory':
        await db.deleteCategory(payload.id);
        break;
      case 'saveService':
        result = await db.saveService(payload);
        break;
      case 'deleteService':
        await db.deleteService(payload.id);
        break;
      case 'reorderServices':
        await db.reorderServices(payload.ids);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
