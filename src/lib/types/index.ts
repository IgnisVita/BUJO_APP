// ABOUTME: Complete TypeScript interfaces for the bullet journal PWA
// Defines all data types used throughout the application

// Base timestamp interface for auditing
interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

// Journal entry types
export type EntryType = 'task' | 'note' | 'event' | 'habit';
export type TaskStatus = 'todo' | 'done' | 'migrated' | 'cancelled' | 'scheduled';
export type EntryPriority = 'low' | 'medium' | 'high';

// Drawing/sketch data
export interface Drawing {
  id?: number;
  entryId?: number;
  pageId?: number;
  data: string; // Base64 or SVG data
  width: number;
  height: number;
  type: 'sketch' | 'diagram' | 'doodle';
}

// Journal entry
export interface JournalEntry extends Timestamps {
  id?: number;
  pageId: number;
  type: EntryType;
  content: string;
  status?: TaskStatus; // Only for task type
  priority?: EntryPriority;
  date: Date;
  tags: string[];
  dueDate?: Date;
  completedAt?: Date;
  drawing?: Drawing;
  parentId?: number; // For nested entries
  order: number; // For sorting within a page
}

// Page types
export type PageType = 'daily' | 'weekly' | 'monthly' | 'future' | 'collection' | 'index';

// Page/spread
export interface Page extends Timestamps {
  id?: number;
  type: PageType;
  title: string;
  date: Date; // For daily/weekly/monthly logs
  content?: string; // For custom content
  templateId?: number;
  tags: string[];
  isArchived: boolean;
  order: number; // For custom ordering
}

// Collection types
export interface Collection extends Timestamps {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  pageIds: number[];
  isArchived: boolean;
}

// Template for recurring page layouts
export interface Template extends Timestamps {
  id?: number;
  name: string;
  type: PageType;
  structure: {
    sections: TemplateSection[];
  };
  isDefault: boolean;
}

export interface TemplateSection {
  id: string;
  title: string;
  type: 'entries' | 'text' | 'habit-tracker' | 'mood-tracker' | 'custom';
  config?: Record<string, any>;
}

// Habit tracking
export interface Habit extends Timestamps {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetDays?: number[]; // 0-6 for weekly, 1-31 for monthly
  isActive: boolean;
}

export interface HabitEntry extends Timestamps {
  id?: number;
  habitId: number;
  date: Date;
  completed: boolean;
  note?: string;
  value?: number; // For quantifiable habits
}

// User settings and preferences
export interface UserSettings extends Timestamps {
  id?: number;
  theme: 'light' | 'dark' | 'system';
  defaultPageType: PageType;
  defaultTaskStatus: TaskStatus;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0
  enableNotifications: boolean;
  notificationTime?: string; // HH:MM format
  bulletStyles: {
    task: string;
    event: string;
    note: string;
    migrated: string;
    scheduled: string;
    cancelled: string;
  };
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: string;
  language: string;
  timezone: string;
  syncEnabled: boolean;
  lastSyncAt?: Date;
}

// Search and filter interfaces
export interface SearchFilters {
  query?: string;
  types?: EntryType[];
  statuses?: TaskStatus[];
  priorities?: EntryPriority[];
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  pageIds?: number[];
  collectionIds?: number[];
}

export interface SearchResult {
  entry: JournalEntry;
  page: Page;
  highlights?: string[];
  relevance: number;
}

// Sync and conflict resolution
export interface SyncStatus {
  id?: number;
  tableName: string;
  recordId: number;
  localVersion: number;
  syncedVersion: number;
  lastSyncAt?: Date;
  conflictResolution?: 'local' | 'remote' | 'merged';
}

// Statistics and analytics
export interface DailyStats {
  date: Date;
  tasksCreated: number;
  tasksCompleted: number;
  notesCreated: number;
  eventsCreated: number;
  habitsCompleted: number;
  totalEntries: number;
  productivityScore?: number;
}

// Export/Import formats
export interface ExportData {
  version: string;
  exportedAt: Date;
  settings: UserSettings;
  pages: Page[];
  entries: JournalEntry[];
  collections: Collection[];
  habits: Habit[];
  habitEntries: HabitEntry[];
  templates: Template[];
}

// UI State types (for store)
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  component: string;
  props?: Record<string, any>;
}

// Database schema version
export const DB_VERSION = 1;

// Type guards
export const isTask = (entry: JournalEntry): boolean => entry.type === 'task';
export const isNote = (entry: JournalEntry): boolean => entry.type === 'note';
export const isEvent = (entry: JournalEntry): boolean => entry.type === 'event';
export const isHabit = (entry: JournalEntry): boolean => entry.type === 'habit';

// Utility types
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type WithoutId<T> = Omit<T, 'id'>;
export type CreateInput<T> = WithoutId<Omit<T, keyof Timestamps>>;
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt'>>;