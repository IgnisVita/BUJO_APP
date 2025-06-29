// ABOUTME: Custom brush implementations for natural drawing experience
// Pressure-sensitive pen, calligraphy brush, marker with texture, and smooth line algorithms

import * as fabric from 'fabric';

export interface PressurePoint {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
}

export interface BrushConfig {
  minWidth: number;
  maxWidth: number;
  smoothing: number;
  pressureSensitivity: number;
  color: string;
  opacity: number;
  texture?: string;
  flow?: number;
}

export interface SmoothPoint {
  x: number;
  y: number;
  pressure?: number;
}

/**
 * Smooths a path using quadratic curves for natural drawing feel
 */
export class PathSmoother {
  private points: SmoothPoint[] = [];
  private readonly smoothingFactor: number;

  constructor(smoothingFactor = 0.5) {
    this.smoothingFactor = Math.max(0, Math.min(1, smoothingFactor));
  }

  public addPoint(point: SmoothPoint): void {
    this.points.push(point);
  }

  public getSmoothedPath(): string {
    if (this.points.length < 2) return '';
    if (this.points.length === 2) {
      return `M ${this.points[0].x} ${this.points[0].y} L ${this.points[1].x} ${this.points[1].y}`;
    }

    let path = `M ${this.points[0].x} ${this.points[0].y}`;
    
    for (let i = 1; i < this.points.length - 1; i++) {
      const current = this.points[i];
      const next = this.points[i + 1];
      
      // Calculate control point for smooth curve
      const cpX = current.x + (next.x - current.x) * this.smoothingFactor;
      const cpY = current.y + (next.y - current.y) * this.smoothingFactor;
      
      path += ` Q ${current.x} ${current.y} ${cpX} ${cpY}`;
    }

    // Add final point
    const lastPoint = this.points[this.points.length - 1];
    path += ` L ${lastPoint.x} ${lastPoint.y}`;

    return path;
  }

  public clear(): void {
    this.points = [];
  }

  public getPoints(): SmoothPoint[] {
    return [...this.points];
  }
}

/**
 * Custom pressure-sensitive brush with smooth lines
 */
export class PressureBrush extends fabric.PencilBrush {
  private pressurePoints: PressurePoint[] = [];
  private pathSmoother: PathSmoother;
  private config: BrushConfig;
  private currentPath: fabric.Path | null = null;
  private velocityFilter: number[] = [];
  private readonly maxVelocityHistory = 5;

  constructor(canvas: fabric.Canvas, config: Partial<BrushConfig> = {}) {
    super(canvas);
    
    this.config = {
      minWidth: 1,
      maxWidth: 20,
      smoothing: 0.7,
      pressureSensitivity: 0.8,
      color: '#000000',
      opacity: 1,
      flow: 1,
      ...config,
    };

    this.pathSmoother = new PathSmoother(this.config.smoothing);
    this.color = this.config.color;
    this.width = this.config.maxWidth;
  }

  public updateConfig(newConfig: Partial<BrushConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.pathSmoother = new PathSmoother(this.config.smoothing);
    if (newConfig.color) this.color = newConfig.color;
    if (newConfig.maxWidth) this.width = newConfig.maxWidth;
  }

  private getPressure(event: any): number {
    // Try to get pressure from PointerEvent
    if (event.pressure !== undefined && event.pressure > 0) {
      return event.pressure;
    }
    
    // Try to get pressure from Touch API (webkitForce)
    if (event.webkitForce !== undefined) {
      return Math.min(event.webkitForce, 1);
    }
    
    // Fallback: simulate pressure based on velocity
    return this.getVelocityBasedPressure(event);
  }

  private getVelocityBasedPressure(event: any): number {
    if (this.pressurePoints.length < 2) return 0.5;

    const lastPoint = this.pressurePoints[this.pressurePoints.length - 1];
    const currentTime = Date.now();
    const timeDiff = currentTime - lastPoint.timestamp;
    
    if (timeDiff === 0) return lastPoint.pressure;

    const distance = Math.sqrt(
      Math.pow(event.offsetX - lastPoint.x, 2) + 
      Math.pow(event.offsetY - lastPoint.y, 2)
    );
    
    const velocity = distance / timeDiff;
    
    // Add to velocity filter for smoothing
    this.velocityFilter.push(velocity);
    if (this.velocityFilter.length > this.maxVelocityHistory) {
      this.velocityFilter.shift();
    }
    
    // Calculate average velocity
    const avgVelocity = this.velocityFilter.reduce((sum, v) => sum + v, 0) / this.velocityFilter.length;
    
    // Convert velocity to pressure (lower velocity = higher pressure)
    const normalizedVelocity = Math.min(avgVelocity / 2, 1);
    return Math.max(0.1, 1 - normalizedVelocity);
  }

