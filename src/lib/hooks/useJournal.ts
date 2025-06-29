// ABOUTME: Custom React hook that combines journal store and database operations
// Provides a unified interface with loading states, error handling, and optimistic updates

import { useEffect, useCallback, useMemo } from 'react';

import { db, dbOperations } from '../db/database';
import { entryRepository } from '../db/repositories/entry.repository';
import { useJournalStore } from '../stores/journalStore';
import { useUIStore } from '../stores/uiStore';
import {
  JournalEntry,
  Page,
  EntryType,
  TaskStatus,
  CreateInput,
  UpdateInput,
  SearchFilters
} from '../types';

interface UseJournalReturn {
  // Current state
  currentPage: Page | null;
  entries: JournalEntry[];
  isLoading: boolean;
  error: string | null;
  
  // Computed values
  todaysTasks: JournalEntry[];
  overdueTasks: JournalEntry[];
  upcomingTasks: JournalEntry[];
  completionRate: number;
  
  // Page operations
  loadTodayPage: () => Promise<void>;
  createPage: (type: Page['type'], title: string) => Promise<Page>;
  navigateToPage: (pageId: number) => Promise<void>;
  
  // Entry operations  
  createEntry: (type: EntryType, content: string, options?: Partial<JournalEntry>) => Promise<JournalEntry>;
  updateEntry: (entryId: number, updates: UpdateInput<JournalEntry>) => Promise<void>;
  deleteEntry: (entryId: number) => Promise<void>;
  
  // Task operations
  toggleTask: (taskId: number) => Promise<void>;
  migrateTask: (taskId: number, targetPageId: number) => Promise<void>;
  scheduleTask: (taskId: number, date: Date) => Promise<void>;
  
  // Bulk operations
  bulkDelete: (entryIds: number[]) => Promise<void>;
  bulkComplete: (taskIds: number[]) => Promise<void>;
  bulkMigrate: (taskIds: number[], targetPageId: number) => Promise<void>;
  
  // Search
  search: (query: string, filters?: Partial<SearchFilters>) => Promise<void>;
  clearSearch: () => void;
  
  // Utility
  refresh: () => Promise<void>;
  exportCurrentPage: () => Promise<string>;
}

