// ABOUTME: Simple dot grid journal page with minimal UI
// Pure bullet journal experience with just dots and space to write

'use client';

import React, { useState, useRef } from 'react';

import { DotGridBackground } from '@/components/dotgrid/DotGridBackground';
import { DotGridCanvas } from '@/components/dotgrid/DotGridCanvas';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export default function NewJournalPage() {
  const [gridStyle, setGridStyle] = useState<'dots' | 'crosses' | 'grid'>('dots');
  const [spacing, setSpacing] = useState(19); // 5mm default
  const [showToolbar, setShowToolbar] = useState(false);
  const [useCSSGrid, setUseCSSGrid] = useState(true);
  const pageRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      {/* Minimal floating toolbar */}
      <div 
        className={cn(
          "fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex items-center gap-2 transition-opacity no-print",
          showToolbar ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onMouseEnter={() => setShowToolbar(true)}
        onMouseLeave={() => setShowToolbar(false)}
      >
        <select
          value={gridStyle}
          onChange={(e) => setGridStyle(e.target.value as any)}
          className="text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="dots">Dots</option>
          <option value="crosses">Crosses</option>
          <option value="grid">Grid</option>
        </select>
        
        <select
          value={spacing}
          onChange={(e) => setSpacing(Number(e.target.value))}
          className="text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="15">4mm</option>
          <option value="19">5mm</option>
          <option value="23">6mm</option>
        </select>
        
        <button
          onClick={() => setUseCSSGrid(!useCSSGrid)}
          className="text-sm px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600"
          title={useCSSGrid ? "Switch to Canvas" : "Switch to CSS"}
        >
          {useCSSGrid ? "CSS" : "Canvas"}
        </button>
        
        <button
          onClick={toggleDarkMode}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Toggle dark mode"
        >
          🌙
        </button>
        
        <button
          onClick={handlePrint}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Print"
        >
          🖨️
        </button>
      </div>

      {/* Toolbar trigger area */}
      <div 
        className="fixed top-0 right-0 w-32 h-32 no-print"
        onMouseEnter={() => setShowToolbar(true)}
      />

      {/* Journal page */}
      <div
        ref={pageRef}
        className="relative bg-white dark:bg-gray-800 shadow-2xl"
        style={{
          width: '816px', // Letter width
          height: '1056px', // Letter height
          maxWidth: '90vw',
          maxHeight: '90vh',
        }}
      >
        {useCSSGrid ? (
          <DotGridBackground
            spacing={spacing}
            dotSize={1.2}
            dotOpacity={0.5}
            dotColor="#b0b0b0"
            backgroundColor="#fefefe"
            gridStyle={gridStyle}
            darkMode={false}
            className="w-full h-full"
          >
            {/* Optional: Add a contenteditable div for writing */}
            <div
              className="absolute inset-0 p-8 outline-none"
              contentEditable
              suppressContentEditableWarning
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                lineHeight: `${spacing}px`,
                color: '#333',
                background: 'transparent',
              }}
              data-placeholder="Start writing in your bullet journal..."
            />
          </DotGridBackground>
        ) : (
          <DotGridCanvas
            width={816}
            height={1056}
            spacing={spacing}
            dotSize={1.5}
            dotOpacity={0.5}
            dotColor="#b0b0b0"
            backgroundColor="#fefefe"
            gridStyle={gridStyle}
            className="w-full h-full"
          />
        )}
      </div>

      {/* Visual dots indicator */}
      <div className="fixed bottom-4 left-4 text-xs text-gray-500 dark:text-gray-400 no-print">
        <div className="flex items-center gap-2">
          <span>·</span>
          <span>Dot Grid Active</span>
          <span>·</span>
          <span>{spacing === 19 ? '5mm' : spacing === 15 ? '4mm' : '6mm'}</span>
          <span>·</span>
        </div>
      </div>
    </div>
  );
}