// ABOUTME: Grid calculation utilities for dot grid journal
// Functions for converting between pixels and grid units, snapping, and alignment

import { GridConfig, GridPoint, GridType } from '@/types/grid';

// Convert millimeters to pixels (assuming 96 DPI)
export const mmToPixels = (mm: number): number => {
  const dpi = 96;
  const mmPerInch = 25.4;
  return (mm * dpi) / mmPerInch;
};

// Convert pixels to millimeters
export const pixelsToMm = (pixels: number): number => {
  const dpi = 96;
  const mmPerInch = 25.4;
  return (pixels * mmPerInch) / dpi;
};

// Convert pixel coordinates to grid units
export const pixelToGrid = (pixelX: number, pixelY: number, spacing: number): GridPoint => {
  const gridX = Math.round(pixelX / spacing);
  const gridY = Math.round(pixelY / spacing);
  return {
    x: gridX * spacing,
    y: gridY * spacing,
    gridX,
    gridY,
  };
};

// Snap a point to the nearest grid point
export const snapToGrid = (
  x: number,
  y: number,
  spacing: number,
  sensitivity: number
): GridPoint | null => {
  const gridPoint = pixelToGrid(x, y, spacing);
  const distance = Math.sqrt(
    Math.pow(x - gridPoint.x, 2) + Math.pow(y - gridPoint.y, 2)
  );
  
  if (distance <= sensitivity) {
    return gridPoint;
  }
  
  return null;
};

// Get all grid points within a bounding box
export const getGridPointsInBounds = (
  x: number,
  y: number,
  width: number,
  height: number,
  spacing: number,
  gridType: GridType
): GridPoint[] => {
  const points: GridPoint[] = [];
  const startX = Math.floor(x / spacing) * spacing;
  const startY = Math.floor(y / spacing) * spacing;
  const endX = Math.ceil((x + width) / spacing) * spacing;
  const endY = Math.ceil((y + height) / spacing) * spacing;

  switch (gridType) {
    case 'dots':
    case 'grid':
    case 'lines':
      // Regular rectangular grid
      for (let gridY = startY; gridY <= endY; gridY += spacing) {
        for (let gridX = startX; gridX <= endX; gridX += spacing) {
          points.push({
            x: gridX,
            y: gridY,
            gridX: gridX / spacing,
            gridY: gridY / spacing,
          });
        }
      }
      break;

    case 'isometric':
      // Isometric grid (30-degree angles)
      const isoSpacingY = spacing * Math.sqrt(3) / 2;
      for (let row = 0; row <= Math.ceil(height / isoSpacingY); row++) {
        const gridY = startY + row * isoSpacingY;
        const offset = row % 2 === 1 ? spacing / 2 : 0;
        
        for (let col = 0; col <= Math.ceil(width / spacing); col++) {
          const gridX = startX + col * spacing + offset;
          if (gridX >= x && gridX <= x + width && gridY >= y && gridY <= y + height) {
            points.push({
              x: gridX,
              y: gridY,
              gridX: col,
              gridY: row,
            });
          }
        }
      }
      break;

    case 'hexagonal':
      // Hexagonal grid
      const hexWidth = spacing;
      const hexHeight = spacing * Math.sqrt(3);
      const hexVertSpacing = hexHeight * 0.75;
      
      for (let row = 0; row <= Math.ceil(height / hexVertSpacing); row++) {
        const gridY = startY + row * hexVertSpacing;
        const offset = row % 2 === 1 ? hexWidth / 2 : 0;
        
        for (let col = 0; col <= Math.ceil(width / hexWidth); col++) {
          const gridX = startX + col * hexWidth + offset;
          if (gridX >= x && gridX <= x + width && gridY >= y && gridY <= y + height) {
            points.push({
              x: gridX,
              y: gridY,
              gridX: col,
              gridY: row,
            });
          }
        }
      }
      break;
  }

  return points;
};

