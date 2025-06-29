// ABOUTME: Advanced color picker with HSV wheel, preset palettes, and eyedropper
// Provides intuitive color selection for drawing tools

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  showPresets?: boolean;
  showRecent?: boolean;
  showEyedropper?: boolean;
  presetColors?: string[];
  maxRecentColors?: number;
}

interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

const DEFAULT_PRESET_COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80',
  '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
  '#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F5DEB3', '#FFF8DC',
  '#FF69B4', '#FF1493', '#DC143C', '#B22222', '#8B0000', '#FF4500',
  '#FFA500', '#FFD700', '#FFFF00', '#ADFF2F', '#32CD32', '#00FF00',
  '#00FA9A', '#00CED1', '#1E90FF', '#0000CD', '#4169E1', '#8A2BE2',
  '#9400D3', '#9932CC', '#8B008B', '#FF00FF', '#FF69B4', '#FF1493',
];

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  className,
  showPresets = true,
  showRecent = true,
  showEyedropper = true,
  presetColors = DEFAULT_PRESET_COLORS,
  maxRecentColors = 10,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hsv, setHSV] = useState<HSV>(hexToHSV(value));
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('colorPicker-recent');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [isEyedropperActive, setIsEyedropperActive] = useState(false);

  const colorWheelRef = useRef<HTMLCanvasElement>(null);
  const saturationRef = useRef<HTMLCanvasElement>(null);
  const dragStateRef = useRef<{
    isDragging: boolean;
    target: 'wheel' | 'saturation' | null;
  }>({ isDragging: false, target: null });

  // Color conversion utilities
  function hexToHSV(hex: string): HSV {
    const rgb = hexToRGB(hex);
    return rgbToHSV(rgb);
  }

  function hexToRGB(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  function rgbToHSV(rgb: RGB): HSV {
    const { r, g, b } = rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      switch (max) {
        case r: h = ((g - b) / diff) % 6; break;
        case g: h = (b - r) / diff + 2; break;
        case b: h = (r - g) / diff + 4; break;
      }
    }
    
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    const s = max === 0 ? 0 : Math.round((diff / max) * 100);
    const v = Math.round((max / 255) * 100);
    
    return { h, s, v };
  }

  function hsvToRGB(hsv: HSV): RGB {
    const { h, s, v } = hsv;
    const c = (v / 100) * (s / 100);
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = (v / 100) - c;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  function hsvToHex(hsv: HSV): string {
    const rgb = hsvToRGB(hsv);
    return `#${[rgb.r, rgb.g, rgb.b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  }

  // Draw color wheel
  const drawColorWheel = useCallback(() => {
    const canvas = colorWheelRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw color wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = angle * Math.PI / 180;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, radius * 0.6, endAngle, startAngle, true);
      ctx.closePath();
      
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.6, centerX, centerY, radius);
      gradient.addColorStop(0, `hsl(${angle}, 100%, 50%)`);
      gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw inner circle (white to transparent)
    const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.6);
    innerGradient.addColorStop(0, 'white');
    innerGradient.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = innerGradient;
    ctx.fill();

    // Draw current hue indicator
    const hueAngle = (hsv.h * Math.PI) / 180;
    const indicatorRadius = radius * 0.8;
    const indicatorX = centerX + Math.cos(hueAngle) * indicatorRadius;
    const indicatorY = centerY + Math.sin(hueAngle) * indicatorRadius;
    
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [hsv.h]);

  // Draw saturation/value picker
  const drawSaturationPicker = useCallback(() => {
    const canvas = saturationRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Create base color from current hue
    const baseColor = hsvToRGB({ h: hsv.h, s: 100, v: 100 });
    const baseHex = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;

    // Draw saturation gradient (left to right: white to pure color)
    const saturationGradient = ctx.createLinearGradient(0, 0, width, 0);
    saturationGradient.addColorStop(0, 'white');
    saturationGradient.addColorStop(1, baseHex);
    
    ctx.fillStyle = saturationGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw value gradient (top to bottom: transparent to black)
    const valueGradient = ctx.createLinearGradient(0, 0, 0, height);
    valueGradient.addColorStop(0, 'transparent');
    valueGradient.addColorStop(1, 'black');
    
    ctx.fillStyle = valueGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw current position indicator
    const x = (hsv.s / 100) * width;
    const y = ((100 - hsv.v) / 100) * height;
    
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [hsv]);

  // Handle color wheel interaction
  const handleWheelInteraction = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = colorWheelRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const deltaX = x - centerX;
    const deltaY = y - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const radius = Math.min(centerX, centerY) - 2;
    
    // Check if click is within the color wheel ring
    if (distance >= radius * 0.6 && distance <= radius) {
      const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      const normalizedAngle = angle < 0 ? angle + 360 : angle;
      
      const newHSV = { ...hsv, h: normalizedAngle };
      setHSV(newHSV);
      onChange(hsvToHex(newHSV));
    }
  }, [hsv, onChange]);

  // Handle saturation picker interaction
  const handleSaturationInteraction = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = saturationRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const s = Math.max(0, Math.min(100, (x / canvas.width) * 100));
    const v = Math.max(0, Math.min(100, 100 - (y / canvas.height) * 100));
    
    const newHSV = { ...hsv, s, v };
    setHSV(newHSV);
    onChange(hsvToHex(newHSV));
  }, [hsv, onChange]);

  // Add color to recent colors
  const addToRecentColors = useCallback((color: string) => {
    const newRecent = [color, ...recentColors.filter(c => c !== color)].slice(0, maxRecentColors);
    setRecentColors(newRecent);
    localStorage.setItem('colorPicker-recent', JSON.stringify(newRecent));
  }, [recentColors, maxRecentColors]);

  // Eyedropper functionality
  const activateEyedropper = useCallback(async () => {
    if (!('EyeDropper' in window)) {
      alert('Eyedropper not supported in this browser');
      return;
    }

    try {
      setIsEyedropperActive(true);
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      
      if (result.sRGBHex) {
        onChange(result.sRGBHex);
        setHSV(hexToHSV(result.sRGBHex));
        addToRecentColors(result.sRGBHex);
      }
    } catch (error) {
      console.error('Eyedropper error:', error);
    } finally {
      setIsEyedropperActive(false);
    }
  }, [onChange, addToRecentColors]);

  // Update HSV when value prop changes
  useEffect(() => {
    const newHSV = hexToHSV(value);
    setHSV(newHSV);
  }, [value]);

  // Redraw canvases when HSV changes
  useEffect(() => {
    drawColorWheel();
    drawSaturationPicker();
  }, [drawColorWheel, drawSaturationPicker]);

  // Handle mouse events for dragging
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return;

      event.preventDefault();

      if (dragStateRef.current.target === 'wheel') {
        const canvas = colorWheelRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const deltaX = x - centerX;
        const deltaY = y - centerY;
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        const normalizedAngle = angle < 0 ? angle + 360 : angle;
        
        const newHSV = { ...hsv, h: normalizedAngle };
        setHSV(newHSV);
        onChange(hsvToHex(newHSV));
      } else if (dragStateRef.current.target === 'saturation') {
        const canvas = saturationRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const s = Math.max(0, Math.min(100, (x / canvas.width) * 100));
        const v = Math.max(0, Math.min(100, 100 - (y / canvas.height) * 100));
        
        const newHSV = { ...hsv, s, v };
        setHSV(newHSV);
        onChange(hsvToHex(newHSV));
      }
    };

    const handleMouseUp = () => {
      if (dragStateRef.current.isDragging) {
        addToRecentColors(value);
      }
      dragStateRef.current.isDragging = false;
      dragStateRef.current.target = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [hsv, onChange, value, addToRecentColors]);

  return (
    <div className={cn('relative', className)}>
      {/* Color preview button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded border-2 border-gray-300 shadow-sm hover:shadow-md transition-shadow"
        style={{ backgroundColor: value }}
        title="Pick color"
      />

      {/* Color picker popup */}
      {isOpen && (
        <div className="absolute top-10 left-0 z-50 bg-white rounded-lg shadow-xl border p-4 min-w-[280px]">
          {/* Color wheel */}
          <div className="mb-4">
            <canvas
              ref={colorWheelRef}
              width={120}
              height={120}
              className="cursor-crosshair mx-auto"
              onMouseDown={(e) => {
                dragStateRef.current.isDragging = true;
                dragStateRef.current.target = 'wheel';
                handleWheelInteraction(e);
              }}
            />
          </div>

          {/* Saturation/Value picker */}
          <div className="mb-4">
            <canvas
              ref={saturationRef}
              width={240}
              height={120}
              className="cursor-crosshair border rounded"
              onMouseDown={(e) => {
                dragStateRef.current.isDragging = true;
                dragStateRef.current.target = 'saturation';
                handleSaturationInteraction(e);
              }}
            />
          </div>

          {/* Color preview and hex input */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-12 h-8 rounded border"
              style={{ backgroundColor: value }}
            />
            <input
              type="text"
              value={value.toUpperCase()}
              onChange={(e) => {
                const hex = e.target.value;
                if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                  onChange(hex);
                  setHSV(hexToHSV(hex));
                }
              }}
              className="flex-1 px-2 py-1 border rounded text-sm font-mono"
              placeholder="#000000"
            />
            {showEyedropper && (
              <button
                onClick={activateEyedropper}
                disabled={isEyedropperActive}
                className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                title="Eyedropper tool"
              >
                🎯
              </button>
            )}
          </div>

          {/* Preset colors */}
          {showPresets && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Presets</div>
              <div className="grid grid-cols-12 gap-1">
                {presetColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onChange(color);
                      setHSV(hexToHSV(color));
                      addToRecentColors(color);
                    }}
                    className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent colors */}
          {showRecent && recentColors.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Recent</div>
              <div className="flex gap-1">
                {recentColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onChange(color);
                      setHSV(hexToHSV(color));
                    }}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;