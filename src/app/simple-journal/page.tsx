// ABOUTME: Ultra-simplified journal page - just dot grid and minimal tools
// Designed to feel like opening a real bullet journal

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

import { MinimalTools } from '@/components/ui/MinimalTools';
import { SimplePage } from '@/components/ui/SimplePage';

type Tool = 'pen' | 'text' | 'settings';

export default function SimpleJournalPage() {
  const [selectedTool, setSelectedTool] = useState<Tool>('pen');
  const [penColor, setPenColor] = useState('#000000');
  const [penSize, setPenSize] = useState(2);
  const [dotSize, setDotSize] = useState(1.5);
  const [dotSpacing, setDotSpacing] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Set up drawing canvas overlay
    if (canvasRef.current && !drawingCanvasRef.current) {
      const canvas = document.createElement('canvas');
      const dotGridCanvas = canvasRef.current;
      
      canvas.width = dotGridCanvas.width;
      canvas.height = dotGridCanvas.height;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'auto';
      canvas.style.width = dotGridCanvas.style.width;
      canvas.style.height = dotGridCanvas.style.height;
      canvas.style.cursor = selectedTool === 'pen' ? 'crosshair' : selectedTool === 'text' ? 'text' : 'default';
      
      dotGridCanvas.parentElement?.appendChild(canvas);
      drawingCanvasRef.current = canvas;
    }
  }, [selectedTool]);

  useEffect(() => {
    if (drawingCanvasRef.current) {
      drawingCanvasRef.current.style.cursor = 
        selectedTool === 'pen' ? 'crosshair' : 
        selectedTool === 'text' ? 'text' : 
        'default';
    }
  }, [selectedTool]);

  const startDrawing = useCallback((e: MouseEvent) => {
    if (selectedTool !== 'pen') {
      return;
    }
    setIsDrawing(true);
    
    const canvas = drawingCanvasRef.current;
    if (!canvas) {
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [selectedTool]);

  const draw = useCallback((e: MouseEvent) => {
    if (!isDrawing || selectedTool !== 'pen') {
      return;
    }
    
    const canvas = drawingCanvasRef.current;
    if (!canvas) {
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, selectedTool, penColor, penSize]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleToolChange = (tool: Tool) => {
    setSelectedTool(tool);
    if (tool === 'settings') {
      setShowSettings(!showSettings);
    }
  };

  const handleGridReady = (canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  };

  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) {
      return;
    }
    
    const handleMouseDown = (e: MouseEvent) => {
      startDrawing(e);
    };
    const handleMouseMove = (e: MouseEvent) => {
      draw(e);
    };
    const handleMouseUp = () => {
      stopDrawing();
    };
    const handleMouseLeave = () => {
      stopDrawing();
    };
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    // Touch support
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      startDrawing(mouseEvent);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      draw(mouseEvent);
    };
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleMouseUp);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleMouseUp);
    };
  }, [selectedTool, penColor, penSize, isDrawing, startDrawing, draw, stopDrawing]);

  return (
    <div className="h-screen overflow-hidden bg-neutral-100">
      {/* Minimal Tools - Always visible but small */}
      <MinimalTools
        selectedTool={selectedTool}
        onToolChange={handleToolChange}
        penColor={penColor}
        onPenColorChange={setPenColor}
        penSize={penSize}
        onPenSizeChange={setPenSize}
        dotSize={dotSize}
        onDotSizeChange={setDotSize}
        dotSpacing={dotSpacing}
        onDotSpacingChange={setDotSpacing}
        showSettings={showSettings}
        onSettingsToggle={() => setShowSettings(!showSettings)}
      />

      {/* Main Content - Just the journal page */}
      <div className="h-full flex items-center justify-center">
        <SimplePage
          dotSize={dotSize}
          dotSpacing={dotSpacing}
          onGridReady={handleGridReady}
        />
      </div>
    </div>
  );
}