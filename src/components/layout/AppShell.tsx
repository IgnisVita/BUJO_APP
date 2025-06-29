// ABOUTME: Main app shell that integrates all navigation components and widgets
// Provides cohesive user experience with global state management and keyboard shortcuts

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import * as React from 'react';

import { Calculator } from '@/components/widgets/Calculator';
import { Timer } from '@/components/widgets/Timer';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { MainNav } from '@/components/navigation/MainNav';
import { SearchBar } from '@/components/common/SearchBar';
import { useShortcuts, useShortcutContext, defaultShortcuts } from '@/lib/shortcuts';

interface AppShellProps {
  children: React.ReactNode;
  currentPage?: string;
}

interface WidgetState {
  isOpen: boolean;
  position: { x: number; y: number };
}

export function AppShell({ children, currentPage = 'journal' }: AppShellProps) {
  // Navigation state
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Widget states
  const [calculator, setCalculator] = React.useState<WidgetState>({
    isOpen: false,
    position: { x: 100, y: 100 },
  });
  
  const [timer, setTimer] = React.useState<WidgetState>({
    isOpen: false,
    position: { x: 200, y: 200 },
  });

  // Set shortcut context based on current page
  useShortcutContext(currentPage);

  // Global event listeners for shortcuts
  React.useEffect(() => {
    const handleOpenCommandPalette = () => setCommandPaletteOpen(true);
    const handleOpenSearch = () => setSearchOpen(true);
    const handleOpenTimer = () => setTimer(prev => ({ ...prev, isOpen: true }));
    const handleOpenCalculator = () => setCalculator(prev => ({ ...prev, isOpen: true }));
    
    const handleShowShortcuts = () => {
      // TODO: Implement shortcuts help modal
      console.log('Show shortcuts help');
    };

    document.addEventListener('open-command-palette', handleOpenCommandPalette);
    document.addEventListener('open-search', handleOpenSearch);
    document.addEventListener('open-timer', handleOpenTimer);
    document.addEventListener('open-calculator', handleOpenCalculator);
    document.addEventListener('show-shortcuts-help', handleShowShortcuts);

    return () => {
      document.removeEventListener('open-command-palette', handleOpenCommandPalette);
      document.removeEventListener('open-search', handleOpenSearch);
      document.removeEventListener('open-timer', handleOpenTimer);
      document.removeEventListener('open-calculator', handleOpenCalculator);
      document.removeEventListener('show-shortcuts-help', handleShowShortcuts);
    };
  }, []);

  // Handle search result selection
  const handleSearchResult = (result: any) => {
    // Navigate to result URL
    window.location.href = result.url;
  };

  // Handle widget position changes
  const handleCalculatorPositionChange = (position: { x: number; y: number }) => {
    setCalculator(prev => ({ ...prev, position }));
  };

  const handleTimerPositionChange = (position: { x: number; y: number }) => {
    setTimer(prev => ({ ...prev, position }));
  };

  // Close widgets
  const closeCalculator = () => setCalculator(prev => ({ ...prev, isOpen: false }));
  const closeTimer = () => setTimer(prev => ({ ...prev, isOpen: false }));

  // Responsive sidebar handling
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed left-0 top-0 z-40 h-screen w-72 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:relative lg:translate-x-0"
            >
              <div className="flex h-full flex-col">
                {/* Logo/Header */}
                <div className="flex h-16 items-center gap-2 border-b px-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <span className="font-bold">B</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Digital BUJO</span>
                    <span className="text-xs text-muted-foreground">Bullet Journal</span>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto p-4">
                  <MainNav
                    onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
                    onSearchOpen={() => setSearchOpen(true)}
                  />
                </div>

                {/* Footer */}
                <div className="border-t p-4">
                  <div className="text-xs text-muted-foreground">
                    <div className="mb-1">Press ⌘K for commands</div>
                    <div>Press F1 for shortcuts</div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="lg:hidden">
            <div className="flex h-16 items-center gap-4 border-b px-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background hover:bg-accent"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="font-bold">B</span>
              </div>
              <span className="font-semibold">Digital BUJO</span>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onTimerOpen={() => setTimer(prev => ({ ...prev, isOpen: true }))}
        onCalculatorOpen={() => setCalculator(prev => ({ ...prev, isOpen: true }))}
      />

      {/* Search */}
      <SearchBar
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onResultSelect={handleSearchResult}
      />

      {/* Floating Widgets */}
      <Calculator
        isOpen={calculator.isOpen}
        onClose={closeCalculator}
        position={calculator.position}
        onPositionChange={handleCalculatorPositionChange}
      />

      <Timer
        isOpen={timer.isOpen}
        onClose={closeTimer}
        position={timer.position}
        onPositionChange={handleTimerPositionChange}
      />
    </div>
  );
}