// ABOUTME: Simple journal page component with visible dot grid
// Focused on paper-like appearance with proper margins and dot grid

'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface SimplePageProps {
  dotSize?: number;
  dotSpacing?: number;
  pageSize?: 'A4' | 'Letter' | 'A5';
  showMargins?: boolean;
  className?: string;
  onGridReady?: (canvas: HTMLCanvasElement) => void;
}

const PAGE_SIZES = {
  A4: { width: 794, height: 1123 }, // A4 at 96 DPI
  Letter: { width: 816, height: 1056 }, // Letter at 96 DPI
  A5: { width: 559, height: 794 }, // A5 at 96 DPI
};

export function SimplePage({
  dotSize = 1.5,
  dotSpacing = 20,
  pageSize = 'A4',
  showMargins = true,
  className,
  onGridReady,
}: SimplePageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const pageDimensions = PAGE_SIZES[pageSize];
  const marginSize = 60; // 60px margins on all sides

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Set canvas size to page dimensions
    canvas.width = pageDimensions.width;
    canvas.height = pageDimensions.height;

    // Calculate display size to fit container while maintaining aspect ratio
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width - 40; // 20px padding on each side
    const containerHeight = containerRect.height - 40; // 20px padding on each side

    const scale = Math.min(
      containerWidth / pageDimensions.width,
      containerHeight / pageDimensions.height,
      1 // Don't scale larger than actual size
    );

    const displayWidth = pageDimensions.width * scale;
    const displayHeight = pageDimensions.height * scale;

    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paper background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw subtle paper texture (very light)
    ctx.fillStyle = '#fafafa';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw margin lines if enabled
    if (showMargins) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([]);

      // Left margin
      ctx.beginPath();
      ctx.moveTo(marginSize, marginSize);
      ctx.lineTo(marginSize, canvas.height - marginSize);
      ctx.stroke();

      // Top margin
      ctx.beginPath();
      ctx.moveTo(marginSize, marginSize);
      ctx.lineTo(canvas.width - marginSize, marginSize);
      ctx.stroke();
    }

    // Draw dot grid
    ctx.fillStyle = `rgba(156, 163, 175, 0.4)`; // More visible dots
    
    const startX = marginSize;
    const startY = marginSize;
    const endX = canvas.width - marginSize;
    const endY = canvas.height - marginSize;

    for (let x = startX; x <= endX; x += dotSpacing) {
      for (let y = startY; y <= endY; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Add subtle drop shadow effect to the page
    if (container) {
      container.style.filter = 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.1)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.06))';
    }

    // Notify parent that grid is ready
    if (onGridReady) {
      onGridReady(canvas);
    }
  }, [dotSize, dotSpacing, pageSize, showMargins, onGridReady]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative h-full flex items-center justify-center p-5',
        className
      )}
    >
      <div className="relative bg-white rounded-sm">
        <canvas
          ref={canvasRef}
          className="block"
          style={{
            imageRendering: 'crisp-edges',
          }}
        />
      </div>
    </div>
  );
}