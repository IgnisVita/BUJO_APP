// ABOUTME: Box drawing tool for creating containers on the grid
// Allows drawing, resizing, and styling rectangular boxes that snap to grid

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Square, 
  Circle, 
  Copy, 
  Trash2, 
  Lock, 
  Unlock,
  Palette,
  BorderStyle,
  CornerDownRight
} from 'lucide-react';
import { Box, GridConfig, BorderStyle as BorderStyleType, SnapSettings } from '@/types/grid';
import { useGridSnap } from '@/hooks/useGridSnap';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

interface BoxDrawingToolProps {
  gridConfig: GridConfig;
  snapSettings: SnapSettings;
  boxes: Box[];
  selectedBoxId?: string;
  onBoxCreate: (box: Box) => void;
  onBoxUpdate: (id: string, updates: Partial<Box>) => void;
  onBoxDelete: (id: string) => void;
  onBoxSelect: (id: string | undefined) => void;
  onBoxCopy: (box: Box) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export const BoxDrawingTool: React.FC<BoxDrawingToolProps> = ({
  gridConfig,
  snapSettings,
  boxes,
  selectedBoxId,
  onBoxCreate,
  onBoxUpdate,
  onBoxDelete,
  onBoxSelect,
  onBoxCopy,
  canvasWidth,
  canvasHeight,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<Partial<Box> | null>(null);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const { snapPoint, snapBox } = useGridSnap({ gridConfig, snapSettings });

  // Start drawing a new box
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on an existing box
    const clickedBox = boxes.find(box => 
      x >= box.x && x <= box.x + box.width &&
      y >= box.y && y <= box.y + box.height
    );

    if (clickedBox) {
      onBoxSelect(clickedBox.id);
      
      if (!clickedBox.locked) {
        setIsDragging(true);
        setDragOffset({
          x: x - clickedBox.x,
          y: y - clickedBox.y,
        });
      }
      return;
    }

    // Start drawing new box
    onBoxSelect(undefined);
    const snapped = snapPoint(x, y);
    setIsDrawing(true);
    setDrawStart(snapped);
    setCurrentBox({
      x: snapped.x,
      y: snapped.y,
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderWidth: 2,
      borderColor: '#374151',
      borderRadius: 0,
      fillColor: 'transparent',
      fillOpacity: 0,
      zIndex: boxes.length,
    });
  }, [boxes, snapPoint, onBoxSelect]);

