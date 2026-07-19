// src/services/auth.ts

import crypto from 'crypto';
import { cookies } from 'next/headers';

const SECRET = process.env.SESSION_SECRET || 'fallback-portfolio-secret-key-321-abc';
const COOKIE_NAME = 'cms_session';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function signSession(payload: any): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
  return `${data}.${signature}`;
}

export function verifySession(token: string): any | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
  
  if (signature !== expectedSignature) return null;
  
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    if (payload.expires && payload.expires < Date.now()) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSession(payload: any, remember: boolean = false) {
  const cookieStore = await cookies();
  const token = signSession(payload);
  const maxAge = remember ? 7 * 24 * 60 * 60 : undefined; // Session cookie if not remembered
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
