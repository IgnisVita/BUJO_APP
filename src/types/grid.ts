// ABOUTME: Type definitions for the grid customization system
// Interfaces for grid configuration, drawing tools, and customization options

export type GridType = 'dots' | 'lines' | 'grid' | 'isometric' | 'hexagonal';
export type BorderStyle = 'solid' | 'dashed' | 'double' | 'dotted';
export type PaperTexture = 'smooth' | 'textured' | 'canvas' | 'watercolor';

export interface GridConfig {
  type: GridType;
  spacing: number; // in pixels (converted from mm)
  dotSize: number; // 1-4px
  color: string; // hex color
  opacity: number; // 0-1
  paperColor: string;
  paperTexture: PaperTexture;
  showMargins: boolean;
  marginSize: number; // in pixels
  showPageEdges: boolean;
  pageEdgeStyle: BorderStyle;
  pageEdgeColor: string;
}

export interface GridPreset {
  id: string;
  name: string;
  description: string;
  config: GridConfig;
  thumbnail?: string;
}

export interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderStyle: BorderStyle;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  fillColor?: string;
  fillOpacity?: number;
  locked?: boolean;
  zIndex: number;
}

export interface GridPoint {
  x: number;
  y: number;
  gridX: number; // grid unit coordinates
  gridY: number;
}

export interface SnapSettings {
  enabled: boolean;
  sensitivity: number; // pixels
  showIndicators: boolean;
  indicatorColor: string;
}

export interface RulerSettings {
  showHorizontal: boolean;
  showVertical: boolean;
  unit: 'px' | 'mm' | 'grid';
  color: string;
  opacity: number;
}

export interface AlignmentGuide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  temporary?: boolean;
}

// Grid customization store state
export interface GridCustomizationState {
  config: GridConfig;
  presets: GridPreset[];
  activePresetId?: string;
  snapSettings: SnapSettings;
  rulerSettings: RulerSettings;
  alignmentGuides: AlignmentGuide[];
  boxes: Box[];
  selectedBoxId?: string;
  copiedBox?: Box;
}

// Default configurations
export const defaultGridConfig: GridConfig = {
  type: 'dots',
  spacing: 20, // ~5mm at 96dpi
  dotSize: 2,
  color: '#d1d5db',
  opacity: 0.8,
  paperColor: '#ffffff',
  paperTexture: 'smooth',
  showMargins: true,
  marginSize: 40,
  showPageEdges: true,
  pageEdgeStyle: 'solid',
  pageEdgeColor: '#e5e7eb',
};

export const defaultSnapSettings: SnapSettings = {
  enabled: true,
  sensitivity: 10,
  showIndicators: true,
  indicatorColor: '#3b82f6',
};

export const defaultRulerSettings: RulerSettings = {
  showHorizontal: false,
  showVertical: false,
  unit: 'grid',
  color: '#6b7280',
  opacity: 0.5,
};

// Built-in presets
export const builtInPresets: GridPreset[] = [
  {
    id: 'moleskine',
    name: 'Moleskine Classic',
    description: 'Light gray dots with cream paper',
    config: {
      ...defaultGridConfig,
      dotSize: 1.5,
      color: '#9ca3af',
      paperColor: '#fef9f3',
      spacing: 19,
    },
  },
  {
    id: 'leuchtturm',
    name: 'Leuchtturm1917',
    description: 'Small gray dots with white paper',
    config: {
      ...defaultGridConfig,
      dotSize: 1,
      color: '#d1d5db',
      paperColor: '#ffffff',
      spacing: 20,
    },
  },
  {
    id: 'rhodia',
    name: 'Rhodia',
    description: 'Purple grid on cream paper',
    config: {
      ...defaultGridConfig,
      type: 'grid',
      color: '#7c3aed',
      opacity: 0.3,
      paperColor: '#fffef7',
      spacing: 20,
    },
  },
  {
    id: 'isometric',
    name: 'Isometric',
    description: 'For 3D sketches and diagrams',
    config: {
      ...defaultGridConfig,
      type: 'isometric',
      color: '#60a5fa',
      opacity: 0.4,
      spacing: 24,
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Subtle dots for clean layouts',
    config: {
      ...defaultGridConfig,
      dotSize: 1,
      color: '#e5e7eb',
      opacity: 0.6,
      showPageEdges: false,
    },
  },
];