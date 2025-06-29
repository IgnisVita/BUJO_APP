// ABOUTME: A VISIBLE dot grid using CSS background - guarantees visible dots
// Simple CSS implementation with clear, visible dots like real bullet journals

'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ActualDotGridProps {
  className?: string;
  spacing?: number; // in pixels, default 19px for 5mm spacing
  dotSize?: number; // in pixels, default 1px radius
  dotColor?: string; // default gray
  backgroundColor?: string; // default white
}

export function ActualDotGrid({
  className,
  spacing = 19, // 5mm spacing at standard resolution
  dotSize = 1,
  dotColor = '#999999',
  backgroundColor = '#ffffff',
}: ActualDotGridProps) {
  const dotGridStyle = {
    backgroundColor,
    backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
    backgroundSize: `${spacing}px ${spacing}px`,
    backgroundPosition: '0 0',
    width: '100%',
    height: '100%',
    minHeight: '100vh',
  };

  return (
    <div
      className={cn('dot-grid-container', className)}
      style={dotGridStyle}
    >
      {/* Optional: Add margin lines */}
      <div 
        className="absolute inset-0"
        style={{
          borderLeft: `1px solid ${dotColor}20`,
          borderTop: `1px solid ${dotColor}20`,
          marginLeft: '40px',
          marginTop: '40px',
        }}
      />
    </div>
  );
}