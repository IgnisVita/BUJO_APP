# Architecture Agent Brief

## 🎯 Mission
Design a robust, scalable technical architecture for the Digital Bullet Journal PWA that supports beautiful UI, offline functionality, and handles finance, fitness, and project management seamlessly.

---

## 📋 Specific Deliverables

### 1. System Architecture Document

Create a comprehensive architecture document with:

#### 1.1 High-Level Architecture Diagram
```
┌─────────────────────────────────────────────────┐
│                   Frontend (PWA)                 │
│  ┌─────────────┐ ┌──────────┐ ┌──────────────┐ │
│  │   Next.js   │ │  React   │ │   Tailwind   │ │
│  │  App Router │ │  18.2+   │ │   CSS 3.4    │ │
│  └─────────────┘ └──────────┘ └──────────────┘ │
├─────────────────────────────────────────────────┤
│                State Management                  │
│  ┌─────────────┐ ┌──────────┐ ┌──────────────┐ │
│  │   Zustand   │ │  Context │ │    Local     │ │
│  │   Stores    │ │   API    │ │   Storage    │ │
│  └─────────────┘ └──────────┘ └──────────────┘ │
├─────────────────────────────────────────────────┤
│                 Data Layer                       │
│  ┌─────────────┐ ┌──────────┐ ┌──────────────┐ │
│  │   Dexie.js  │ │ IndexedDB│ │  File API    │ │
│  │   (Wrapper) │ │  (Core)  │ │  (Exports)   │ │
│  └─────────────┘ └──────────┘ └──────────────┘ │
├─────────────────────────────────────────────────┤
│                  PWA Layer                       │
│  ┌─────────────┐ ┌──────────┐ ┌──────────────┐ │
│  │   Service   │ │  Cache   │ │   Manifest   │ │
│  │   Worker    │ │   API    │ │    JSON      │ │
│  └─────────────┘ └──────────┘ └──────────────┘ │
└─────────────────────────────────────────────────┘
```

#### 1.2 Component Architecture
```typescript
// Detailed component hierarchy
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth group (future)
│   ├── (main)/            # Main app group
│   │   ├── journal/       # Journal pages
│   │   ├── draw/          # Drawing pages
│   │   ├── dashboard/     # Analytics
│   │   └── settings/      # Settings
│   ├── api/               # API routes (if needed)
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Base UI components
│   ├── journal/           # Journal-specific
│   ├── canvas/            # Drawing components
│   ├── tools/             # Built-in tools
│   └── layout/            # Layout components
├── lib/
│   ├── db/                # Database layer
│   ├── stores/            # Zustand stores
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utilities
│   └── constants/         # App constants
└── styles/                # Global styles
```

### 2. Database Schema Design

#### 2.1 Complete TypeScript Interfaces
```typescript
// User preferences and settings
interface UserSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  bulletSymbols: {
    task: string;
    event: string;
    note: string;
    custom: Record<string, string>;
  };
  shortcuts: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

// Journal pages
interface Page {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  title: string;
  template?: string;
  coverImage?: string;
  tags: string[];
  metadata: {
    wordCount: number;
    entryCount: number;
    completionRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Journal entries
interface JournalEntry {
  id: string;
  pageId: string;
  type: 'task' | 'event' | 'note' | 'custom';
  content: string;
  richContent?: any; // For future rich text
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags: string[];
  attachments: Attachment[];
  position: number; // For ordering
  parentId?: string; // For nested entries
  metadata: {
    createdLocation?: GeolocationCoordinates;
    weather?: WeatherData;
    mood?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Drawings
interface Drawing {
  id: string;
  pageId?: string;
  entryId?: string;
  title: string;
  thumbnail: string; // Base64
  data: string; // Fabric.js JSON
  width: number;
  height: number;
  layers: Layer[];
  createdAt: Date;
  updatedAt: Date;
}

// Templates
interface Template {
  id: string;
  name: string;
  type: 'page' | 'entry' | 'drawing';
  category: 'productivity' | 'finance' | 'fitness' | 'custom';
  content: any; // Template structure
  thumbnail: string;
  isPublic: boolean;
  usage: number;
  createdAt: Date;
  updatedAt: Date;
}

// Financial tracking
interface Transaction {
  id: string;
  entryId: string;
  amount: number;
  currency: string;
  category: string;
  merchant?: string;
  notes?: string;
  attachments: Attachment[];
  createdAt: Date;
}

// Fitness tracking
interface Workout {
  id: string;
  entryId: string;
  type: string;
  duration: number; // minutes
  exercises: Exercise[];
  calories?: number;
  heartRate?: HeartRateData;
  createdAt: Date;
}

// Projects
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  milestones: Milestone[];
  tags: string[];
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.2 Database Indexes
```typescript
// Dexie schema with indexes for performance
class BulletJournalDB extends Dexie {
  // Tables
  settings!: Table<UserSettings>;
  pages!: Table<Page>;
  entries!: Table<JournalEntry>;
  drawings!: Table<Drawing>;
  templates!: Table<Template>;
  transactions!: Table<Transaction>;
  workouts!: Table<Workout>;
  projects!: Table<Project>;

