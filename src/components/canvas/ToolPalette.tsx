// ABOUTME: Drawing tools sidebar with pen, marker, shapes, and brush controls
// Provides intuitive tool selection and configuration for digital drawing

'use client';

import React, { useState, useCallback } from 'react';
import { 
  PenTool, 
  Highlighter, 
  Eraser, 
  Circle, 
  Square, 
  Triangle, 
  Type,
  Minus,
  Undo2,
  Redo2,
  Download,
  Save,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
} from 'lucide-react';
import ColorPicker from './ColorPicker';
import { BrushConfig } from '@/lib/canvas/brushes';
import { cn } from '@/lib/utils/cn';

export interface ToolPaletteProps {
  currentTool: string;
  brushConfig: BrushConfig;
  onToolChange: (tool: string, config?: Partial<BrushConfig>) => void;
  onBrushConfigChange: (config: Partial<BrushConfig>) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  onExport?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
  variant?: 'sidebar' | 'toolbar';
}

interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  category: 'drawing' | 'shapes' | 'editing';
  shortcut?: string;
}

const DRAWING_TOOLS: Tool[] = [
  {
    id: 'pen',
    name: 'Pen',
    icon: PenTool,
    description: 'Pressure-sensitive pen tool',
    category: 'drawing',
    shortcut: 'P',
  },
  {
    id: 'pencil',
    name: 'Pencil',
    icon: PenTool,
    description: 'Basic pencil tool',
    category: 'drawing',
    shortcut: 'B',
  },
  {
    id: 'marker',
    name: 'Marker',
    icon: Highlighter,
    description: 'Textured marker brush',
    category: 'drawing',
    shortcut: 'M',
  },
  {
    id: 'highlighter',
    name: 'Highlighter',
    icon: Highlighter,
    description: 'Transparent highlighter',
    category: 'drawing',
    shortcut: 'H',
  },
  {
    id: 'calligraphy',
    name: 'Calligraphy',
    icon: PenTool,
    description: 'Angle-sensitive calligraphy brush',
    category: 'drawing',
    shortcut: 'C',
  },
  {
    id: 'eraser',
    name: 'Eraser',
    icon: Eraser,
    description: 'Erase drawings',
    category: 'editing',
    shortcut: 'E',
  },
];

const SHAPE_TOOLS: Tool[] = [
  {
    id: 'line',
    name: 'Line',
    icon: Minus,
    description: 'Draw straight lines',
    category: 'shapes',
    shortcut: 'L',
  },
  {
    id: 'rectangle',
    name: 'Rectangle',
    icon: Square,
    description: 'Draw rectangles',
    category: 'shapes',
    shortcut: 'R',
  },
  {
    id: 'circle',
    name: 'Circle',
    icon: Circle,
    description: 'Draw circles and ellipses',
    category: 'shapes',
    shortcut: 'O',
  },
  {
    id: 'triangle',
    name: 'Triangle',
    icon: Triangle,
    description: 'Draw triangles',
    category: 'shapes',
    shortcut: 'T',
  },
  {
    id: 'text',
    name: 'Text',
    icon: Type,
    description: 'Add text',
    category: 'shapes',
    shortcut: 'X',
  },
];

const BRUSH_SIZE_PRESETS = [1, 3, 5, 8, 12, 20, 30];
const OPACITY_PRESETS = [0.1, 0.25, 0.5, 0.75, 1.0];

