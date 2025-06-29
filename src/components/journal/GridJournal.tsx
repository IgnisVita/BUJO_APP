// ABOUTME: Grid-based journal component that integrates customization
// Combines journal entries with grid layout and box containers

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GridConfig, Box } from '@/types/grid';
import { JournalEntry } from '@/lib/types';
import { getGridPointsInBounds } from '@/lib/grid/grid-math';
import { cn } from '@/lib/utils/cn';

interface GridJournalProps {
  config: GridConfig;
  boxes: Box[];
  entries: JournalEntry[];
  pageWidth: number;
  pageHeight: number;
  className?: string;
  onEntryClick?: (entry: JournalEntry) => void;
}

export const GridJournal: React.FC<GridJournalProps> = ({
  config,
  boxes,
  entries,
  pageWidth,
  pageHeight,
  className,
  onEntryClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [boxContentMap, setBoxContentMap] = useState<Map<string, JournalEntry[]>>(new Map());

  // Render grid background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and set background
    ctx.clearRect(0, 0, pageWidth, pageHeight);
    ctx.fillStyle = config.paperColor;
    ctx.fillRect(0, 0, pageWidth, pageHeight);

    // Apply texture
    if (config.paperTexture !== 'smooth') {
      ctx.globalAlpha = 0.03;
      const gradient = ctx.createLinearGradient(0, 0, pageWidth, pageHeight);
      gradient.addColorStop(0, '#f0f0f0');
      gradient.addColorStop(1, '#e0e0e0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, pageWidth, pageHeight);
      ctx.globalAlpha = 1;
    }

    // Draw margins
    if (config.showMargins) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        config.marginSize,
        config.marginSize,
        pageWidth - 2 * config.marginSize,
        pageHeight - 2 * config.marginSize
      );
      ctx.setLineDash([]);
    }

    // Draw grid
    const gridPoints = getGridPointsInBounds(
      0,
      0,
      pageWidth,
      pageHeight,
      config.spacing,
      config.type
    );

    ctx.fillStyle = config.color;
    ctx.strokeStyle = config.color;
    ctx.globalAlpha = config.opacity;

    switch (config.type) {
      case 'dots':
        gridPoints.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, config.dotSize / 2, 0, Math.PI * 2);
          ctx.fill();
        });
        break;

      case 'lines':
        const uniqueYs = [...new Set(gridPoints.map(p => p.y))];
        ctx.lineWidth = 1;
        uniqueYs.forEach(y => {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(pageWidth, y);
          ctx.stroke();
        });
        break;

      case 'grid':
        const uniqueXs = [...new Set(gridPoints.map(p => p.x))];
        const uniqueYsGrid = [...new Set(gridPoints.map(p => p.y))];
        ctx.lineWidth = 1;
        
        uniqueXs.forEach(x => {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, pageHeight);
          ctx.stroke();
        });
        
        uniqueYsGrid.forEach(y => {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(pageWidth, y);
          ctx.stroke();
        });
        break;
    }

    ctx.globalAlpha = 1;

    // Draw page edges
    if (config.showPageEdges) {
      ctx.strokeStyle = config.pageEdgeColor;
      ctx.lineWidth = 1;
      
      switch (config.pageEdgeStyle) {
        case 'dashed':
          ctx.setLineDash([10, 5]);
          break;
        case 'dotted':
          ctx.setLineDash([2, 3]);
          break;
      }
      
      ctx.strokeRect(0.5, 0.5, pageWidth - 1, pageHeight - 1);
      ctx.setLineDash([]);
    }
  }, [config, pageWidth, pageHeight]);

  // Assign entries to boxes based on position
  useEffect(() => {
    const newMap = new Map<string, JournalEntry[]>();
    
    // Sort boxes by position (top to bottom, left to right)
    const sortedBoxes = [...boxes].sort((a, b) => {
      if (Math.abs(a.y - b.y) < config.spacing) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });

    // Distribute entries among boxes
    let entryIndex = 0;
    sortedBoxes.forEach(box => {
      const boxEntries: JournalEntry[] = [];
      const maxEntries = Math.floor(box.height / (config.spacing * 1.5));
      
      while (entryIndex < entries.length && boxEntries.length < maxEntries) {
        boxEntries.push(entries[entryIndex]);
        entryIndex++;
      }
      
      if (boxEntries.length > 0) {
        newMap.set(box.id, boxEntries);
      }
    });

    setBoxContentMap(newMap);
  }, [boxes, entries, config.spacing]);

  // Render box border styles
  const getBoxStyles = (box: Box) => {
    const borderStyles: Record<string, string> = {
      solid: 'solid',
      dashed: 'dashed',
      double: 'double',
      dotted: 'dotted',
    };

    return {
      borderStyle: borderStyles[box.borderStyle],
      borderWidth: box.borderWidth,
      borderColor: box.borderColor,
      borderRadius: box.borderRadius,
      backgroundColor: box.fillColor === 'transparent' 
        ? 'transparent' 
        : `${box.fillColor}${Math.round((box.fillOpacity || 0) * 255).toString(16).padStart(2, '0')}`,
    };
  };

  // Render entry based on type
  const renderEntry = (entry: JournalEntry, index: number) => {
    const entryIcons = {
      task: entry.status === 'done' ? '✓' : '•',
      note: '—',
      event: '○',
      habit: '◆',
    };

    const entryColors = {
      task: entry.status === 'done' ? 'text-green-600' : 'text-blue-600',
      note: 'text-gray-700',
      event: 'text-purple-600',
      habit: 'text-orange-600',
    };

    return (
      <motion.div
        key={entry.id}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          'flex items-start gap-2 cursor-pointer hover:bg-black/5 px-2 py-1 rounded',
          'text-sm leading-relaxed'
        )}
        onClick={() => onEntryClick?.(entry)}
        style={{ minHeight: config.spacing }}
      >
        <span className={cn('font-mono', entryColors[entry.type])}>
          {entryIcons[entry.type]}
        </span>
        <span className={cn(
          'flex-1',
          entry.type === 'task' && entry.status === 'done' && 'line-through opacity-60'
        )}>
          {entry.content}
        </span>
      </motion.div>
    );
  };

  return (
    <div className={cn('relative', className)} style={{ width: pageWidth, height: pageHeight }}>
      {/* Grid background */}
      <canvas
        ref={canvasRef}
        width={pageWidth}
        height={pageHeight}
        className="absolute inset-0"
      />

      {/* Boxes with content */}
      {boxes.map(box => {
        const boxEntries = boxContentMap.get(box.id) || [];
        
        return (
          <div
            key={box.id}
            className="absolute overflow-hidden"
            style={{
              left: box.x,
              top: box.y,
              width: box.width,
              height: box.height,
              zIndex: box.zIndex,
              ...getBoxStyles(box),
            }}
          >
            {/* Box content */}
            <div className="p-2 h-full overflow-y-auto">
              {boxEntries.length > 0 ? (
                <div className="space-y-1">
                  {boxEntries.map((entry, index) => renderEntry(entry, index))}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">
                  {box.locked ? 'Locked' : 'Empty container'}
                </div>
              )}
            </div>

            {/* Lock indicator */}
            {box.locked && (
              <div className="absolute top-1 right-1">
                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        );
      })}

      {/* Loose entries (not in boxes) */}
      {entries.length > boxContentMap.size && (
        <div className="absolute bottom-4 left-4 right-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            {entries.length - Array.from(boxContentMap.values()).flat().length} entries need containers
          </p>
        </div>
      )}
    </div>
  );
};