// Calculate box alignment relative to grid
export const alignBoxToGrid = (
  x: number,
  y: number,
  width: number,
  height: number,
  spacing: number
): { x: number; y: number; width: number; height: number } => {
  const topLeft = pixelToGrid(x, y, spacing);
  const bottomRight = pixelToGrid(x + width, y + height, spacing);
  
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y,
  };
};

// Get alignment guides for a box
export const getBoxAlignmentGuides = (
  box: { x: number; y: number; width: number; height: number },
  otherBoxes: { x: number; y: number; width: number; height: number }[],
  threshold: number = 5
): { horizontal: number[]; vertical: number[] } => {
  const guides = {
    horizontal: new Set<number>(),
    vertical: new Set<number>(),
  };

  const boxPoints = [
    box.x, // left
    box.x + box.width / 2, // center x
    box.x + box.width, // right
  ];

  const boxYPoints = [
    box.y, // top
    box.y + box.height / 2, // center y
    box.y + box.height, // bottom
  ];

  otherBoxes.forEach(other => {
    const otherPoints = [
      other.x,
      other.x + other.width / 2,
      other.x + other.width,
    ];

    const otherYPoints = [
      other.y,
      other.y + other.height / 2,
      other.y + other.height,
    ];

    // Check vertical alignment
    boxPoints.forEach(bx => {
      otherPoints.forEach(ox => {
        if (Math.abs(bx - ox) <= threshold) {
          guides.vertical.add(ox);
        }
      });
    });

    // Check horizontal alignment
    boxYPoints.forEach(by => {
      otherYPoints.forEach(oy => {
        if (Math.abs(by - oy) <= threshold) {
          guides.horizontal.add(oy);
        }
      });
    });
  });

  return {
    horizontal: Array.from(guides.horizontal),
    vertical: Array.from(guides.vertical),
  };
};

// Calculate grid dimensions for a page
export const calculatePageGrid = (
  pageWidth: number,
  pageHeight: number,
  spacing: number,
  margins: number
): {
  gridWidth: number;
  gridHeight: number;
  offsetX: number;
  offsetY: number;
  columns: number;
  rows: number;
} => {
  const usableWidth = pageWidth - 2 * margins;
  const usableHeight = pageHeight - 2 * margins;
  
  const columns = Math.floor(usableWidth / spacing);
  const rows = Math.floor(usableHeight / spacing);
  
  const gridWidth = columns * spacing;
  const gridHeight = rows * spacing;
  
  // Center the grid within the margins
  const offsetX = margins + (usableWidth - gridWidth) / 2;
  const offsetY = margins + (usableHeight - gridHeight) / 2;
  
  return {
    gridWidth,
    gridHeight,
    offsetX,
    offsetY,
    columns,
    rows,
  };
};

// Convert grid coordinates to page coordinates
export const gridToPage = (
  gridX: number,
  gridY: number,
  spacing: number,
  offset: { x: number; y: number }
): { x: number; y: number } => {
  return {
    x: offset.x + gridX * spacing,
    y: offset.y + gridY * spacing,
  };
};

// Find nearest grid intersection for a line
export const snapLineToGrid = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  spacing: number,
  sensitivity: number
): {
  start: GridPoint | null;
  end: GridPoint | null;
} => {
  return {
    start: snapToGrid(x1, y1, spacing, sensitivity),
    end: snapToGrid(x2, y2, spacing, sensitivity),
  };
};

// Calculate grid-based layouts
export const createGridLayout = (
  itemCount: number,
  columns: number,
  spacing: number,
  itemWidth: number,
  itemHeight: number,
  startX: number = 0,
  startY: number = 0
): { x: number; y: number; width: number; height: number }[] => {
  const items = [];
  
  for (let i = 0; i < itemCount; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    
    items.push({
      x: startX + col * (itemWidth + spacing),
      y: startY + row * (itemHeight + spacing),
      width: itemWidth,
      height: itemHeight,
    });
  }
  
  return items;
};