const ToolPalette: React.FC<ToolPaletteProps> = ({
  currentTool,
  brushConfig,
  onToolChange,
  onBrushConfigChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onLoad,
  onExport,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  canUndo = false,
  canRedo = false,
  className,
  variant = 'sidebar',
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['drawing', 'brush'])
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const handleToolSelect = useCallback((tool: Tool) => {
    onToolChange(tool.id);
  }, [onToolChange]);

  const handleBrushSizeChange = useCallback((size: number) => {
    onBrushConfigChange({ maxWidth: size });
  }, [onBrushConfigChange]);

  const handleOpacityChange = useCallback((opacity: number) => {
    onBrushConfigChange({ opacity });
  }, [onBrushConfigChange]);

  const handleColorChange = useCallback((color: string) => {
    onBrushConfigChange({ color });
  }, [onBrushConfigChange]);

  const ToolButton: React.FC<{ 
    tool: Tool; 
    isActive: boolean;
    onClick: () => void;
  }> = ({ tool, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 p-3 rounded-lg transition-all',
        'hover:bg-gray-100 active:scale-95',
        isActive && 'bg-blue-100 border-2 border-blue-300',
        variant === 'toolbar' && 'p-2'
      )}
      title={`${tool.description} (${tool.shortcut})`}
    >
      <tool.icon 
        size={variant === 'toolbar' ? 20 : 24} 
        className={cn(
          'transition-colors',
          isActive ? 'text-blue-600' : 'text-gray-600'
        )}
      />
      {variant === 'sidebar' && (
        <span className={cn(
          'text-xs font-medium',
          isActive ? 'text-blue-600' : 'text-gray-600'
        )}>
          {tool.name}
        </span>
      )}
    </button>
  );

  const SectionHeader: React.FC<{ 
    title: string; 
    sectionKey: string;
  }> = ({ title, sectionKey }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex items-center justify-between w-full p-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded"
    >
      <span>{title}</span>
      <span className={cn(
        'transition-transform',
        expandedSections.has(sectionKey) ? 'rotate-180' : ''
      )}>
        ▼
      </span>
    </button>
  );

  const SliderControl: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    presets?: number[];
  }> = ({ label, value, min, max, step = 1, onChange, presets }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-500">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
      {presets && (
        <div className="flex gap-1 justify-between">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className={cn(
                'px-2 py-1 text-xs rounded border',
                Math.abs(value - preset) < 0.01
                  ? 'bg-blue-100 border-blue-300'
                  : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
              )}
            >
              {preset}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (variant === 'toolbar') {
    return (
      <div className={cn(
        'flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm',
        className
      )}>
        {/* Drawing tools */}
        <div className="flex gap-1">
          {DRAWING_TOOLS.map((tool) => (
            <ToolButton
              key={tool.id}
              tool={tool}
              isActive={currentTool === tool.id}
              onClick={() => handleToolSelect(tool)}
            />
          ))}
        </div>

        <div className="w-px h-8 bg-gray-300" />

        {/* Shape tools */}
        <div className="flex gap-1">
          {SHAPE_TOOLS.map((tool) => (
            <ToolButton
              key={tool.id}
              tool={tool}
              isActive={currentTool === tool.id}
              onClick={() => handleToolSelect(tool)}
            />
          ))}
        </div>

        <div className="w-px h-8 bg-gray-300" />

        {/* Color picker */}
        <ColorPicker
          value={brushConfig.color}
          onChange={handleColorChange}
        />

        {/* Brush size */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Size:</span>
          <input
            type="range"
            min={1}
            max={50}
            value={brushConfig.maxWidth}
            onChange={(e) => handleBrushSizeChange(Number(e.target.value))}
            className="w-20 accent-blue-500"
          />
          <span className="text-sm font-mono w-8">{brushConfig.maxWidth}</span>
        </div>

        <div className="w-px h-8 bg-gray-300" />

        {/* Actions */}
        <div className="flex gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={20} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'w-64 bg-white border-r border-gray-200 flex flex-col h-full',
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Tools</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Drawing Tools Section */}
        <div>
          <SectionHeader title="Drawing Tools" sectionKey="drawing" />
          {expandedSections.has('drawing') && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {DRAWING_TOOLS.map((tool) => (
                <ToolButton
                  key={tool.id}
                  tool={tool}
                  isActive={currentTool === tool.id}
                  onClick={() => handleToolSelect(tool)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Shape Tools Section */}
        <div>
          <SectionHeader title="Shapes" sectionKey="shapes" />
          {expandedSections.has('shapes') && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {SHAPE_TOOLS.map((tool) => (
                <ToolButton
                  key={tool.id}
                  tool={tool}
                  isActive={currentTool === tool.id}
                  onClick={() => handleToolSelect(tool)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Brush Configuration Section */}
        <div>
          <SectionHeader title="Brush Settings" sectionKey="brush" />
          {expandedSections.has('brush') && (
            <div className="space-y-4 mt-2">
              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <ColorPicker
                  value={brushConfig.color}
                  onChange={handleColorChange}
                  className="w-full"
                />
              </div>

              {/* Brush Size */}
              <SliderControl
                label="Brush Size"
                value={brushConfig.maxWidth}
                min={1}
                max={50}
                onChange={handleBrushSizeChange}
                presets={BRUSH_SIZE_PRESETS}
              />

              {/* Opacity */}
              <SliderControl
                label="Opacity"
                value={brushConfig.opacity}
                min={0.1}
                max={1}
                step={0.1}
                onChange={handleOpacityChange}
                presets={OPACITY_PRESETS}
              />

              {/* Advanced settings toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <Settings size={16} />
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </button>

              {/* Advanced settings */}
              {showAdvanced && (
                <div className="space-y-4 pt-2 border-t border-gray-200">
                  <SliderControl
                    label="Pressure Sensitivity"
                    value={brushConfig.pressureSensitivity}
                    min={0}
                    max={1}
                    step={0.1}
                    onChange={(value) => onBrushConfigChange({ pressureSensitivity: value })}
                  />
                  
                  <SliderControl
                    label="Smoothing"
                    value={brushConfig.smoothing}
                    min={0}
                    max={1}
                    step={0.1}
                    onChange={(value) => onBrushConfigChange({ smoothing: value })}
                  />

                  {brushConfig.flow !== undefined && (
                    <SliderControl
                      label="Flow"
                      value={brushConfig.flow}
                      min={0.1}
                      max={1}
                      step={0.1}
                      onChange={(value) => onBrushConfigChange({ flow: value })}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div>
          <SectionHeader title="Actions" sectionKey="actions" />
          {expandedSections.has('actions') && (
            <div className="space-y-2 mt-2">
              {/* Undo/Redo */}
              <div className="flex gap-2">
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
                >
                  <Undo2 size={16} />
                  Undo
                </button>
                <button
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
                >
                  <Redo2 size={16} />
                  Redo
                </button>
              </div>

              {/* Zoom controls */}
              <div className="flex gap-2">
                <button
                  onClick={onZoomIn}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  <ZoomIn size={16} />
                  Zoom In
                </button>
                <button
                  onClick={onZoomOut}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  <ZoomOut size={16} />
                  Zoom Out
                </button>
              </div>

              <button
                onClick={onResetZoom}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                <RotateCcw size={16} />
                Reset Zoom
              </button>

              {/* File operations */}
              <div className="border-t border-gray-200 pt-2 space-y-2">
                <button
                  onClick={onSave}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-100 hover:bg-blue-200 rounded text-sm text-blue-700"
                >
                  <Save size={16} />
                  Save
                </button>
                <button
                  onClick={onLoad}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-green-100 hover:bg-green-200 rounded text-sm text-green-700"
                >
                  <Upload size={16} />
                  Load
                </button>
                <button
                  onClick={onExport}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-purple-100 hover:bg-purple-200 rounded text-sm text-purple-700"
                >
                  <Download size={16} />
                  Export
                </button>
              </div>

              {/* Clear canvas */}
              <button
                onClick={onClear}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-100 hover:bg-red-200 rounded text-sm text-red-700"
              >
                <Eraser size={16} />
                Clear Canvas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolPalette;