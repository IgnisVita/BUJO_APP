// ABOUTME: Draggable floating tool palette that can be minimized
// Provides additional tools without cluttering the journal interface

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { 
  Palette,
  Eraser,
  Circle,
  Square,
  Triangle,
  Minus,
  Undo,
  Redo,
  X,
  GripVertical,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FloatingToolsProps {
  onColorChange?: (color: string) => void;
  onToolSelect?: (tool: string) => void;
  selectedColor?: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function FloatingTools({
  onColorChange,
  onToolSelect,
  selectedColor = '#000000',
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo
}: FloatingToolsProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);

  const colors = [
    '#000000', // Black
    '#1f2937', // Gray 800
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
  ];

  useEffect(() => {
    // Set constraints ref after mount
    constraintsRef.current = document.body;
  }, []);

  return (
    <>
      {/* Invisible constraints div */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none" />
      
      <motion.div
        drag
        dragControls={dragControls}
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        initial={{ x: 20, y: 100 }}
        className={cn(
          "fixed z-40",
          "bg-white dark:bg-neutral-800",
          "rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50",
          "select-none"
        )}
      >
        {/* Drag Handle */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="flex items-center justify-between px-3 py-2 cursor-move border-b border-neutral-200 dark:border-neutral-700"
        >
          <GripVertical className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Tools</span>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="w-3 h-3" />
            ) : (
              <Minimize2 className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Tools Content */}
        {!isMinimized && (
          <div className="p-3 space-y-3">
            {/* Color Picker */}
            <div className="space-y-2">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <Palette className="w-4 h-4" />
                <div
                  className="w-5 h-5 rounded border-2 border-neutral-300 dark:border-neutral-600"
                  style={{ backgroundColor: selectedColor }}
                />
              </button>
              
              {showColorPicker && (
                <div className="grid grid-cols-5 gap-1.5 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        onColorChange?.(color);
                        setShowColorPicker(false);
                      }}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                        selectedColor === color 
                          ? "border-primary-500" 
                          : "border-neutral-300 dark:border-neutral-600"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Shape Tools */}
            <div className="flex gap-1">
              <button
                onClick={() => onToolSelect?.('circle')}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                title="Circle"
              >
                <Circle className="w-4 h-4" />
              </button>
              <button
                onClick={() => onToolSelect?.('square')}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                title="Square"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => onToolSelect?.('triangle')}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                title="Triangle"
              >
                <Triangle className="w-4 h-4" />
              </button>
              <button
                onClick={() => onToolSelect?.('line')}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                title="Line"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            <div className="h-px bg-neutral-200 dark:bg-neutral-700" />

            {/* Additional Tools */}
            <div className="flex gap-1">
              <button
                onClick={() => onToolSelect?.('eraser')}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                title="Eraser"
              >
                <Eraser className="w-4 h-4" />
              </button>
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  canUndo 
                    ? "hover:bg-neutral-100 dark:hover:bg-neutral-700" 
                    : "opacity-30 cursor-not-allowed"
                )}
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  canRedo 
                    ? "hover:bg-neutral-100 dark:hover:bg-neutral-700" 
                    : "opacity-30 cursor-not-allowed"
                )}
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}