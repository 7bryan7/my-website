// src/app/layout.tsx

import type { Metadata } from 'next';
import { getDB } from '@/services/db';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const db = await getDB();
    const settings = await db.getSettings();
    const seo = settings.seoMetadata || {
      title: 'AI Practitioner & Tech Professional',
      description: 'Professional Portfolio and CMS Website',
      keywords: 'AI, LLM, ML Engineering',
      ogImage: '/uploads/og-image.jpg'
    };

    return {
      title: {
        default: seo.title,
        template: `%s | ${seo.title}`
      },
      description: seo.description,
      keywords: seo.keywords,
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
      alternates: {
        canonical: '/'
      },
      openGraph: {
        title: seo.title,
        description: seo.description,
        images: seo.ogImage ? [{ url: seo.ogImage }] : [],
        type: 'website',
        siteName: seo.title
      },
      twitter: {
        card: 'summary_large_image',
        title: seo.title,
        description: seo.description,
        images: seo.ogImage ? [seo.ogImage] : []
      }
    };
  } catch {
    return {
      title: 'AI Practitioner Portfolio',
      description: 'Professional portfolio and services marketplace.'
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Anti-flash inline script for dark/light theme load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
