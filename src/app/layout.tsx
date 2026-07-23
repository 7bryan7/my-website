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

    const iconUrl = settings.logoUrl 
      ? `${settings.logoUrl}?v=${encodeURIComponent(settings.logoUrl)}` 
      : '/favicon.ico';

    return {
      title: {
        default: seo.title,
        template: `%s | ${seo.title}`
      },
      description: seo.description,
      keywords: seo.keywords,
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
      icons: {
        icon: iconUrl,
        shortcut: iconUrl,
        apple: iconUrl
      },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let faviconUrl = '/favicon.ico';
  try {
    const db = await getDB();
    const settings = await db.getSettings();
    if (settings.logoUrl) {
      faviconUrl = `${settings.logoUrl}?v=${encodeURIComponent(settings.logoUrl)}`;
    }
  } catch (e) {
    console.error('Failed to load settings in layout:', e);
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={faviconUrl} />
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
