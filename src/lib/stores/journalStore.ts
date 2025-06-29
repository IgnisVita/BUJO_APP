// ABOUTME: Zustand store for journal state management with persistence
// Handles journal entries, pages, and collections with optimistic updates

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { db, dbOperations } from '../db/database';
import { entryRepository } from '../db/repositories/entry.repository';
import {
  JournalEntry,
  Page,
  Collection,
  SearchFilters,
  SearchResult,
  CreateInput,
  UpdateInput,
  EntryType,
  TaskStatus,
  PageType
} from '../types';

interface JournalState {
  // Data
  currentPage: Page | null;
  entries: JournalEntry[];
  pages: Page[];
  collections: Collection[];
  searchResults: SearchResult[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  selectedEntryIds: number[];
  
  // Filters
  activeFilters: SearchFilters;
  
  // Actions - Pages
  loadPage: (pageId: number) => Promise<void>;
  loadTodayPage: () => Promise<void>;
  createPage: (input: CreateInput<Page>) => Promise<Page>;
  updatePage: (pageId: number, updates: UpdateInput<Page>) => Promise<void>;
  deletePage: (pageId: number) => Promise<void>;
  archivePage: (pageId: number) => Promise<void>;
  
  // Actions - Entries
  createEntry: (input: CreateInput<JournalEntry>) => Promise<JournalEntry>;
  updateEntry: (entryId: number, updates: UpdateInput<JournalEntry>) => Promise<void>;
  deleteEntry: (entryId: number) => Promise<void>;
  deleteSelectedEntries: () => Promise<void>;
  reorderEntries: (entryIds: number[]) => Promise<void>;
  
  // Actions - Tasks
  completeTask: (taskId: number) => Promise<void>;
  migrateTask: (taskId: number, newPageId: number) => Promise<void>;
  scheduleTask: (taskId: number, date: Date) => Promise<void>;
  
  // Actions - Collections
  loadCollections: () => Promise<void>;
  createCollection: (input: CreateInput<Collection>) => Promise<Collection>;
  updateCollection: (id: number, updates: UpdateInput<Collection>) => Promise<void>;
  deleteCollection: (id: number) => Promise<void>;
  addPageToCollection: (collectionId: number, pageId: number) => Promise<void>;
  removePageFromCollection: (collectionId: number, pageId: number) => Promise<void>;
  
  // Actions - Search and Filter
  search: (filters: SearchFilters) => Promise<void>;
  clearSearch: () => void;
  setActiveFilters: (filters: SearchFilters) => void;
  
  // Actions - Selection
  selectEntry: (entryId: number) => void;
  deselectEntry: (entryId: number) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Actions - Utility
  refreshCurrentPage: () => Promise<void>;
  loadRecentPages: (limit?: number) => Promise<void>;
  exportPage: (pageId: number) => Promise<string>;
  
  // Computed
  getEntriesByType: (type: EntryType) => JournalEntry[];
  getTasksByStatus: (status: TaskStatus) => JournalEntry[];
  hasUnsavedChanges: boolean;
}

export const useJournalStore = create<JournalState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state
          currentPage: null,
          entries: [],
          pages: [],
          collections: [],
          searchResults: [],
          isLoading: false,
          error: null,
          selectedEntryIds: [],
          activeFilters: {},
          hasUnsavedChanges: false,

          // Page Actions
          loadPage: async (pageId: number) => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              const [page, entries] = await Promise.all([
                db.pages.get(pageId),
                entryRepository.getByPage(pageId)
              ]);

              if (!page) {
throw new Error('Page not found');
}

