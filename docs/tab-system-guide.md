# Multi-Tab Journal System Guide

## Overview

The multi-tab system allows you to organize your digital bullet journal with unlimited flexibility, similar to having multiple notebooks in one. Each tab maintains its own dot grid canvas with independent content while sharing customization settings.

## Features

### Tab Types

1. **Time-Based Tabs** (Auto-updating)
   - **Today**: Always shows the current day
   - **This Week**: Monday-Sunday view with single day or grid layout
   - **This Month**: Calendar grid view with day selection
   - **Future Log**: Next 6 months planning view

2. **Life Area Tabs**
   - Work (💼)
   - Personal (🏠)
   - Health (❤️)
   - Finance (💰)
   - Projects (📁)

3. **Custom Tabs**
   - Create unlimited custom tabs
   - Choose icons and colors
   - Set descriptions

4. **Smart Tabs**
   - Recently Used (🕐)
   - Favorites (⭐)
   - Archive (📦)

### Navigation

#### Keyboard Shortcuts
- **Ctrl/Cmd + 1-9**: Switch to tab by position
- **Ctrl/Cmd + Tab**: Cycle forward through tabs
- **Ctrl/Cmd + Shift + Tab**: Cycle backward through tabs
- **Alt + Left/Right**: Navigate tab history (back/forward)

#### Mouse/Touch
- Click tabs to switch
- Drag tabs to reorder
- Scroll horizontally when tabs overflow
- Mobile drawer for easy access on small screens

### Tab Customization

1. **Create New Tab**
   - Click the "+" button
   - Choose a template or start from scratch
   - Customize name, icon, color, and description

2. **Configure Tab**
   - Set default view (dot grid, list, calendar)
   - Enable content sharing across time periods
   - Configure auto-switch rules

3. **Auto-Switch Rules**
   - **Time-based**: Switch at specific times
   - **Location-based**: Switch based on location
   - **Event-based**: Switch based on calendar events

### Mobile Experience

- Responsive design with mobile-optimized UI
- Tab drawer for easy navigation
- Touch-friendly controls
- Swipe gestures (coming soon)

## Usage Example

```tsx
import { TabSystem } from '@/components/journal/TabSystem';
import { DotGrid } from '@/components/DotGrid';

function MyJournal() {
  return (
    <TabSystem onTabChange={(tab) => console.log('Tab changed:', tab)}>
      <DotGrid />
    </TabSystem>
  );
}
```

## Tab State Management

The `useTabSync` hook manages:
- Tab persistence in localStorage
- Cross-browser tab synchronization
- Navigation history (up to 50 entries)
- Auto-switching based on rules
- Last accessed timestamps

## Customization Tips

1. **Color Coding**: Use colors to visually group related tabs
2. **Icons**: Choose meaningful emojis that represent each tab's purpose
3. **Auto-Switch**: Set up time-based rules to automatically switch to work tabs during office hours
4. **Sharing**: Enable content sharing for tabs that need to be accessible across all time periods

## Architecture

```
src/
├── components/
│   └── journal/
│       ├── TabSystem.tsx      # Main container
│       ├── TabTypes.tsx       # Type definitions
│       ├── TimeBasedTabs.tsx  # Auto-updating tabs
│       └── TabCustomizer.tsx  # Configuration UI
└── hooks/
    └── useTabSync.ts          # State management
```

## Future Enhancements

- Tab groups/sections
- Tab templates marketplace
- Collaborative tabs
- Tab analytics
- Export/import tab configurations
- Voice-activated tab switching