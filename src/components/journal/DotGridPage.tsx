// ABOUTME: Full page dot grid component with realistic journal page features
// Supports multiple pages, page numbers, and standard paper sizes

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { DotGrid } from './DotGrid';
import { 
  GridConfig, 
  PageSize, 
  PAGE_SIZES, 
  GRID_PRESETS,
  GridType 
} from '@/lib/constants/grid-config';
import { ChevronLeft, ChevronRight, FileText, Settings2 } from 'lucide-react';

interface DotGridPageProps {
  initialConfig?: GridConfig;
  pageSize?: PageSize;
  showPageNumbers?: boolean;
  showPageShadow?: boolean;
  enableInfiniteScroll?: boolean;
  onConfigChange?: (config: GridConfig) => void;
  onGridReady?: (canvas: HTMLCanvasElement) => void;
  className?: string;
}

export function DotGridPage({
  initialConfig = GRID_PRESETS.standard5mm,
  pageSize = 'A4',
  showPageNumbers = true,
  showPageShadow = true,
  enableInfiniteScroll = false,
  onConfigChange,
  onGridReady,
  className,
}: DotGridPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [config, setConfig] = useState<GridConfig>(initialConfig);
  const [showSettings, setShowSettings] = useState(false);
  const [zoom, setZoom] = useState(1);

  const pageSize_px = PAGE_SIZES[pageSize];
  const pageWidth = pageSize_px.width;
  const pageHeight = pageSize_px.height;

  useEffect(() => {
    // Calculate total pages based on content or set a default
    if (enableInfiniteScroll) {
      setTotalPages(100); // Arbitrary large number for infinite scroll
    } else {
      setTotalPages(5); // Default to 5 pages
    }
  }, [enableInfiniteScroll]);

  const handleConfigUpdate = (newConfig: Partial<GridConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    if (onConfigChange) {
      onConfigChange(updated);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      
      // Smooth scroll to page
      if (containerRef.current) {
        const pageElement = containerRef.current.querySelector(`[data-page="${page}"]`);
        if (pageElement) {
          pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.5, Math.min(2, zoom + delta));
    setZoom(newZoom);
  };

  return (
    <div className={cn('relative h-full overflow-hidden bg-neutral-100 dark:bg-neutral-900', className)}>
      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-neutral-800 shadow-2xl z-20 overflow-y-auto"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
                Grid Settings
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  ×
                </button>
              </h3>

              {/* Grid Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Grid Type</label>
                <select
                  value={config.gridType}
                  onChange={(e) => handleConfigUpdate({ gridType: e.target.value as GridType })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
                >
                  <option value={GridType.DOTS}>Dot Grid</option>
                  <option value={GridType.LINES}>Ruled Lines</option>
                  <option value={GridType.GRAPH}>Graph Paper</option>
                  <option value={GridType.ISOMETRIC}>Isometric</option>
                  <option value={GridType.BLANK}>Blank</option>
                </select>
              </div>

              {/* Spacing Presets */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Spacing Preset</label>
                <div className="space-y-2">
                  {Object.entries(GRID_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => setConfig(preset)}
                      className={cn(
                        'w-full px-3 py-2 text-left rounded-lg border transition-colors',
                        config.spacing === preset.spacing
                          ? 'bg-primary-50 border-primary-300 dark:bg-primary-900/20 dark:border-primary-700'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-600'
                      )}
                    >
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {preset.spacing}px spacing
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Spacing */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Custom Spacing ({config.spacing}px)
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={config.spacing}
                  onChange={(e) => handleConfigUpdate({ spacing: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Dot/Line Settings */}
              {config.gridType === GridType.DOTS && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Dot Size ({config.dotSize}px)
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={config.dotSize}
                      onChange={(e) => handleConfigUpdate({ dotSize: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Dot Opacity ({Math.round(config.dotOpacity * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={config.dotOpacity}
                      onChange={(e) => handleConfigUpdate({ dotOpacity: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Dot Color</label>
                    <input
                      type="color"
                      value={config.dotColor}
                      onChange={(e) => handleConfigUpdate({ dotColor: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* Paper Settings */}
              <div className="mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.paperTexture}
                    onChange={(e) => handleConfigUpdate({ paperTexture: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Paper Texture</span>
                </label>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.showMarginLines}
                    onChange={(e) => handleConfigUpdate({ showMarginLines: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Show Margin Lines</span>
                </label>
              </div>

              {/* Background Color */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Background Color</label>
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => handleConfigUpdate({ backgroundColor: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div 
        ref={containerRef}
        className="h-full overflow-auto scrollbar-thin scrollbar-thumb-neutral-400 dark:scrollbar-thumb-neutral-600"
        style={{
          backgroundColor: '#f5f5f5',
        }}
      >
        <div className="flex flex-col items-center py-12 px-4">
          {/* Pages */}
          {Array.from({ length: enableInfiniteScroll ? 10 : totalPages }, (_, i) => i + 1).map((pageNum) => (
            <motion.div
              key={pageNum}
              data-page={pageNum}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pageNum * 0.05 }}
              className={cn(
                'relative mb-8',
                showPageShadow && 'shadow-2xl'
              )}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
              }}
            >
              {/* Page Container */}
              <div className="relative overflow-hidden rounded-sm">
                <DotGrid
                  config={config}
                  width={pageWidth}
                  height={pageHeight}
                  showMargins={true}
                  className="bg-white"
                  onReady={onGridReady}
                />

                {/* Page Number */}
                {showPageNumbers && (
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-neutral-400">
                    {pageNum}
                  </div>
                )}

                {/* Page Date Header (optional) */}
                <div className="absolute top-8 right-12 text-sm text-neutral-400">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white dark:bg-neutral-800 rounded-full shadow-xl px-6 py-3">
        {/* Page Navigation */}
        {!enableInfiniteScroll && (
          <>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-600" />
          </>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom(-0.1)}
            className="px-3 py-1 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            -
          </button>
          <span className="text-sm font-medium w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.1)}
            className="px-3 py-1 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            +
          </button>
        </div>

        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-600" />

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            'p-2 rounded-full transition-colors',
            showSettings 
              ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
          )}
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}