              set((state) => {
                state.currentPage = page;
                state.entries = entries;
                state.isLoading = false;
                state.selectedEntryIds = [];
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to load page';
                state.isLoading = false;
              });
            }
          },

          loadTodayPage: async () => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              const todayPage = await dbOperations.ensureTodayPage();
              await get().loadPage(todayPage.id!);
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to load today page';
                state.isLoading = false;
              });
            }
          },

          createPage: async (input: CreateInput<Page>) => {
            try {
              const id = await db.pages.add(input as Page);
              const page = await db.pages.get(id);
              if (!page) {
throw new Error('Failed to create page');
}

              set((state) => {
                state.pages.push(page);
              });

              return page;
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to create page';
              });
              throw error;
            }
          },

          updatePage: async (pageId: number, updates: UpdateInput<Page>) => {
            // Optimistic update
            set((state) => {
              if (state.currentPage?.id === pageId) {
                Object.assign(state.currentPage, updates);
              }
              const pageIndex = state.pages.findIndex(p => p.id === pageId);
              if (pageIndex !== -1) {
                Object.assign(state.pages[pageIndex], updates);
              }
            });

            try {
              await db.pages.update(pageId, updates);
            } catch (error) {
              // Revert on error
              await get().refreshCurrentPage();
              throw error;
            }
          },

          deletePage: async (pageId: number) => {
            try {
              await db.transaction('rw', db.pages, db.entries, async () => {
                await db.entries.where('pageId').equals(pageId).delete();
                await db.pages.delete(pageId);
              });

              set((state) => {
                state.pages = state.pages.filter(p => p.id !== pageId);
                if (state.currentPage?.id === pageId) {
                  state.currentPage = null;
                  state.entries = [];
                }
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to delete page';
              });
              throw error;
            }
          },

          archivePage: async (pageId: number) => {
            await get().updatePage(pageId, { isArchived: true });
          },

          // Entry Actions
          createEntry: async (input: CreateInput<JournalEntry>) => {
            try {
              const entry = await entryRepository.create(input);

              // Optimistic update
              set((state) => {
                if (state.currentPage?.id === entry.pageId) {
                  state.entries.push(entry);
                }
              });

              return entry;
            } catch (error) {
              await get().refreshCurrentPage();
              throw error;
            }
          },

          updateEntry: async (entryId: number, updates: UpdateInput<JournalEntry>) => {
            // Optimistic update
            set((state) => {
              const entryIndex = state.entries.findIndex(e => e.id === entryId);
              if (entryIndex !== -1) {
                Object.assign(state.entries[entryIndex], updates);
              }
            });

            try {
              await entryRepository.update(entryId, updates);
            } catch (error) {
              await get().refreshCurrentPage();
              throw error;
            }
          },

          deleteEntry: async (entryId: number) => {
            // Optimistic update
            set((state) => {
              state.entries = state.entries.filter(e => e.id !== entryId);
              state.selectedEntryIds = state.selectedEntryIds.filter(id => id !== entryId);
            });

            try {
              await entryRepository.delete(entryId);
            } catch (error) {
              await get().refreshCurrentPage();
              throw error;
            }
          },

          deleteSelectedEntries: async () => {
            const selectedIds = get().selectedEntryIds;
            if (selectedIds.length === 0) {
return;
}

            // Optimistic update
            set((state) => {
              state.entries = state.entries.filter(e => !selectedIds.includes(e.id!));
              state.selectedEntryIds = [];
            });

            try {
              await entryRepository.deleteBulk(selectedIds);
            } catch (error) {
              await get().refreshCurrentPage();
              throw error;
            }
          },

          reorderEntries: async (entryIds: number[]) => {
            const currentPageId = get().currentPage?.id;
            if (!currentPageId) {
return;
}

            // Optimistic update
            set((state) => {
              const entriesMap = new Map(state.entries.map(e => [e.id, e]));
              state.entries = entryIds
                .map(id => entriesMap.get(id))
                .filter((e): e is JournalEntry => e !== undefined);
            });

            try {
              await entryRepository.reorderEntries(currentPageId, entryIds);
            } catch (error) {
              await get().refreshCurrentPage();
              throw error;
            }
          },

          // Task Actions
          completeTask: async (taskId: number) => {
            await get().updateEntry(taskId, {
              status: 'done',
              completedAt: new Date()
            });
          },

          migrateTask: async (taskId: number, newPageId: number) => {
            try {
              await entryRepository.migrateTask(taskId, newPageId);
              
              set((state) => {
                state.entries = state.entries.filter(e => e.id !== taskId);
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to migrate task';
              });
              throw error;
            }
          },

          scheduleTask: async (taskId: number, date: Date) => {
            await get().updateEntry(taskId, {
              status: 'scheduled',
              dueDate: date
            });
          },

          // Collection Actions
          loadCollections: async () => {
            try {
              const collections = await db.collections.toArray();
              set((state) => {
                state.collections = collections;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to load collections';
              });
            }
          },

          createCollection: async (input: CreateInput<Collection>) => {
            try {
              const id = await db.collections.add(input as Collection);
              const collection = await db.collections.get(id);
              if (!collection) {
throw new Error('Failed to create collection');
}

              set((state) => {
                state.collections.push(collection);
              });

              return collection;
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to create collection';
              });
              throw error;
            }
          },

          updateCollection: async (id: number, updates: UpdateInput<Collection>) => {
            set((state) => {
              const index = state.collections.findIndex(c => c.id === id);
              if (index !== -1) {
                Object.assign(state.collections[index], updates);
              }
            });

            try {
              await db.collections.update(id, updates);
            } catch (error) {
              await get().loadCollections();
              throw error;
            }
          },

          deleteCollection: async (id: number) => {
            try {
              await db.collections.delete(id);
              set((state) => {
                state.collections = state.collections.filter(c => c.id !== id);
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to delete collection';
              });
              throw error;
            }
          },

          addPageToCollection: async (collectionId: number, pageId: number) => {
            const collection = await db.collections.get(collectionId);
            if (!collection) {
throw new Error('Collection not found');
}

            if (!collection.pageIds.includes(pageId)) {
              collection.pageIds.push(pageId);
              await get().updateCollection(collectionId, { pageIds: collection.pageIds });
            }
          },

          removePageFromCollection: async (collectionId: number, pageId: number) => {
            const collection = await db.collections.get(collectionId);
            if (!collection) {
throw new Error('Collection not found');
}

            const pageIds = collection.pageIds.filter(id => id !== pageId);
            await get().updateCollection(collectionId, { pageIds });
          },

          // Search Actions
          search: async (filters: SearchFilters) => {
            set((state) => {
              state.isLoading = true;
              state.activeFilters = filters;
            });

            try {
              const results = await entryRepository.search(filters);
              set((state) => {
                state.searchResults = results;
                state.isLoading = false;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Search failed';
                state.isLoading = false;
              });
            }
          },

          clearSearch: () => {
            set((state) => {
              state.searchResults = [];
              state.activeFilters = {};
            });
          },

          setActiveFilters: (filters: SearchFilters) => {
            set((state) => {
              state.activeFilters = filters;
            });
          },

          // Selection Actions
          selectEntry: (entryId: number) => {
            set((state) => {
              if (!state.selectedEntryIds.includes(entryId)) {
                state.selectedEntryIds.push(entryId);
              }
            });
          },

          deselectEntry: (entryId: number) => {
            set((state) => {
              state.selectedEntryIds = state.selectedEntryIds.filter(id => id !== entryId);
            });
          },

          clearSelection: () => {
            set((state) => {
              state.selectedEntryIds = [];
            });
          },

          selectAll: () => {
            set((state) => {
              state.selectedEntryIds = state.entries.map(e => e.id!);
            });
          },

          // Utility Actions
          refreshCurrentPage: async () => {
            const currentPageId = get().currentPage?.id;
            if (currentPageId) {
              await get().loadPage(currentPageId);
            }
          },

          loadRecentPages: async (limit: number = 10) => {
            try {
              const pages = await db.pages
                .orderBy('updatedAt')
                .reverse()
                .limit(limit)
                .toArray();
              
              set((state) => {
                state.pages = pages;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to load recent pages';
              });
            }
          },

          exportPage: async (pageId: number) => {
            const page = await db.pages.get(pageId);
            const entries = await entryRepository.getByPage(pageId);
            
            if (!page) {
throw new Error('Page not found');
}
            
            const exportData = {
              page,
              entries,
              exportedAt: new Date().toISOString()
            };
            
            return JSON.stringify(exportData, null, 2);
          },

          // Computed getters
          getEntriesByType: (type: EntryType) => {
            return get().entries.filter(e => e.type === type);
          },

          getTasksByStatus: (status: TaskStatus) => {
            return get().entries.filter(e => e.type === 'task' && e.status === status);
          }
        }))
      ),
      {
        name: 'journal-store',
        // Only persist UI state, not data (data is in IndexedDB)
        partialize: (state) => ({
          selectedEntryIds: state.selectedEntryIds,
          activeFilters: state.activeFilters
        })
      }
    )
  )
);