  constructor() {
    super('BulletJournalDB');
    
    this.version(1).stores({
      settings: 'id',
      pages: 'id, date, type, *tags',
      entries: 'id, pageId, type, completed, *tags, createdAt',
      drawings: 'id, pageId, entryId, createdAt',
      templates: 'id, type, category, isPublic',
      transactions: 'id, entryId, category, createdAt',
      workouts: 'id, entryId, type, createdAt',
      projects: 'id, status, *tags'
    });
  }
}
```

### 3. State Management Architecture

#### 3.1 Store Structure
```typescript
// Root store types
interface StoreState {
  journal: JournalStore;
  ui: UIStore;
  settings: SettingsStore;
  canvas: CanvasStore;
  sync: SyncStore;
}

// Journal store
interface JournalStore {
  // State
  currentPage: Page | null;
  pages: Page[];
  entries: JournalEntry[];
  filters: JournalFilters;
  
  // Actions
  loadPage: (date: string) => Promise<void>;
  createEntry: (entry: Partial<JournalEntry>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  moveEntry: (id: string, newPosition: number) => Promise<void>;
  
  // Computed
  getEntriesByType: (type: string) => JournalEntry[];
  getCompletionRate: () => number;
}

// UI store
interface UIStore {
  // State
  sidebarOpen: boolean;
  activeModal: string | null;
  activePanel: string | null;
  theme: 'light' | 'dark' | 'system';
  isMobile: boolean;
  isOffline: boolean;
  
  // Actions
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setActivePanel: (panelId: string) => void;
  
  // Toast notifications
  toasts: Toast[];
  showToast: (toast: Toast) => void;
  dismissToast: (id: string) => void;
}
```

### 4. API Design Patterns

#### 4.1 Data Access Layer
```typescript
// Repository pattern for data access
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// Implementation example
class EntryRepository implements Repository<JournalEntry> {
  async findById(id: string): Promise<JournalEntry | null> {
    return db.entries.get(id);
  }
  
  async findByPage(pageId: string): Promise<JournalEntry[]> {
    return db.entries
      .where('pageId')
      .equals(pageId)
      .sortBy('position');
  }
  
  async create(data: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
    const id = nanoid();
    const entry = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.entries.add(entry);
    return entry;
  }
}
```

#### 4.2 Service Layer
```typescript
// Business logic layer
class JournalService {
  constructor(
    private entryRepo: EntryRepository,
    private pageRepo: PageRepository
  ) {}
  
  async createDailyPage(date: string): Promise<Page> {
    // Check if page exists
    const existing = await this.pageRepo.findByDate(date);
    if (existing) return existing;
    
    // Create new page with template
    const template = await this.getDefaultTemplate();
    return this.pageRepo.create({
      date,
      type: 'daily',
      title: formatDate(date),
      template: template.id
    });
  }
  
  async importFromMarkdown(markdown: string): Promise<void> {
    // Parse markdown and create entries
    const parsed = parseMarkdown(markdown);
    for (const item of parsed) {
      await this.entryRepo.create(item);
    }
  }
}
```

### 5. Performance Strategy

#### 5.1 Code Splitting
```typescript
// Route-based code splitting
const JournalPage = lazy(() => import('./pages/journal'));
const DrawingCanvas = lazy(() => import('./components/canvas'));
const Dashboard = lazy(() => import('./pages/dashboard'));

// Component-level splitting
const HeavyComponent = dynamic(
  () => import('./components/HeavyComponent'),
  { 
    loading: () => <Skeleton />,
    ssr: false 
  }
);
```

#### 5.2 Optimization Techniques
```typescript
// 1. Virtual scrolling for long lists
<VirtualList
  items={entries}
  itemHeight={60}
  renderItem={(entry) => <EntryItem entry={entry} />}
/>

// 2. Debounced search
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);

// 3. Memoization
const MemoizedEntry = memo(EntryItem, (prev, next) => {
  return prev.entry.updatedAt === next.entry.updatedAt;
});

