// ABOUTME: Grid customization panel for dot grid journal
// Allows users to personalize grid appearance, spacing, and style

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Grid, 
  Circle, 
  Square, 
  Hexagon,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Download,
  Upload,
  Palette,
  Ruler
} from 'lucide-react';
import { 
  GridConfig, 
  GridPreset, 
  builtInPresets, 
  defaultGridConfig,
  GridType,
  PaperTexture
} from '@/types/grid';
import { pixelsToMm, mmToPixels } from '@/lib/grid/grid-math';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface GridCustomizerProps {
  config: GridConfig;
  onConfigChange: (config: GridConfig) => void;
  customPresets?: GridPreset[];
  onPresetSave?: (preset: GridPreset) => void;
  onPresetDelete?: (presetId: string) => void;
  className?: string;
}

export const GridCustomizer: React.FC<GridCustomizerProps> = ({
  config,
  onConfigChange,
  customPresets = [],
  onPresetSave,
  onPresetDelete,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState<'grid' | 'paper' | 'presets'>('grid');
  const [showPreview, setShowPreview] = useState(true);

  const allPresets = [...builtInPresets, ...customPresets];

  // Grid type options
  const gridTypes: { value: GridType; label: string; icon: React.ReactNode }[] = [
    { value: 'dots', label: 'Dots', icon: <Circle className="w-4 h-4" /> },
    { value: 'lines', label: 'Lines', icon: <span className="w-4 h-4">━</span> },
    { value: 'grid', label: 'Grid', icon: <Grid className="w-4 h-4" /> },
    { value: 'isometric', label: 'Isometric', icon: <Square className="w-4 h-4 rotate-45" /> },
    { value: 'hexagonal', label: 'Hexagonal', icon: <Hexagon className="w-4 h-4" /> },
  ];

  // Paper texture options
  const paperTextures: { value: PaperTexture; label: string }[] = [
    { value: 'smooth', label: 'Smooth' },
    { value: 'textured', label: 'Textured' },
    { value: 'canvas', label: 'Canvas' },
    { value: 'watercolor', label: 'Watercolor' },
  ];

  // Common dot colors
  const colorPresets = [
    '#d1d5db', // Gray
    '#9ca3af', // Light gray
    '#6b7280', // Medium gray
    '#374151', // Dark gray
    '#60a5fa', // Blue
    '#7c3aed', // Purple
    '#f87171', // Red
    '#34d399', // Green
  ];

  const handleSpacingChange = useCallback((mmValue: number) => {
    onConfigChange({
      ...config,
      spacing: mmToPixels(mmValue),
    });
  }, [config, onConfigChange]);

  const handlePresetSelect = useCallback((preset: GridPreset) => {
    onConfigChange(preset.config);
  }, [onConfigChange]);

  const handleSaveAsPreset = useCallback(() => {
    const name = prompt('Enter preset name:');
    if (!name) return;

    const preset: GridPreset = {
      id: `custom-${Date.now()}`,
      name,
      description: 'Custom preset',
      config: { ...config },
    };

    onPresetSave?.(preset);
  }, [config, onPresetSave]);

  return (
    <Card className={cn('p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Grid Customization</h2>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Section Tabs */}
            <div className="flex gap-1 mb-4 p-1 bg-gray-100 dark:bg-neutral-800 rounded-lg">
              {(['grid', 'paper', 'presets'] as const).map(section => (
                <Button
                  key={section}
                  size="sm"
                  variant={activeSection === section ? 'default' : 'ghost'}
                  onClick={() => setActiveSection(section)}
                  className="flex-1 capitalize"
                >
                  {section}
                </Button>
              ))}
            </div>

            {/* Grid Settings */}
            {activeSection === 'grid' && (
              <div className="space-y-4">
                {/* Grid Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Grid Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {gridTypes.map(type => (
                      <Button
                        key={type.value}
                        size="sm"
                        variant={config.type === type.value ? 'default' : 'outline'}
                        onClick={() => onConfigChange({ ...config, type: type.value })}
                        className="flex flex-col items-center gap-1 py-3"
                      >
                        {type.icon}
                        <span className="text-xs">{type.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Spacing */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Spacing: {pixelsToMm(config.spacing).toFixed(1)}mm
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    step="0.5"
                    value={pixelsToMm(config.spacing)}
                    onChange={(e) => handleSpacingChange(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>3mm</span>
                    <span>10mm</span>
                  </div>
                </div>

                {/* Dot Size (for dots type) */}
                {config.type === 'dots' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Dot Size: {config.dotSize}px
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="0.5"
                      value={config.dotSize}
                      onChange={(e) => onConfigChange({ ...config, dotSize: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Grid Color */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Grid Color</label>
                  <div className="flex gap-2 items-center">
                    <div className="flex gap-1">
                      {colorPresets.map(color => (
                        <button
                          key={color}
                          className={cn(
                            'w-8 h-8 rounded border-2',
                            config.color === color ? 'border-blue-500' : 'border-gray-300'
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => onConfigChange({ ...config, color })}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={config.color}
                      onChange={(e) => onConfigChange({ ...config, color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Grid Opacity */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Opacity: {Math.round(config.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={config.opacity}
                    onChange={(e) => onConfigChange({ ...config, opacity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Paper Settings */}
            {activeSection === 'paper' && (
              <div className="space-y-4">
                {/* Paper Color */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Paper Color</label>
                  <div className="flex gap-2 items-center">
                    <div className="flex gap-1">
                      {['#ffffff', '#fef9f3', '#fffef7', '#f5f5f5'].map(color => (
                        <button
                          key={color}
                          className={cn(
                            'w-8 h-8 rounded border-2',
                            config.paperColor === color ? 'border-blue-500' : 'border-gray-300'
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => onConfigChange({ ...config, paperColor: color })}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={config.paperColor}
                      onChange={(e) => onConfigChange({ ...config, paperColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Paper Texture */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Paper Texture</label>
                  <div className="grid grid-cols-2 gap-2">
                    {paperTextures.map(texture => (
                      <Button
                        key={texture.value}
                        size="sm"
                        variant={config.paperTexture === texture.value ? 'default' : 'outline'}
                        onClick={() => onConfigChange({ ...config, paperTexture: texture.value })}
                      >
                        {texture.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Margins */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Show Margins</label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onConfigChange({ ...config, showMargins: !config.showMargins })}
                    >
                      {config.showMargins ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </div>
                  {config.showMargins && (
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">
                        Margin Size: {config.marginSize}px
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="60"
                        step="5"
                        value={config.marginSize}
                        onChange={(e) => onConfigChange({ ...config, marginSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Page Edges */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Show Page Edges</label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onConfigChange({ ...config, showPageEdges: !config.showPageEdges })}
                    >
                      {config.showPageEdges ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </div>
                  {config.showPageEdges && (
                    <div className="space-y-2">
                      <select
                        value={config.pageEdgeStyle}
                        onChange={(e) => onConfigChange({ ...config, pageEdgeStyle: e.target.value as any })}
                        className="w-full px-2 py-1 text-sm border rounded"
                      >
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                      </select>
                      <input
                        type="color"
                        value={config.pageEdgeColor}
                        onChange={(e) => onConfigChange({ ...config, pageEdgeColor: e.target.value })}
                        className="w-full h-8 rounded cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Presets */}
            {activeSection === 'presets' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {allPresets.map(preset => (
                    <motion.button
                      key={preset.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'p-3 rounded-lg border text-left transition-colors',
                        'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      )}
                      onClick={() => handlePresetSelect(preset)}
                    >
                      <div className="font-medium text-sm">{preset.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{preset.description}</div>
                      {preset.id.startsWith('custom-') && onPresetDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 text-xs text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPresetDelete(preset.id);
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Save Current as Preset */}
                {onPresetSave && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveAsPreset}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Save Current Settings
                  </Button>
                )}
              </div>
            )}

            {/* Preview Toggle */}
            <div className="mt-4 pt-4 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full"
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>

            {/* Grid Preview */}
            {showPreview && (
              <div className="mt-4">
                <GridPreview config={config} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// Grid preview component
interface GridPreviewProps {
  config: GridConfig;
}

const GridPreview: React.FC<GridPreviewProps> = ({ config }) => {
  const previewSize = 200;
  const dotCount = Math.floor(previewSize / config.spacing);

  const renderGrid = () => {
    const elements = [];

    switch (config.type) {
      case 'dots':
        for (let row = 0; row <= dotCount; row++) {
          for (let col = 0; col <= dotCount; col++) {
            elements.push(
              <circle
                key={`${row}-${col}`}
                cx={col * config.spacing}
                cy={row * config.spacing}
                r={config.dotSize / 2}
                fill={config.color}
                opacity={config.opacity}
              />
            );
          }
        }
        break;

      case 'lines':
        for (let i = 0; i <= dotCount; i++) {
          elements.push(
            <line
              key={`h-${i}`}
              x1={0}
              y1={i * config.spacing}
              x2={previewSize}
              y2={i * config.spacing}
              stroke={config.color}
              strokeWidth="1"
              opacity={config.opacity}
            />
          );
        }
        break;

      case 'grid':
        for (let i = 0; i <= dotCount; i++) {
          elements.push(
            <line
              key={`h-${i}`}
              x1={0}
              y1={i * config.spacing}
              x2={previewSize}
              y2={i * config.spacing}
              stroke={config.color}
              strokeWidth="1"
              opacity={config.opacity}
            />
          );
          elements.push(
            <line
              key={`v-${i}`}
              x1={i * config.spacing}
              y1={0}
              x2={i * config.spacing}
              y2={previewSize}
              stroke={config.color}
              strokeWidth="1"
              opacity={config.opacity}
            />
          );
        }
        break;

      case 'isometric':
        // Simplified isometric grid preview
        const angle = 30 * Math.PI / 180;
        for (let i = 0; i <= dotCount * 2; i++) {
          // 30-degree lines
          elements.push(
            <line
              key={`iso1-${i}`}
              x1={0}
              y1={i * config.spacing / 2}
              x2={previewSize}
              y2={i * config.spacing / 2 + previewSize * Math.tan(angle)}
              stroke={config.color}
              strokeWidth="1"
              opacity={config.opacity}
            />
          );
          // -30-degree lines
          elements.push(
            <line
              key={`iso2-${i}`}
              x1={0}
              y1={i * config.spacing / 2}
              x2={previewSize}
              y2={i * config.spacing / 2 - previewSize * Math.tan(angle)}
              stroke={config.color}
              strokeWidth="1"
              opacity={config.opacity}
            />
          );
        }
        break;

      case 'hexagonal':
        // Simplified hexagonal grid preview
        const hexSize = config.spacing / 2;
        for (let row = 0; row < dotCount; row++) {
          for (let col = 0; col < dotCount; col++) {
            const x = col * config.spacing * 1.5;
            const y = row * config.spacing * Math.sqrt(3) + (col % 2 ? config.spacing * Math.sqrt(3) / 2 : 0);
            if (x < previewSize && y < previewSize) {
              elements.push(
                <circle
                  key={`hex-${row}-${col}`}
                  cx={x}
                  cy={y}
                  r={2}
                  fill={config.color}
                  opacity={config.opacity}
                />
              );
            }
          }
        }
        break;
    }

    return elements;
  };

  return (
    <div className="relative overflow-hidden rounded-lg" style={{ backgroundColor: config.paperColor }}>
      {/* Paper texture overlay */}
      {config.paperTexture !== 'smooth' && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' /%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* Grid */}
      <svg width={previewSize} height={previewSize} className="relative">
        {renderGrid()}
      </svg>

      {/* Page edges */}
      {config.showPageEdges && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            border: `1px ${config.pageEdgeStyle} ${config.pageEdgeColor}`,
          }}
        />
      )}

      {/* Margins */}
      {config.showMargins && (
        <div 
          className="absolute pointer-events-none"
          style={{
            top: config.marginSize / 4,
            left: config.marginSize / 4,
            right: config.marginSize / 4,
            bottom: config.marginSize / 4,
            border: '1px dashed rgba(0,0,0,0.1)',
          }}
        />
      )}
    </div>
  );
};