  private getStrokeWidth(pressure: number): number {
    const { minWidth, maxWidth, pressureSensitivity } = this.config;
    const pressureEffect = pressure * pressureSensitivity;
    return minWidth + (maxWidth - minWidth) * pressureEffect;
  }

  public onMouseDown(pointer: fabric.IEvent): void {
    if (!this.canvas._isMainEvent(pointer.e)) return;

    this.pressurePoints = [];
    this.pathSmoother.clear();
    this.velocityFilter = [];

    const pressure = this.getPressure(pointer.e);
    const point: PressurePoint = {
      x: pointer.pointer.x,
      y: pointer.pointer.y,
      pressure,
      timestamp: Date.now(),
    };

    this.pressurePoints.push(point);
    this.pathSmoother.addPoint({ x: point.x, y: point.y, pressure: point.pressure });

    this._setBrushStyles(this.canvas.contextTop);
    this.canvas.contextTop.beginPath();
  }

  public onMouseMove(pointer: fabric.IEvent): void {
    if (!this.canvas._isMainEvent(pointer.e)) return;
    if (this.pressurePoints.length === 0) return;

    const pressure = this.getPressure(pointer.e);
    const point: PressurePoint = {
      x: pointer.pointer.x,
      y: pointer.pointer.y,
      pressure,
      timestamp: Date.now(),
    };

    this.pressurePoints.push(point);
    this.pathSmoother.addPoint({ x: point.x, y: point.y, pressure: point.pressure });

    // Draw current stroke with variable width
    this.drawVariableWidthStroke();
  }

  public onMouseUp(): void {
    if (this.pressurePoints.length < 2) return;

    // Create final path with variable stroke width
    this.createVariableWidthPath();
    this.pressurePoints = [];
    this.pathSmoother.clear();
    this.velocityFilter = [];
  }

  private drawVariableWidthStroke(): void {
    const ctx = this.canvas.contextTop;
    const points = this.pathSmoother.getPoints();
    
    if (points.length < 2) return;

    ctx.clearRect(0, 0, this.canvas.getWidth(), this.canvas.getHeight());
    ctx.beginPath();

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const pressure = current.pressure || 0.5;
      const width = this.getStrokeWidth(pressure);

      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (i === 0) {
        ctx.moveTo(current.x, current.y);
      }
      
      // Use quadratic curve for smoother lines
      const cpX = (current.x + next.x) / 2;
      const cpY = (current.y + next.y) / 2;
      ctx.quadraticCurveTo(current.x, current.y, cpX, cpY);
      ctx.stroke();
    }
  }

  private createVariableWidthPath(): void {
    const points = this.pressurePoints;
    if (points.length < 2) return;

    // Create a path with variable stroke width using multiple overlapping paths
    const pathGroup = new fabric.Group([], {
      left: points[0].x,
      top: points[0].y,
    });

    // Create segments with different widths based on pressure
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const avgPressure = (current.pressure + next.pressure) / 2;
      const strokeWidth = this.getStrokeWidth(avgPressure);

      const pathString = `M ${current.x} ${current.y} L ${next.x} ${next.y}`;
      const path = new fabric.Path(pathString, {
        stroke: this.config.color,
        strokeWidth,
        fill: '',
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        opacity: this.config.opacity,
        left: 0,
        top: 0,
      });

      pathGroup.addWithUpdate(path);
    }

    this.canvas.add(pathGroup);
    this.canvas.clearContext(this.canvas.contextTop);
  }
}

/**
 * Calligraphy brush with angle-sensitive strokes
 */
export class CalligraphyBrush extends fabric.PencilBrush {
  private angle: number = 45; // Brush angle in degrees
  private config: BrushConfig;

  constructor(canvas: fabric.Canvas, config: Partial<BrushConfig> = {}) {
    super(canvas);
    
    this.config = {
      minWidth: 2,
      maxWidth: 15,
      smoothing: 0.5,
      pressureSensitivity: 0.6,
      color: '#000000',
      opacity: 1,
      ...config,
    };

    this.color = this.config.color;
    this.width = this.config.maxWidth;
  }

  public setAngle(angle: number): void {
    this.angle = angle;
  }

  private getStrokeWidth(dx: number, dy: number, pressure: number = 0.5): number {
    // Calculate stroke width based on movement direction relative to brush angle
    const moveAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    const angleDiff = Math.abs(moveAngle - this.angle);
    const normalizedAngle = Math.min(angleDiff, 180 - angleDiff) / 90; // 0-1 range
    
    const baseWidth = this.config.minWidth + 
      (this.config.maxWidth - this.config.minWidth) * pressure * this.config.pressureSensitivity;
    
    return baseWidth * (0.3 + 0.7 * normalizedAngle);
  }

  protected _setBrushStyles(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = this.config.opacity;
  }
}

/**
 * Marker brush with texture and flow effects
 */
export class MarkerBrush extends fabric.PencilBrush {
  private config: BrushConfig;
  private texturePattern: CanvasPattern | null = null;

