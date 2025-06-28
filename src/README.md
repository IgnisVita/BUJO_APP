# Digital Bullet Journal - Project Structure

## 📁 Directory Overview

```
src/
├── app/                    # Next.js App Router pages
│   ├── journal/           # Journal pages and features
│   ├── draw/              # Drawing canvas pages
│   ├── dashboard/         # Analytics and insights
│   ├── settings/          # User settings
│   └── api/               # API routes (if needed)
│
├── components/            # React components
│   ├── ui/               # Base UI components (buttons, inputs, etc.)
│   ├── journal/          # Journal-specific components
│   ├── canvas/           # Drawing and canvas components
│   ├── tools/            # Built-in tools (calculator, timer, etc.)
│   └── layout/           # Layout components (header, sidebar, etc.)
│
├── lib/                   # Core application logic
│   ├── db/               # Database layer (Dexie.js)
│   ├── stores/           # Zustand state management
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── constants/        # App constants
│   └── types/            # TypeScript type definitions
│
├── styles/               # Global styles and Tailwind
│
├── public/               # Static assets
│   ├── icons/           # App icons
│   ├── images/          # Images
│   └── fonts/           # Custom fonts (if any)
│
└── tests/                # Test files
    ├── unit/            # Unit tests
    ├── integration/     # Integration tests
    └── e2e/             # End-to-end tests
```

## 🎯 Directory Purposes

### `/app`
Next.js 13+ App Router. Each folder represents a route.
- Use `page.tsx` for pages
- Use `layout.tsx` for layouts
- Use `loading.tsx` for loading states
- Use `error.tsx` for error boundaries

### `/components`
Reusable React components organized by domain:
- **ui/**: Generic, reusable UI components
- **journal/**: Journal-specific components like EntryItem, EntryList
- **canvas/**: Drawing-related components
- **tools/**: Calculator, Timer, and other built-in tools
- **layout/**: Page structure components

### `/lib`
Core business logic and utilities:
- **db/**: Database schema, migrations, and queries
- **stores/**: Zustand stores for state management
- **hooks/**: Custom React hooks for common logic
- **utils/**: Helper functions and utilities
- **constants/**: App-wide constants
- **types/**: TypeScript interfaces and types

### `/styles`
Global CSS and Tailwind configuration:
- `globals.css`: Global styles and Tailwind imports
- Component-specific styles (if needed)

### `/public`
Static assets served directly:
- PWA icons and manifest
- Images and illustrations
- Fonts (if not using Google Fonts)

### `/tests`
Comprehensive test coverage:
- **unit/**: Individual function/component tests
- **integration/**: Feature integration tests
- **e2e/**: Full user journey tests

## 🏗️ File Naming Conventions

### Components
```
ButtonPrimary.tsx        # Component file
ButtonPrimary.test.tsx   # Test file
ButtonPrimary.stories.tsx # Storybook file (optional)
```

### Pages (App Router)
```
app/journal/page.tsx     # Main page component
app/journal/layout.tsx   # Layout wrapper
app/journal/loading.tsx  # Loading state
```

### Utilities and Hooks
```
lib/utils/formatDate.ts  # Utility function
lib/hooks/useJournal.ts  # Custom hook
lib/types/journal.ts     # Type definitions
```

## 🚀 Getting Started for Agents

1. **Design System Agent**: Your Figma designs will inform component structure in `/components/ui`

2. **Architecture Agent**: Your schemas go in `/lib/types` and `/lib/db`

3. **Core Features Agent**: Start with `/app` pages and `/components/journal`

4. **Canvas Agent**: Work in `/components/canvas` and create `/app/draw`

5. **Tools Agent**: Build in `/components/tools`

6. **PWA Agent**: Configure in `/public` and root config files

7. **Data Agent**: Implement in `/lib/db`

8. **Testing Agent**: Write tests in `/tests`

## 📝 Important Files to Create

### Root Level
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind configuration
- `.env.local` - Environment variables
- `public/manifest.json` - PWA manifest

### Key Starting Files
- `src/app/layout.tsx` - Root layout
- `src/app/page.tsx` - Home page
- `src/lib/types/index.ts` - Central type exports
- `src/lib/db/database.ts` - Database setup
- `src/lib/stores/index.ts` - Store exports
- `src/styles/globals.css` - Global styles

## 🎨 Import Aliases

Configure these in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/types/*": ["./src/lib/types/*"],
      "@/hooks/*": ["./src/lib/hooks/*"],
      "@/utils/*": ["./src/lib/utils/*"]
    }
  }
}
```

This allows clean imports:
```typescript
import { Button } from '@/components/ui/Button'
import { useJournal } from '@/hooks/useJournal'
import type { JournalEntry } from '@/types/journal'
```

## 🔧 Development Workflow

1. Agents work in their designated directories
2. Follow the established patterns
3. Write tests alongside code
4. Document complex logic
5. Use TypeScript strictly
6. Follow the design system

Ready for development! 🚀