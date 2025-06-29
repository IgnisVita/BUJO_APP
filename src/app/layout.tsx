import type { Metadata, Viewport } from 'next'

import { Inter, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'

// Font configurations
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
})

// PWA metadata
export const metadata: Metadata = {
  title: 'Digital Bullet Journal - Mindful Productivity',
  description: 'Your personal digital bullet journal for mindful productivity and organized thinking',
  applicationName: 'Digital Bullet Journal',
  keywords: ['bullet journal', 'productivity', 'planning', 'mindfulness', 'organization'],
  authors: [{ name: 'BUJO Team' }],
  creator: 'BUJO Team',
  publisher: 'BUJO Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png' },
    ],
  },
  openGraph: {
    title: 'Digital Bullet Journal',
    description: 'Your personal digital bullet journal for mindful productivity',
    url: 'https://bujo.app',
    siteName: 'Digital Bullet Journal',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Digital Bullet Journal',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Bullet Journal',
    description: 'Your personal digital bullet journal for mindful productivity',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { UpdatePrompt } from '@/components/pwa/UpdatePrompt'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${bricolage.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BUJO" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Additional PWA tags */}
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#8b5cf6" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        {/* Theme Provider would go here */}
        {children}
        {/* PWA Components */}
        <InstallPrompt />
        <UpdatePrompt />
      </body>
    </html>
  )
}