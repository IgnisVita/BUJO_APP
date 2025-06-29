// ABOUTME: Grid ruler component for measurement and alignment
// Displays horizontal and vertical rulers with grid units

'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { GridConfig, RulerSettings } from '@/types/grid';
import { pixelsToMm } from '@/lib/grid/grid-math';
import { cn } from '@/lib/utils/cn';

interface GridRulerProps {
  width: number;
  height: number;
  gridConfig: GridConfig;
  rulerSettings: RulerSettings;
  offset?: { x: number; y: number };
  className?: string;
}

export const GridRuler: React.FC<GridRulerProps> = ({
  width,
  height,
  gridConfig,
  rulerSettings,
  offset = { x: 0, y: 0 },
  className,
}) => {
  const horizontalCanvasRef = useRef<HTMLCanvasElement>(null);
  const verticalCanvasRef = useRef<HTMLCanvasElement>(null);
  const cornerRef = useRef<HTMLDivElement>(null);

  const rulerSize = 24; // Height of horizontal ruler, width of vertical ruler

  // Calculate ruler markings
  const markings = useMemo(() => {
    const majorInterval = gridConfig.spacing * 5; // Major mark every 5 grid units
    const minorInterval = gridConfig.spacing; // Minor mark every grid unit

    return {
      major: majorInterval,
      minor: minorInterval,
    };
  }, [gridConfig.spacing]);

  // Format measurement label based on unit
  const formatLabel = (value: number, unit: string): string => {
    switch (unit) {
      case 'mm':
        return `${Math.round(pixelsToMm(value))}`;
      case 'grid':
        return `${Math.round(value / gridConfig.spacing)}`;
      case 'px':
      default:
        return `${Math.round(value)}`;
    }
  };

  // Draw horizontal ruler
  useEffect(() => {
    if (!rulerSettings.showHorizontal) return;

    const canvas = horizontalCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, rulerSize);

    // Set styles
    ctx.fillStyle = rulerSettings.color;
    ctx.strokeStyle = rulerSettings.color;
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.globalAlpha = rulerSettings.opacity;

    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, rulerSize);
    ctx.fillStyle = rulerSettings.color;

    // Draw border
    ctx.strokeStyle = rulerSettings.color;
    ctx.beginPath();
    ctx.moveTo(0, rulerSize - 0.5);
    ctx.lineTo(width, rulerSize - 0.5);
    ctx.stroke();

    // Draw markings
    const startX = offset.x % markings.major;
    for (let x = startX; x < width; x += markings.minor) {
      const actualX = x - offset.x;
      const isMajor = Math.abs(actualX % markings.major) < 0.1;
      
      ctx.beginPath();
      ctx.moveTo(x + 0.5, rulerSize);
      ctx.lineTo(x + 0.5, rulerSize - (isMajor ? 12 : 6));
      ctx.stroke();

      // Draw labels for major markings
      if (isMajor && x > 20 && x < width - 20) {
        const label = formatLabel(actualX, rulerSettings.unit);
        ctx.fillText(label, x, 2);
      }
    }
  }, [width, rulerSize, gridConfig, rulerSettings, markings, offset, formatLabel]);

  // Draw vertical ruler
  useEffect(() => {
    if (!rulerSettings.showVertical) return;

    const canvas = verticalCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, rulerSize, height);

    // Set styles
    ctx.fillStyle = rulerSettings.color;
    ctx.strokeStyle = rulerSettings.color;
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = rulerSettings.opacity;

    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rulerSize, height);
    ctx.fillStyle = rulerSettings.color;

    // Draw border
    ctx.strokeStyle = rulerSettings.color;
    ctx.beginPath();
    ctx.moveTo(rulerSize - 0.5, 0);
    ctx.lineTo(rulerSize - 0.5, height);
    ctx.stroke();

    // Draw markings
    const startY = offset.y % markings.major;
    for (let y = startY; y < height; y += markings.minor) {
      const actualY = y - offset.y;
      const isMajor = Math.abs(actualY % markings.major) < 0.1;
      
      ctx.beginPath();
      ctx.moveTo(rulerSize, y + 0.5);
      ctx.lineTo(rulerSize - (isMajor ? 12 : 6), y + 0.5);
      ctx.stroke();

      // Draw labels for major markings (rotated)
      if (isMajor && y > 20 && y < height - 20) {
        ctx.save();
        ctx.translate(12, y);
        ctx.rotate(-Math.PI / 2);
        const label = formatLabel(actualY, rulerSettings.unit);
        ctx.fillText(label, 0, 0);
        ctx.restore();
      }
    }
  }, [height, rulerSize, gridConfig, rulerSettings, markings, offset, formatLabel]);

  return (
    <div className={cn('relative', className)}>
      {/* Horizontal Ruler */}
      {rulerSettings.showHorizontal && (
        <canvas
          ref={horizontalCanvasRef}
          width={width}
          height={rulerSize}
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            opacity: rulerSettings.opacity,
            zIndex: 10,
          }}
        />
      )}

      {/* Vertical Ruler */}
      {rulerSettings.showVertical && (
        <canvas
          ref={verticalCanvasRef}
          width={rulerSize}
          height={height}
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            opacity: rulerSettings.opacity,
            zIndex: 10,
          }}
        />
      )}

      {/* Corner square */}
      {rulerSettings.showHorizontal && rulerSettings.showVertical && (
        <div
          ref={cornerRef}
          className="absolute top-0 left-0 bg-white border-r border-b pointer-events-none"
          style={{
            width: rulerSize,
            height: rulerSize,
            borderColor: rulerSettings.color,
            opacity: rulerSettings.opacity,
            zIndex: 11,
          }}
        >
          <div className="flex items-center justify-center h-full text-xs font-mono"
               style={{ color: rulerSettings.color, fontSize: '9px' }}>
            {rulerSettings.unit}
          </div>
        </div>
      )}
    </div>
  );
};