export function useJournal(): UseJournalReturn {
  const {
    currentPage,
    entries,
    isLoading,
    error,
    loadTodayPage: storeLoadTodayPage,
    loadPage,
    createPage: storeCreatePage,
    createEntry: storeCreateEntry,
    updateEntry: storeUpdateEntry,
    deleteEntry: storeDeleteEntry,
    completeTask,
    migrateTask: storeMigrateTask,
    scheduleTask: storeScheduleTask,
    search: storeSearch,
    clearSearch,
    refreshCurrentPage,
    exportPage,
    getTasksByStatus
  } = useJournalStore();

  const { showErrorToast, showSuccessToast, showConfirmation } = useUIStore();

  // Load today's page on mount
  useEffect(() => {
    const initializePage = async () => {
      const isEmpty = await dbOperations.isEmpty();
      if (isEmpty || !currentPage) {
        await storeLoadTodayPage();
      }
    };
    
    initializePage();
  }, []);

  // Computed values
  const todaysTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return entries.filter(
      entry => 
        entry.type === 'task' &&
        entry.status === 'todo' &&
        entry.date >= today &&
        entry.date < tomorrow
    );
  }, [entries]);

  const overdueTasks = useMemo(() => {
    const now = new Date();
    return entries.filter(
      entry =>
        entry.type === 'task' &&
        entry.status === 'todo' &&
        entry.dueDate &&
        entry.dueDate < now
    );
  }, [entries]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return entries.filter(
      entry =>
        entry.type === 'task' &&
        entry.status === 'todo' &&
        entry.dueDate &&
        entry.dueDate >= now &&
        entry.dueDate <= nextWeek
    );
  }, [entries]);

  const completionRate = useMemo(() => {
    const tasks = entries.filter(e => e.type === 'task');
    if (tasks.length === 0) {
return 0;
}
    
    const completed = tasks.filter(t => t.status === 'done').length;
    return Math.round((completed / tasks.length) * 100);
  }, [entries]);

  // Enhanced operations with error handling and notifications
  const loadTodayPage = useCallback(async () => {
    try {
      await storeLoadTodayPage();
    } catch (error) {
      showErrorToast('Failed to load today\'s page');
      console.error('Failed to load today page:', error);
    }
  }, [storeLoadTodayPage, showErrorToast]);

  const createPage = useCallback(async (type: Page['type'], title: string): Promise<Page> => {
    try {
      const page = await storeCreatePage({
        type,
        title,
        date: new Date(),
        tags: [],
        isArchived: false,
        order: 0
      });
      
      showSuccessToast('Page created successfully');
      return page;
    } catch (error) {
      showErrorToast('Failed to create page');
      throw error;
    }
  }, [storeCreatePage, showSuccessToast, showErrorToast]);

  const navigateToPage = useCallback(async (pageId: number) => {
    try {
      await loadPage(pageId);
    } catch (error) {
      showErrorToast('Failed to navigate to page');
      console.error('Failed to navigate to page:', error);
    }
  }, [loadPage, showErrorToast]);

  const createEntry = useCallback(async (
    type: EntryType,
    content: string,
    options?: Partial<JournalEntry>
  ): Promise<JournalEntry> => {
    if (!currentPage) {
      throw new Error('No page selected');
    }

    try {
      const entry = await storeCreateEntry({
        pageId: currentPage.id!,
        type,
        content,
        date: new Date(),
        tags: [],
        order: entries.length,
        ...options
      });
      
      showSuccessToast(`${type.charAt(0).toUpperCase() + type.slice(1)} created`);
      return entry;
    } catch (error) {
      showErrorToast(`Failed to create ${type}`);
      throw error;
    }
  }, [currentPage, entries.length, storeCreateEntry, showSuccessToast, showErrorToast]);

  const updateEntry = useCallback(async (
    entryId: number,
    updates: UpdateInput<JournalEntry>
  ) => {
    try {
      await storeUpdateEntry(entryId, updates);
    } catch (error) {
      showErrorToast('Failed to update entry');
      throw error;
    }
  }, [storeUpdateEntry, showErrorToast]);

  const deleteEntry = useCallback(async (entryId: number) => {
    showConfirmation(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      async () => {
        try {
          await storeDeleteEntry(entryId);
          showSuccessToast('Entry deleted');
        } catch (error) {
          showErrorToast('Failed to delete entry');
        }
      }
    );
  }, [storeDeleteEntry, showConfirmation, showSuccessToast, showErrorToast]);

  const toggleTask = useCallback(async (taskId: number) => {
    const task = entries.find(e => e.id === taskId);
    if (!task || task.type !== 'task') {
return;
}

    const newStatus = task.status === 'done' ? 'todo' : 'done';
    
    try {
      await updateEntry(taskId, {
        status: newStatus,
        completedAt: newStatus === 'done' ? new Date() : undefined
      });
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  }, [entries, updateEntry]);

  const migrateTask = useCallback(async (taskId: number, targetPageId: number) => {
    try {
      await storeMigrateTask(taskId, targetPageId);
      showSuccessToast('Task migrated');
    } catch (error) {
      showErrorToast('Failed to migrate task');
      throw error;
    }
  }, [storeMigrateTask, showSuccessToast, showErrorToast]);

  const scheduleTask = useCallback(async (taskId: number, date: Date) => {
    try {
      await storeScheduleTask(taskId, date);
      showSuccessToast('Task scheduled');
    } catch (error) {
      showErrorToast('Failed to schedule task');
      throw error;
    }
  }, [storeScheduleTask, showSuccessToast, showErrorToast]);

  // Bulk operations
  const bulkDelete = useCallback(async (entryIds: number[]) => {
    if (entryIds.length === 0) {
return;
}

    showConfirmation(
      'Delete Entries',
      `Are you sure you want to delete ${entryIds.length} entries?`,
      async () => {
        try {
          await entryRepository.deleteBulk(entryIds);
          await refreshCurrentPage();
          showSuccessToast(`${entryIds.length} entries deleted`);
        } catch (error) {
          showErrorToast('Failed to delete entries');
        }
      }
    );
  }, [refreshCurrentPage, showConfirmation, showSuccessToast, showErrorToast]);

  const bulkComplete = useCallback(async (taskIds: number[]) => {
    if (taskIds.length === 0) {
return;
}

    try {
      await db.transaction('rw', db.entries, async () => {
        for (const taskId of taskIds) {
          await db.entries.update(taskId, {
            status: 'done',
            completedAt: new Date(),
            updatedAt: new Date()
          });
        }
      });
      
      await refreshCurrentPage();
      showSuccessToast(`${taskIds.length} tasks completed`);
    } catch (error) {
      showErrorToast('Failed to complete tasks');
    }
  }, [refreshCurrentPage, showSuccessToast, showErrorToast]);

  const bulkMigrate = useCallback(async (taskIds: number[], targetPageId: number) => {
    if (taskIds.length === 0) {
return;
}

    try {
      await db.transaction('rw', db.entries, async () => {
        for (const taskId of taskIds) {
          await entryRepository.migrateTask(taskId, targetPageId);
        }
      });
      
      await refreshCurrentPage();
      showSuccessToast(`${taskIds.length} tasks migrated`);
    } catch (error) {
      showErrorToast('Failed to migrate tasks');
    }
  }, [refreshCurrentPage, showSuccessToast, showErrorToast]);

  const search = useCallback(async (query: string, filters?: Partial<SearchFilters>) => {
    try {
      await storeSearch({
        query,
        ...filters
      });
    } catch (error) {
      showErrorToast('Search failed');
    }
  }, [storeSearch, showErrorToast]);

  const refresh = useCallback(async () => {
    try {
      await refreshCurrentPage();
    } catch (error) {
      showErrorToast('Failed to refresh page');
    }
  }, [refreshCurrentPage, showErrorToast]);

  const exportCurrentPage = useCallback(async (): Promise<string> => {
    if (!currentPage) {
      throw new Error('No page selected');
    }

    try {
      const data = await exportPage(currentPage.id!);
      showSuccessToast('Page exported successfully');
      return data;
    } catch (error) {
      showErrorToast('Failed to export page');
      throw error;
    }
  }, [currentPage, exportPage, showSuccessToast, showErrorToast]);

  return {
    // State
    currentPage,
    entries,
    isLoading,
    error,
    
    // Computed
    todaysTasks,
    overdueTasks,
    upcomingTasks,
    completionRate,
    
    // Operations
    loadTodayPage,
    createPage,
    navigateToPage,
    createEntry,
    updateEntry,
    deleteEntry,
    toggleTask,
    migrateTask,
    scheduleTask,
    bulkDelete,
    bulkComplete,
    bulkMigrate,
    search,
    clearSearch,
    refresh,
    exportCurrentPage
  };
}