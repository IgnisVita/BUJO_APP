// ABOUTME: Canvas utilities for save/load, export, undo/redo, and performance optimizations
// Main functions for canvas state management, data persistence, and format exports

import * as fabric from 'fabric';
import { nanoid } from 'nanoid';

export interface CanvasState {
  id: string;
  timestamp: number;
  data: string;
  width: number;
  height: number;
  layers?: LayerData[];
}

export interface LayerData {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  data: string;
  index: number;
}

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'svg' | 'pdf';
  quality?: number;
  scale?: number;
  backgroundColor?: string;
  includeBackground?: boolean;
}

export interface CanvasPerformanceConfig {
  enableCaching: boolean;
  objectCaching: boolean;
  skipOffscreen: boolean;
  enableRetinaScaling: boolean;
  maxCacheSize: number;
  renderOnAddRemove: boolean;
}

export class CanvasManager {
  private canvas: fabric.Canvas | null = null;
  private undoStack: CanvasState[] = [];
  private redoStack: CanvasState[] = [];
  private maxHistorySize = 50;
  private currentState: CanvasState | null = null;
  private isRecordingState = true;
  private performanceConfig: CanvasPerformanceConfig;

  constructor(performanceConfig?: Partial<CanvasPerformanceConfig>) {
    this.performanceConfig = {
      enableCaching: true,
      objectCaching: true,
      skipOffscreen: true,
      enableRetinaScaling: true,
      maxCacheSize: 256,
      renderOnAddRemove: true,
      ...performanceConfig,
    };
  }

  public setCanvas(canvas: fabric.Canvas): void {
    this.canvas = canvas;
    this.setupPerformanceOptimizations();
    this.setupEventListeners();
  }

  private setupPerformanceOptimizations(): void {
    if (!this.canvas) return;

    // Configure performance settings
    this.canvas.set({
      enableRetinaScaling: this.performanceConfig.enableRetinaScaling,
      skipOffscreen: this.performanceConfig.skipOffscreen,
      renderOnAddRemove: this.performanceConfig.renderOnAddRemove,
    });

    // Enable object caching for better performance
    fabric.Object.prototype.objectCaching = this.performanceConfig.objectCaching;
    fabric.Object.prototype.statefullCache = this.performanceConfig.enableCaching;
    fabric.Object.prototype.cacheProperties = [
      'fill', 'stroke', 'strokeWidth', 'strokeDashArray', 'width', 'height',
      'scaleX', 'scaleY', 'angle', 'originX', 'originY', 'skewX', 'skewY',
      'shadow', 'clipPath', 'visible', 'backgroundColor'
    ];

    // Optimize rendering for touch devices
    if ('ontouchstart' in window) {
      this.canvas.set({
        allowTouchScrolling: true,
        moveCursor: 'move',
        hoverCursor: 'move',
      });
    }
  }

  private setupEventListeners(): void {
    if (!this.canvas) return;

    // Record state changes for undo/redo
    const recordState = () => {
      if (this.isRecordingState) {
        this.saveState();
      }
    };

    this.canvas.on('path:created', recordState);
    this.canvas.on('object:added', recordState);
    this.canvas.on('object:removed', recordState);
    this.canvas.on('object:modified', recordState);

    // Optimize pointer events for drawing
    this.canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let zoom = this.canvas!.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      
      this.canvas!.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Handle high-DPI displays
    this.handleRetinaScaling();
  }

  private handleRetinaScaling(): void {
    if (!this.canvas || !this.performanceConfig.enableRetinaScaling) return;

    const ratio = window.devicePixelRatio || 1;
    if (ratio > 1) {
      const canvasEl = this.canvas.getElement();
      const width = canvasEl.width;
      const height = canvasEl.height;
      
      canvasEl.width = width * ratio;
      canvasEl.height = height * ratio;
      canvasEl.style.width = width + 'px';
      canvasEl.style.height = height + 'px';
      
      this.canvas.getContext().scale(ratio, ratio);
    }
  }

  public saveState(): void {
    if (!this.canvas || !this.isRecordingState) return;

    const state: CanvasState = {
      id: nanoid(),
      timestamp: Date.now(),
      data: JSON.stringify(this.canvas.toJSON()),
      width: this.canvas.getWidth(),
      height: this.canvas.getHeight(),
    };

    this.undoStack.push(state);
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }

    this.redoStack = []; // Clear redo stack when new action is performed
    this.currentState = state;
  }

  public undo(): boolean {
    if (!this.canvas || this.undoStack.length === 0) return false;

    this.isRecordingState = false;
    
    if (this.currentState) {
      this.redoStack.push(this.currentState);
    }

    const previousState = this.undoStack.pop()!;
    this.loadState(previousState);
    this.currentState = this.undoStack[this.undoStack.length - 1] || null;

    this.isRecordingState = true;
    return true;
  }

  public redo(): boolean {
    if (!this.canvas || this.redoStack.length === 0) return false;

    this.isRecordingState = false;

    const nextState = this.redoStack.pop()!;
    if (this.currentState) {
      this.undoStack.push(this.currentState);
    }
    
    this.loadState(nextState);
    this.currentState = nextState;

    this.isRecordingState = true;
    return true;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clearHistory(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.currentState = null;
  }

  public async saveCanvasToStorage(key: string): Promise<void> {
    if (!this.canvas) throw new Error('Canvas not initialized');

    const state: CanvasState = {
      id: nanoid(),
      timestamp: Date.now(),
      data: JSON.stringify(this.canvas.toJSON()),
      width: this.canvas.getWidth(),
      height: this.canvas.getHeight(),
    };

    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save canvas to storage:', error);
      throw error;
    }
  }

  public async loadCanvasFromStorage(key: string): Promise<boolean> {
    if (!this.canvas) throw new Error('Canvas not initialized');

    try {
      const storedData = localStorage.getItem(key);
      if (!storedData) return false;

      const state: CanvasState = JSON.parse(storedData);
      await this.loadState(state);
      return true;
    } catch (error) {
      console.error('Failed to load canvas from storage:', error);
      return false;
    }
  }

  public async loadState(state: CanvasState): Promise<void> {
    if (!this.canvas) throw new Error('Canvas not initialized');

    this.isRecordingState = false;

    try {
      const canvasData = JSON.parse(state.data);
      
      // Set canvas dimensions if they differ
      if (this.canvas.getWidth() !== state.width || this.canvas.getHeight() !== state.height) {
        this.canvas.setDimensions({ width: state.width, height: state.height });
      }

      await new Promise<void>((resolve, reject) => {
        this.canvas!.loadFromJSON(canvasData, () => {
          this.canvas!.renderAll();
          resolve();
        }, (error: any) => {
          reject(error);
        });
      });
    } finally {
      this.isRecordingState = true;
    }
  }

  public async exportCanvas(options: ExportOptions = { format: 'png' }): Promise<string> {
    if (!this.canvas) throw new Error('Canvas not initialized');

    const { format, quality = 1, scale = 1, backgroundColor, includeBackground = true } = options;

    // Temporarily set background if specified
    const originalBackground = this.canvas.backgroundColor;
    if (backgroundColor && includeBackground) {
      this.canvas.setBackgroundColor(backgroundColor, () => {});
    }

    try {
      switch (format) {
        case 'png':
          return this.canvas.toDataURL({
            format: 'png',
            quality,
            multiplier: scale,
          });

        case 'jpeg':
          return this.canvas.toDataURL({
            format: 'jpeg',
            quality,
            multiplier: scale,
          });

        case 'svg':
          return this.canvas.toSVG({
            width: this.canvas.getWidth() * scale,
            height: this.canvas.getHeight() * scale,
          });

        case 'pdf':
          // For PDF export, we'll return a data URL that can be processed by external libraries
          const pngData = this.canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: scale,
          });
          return pngData;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } finally {
      // Restore original background
      if (backgroundColor && includeBackground && originalBackground !== backgroundColor) {
        this.canvas.setBackgroundColor(originalBackground, () => {});
      }
    }
  }

  public clearCanvas(): void {
    if (!this.canvas) return;
    
    this.canvas.clear();
    this.clearHistory();
    this.canvas.renderAll();
  }

  public optimizeCanvas(): void {
    if (!this.canvas) return;

    // Clear object cache for memory optimization
    this.canvas.getObjects().forEach(obj => {
      if (obj._cacheCanvas) {
        obj._cacheCanvas = null;
      }
      obj.dirty = true;
    });

    // Force garbage collection of unused objects
    this.canvas.renderAll();

    // Limit cache size
    const objects = this.canvas.getObjects();
    if (objects.length > this.performanceConfig.maxCacheSize) {
      objects.slice(0, objects.length - this.performanceConfig.maxCacheSize).forEach(obj => {
        if (obj._cacheCanvas) {
          obj._cacheCanvas = null;
        }
      });
    }
  }

  public getCanvasInfo(): {
    objectCount: number;
    historySize: number;
    canUndo: boolean;
    canRedo: boolean;
    dimensions: { width: number; height: number };
  } {
    return {
      objectCount: this.canvas?.getObjects().length || 0,
      historySize: this.undoStack.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      dimensions: {
        width: this.canvas?.getWidth() || 0,
        height: this.canvas?.getHeight() || 0,
      },
    };
  }

  public dispose(): void {
    if (this.canvas) {
      this.canvas.dispose();
    }
    this.clearHistory();
    this.canvas = null;
  }
}

// Utility functions for canvas operations
export const createOptimizedCanvas = (
  element: HTMLCanvasElement,
  options: Partial<fabric.ICanvasOptions> = {},
  performanceConfig?: Partial<CanvasPerformanceConfig>
): { canvas: fabric.Canvas; manager: CanvasManager } => {
  const canvas = new fabric.Canvas(element, {
    width: 800,
    height: 600,
    enableRetinaScaling: true,
    allowTouchScrolling: false,
    selection: true,
    preserveObjectStacking: true,
    skipOffscreen: true,
    ...options,
  });

  const manager = new CanvasManager(performanceConfig);
  manager.setCanvas(canvas);

  return { canvas, manager };
};

export const downloadCanvasAsFile = async (
  canvas: fabric.Canvas,
  filename: string,
  options: ExportOptions = { format: 'png' }
): Promise<void> => {
  const manager = new CanvasManager();
  manager.setCanvas(canvas);
  
  const dataUrl = await manager.exportCanvas(options);
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const resizeCanvas = (
  canvas: fabric.Canvas,
  width: number,
  height: number,
  preserveAspectRatio = false
): void => {
  if (preserveAspectRatio) {
    const currentRatio = canvas.getWidth() / canvas.getHeight();
    const newRatio = width / height;
    
    if (newRatio > currentRatio) {
      width = height * currentRatio;
    } else {
      height = width / currentRatio;
    }
  }

  canvas.setDimensions({ width, height });
  canvas.renderAll();
};

export const getOptimalCanvasSize = (
  containerWidth: number,
  containerHeight: number,
  devicePixelRatio = window.devicePixelRatio || 1
): { width: number; height: number } => {
  // Account for device pixel ratio but cap at 2x for performance
  const ratio = Math.min(devicePixelRatio, 2);
  
  return {
    width: Math.floor(containerWidth * ratio),
    height: Math.floor(containerHeight * ratio),
  };
};