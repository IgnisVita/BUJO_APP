// ABOUTME: Repository pattern for journal entries with CRUD operations
// Provides methods for querying, filtering, sorting, and managing entries

import {
  JournalEntry,
  EntryType,
  TaskStatus,
  EntryPriority,
  SearchFilters,
  SearchResult,
  CreateInput,
  UpdateInput
} from '../../types';
import { db } from '../database';

export class EntryRepository {
  // Create a new entry
  async create(input: CreateInput<JournalEntry>): Promise<JournalEntry> {
    const id = await db.entries.add(input as JournalEntry);
    const entry = await db.entries.get(id);
    if (!entry) {
throw new Error('Failed to create entry');
}
    return entry;
  }

  // Create multiple entries in bulk (optimized for performance)
  async createBulk(inputs: CreateInput<JournalEntry>[]): Promise<JournalEntry[]> {
    const ids = await db.bulkCreateEntries(inputs);
    const entries = await db.entries.bulkGet(ids);
    return entries.filter((e): e is JournalEntry => e !== undefined);
  }

  // Get entry by ID
  async getById(id: number): Promise<JournalEntry | undefined> {
    return await db.entries.get(id);
  }

  // Update an entry
  async update(id: number, updates: UpdateInput<JournalEntry>): Promise<JournalEntry> {
    await db.entries.update(id, updates);
    const entry = await db.entries.get(id);
    if (!entry) {
throw new Error('Entry not found');
}
    return entry;
  }

  // Delete an entry
  async delete(id: number): Promise<void> {
    await db.entries.delete(id);
  }

  // Delete multiple entries
  async deleteBulk(ids: number[]): Promise<void> {
    await db.entries.bulkDelete(ids);
  }

  // Get all entries for a specific page
  async getByPage(pageId: number): Promise<JournalEntry[]> {
    return await db.entries
      .where('pageId')
      .equals(pageId)
      .sortBy('order');
  }

  // Get entries by type
  async getByType(type: EntryType, limit?: number): Promise<JournalEntry[]> {
    const query = db.entries.where('type').equals(type);
    
    if (limit) {
      return await query.limit(limit).toArray();
    }
    
    return await query.toArray();
  }

  // Get tasks by status
  async getTasksByStatus(status: TaskStatus): Promise<JournalEntry[]> {
    return await db.entries
      .where('[type+status]')
      .equals(['task', status])
      .toArray();
  }

  // Get entries by date range
  async getByDateRange(startDate: Date, endDate: Date): Promise<JournalEntry[]> {
    return await db.entries
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  // Get entries with specific tags
  async getByTags(tags: string[]): Promise<JournalEntry[]> {
    if (tags.length === 0) {
return [];
}
    
    // Get entries that have any of the specified tags
    return await db.entries
      .where('tags')
      .anyOf(tags)
      .toArray();
  }

  // Get overdue tasks
  async getOverdueTasks(): Promise<JournalEntry[]> {
    const now = new Date();
    return await db.entries
      .filter(entry => 
        entry.type === 'task' &&
        entry.status === 'todo' &&
        entry.dueDate &&
        entry.dueDate < now
      )
      .toArray();
  }

  // Get upcoming tasks (next 7 days)
  async getUpcomingTasks(days: number = 7): Promise<JournalEntry[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    
    return await db.entries
      .filter(entry =>
        entry.type === 'task' &&
        entry.status === 'todo' &&
        entry.dueDate &&
        entry.dueDate >= now &&
        entry.dueDate <= future
      )
      .sortBy('dueDate');
  }

  // Search entries with filters
  async search(filters: SearchFilters): Promise<SearchResult[]> {
    let query = db.entries.toCollection();
    
    // Apply type filter
    if (filters.types && filters.types.length > 0) {
      query = query.filter(entry => filters.types!.includes(entry.type));
    }
    
    // Apply status filter (for tasks)
    if (filters.statuses && filters.statuses.length > 0) {
      query = query.filter(entry => 
        entry.type === 'task' && filters.statuses!.includes(entry.status!)
      );
    }
    
    // Apply priority filter
    if (filters.priorities && filters.priorities.length > 0) {
      query = query.filter(entry => 
        entry.priority && filters.priorities!.includes(entry.priority)
      );
    }
    
    // Apply date range filter
    if (filters.dateFrom || filters.dateTo) {
      query = query.filter(entry => {
        if (filters.dateFrom && entry.date < filters.dateFrom) {
return false;
}
        if (filters.dateTo && entry.date > filters.dateTo) {
return false;
}
        return true;
      });
    }
    
    // Apply page filter
    if (filters.pageIds && filters.pageIds.length > 0) {
      query = query.filter(entry => filters.pageIds!.includes(entry.pageId));
    }
    
    const entries = await query.toArray();
    
    // Apply text search and calculate relevance
    let results: SearchResult[] = [];
    
    if (filters.query) {
      const searchTerms = filters.query.toLowerCase().split(' ');
      
      for (const entry of entries) {
        const content = entry.content.toLowerCase();
        const tagsStr = entry.tags.join(' ').toLowerCase();
        
        let relevance = 0;
        const highlights: string[] = [];
        
        for (const term of searchTerms) {
          if (content.includes(term)) {
            relevance += 2;
            highlights.push(term);
          }
          if (tagsStr.includes(term)) {
            relevance += 1;
          }
        }
        
        if (relevance > 0) {
          const page = await db.pages.get(entry.pageId);
          if (page) {
            results.push({
              entry,
              page,
              highlights,
              relevance
            });
          }
        }
      }
      
      // Sort by relevance
      results.sort((a, b) => b.relevance - a.relevance);
    } else {
      // No text search, return all filtered entries
      for (const entry of entries) {
        const page = await db.pages.get(entry.pageId);
        if (page) {
          results.push({
            entry,
            page,
            relevance: 1
          });
        }
      }
    }
    
    // Apply tag filter on results
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(result =>
        filters.tags!.some(tag => result.entry.tags.includes(tag))
      );
    }
    
    return results;
  }

