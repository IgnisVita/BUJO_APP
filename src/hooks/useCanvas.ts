// ABOUTME: Canvas management hook for drawing functionality
// Provides state management, tool switching, and canvas operations

'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import * as fabric from 'fabric';
import { CanvasManager } from '@/lib/canvas/canvasUtils';
import { BrushConfig, getBrushPresets } from '@/lib/canvas/brushes';

export interface UseCanvasOptions {
  initialTool?: string;
  initialBrushConfig?: Partial<BrushConfig>;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
  storageKey?: string;
}

export interface CanvasTools {
  pen: Partial<BrushConfig>;
  pencil: Partial<BrushConfig>;
  marker: Partial<BrushConfig>;
  highlighter: Partial<BrushConfig>;
  calligraphy: Partial<BrushConfig>;
  eraser: Partial<BrushConfig>;
}

export interface CanvasHistory {
  canUndo: boolean;
  canRedo: boolean;
  historySize: number;
}

export interface CanvasInfo {
  objectCount: number;
  dimensions: { width: number; height: number };
  zoom: number;
  isDrawing: boolean;
}

export interface UseCanvasReturn {
  // Canvas references
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fabricCanvas: fabric.Canvas | null;
  canvasManager: CanvasManager | null;
  
  // Canvas state
  currentTool: string;
  brushConfig: BrushConfig;
  isInitialized: boolean;
  canvasInfo: CanvasInfo;
  history: CanvasHistory;
  
  // Tool management
  tools: CanvasTools;
  setTool: (tool: string, config?: Partial<BrushConfig>) => void;
  updateBrushConfig: (config: Partial<BrushConfig>) => void;
  
  // Canvas operations
  undo: () => boolean;
  redo: () => boolean;
  clear: () => void;
  save: (key?: string) => Promise<void>;
  load: (key?: string) => Promise<boolean>;
  export: (options?: any) => Promise<string>;
  
  // View operations
  zoom: (level: number) => void;
  resetZoom: () => void;
  fitToScreen: () => void;
  
  // Canvas lifecycle
  initialize: (canvas: fabric.Canvas, manager: CanvasManager) => void;
  dispose: () => void;
  
  // Event handlers
  onDrawingStart: () => void;
  onDrawingEnd: () => void;
}

