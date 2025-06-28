# Design System Agent Brief

## 🎯 Mission
Create a complete, production-ready design system for the Digital Bullet Journal PWA that is beautiful, intuitive, and versatile enough for finance, fitness, and project management.

---

## 📋 Specific Deliverables

### 1. Figma Design File Structure
```
Digital Bullet Journal Design System/
├── 🎨 Design Tokens
├── 🧩 Components
├── 📱 Mobile Screens
├── 💻 Desktop Screens
├── 🎭 Prototypes
├── 📚 Documentation
└── 🚀 Export Assets
```

### 2. Design Tokens (Variables)
Create Figma variables for:

#### Colors
```scss
// Light Mode
--color-primary: #0A2540 (Deep Ocean Blue)
--color-primary-light: #1E3A5C
--color-primary-dark: #051425

--color-accent: #FFB800 (Warm Gold)
--color-accent-light: #FFD700
--color-accent-dark: #E6A200

--color-background: #FAFAF9 (Off-white)
--color-surface: #FFFFFF
--color-surface-raised: #FFFFFF with shadow

--color-text-primary: #0A0A0A
--color-text-secondary: #666666
--color-text-disabled: #999999

--color-success: #10B981
--color-warning: #F59E0B
--color-error: #EF4444

// Dark Mode (create full set)
--color-background-dark: #0A0A0A
--color-surface-dark: #1A1A1A
// ... etc
```

#### Typography
```scss
// Font Families
--font-sans: 'Inter', system-ui, sans-serif
--font-display: 'Poppins', sans-serif
--font-hand: 'Caveat', cursive

// Font Sizes (rem)
--text-xs: 0.75    // 12px
--text-sm: 0.875   // 14px
--text-base: 1     // 16px
--text-lg: 1.125   // 18px
--text-xl: 1.25    // 20px
--text-2xl: 1.5    // 24px
--text-3xl: 1.875  // 30px
--text-4xl: 2.25   // 36px

// Font Weights
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700

// Line Heights
--leading-tight: 1.25
--leading-normal: 1.5
--leading-relaxed: 1.75
```

#### Spacing
```scss
// 8px grid system
--space-1: 8px
--space-2: 16px
--space-3: 24px
--space-4: 32px
--space-5: 40px
--space-6: 48px
--space-8: 64px
--space-10: 80px
--space-12: 96px
--space-16: 128px
```

#### Other Tokens
```scss
// Border Radius
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-full: 9999px

// Shadows
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.07)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.10)
--shadow-xl: 0 20px 25px rgba(0,0,0,0.10)

// Animation
--duration-fast: 150ms
--duration-normal: 300ms
--duration-slow: 500ms
--easing-default: cubic-bezier(0.4, 0, 0.2, 1)
```

### 3. Component Library

Create these components with ALL states (default, hover, active, disabled, loading):

#### Buttons
- Primary Button
- Secondary Button
- Ghost Button
- Icon Button
- Floating Action Button
- Button Group

#### Form Elements
- Text Input
- Textarea
- Select Dropdown
- Checkbox
- Radio Button
- Toggle Switch
- Slider
- Date Picker

#### Navigation
- Header Bar
- Sidebar
- Tab Bar
- Bottom Navigation (mobile)
- Breadcrumbs
- Pagination

#### Data Display
- Cards (multiple variants)
- Tables
- Lists
- Badges
- Chips/Tags
- Progress Bars
- Charts (style guide)

#### Feedback
- Toast Notifications
- Modals
- Drawers
- Tooltips
- Loading Spinners
- Skeleton Screens
- Empty States

#### Journal Specific
- Entry Card (task, event, note variants)
- Bullet Symbols
- Quick Entry Input
- Calendar View
- Drawing Tools Palette
- Timer Display

### 4. Screen Designs

#### Mobile Screens (375px width)
1. **Splash Screen**
2. **Onboarding** (4 screens)
   - Welcome
   - Key Features
   - Personalization
   - Get Started
3. **Main Journal View**
   - Daily page
   - Entry list
   - Quick add button
4. **Entry Creation**
   - Type selection
   - Text input
   - Tool options
5. **Drawing Canvas**
   - Full screen mode
   - Tool palette
   - Color picker
6. **Dashboard**
   - Stats cards
   - Charts
   - Insights
