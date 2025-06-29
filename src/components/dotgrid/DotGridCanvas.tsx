// ABOUTME: Canvas-based dot grid with visible dots, crosses, and grid patterns
// Implements true bullet journal dot grid with customizable styles

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface DotGridCanvasProps {
  width?: number;
  height?: number;
  spacing?: number;
  dotSize?: number;
  dotColor?: string;
  dotOpacity?: number;
  backgroundColor?: string;
  gridStyle?: 'dots' | 'crosses' | 'grid';
  showRulers?: boolean;
  className?: string;
  onReady?: (canvas: HTMLCanvasElement) => void;
}

export function DotGridCanvas({
  width = 816, // Letter width at 96 DPI
  height = 1056, // Letter height at 96 DPI
  spacing = 19, // ~5mm at 96 DPI
  dotSize = 1.5,
  dotColor = '#b0b0b0',
  dotOpacity = 0.4,
  backgroundColor = '#fefefe',
  gridStyle = 'dots',
  showRulers = false,
  className,
  onReady,
}: DotGridCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHighDPI, setIsHighDPI] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    setIsHighDPI(dpr > 1);

    // Set actual canvas size accounting for device pixel ratio
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Scale the drawing context to match device pixel ratio
    ctx.scale(dpr, dpr);

    // Clear canvas with background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Add subtle paper texture
    ctx.globalAlpha = 0.02;
    for (let i = 0; i < width * height / 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const gray = Math.floor(Math.random() * 20) + 230;
      ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;

    // Draw the grid based on style
    ctx.fillStyle = dotColor;
    ctx.strokeStyle = dotColor;
    ctx.globalAlpha = dotOpacity;

    switch (gridStyle) {
      case 'dots':
        drawDots(ctx, width, height, spacing, dotSize);
        break;
      case 'crosses':
        drawCrosses(ctx, width, height, spacing, dotSize);
        break;
      case 'grid':
        drawGrid(ctx, width, height, spacing);
        break;
    }

    ctx.globalAlpha = 1;

    // Draw rulers if enabled
    if (showRulers) {
      drawRulers(ctx, width, height, spacing);
    }

    // Notify parent when ready
    if (onReady) {
      onReady(canvas);
    }
  }, [width, height, spacing, dotSize, dotColor, dotOpacity, backgroundColor, gridStyle, showRulers, onReady]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'dot-grid-canvas',
        'shadow-lg',
        'cursor-crosshair',
        className
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        imageRendering: isHighDPI ? 'auto' : 'crisp-edges',
      }}
    />
  );
}

function drawDots(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spacing: number,
  dotSize: number
) {
  const radius = dotSize / 2;
  
  // Start from the margins to ensure dots align properly
  const startX = spacing;
  const startY = spacing;
  
  for (let x = startX; x < width; x += spacing) {
    for (let y = startY; y < height; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawCrosses(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spacing: number,
  crossSize: number
) {
  const halfSize = crossSize / 2;
  ctx.lineWidth = 0.8;
  
  const startX = spacing;
  const startY = spacing;
  
  for (let x = startX; x < width; x += spacing) {
    for (let y = startY; y < height; y += spacing) {
      ctx.beginPath();
      // Horizontal line
      ctx.moveTo(x - halfSize, y);
      ctx.lineTo(x + halfSize, y);
      // Vertical line
      ctx.moveTo(x, y - halfSize);
      ctx.lineTo(x, y + halfSize);
      ctx.stroke();
    }
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spacing: number
) {
  ctx.lineWidth = 0.5;
  
  // Draw vertical lines
  for (let x = spacing; x < width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Draw horizontal lines
  for (let y = spacing; y < height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Draw major grid lines every 5 squares (darker)
  ctx.globalAlpha = ctx.globalAlpha * 2; // Make major lines more visible
  ctx.lineWidth = 1;
  
  for (let x = spacing; x < width; x += spacing * 5) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  for (let y = spacing; y < height; y += spacing * 5) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawRulers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spacing: number
) {
  const rulerSize = 25;
  
  // Save current state
  ctx.save();
  
  // Draw ruler backgrounds
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, rulerSize);
  ctx.fillRect(0, 0, rulerSize, height);
  
  // Draw ruler markings
  ctx.strokeStyle = '#666';
  ctx.fillStyle = '#666';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Horizontal ruler (mm markings)
  let mm = 0;
  for (let x = spacing; x < width; x += spacing) {
    mm += 5; // Each spacing is ~5mm
    const isMajor = mm % 50 === 0;
    const isMinor = mm % 10 === 0;
    
    ctx.lineWidth = isMajor ? 1 : 0.5;
    ctx.beginPath();
    ctx.moveTo(x, rulerSize - (isMajor ? 10 : isMinor ? 7 : 4));
    ctx.lineTo(x, rulerSize);
    ctx.stroke();
    
    if (isMajor) {
      ctx.fillText(`${mm}`, x, 10);
    }
  }
  
  // Vertical ruler
  ctx.textAlign = 'right';
  mm = 0;
  for (let y = spacing; y < height; y += spacing) {
    mm += 5;
    const isMajor = mm % 50 === 0;
    const isMinor = mm % 10 === 0;
    
    ctx.lineWidth = isMajor ? 1 : 0.5;
    ctx.beginPath();
    ctx.moveTo(rulerSize - (isMajor ? 10 : isMinor ? 7 : 4), y);
    ctx.lineTo(rulerSize, y);
    ctx.stroke();
    
    if (isMajor) {
      ctx.save();
      ctx.translate(15, y);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${mm}`, 0, 0);
      ctx.restore();
    }
  }
  
  // Corner square
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(0, 0, rulerSize, rulerSize);
  
  // Restore state
  ctx.restore();
}