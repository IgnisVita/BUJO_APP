# Digital Bullet Journal PWA

A beautiful, fast, and offline-capable Progressive Web App for digital bullet journaling built with Next.js 14+, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17.0 or higher
- npm 10.0.0 or higher

### Installation

```bash
# Install dependencies
npm install

# Run the development server on port 3002
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) with your browser to see the app.

## 📁 Project Structure

```
BUJO_APP/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   ├── lib/             # Core application logic
│   ├── styles/          # Global styles and Tailwind
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── public/              # Static assets (icons, manifest)
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## 🎨 Features

- **Progressive Web App**: Works offline, installable on mobile and desktop
- **Beautiful Design**: Custom design system with dark mode support
- **Type-Safe**: Built with TypeScript for reliability
- **Fast**: Optimized with Next.js 14 App Router
- **Responsive**: Works perfectly on all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **PWA**: Serwist (formerly Workbox)
- **State Management**: Zustand
- **Database**: Dexie.js (IndexedDB)
- **Icons**: Lucide React
- **Fonts**: Inter, Bricolage Grotesque, JetBrains Mono

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server on port 3002

# Production
npm run build        # Build for production
npm run start        # Start production server on port 3002

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # Check TypeScript types

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Application
PORT=3002
NODE_ENV=development

# PWA
NEXT_PUBLIC_APP_NAME=Digital Bullet Journal
NEXT_PUBLIC_APP_SHORT_NAME=BUJO
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_OFFLINE=true
```

### PWA Configuration

The app is configured as a Progressive Web App with:
- Service worker for offline functionality
- App manifest for installation
- Custom offline page
- Push notification support

## 🎯 Design System

The app uses a custom design system with:

- **Colors**: Primary (purple), Secondary (coral), Accent (teal)
- **Typography**: Display (Bricolage), Body (Inter), Code (JetBrains Mono)
- **Animations**: Smooth transitions and micro-interactions
- **Dark Mode**: Full dark mode support

## 🚀 Deployment

The app is ready for deployment to:
- Vercel (recommended)
- Netlify
- Any Node.js hosting platform

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/bujo-app)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

Built with ❤️ by the BUJO Team