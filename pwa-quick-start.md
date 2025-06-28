# Digital Bullet Journal - PWA Quick Start Guide

## 🚀 From Zero to Working App in 1 Hour

### Prerequisites
- Node.js 18+ installed
- Basic knowledge of React/JavaScript
- Code editor (VS Code recommended)

---

## Step 1: Create Your Project (5 minutes)

```bash
# Create Next.js app with all the goodies
npx create-next-app@latest digital-bujo --typescript --tailwind --app

# Navigate to project
cd digital-bujo

# Install essential packages
npm install fabric dexie zustand recharts
npm install @serwist/next serwist
npm install -D @types/fabric
```

---

## Step 2: Set Up PWA Configuration (10 minutes)

### Create PWA Manifest
```json
// public/manifest.json
{
  "name": "Digital Bullet Journal",
  "short_name": "BuJo",
  "description": "Your all-in-one life operating system",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0066CC",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Update Next.js Config
```javascript
// next.config.js
const withSerwist = require("@serwist/next").default({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

module.exports = withSerwist({
  // Your Next.js config
});
```

### Create Service Worker
```typescript
// app/sw.ts
import { defaultCache } from "@serwist/next/worker";
import { installSerwist } from "@serwist/sw";

installSerwist({
  precacheEntries: defaultCache,
  skipWaiting: true,
  clientsClaim: true,
});
```

---

## Step 3: Set Up Database (10 minutes)

```typescript
// lib/db.ts
import Dexie, { Table } from 'dexie';

// Define your data types
export interface JournalEntry {
  id?: number;
  date: Date;
  type: 'task' | 'event' | 'note';
  content: string;
  completed?: boolean;
  symbol?: string;
}

export interface Drawing {
  id?: number;
  pageId: number;
  data: string;
  created: Date;
}

// Create database class
class BulletJournalDB extends Dexie {
  entries!: Table<JournalEntry>;
  drawings!: Table<Drawing>;
  
  constructor() {
    super('BulletJournalDB');
    this.version(1).stores({
      entries: '++id, date, type',
      drawings: '++id, pageId, created'
    });
  }
}

// Export database instance
export const db = new BulletJournalDB();
```

---

## Step 4: Create State Management (5 minutes)

```typescript
// lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JournalEntry } from './db';

interface JournalStore {
  currentDate: Date;
  entries: JournalEntry[];
  
  // Actions
  setDate: (date: Date) => void;
  addEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  toggleTask: (id: number) => void;
  deleteEntry: (id: number) => void;
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set) => ({
      currentDate: new Date(),
      entries: [],
      
      setDate: (date) => set({ currentDate: date }),
      
      addEntry: (entry) => set((state) => ({
        entries: [...state.entries, { ...entry, id: Date.now() }]
      })),
      
      toggleTask: (id) => set((state) => ({
        entries: state.entries.map(e =>
          e.id === id ? { ...e, completed: !e.completed } : e
        )
      })),
      
      deleteEntry: (id) => set((state) => ({
        entries: state.entries.filter(e => e.id !== id)
      }))
    }),
    {
      name: 'journal-storage',
    }
  )
);
```

---

## Step 5: Create Basic UI Components (15 minutes)

### Journal Entry Component
```typescript
// app/components/JournalEntry.tsx
'use client';

import { useState } from 'react';
import { useJournalStore } from '@/lib/store';

export function JournalEntryInput() {
  const [input, setInput] = useState('');
  const addEntry = useJournalStore(state => state.addEntry);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Detect entry type based on first character
    let type: 'task' | 'event' | 'note' = 'note';
    let symbol = '-';
    
    if (input.startsWith('* ') || input.startsWith('• ')) {
      type = 'task';
      symbol = '•';
    } else if (input.startsWith('o ') || input.startsWith('○ ')) {
      type = 'event';
      symbol = '○';
    }
    
    addEntry({
      date: new Date(),
      type,
      symbol,
      content: input.replace(/^[*•o○-]\s*/, ''),
      completed: false
    });
    
    setInput('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="• Task  ○ Event  - Note"
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </form>
  );
}
```

### Entry List Component
```typescript
// app/components/EntryList.tsx
'use client';

import { useJournalStore } from '@/lib/store';

export function EntryList() {
  const entries = useJournalStore(state => state.entries);
  const toggleTask = useJournalStore(state => state.toggleTask);
  const deleteEntry = useJournalStore(state => state.deleteEntry);
  
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
        >
          <span className="text-lg font-mono text-gray-500">
            {entry.symbol}
          </span>
          
          <span
            className={`flex-1 ${
              entry.completed ? 'line-through text-gray-400' : ''
            }`}
            onClick={() => entry.type === 'task' && toggleTask(entry.id!)}
          >
            {entry.content}
          </span>
          
          <button
            onClick={() => deleteEntry(entry.id!)}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Step 6: Create Main App Page (10 minutes)

```typescript
// app/page.tsx
import { JournalEntryInput } from './components/JournalEntry';
import { EntryList } from './components/EntryList';

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Digital Bullet Journal
        </h1>
        <p className="text-gray-600">
          Your all-in-one life operating system
        </p>
      </header>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h2>
        
        <JournalEntryInput />
        <EntryList />
      </div>
    </main>
  );
}
```

### Update Layout for PWA
```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Digital Bullet Journal',
  description: 'Your all-in-one life operating system',
  manifest: '/manifest.json',
  themeColor: '#0066CC',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0066CC" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
```

---

## Step 7: Run Your App! (5 minutes)

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Test PWA Features:
1. Open Chrome DevTools → Application tab
2. Check "Service Workers" - should see yours registered
3. Check "Manifest" - should see your app info
4. Try going offline - app should still work!

---

## 🎉 Congratulations!

You now have a working Digital Bullet Journal PWA with:
- ✅ Offline functionality
- ✅ Basic bullet journal entries (tasks, events, notes)
- ✅ Local data persistence
- ✅ Installable as an app
- ✅ Mobile-responsive design

---

## 📚 Next Steps

### Add Drawing Canvas (Next Session)
```typescript
// Install fabric
npm install fabric @types/fabric

// Create DrawingCanvas component
// Add to journal pages
```

### Add Built-in Tools
- Calculator widget
- Timer component
- Simple spreadsheet functions

### Enhance UI/UX
- Add page navigation
- Create monthly/weekly views
- Add themes and customization

### Deploy to Production
```bash
# Deploy to Vercel (recommended)
npm install -g vercel
vercel

# Or deploy to Netlify
# Just drag and drop your build folder!
```

---

## 🆘 Troubleshooting

### Service Worker Not Registering?
- Make sure you're using HTTPS (localhost is fine)
- Clear browser cache and reload
- Check console for errors

### PWA Not Installing?
- Need HTTPS in production
- Check manifest.json is valid
- Ensure icons exist in public folder

### Database Not Persisting?
- Check IndexedDB in DevTools
- Ensure Dexie is initialized
- Check for browser storage limits

---

## 🚀 You Did It!

In just 1 hour, you've built the foundation of a powerful Digital Bullet Journal that works offline, installs like a native app, and runs everywhere. Keep building on this foundation to add all the amazing features from your roadmap!