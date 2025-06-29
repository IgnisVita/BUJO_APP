// ABOUTME: Demo page for the grid customization system
// Shows all customization features in action

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Square, Ruler as RulerIcon, Save, Undo, Redo } from 'lucide-react';
import { 
  GridConfig, 
  Box, 
  defaultGridConfig, 
  defaultSnapSettings,
  defaultRulerSettings,
  GridCustomizationState,
  RulerSettings,
  SnapSettings
} from '@/types/grid';
import { GridCustomizer } from '@/components/journal/GridCustomizer';
import { BoxDrawingTool, BoxStyleEditor } from '@/components/journal/BoxDrawingTool';
import { GridRuler, AlignmentGuides } from '@/components/journal/GridRuler';
import { useGridSnap } from '@/hooks/useGridSnap';
import { getGridPointsInBounds, getBoxAlignmentGuides } from '@/lib/grid/grid-math';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

export default function GridCustomizerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [state, setState] = useState<GridCustomizationState>({
    config: defaultGridConfig,
    presets: [],
    snapSettings: defaultSnapSettings,
    rulerSettings: defaultRulerSettings,
    alignmentGuides: [],
    boxes: [],
    selectedBoxId: undefined,
    copiedBox: undefined,
  });

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [showTools, setShowTools] = useState({
    customizer: true,
    boxTool: true,
    ruler: false,
  });

  // History for undo/redo
  const [history, setHistory] = useState<GridCustomizationState[]>([state]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Use grid snap hook
  const { snapIndicator } = useGridSnap({
    gridConfig: state.config,
    snapSettings: state.snapSettings,
  });

  // Update canvas size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: containerRef.current.clientWidth,
          height: 600, // Fixed height for demo
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Draw grid on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Set paper background
    ctx.fillStyle = state.config.paperColor;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Apply paper texture
    if (state.config.paperTexture !== 'smooth') {
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = '#000000';
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvasSize.width;
        const y = Math.random() * canvasSize.height;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
      }
      ctx.globalAlpha = 1;
    }

    // Draw margins
    if (state.config.showMargins) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        state.config.marginSize,
        state.config.marginSize,
        canvasSize.width - 2 * state.config.marginSize,
        canvasSize.height - 2 * state.config.marginSize
      );
      ctx.setLineDash([]);
    }

    // Draw grid
    const gridPoints = getGridPointsInBounds(
      0,
      0,
      canvasSize.width,
      canvasSize.height,
      state.config.spacing,
      state.config.type
    );

    ctx.fillStyle = state.config.color;
    ctx.strokeStyle = state.config.color;
    ctx.globalAlpha = state.config.opacity;

    switch (state.config.type) {
      case 'dots':
        gridPoints.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, state.config.dotSize / 2, 0, Math.PI * 2);
          ctx.fill();
        });
        break;

      case 'lines':
        // Horizontal lines only
        const uniqueYs = [...new Set(gridPoints.map(p => p.y))];
        uniqueYs.forEach(y => {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvasSize.width, y);
          ctx.stroke();
        });
        break;

      case 'grid':
        // Draw grid lines
        const uniqueXs = [...new Set(gridPoints.map(p => p.x))];
        const uniqueYsGrid = [...new Set(gridPoints.map(p => p.y))];
        
        ctx.lineWidth = 1;
        uniqueXs.forEach(x => {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvasSize.height);
          ctx.stroke();
        });
        uniqueYsGrid.forEach(y => {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvasSize.width, y);
          ctx.stroke();
        });
        break;

      case 'isometric':
        // Simplified isometric grid
        ctx.lineWidth = 1;
        const angle = 30 * Math.PI / 180;
        for (let i = -50; i < 50; i++) {
          const y = i * state.config.spacing;
          
          // 30-degree lines
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvasSize.width, y + canvasSize.width * Math.tan(angle));
          ctx.stroke();
          
          // -30-degree lines
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvasSize.width, y - canvasSize.width * Math.tan(angle));
          ctx.stroke();
        }
        break;

      case 'hexagonal':
        // Draw hexagonal points
        gridPoints.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
    }

    ctx.globalAlpha = 1;

    // Draw page edges
    if (state.config.showPageEdges) {
      ctx.strokeStyle = state.config.pageEdgeColor;
      ctx.lineWidth = 1;
      
      switch (state.config.pageEdgeStyle) {
        case 'dashed':
          ctx.setLineDash([10, 5]);
          break;
        case 'dotted':
          ctx.setLineDash([2, 3]);
          break;
        case 'double':
          ctx.setLineDash([]);
          ctx.strokeRect(2, 2, canvasSize.width - 4, canvasSize.height - 4);
          ctx.strokeRect(6, 6, canvasSize.width - 12, canvasSize.height - 12);
          return;
      }
      
      ctx.strokeRect(0.5, 0.5, canvasSize.width - 1, canvasSize.height - 1);
      ctx.setLineDash([]);
    }
  }, [state.config, canvasSize]);

  // Handle state updates with history
  const updateState = (updates: Partial<GridCustomizationState>) => {
    const newState = { ...state, ...updates };
    setState(newState);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setState(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setState(history[historyIndex + 1]);
    }
  };

  // Box management handlers
  const handleBoxCreate = (box: Box) => {
    updateState({
      boxes: [...state.boxes, box],
      selectedBoxId: box.id,
    });
  };

  const handleBoxUpdate = (id: string, updates: Partial<Box>) => {
    updateState({
      boxes: state.boxes.map(box => 
        box.id === id ? { ...box, ...updates } : box
      ),
    });
  };

  const handleBoxDelete = (id: string) => {
    updateState({
      boxes: state.boxes.filter(box => box.id !== id),
      selectedBoxId: state.selectedBoxId === id ? undefined : state.selectedBoxId,
    });
  };

  const handleBoxCopy = (box: Box) => {
    const newBox: Box = {
      ...box,
      id: `box-${Date.now()}`,
      x: box.x + state.config.spacing,
      y: box.y + state.config.spacing,
    };
    handleBoxCreate(newBox);
  };

  // Calculate alignment guides
  const alignmentGuides = state.selectedBoxId
    ? getBoxAlignmentGuides(
        state.boxes.find(b => b.id === state.selectedBoxId)!,
        state.boxes.filter(b => b.id !== state.selectedBoxId)
      )
    : { horizontal: [], vertical: [] };

  const selectedBox = state.boxes.find(b => b.id === state.selectedBoxId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Grid Customization System
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Personalize your digital journal with customizable grids, boxes, and layouts
          </p>
        </div>

        {/* Toolbar */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={showTools.customizer ? 'default' : 'outline'}
                onClick={() => setShowTools({ ...showTools, customizer: !showTools.customizer })}
              >
                <Settings className="w-4 h-4 mr-2" />
                Customizer
              </Button>
              <Button
                size="sm"
                variant={showTools.boxTool ? 'default' : 'outline'}
                onClick={() => setShowTools({ ...showTools, boxTool: !showTools.boxTool })}
              >
                <Square className="w-4 h-4 mr-2" />
                Box Tool
              </Button>
              <Button
                size="sm"
                variant={showTools.ruler ? 'default' : 'outline'}
                onClick={() => setShowTools({ ...showTools, ruler: !showTools.ruler })}
              >
                <RulerIcon className="w-4 h-4 mr-2" />
                Ruler
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleUndo}
                disabled={historyIndex === 0}
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRedo}
                disabled={historyIndex === history.length - 1}
              >
                <Redo className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const dataStr = JSON.stringify(state, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                  const link = document.createElement('a');
                  link.href = dataUri;
                  link.download = 'grid-config.json';
                  link.click();
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Customizer */}
          {showTools.customizer && (
            <div className="lg:col-span-1">
              <GridCustomizer
                config={state.config}
                onConfigChange={(config) => updateState({ config })}
                customPresets={state.presets}
                onPresetSave={(preset) => updateState({ presets: [...state.presets, preset] })}
                onPresetDelete={(id) => updateState({ presets: state.presets.filter(p => p.id !== id) })}
              />
            </div>
          )}

          {/* Main Canvas Area */}
          <div className={cn(
            'relative',
            showTools.customizer && showTools.boxTool ? 'lg:col-span-2' : 'lg:col-span-3'
          )}>
            <Card className="relative overflow-hidden" ref={containerRef}>
              {/* Canvas */}
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="absolute inset-0"
              />

              {/* Rulers */}
              {showTools.ruler && (
                <GridRuler
                  width={canvasSize.width}
                  height={canvasSize.height}
                  gridConfig={state.config}
                  rulerSettings={state.rulerSettings}
                  className="absolute inset-0"
                />
              )}

              {/* Alignment Guides */}
              <AlignmentGuides
                guides={alignmentGuides}
                width={canvasSize.width}
                height={canvasSize.height}
              />

              {/* Box Drawing Tool */}
              <BoxDrawingTool
                gridConfig={state.config}
                snapSettings={state.snapSettings}
                boxes={state.boxes}
                selectedBoxId={state.selectedBoxId}
                onBoxCreate={handleBoxCreate}
                onBoxUpdate={handleBoxUpdate}
                onBoxDelete={handleBoxDelete}
                onBoxSelect={(id) => updateState({ selectedBoxId: id })}
                onBoxCopy={handleBoxCopy}
                canvasWidth={canvasSize.width}
                canvasHeight={canvasSize.height}
              />

              {/* Snap Indicator */}
              {snapIndicator && (
                <div
                  className="absolute w-4 h-4 -ml-2 -mt-2 pointer-events-none"
                  style={{
                    left: snapIndicator.x,
                    top: snapIndicator.y,
                  }}
                >
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping" />
                  <div className="absolute inset-0 bg-blue-500 rounded-full" />
                </div>
              )}
            </Card>
          </div>

          {/* Right Sidebar - Box Properties */}
          {showTools.boxTool && (
            <div className="lg:col-span-1">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Box Tool</h3>
                
                {selectedBox ? (
                  <BoxStyleEditor
                    box={selectedBox}
                    onUpdate={(updates) => handleBoxUpdate(selectedBox.id, updates)}
                    onDelete={() => handleBoxDelete(selectedBox.id)}
                    onCopy={() => handleBoxCopy(selectedBox)}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Square className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Click and drag to draw a box</p>
                    <p className="text-xs mt-2">Boxes will snap to grid points</p>
                  </div>
                )}

                {/* Snap Settings */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-sm mb-3">Snap Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={state.snapSettings.enabled}
                        onChange={(e) => updateState({
                          snapSettings: { ...state.snapSettings, enabled: e.target.checked }
                        })}
                        className="rounded"
                      />
                      <span className="text-sm">Enable Snap to Grid</span>
                    </label>
                    
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">
                        Snap Sensitivity: {state.snapSettings.sensitivity}px
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        value={state.snapSettings.sensitivity}
                        onChange={(e) => updateState({
                          snapSettings: { ...state.snapSettings, sensitivity: parseInt(e.target.value) }
                        })}
                        className="w-full"
                        disabled={!state.snapSettings.enabled}
                      />
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={state.snapSettings.showIndicators}
                        onChange={(e) => updateState({
                          snapSettings: { ...state.snapSettings, showIndicators: e.target.checked }
                        })}
                        className="rounded"
                        disabled={!state.snapSettings.enabled}
                      />
                      <span className="text-sm">Show Snap Indicators</span>
                    </label>
                  </div>
                </div>

                {/* Ruler Settings */}
                {showTools.ruler && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-sm mb-3">Ruler Settings</h4>
                    <div className="space-y-3">
                      <select
                        value={state.rulerSettings.unit}
                        onChange={(e) => updateState({
                          rulerSettings: { ...state.rulerSettings, unit: e.target.value as any }
                        })}
                        className="w-full px-2 py-1 text-sm border rounded"
                      >
                        <option value="px">Pixels</option>
                        <option value="mm">Millimeters</option>
                        <option value="grid">Grid Units</option>
                      </select>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Instructions */}
        <Card className="mt-6 p-6">
          <h3 className="font-semibold mb-3">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Grid Customization</h4>
              <ul className="space-y-1">
                <li>• Choose from 5 grid types</li>
                <li>• Adjust spacing (3-10mm)</li>
                <li>• Customize colors and opacity</li>
                <li>• Apply paper textures</li>
                <li>• Save custom presets</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Box Drawing</h4>
              <ul className="space-y-1">
                <li>• Click and drag to draw boxes</li>
                <li>• Boxes snap to grid points</li>
                <li>• Resize with corner handles</li>
                <li>• Customize borders and fills</li>
                <li>• Copy/paste boxes (Ctrl+C)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Keyboard Shortcuts</h4>
              <ul className="space-y-1">
                <li>• Delete: Remove selected box</li>
                <li>• Ctrl+C: Copy selected box</li>
                <li>• Ctrl+L: Lock/unlock box</li>
                <li>• Ctrl+Z: Undo</li>
                <li>• Ctrl+Y: Redo</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};