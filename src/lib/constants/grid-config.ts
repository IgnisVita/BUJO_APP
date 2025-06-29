// ABOUTME: Grid configuration constants and presets for dot grid journal
// Includes standard bullet journal spacings and paper sizes

export enum GridType {
  DOTS = 'dots',
  LINES = 'lines',
  GRAPH = 'graph',
  ISOMETRIC = 'isometric',
  BLANK = 'blank',
}

export interface GridConfig {
  name: string;
  gridType: GridType;
  spacing: number; // in pixels
  dotSize: number; // in pixels
  dotColor: string;
  dotOpacity: number; // 0-1
  lineWidth?: number;
  lineColor?: string;
  lineOpacity?: number;
  backgroundColor: string;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  marginColor: string;
  showMarginLines: boolean;
  showMajorGrid?: boolean;
  paperTexture: boolean;
}

// Standard dot grid presets matching real journals
export const GRID_PRESETS: Record<string, GridConfig> = {
  standard5mm: {
    name: 'Standard 5mm (Leuchtturm1917)',
    gridType: GridType.DOTS,
    spacing: 18.9, // 5mm at 96 DPI
    dotSize: 1.2,
    dotColor: '#b0b0b0',
    dotOpacity: 0.4,
    backgroundColor: '#fefefe',
    marginTop: 37.8, // 10mm
    marginBottom: 37.8,
    marginLeft: 37.8,
    marginRight: 37.8,
    marginColor: '#e0e0e0',
    showMarginLines: false,
    paperTexture: true,
  },
  fine4mm: {
    name: 'Fine 4mm',
    gridType: GridType.DOTS,
    spacing: 15.1, // 4mm at 96 DPI
    dotSize: 1,
    dotColor: '#c0c0c0',
    dotOpacity: 0.35,
    backgroundColor: '#fefefe',
    marginTop: 30.2, // 8mm
    marginBottom: 30.2,
    marginLeft: 30.2,
    marginRight: 30.2,
    marginColor: '#e0e0e0',
    showMarginLines: false,
    paperTexture: true,
  },
  large6mm: {
    name: 'Large 6mm (Moleskine style)',
    gridType: GridType.DOTS,
    spacing: 22.7, // 6mm at 96 DPI
    dotSize: 1.4,
    dotColor: '#a0a0a0',
    dotOpacity: 0.45,
    backgroundColor: '#fffef8',
    marginTop: 45.4, // 12mm
    marginBottom: 45.4,
    marginLeft: 45.4,
    marginRight: 45.4,
    marginColor: '#e0e0e0',
    showMarginLines: false,
    paperTexture: true,
  },
  rhodia: {
    name: 'Rhodia Style',
    gridType: GridType.DOTS,
    spacing: 18.9, // 5mm
    dotSize: 1.1,
    dotColor: '#9b7fb6', // Slight purple tint
    dotOpacity: 0.3,
    backgroundColor: '#fffff9',
    marginTop: 37.8,
    marginBottom: 37.8,
    marginLeft: 37.8,
    marginRight: 37.8,
    marginColor: '#e8e0f0',
    showMarginLines: false,
    paperTexture: true,
  },
  ruled: {
    name: 'Ruled Lines',
    gridType: GridType.LINES,
    spacing: 26.5, // 7mm line height
    dotSize: 0,
    dotColor: '#d0d0d0',
    dotOpacity: 0.3,
    lineWidth: 0.5,
    lineColor: '#d0d0d0',
    lineOpacity: 0.3,
    backgroundColor: '#fefefe',
    marginTop: 37.8,
    marginBottom: 37.8,
    marginLeft: 60.5, // Wider left margin for ruled
    marginRight: 37.8,
    marginColor: '#ff8080',
    showMarginLines: true,
    paperTexture: true,
  },
  graph: {
    name: 'Graph Paper',
    gridType: GridType.GRAPH,
    spacing: 18.9, // 5mm
    dotSize: 0,
    dotColor: '#c0d0e0',
    dotOpacity: 0.25,
    lineWidth: 0.5,
    lineColor: '#c0d0e0',
    lineOpacity: 0.25,
    backgroundColor: '#fefefe',
    marginTop: 37.8,
    marginBottom: 37.8,
    marginLeft: 37.8,
    marginRight: 37.8,
    marginColor: '#e0e0e0',
    showMarginLines: false,
    showMajorGrid: true,
    paperTexture: false,
  },
  isometric: {
    name: 'Isometric Grid',
    gridType: GridType.ISOMETRIC,
    spacing: 18.9,
    dotSize: 0,
    dotColor: '#b0c0d0',
    dotOpacity: 0.3,
    lineWidth: 0.5,
    lineColor: '#b0c0d0',
    lineOpacity: 0.3,
    backgroundColor: '#fefefe',
    marginTop: 37.8,
    marginBottom: 37.8,
    marginLeft: 37.8,
    marginRight: 37.8,
    marginColor: '#e0e0e0',
    showMarginLines: false,
    paperTexture: false,
  },
  blank: {
    name: 'Blank Paper',
    gridType: GridType.BLANK,
    spacing: 0,
    dotSize: 0,
    dotColor: 'transparent',
    dotOpacity: 0,
    backgroundColor: '#fefefe',
    marginTop: 37.8,
    marginBottom: 37.8,
    marginLeft: 37.8,
    marginRight: 37.8,
    marginColor: '#e0e0e0',
    showMarginLines: false,
    paperTexture: true,
  },
};

// Page size configurations
export type PageSize = 'A4' | 'Letter' | 'A5' | 'B5' | 'Custom';

export const PAGE_SIZES: Record<PageSize, { width: number; height: number; name: string }> = {
  A4: {
    width: 794, // 210mm at 96 DPI
    height: 1123, // 297mm at 96 DPI
    name: 'A4 (210 × 297 mm)',
  },
  Letter: {
    width: 816, // 8.5 inches at 96 DPI
    height: 1056, // 11 inches at 96 DPI
    name: 'Letter (8.5 × 11 in)',
  },
  A5: {
    width: 559, // 148mm at 96 DPI
    height: 794, // 210mm at 96 DPI
    name: 'A5 (148 × 210 mm)',
  },
  B5: {
    width: 665, // 176mm at 96 DPI
    height: 935, // 250mm at 96 DPI
    name: 'B5 (176 × 250 mm)',
  },
  Custom: {
    width: 800,
    height: 1000,
    name: 'Custom',
  },
};

// Utility functions for grid calculations
export function mmToPixels(mm: number, dpi: number = 96): number {
  return (mm * dpi) / 25.4;
}

export function pixelsToMm(pixels: number, dpi: number = 96): number {
  return (pixels * 25.4) / dpi;
}

// Export a function to create custom grid configs
export function createCustomGridConfig(overrides: Partial<GridConfig>): GridConfig {
  return {
    ...GRID_PRESETS.standard5mm,
    ...overrides,
    name: overrides.name || 'Custom Grid',
  };
}