// ABOUTME: Demo page showing the TabSystem integration
// Example of how to use the multi-tab journal system

'use client';

import React from 'react';
import { TabSystem } from '../../components/journal/TabSystem';
import { DotGrid } from '../../components/journal/DotGrid';
import { Tab } from '../../components/journal/TabTypes';

export default function JournalTabsDemo() {
  const handleTabChange = (tab: Tab) => {
    console.log('Active tab changed:', tab.name);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <header className="px-4 py-3 border-b bg-white dark:bg-gray-900">
        <h1 className="text-xl font-bold">Multi-Tab Journal System Demo</h1>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <TabSystem onTabChange={handleTabChange}>
          {/* This will be shown for non-time-based tabs */}
          <DotGrid />
        </TabSystem>
      </main>

      <footer className="px-4 py-2 border-t bg-white dark:bg-gray-900 text-center text-sm text-gray-600 dark:text-gray-400">
        Use Ctrl/Cmd + 1-9 to switch tabs • Ctrl/Cmd + Tab to cycle • Alt + Left/Right for history
      </footer>
    </div>
  );
}