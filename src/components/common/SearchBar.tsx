// ABOUTME: Universal search component with full-text search and filtering
// Features keyboard navigation, search history, and type-specific filtering

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Clock,
  Filter,
  Calendar,
  BookOpen,
  PenTool,
  Hash,
  ArrowRight,
  History,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'journal' | 'drawing' | 'note' | 'task';
  date: Date;
  url: string;
  preview?: string;
}

export interface SearchFilter {
  type?: 'journal' | 'drawing' | 'note' | 'task';
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
  className?: string;
  onResultSelect?: (result: SearchResult) => void;
}

export function SearchBar({
  isOpen,
  onClose,
  placeholder = "Search entries...",
  className,
  onResultSelect,
}: SearchBarProps) {
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [filters, setFilters] = React.useState<SearchFilter>({});
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [showFilters, setShowFilters] = React.useState(false);
  
  const inputRef = React.useRef<HTMLInputElement>(null);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Reset state when search opens
  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setResults([]);
      setShowFilters(false);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Mock search function - replace with actual search implementation
  const performSearch = React.useCallback(async (searchQuery: string, searchFilters: SearchFilter) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Mock results - replace with actual search logic
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'Morning Pages',
        content: 'Started the day with coffee and reflection...',
        type: 'journal',
        date: new Date('2024-01-15'),
        url: '/journal/2024-01-15',
        preview: 'Started the day with coffee and reflection on goals...',
      },
      {
        id: '2',
        title: 'Project Sketches',
        content: 'Initial wireframes for the new app design',
        type: 'drawing',
        date: new Date('2024-01-14'),
        url: '/draw/project-sketches',
        preview: 'Initial wireframes and user flow diagrams...',
      },
      {
        id: '3',
        title: 'Meeting Notes',
        content: 'Weekly team sync notes and action items',
        type: 'note',
        date: new Date('2024-01-13'),
        url: '/journal/meeting-notes',
        preview: 'Discussed project timeline and deliverables...',
      },
    ].filter(result => {
      const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          result.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = !searchFilters.type || result.type === searchFilters.type;
      
      const matchesDate = !searchFilters.dateRange || 
                         (result.date >= searchFilters.dateRange.start && 
                          result.date <= searchFilters.dateRange.end);
      
      return matchesQuery && matchesType && matchesDate;
    });

    setResults(mockResults);
    setIsLoading(false);
  }, []);

  // Debounced search
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query, filters);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, filters, performSearch]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          event.preventDefault();
          if (results[selectedIndex]) {
            handleResultSelect(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Reset selected index when results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleResultSelect = (result: SearchResult) => {
    // Add to recent searches
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
    }
    
    onResultSelect?.(result);
    onClose();
  };

  const handleRecentSearchSelect = (search: string) => {
    setQuery(search);
    inputRef.current?.focus();
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'journal': return <BookOpen className="h-4 w-4" />;
      case 'drawing': return <PenTool className="h-4 w-4" />;
      case 'note': return <Hash className="h-4 w-4" />;
      case 'task': return <Hash className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    }).format(date);
  };

  const activeFiltersCount = Object.keys(filters).filter(key => filters[key as keyof SearchFilter]).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Search Modal */}
          <div className="fixed left-1/2 top-1/4 z-50 w-full max-w-2xl -translate-x-1/2">
            <motion.div
              className="overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
            >
              {/* Header */}
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  ref={inputRef}
                  className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={placeholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "h-8 w-8",
                      (showFilters || activeFiltersCount > 0) && "text-primary"
                    )}
                    title="Filters"
                  >
                    <Filter className="h-4 w-4" />
                    {activeFiltersCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    className="border-b bg-muted/30 p-3"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">Filter by:</span>
                      
                      {/* Type Filter */}
                      <select
                        className="rounded border bg-background px-2 py-1 text-sm"
                        value={filters.type || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          type: e.target.value as any || undefined
                        }))}
                      >
                        <option value="">All types</option>
                        <option value="journal">Journal</option>
                        <option value="drawing">Drawing</option>
                        <option value="note">Note</option>
                        <option value="task">Task</option>
                      </select>
                      
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="h-7 px-2 text-xs"
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {query.trim() === '' && recentSearches.length > 0 && (
                  <div className="p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <History className="h-3 w-3" />
                      Recent searches
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-accent"
                          onClick={() => handleRecentSearchSelect(search)}
                        >
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-center justify-center p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Searching...
                    </div>
                  </div>
                )}

                {!isLoading && query.trim() !== '' && results.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-6">
                    <Search className="h-6 w-6 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No results found for "{query}"
                    </p>
                  </div>
                )}

                {!isLoading && results.length > 0 && (
                  <div className="p-1">
                    {results.map((result, index) => {
                      const isSelected = index === selectedIndex;
                      
                      return (
                        <motion.div
                          key={result.id}
                          className={cn(
                            'flex items-start gap-3 rounded-md p-3 cursor-pointer',
                            isSelected && 'bg-accent'
                          )}
                          onClick={() => handleResultSelect(result)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                            {getTypeIcon(result.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium truncate">{result.title}</h3>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(result.date)}
                              </span>
                            </div>
                            {result.preview && (
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                {result.preview}
                              </p>
                            )}
                          </div>
                          
                          {isSelected && (
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {(results.length > 0 || query.trim() !== '') && (
                <div className="border-t px-3 py-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                        ↑↓
                      </kbd>
                      <span>navigate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                        ↵
                      </kbd>
                      <span>open</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                        ESC
                      </kbd>
                      <span>close</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}