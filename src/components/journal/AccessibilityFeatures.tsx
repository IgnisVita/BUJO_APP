// ABOUTME: Accessibility features and utilities for journal components
// Provides WCAG compliance, keyboard navigation, and screen reader support

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, Info, X } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

// Accessibility announcement for screen readers
export function ScreenReaderAnnouncement({ 
  message, 
  priority = 'polite' 
}: { 
  message: string; 
  priority?: 'polite' | 'assertive';
}) {
  return (
    <div 
      aria-live={priority} 
      aria-atomic="true" 
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Skip link for keyboard navigation
export function SkipLink({ targetId, children }: { targetId: string; children: string }) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'bg-primary-600 text-white px-4 py-2 rounded-md z-50',
        'focus:outline-none focus:ring-2 focus:ring-primary-500'
      )}
    >
      {children}
    </a>
  );
}

// Keyboard shortcut help panel
export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Tab', description: 'Navigate between elements' },
    { key: 'Enter', description: 'Activate buttons/links' },
    { key: 'Space', description: 'Toggle checkboxes, activate buttons' },
    { key: 'Escape', description: 'Close dialogs, cancel editing' },
    { key: '⌘ + Enter', description: 'Submit entry quickly' },
    { key: '⌘ + M', description: 'Toggle microphone for voice input' },
    { key: 'Arrow keys', description: 'Navigate calendar dates' },
    { key: 'Home', description: 'Go to today in calendar' },
    { key: '/', description: 'Focus search (when available)' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-40"
        aria-label="Show keyboard shortcuts"
      >
        <Accessibility className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
                'bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700',
                'shadow-xl p-6 w-full max-w-md z-50'
              )}
              role="dialog"
              aria-labelledby="shortcuts-title"
              aria-modal="true"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 id="shortcuts-title" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Keyboard Shortcuts
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close shortcuts help"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs rounded border border-neutral-300 dark:border-neutral-600">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                Press <kbd className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">⌘ + ?</kbd> to toggle this help
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Focus trap for modals and dialogs
export function FocusTrap({ 
  isActive, 
  children, 
  restoreFocus = true 
}: { 
  isActive: boolean; 
  children: React.ReactNode;
  restoreFocus?: boolean;
}) {
  useEffect(() => {
    if (!isActive) return;

    const previousActiveElement = document.activeElement as HTMLElement;
    
    const focusableElements = Array.from(
      document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      if (restoreFocus) {
        previousActiveElement?.focus();
      }
    };
  }, [isActive, restoreFocus]);

  return <>{children}</>;
}

// High contrast mode toggle
export function HighContrastToggle() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleHighContrast = () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleHighContrast}
      aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
    >
      <Info className="w-4 h-4 mr-2" />
      {isHighContrast ? 'High Contrast On' : 'High Contrast Off'}
    </Button>
  );
}

// ARIA live region for dynamic content updates
export function LiveRegion({ 
  children, 
  level = 'polite' 
}: { 
  children: React.ReactNode; 
  level?: 'off' | 'polite' | 'assertive';
}) {
  return (
    <div
      aria-live={level}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  );
}

// Reduced motion preferences
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Color contrast utilities
export const colorContrast = {
  // WCAG AA compliance: 4.5:1 for normal text, 3:1 for large text
  // WCAG AAA compliance: 7:1 for normal text, 4.5:1 for large text
  
  // High contrast color pairs for WCAG AAA compliance
  highContrast: {
    light: {
      background: '#ffffff',
      text: '#000000',
      primary: '#0000ff',
      secondary: '#666666',
    },
    dark: {
      background: '#000000',
      text: '#ffffff',
      primary: '#ffff00',
      secondary: '#cccccc',
    },
  },
};

// Export all accessibility utilities
export const a11y = {
  ScreenReaderAnnouncement,
  SkipLink,
  KeyboardShortcutsHelp,
  FocusTrap,
  HighContrastToggle,
  LiveRegion,
  useReducedMotion,
  colorContrast,
};