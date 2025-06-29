// ABOUTME: Main canvas component with Fabric.js integration and advanced drawing features
// Handles pressure sensitivity, touch optimization, pan/zoom, and layer management

'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as fabric from 'fabric';
import { CanvasManager, createOptimizedCanvas, getOptimalCanvasSize } from '@/lib/canvas/canvasUtils';
import { createBrush, BrushConfig, getBrushPresets } from '@/lib/canvas/brushes';
import { cn } from '@/lib/utils/cn';

export interface DrawingCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  onCanvasReady?: (canvas: fabric.Canvas, manager: CanvasManager) => void;
  onDrawingStart?: () => void;
  onDrawingEnd?: () => void;
  initialTool?: string;
  initialBrushConfig?: Partial<BrushConfig>;
  enablePressure?: boolean;
  enableTouch?: boolean;
  backgroundColor?: string;
  gridEnabled?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
}

export interface CanvasState {
  tool: string;
  brushConfig: BrushConfig;
  isDrawing: boolean;
  zoom: number;
  pan: { x: number; y: number };
  layerCount: number;
  canUndo: boolean;
  canRedo: boolean;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width = 800,
  height = 600,
  className,
  onCanvasReady,
  onDrawingStart,
  onDrawingEnd,
  initialTool = 'pen',
  initialBrushConfig = {},
  enablePressure = true,
  enableTouch = true,
  backgroundColor = '#ffffff',
  gridEnabled = false,
  gridSize = 20,
  snapToGrid = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const canvasManagerRef = useRef<CanvasManager | null>(null);
  
  const [canvasState, setCanvasState] = useState<CanvasState>({
    tool: initialTool,
    brushConfig: { ...getBrushPresets().mediumPen, ...initialBrushConfig } as BrushConfig,
    isDrawing: false,
    zoom: 1,
    pan: { x: 0, y: 0 },
    layerCount: 0,
    canUndo: false,
    canRedo: false,
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [pointerType, setPointerType] = useState<string>('mouse');

  // Initialize canvas with optimizations
  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    try {
      const { canvas, manager } = createOptimizedCanvas(
        canvasRef.current,
        {
          width,
          height,
          backgroundColor,
          enableRetinaScaling: true,
          allowTouchScrolling: enableTouch,
          selection: false, // Disable selection for drawing mode
          preserveObjectStacking: true,
          skipOffscreen: true,
          isDrawingMode: true,
        },
        {
          enableCaching: true,
          objectCaching: true,
          skipOffscreen: true,
          enableRetinaScaling: true,
          maxCacheSize: 256,
          renderOnAddRemove: false, // Optimize for drawing
        }
      );

      fabricCanvasRef.current = canvas;
      canvasManagerRef.current = manager;

      // Set up initial brush
      updateBrush(canvasState.tool, canvasState.brushConfig);

      // Set up event listeners
      setupCanvasEvents(canvas, manager);

      // Enable pointer events for pressure sensitivity
      if (enablePressure) {
        setupPressureEvents();
      }

      // Set up touch gestures
      if (enableTouch) {
        setupTouchGestures(canvas);
      }

      // Draw grid if enabled
      if (gridEnabled) {
        drawGrid(canvas, gridSize);
      }

      setIsInitialized(true);
      onCanvasReady?.(canvas, manager);
    } catch (error) {
      console.error('Failed to initialize canvas:', error);
    }
  }, [width, height, backgroundColor, enableTouch, enablePressure, gridEnabled, gridSize, onCanvasReady]);

  // Setup canvas event listeners
  const setupCanvasEvents = useCallback((canvas: fabric.Canvas, manager: CanvasManager) => {
    // Drawing events
    canvas.on('path:created', () => {
      onDrawingEnd?.();
      updateCanvasState();
    });

    canvas.on('mouse:down', (opt) => {
      if (canvas.isDrawingMode) {
        onDrawingStart?.();
        setCanvasState(prev => ({ ...prev, isDrawing: true }));
      }
    });

    canvas.on('mouse:up', () => {
      setCanvasState(prev => ({ ...prev, isDrawing: false }));
    });

    // Zoom and pan events
    canvas.on('mouse:wheel', (opt) => {
      if (!opt.e.ctrlKey && !opt.e.metaKey) return;
      
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      
      if (zoom > 20) zoom = 20;
      if (zoom < 0.1) zoom = 0.1;
      
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      setCanvasState(prev => ({ ...prev, zoom }));
      
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Handle canvas resize
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const optimalSize = getOptimalCanvasSize(clientWidth, clientHeight);
        canvas.setDimensions(optimalSize);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [onDrawingStart, onDrawingEnd]);

  // Setup pressure sensitivity using Pointer Events
  const setupPressureEvents = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    const handlePointerEvent = (event: PointerEvent) => {
      setPointerType(event.pointerType);
      
      // Store pressure information for custom brushes
      if (event.pressure > 0) {
        (event as any)._pressure = event.pressure;
      }
    };

    canvas.addEventListener('pointerdown', handlePointerEvent, { passive: false });
    canvas.addEventListener('pointermove', handlePointerEvent, { passive: false });
    canvas.addEventListener('pointerup', handlePointerEvent, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerEvent);
      canvas.removeEventListener('pointermove', handlePointerEvent);
      canvas.removeEventListener('pointerup', handlePointerEvent);
    };
  }, []);

