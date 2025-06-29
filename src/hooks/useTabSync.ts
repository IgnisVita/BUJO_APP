// ABOUTME: Hook for managing tab state, sync, and navigation history
// Handles tab persistence, reordering, history navigation, and mobile drawer state

import { useState, useEffect, useCallback } from 'react';
import { Tab, TAB_TEMPLATES } from '../components/journal/TabTypes';

interface TabHistory {
  tabIds: string[];
  currentIndex: number;
}

interface UseTabSyncReturn {
  tabs: Tab[];
  activeTabId: string;
  setActiveTab: (tabId: string) => void;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  getTabHistory: () => TabHistory;
  navigateTabHistory: (direction: 'back' | 'forward') => void;
  syncTabs: () => void;
}

const STORAGE_KEY = 'bujo_tabs';
const ACTIVE_TAB_KEY = 'bujo_active_tab';
const HISTORY_KEY = 'bujo_tab_history';
const MAX_HISTORY = 50;

// Default tabs
const getDefaultTabs = (): Tab[] => {
  const now = new Date();
  return [
    {
      ...TAB_TEMPLATES.timeBasedTabs[0], // Today
      id: 'today',
      createdAt: now,
      lastAccessed: now
    },
    {
      ...TAB_TEMPLATES.timeBasedTabs[1], // This Week
      id: 'this-week',
      createdAt: now,
      lastAccessed: now
    },
    {
      ...TAB_TEMPLATES.lifeAreaTabs[0], // Work
      id: 'work',
      createdAt: now,
      lastAccessed: now
    }
  ];
};

export const useTabSync = (): UseTabSyncReturn => {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedTabs = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsedTabs.map((tab: any) => ({
          ...tab,
          createdAt: new Date(tab.createdAt),
          lastAccessed: new Date(tab.lastAccessed)
        }));
      }
    } catch (error) {
      console.error('Error loading tabs:', error);
    }
    return getDefaultTabs();
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_TAB_KEY);
      if (stored && tabs.some(t => t.id === stored)) {
        return stored;
      }
    } catch (error) {
      console.error('Error loading active tab:', error);
    }
    return tabs[0]?.id || 'today';
  });

  const [history, setHistory] = useState<TabHistory>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading tab history:', error);
    }
    return { tabIds: [activeTabId], currentIndex: 0 };
  });

  // Save tabs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    } catch (error) {
      console.error('Error saving tabs:', error);
    }
  }, [tabs]);

  // Save active tab to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_TAB_KEY, activeTabId);
    } catch (error) {
      console.error('Error saving active tab:', error);
    }
  }, [activeTabId]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving tab history:', error);
    }
  }, [history]);

  // Set active tab with history tracking
  const setActiveTab = useCallback((tabId: string) => {
    if (tabId === activeTabId) return;

    setActiveTabId(tabId);
    
    // Update last accessed time
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, lastAccessed: new Date() }
        : tab
    ));

    // Update history
    setHistory(prev => {
      const newHistory = [...prev.tabIds.slice(0, prev.currentIndex + 1), tabId];
      return {
        tabIds: newHistory.slice(-MAX_HISTORY),
        currentIndex: newHistory.length - 1
      };
    });
  }, [activeTabId]);

  // Add a new tab
  const addTab = useCallback((tab: Tab) => {
    setTabs(prev => [...prev, tab]);
    setActiveTab(tab.id);
  }, [setActiveTab]);

  // Remove a tab
  const removeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      
      // If removing active tab, switch to another
      if (tabId === activeTabId && newTabs.length > 0) {
        const removedIndex = prev.findIndex(t => t.id === tabId);
        const newActiveIndex = Math.min(removedIndex, newTabs.length - 1);
        setActiveTab(newTabs[newActiveIndex].id);
      }
      
      return newTabs;
    });

    // Clean up history
    setHistory(prev => ({
      tabIds: prev.tabIds.filter(id => id !== tabId),
      currentIndex: Math.max(0, prev.currentIndex - 1)
    }));
  }, [activeTabId, setActiveTab]);

  // Update a tab
  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, ...updates, id: tab.id } // Ensure ID doesn't change
        : tab
    ));
  }, []);

  // Reorder tabs
  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs(prev => {
      const newTabs = [...prev];
      const [removed] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, removed);
      return newTabs;
    });
  }, []);

  // Get tab history
  const getTabHistory = useCallback(() => history, [history]);

  // Navigate tab history
  const navigateTabHistory = useCallback((direction: 'back' | 'forward') => {
    setHistory(prev => {
      let newIndex = prev.currentIndex;
      
      if (direction === 'back' && newIndex > 0) {
        newIndex--;
      } else if (direction === 'forward' && newIndex < prev.tabIds.length - 1) {
        newIndex++;
      } else {
        return prev;
      }

      const targetTabId = prev.tabIds[newIndex];
      if (tabs.some(t => t.id === targetTabId)) {
        setActiveTabId(targetTabId);
        return { ...prev, currentIndex: newIndex };
      }
      
      return prev;
    });
  }, [tabs]);

  // Sync tabs across browser tabs/windows
  const syncTabs = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedTabs = JSON.parse(stored);
        setTabs(parsedTabs.map((tab: any) => ({
          ...tab,
          createdAt: new Date(tab.createdAt),
          lastAccessed: new Date(tab.lastAccessed)
        })));
      }
    } catch (error) {
      console.error('Error syncing tabs:', error);
    }
  }, []);

  // Listen for storage changes (sync across browser tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        syncTabs();
      } else if (e.key === ACTIVE_TAB_KEY && e.newValue) {
        const newTabId = e.newValue;
        if (tabs.some(t => t.id === newTabId)) {
          setActiveTabId(newTabId);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [tabs, syncTabs]);

  // Auto-switch tabs based on rules
  useEffect(() => {
    const checkAutoSwitch = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      for (const tab of tabs) {
        if (tab.settings?.autoSwitch && tab.settings.autoSwitchRules) {
          for (const rule of tab.settings.autoSwitchRules) {
            if (rule.type === 'time' && rule.condition === currentTime) {
              setActiveTab(tab.id);
              return;
            }
            // Add more rule types as needed
          }
        }
      }
    };

    const interval = setInterval(checkAutoSwitch, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tabs, setActiveTab]);

  return {
    tabs,
    activeTabId,
    setActiveTab,
    addTab,
    removeTab,
    updateTab,
    reorderTabs,
    getTabHistory,
    navigateTabHistory,
    syncTabs
  };
};