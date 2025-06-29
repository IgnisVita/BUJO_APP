// ABOUTME: Pure CSS dot grid background with multiple pattern styles
// Lightweight alternative to canvas for simple dot grid backgrounds

'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import styles from '@/styles/dot-grid.module.css';

export interface DotGridBackgroundProps {
  spacing?: number;
  dotSize?: number;
  dotColor?: string;
  dotOpacity?: number;
  backgroundColor?: string;
  gridStyle?: 'dots' | 'crosses' | 'grid' | 'lines';
  darkMode?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function DotGridBackground({
  spacing = 19, // ~5mm at 96 DPI
  dotSize = 1.2,
  dotColor = '#b0b0b0',
  dotOpacity = 0.4,
  backgroundColor = '#fefefe',
  gridStyle = 'dots',
  darkMode = false,
  className,
  children,
}: DotGridBackgroundProps) {
  const effectiveDotColor = darkMode ? '#606060' : dotColor;
  const effectiveBackgroundColor = darkMode ? '#1a1a1a' : backgroundColor;
  const effectiveOpacity = darkMode ? dotOpacity * 0.8 : dotOpacity;

  const getBackgroundStyle = () => {
    switch (gridStyle) {
      case 'dots':
        return {
          backgroundColor: effectiveBackgroundColor,
          backgroundImage: `radial-gradient(circle, ${effectiveDotColor} ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${spacing}px ${spacing}px`,
          backgroundPosition: `${spacing/2}px ${spacing/2}px`,
        };
      
      case 'crosses':
        return {
          backgroundColor: effectiveBackgroundColor,
          backgroundImage: `
            linear-gradient(${effectiveDotColor} 0.8px, transparent 0.8px),
            linear-gradient(90deg, ${effectiveDotColor} 0.8px, transparent 0.8px)
          `,
          backgroundSize: `${spacing}px ${spacing}px`,
          backgroundPosition: `
            ${spacing/2 - dotSize/2}px ${spacing/2}px,
            ${spacing/2}px ${spacing/2 - dotSize/2}px
          `,
        };
      
      case 'grid':
        return {
          backgroundColor: effectiveBackgroundColor,
          backgroundImage: `
            linear-gradient(${effectiveDotColor} 0.5px, transparent 0.5px),
            linear-gradient(90deg, ${effectiveDotColor} 0.5px, transparent 0.5px),
            linear-gradient(${effectiveDotColor} 1px, transparent 1px),
            linear-gradient(90deg, ${effectiveDotColor} 1px, transparent 1px)
          `,
          backgroundSize: `
            ${spacing}px ${spacing}px,
            ${spacing}px ${spacing}px,
            ${spacing * 5}px ${spacing * 5}px,
            ${spacing * 5}px ${spacing * 5}px
          `,
        };
      
      case 'lines':
        return {
          backgroundColor: effectiveBackgroundColor,
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            transparent,
            transparent ${spacing - 0.5}px,
            ${effectiveDotColor} ${spacing - 0.5}px,
            ${effectiveDotColor} ${spacing}px
          )`,
        };
      
      default:
        return { backgroundColor: effectiveBackgroundColor };
    }
  };

  const style = {
    ...getBackgroundStyle(),
    opacity: 1,
  };

  return (
    <div
      className={cn(
        styles.dotGridBackground,
        darkMode && styles.darkMode,
        className
      )}
      style={{ backgroundColor: effectiveBackgroundColor }}
    >
      {/* Paper texture overlay */}
      <div 
        className={styles.paperTexture} 
        style={{ opacity: darkMode ? 0.01 : 0.02 }}
      />
      
      {/* Grid pattern with proper opacity */}
      <div 
        className={styles.gridPattern}
        style={{ 
          ...getBackgroundStyle(),
          backgroundColor: 'transparent',
          opacity: effectiveOpacity,
        }}
      />
      
      {/* Content */}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}