  constructor(canvas: fabric.Canvas, config: Partial<BrushConfig> = {}) {
    super(canvas);
    
    this.config = {
      minWidth: 5,
      maxWidth: 30,
      smoothing: 0.3,
      pressureSensitivity: 0.4,
      color: '#FFD700',
      opacity: 0.7,
      flow: 0.8,
      ...config,
    };

    this.color = this.config.color;
    this.width = this.config.maxWidth;
    this.createTexturePattern();
  }

  private createTexturePattern(): void {
    // Create a subtle texture pattern for marker effect
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 32;
    patternCanvas.height = 32;
    const patternCtx = patternCanvas.getContext('2d')!;

    // Create noise texture
    const imageData = patternCtx.createImageData(32, 32);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 0.1;
      data[i] = 255;     // R
      data[i + 1] = 255; // G
      data[i + 2] = 255; // B
      data[i + 3] = Math.floor(255 * noise); // A
    }

    patternCtx.putImageData(imageData, 0, 0);
    this.texturePattern = patternCtx.createPattern(patternCanvas, 'repeat');
  }

  protected _setBrushStyles(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = this.config.opacity * (this.config.flow || 1);
    
    // Apply texture if available
    if (this.texturePattern) {
      ctx.globalCompositeOperation = 'multiply';
    }
  }

  public onMouseMove(pointer: fabric.IEvent): void {
    super.onMouseMove(pointer);
    
    // Add texture overlay
    if (this.texturePattern && this._points.length > 1) {
      const ctx = this.canvas.contextTop;
      const lastPoint = this._points[this._points.length - 1];
      const prevPoint = this._points[this._points.length - 2];
      
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = this.texturePattern;
      ctx.globalAlpha = 0.1;
      
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, this.width / 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  }
}

/**
 * Highlighter brush with transparency and flat edges
 */
export class HighlighterBrush extends fabric.PencilBrush {
  private config: BrushConfig;

  constructor(canvas: fabric.Canvas, config: Partial<BrushConfig> = {}) {
    super(canvas);
    
    this.config = {
      minWidth: 15,
      maxWidth: 25,
      smoothing: 0.8,
      pressureSensitivity: 0.2,
      color: '#FFFF00',
      opacity: 0.4,
      ...config,
    };

    this.color = this.config.color;
    this.width = this.config.maxWidth;
  }

  protected _setBrushStyles(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.lineCap = 'square'; // Flat edges for highlighter effect
    ctx.lineJoin = 'miter';
    ctx.globalAlpha = this.config.opacity;
    ctx.globalCompositeOperation = 'multiply'; // Blend mode for highlighting
  }

  protected convertPointsToSVGPath(points: fabric.Point[]): string {
    const path = super.convertPointsToSVGPath(points);
    // Ensure highlighter has consistent width
    return path;
  }
}

/**
 * Utility functions for brush management
 */
export const createBrush = (
  type: 'pen' | 'calligraphy' | 'marker' | 'highlighter' | 'pencil',
  canvas: fabric.Canvas,
  config: Partial<BrushConfig> = {}
): fabric.BaseBrush => {
  switch (type) {
    case 'pen':
      return new PressureBrush(canvas, config);
    case 'calligraphy':
      return new CalligraphyBrush(canvas, config);
    case 'marker':
      return new MarkerBrush(canvas, config);
    case 'highlighter':
      return new HighlighterBrush(canvas, config);
    case 'pencil':
    default:
      const brush = new fabric.PencilBrush(canvas);
      brush.color = config.color || '#000000';
      brush.width = config.maxWidth || 5;
      return brush;
  }
};

export const getBrushPresets = (): Record<string, Partial<BrushConfig>> => ({
  finePen: {
    minWidth: 0.5,
    maxWidth: 3,
    pressureSensitivity: 0.9,
    smoothing: 0.8,
    color: '#000000',
    opacity: 1,
  },
  mediumPen: {
    minWidth: 1,
    maxWidth: 6,
    pressureSensitivity: 0.7,
    smoothing: 0.7,
    color: '#000000',
    opacity: 1,
  },
  thickPen: {
    minWidth: 2,
    maxWidth: 12,
    pressureSensitivity: 0.6,
    smoothing: 0.6,
    color: '#000000',
    opacity: 1,
  },
  calligraphy: {
    minWidth: 3,
    maxWidth: 15,
    pressureSensitivity: 0.8,
    smoothing: 0.5,
    color: '#2B4C8C',
    opacity: 0.9,
  },
  marker: {
    minWidth: 8,
    maxWidth: 25,
    pressureSensitivity: 0.3,
    smoothing: 0.4,
    color: '#FF6B6B',
    opacity: 0.8,
    flow: 0.9,
  },
  highlighter: {
    minWidth: 12,
    maxWidth: 30,
    pressureSensitivity: 0.1,
    smoothing: 0.9,
    color: '#FFEB3B',
    opacity: 0.5,
  },
});