  // Get child entries (for nested entries)
  async getChildren(parentId: number): Promise<JournalEntry[]> {
    return await db.entries
      .where('parentId')
      .equals(parentId)
      .sortBy('order');
  }

  // Reorder entries within a page
  async reorderEntries(pageId: number, entryIds: number[]): Promise<void> {
    await db.transaction('rw', db.entries, async () => {
      for (let i = 0; i < entryIds.length; i++) {
        await db.entries.update(entryIds[i], { order: i });
      }
    });
  }

  // Migrate task to another page
  async migrateTask(taskId: number, newPageId: number): Promise<JournalEntry> {
    const task = await this.getById(taskId);
    if (!task || task.type !== 'task') {
      throw new Error('Task not found');
    }
    
    // Get the order for the new page
    const maxOrder = await db.entries
      .where('pageId')
      .equals(newPageId)
      .toArray()
      .then(entries => Math.max(...entries.map(e => e.order), -1));
    
    const updated = await this.update(taskId, {
      pageId: newPageId,
      status: 'migrated',
      order: maxOrder + 1
    });
    
    return updated;
  }

  // Complete a task
  async completeTask(taskId: number): Promise<JournalEntry> {
    const task = await this.getById(taskId);
    if (!task || task.type !== 'task') {
      throw new Error('Task not found');
    }
    
    return await this.update(taskId, {
      status: 'done',
      completedAt: new Date()
    });
  }

  // Get statistics for entries
  async getStatistics(pageId?: number): Promise<{
    total: number;
    byType: Record<EntryType, number>;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<EntryPriority, number>;
  }> {
    let entries: JournalEntry[];
    
    if (pageId) {
      entries = await this.getByPage(pageId);
    } else {
      entries = await db.entries.toArray();
    }
    
    const stats = {
      total: entries.length,
      byType: {} as Record<EntryType, number>,
      byStatus: {} as Record<TaskStatus, number>,
      byPriority: {} as Record<EntryPriority, number>
    };
    
    // Initialize counters
    const types: EntryType[] = ['task', 'note', 'event', 'habit'];
    const statuses: TaskStatus[] = ['todo', 'done', 'migrated', 'cancelled', 'scheduled'];
    const priorities: EntryPriority[] = ['low', 'medium', 'high'];
    
    types.forEach(type => stats.byType[type] = 0);
    statuses.forEach(status => stats.byStatus[status] = 0);
    priorities.forEach(priority => stats.byPriority[priority] = 0);
    
    // Count entries
    entries.forEach(entry => {
      stats.byType[entry.type]++;
      
      if (entry.type === 'task' && entry.status) {
        stats.byStatus[entry.status]++;
      }
      
      if (entry.priority) {
        stats.byPriority[entry.priority]++;
      }
    });
    
    return stats;
  }

  // Clone entries to another page
  async cloneToPage(entryIds: number[], targetPageId: number): Promise<JournalEntry[]> {
    const entries = await db.entries.bulkGet(entryIds);
    const validEntries = entries.filter((e): e is JournalEntry => e !== undefined);
    
    const clonedEntries = validEntries.map(entry => {
      const { id, createdAt, updatedAt, ...rest } = entry;
      return {
        ...rest,
        pageId: targetPageId,
        content: `[Copied] ${entry.content}`
      };
    });
    
    return await this.createBulk(clonedEntries);
  }
}

// Export singleton instance
export const entryRepository = new EntryRepository();