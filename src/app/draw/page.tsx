// ABOUTME: Full-screen drawing page with integrated tools and canvas
// Combines DrawingCanvas, ToolPalette, LayerPanel for complete drawing experience

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import DrawingCanvas from '@/components/canvas/DrawingCanvas';
import ToolPalette from '@/components/canvas/ToolPalette';
import LayerPanel, { Layer } from '@/components/canvas/LayerPanel';
import { useCanvas } from '@/hooks/useCanvas';
import { getBrushPresets } from '@/lib/canvas/brushes';
import { downloadCanvasAsFile } from '@/lib/canvas/canvasUtils';
import { cn } from '@/lib/utils/cn';
import { 
  Menu, 
  X, 
  Maximize2, 
  Minimize2, 
  Download, 
  Save, 
  Upload,
  Settings,
  Grid,
  Eye,
  EyeOff,
  Layers,
  Palette,
} from 'lucide-react';
import { nanoid } from 'nanoid';

interface DrawingPageState {
  showToolPalette: boolean;
  showLayerPanel: boolean;
  isFullscreen: boolean;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  canvasSize: { width: number; height: number };
  layers: Layer[];
  activeLayerId: string;
}

const INITIAL_CANVAS_SIZE = {
  width: 1200,
  height: 800,
};

const DrawPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageState, setPageState] = useState<DrawingPageState>({
    showToolPalette: true,
    showLayerPanel: true,
    isFullscreen: false,
    showGrid: false,
    gridSize: 20,
    snapToGrid: false,
    canvasSize: INITIAL_CANVAS_SIZE,
    layers: [],
    activeLayerId: '',
  });

  const {
    canvasRef,
    fabricCanvas,
    canvasManager,
    currentTool,
    brushConfig,
    isInitialized,
    canvasInfo,
    history,
    tools,
    setTool,
    updateBrushConfig,
    undo,
    redo,
    clear,
    save,
    load,
    export: exportCanvas,
    zoom,
    resetZoom,
    fitToScreen,
    initialize,
    onDrawingStart,
    onDrawingEnd,
  } = useCanvas({
    initialTool: 'pen',
    initialBrushConfig: getBrushPresets().mediumPen,
    enableAutoSave: true,
    autoSaveInterval: 30000,
    storageKey: 'drawing-canvas-state',
  });

  // Initialize default layer
  useEffect(() => {
    if (isInitialized && pageState.layers.length === 0) {
      const defaultLayer: Layer = {
        id: nanoid(),
        name: 'Background',
        visible: true,
        opacity: 1,
        locked: false,
        thumbnail: '',
        objects: [],
        index: 0,
      };
      
      setPageState(prev => ({
        ...prev,
        layers: [defaultLayer],
        activeLayerId: defaultLayer.id,
      }));
    }
  }, [isInitialized, pageState.layers.length]);

  // Update canvas size when container resizes
  useEffect(() => {
    if (!containerRef.current || !isInitialized) return;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        // Account for tool palette and layer panel
        const availableWidth = clientWidth - (pageState.showToolPalette ? 256 : 0) - (pageState.showLayerPanel ? 256 : 0);
        const availableHeight = clientHeight - 60; // Account for header
        
        setPageState(prev => ({
          ...prev,
          canvasSize: {
            width: Math.max(availableWidth, 400),
            height: Math.max(availableHeight, 300),
          },
        }));
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [isInitialized, pageState.showToolPalette, pageState.showLayerPanel]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!pageState.isFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        setPageState(prev => ({ ...prev, isFullscreen: true }));
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setPageState(prev => ({ ...prev, isFullscreen: false }));
      } catch (error) {
        console.error('Failed to exit fullscreen:', error);
      }
    }
  }, [pageState.isFullscreen]);

  // Layer management functions
  const handleLayerAdd = useCallback(() => {
    const newLayer: Layer = {
      id: nanoid(),
      name: `Layer ${pageState.layers.length + 1}`,
      visible: true,
      opacity: 1,
      locked: false,
      thumbnail: '',
      objects: [],
      index: pageState.layers.length,
    };

    setPageState(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer],
      activeLayerId: newLayer.id,
    }));
  }, [pageState.layers.length]);

  const handleLayerSelect = useCallback((layerId: string) => {
    setPageState(prev => ({ ...prev, activeLayerId: layerId }));
  }, []);

  const handleLayerVisibilityToggle = useCallback((layerId: string) => {
    setPageState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      ),
    }));
  }, []);

  const handleLayerOpacityChange = useCallback((layerId: string, opacity: number) => {
    setPageState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === layerId ? { ...layer, opacity } : layer
      ),
    }));
  }, []);

  const handleLayerLockToggle = useCallback((layerId: string) => {
    setPageState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      ),
    }));
  }, []);

  const handleLayerDelete = useCallback((layerId: string) => {
    if (pageState.layers.length <= 1) return;

    setPageState(prev => {
      const remainingLayers = prev.layers.filter(layer => layer.id !== layerId);
      const newActiveLayer = prev.activeLayerId === layerId 
        ? remainingLayers[0]?.id || ''
        : prev.activeLayerId;

      return {
        ...prev,
        layers: remainingLayers.map((layer, index) => ({ ...layer, index })),
        activeLayerId: newActiveLayer,
      };
    });
  }, [pageState.layers.length, pageState.activeLayerId]);

  const handleLayerDuplicate = useCallback((layerId: string) => {
    const layerToDuplicate = pageState.layers.find(l => l.id === layerId);
    if (!layerToDuplicate) return;

    const duplicatedLayer: Layer = {
      ...layerToDuplicate,
      id: nanoid(),
      name: `${layerToDuplicate.name} Copy`,
      index: layerToDuplicate.index + 1,
    };

    setPageState(prev => ({
      ...prev,
      layers: prev.layers
        .map(layer => layer.index > layerToDuplicate.index ? { ...layer, index: layer.index + 1 } : layer)
        .concat([duplicatedLayer])
        .sort((a, b) => a.index - b.index),
      activeLayerId: duplicatedLayer.id,
    }));
  }, [pageState.layers]);

  const handleLayerMerge = useCallback((layerId: string, targetLayerId: string) => {
    // Simplified merge - in a real implementation, you'd merge the actual canvas objects
    console.log('Merging layer', layerId, 'into', targetLayerId);
  }, []);

  const handleLayerReorder = useCallback((layerId: string, newIndex: number) => {
    setPageState(prev => {
      const layerToMove = prev.layers.find(l => l.id === layerId);
      if (!layerToMove) return prev;

      const reorderedLayers = prev.layers
        .filter(l => l.id !== layerId)
        .map(layer => {
          if (layer.index >= newIndex && layerToMove.index < newIndex) {
            return { ...layer, index: layer.index + 1 };
          } else if (layer.index <= newIndex && layerToMove.index > newIndex) {
            return { ...layer, index: layer.index - 1 };
          }
          return layer;
        });

      reorderedLayers.push({ ...layerToMove, index: newIndex });
      
      return {
        ...prev,
        layers: reorderedLayers.sort((a, b) => a.index - b.index),
      };
    });
  }, []);

  const handleLayerRename = useCallback((layerId: string, newName: string) => {
    setPageState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === layerId ? { ...layer, name: newName } : layer
      ),
    }));
  }, []);

  // File operations
  const handleSave = useCallback(async () => {
    try {
      await save();
      // TODO: Show success notification
      console.log('Canvas saved successfully');
    } catch (error) {
      console.error('Failed to save canvas:', error);
      // TODO: Show error notification
    }
  }, [save]);

  const handleLoad = useCallback(async () => {
    try {
      const success = await load();
      if (success) {
        console.log('Canvas loaded successfully');
      } else {
        console.log('No saved canvas found');
      }
    } catch (error) {
      console.error('Failed to load canvas:', error);
    }
  }, [load]);

  const handleExport = useCallback(async () => {
    if (!fabricCanvas) return;

    try {
      // Show export options modal (simplified for now)
      const format = 'png'; // Could be configurable
      const dataUrl = await exportCanvas({ format });
      
      // Download the file
      await downloadCanvasAsFile(fabricCanvas, `drawing.${format}`, { format });
      console.log('Canvas exported successfully');
    } catch (error) {
      console.error('Failed to export canvas:', error);
    }
  }, [fabricCanvas, exportCanvas]);

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    zoom(canvasInfo.zoom * 1.2);
  }, [zoom, canvasInfo.zoom]);

  const handleZoomOut = useCallback(() => {
    zoom(canvasInfo.zoom * 0.8);
  }, [zoom, canvasInfo.zoom]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        'h-screen bg-gray-100 flex flex-col overflow-hidden',
        pageState.isFullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10">
        {/* Left controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPageState(prev => ({ ...prev, showToolPalette: !prev.showToolPalette }))}
            className={cn(
              'p-2 rounded hover:bg-gray-100',
              pageState.showToolPalette && 'bg-blue-100 text-blue-600'
            )}
            title="Toggle tool palette"
          >
            <Palette size={20} />
          </button>
          
          <button
            onClick={() => setPageState(prev => ({ ...prev, showLayerPanel: !prev.showLayerPanel }))}
            className={cn(
              'p-2 rounded hover:bg-gray-100',
              pageState.showLayerPanel && 'bg-blue-100 text-blue-600'
            )}
            title="Toggle layer panel"
          >
            <Layers size={20} />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <button
            onClick={() => setPageState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
            className={cn(
              'p-2 rounded hover:bg-gray-100',
              pageState.showGrid && 'bg-blue-100 text-blue-600'
            )}
            title="Toggle grid"
          >
            <Grid size={20} />
          </button>
        </div>

        {/* Center - Canvas info */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{currentTool} tool</span>
          <span>•</span>
          <span>{Math.round(canvasInfo.zoom * 100)}% zoom</span>
          <span>•</span>
          <span>{canvasInfo.objectCount} objects</span>
          {canvasInfo.isDrawing && (
            <>
              <span>•</span>
              <span className="text-green-600 font-medium">Drawing...</span>
            </>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="p-2 rounded hover:bg-gray-100"
            title="Save canvas"
          >
            <Save size={20} />
          </button>

          <button
            onClick={handleLoad}
            className="p-2 rounded hover:bg-gray-100"
            title="Load canvas"
          >
            <Upload size={20} />
          </button>

          <button
            onClick={handleExport}
            className="p-2 rounded hover:bg-gray-100"
            title="Export canvas"
          >
            <Download size={20} />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded hover:bg-gray-100"
            title={pageState.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {pageState.isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tool Palette */}
        {pageState.showToolPalette && (
          <ToolPalette
            currentTool={currentTool}
            brushConfig={brushConfig}
            onToolChange={setTool}
            onBrushConfigChange={updateBrushConfig}
            onUndo={undo}
            onRedo={redo}
            onClear={clear}
            onSave={handleSave}
            onLoad={handleLoad}
            onExport={handleExport}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={resetZoom}
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            variant="sidebar"
          />
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col relative">
          <DrawingCanvas
            width={pageState.canvasSize.width}
            height={pageState.canvasSize.height}
            onCanvasReady={initialize}
            onDrawingStart={onDrawingStart}
            onDrawingEnd={onDrawingEnd}
            initialTool={currentTool}
            initialBrushConfig={brushConfig}
            enablePressure={true}
            enableTouch={true}
            backgroundColor="#ffffff"
            gridEnabled={pageState.showGrid}
            gridSize={pageState.gridSize}
            snapToGrid={pageState.snapToGrid}
            className="flex-1"
          />

          {/* Floating toolbar for mobile */}
          {!pageState.showToolPalette && (
            <div className="absolute top-4 left-4 z-10">
              <ToolPalette
                currentTool={currentTool}
                brushConfig={brushConfig}
                onToolChange={setTool}
                onBrushConfigChange={updateBrushConfig}
                onUndo={undo}
                onRedo={redo}
                canUndo={history.canUndo}
                canRedo={history.canRedo}
                variant="toolbar"
                className="shadow-lg"
              />
            </div>
          )}
        </div>

        {/* Layer Panel */}
        {pageState.showLayerPanel && (
          <LayerPanel
            layers={pageState.layers}
            activeLayerId={pageState.activeLayerId}
            onLayerSelect={handleLayerSelect}
            onLayerVisibilityToggle={handleLayerVisibilityToggle}
            onLayerOpacityChange={handleLayerOpacityChange}
            onLayerLockToggle={handleLayerLockToggle}
            onLayerDelete={handleLayerDelete}
            onLayerAdd={handleLayerAdd}
            onLayerDuplicate={handleLayerDuplicate}
            onLayerMerge={handleLayerMerge}
            onLayerReorder={handleLayerReorder}
            onLayerRename={handleLayerRename}
            canvas={fabricCanvas}
          />
        )}
      </div>
    </div>
  );
};

export default DrawPage;