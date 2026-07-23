// src/app/api/media/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { getDB, MediaFile } from '@/services/db';
import { getSession } from '@/services/auth';

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDB();
    const files = await db.getMediaFiles();
    return NextResponse.json(files);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Auth check
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse form-data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const duplicateStrategy = (formData.get('duplicateStrategy') as string) || 'keep-both';
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 3. Validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images and PDFs are allowed.' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit.' }, { status: 400 });
    }

    // 4. Sanitize and resolve unique/duplicate filenames
    const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const ext = path.extname(cleanName);
    const base = path.basename(cleanName, ext);

    const db = await getDB();
    const existingFiles = await db.getMediaFiles();
    const existingFile = existingFiles.find(f => f.filename === cleanName);

    let uniqueFilename = cleanName;
    let targetId: string = crypto.randomUUID();

    if (existingFile) {
      if (duplicateStrategy === 'skip') {
        return NextResponse.json({ success: true, skipped: true, file: existingFile });
      } else if (duplicateStrategy === 'replace') {
        uniqueFilename = cleanName;
        targetId = existingFile.id;
      } else {
        // 'keep-both' - append timestamp to make it unique
        uniqueFilename = `${base}-${Date.now()}${ext}`;
        targetId = crypto.randomUUID();
      }
    } else {
      uniqueFilename = cleanName;
      targetId = crypto.randomUUID();
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let filepath = '';
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (isSupabaseConfigured) {
      // Supabase mode - upload to Supabase Storage
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );

      // Upload to 'portfolio-media' bucket
      const { data, error } = await supabase.storage
        .from('portfolio-media')
        .upload(uniqueFilename, buffer, {
          contentType: file.type,
          upsert: true
        });

      if (error) {
        return NextResponse.json({ 
          error: `Supabase Storage upload failed: ${error.message}. Make sure the bucket 'portfolio-media' exists and is public.` 
        }, { status: 500 });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(uniqueFilename);

      filepath = urlData.publicUrl;
    } else {
      // Local File Mode
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const localFilePath = path.join(uploadDir, uniqueFilename);
      await fs.writeFile(localFilePath, buffer);
      filepath = `/uploads/${uniqueFilename}`;
    }

    // Save metadata in database
    const mediaFile: MediaFile = {
      id: targetId,
      filename: uniqueFilename,
      filepath,
      fileType: file.type,
      sizeBytes: file.size,
      createdAt: new Date().toISOString()
    };

    const savedFile = await db.saveMediaFile(mediaFile);
    return NextResponse.json({ success: true, file: savedFile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const filename = searchParams.get('filename');

    if (!id || !filename) {
      return NextResponse.json({ error: 'Missing file credentials' }, { status: 400 });
    }

    const db = await getDB();
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (isSupabaseConfigured) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );

      const { error } = await supabase.storage
        .from('portfolio-media')
        .remove([filename]);

      if (error) {
        return NextResponse.json({ error: `Supabase Storage deletion failed: ${error.message}` }, { status: 500 });
      }
    } else {
      // Local mode
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      const localFilePath = path.join(uploadDir, filename);
      try {
        await fs.unlink(localFilePath);
      } catch (err: any) {
        // Ignore file-not-found errors on disk, just proceed with database delete
        console.warn(`File ${filename} not found on local disk, deleting from database anyway.`);
      }
    }

    await db.deleteMediaFile(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
