// ABOUTME: Main journal page with date navigation, entry list, quick add, and daily stats
// Features responsive layout, keyboard navigation, and beautiful animations

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

import { useJournalStore } from '@/lib/stores/journalStore';
import { cn } from '@/lib/utils/cn';
import { animations } from '@/lib/constants/design-tokens';

import { DatePicker } from '@/components/journal/DatePicker';
import { MemoizedEntryList } from '@/components/journal/EntryList';
import { MemoizedQuickEntry } from '@/components/journal/QuickEntry';
import { MemoizedDailyStats } from '@/components/journal/DailyStats';
import { SkipLink, KeyboardShortcutsHelp, ScreenReaderAnnouncement } from '@/components/journal/AccessibilityFeatures';

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isQuickEntryExpanded, setIsQuickEntryExpanded] = useState(false);
  
  const { 
    currentPage, 
    entries, 
    isLoading, 
    error, 
    loadTodayPage,
    createPage 
  } = useJournalStore();

  // Load today's page on mount
  useEffect(() => {
    loadTodayPage();
  }, [loadTodayPage]);

  // Handle date change - create/load page for selected date
  const handleDateChange = async (date: Date) => {
    setSelectedDate(date);
    
    try {
      // Check if page exists for this date, create if not
      const dateStr = format(date, 'yyyy-MM-dd');
      // For now, just load today's page - in a real app you'd check for existing pages
      if (format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
        await loadTodayPage();
      } else {
        // Create a daily page for the selected date
        const page = await createPage({
          type: 'daily',
          title: `Daily Log - ${format(date, 'EEEE, MMMM d, yyyy')}`,
          date: date,
          tags: ['daily'],
          isArchived: false,
          order: Date.now()
        });
        
        // Load the created page
        // Note: In a full implementation, you'd have a loadPage method that takes a date
        await loadTodayPage(); // Temporary - would be loadPageByDate(date)
      }
    } catch (error) {
      console.error('Failed to load/create page for date:', error);
    }
  };

  const handleEntryCreated = () => {
    setIsQuickEntryExpanded(false);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-2xl font-bold text-red-600">Error Loading Journal</h1>
          <p className="text-neutral-600 dark:text-neutral-400">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      {/* Accessibility Features */}
      <SkipLink targetId="main-content">Skip to main content</SkipLink>
      <SkipLink targetId="quick-entry">Skip to quick entry</SkipLink>
      <KeyboardShortcutsHelp />
      
      {/* Screen reader announcements */}
      <ScreenReaderAnnouncement 
        message={`Journal page loaded for ${format(selectedDate, 'EEEE, MMMM d, yyyy')}. ${entries.length} entries found.`}
      />
      
      <motion.div
        initial={animations.variants.fadeIn.initial}
        animate={animations.variants.fadeIn.animate}
        className="container mx-auto px-4 py-8 max-w-7xl"
        id="main-content"
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Your Journal
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Capture your thoughts, tasks, and experiences
              </p>
            </div>
            
            <DatePicker
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Entry and Entries */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Quick Entry */}
            <div id="quick-entry">
              <MemoizedQuickEntry
                pageId={currentPage?.id || 1}
                onEntryCreated={handleEntryCreated}
                autoFocus={isQuickEntryExpanded}
              />
            </div>

            {/* Entries List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <motion.h2
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-semibold text-neutral-900 dark:text-neutral-100"
                >
                  {format(selectedDate, 'EEEE, MMMM d')}
                </motion.h2>
                
                {entries.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-neutral-500 dark:text-neutral-400"
                  >
                    {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                  </motion.div>
                )}
              </div>

              <MemoizedEntryList
                entries={entries}
                isLoading={isLoading}
                onCreateEntry={() => setIsQuickEntryExpanded(true)}
                virtualScrolling={entries.length > 20}
              />
            </div>
          </motion.div>

          {/* Right Column - Daily Stats and Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Daily Stats */}
            <MemoizedDailyStats
              entries={entries}
              date={selectedDate}
            />

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setIsQuickEntryExpanded(true)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-all',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    'border border-neutral-200 dark:border-neutral-700'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-bold">+</span>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">Add Entry</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Quick capture</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleDateChange(new Date())}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-all',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    'border border-neutral-200 dark:border-neutral-700'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-sm">📅</span>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">Today</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Jump to today</p>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl border border-primary-200 dark:border-primary-800 p-6"
            >
              <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4">
                💡 Tips
              </h3>
              
              <div className="space-y-3 text-sm text-primary-800 dark:text-primary-200">
                <div className="flex items-start gap-2">
                  <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                  <span>Use <kbd className="px-1 py-0.5 bg-primary-200 dark:bg-primary-800 rounded text-xs">⌘+Enter</kbd> to quickly add entries</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                  <span>Start with bullet symbols: • for tasks, • for notes</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                  <span>Use <kbd className="px-1 py-0.5 bg-primary-200 dark:bg-primary-800 rounded text-xs">⌘+M</kbd> for voice input</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                  <span>Add #tags to organize your entries</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}