// 4. Progressive loading
const loadMoreEntries = async () => {
  const PAGE_SIZE = 50;
  const newEntries = await db.entries
    .offset(currentOffset)
    .limit(PAGE_SIZE)
    .toArray();
  setEntries([...entries, ...newEntries]);
};
```

### 6. Security Architecture

#### 6.1 Data Encryption
```typescript
// Client-side encryption for sensitive data
class EncryptionService {
  private key: CryptoKey;
  
  async initialize(password: string) {
    const salt = await this.getSalt();
    this.key = await this.deriveKey(password, salt);
  }
  
  async encrypt(data: any): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.key,
      encoded
    );
    
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }
  
  async decrypt(encryptedData: string): Promise<any> {
    // Decryption logic
  }
}
```

#### 6.2 Privacy Features
```typescript
// Privacy-first features
interface PrivacySettings {
  encryptionEnabled: boolean;
  autoLockTimeout: number; // minutes
  biometricUnlock: boolean;
  secureExport: boolean;
  analyticsEnabled: boolean;
}

// Secure export
async function exportSecure(password: string) {
  const data = await collectAllData();
  const encrypted = await encryptionService.encrypt(data);
  const blob = new Blob([encrypted], { type: 'application/json' });
  downloadBlob(blob, 'journal-backup-secure.json');
}
```

### 7. Sync Architecture

#### 7.1 Conflict Resolution
```typescript
// CRDT-inspired conflict resolution
interface SyncStrategy {
  resolveConflict<T>(local: T, remote: T): T;
  merge<T>(items: T[]): T;
}

class LastWriteWins implements SyncStrategy {
  resolveConflict<T extends { updatedAt: Date }>(
    local: T, 
    remote: T
  ): T {
    return local.updatedAt > remote.updatedAt ? local : remote;
  }
}

// Sync queue for offline changes
interface SyncQueue {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: Date;
  retries: number;
}
```

### 8. Testing Architecture

#### 8.1 Test Structure
```typescript
// Unit test example
describe('EntryRepository', () => {
  let repo: EntryRepository;
  
  beforeEach(() => {
    repo = new EntryRepository();
  });
  
  test('should create entry with correct timestamp', async () => {
    const entry = await repo.create({
      content: 'Test entry',
      type: 'task'
    });
    
    expect(entry.id).toBeDefined();
    expect(entry.createdAt).toBeInstanceOf(Date);
  });
});

// Integration test example
describe('Journal Page', () => {
  test('should load entries for current date', async () => {
    render(<JournalPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument();
    });
    
    const entries = screen.getAllByRole('listitem');
    expect(entries).toHaveLength(3);
  });
});
```

### 9. Build & Deployment Architecture

#### 9.1 Build Configuration
```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
  webpack: (config) => {
    // Optimizations
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        framework: {
          name: 'framework',
          chunks: 'all',
          test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
          priority: 40,
        },
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
          priority: 20,
        },
      },
    };
    return config;
  },
};
```

### 10. Monitoring & Analytics

#### 10.1 Performance Monitoring
```typescript
// Performance tracking
class PerformanceMonitor {
  trackPageLoad() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        this.report({
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          domContentLoaded: perfData.domContentLoadedEventEnd,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        });
      });
    }
  }
  
  trackAction(action: string, duration: number) {
    performance.mark(`${action}-end`);
    performance.measure(action, `${action}-start`, `${action}-end`);
  }
}
```

---

## 📦 Deliverable Format

1. **Architecture.md** - Complete documentation (this format)
2. **architecture-diagrams/** - Folder with all diagrams
   - system-overview.svg
   - component-hierarchy.svg
   - data-flow.svg
   - state-management.svg
3. **interfaces.ts** - All TypeScript interfaces
4. **API.md** - API documentation
5. **performance-strategy.md** - Detailed performance plan

---

## ⏱️ Timeline

- Day 1: System architecture and diagrams
- Day 2: Database schema and interfaces
- Day 3: State management design
- Day 4: API patterns and services
- Day 5: Performance and security
- Day 6: Documentation and review

---

## ✅ Success Criteria

The architecture is complete when:
1. [ ] All components have clear responsibilities
2. [ ] Database schema handles all use cases
3. [ ] State management is predictable
4. [ ] Performance strategy is documented
5. [ ] Security measures are defined
6. [ ] Sync strategy handles conflicts
7. [ ] Testing approach is clear
8. [ ] Build process is optimized
9. [ ] It scales to 100K+ entries
10. [ ] It supports finance, fitness, and projects

---

## 🚀 Handoff Requirements

Provide to development agents:
1. Complete architecture documentation
2. All TypeScript interfaces
3. Database migration scripts
4. Example code for each pattern
5. Performance benchmarks to hit
6. Security requirements checklist

This architecture will guide all development decisions!