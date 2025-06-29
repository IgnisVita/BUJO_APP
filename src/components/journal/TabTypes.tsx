// ABOUTME: Tab type definitions and implementations for different journal categories
// Defines time-based, life area, custom, and smart tab types with their properties

import React from 'react';
import { Calendar, Clock, Briefcase, Heart, Activity, DollarSign, Folder, Star, Archive, History } from 'lucide-react';

export type TabType = 'time-based' | 'life-area' | 'custom' | 'smart';

export interface Tab {
  id: string;
  name: string;
  type: TabType;
  icon?: string;
  color?: string;
  description?: string;
  createdAt: Date;
  lastAccessed: Date;
  settings?: TabSettings;
  metadata?: Record<string, any>;
}

export interface TabSettings {
  autoSwitch?: boolean;
  autoSwitchRules?: AutoSwitchRule[];
  sharing?: SharingSettings;
  template?: string;
  defaultView?: 'dot-grid' | 'list' | 'calendar';
}

export interface AutoSwitchRule {
  type: 'time' | 'location' | 'event';
  condition: string;
  targetTabId?: string;
}

export interface SharingSettings {
  sharedAcrossTime: boolean;
  syncedTabs?: string[];
}

// Predefined tab templates
export const TAB_TEMPLATES = {
  timeBasedTabs: [
    {
      id: 'today',
      name: 'Today',
      type: 'time-based' as TabType,
      icon: '📅',
      description: 'Your daily journal and tasks',
      metadata: { period: 'day' }
    },
    {
      id: 'this-week',
      name: 'This Week',
      type: 'time-based' as TabType,
      icon: '📆',
      description: 'Weekly overview and planning',
      metadata: { period: 'week' }
    },
    {
      id: 'this-month',
      name: 'This Month',
      type: 'time-based' as TabType,
      icon: '📊',
      description: 'Monthly goals and review',
      metadata: { period: 'month' }
    },
    {
      id: 'future-log',
      name: 'Future Log',
      type: 'time-based' as TabType,
      icon: '🚀',
      description: 'Next 6 months planning',
      metadata: { period: 'future' }
    }
  ],

  lifeAreaTabs: [
    {
      id: 'work',
      name: 'Work',
      type: 'life-area' as TabType,
      icon: '💼',
      color: '#3B82F6',
      description: 'Professional tasks and projects'
    },
    {
      id: 'personal',
      name: 'Personal',
      type: 'life-area' as TabType,
      icon: '🏠',
      color: '#10B981',
      description: 'Personal life and relationships'
    },
    {
      id: 'health',
      name: 'Health',
      type: 'life-area' as TabType,
      icon: '❤️',
      color: '#EF4444',
      description: 'Health, fitness, and wellness'
    },
    {
      id: 'finance',
      name: 'Finance',
      type: 'life-area' as TabType,
      icon: '💰',
      color: '#F59E0B',
      description: 'Budget, expenses, and investments'
    },
    {
      id: 'projects',
      name: 'Projects',
      type: 'life-area' as TabType,
      icon: '📁',
      color: '#8B5CF6',
      description: 'Active projects and goals'
    }
  ],

  smartTabs: [
    {
      id: 'recently-used',
      name: 'Recent',
      type: 'smart' as TabType,
      icon: '🕐',
      description: 'Recently accessed entries',
      metadata: { query: 'recent' }
    },
    {
      id: 'favorites',
      name: 'Favorites',
      type: 'smart' as TabType,
      icon: '⭐',
      color: '#FBBF24',
      description: 'Starred and important entries',
      metadata: { query: 'starred' }
    },
    {
      id: 'archive',
      name: 'Archive',
      type: 'smart' as TabType,
      icon: '📦',
      description: 'Archived entries and completed items',
      metadata: { query: 'archived' }
    }
  ]
};

// Tab groups for organization
export interface TabGroup {
  id: string;
  name: string;
  tabs: string[]; // Tab IDs
  collapsed?: boolean;
}

// Icon suggestions for custom tabs
export const ICON_SUGGESTIONS = {
  activities: ['🎨', '🎵', '📚', '🎮', '🏃', '🧘', '🍳', '📷', '✈️', '🎭'],
  emotions: ['😊', '😎', '🤔', '😴', '🙏', '💪', '🎯', '✨', '🔥', '💡'],
  nature: ['🌱', '🌸', '🌊', '🏔️', '🌙', '☀️', '🌈', '⭐', '🍃', '❄️'],
  symbols: ['📌', '🔖', '📎', '🔗', '🎪', '🎁', '🔔', '💎', '🔮', '🎲']
};

// Color palette for tabs
export const COLOR_PALETTE = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#22C55E', // Green
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#6B7280', // Gray
];

// Tab component interface
export interface TabComponentProps {
  tab: Tab;
  content?: any;
  onContentChange?: (content: any) => void;
}

// Helper functions
export const createTab = (params: Partial<Tab>): Tab => {
  const now = new Date();
  return {
    id: params.id || `tab-${Date.now()}`,
    name: params.name || 'New Tab',
    type: params.type || 'custom',
    icon: params.icon,
    color: params.color,
    description: params.description,
    createdAt: params.createdAt || now,
    lastAccessed: params.lastAccessed || now,
    settings: params.settings,
    metadata: params.metadata
  };
};

export const getTabIcon = (tab: Tab): React.ReactNode => {
  if (tab.icon) {
    return <span role="img" aria-label={tab.name}>{tab.icon}</span>;
  }

  // Default icons based on type
  switch (tab.type) {
    case 'time-based':
      return <Calendar className="w-4 h-4" />;
    case 'life-area':
      return <Folder className="w-4 h-4" />;
    case 'smart':
      return <Star className="w-4 h-4" />;
    default:
      return <Folder className="w-4 h-4" />;
  }
};

export const getTimeBasedTabContent = (period: string): Date[] => {
  const now = new Date();
  const dates: Date[] = [];

  switch (period) {
    case 'day':
      dates.push(now);
      break;
    case 'week':
      // Get current week (Monday to Sunday)
      const monday = new Date(now);
      monday.setDate(now.getDate() - now.getDay() + 1);
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date);
      }
      break;
    case 'month':
      // Get all days in current month
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      break;
    case 'future':
      // Next 6 months
      for (let i = 0; i < 6; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
        dates.push(month);
      }
      break;
  }

  return dates;
};