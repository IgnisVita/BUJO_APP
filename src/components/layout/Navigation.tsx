// ABOUTME: Main navigation component with responsive design and accessibility
// Features active state indicators, keyboard navigation, and beautiful animations

'use client';

import { motion } from 'framer-motion';
import { 
  Book, 
  Home, 
  Calendar, 
  Settings, 
  Search,
  Menu,
  X,
  PenTool,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

const navigationItems = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Journal',
    href: '/journal',
    icon: Book,
  },
  {
    label: 'Draw',
    href: '/draw',
    icon: PenTool,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Book className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              BUJO
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <motion.div
                  key={item.href}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                      isActive 
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-lg -z-10"
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Search and Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex"
            >
              <Search className="w-4 h-4" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-neutral-200 dark:border-neutral-800 py-4"
          >
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                      isActive 
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                        : 'text-neutral-600 dark:text-neutral-400'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Mobile Search */}
              <div className="px-4 py-3">
                <Button
                  variant="outline"
                  leftIcon={<Search className="w-4 h-4" />}
                  fullWidth
                >
                  Search
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}