  // Update box while drawing
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawing && drawStart && currentBox) {
      const snapped = snapPoint(x, y);
      const box = snapBox(
        Math.min(drawStart.x, snapped.x),
        Math.min(drawStart.y, snapped.y),
        Math.abs(snapped.x - drawStart.x),
        Math.abs(snapped.y - drawStart.y)
      );
      
      setCurrentBox({
        ...currentBox,
        ...box,
      });
    } else if (isDragging && selectedBoxId) {
      const selectedBox = boxes.find(b => b.id === selectedBoxId);
      if (selectedBox && !selectedBox.locked) {
        const newX = x - dragOffset.x;
        const newY = y - dragOffset.y;
        const snapped = snapBox(newX, newY, selectedBox.width, selectedBox.height);
        
        onBoxUpdate(selectedBoxId, {
          x: snapped.x,
          y: snapped.y,
        });
      }
    } else if (isResizing && selectedBoxId) {
      const selectedBox = boxes.find(b => b.id === selectedBoxId);
      if (selectedBox && !selectedBox.locked) {
        const snapped = snapPoint(x, y);
        
        switch (isResizing) {
          case 'br': // Bottom right
            onBoxUpdate(selectedBoxId, snapBox(
              selectedBox.x,
              selectedBox.y,
              snapped.x - selectedBox.x,
              snapped.y - selectedBox.y
            ));
            break;
          case 'tr': // Top right
            onBoxUpdate(selectedBoxId, snapBox(
              selectedBox.x,
              snapped.y,
              snapped.x - selectedBox.x,
              selectedBox.y + selectedBox.height - snapped.y
            ));
            break;
          case 'bl': // Bottom left
            onBoxUpdate(selectedBoxId, snapBox(
              snapped.x,
              selectedBox.y,
              selectedBox.x + selectedBox.width - snapped.x,
              snapped.y - selectedBox.y
            ));
            break;
          case 'tl': // Top left
            onBoxUpdate(selectedBoxId, snapBox(
              snapped.x,
              snapped.y,
              selectedBox.x + selectedBox.width - snapped.x,
              selectedBox.y + selectedBox.height - snapped.y
            ));
            break;
        }
      }
    }
  }, [isDrawing, drawStart, currentBox, isDragging, isResizing, selectedBoxId, boxes, dragOffset, snapPoint, snapBox, onBoxUpdate]);

  // Finish drawing
  const handleMouseUp = useCallback(() => {
    if (isDrawing && currentBox && currentBox.width! > 0 && currentBox.height! > 0) {
      onBoxCreate({
        ...currentBox,
        id: `box-${Date.now()}`,
      } as Box);
    }
    
    setIsDrawing(false);
    setDrawStart(null);
    setCurrentBox(null);
    setIsDragging(false);
    setIsResizing(null);
  }, [isDrawing, currentBox, onBoxCreate]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedBoxId) return;

      const selectedBox = boxes.find(b => b.id === selectedBoxId);
      if (!selectedBox) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (!selectedBox.locked) {
            onBoxDelete(selectedBoxId);
            onBoxSelect(undefined);
          }
          break;
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            onBoxCopy(selectedBox);
          }
          break;
        case 'l':
          if (e.ctrlKey || e.metaKey) {
            onBoxUpdate(selectedBoxId, { locked: !selectedBox.locked });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBoxId, boxes, onBoxDelete, onBoxCopy, onBoxUpdate, onBoxSelect]);

  // Render box with correct border style
  const renderBoxBorder = (box: Partial<Box>) => {
    const borderStyles: Record<BorderStyleType, string> = {
      solid: 'solid',
      dashed: 'dashed',
      double: 'double',
      dotted: 'dotted',
    };

    return {
      borderStyle: borderStyles[box.borderStyle || 'solid'],
      borderWidth: box.borderWidth,
      borderColor: box.borderColor,
      borderRadius: box.borderRadius,
      backgroundColor: box.fillColor === 'transparent' ? 'transparent' : 
        `${box.fillColor}${Math.round((box.fillOpacity || 0) * 255).toString(16).padStart(2, '0')}`,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Render existing boxes */}
      <AnimatePresence>
        {boxes.map(box => (
          <motion.div
            key={box.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              'absolute pointer-events-auto',
              selectedBoxId === box.id && 'ring-2 ring-blue-500 ring-offset-2',
              box.locked && 'cursor-not-allowed'
            )}
            style={{
              left: box.x,
              top: box.y,
              width: box.width,
              height: box.height,
              zIndex: box.zIndex,
              ...renderBoxBorder(box),
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onBoxSelect(box.id);
              if (!box.locked) {
                setIsDragging(true);
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) {
                  setDragOffset({
                    x: e.clientX - rect.left - box.x,
                    y: e.clientY - rect.top - box.y,
                  });
                }
              }
            }}
          >
            {/* Resize handles */}
            {selectedBoxId === box.id && !box.locked && (
              <>
                {['tl', 'tr', 'bl', 'br'].map(handle => (
                  <div
                    key={handle}
                    className="absolute w-3 h-3 bg-blue-500 cursor-pointer"
                    style={{
                      top: handle.includes('t') ? -6 : 'auto',
                      bottom: handle.includes('b') ? -6 : 'auto',
                      left: handle.includes('l') ? -6 : 'auto',
                      right: handle.includes('r') ? -6 : 'auto',
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setIsResizing(handle);
                    }}
                  />
                ))}
              </>
            )}

            {/* Lock indicator */}
            {box.locked && (
              <div className="absolute top-1 right-1">
                <Lock className="w-3 h-3 text-gray-500" />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Current drawing box */}
      {isDrawing && currentBox && currentBox.width! > 0 && currentBox.height! > 0 && (
        <div
          className="absolute pointer-events-none border-2 border-dashed border-blue-500"
          style={{
            left: currentBox.x,
            top: currentBox.y,
            width: currentBox.width,
            height: currentBox.height,
          }}
        />
      )}
    </div>
  );
};

// Box style editor component
interface BoxStyleEditorProps {
  box: Box;
  onUpdate: (updates: Partial<Box>) => void;
  onDelete: () => void;
  onCopy: () => void;
}

export const BoxStyleEditor: React.FC<BoxStyleEditorProps> = ({
  box,
  onUpdate,
  onDelete,
  onCopy,
}) => {
  const borderStyles: { value: BorderStyleType; label: string }[] = [
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'double', label: 'Double' },
    { value: 'dotted', label: 'Dotted' },
  ];

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-neutral-900 rounded-lg border">
      <h3 className="font-semibold text-sm">Box Properties</h3>

      {/* Border Style */}
      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400">Border Style</label>
        <div className="flex gap-1 mt-1">
          {borderStyles.map(style => (
            <Button
              key={style.value}
              size="sm"
              variant={box.borderStyle === style.value ? 'default' : 'outline'}
              onClick={() => onUpdate({ borderStyle: style.value })}
              className="text-xs"
            >
              {style.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Border Width */}
      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400">Border Width</label>
        <input
          type="range"
          min="1"
          max="5"
          value={box.borderWidth}
          onChange={(e) => onUpdate({ borderWidth: parseInt(e.target.value) })}
          className="w-full mt-1"
        />
      </div>

      {/* Border Color */}
      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400">Border Color</label>
        <div className="flex gap-2 items-center mt-1">
          <input
            type="color"
            value={box.borderColor}
            onChange={(e) => onUpdate({ borderColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer"
          />
          <input
            type="text"
            value={box.borderColor}
            onChange={(e) => onUpdate({ borderColor: e.target.value })}
            className="flex-1 px-2 py-1 text-xs border rounded"
          />
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400">Corner Radius</label>
        <input
          type="range"
          min="0"
          max="20"
          value={box.borderRadius}
          onChange={(e) => onUpdate({ borderRadius: parseInt(e.target.value) })}
          className="w-full mt-1"
        />
      </div>

      {/* Fill Color */}
      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400">Fill Color</label>
        <div className="flex gap-2 items-center mt-1">
          <input
            type="color"
            value={box.fillColor === 'transparent' ? '#ffffff' : box.fillColor}
            onChange={(e) => onUpdate({ fillColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer"
          />
          <Button
            size="sm"
            variant={box.fillColor === 'transparent' ? 'default' : 'outline'}
            onClick={() => onUpdate({ fillColor: 'transparent' })}
            className="text-xs"
          >
            None
          </Button>
        </div>
      </div>

      {/* Fill Opacity */}
      {box.fillColor !== 'transparent' && (
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">Fill Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={box.fillOpacity}
            onChange={(e) => onUpdate({ fillOpacity: parseFloat(e.target.value) })}
            className="w-full mt-1"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdate({ locked: !box.locked })}
          className="flex-1"
        >
          {box.locked ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
          {box.locked ? 'Unlock' : 'Lock'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCopy}
          className="flex-1"
        >
          <Copy className="w-3 h-3 mr-1" />
          Copy
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDelete}
          disabled={box.locked}
          className="flex-1 text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
};