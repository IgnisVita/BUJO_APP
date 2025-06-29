// ABOUTME: Core dot grid canvas component with customizable spacing and appearance
// Mimics real bullet journal dot grids like Leuchtturm1917 or Moleskine

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { GridType, GridConfig } from '@/lib/constants/grid-config';

interface DotGridProps {
  config: GridConfig;
  className?: string;
  width?: number;
  height?: number;
  showRulers?: boolean;
  showMargins?: boolean;
  onReady?: (canvas: HTMLCanvasElement) => void;
}

export function DotGrid({
  config,
  className,
  width = 1000,
  height = 1414, // A4 aspect ratio
  showRulers = false,
  showMargins = true,
  onReady,
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up high DPI canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw paper texture if enabled
    if (config.paperTexture) {
      ctx.globalAlpha = 0.03;
      for (let i = 0; i < width * height / 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const gray = Math.floor(Math.random() * 50) + 200;
        ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;
    }

    // Calculate margins
    const marginLeft = showMargins ? config.marginLeft : 0;
    const marginTop = showMargins ? config.marginTop : 0;
    const marginRight = showMargins ? config.marginRight : 0;
    const marginBottom = showMargins ? config.marginBottom : 0;

    // Draw margins if enabled
    if (showMargins && config.showMarginLines) {
      ctx.strokeStyle = config.marginColor;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.2;
      
      // Left margin
      ctx.beginPath();
      ctx.moveTo(marginLeft, 0);
      ctx.lineTo(marginLeft, height);
      ctx.stroke();
      
      // Top margin
      ctx.beginPath();
      ctx.moveTo(0, marginTop);
      ctx.lineTo(width, marginTop);
      ctx.stroke();
      
      ctx.globalAlpha = 1;
    }

    // Draw grid based on type
    const gridArea = {
      left: marginLeft,
      top: marginTop,
      right: width - marginRight,
      bottom: height - marginBottom,
    };

    switch (config.gridType) {
      case GridType.DOTS:
        drawDotGrid(ctx, config, gridArea);
        break;
      case GridType.LINES:
        drawLineGrid(ctx, config, gridArea);
        break;
      case GridType.GRAPH:
        drawGraphGrid(ctx, config, gridArea);
        break;
      case GridType.ISOMETRIC:
        drawIsometricGrid(ctx, config, gridArea);
        break;
      case GridType.BLANK:
        // No grid for blank
        break;
    }

    // Draw rulers if enabled
    if (showRulers) {
      drawRulers(ctx, width, height, config);
    }

    // Notify parent when ready
    if (onReady) {
      onReady(canvas);
    }
  }, [config, width, height, showRulers, showMargins, onReady]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'dot-grid-canvas',
        'shadow-lg',
        className
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
}

function drawDotGrid(
  ctx: CanvasRenderingContext2D,
  config: GridConfig,
  area: { left: number; top: number; right: number; bottom: number }
) {
  const spacing = config.spacing;
  const dotRadius = config.dotSize / 2;

  ctx.fillStyle = config.dotColor;
  ctx.globalAlpha = config.dotOpacity;

  for (let x = area.left; x <= area.right; x += spacing) {
    for (let y = area.top; y <= area.bottom; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
}

function drawLineGrid(
  ctx: CanvasRenderingContext2D,
  config: GridConfig,
  area: { left: number; top: number; right: number; bottom: number }
) {
  const spacing = config.spacing;

  ctx.strokeStyle = config.lineColor || config.dotColor;
  ctx.lineWidth = config.lineWidth || 0.5;
  ctx.globalAlpha = config.lineOpacity || config.dotOpacity;

  // Horizontal lines
  for (let y = area.top; y <= area.bottom; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(area.left, y);
    ctx.lineTo(area.right, y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function drawGraphGrid(
  ctx: CanvasRenderingContext2D,
  config: GridConfig,
  area: { left: number; top: number; right: number; bottom: number }
) {
  const spacing = config.spacing;

  ctx.strokeStyle = config.lineColor || config.dotColor;
  ctx.lineWidth = config.lineWidth || 0.5;
  ctx.globalAlpha = config.lineOpacity || config.dotOpacity;

  // Vertical lines
  for (let x = area.left; x <= area.right; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, area.top);
    ctx.lineTo(x, area.bottom);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = area.top; y <= area.bottom; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(area.left, y);
    ctx.lineTo(area.right, y);
    ctx.stroke();
  }

  // Draw major grid lines every 5 squares
  if (config.showMajorGrid) {
    ctx.lineWidth = 1;
    ctx.globalAlpha = (config.lineOpacity || config.dotOpacity) * 1.5;

    for (let x = area.left; x <= area.right; x += spacing * 5) {
      ctx.beginPath();
      ctx.moveTo(x, area.top);
      ctx.lineTo(x, area.bottom);
      ctx.stroke();
    }

    for (let y = area.top; y <= area.bottom; y += spacing * 5) {
      ctx.beginPath();
      ctx.moveTo(area.left, y);
      ctx.lineTo(area.right, y);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
}

function drawIsometricGrid(
  ctx: CanvasRenderingContext2D,
  config: GridConfig,
  area: { left: number; top: number; right: number; bottom: number }
) {
  const spacing = config.spacing;
  const angle = Math.PI / 6; // 30 degrees

  ctx.strokeStyle = config.lineColor || config.dotColor;
  ctx.lineWidth = config.lineWidth || 0.5;
  ctx.globalAlpha = config.lineOpacity || config.dotOpacity;

  // Calculate the height of equilateral triangles
  const h = spacing * Math.sqrt(3) / 2;

  // Draw lines at 30 degrees (going up-right)
  for (let i = -100; i < 200; i++) {
    const x1 = area.left + i * spacing;
    const y1 = area.bottom;
    const x2 = x1 + (area.bottom - area.top) / Math.tan(angle);
    const y2 = area.top;

    if ((x1 >= area.left && x1 <= area.right) || (x2 >= area.left && x2 <= area.right)) {
      ctx.beginPath();
      ctx.moveTo(Math.max(area.left, x1), y1 - Math.max(0, x1 - area.left) * Math.tan(angle));
      ctx.lineTo(Math.min(area.right, x2), y2 + Math.max(0, area.right - x2) * Math.tan(angle));
      ctx.stroke();
    }
  }

  // Draw lines at -30 degrees (going down-right)
  for (let i = -100; i < 200; i++) {
    const x1 = area.left + i * spacing;
    const y1 = area.top;
    const x2 = x1 + (area.bottom - area.top) / Math.tan(angle);
    const y2 = area.bottom;

    if ((x1 >= area.left && x1 <= area.right) || (x2 >= area.left && x2 <= area.right)) {
      ctx.beginPath();
      ctx.moveTo(Math.max(area.left, x1), y1 + Math.max(0, x1 - area.left) * Math.tan(angle));
      ctx.lineTo(Math.min(area.right, x2), y2 - Math.max(0, area.right - x2) * Math.tan(angle));
      ctx.stroke();
    }
  }

  // Draw vertical lines
  for (let x = area.left; x <= area.right; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, area.top);
    ctx.lineTo(x, area.bottom);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function drawRulers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: GridConfig
) {
  const rulerSize = 20;

  // Draw ruler backgrounds
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(0, 0, width, rulerSize);
  ctx.fillRect(0, 0, rulerSize, height);

  // Draw ruler markings
  ctx.strokeStyle = '#666';
  ctx.fillStyle = '#666';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'center';

  // Horizontal ruler (in mm)
  for (let x = 0; x < width; x += config.spacing) {
    const mm = Math.round(x / config.spacing * 5); // Assuming default 5mm spacing
    const isMajor = mm % 10 === 0;
    
    ctx.lineWidth = isMajor ? 1 : 0.5;
    ctx.beginPath();
    ctx.moveTo(x, rulerSize - (isMajor ? 8 : 5));
    ctx.lineTo(x, rulerSize);
    ctx.stroke();

    if (isMajor && mm > 0) {
      ctx.fillText(`${mm}`, x, 10);
    }
  }

  // Vertical ruler
  ctx.textAlign = 'right';
  for (let y = 0; y < height; y += config.spacing) {
    const mm = Math.round(y / config.spacing * 5);
    const isMajor = mm % 10 === 0;
    
    ctx.lineWidth = isMajor ? 1 : 0.5;
    ctx.beginPath();
    ctx.moveTo(rulerSize - (isMajor ? 8 : 5), y);
    ctx.lineTo(rulerSize, y);
    ctx.stroke();

    if (isMajor && mm > 0) {
      ctx.save();
      ctx.translate(10, y);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${mm}`, 0, 0);
      ctx.restore();
    }
  }

  // Corner square
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(0, 0, rulerSize, rulerSize);
}