7. **Settings**
   - Profile
   - Preferences
   - Data & Sync
8. **Navigation Drawer**

#### Desktop Screens (1440px width)
1. **Main Layout** (with sidebar)
2. **Split View** (journal + drawing)
3. **Dashboard View**
4. **Settings Modal**
5. **Command Palette**

### 5. Interaction Prototypes

Create interactive prototypes for:
1. **Onboarding Flow** - Splash → Onboarding → Main App
2. **Create Entry Flow** - Quick entry → Type selection → Save
3. **Task Completion** - Tap to complete with animation
4. **Navigation** - Between daily/weekly/monthly views
5. **Drawing** - Select tool → Draw → Save

### 6. Micro-interactions

Design and document these animations:
- Button press feedback
- Task completion checkmark
- Page transitions (slide)
- Modal open/close
- Drawer slide
- Loading states
- Pull to refresh
- Swipe actions

### 7. Responsive Behavior

Show how components adapt:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1024px+
- Breakpoint behaviors
- Touch vs mouse interactions

### 8. Accessibility

Ensure all designs include:
- Color contrast ratios (WCAG AA)
- Touch target sizes (44x44 minimum)
- Focus states for keyboard
- Screen reader considerations
- Error state descriptions

### 9. Export Assets

Prepare for development:
- Icon set (SVG)
- App icons (multiple sizes)
- Splash screens
- Empty state illustrations
- Success/error illustrations

### 10. Design Documentation

Create a comprehensive guide including:
- Design principles
- When to use each component
- Do's and Don'ts
- Spacing guidelines
- Color usage rules
- Typography hierarchy
- Animation guidelines

---

## 📐 Technical Specifications

### Figma Setup
- Use Auto Layout everywhere
- Create component variants
- Use consistent naming convention
- Enable Dev Mode
- Add code snippets where helpful

### Naming Convention
```
Components: PascalCase (ButtonPrimary)
Variants: camelCase (size, state, variant)
Layers: Descriptive names (icon-arrow-right)
Colors: Semantic names (color-text-primary)
```

### Component Properties
Each component should expose:
- Size variants (sm, md, lg)
- State variants (default, hover, active, disabled)
- Theme variants (light, dark)
- Content properties (text, icon)

---

## 🎯 Key Design Principles

1. **Clarity First** - Every element should have a clear purpose
2. **Consistent Spacing** - Use the 8px grid religiously
3. **Meaningful Motion** - Animations should aid understanding
4. **Touch Friendly** - Design for fingers first, mouse second
5. **Accessible** - Beautiful AND usable by everyone
6. **Scalable** - Components should work at any size
7. **Versatile** - Must work for finance, fitness, and projects

---

## 📦 Deliverable Format

1. **Figma File Link** (with view/comment access)
2. **Component Documentation** (PDF or Notion)
3. **Design Tokens** (JSON format)
4. **Asset Export** (ZIP with all icons/images)
5. **Prototype Links** (for each flow)

---

## ⏱️ Timeline

- Day 1-2: Design tokens and base components
- Day 3-4: Screen designs and layouts  
- Day 5: Prototypes and interactions
- Day 6: Documentation and handoff prep
- Day 7: Review and revisions

---

## ✅ Success Criteria

The design system is complete when:
1. [ ] All components have every state designed
2. [ ] Mobile and desktop versions are complete
3. [ ] Prototypes demonstrate key flows
4. [ ] Colors work in both light and dark modes
5. [ ] Typography creates clear hierarchy
6. [ ] Spacing is consistent throughout
7. [ ] It feels premium and delightful
8. [ ] It works for finance, fitness, and projects
9. [ ] Developer can build from the designs
10. [ ] Accessibility standards are met

---

## 💬 Questions to Consider

Before starting, consider:
1. What makes Bear, Things 3, and Linear feel so good?
2. How can we make data entry feel effortless?
3. What would make users choose this over paper?
4. How do we show complex data beautifully?
5. What details would surprise and delight users?

---

## 🚀 Handoff Requirements

When complete, provide:
1. Figma file with Dev Mode enabled
2. Exported design tokens as JSON
3. Component usage guidelines
4. List of any design decisions that need discussion
5. Recommendations for implementation order

This design system will be the foundation for all development work, so attention to detail is crucial. Make it beautiful, functional, and inspiring!