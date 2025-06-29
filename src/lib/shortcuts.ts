// ABOUTME: Global keyboard shortcut system with context-aware shortcuts
// Provides centralized shortcut management and help overlay functionality

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  category: 'navigation' | 'actions' | 'tools' | 'editor' | 'global';
  action: () => void;
  context?: 'global' | 'journal' | 'draw' | 'dashboard' | 'settings';
  preventDefault?: boolean;
}

export interface ShortcutCategory {
  name: string;
  shortcuts: KeyboardShortcut[];
}

class ShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private listeners: Set<(event: KeyboardEvent) => void> = new Set();
  private isEnabled = true;
  private currentContext: string = 'global';

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  register(shortcut: KeyboardShortcut): void {
    const key = this.getShortcutKey(shortcut.keys);
    this.shortcuts.set(key, shortcut);
  }

  unregister(keys: string[]): void {
    const key = this.getShortcutKey(keys);
    this.shortcuts.delete(key);
  }

  setContext(context: string): void {
    this.currentContext = context;
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  getShortcutsByCategory(): ShortcutCategory[] {
    const categories: Record<string, KeyboardShortcut[]> = {};
    
    this.shortcuts.forEach(shortcut => {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = [];
      }
      categories[shortcut.category].push(shortcut);
    });

    return Object.entries(categories).map(([category, shortcuts]) => ({
      name: this.getCategoryName(category),
      shortcuts: shortcuts.sort((a, b) => a.description.localeCompare(b.description)),
    }));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    // Don't handle shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      // Allow some global shortcuts even in input fields
      const globalShortcuts = ['Escape', 'F1'];
      if (!globalShortcuts.includes(event.key)) {
        return;
      }
    }

    const keys = this.getEventKeys(event);
    const shortcut = this.shortcuts.get(keys);

    if (shortcut && this.isShortcutApplicable(shortcut)) {
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }
      shortcut.action();
    }
  }

  private isShortcutApplicable(shortcut: KeyboardShortcut): boolean {
    return !shortcut.context || 
           shortcut.context === 'global' || 
           shortcut.context === this.currentContext;
  }

  private getEventKeys(event: KeyboardEvent): string {
    const keys: string[] = [];
    
    if (event.metaKey) keys.push('cmd');
    if (event.ctrlKey) keys.push('ctrl');
    if (event.altKey) keys.push('alt');
    if (event.shiftKey) keys.push('shift');
    
    // Normalize key names
    const key = event.key.toLowerCase();
    const normalizedKey = this.normalizeKey(key);
    keys.push(normalizedKey);
    
    return keys.join('+');
  }

  private getShortcutKey(keys: string[]): string {
    return keys.map(key => key.toLowerCase()).join('+');
  }

  private normalizeKey(key: string): string {
    const keyMap: Record<string, string> = {
      ' ': 'space',
      'arrowup': 'up',
      'arrowdown': 'down',
      'arrowleft': 'left',
      'arrowright': 'right',
    };
    
    return keyMap[key] || key;
  }

  private getCategoryName(category: string): string {
    const names: Record<string, string> = {
      navigation: 'Navigation',
      actions: 'Quick Actions',
      tools: 'Tools',
      editor: 'Editor',
      global: 'Global',
    };
    
    return names[category] || category;
  }

  destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.shortcuts.clear();
    this.listeners.clear();
  }
}

// Global instance
export const shortcutManager = new ShortcutManager();

// Hook for React components
export function useShortcuts(shortcuts: KeyboardShortcut[], deps: any[] = []) {
  React.useEffect(() => {
    shortcuts.forEach(shortcut => {
      shortcutManager.register(shortcut);
    });

    return () => {
      shortcuts.forEach(shortcut => {
        shortcutManager.unregister(shortcut.keys);
      });
    };
  }, deps);
}

// Context hook
export function useShortcutContext(context: string) {
  React.useEffect(() => {
    shortcutManager.setContext(context);
  }, [context]);
}

// Default shortcuts
export const defaultShortcuts: KeyboardShortcut[] = [
  // Global Navigation
  {
    id: 'nav-journal',
    keys: ['cmd+j'],
    description: 'Open Journal',
    category: 'navigation',
    action: () => window.location.href = '/journal',
  },
  {
    id: 'nav-draw',
    keys: ['cmd+d'],
    description: 'Open Drawing Canvas',
    category: 'navigation',
    action: () => window.location.href = '/draw',
  },
  {
    id: 'nav-dashboard',
    keys: ['cmd+b'],
    description: 'Open Dashboard',
    category: 'navigation',
    action: () => window.location.href = '/dashboard',
  },
  {
    id: 'nav-settings',
    keys: ['cmd+,'],
    description: 'Open Settings',
    category: 'navigation',
    action: () => window.location.href = '/settings',
  },

  // Global Actions
  {
    id: 'command-palette',
    keys: ['cmd+k'],
    description: 'Open Command Palette',
    category: 'global',
    action: () => {
      // This will be handled by the component that manages the command palette
      document.dispatchEvent(new CustomEvent('open-command-palette'));
    },
  },
  {
    id: 'search',
    keys: ['cmd+f'],
    description: 'Search',
    category: 'global',
    action: () => {
      document.dispatchEvent(new CustomEvent('open-search'));
    },
  },
  {
    id: 'help',
    keys: ['f1'],
    description: 'Show Keyboard Shortcuts',
    category: 'global',
    action: () => {
      document.dispatchEvent(new CustomEvent('show-shortcuts-help'));
    },
    preventDefault: false,
  },

  // Tools
  {
    id: 'timer',
    keys: ['cmd+t'],
    description: 'Open Timer',
    category: 'tools',
    action: () => {
      document.dispatchEvent(new CustomEvent('open-timer'));
    },
  },
  {
    id: 'calculator',
    keys: ['cmd+c'],
    description: 'Open Calculator',
    category: 'tools',
    action: () => {
      document.dispatchEvent(new CustomEvent('open-calculator'));
    },
  },

  // Quick Actions
  {
    id: 'new-entry',
    keys: ['cmd+n'],
    description: 'New Journal Entry',
    category: 'actions',
    action: () => {
      document.dispatchEvent(new CustomEvent('new-journal-entry'));
    },
  },
  {
    id: 'save',
    keys: ['cmd+s'],
    description: 'Save',
    category: 'actions',
    action: () => {
      document.dispatchEvent(new CustomEvent('save'));
    },
  },
];

// Register default shortcuts
defaultShortcuts.forEach(shortcut => {
  shortcutManager.register(shortcut);
});

// Import React for hooks
import * as React from 'react';