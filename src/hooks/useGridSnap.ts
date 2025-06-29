// ABOUTME: Hook for grid snapping functionality
// Provides snap-to-grid behavior for drawing and positioning elements

import { useCallback, useEffect, useRef, useState } from 'react';
import { GridConfig, GridPoint, SnapSettings } from '@/types/grid';
import { snapToGrid, snapLineToGrid, alignBoxToGrid } from '@/lib/grid/grid-math';

interface UseGridSnapOptions {
  gridConfig: GridConfig;
  snapSettings: SnapSettings;
  onSnapIndicator?: (point: GridPoint | null) => void;
}

interface UseGridSnapReturn {
  snapPoint: (x: number, y: number) => { x: number; y: number; snapped: boolean };
  snapLine: (x1: number, y1: number, x2: number, y2: number) => {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    startSnapped: boolean;
    endSnapped: boolean;
  };
  snapBox: (x: number, y: number, width: number, height: number) => {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  snapIndicator: GridPoint | null;
  clearSnapIndicator: () => void;
}

export const useGridSnap = ({
  gridConfig,
  snapSettings,
  onSnapIndicator,
}: UseGridSnapOptions): UseGridSnapReturn => {
  const [snapIndicator, setSnapIndicator] = useState<GridPoint | null>(null);
  const indicatorTimeoutRef = useRef<NodeJS.Timeout>();

  // Clear snap indicator after a delay
  const clearSnapIndicator = useCallback(() => {
    if (indicatorTimeoutRef.current) {
      clearTimeout(indicatorTimeoutRef.current);
    }
    setSnapIndicator(null);
    onSnapIndicator?.(null);
  }, [onSnapIndicator]);

  // Show snap indicator temporarily
  const showSnapIndicator = useCallback((point: GridPoint) => {
    setSnapIndicator(point);
    onSnapIndicator?.(point);

    if (indicatorTimeoutRef.current) {
      clearTimeout(indicatorTimeoutRef.current);
    }

    indicatorTimeoutRef.current = setTimeout(() => {
      clearSnapIndicator();
    }, 1000);
  }, [onSnapIndicator, clearSnapIndicator]);

  // Snap a single point
  const snapPoint = useCallback(
    (x: number, y: number): { x: number; y: number; snapped: boolean } => {
      if (!snapSettings.enabled) {
        return { x, y, snapped: false };
      }

      const snappedPoint = snapToGrid(
        x,
        y,
        gridConfig.spacing,
        snapSettings.sensitivity
      );

      if (snappedPoint) {
        if (snapSettings.showIndicators) {
          showSnapIndicator(snappedPoint);
        }
        return { x: snappedPoint.x, y: snappedPoint.y, snapped: true };
      }

      return { x, y, snapped: false };
    },
    [gridConfig.spacing, snapSettings, showSnapIndicator]
  );

  // Snap a line (both endpoints)
  const snapLine = useCallback(
    (x1: number, y1: number, x2: number, y2: number) => {
      if (!snapSettings.enabled) {
        return {
          x1,
          y1,
          x2,
          y2,
          startSnapped: false,
          endSnapped: false,
        };
      }

      const { start, end } = snapLineToGrid(
        x1,
        y1,
        x2,
        y2,
        gridConfig.spacing,
        snapSettings.sensitivity
      );

      const result = {
        x1: start?.x ?? x1,
        y1: start?.y ?? y1,
        x2: end?.x ?? x2,
        y2: end?.y ?? y2,
        startSnapped: !!start,
        endSnapped: !!end,
      };

      // Show indicator for the most recently snapped point
      if (snapSettings.showIndicators) {
        if (end) {
          showSnapIndicator(end);
        } else if (start) {
          showSnapIndicator(start);
        }
      }

      return result;
    },
    [gridConfig.spacing, snapSettings, showSnapIndicator]
  );

  // Snap a box (align to grid)
  const snapBox = useCallback(
    (x: number, y: number, width: number, height: number) => {
      if (!snapSettings.enabled) {
        return { x, y, width, height };
      }

      return alignBoxToGrid(x, y, width, height, gridConfig.spacing);
    },
    [gridConfig.spacing, snapSettings.enabled]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current);
      }
    };
  }, []);

  return {
    snapPoint,
    snapLine,
    snapBox,
    snapIndicator,
    clearSnapIndicator,
  };
};

// Hook for visual snap indicators
export const useSnapIndicatorRenderer = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  indicatorColor: string = '#3b82f6'
) => {
  const renderSnapIndicator = useCallback(
    (point: GridPoint | null) => {
      const canvas = canvasRef.current;
      if (!canvas || !point) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Save context state
      ctx.save();

      // Draw snap indicator
      ctx.strokeStyle = indicatorColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      // Draw crosshair
      const size = 10;
      ctx.beginPath();
      ctx.moveTo(point.x - size, point.y);
      ctx.lineTo(point.x + size, point.y);
      ctx.moveTo(point.x, point.y - size);
      ctx.lineTo(point.x, point.y + size);
      ctx.stroke();

      // Draw circle
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.stroke();

      // Restore context state
      ctx.restore();
    },
    [canvasRef, indicatorColor]
  );

  return { renderSnapIndicator };
};

// Hook for drag-to-snap behavior
export const useDragSnap = (
  gridConfig: GridConfig,
  snapSettings: SnapSettings,
  onDrag?: (x: number, y: number, snapped: boolean) => void
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { snapPoint } = useGridSnap({ gridConfig, snapSettings });

  const handleDragStart = useCallback((x: number, y: number) => {
    setIsDragging(true);
    const snapped = snapPoint(x, y);
    setDragStart(snapped);
  }, [snapPoint]);

  const handleDragMove = useCallback(
    (x: number, y: number) => {
      if (!isDragging) return;
      
      const snapped = snapPoint(x, y);
      onDrag?.(snapped.x, snapped.y, snapped.snapped);
    },
    [isDragging, snapPoint, onDrag]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    dragStart,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};