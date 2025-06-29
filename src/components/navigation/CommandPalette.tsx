// ABOUTME: Command palette for quick actions and navigation (Cmd+K)
// Features fuzzy search, keyboard navigation, and contextual commands

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  PenTool,
  BarChart3,
  Settings,
  Calendar,
  Clock,
  Calculator,
  Plus,
  Hash,
  FileText,
  Image,
  Zap,
  ArrowRight,
  Command,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'actions' | 'tools' | 'recent';
  keywords?: string[];
  shortcut?: string;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onTimerOpen?: () => void;
  onCalculatorOpen?: () => void;
}

export function CommandPalette({ 
  isOpen, 
  onClose, 
  onTimerOpen, 
  onCalculatorOpen 
}: CommandPaletteProps) {
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Reset state when palette opens
  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Available commands
  const allCommands: Command[] = React.useMemo(() => [
    // Navigation
    {
      id: 'nav-journal',
      title: 'Open Journal',
      subtitle: 'Daily entries and rapid logging',
      icon: <BookOpen className="h-4 w-4" />,
      action: () => router.push('/journal'),
      category: 'navigation',
      keywords: ['journal', 'daily', 'entries', 'log'],
      shortcut: '⌘J',
    },
    {
      id: 'nav-draw',
      title: 'Open Drawing Canvas',
      subtitle: 'Digital drawing and sketching',
      icon: <PenTool className="h-4 w-4" />,
      action: () => router.push('/draw'),
      category: 'navigation',
      keywords: ['draw', 'canvas', 'sketch', 'art'],
      shortcut: '⌘D',
    },
    {
      id: 'nav-dashboard',
      title: 'Open Dashboard',
      subtitle: 'Analytics and insights',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => router.push('/dashboard'),
      category: 'navigation',
      keywords: ['dashboard', 'analytics', 'stats', 'insights'],
      shortcut: '⌘B',
    },
    {
      id: 'nav-settings',
      title: 'Open Settings',
      subtitle: 'App preferences and configuration',
      icon: <Settings className="h-4 w-4" />,
      action: () => router.push('/settings'),
      category: 'navigation',
      keywords: ['settings', 'preferences', 'config'],
      shortcut: '⌘,',
    },

    // Quick Actions
    {
      id: 'action-new-entry',
      title: 'New Journal Entry',
      subtitle: 'Create a new journal entry for today',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        router.push('/journal');
        // TODO: Trigger new entry creation
      },
      category: 'actions',
      keywords: ['new', 'entry', 'create', 'add'],
    },
    {
      id: 'action-quick-note',
      title: 'Quick Note',
      subtitle: 'Add a quick note or task',
      icon: <Hash className="h-4 w-4" />,
      action: () => {
        // TODO: Open quick note modal
      },
      category: 'actions',
      keywords: ['note', 'quick', 'task', 'todo'],
    },
    {
      id: 'action-new-drawing',
      title: 'New Drawing',
      subtitle: 'Start a new drawing session',
      icon: <Image className="h-4 w-4" />,
      action: () => {
        router.push('/draw');
        // TODO: Start new canvas
      },
      category: 'actions',
      keywords: ['drawing', 'new', 'canvas', 'create'],
    },

    // Tools
    {
      id: 'tool-timer',
      title: 'Pomodoro Timer',
      subtitle: 'Start a focus session',
      icon: <Clock className="h-4 w-4" />,
      action: () => onTimerOpen?.(),
      category: 'tools',
      keywords: ['timer', 'pomodoro', 'focus', 'productivity'],
    },
    {
      id: 'tool-calculator',
      title: 'Calculator',
      subtitle: 'Quick calculations',
      icon: <Calculator className="h-4 w-4" />,
      action: () => onCalculatorOpen?.(),
      category: 'tools',
      keywords: ['calculator', 'math', 'calculate'],
    },
    {
      id: 'tool-calendar',
      title: 'Calendar View',
      subtitle: 'Browse entries by date',
      icon: <Calendar className="h-4 w-4" />,
      action: () => {
        // TODO: Open calendar widget
      },
      category: 'tools',
      keywords: ['calendar', 'date', 'browse'],
    },
  ], [router, onTimerOpen, onCalculatorOpen]);

  // Filter commands based on query
  const filteredCommands = React.useMemo(() => {
    if (!query.trim()) return allCommands;

    const lowerQuery = query.toLowerCase();
    return allCommands.filter(command => {
      const searchText = [
        command.title,
        command.subtitle,
        ...(command.keywords || [])
      ].join(' ').toLowerCase();
      
      return searchText.includes(lowerQuery);
    });
  }, [allCommands, query]);

  // Group commands by category
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach(command => {
      if (!groups[command.category]) {
        groups[command.category] = [];
      }
      groups[command.category].push(command);
    });
    return groups;
  }, [filteredCommands]);

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
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Reset selected index when query changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'navigation': return 'Navigation';
      case 'actions': return 'Quick Actions';
      case 'tools': return 'Tools';
      case 'recent': return 'Recent';
      default: return category;
    }
  };

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

          {/* Command Palette */}
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
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
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:inline-flex">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-1">
                {filteredCommands.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Command className="h-6 w-6 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No commands found
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, commands]) => (
                    <div key={category} className="mb-2">
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {getCategoryTitle(category)}
                      </div>
                      <div className="space-y-1">
                        {commands.map((command, commandIndex) => {
                          const globalIndex = filteredCommands.indexOf(command);
                          const isSelected = globalIndex === selectedIndex;

                          return (
                            <motion.div
                              key={command.id}
                              className={cn(
                                'flex items-center gap-3 rounded-md px-2 py-2 text-sm cursor-pointer',
                                isSelected && 'bg-accent text-accent-foreground'
                              )}
                              onClick={() => {
                                command.action();
                                onClose();
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex-shrink-0 text-muted-foreground">
                                {command.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{command.title}</div>
                                {command.subtitle && (
                                  <div className="text-xs text-muted-foreground">
                                    {command.subtitle}
                                  </div>
                                )}
                              </div>
                              {command.shortcut && (
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                  {command.shortcut}
                                </kbd>
                              )}
                              {isSelected && (
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
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
                    <span>select</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                      ESC
                    </kbd>
                    <span>close</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}