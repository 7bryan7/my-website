// src/app/api/auth/check/route.ts

import { NextResponse } from 'next/server';
import { getSession } from '@/services/auth';

export async function GET() {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
