// ABOUTME: Simplified journal page focused on the dot grid experience
// Clean implementation that shows visible dots immediately

'use client';

import { Settings, FileText } from 'lucide-react';
import Link from 'next/link';

export default function JournalPage() {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Minimal Header - Only visible on hover */}
      <div className="absolute top-0 left-0 right-0 z-20 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <span className="text-sm font-semibold">BUJO</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/templates" 
              className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <FileText className="w-4 h-4" />
              Templates
            </Link>
            <Link 
              href="/settings" 
              className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content - VISIBLE Dot Grid */}
      <div 
        className="w-full h-full"
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: 'radial-gradient(circle, #999999 1px, transparent 1px)',
          backgroundSize: '19px 19px',
          backgroundPosition: '0 0',
        }}
      >
        {/* Optional date indicator */}
        <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Page indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-sm text-gray-600">
          Page 1
        </div>

        {/* Instructions */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Dot Grid Active</h2>
          <p className="text-sm text-gray-600 mb-3">
            You should now see visible dots covering the entire page. This is your bullet journal dot grid with 5mm spacing.
          </p>
          <p className="text-xs text-gray-500">
            The dots are gray circles spaced 19px apart (5mm at standard resolution)
          </p>
        </div>
      </div>
    </div>
  );
}