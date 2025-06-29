// ABOUTME: Simplified journal page that just shows the visible dot grid
// Clean, minimal interface focused on the dot grid experience

'use client';

import { ActualDotGrid } from '@/components/journal/ActualDotGrid';

export default function SimpleJournalPage() {
  return (
    <div className="w-full h-screen overflow-hidden">
      {/* Simple header - only visible on hover */}
      <div className="absolute top-0 left-0 right-0 z-10 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center justify-between px-4 py-2 bg-white/90 backdrop-blur-sm border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-800">Bullet Journal</h1>
          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* The actual visible dot grid */}
      <ActualDotGrid 
        spacing={19}
        dotSize={1}
        dotColor="#999999"
        backgroundColor="#ffffff"
        className="relative"
      />

      {/* Optional: Simple page indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-400">
        Page 1
      </div>
    </div>
  );
}