// Grid counting overlay component
interface GridCounterProps {
  startPoint: { x: number; y: number } | null;
  endPoint: { x: number; y: number } | null;
  gridConfig: GridConfig;
  className?: string;
}

export const GridCounter: React.FC<GridCounterProps> = ({
  startPoint,
  endPoint,
  gridConfig,
  className,
}) => {
  if (!startPoint || !endPoint) return null;

  const gridDeltaX = Math.abs(Math.round((endPoint.x - startPoint.x) / gridConfig.spacing));
  const gridDeltaY = Math.abs(Math.round((endPoint.y - startPoint.y) / gridConfig.spacing));

  return (
    <div
      className={cn(
        'absolute bg-blue-500 text-white px-2 py-1 rounded text-xs font-mono pointer-events-none',
        className
      )}
      style={{
        left: Math.min(startPoint.x, endPoint.x) + Math.abs(endPoint.x - startPoint.x) / 2,
        top: Math.min(startPoint.y, endPoint.y) + Math.abs(endPoint.y - startPoint.y) / 2,
        transform: 'translate(-50%, -50%)',
        zIndex: 20,
      }}
    >
      {gridDeltaX} × {gridDeltaY}
    </div>
  );
};

// Alignment guide component
interface AlignmentGuideProps {
  guides: { horizontal: number[]; vertical: number[] };
  color?: string;
  width: number;
  height: number;
  className?: string;
}

export const AlignmentGuides: React.FC<AlignmentGuideProps> = ({
  guides,
  color = '#3b82f6',
  width,
  height,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set styles
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha = 0.5;

    // Draw horizontal guides
    guides.horizontal.forEach(y => {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
      ctx.stroke();
    });

    // Draw vertical guides
    guides.vertical.forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
      ctx.stroke();
    });
  }, [guides, color, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{ zIndex: 15 }}
    />
  );
};