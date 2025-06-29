// ABOUTME: Dexie database setup for IndexedDB with all tables and indexes
// Handles database initialization, versioning, and exports the db instance

import Dexie, { Table } from 'dexie';

import {
  JournalEntry,
  Page,
  Collection,
  Template,
  Habit,
  HabitEntry,
  UserSettings,
  SyncStatus,
  DailyStats,
  DB_VERSION
} from '../types';

// Define the database class extending Dexie
export class BujoDatabase extends Dexie {
  // Declare table properties
  entries!: Table<JournalEntry, number>;
  pages!: Table<Page, number>;
  collections!: Table<Collection, number>;
  templates!: Table<Template, number>;
  habits!: Table<Habit, number>;
  habitEntries!: Table<HabitEntry, number>;
  settings!: Table<UserSettings, number>;
  syncStatus!: Table<SyncStatus, number>;
  dailyStats!: Table<DailyStats, string>; // Keyed by date string

  constructor() {
    super('BujoDatabase');

    // Define database schema
    this.version(DB_VERSION).stores({
      // Journal entries with comprehensive indexes for fast queries
      entries: '++id, pageId, type, date, [pageId+type], [type+status], *tags, priority, parentId, [date+type], [pageId+order]',
      
      // Pages with indexes for date-based and type queries
      pages: '++id, type, date, [type+date], [type+isArchived], *tags, templateId, order',
      
      // Collections
      collections: '++id, name, isArchived',
      
      // Templates
      templates: '++id, name, type, isDefault',
      
      // Habits
      habits: '++id, name, frequency, isActive',
      
      // Habit entries indexed by habit and date
      habitEntries: '++id, habitId, date, [habitId+date], completed',
      
      // Settings (single record table)
      settings: '++id',
      
      // Sync tracking
      syncStatus: '++id, [tableName+recordId], lastSyncAt',
      
      // Daily statistics cached for performance
      dailyStats: 'date, [date+tasksCompleted], [date+totalEntries]'
    });

    // Hook to add timestamps on create
    this.entries.hook('creating', (primKey, obj) => {
      const now = new Date();
      obj.createdAt = now;
      obj.updatedAt = now;
      if (!obj.order) {
        // Auto-increment order within page
        return this.entries
          .where('pageId')
          .equals(obj.pageId)
          .count()
          .then(count => {
            obj.order = count;
          });
      }
    });

    this.pages.hook('creating', (primKey, obj) => {
      const now = new Date();
      obj.createdAt = now;
      obj.updatedAt = now;
      if (!obj.isArchived) {
obj.isArchived = false;
}
      if (!obj.tags) {
obj.tags = [];
}
    });

    this.collections.hook('creating', (primKey, obj) => {
      const now = new Date();
      obj.createdAt = now;
      obj.updatedAt = now;
      if (!obj.isArchived) {
obj.isArchived = false;
}
      if (!obj.pageIds) {
obj.pageIds = [];
}
    });

    this.templates.hook('creating', (primKey, obj) => {
      const now = new Date();
      obj.createdAt = now;
      obj.updatedAt = now;
      if (!obj.isDefault) {
obj.isDefault = false;
}
    });

    this.habits.hook('creating', (primKey, obj) => {
      const now = new Date();
      obj.createdAt = now;
      obj.updatedAt = now;
      if (!obj.isActive) {
obj.isActive = true;
}
    });

    this.habitEntries.hook('creating', (primKey, obj) => {
      const now = new Date();
      obj.createdAt = now;
      obj.updatedAt = now;
    });

    this.settings.hook('creating', (primKey, obj) => {
      const now = new Date();
      obj.createdAt = now;
      obj.updatedAt = now;
    });

    // Hook to update timestamps on modify
    const updateTimestamp = (modifications: any) => {
      modifications.updatedAt = new Date();
    };

    this.entries.hook('updating', updateTimestamp);
    this.pages.hook('updating', updateTimestamp);
    this.collections.hook('updating', updateTimestamp);
    this.templates.hook('updating', updateTimestamp);
    this.habits.hook('updating', updateTimestamp);
    this.habitEntries.hook('updating', updateTimestamp);
    this.settings.hook('updating', updateTimestamp);

    // Initialize database with default data
    this.on('ready', async () => {
      // Check if settings exist, if not create defaults
      const settingsCount = await this.settings.count();
      if (settingsCount === 0) {
        await this.settings.add({
          theme: 'system',
          defaultPageType: 'daily',
          defaultTaskStatus: 'todo',
          weekStartsOn: 1, // Monday
          enableNotifications: true,
          bulletStyles: {
            task: '•',
            event: '○',
            note: '–',
            migrated: '>',
            scheduled: '<',
            cancelled: '×'
          },
          fontSize: 'medium',
          fontFamily: 'system-ui',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          syncEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Create default templates if none exist
      const templateCount = await this.templates.count();
      if (templateCount === 0) {
        await this.templates.bulkAdd([
          {
            name: 'Daily Log',
            type: 'daily',
            structure: {
              sections: [
                {
                  id: 'tasks',
                  title: 'Tasks',
                  type: 'entries',
                  config: { entryType: 'task' }
                },
                {
                  id: 'notes',
                  title: 'Notes',
                  type: 'entries',
                  config: { entryType: 'note' }
                },
                {
                  id: 'gratitude',
                  title: 'Gratitude',
                  type: 'text'
                }
              ]
            },
            isDefault: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: 'Weekly Review',
            type: 'weekly',
            structure: {
              sections: [
                {
                  id: 'accomplishments',
                  title: 'Accomplishments',
                  type: 'text'
                },
                {
                  id: 'next-week',
                  title: 'Next Week',
                  type: 'entries',
                  config: { entryType: 'task' }
                },
                {
                  id: 'habits',
                  title: 'Habit Tracker',
                  type: 'habit-tracker'
                }
              ]
            },
            isDefault: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]);
      }
    });
  }

  // Database maintenance methods
  async clearAll(): Promise<void> {
    await this.transaction('rw', this.tables, async () => {
      await Promise.all(this.tables.map(table => table.clear()));
    });
  }

  async exportDatabase(): Promise<any> {
    const allData: any = {};
    await this.transaction('r', this.tables, async () => {
      for (const table of this.tables) {
        allData[table.name] = await table.toArray();
      }
    });
    return {
      version: DB_VERSION,
      exportedAt: new Date(),
      data: allData
    };
  }

  async importDatabase(data: any): Promise<void> {
    if (data.version !== DB_VERSION) {
      throw new Error(`Database version mismatch. Expected ${DB_VERSION}, got ${data.version}`);
    }
    
    await this.transaction('rw', this.tables, async () => {
      // Clear existing data
      await Promise.all(this.tables.map(table => table.clear()));
      
      // Import new data
      for (const tableName in data.data) {
        const table = this.table(tableName);
        if (table && data.data[tableName].length > 0) {
          await table.bulkAdd(data.data[tableName]);
        }
      }
    });
  }

  // Performance optimization: Bulk operations for large datasets
  async bulkCreateEntries(entries: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<number[]> {
    const now = new Date();
    const entriesWithTimestamps = entries.map(entry => ({
      ...entry,
      createdAt: now,
      updatedAt: now
    }));
    
    return await this.entries.bulkAdd(entriesWithTimestamps, { allKeys: true });
  }

  // Calculate daily statistics
  async calculateDailyStats(date: Date): Promise<DailyStats> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [entries, habitEntries] = await Promise.all([
      this.entries.where('date').between(startOfDay, endOfDay).toArray(),
      this.habitEntries.where('date').between(startOfDay, endOfDay).toArray()
    ]);

    const stats: DailyStats = {
      date: startOfDay,
      tasksCreated: entries.filter(e => e.type === 'task').length,
      tasksCompleted: entries.filter(e => e.type === 'task' && e.status === 'done').length,
      notesCreated: entries.filter(e => e.type === 'note').length,
      eventsCreated: entries.filter(e => e.type === 'event').length,
      habitsCompleted: habitEntries.filter(e => e.completed).length,
      totalEntries: entries.length
    };

    // Calculate productivity score (example formula)
    if (stats.tasksCreated > 0) {
      stats.productivityScore = Math.round((stats.tasksCompleted / stats.tasksCreated) * 100);
    }

    // Cache the stats
    await this.dailyStats.put(stats, startOfDay.toISOString().split('T')[0]);

    return stats;
  }
}

// Create and export the database instance
export const db = new BujoDatabase();

// Export database operations for convenience
export const dbOperations = {
  // Check if database is empty (first time user)
  async isEmpty(): Promise<boolean> {
    const pageCount = await db.pages.count();
    return pageCount === 0;
  },

  // Create today's daily log if it doesn't exist
  async ensureTodayPage(): Promise<Page> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let todayPage = await db.pages
      .where(['type', 'date'])
      .equals(['daily', today])
      .first();
    
    if (!todayPage) {
      const template = await db.templates
        .where(['type', 'isDefault'])
        .equals(['daily', 1])
        .first();
      
      const id = await db.pages.add({
        type: 'daily',
        title: today.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        date: today,
        templateId: template?.id,
        tags: [],
        isArchived: false,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      todayPage = await db.pages.get(id);
    }
    
    return todayPage!;
  },

  // Vacuum database (clean up old data)
  async vacuum(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const deletedCount = await db.transaction('rw', db.pages, db.entries, async () => {
      // Find old archived pages
      const oldPages = await db.pages
        .where('isArchived')
        .equals(1)
        .and(page => page.date < cutoffDate)
        .toArray();
      
      const pageIds = oldPages.map(p => p.id!);
      
      // Delete entries for old pages
      await db.entries.where('pageId').anyOf(pageIds).delete();
      
      // Delete the pages
      await db.pages.bulkDelete(pageIds);
      
      return pageIds.length;
    });
    
    return deletedCount;
  }
};