  // Setup touch gestures for pan and zoom
  const setupTouchGestures = useCallback((canvas: fabric.Canvas) => {
    let isPanning = false;
    let lastPanPoint: { x: number; y: number } | null = null;
    let initialDistance = 0;
    let initialZoom = 1;

    const handleTouchStart = (opt: fabric.IEvent) => {
      const e = opt.e as TouchEvent;
      
      if (e.touches.length === 2) {
        // Two finger gesture - zoom
        canvas.isDrawingMode = false;
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        initialZoom = canvas.getZoom();
      } else if (e.touches.length === 1 && e.touches[0].touchType === 'stylus') {
        // Stylus - drawing mode
        canvas.isDrawingMode = true;
      }
    };

    const handleTouchMove = (opt: fabric.IEvent) => {
      const e = opt.e as TouchEvent;
      
      if (e.touches.length === 2) {
        // Two finger zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        const scale = currentDistance / initialDistance;
        const newZoom = initialZoom * scale;
        
        if (newZoom >= 0.1 && newZoom <= 20) {
          const centerX = (touch1.clientX + touch2.clientX) / 2;
          const centerY = (touch1.clientY + touch2.clientY) / 2;
          canvas.zoomToPoint({ x: centerX, y: centerY }, newZoom);
          setCanvasState(prev => ({ ...prev, zoom: newZoom }));
        }
        
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      isPanning = false;
      lastPanPoint = null;
      canvas.isDrawingMode = true; // Return to drawing mode
    };

    canvas.on('touch:gesture', handleTouchStart);
    canvas.on('touch:drag', handleTouchMove);
    canvas.on('touch:orientation', handleTouchEnd);

    return () => {
      canvas.off('touch:gesture');
      canvas.off('touch:drag');
      canvas.off('touch:orientation');
    };
  }, []);

  // Update canvas state
  const updateCanvasState = useCallback(() => {
    if (!canvasManagerRef.current) return;

    const info = canvasManagerRef.current.getCanvasInfo();
    setCanvasState(prev => ({
      ...prev,
      layerCount: info.objectCount,
      canUndo: info.canUndo,
      canRedo: info.canRedo,
    }));
  }, []);

  // Update brush configuration
  const updateBrush = useCallback((tool: string, config: Partial<BrushConfig>) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const brush = createBrush(tool as any, canvas, config);
    
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = true;

    setCanvasState(prev => ({
      ...prev,
      tool,
      brushConfig: { ...prev.brushConfig, ...config } as BrushConfig,
    }));
  }, []);

  // Draw grid background
  const drawGrid = useCallback((canvas: fabric.Canvas, size: number) => {
    const width = canvas.getWidth();
    const height = canvas.getHeight();
    
    const gridGroup = new fabric.Group([], {
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
    });

    // Vertical lines
    for (let i = 0; i <= width; i += size) {
      const line = new fabric.Line([i, 0, i, height], {
        stroke: '#e5e5e5',
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
      });
      gridGroup.addWithUpdate(line);
    }

    // Horizontal lines
    for (let i = 0; i <= height; i += size) {
      const line = new fabric.Line([0, i, width, i], {
        stroke: '#e5e5e5',
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
      });
      gridGroup.addWithUpdate(line);
    }

    canvas.add(gridGroup);
    canvas.sendToBack(gridGroup);
  }, []);

  // Expose canvas methods
  const canvasMethods = {
    undo: () => canvasManagerRef.current?.undo(),
    redo: () => canvasManagerRef.current?.redo(),
    clear: () => canvasManagerRef.current?.clearCanvas(),
    export: (options: any) => canvasManagerRef.current?.exportCanvas(options),
    save: (key: string) => canvasManagerRef.current?.saveCanvasToStorage(key),
    load: (key: string) => canvasManagerRef.current?.loadCanvasFromStorage(key),
    setTool: updateBrush,
    getCanvas: () => fabricCanvasRef.current,
    getManager: () => canvasManagerRef.current,
    getState: () => canvasState,
    zoom: (level: number) => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.setZoom(level);
        setCanvasState(prev => ({ ...prev, zoom: level }));
      }
    },
    resetZoom: () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.setZoom(1);
        fabricCanvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);
        setCanvasState(prev => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }));
      }
    },
  };

  // Initialize canvas on mount
  useEffect(() => {
    initializeCanvas();

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, [initializeCanvas]);

  // Update canvas size when props change
  useEffect(() => {
    if (fabricCanvasRef.current && isInitialized) {
      fabricCanvasRef.current.setDimensions({ width, height });
    }
  }, [width, height, isInitialized]);

  // Expose methods to parent component
  useEffect(() => {
    if (isInitialized && fabricCanvasRef.current && canvasManagerRef.current) {
      (canvasRef.current as any)._canvasMethods = canvasMethods;
    }
  }, [isInitialized, canvasMethods]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex-1 overflow-hidden',
        'touch-none select-none', // Prevent default touch behaviors
        className
      )}
      style={{ width, height }}
    >
      {/* Canvas container */}
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          className={cn(
            'absolute inset-0 cursor-crosshair',
            'touch-none select-none', // Prevent scrolling and selection
            canvasState.isDrawing && 'cursor-none' // Hide cursor while drawing
          )}
          width={width}
          height={height}
          style={{
            width: '100%',
            height: '100%',
            touchAction: 'none', // Prevent default touch behaviors
          }}
        />

        {/* Pressure indicator for stylus */}
        {pointerType === 'pen' && canvasState.isDrawing && (
          <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
            Stylus Mode
          </div>
        )}

        {/* Zoom indicator */}
        {canvasState.zoom !== 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {Math.round(canvasState.zoom * 100)}%
          </div>
        )}

        {/* Loading overlay */}
        {!isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-gray-500">Initializing canvas...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawingCanvas;
export type { CanvasState };
export { type DrawingCanvasProps };