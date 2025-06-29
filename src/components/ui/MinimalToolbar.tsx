// ABOUTME: Minimal toolbar for journal with essential tools only
// Features pen, text, templates, grid settings, and page navigation

'use client';

import { 
  PenTool, 
  Type, 
  FileText,
  Settings2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MinimalToolbarProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onToolSelect?: (tool: string) => void;
  selectedTool?: string;
  className?: string;
}

export function MinimalToolbar({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onToolSelect,
  selectedTool = 'pen',
  className
}: MinimalToolbarProps) {
  return (
    <div className={cn(
      "fixed top-4 left-1/2 -translate-x-1/2 z-30",
      "bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm",
      "rounded-full shadow-sm border border-neutral-200/50 dark:border-neutral-800/50",
      "px-4 py-2 flex items-center gap-2",
      className
    )}>
      {/* Main Tools */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onToolSelect?.('pen')}
          className={cn(
            "p-2 rounded-full transition-colors",
            selectedTool === 'pen'
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
          )}
          title="Pen"
        >
          <PenTool className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onToolSelect?.('text')}
          className={cn(
            "p-2 rounded-full transition-colors",
            selectedTool === 'text'
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
          )}
          title="Text"
        >
          <Type className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

      {/* Quick Actions */}
      <button
        onClick={() => onToolSelect?.('templates')}
        className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        title="Templates"
      >
        <FileText className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => onToolSelect?.('settings')}
        className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        title="Grid Settings"
      >
        <Settings2 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className={cn(
            "p-1 rounded transition-colors",
            currentPage <= 1
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <span className="text-sm text-neutral-600 dark:text-neutral-400 min-w-[60px] text-center">
          {currentPage} / {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className={cn(
            "p-1 rounded transition-colors",
            currentPage >= totalPages
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}