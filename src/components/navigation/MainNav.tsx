// ABOUTME: Primary navigation component with modern tab-based navigation
// Features active states, keyboard shortcuts, search integration, and smooth animations

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  PenTool,
  BarChart3,
  Settings,
  Search,
  Command,
  Calendar,
  Clock,
  Calculator,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { Timer } from '@/components/widgets/Timer';
import { Calculator } from '@/components/widgets/Calculator';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  shortcut?: string;
  badge?: number;
  description?: string;
}

export interface MainNavProps {
  className?: string;
  onCommandPaletteOpen?: () => void;
  onSearchOpen?: () => void;
}

const defaultNavItems: NavItem[] = [
  {
    name: 'Journal',
    href: '/journal',
    icon: <BookOpen className="h-5 w-5" />,
    shortcut: '⌘J',
    description: 'Daily entries and rapid logging',
  },
  {
    name: 'Draw',
    href: '/draw',
    icon: <PenTool className="h-5 w-5" />,
    shortcut: '⌘D',
    description: 'Digital drawing and sketching',
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <BarChart3 className="h-5 w-5" />,
    shortcut: '⌘B',
    description: 'Analytics and insights',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
    shortcut: '⌘,',
    description: 'App preferences and configuration',
  },
];

export function MainNav({ className, onCommandPaletteOpen, onSearchOpen }: MainNavProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);
  
  // Widget states
  const [timerOpen, setTimerOpen] = React.useState(false);
  const [calculatorOpen, setCalculatorOpen] = React.useState(false);
  const [timerPosition, setTimerPosition] = React.useState({ x: 300, y: 200 });
  const [calculatorPosition, setCalculatorPosition] = React.useState({ x: 400, y: 200 });

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            onCommandPaletteOpen?.();
            break;
          case 'f':
            event.preventDefault();
            onSearchOpen?.();
            break;
          case 'j':
            event.preventDefault();
            window.location.href = '/journal';
            break;
          case 'd':
            event.preventDefault();
            window.location.href = '/draw';
            break;
          case 'b':
            event.preventDefault();
            window.location.href = '/dashboard';
            break;
          case ',':
            event.preventDefault();
            window.location.href = '/settings';
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCommandPaletteOpen, onSearchOpen]);

  return (
    <nav className={cn('flex flex-col space-y-2', className)}>
      {/* Quick Actions */}
      <div className="flex items-center gap-2 p-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCommandPaletteOpen}
          className="flex-1 justify-start gap-2 text-muted-foreground"
        >
          <Command className="h-4 w-4" />
          <span className="flex-1 text-left">Quick actions...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            ⌘K
          </kbd>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchOpen}
          className="shrink-0"
          title="Search (⌘F)"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Navigation */}
      <div className="space-y-1 px-2">
        {defaultNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link href={item.href}>
                <motion.div
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-accent text-accent-foreground'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={cn(
                    'flex-shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {item.icon}
                  </div>
                  
                  <span className="flex-1">{item.name}</span>
                  
                  {item.badge && item.badge > 0 && (
                    <motion.span
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </motion.span>
                  )}
                  
                  {item.shortcut && (
                    <kbd className="pointer-events-none hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 group-hover:opacity-100 sm:inline-flex">
                      {item.shortcut}
                    </kbd>
                  )}
                </motion.div>
              </Link>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute left-0 top-0 h-full w-1 rounded-r bg-primary"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {/* Hover tooltip */}
              <AnimatePresence>
                {hoveredItem === item.href && item.description && (
                  <motion.div
                    className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md border"
                    initial={{ opacity: 0, x: -10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.description}
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-popover" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Quick Tools */}
      <div className="border-t pt-4 px-2">
        <div className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Tools
        </div>
        <div className="space-y-1">
          <Link href="/calendar">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3"
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Calendar
            </Button>
          </Link>
          <Link href="/journal/customizer">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Grid Customizer
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3"
            onClick={() => setTimerOpen(true)}
          >
            <Clock className="h-4 w-4 text-muted-foreground" />
            Timer
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3"
            onClick={() => setCalculatorOpen(true)}
          >
            <Calculator className="h-4 w-4 text-muted-foreground" />
            Calculator
          </Button>
        </div>
      </div>

      {/* Floating Widgets */}
      <Timer
        isOpen={timerOpen}
        onClose={() => setTimerOpen(false)}
        position={timerPosition}
        onPositionChange={setTimerPosition}
      />
      
      <Calculator
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        position={calculatorPosition}
        onPositionChange={setCalculatorPosition}
      />
    </nav>
  );
}