export const useCanvas = (options: UseCanvasOptions = {}): UseCanvasReturn => {
  const {
    initialTool = 'pen',
    initialBrushConfig = {},
    enableAutoSave = false,
    autoSaveInterval = 30000, // 30 seconds
    storageKey = 'canvas-state',
  } = options;

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const canvasManagerRef = useRef<CanvasManager | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [currentTool, setCurrentTool] = useState(initialTool);
  const [brushConfig, setBrushConfig] = useState<BrushConfig>({
    ...getBrushPresets().mediumPen,
    ...initialBrushConfig,
  } as BrushConfig);
  const [isInitialized, setIsInitialized] = useState(false);
  const [canvasInfo, setCanvasInfo] = useState<CanvasInfo>({
    objectCount: 0,
    dimensions: { width: 0, height: 0 },
    zoom: 1,
    isDrawing: false,
  });
  const [history, setHistory] = useState<CanvasHistory>({
    canUndo: false,
    canRedo: false,
    historySize: 0,
  });

  // Tool presets
  const tools: CanvasTools = {
    pen: getBrushPresets().mediumPen,
    pencil: getBrushPresets().finePen,
    marker: getBrushPresets().marker,
    highlighter: getBrushPresets().highlighter,
    calligraphy: getBrushPresets().calligraphy,
    eraser: {
      color: '#ffffff',
      minWidth: 10,
      maxWidth: 50,
      opacity: 1,
      pressureSensitivity: 0.3,
    },
  };

  // Update canvas info
  const updateCanvasInfo = useCallback(() => {
    if (!fabricCanvasRef.current || !canvasManagerRef.current) return;

    const canvas = fabricCanvasRef.current;
    const manager = canvasManagerRef.current;
    const info = manager.getCanvasInfo();

    setCanvasInfo({
      objectCount: info.objectCount,
      dimensions: info.dimensions,
      zoom: canvas.getZoom(),
      isDrawing: canvas.isDrawingMode,
    });

    setHistory({
      canUndo: info.canUndo,
      canRedo: info.canRedo,
      historySize: info.historySize,
    });
  }, []);

  // Tool management
  const setTool = useCallback((tool: string, config?: Partial<BrushConfig>) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const toolConfig = config || tools[tool as keyof CanvasTools] || tools.pen;
    const newBrushConfig = { ...brushConfig, ...toolConfig } as BrushConfig;

    // Get canvas methods from DrawingCanvas component
    const canvasMethods = (canvasRef.current as any)?._canvasMethods;
    if (canvasMethods) {
      canvasMethods.setTool(tool, newBrushConfig);
    }

    setCurrentTool(tool);
    setBrushConfig(newBrushConfig);
  }, [brushConfig, tools]);

  const updateBrushConfig = useCallback((config: Partial<BrushConfig>) => {
    const newConfig = { ...brushConfig, ...config };
    setBrushConfig(newConfig);

    // Update current tool with new config
    setTool(currentTool, config);
  }, [brushConfig, currentTool, setTool]);

  // Canvas operations
  const undo = useCallback((): boolean => {
    if (!canvasManagerRef.current) return false;
    const result = canvasManagerRef.current.undo();
    updateCanvasInfo();
    return result;
  }, [updateCanvasInfo]);

  const redo = useCallback((): boolean => {
    if (!canvasManagerRef.current) return false;
    const result = canvasManagerRef.current.redo();
    updateCanvasInfo();
    return result;
  }, [updateCanvasInfo]);

  const clear = useCallback(() => {
    if (!canvasManagerRef.current) return;
    canvasManagerRef.current.clearCanvas();
    updateCanvasInfo();
  }, [updateCanvasInfo]);

  const save = useCallback(async (key?: string): Promise<void> => {
    if (!canvasManagerRef.current) return;
    await canvasManagerRef.current.saveCanvasToStorage(key || storageKey);
  }, [storageKey]);

  const load = useCallback(async (key?: string): Promise<boolean> => {
    if (!canvasManagerRef.current) return false;
    const result = await canvasManagerRef.current.loadCanvasFromStorage(key || storageKey);
    if (result) {
      updateCanvasInfo();
    }
    return result;
  }, [storageKey, updateCanvasInfo]);

  const exportCanvas = useCallback(async (options: any = { format: 'png' }): Promise<string> => {
    if (!canvasManagerRef.current) throw new Error('Canvas not initialized');
    return await canvasManagerRef.current.exportCanvas(options);
  }, []);

  // View operations
  const zoom = useCallback((level: number) => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.setZoom(level);
    updateCanvasInfo();
  }, [updateCanvasInfo]);

  const resetZoom = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.setZoom(1);
    fabricCanvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);
    updateCanvasInfo();
  }, [updateCanvasInfo]);

  const fitToScreen = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    
    if (objects.length === 0) {
      resetZoom();
      return;
    }

    // Get bounding box of all objects
    const group = new fabric.Group(objects, { originX: 'center', originY: 'center' });
    const boundingBox = group.getBoundingRect();
    
    // Calculate zoom to fit
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const padding = 50;
    
    const zoomX = (canvasWidth - padding * 2) / boundingBox.width;
    const zoomY = (canvasHeight - padding * 2) / boundingBox.height;
    const zoomLevel = Math.min(zoomX, zoomY, 1); // Don't zoom in beyond 100%

    // Center the content
    const centerX = boundingBox.left + boundingBox.width / 2;
    const centerY = boundingBox.top + boundingBox.height / 2;
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;

    canvas.setZoom(zoomLevel);
    const translateX = (canvasCenterX - centerX * zoomLevel) / zoomLevel;
    const translateY = (canvasCenterY - centerY * zoomLevel) / zoomLevel;
    
    canvas.setViewportTransform([zoomLevel, 0, 0, zoomLevel, translateX * zoomLevel, translateY * zoomLevel]);
    
    // Clean up temporary group
    objects.forEach(obj => canvas.add(obj));
    
    updateCanvasInfo();
  }, [resetZoom, updateCanvasInfo]);

  // Canvas lifecycle
  const initialize = useCallback((canvas: fabric.Canvas, manager: CanvasManager) => {
    fabricCanvasRef.current = canvas;
    canvasManagerRef.current = manager;

    // Set up event listeners
    canvas.on('path:created', updateCanvasInfo);
    canvas.on('object:added', updateCanvasInfo);
    canvas.on('object:removed', updateCanvasInfo);
    canvas.on('object:modified', updateCanvasInfo);

    setIsInitialized(true);
    updateCanvasInfo();

    // Try to load previous state
    if (enableAutoSave) {
      load().catch(() => {
        // Ignore load errors on initialization
      });
    }
  }, [updateCanvasInfo, enableAutoSave, load]);

  const dispose = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }

    if (canvasManagerRef.current) {
      canvasManagerRef.current.dispose();
      canvasManagerRef.current = null;
    }

    fabricCanvasRef.current = null;
    setIsInitialized(false);
  }, []);

  // Event handlers
  const onDrawingStart = useCallback(() => {
    setCanvasInfo(prev => ({ ...prev, isDrawing: true }));
  }, []);

  const onDrawingEnd = useCallback(() => {
    setCanvasInfo(prev => ({ ...prev, isDrawing: false }));
    updateCanvasInfo();

    // Auto-save after drawing
    if (enableAutoSave) {
      save().catch(console.error);
    }
  }, [updateCanvasInfo, enableAutoSave, save]);

  // Auto-save functionality
  useEffect(() => {
    if (!enableAutoSave || !isInitialized) return;

    autoSaveIntervalRef.current = setInterval(() => {
      save().catch(console.error);
    }, autoSaveInterval);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [enableAutoSave, isInitialized, autoSaveInterval, save]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispose();
    };
  }, [dispose]);

  return {
    // Canvas references
    canvasRef,
    fabricCanvas: fabricCanvasRef.current,
    canvasManager: canvasManagerRef.current,
    
    // Canvas state
    currentTool,
    brushConfig,
    isInitialized,
    canvasInfo,
    history,
    
    // Tool management
    tools,
    setTool,
    updateBrushConfig,
    
    // Canvas operations
    undo,
    redo,
    clear,
    save,
    load,
    export: exportCanvas,
    
    // View operations
    zoom,
    resetZoom,
    fitToScreen,
    
    // Canvas lifecycle
    initialize,
    dispose,
    
    // Event handlers
    onDrawingStart,
    onDrawingEnd,
  };
};