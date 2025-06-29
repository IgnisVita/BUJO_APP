// ABOUTME: App header with navigation, user menu, and mobile responsiveness
// Features glassmorphism effects and smooth animations


import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  Moon,
  Sun,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export interface HeaderProps {
  logo?: React.ReactNode;
  navigation?: Array<{
    name: string;
    href: string;
    icon?: React.ReactNode;
    badge?: number;
  }>;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onMenuClick?: () => void;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ logo, navigation = [], user, onMenuClick, theme = 'light', onThemeChange }, ref) => {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [searchOpen, setSearchOpen] = React.useState(false);

    const toggleTheme = () => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      onThemeChange?.(newTheme);
    };

    return (
      <motion.header
        ref={ref}
        className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-border"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left section: Menu button and Logo */}
            <div className="flex items-center gap-4">
              {onMenuClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMenuClick}
                  className="lg:hidden"
                  aria-label="Toggle sidebar"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}

              {logo && (
                <motion.div
                  className="flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {logo}
                </motion.div>
              )}

              {/* Desktop Navigation */}
              <div className="hidden md:flex md:items-center md:gap-1">
                {navigation.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg',
                      'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
                      'dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800',
                      'transition-colors duration-200'
                    )}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.icon}
                    {item.name}
                    {item.badge && item.badge > 0 && (
                      <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Right section: Search, Notifications, Theme, User */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <AnimatePresence>
                {searchOpen ? (
                  <motion.div
                    className="relative"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      autoFocus
                      onBlur={() => setSearchOpen(false)}
                    />
                  </motion.div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchOpen(true)}
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                )}
              </AnimatePresence>

              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1 top-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                  </span>
                </Button>
              </div>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'light' ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </motion.div>
              </Button>

              {/* User Menu */}
              {user && (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      variant="ghost"
                      className="relative flex items-center gap-2 px-2"
                      aria-label="User menu"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <span className="hidden lg:block text-sm font-medium">{user.name}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className={cn(
                        'z-50 min-w-[200px] overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                        'data-[side=bottom]:slide-in-from-top-2'
                      )}
                      sideOffset={8}
                    >
                      <div className="px-2 py-1.5 text-sm">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenu.Separator className="my-1 h-px bg-border" />
                      <DropdownMenu.Item
                        className={cn(
                          'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none',
                          'hover:bg-accent hover:text-accent-foreground',
                          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                        )}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className={cn(
                          'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none',
                          'hover:bg-accent hover:text-accent-foreground',
                          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                        )}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="my-1 h-px bg-border" />
                      <DropdownMenu.Item
                        className={cn(
                          'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none',
                          'hover:bg-accent hover:text-accent-foreground',
                          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                        )}
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                className="md:hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-1 pb-3 pt-2">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium',
                        'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
                        'dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
                      )}
                    >
                      {item.icon}
                      {item.name}
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>
    );
  }
);

Header.displayName = 'Header';

export { Header };