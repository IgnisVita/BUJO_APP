// ABOUTME: Layer management panel with thumbnails, visibility, opacity, and reordering
// Provides professional layer control for complex drawings

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Plus, 
  ChevronUp, 
  ChevronDown,
  Copy,
  Merge,
  Settings,
} from 'lucide-react';
import * as fabric from 'fabric';
import { cn } from '@/lib/utils/cn';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  locked: boolean;
  thumbnail: string;
  objects: fabric.Object[];
  blendMode?: string;
  index: number;
}

export interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onLayerSelect: (layerId: string) => void;
  onLayerVisibilityToggle: (layerId: string) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  onLayerLockToggle: (layerId: string) => void;
  onLayerDelete: (layerId: string) => void;
  onLayerAdd: () => void;
  onLayerDuplicate: (layerId: string) => void;
  onLayerMerge: (layerId: string, targetLayerId: string) => void;
  onLayerReorder: (layerId: string, newIndex: number) => void;
  onLayerRename: (layerId: string, newName: string) => void;
  canvas?: fabric.Canvas;
  className?: string;
}

const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerVisibilityToggle,
  onLayerOpacityChange,
  onLayerLockToggle,
  onLayerDelete,
  onLayerAdd,
  onLayerDuplicate,
  onLayerMerge,
  onLayerReorder,
  onLayerRename,
  canvas,
  className,
}) => {
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [showBlendModes, setShowBlendModes] = useState(false);
  const dragOverLayerId = useRef<string | null>(null);

  // Generate thumbnail for layer
  const generateThumbnail = useCallback((layer: Layer): string => {
    if (!canvas) return '';

    try {
      // Create a temporary canvas for the layer
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 100;
      tempCanvas.height = 100;
      const tempCtx = tempCanvas.getContext('2d')!;

      // Scale down the layer content
      const scaleX = 100 / canvas.getWidth();
      const scaleY = 100 / canvas.getHeight();
      const scale = Math.min(scaleX, scaleY);

      tempCtx.scale(scale, scale);

      // Draw layer objects
      layer.objects.forEach(obj => {
        if (obj.visible !== false) {
          obj.render(tempCtx);
        }
      });

      return tempCanvas.toDataURL();
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      return '';
    }
  }, [canvas]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, layerId: string) => {
    setDraggedLayerId(layerId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', layerId);
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    dragOverLayerId.current = layerId;
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();
    
    if (draggedLayerId && draggedLayerId !== targetLayerId) {
      const targetLayer = layers.find(l => l.id === targetLayerId);
      if (targetLayer) {
        onLayerReorder(draggedLayerId, targetLayer.index);
      }
    }
    
    setDraggedLayerId(null);
    dragOverLayerId.current = null;
  }, [draggedLayerId, layers, onLayerReorder]);

  // Handle layer rename
  const handleLayerRename = useCallback((layerId: string, newName: string) => {
    if (newName.trim() && newName !== layers.find(l => l.id === layerId)?.name) {
      onLayerRename(layerId, newName.trim());
    }
    setEditingLayerId(null);
  }, [layers, onLayerRename]);

  // Layer item component
  const LayerItem: React.FC<{ layer: Layer }> = ({ layer }) => {
    const [localOpacity, setLocalOpacity] = useState(layer.opacity);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleOpacityChange = useCallback((value: number) => {
      setLocalOpacity(value);
    }, []);

    const handleOpacityCommit = useCallback((value: number) => {
      onLayerOpacityChange(layer.id, value);
    }, [layer.id, onLayerOpacityChange]);

    const isActive = layer.id === activeLayerId;
    const isDragged = draggedLayerId === layer.id;
    const isDragOver = dragOverLayerId.current === layer.id;

    return (
      <div
        className={cn(
          'group border border-gray-200 rounded-lg mb-2 transition-all',
          isActive && 'border-blue-300 bg-blue-50',
          isDragged && 'opacity-50',
          isDragOver && 'border-blue-500 bg-blue-100'
        )}
        draggable
        onDragStart={(e) => handleDragStart(e, layer.id)}
        onDragOver={(e) => handleDragOver(e, layer.id)}
        onDrop={(e) => handleDrop(e, layer.id)}
      >
        {/* Main layer row */}
        <div 
          className="flex items-center p-2 cursor-pointer"
          onClick={() => onLayerSelect(layer.id)}
        >
          {/* Thumbnail */}
          <div className="w-12 h-12 bg-gray-100 border rounded mr-3 flex-shrink-0 overflow-hidden">
            {layer.thumbnail ? (
              <img 
                src={layer.thumbnail} 
                alt={layer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                Empty
              </div>
            )}
          </div>

          {/* Layer info */}
          <div className="flex-1 min-w-0">
            {editingLayerId === layer.id ? (
              <input
                type="text"
                defaultValue={layer.name}
                className="w-full px-2 py-1 text-sm border rounded"
                autoFocus
                onBlur={(e) => handleLayerRename(layer.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLayerRename(layer.id, e.currentTarget.value);
                  } else if (e.key === 'Escape') {
                    setEditingLayerId(null);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div
                className="text-sm font-medium truncate"
                onDoubleClick={() => setEditingLayerId(layer.id)}
              >
                {layer.name}
              </div>
            )}
            <div className="text-xs text-gray-500">
              {layer.objects.length} objects
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 ml-2">
            {/* Visibility toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLayerVisibilityToggle(layer.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title={layer.visible ? 'Hide layer' : 'Show layer'}
            >
              {layer.visible ? (
                <Eye size={16} className="text-gray-600" />
              ) : (
                <EyeOff size={16} className="text-gray-400" />
              )}
            </button>

            {/* Lock toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLayerLockToggle(layer.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title={layer.locked ? 'Unlock layer' : 'Lock layer'}
            >
              {layer.locked ? (
                <Lock size={16} className="text-gray-600" />
              ) : (
                <Unlock size={16} className="text-gray-400" />
              )}
            </button>

            {/* Expand button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Settings size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Expanded controls */}
        {isExpanded && (
          <div className="px-2 pb-2 border-t border-gray-200 bg-gray-50 space-y-3">
            {/* Opacity slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">
                  Opacity
                </label>
                <span className="text-xs text-gray-500">
                  {Math.round(localOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={localOpacity}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                onMouseUp={(e) => handleOpacityCommit(Number((e.target as HTMLInputElement).value))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Layer actions */}
            <div className="flex gap-1">
              <button
                onClick={() => onLayerDuplicate(layer.id)}
                className="flex-1 flex items-center justify-center gap-1 py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                title="Duplicate layer"
              >
                <Copy size={12} />
                Duplicate
              </button>
              
              <button
                onClick={() => {
                  const targetLayer = layers.find(l => l.index === layer.index + 1);
                  if (targetLayer) {
                    onLayerMerge(layer.id, targetLayer.id);
                  }
                }}
                disabled={layer.index >= layers.length - 1}
                className="flex-1 flex items-center justify-center gap-1 py-1 px-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs"
                title="Merge down"
              >
                <Merge size={12} />
                Merge
              </button>
              
              <button
                onClick={() => onLayerDelete(layer.id)}
                disabled={layers.length <= 1}
                className="flex items-center justify-center gap-1 py-1 px-2 bg-red-100 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs text-red-700"
                title="Delete layer"
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Move buttons */}
            <div className="flex gap-1">
              <button
                onClick={() => onLayerReorder(layer.id, layer.index - 1)}
                disabled={layer.index <= 0}
                className="flex-1 flex items-center justify-center gap-1 py-1 px-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs"
                title="Move up"
              >
                <ChevronUp size={12} />
                Up
              </button>
              
              <button
                onClick={() => onLayerReorder(layer.id, layer.index + 1)}
                disabled={layer.index >= layers.length - 1}
                className="flex-1 flex items-center justify-center gap-1 py-1 px-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs"
                title="Move down"
              >
                <ChevronDown size={12} />
                Down
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('w-64 bg-white border-l border-gray-200 flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Layers</h2>
          <button
            onClick={onLayerAdd}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            title="Add new layer"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto p-3">
        {layers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <p className="text-sm mb-2">No layers</p>
            <button
              onClick={onLayerAdd}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
            >
              Create Layer
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {[...layers]
              .sort((a, b) => b.index - a.index) // Show top layers first
              .map((layer) => (
                <LayerItem key={layer.id} layer={layer} />
              ))}
          </div>
        )}
      </div>

      {/* Footer with layer count */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 text-center">
          {layers.length} layer{layers.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default LayerPanel;