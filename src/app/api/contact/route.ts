// src/app/api/contact/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const CONTACTS_FILE = path.join(process.cwd(), 'src', 'data', 'contacts.json');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message, honeypot } = body;

    // 1. Spam protection - Honeypot field
    // If the hidden 'honeypot' field is filled, we silently return success
    // to fool the automated spam bot into thinking it succeeded.
    if (honeypot) {
      console.log('Spam bot detected and blocked via honeypot.');
      return NextResponse.json({ success: true, message: 'Message sent successfully' });
    }

    // 2. Input Validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters.' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!subject || subject.trim().length < 3) {
      return NextResponse.json({ error: 'Subject must be at least 3 characters.' }, { status: 400 });
    }
    if (!message || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 400 });
    }

    const contactSubmission = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      subject: subject.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    // 3. Save submission
    // We print it in server logs for visibility
    console.log('New Contact Submission Received:', contactSubmission);

    // Save to local JSON file
    try {
      const dataDir = path.dirname(CONTACTS_FILE);
      await fs.mkdir(dataDir, { recursive: true });
      let contacts = [];
      try {
        const fileContent = await fs.readFile(CONTACTS_FILE, 'utf-8');
        contacts = JSON.parse(fileContent);
      } catch {
        // File doesn't exist yet, start with empty list
      }
      contacts.push(contactSubmission);
      await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2), 'utf-8');
    } catch (fsErr) {
      console.error('Failed to save contact submission to local storage:', fsErr);
    }

    // In a production app, this is where you would hook up SendGrid, Resend, or Mailgun
    // to email the admin about the new contact submission.
    
    return NextResponse.json({ success: true, message: 'Your message has been sent successfully!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
