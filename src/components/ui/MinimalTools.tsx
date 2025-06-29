// ABOUTME: Minimal tool palette for the simple journal
// Small, unobtrusive tools that don't distract from journaling

'use client';

import { useState } from 'react';
import { Pen, Type, Settings, Palette, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type Tool = 'pen' | 'text' | 'settings';

interface MinimalToolsProps {
  selectedTool: Tool;
  onToolChange: (tool: Tool) => void;
  penColor: string;
  onPenColorChange: (color: string) => void;
  penSize: number;
  onPenSizeChange: (size: number) => void;
  dotSize: number;
  onDotSizeChange: (size: number) => void;
  dotSpacing: number;
  onDotSpacingChange: (spacing: number) => void;
  showSettings: boolean;
  onSettingsToggle: () => void;
}

export function MinimalTools({
  selectedTool,
  onToolChange,
  penColor,
  onPenColorChange,
  penSize,
  onPenSizeChange,
  dotSize,
  onDotSizeChange,
  dotSpacing,
  onDotSpacingChange,
  showSettings,
  onSettingsToggle,
}: MinimalToolsProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const quickColors = [
    '#000000', // Black
    '#374151', // Gray
    '#dc2626', // Red
    '#2563eb', // Blue
    '#16a34a', // Green
    '#ca8a04', // Yellow
    '#9333ea', // Purple
    '#ea580c', // Orange
  ];

  return (
    <>
      {/* Main Tool Bar - Always visible, top right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-3 py-2 border border-neutral-200">
        {/* Pen Tool */}
        <button
          onClick={() => onToolChange('pen')}
          className={cn(
            'p-2 rounded-full transition-colors',
            selectedTool === 'pen'
              ? 'bg-neutral-900 text-white'
              : 'hover:bg-neutral-100 text-neutral-600'
          )}
          title="Pen Tool"
        >
          <Pen className="w-4 h-4" />
        </button>

        {/* Text Tool */}
        <button
          onClick={() => onToolChange('text')}
          className={cn(
            'p-2 rounded-full transition-colors',
            selectedTool === 'text'
              ? 'bg-neutral-900 text-white'
              : 'hover:bg-neutral-100 text-neutral-600'
          )}
          title="Text Tool"
        >
          <Type className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-neutral-200" />

        {/* Color Picker Toggle */}
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="p-2 rounded-full hover:bg-neutral-100 text-neutral-600 relative"
          title="Colors"
        >
          <Palette className="w-4 h-4" />
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
            style={{ backgroundColor: penColor }}
          />
        </button>

        {/* Settings */}
        <button
          onClick={() => onToolChange('settings')}
          className={cn(
            'p-2 rounded-full transition-colors',
            showSettings
              ? 'bg-neutral-900 text-white'
              : 'hover:bg-neutral-100 text-neutral-600'
          )}
          title="Grid Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Color Picker Popup */}
      {showColorPicker && (
        <div className="fixed top-16 right-4 z-50 bg-white rounded-lg shadow-xl border border-neutral-200 p-3">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {quickColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onPenColorChange(color);
                  setShowColorPicker(false);
                }}
                className={cn(
                  'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                  penColor === color ? 'border-neutral-400' : 'border-neutral-200'
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={penColor}
              onChange={(e) => onPenColorChange(e.target.value)}
              className="w-8 h-8 rounded border border-neutral-200 cursor-pointer"
            />
            <span className="text-xs text-neutral-500">Custom</span>
          </div>

          {/* Pen Size */}
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-600">Pen Size</span>
              <span className="text-xs text-neutral-400">{penSize}px</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPenSizeChange(Math.max(1, penSize - 1))}
                className="p-1 rounded hover:bg-neutral-100"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="1"
                max="10"
                value={penSize}
                onChange={(e) => onPenSizeChange(Number(e.target.value))}
                className="flex-1"
              />
              <button
                onClick={() => onPenSizeChange(Math.min(10, penSize + 1))}
                className="p-1 rounded hover:bg-neutral-100"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed top-16 right-4 z-50 bg-white rounded-lg shadow-xl border border-neutral-200 p-4 w-64">
          <h3 className="font-medium mb-4 flex items-center justify-between">
            Grid Settings
            <button
              onClick={onSettingsToggle}
              className="text-neutral-400 hover:text-neutral-600"
            >
              ×
            </button>
          </h3>

          {/* Dot Size */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-neutral-600">Dot Size</label>
              <span className="text-xs text-neutral-400">{dotSize}px</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={dotSize}
              onChange={(e) => onDotSizeChange(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Dot Spacing */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-neutral-600">Dot Spacing</label>
              <span className="text-xs text-neutral-400">{dotSpacing}px</span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              value={dotSpacing}
              onChange={(e) => onDotSpacingChange(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-sm text-neutral-600 mb-2 block">Quick Presets</label>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onDotSizeChange(1);
                  onDotSpacingChange(15);
                }}
                className="w-full text-left px-2 py-1 text-sm rounded hover:bg-neutral-50"
              >
                Fine (1px • 15px)
              </button>
              <button
                onClick={() => {
                  onDotSizeChange(1.5);
                  onDotSpacingChange(20);
                }}
                className="w-full text-left px-2 py-1 text-sm rounded hover:bg-neutral-50"
              >
                Standard (1.5px • 20px)
              </button>
              <button
                onClick={() => {
                  onDotSizeChange(2);
                  onDotSpacingChange(25);
                }}
                className="w-full text-left px-2 py-1 text-sm rounded hover:bg-neutral-50"
              >
                Large (2px • 25px)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close popups */}
      {(showColorPicker || showSettings) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowColorPicker(false);
            if (showSettings) onSettingsToggle();
          }}
        />
      )}
    </>
  );
}