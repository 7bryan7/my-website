// src/app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import { getDB } from '@/services/db';
import { hashPassword, setSession } from '@/services/auth';

export async function POST(req: Request) {
  try {
    const { password, rememberMe } = await req.json();
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const db = await getDB();
    const settings = await db.getSettings();
    
    const inputHash = hashPassword(password);
    
    if (inputHash !== settings.passwordHash) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    // Set cookie session expiring in 1 day
    const sessionPayload = {
      role: 'admin',
      expires: Date.now() + 24 * 60 * 60 * 1000
    };
    
    await setSession(sessionPayload, rememberMe);

    return NextResponse.json({ success: true, user: { role: 'admin' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
