// ABOUTME: Collapsible sidebar with navigation items and tool shortcuts
// Features smooth animations and glassmorphism effects


import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Calendar,
  FileText,
  Settings,
  Palette,
  PenTool,
  Type,
  Square,
  Circle,
  Triangle,
  Eraser,
  Hand,
  MousePointer,
  Layers,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export interface SidebarItem {
  id: string;
  name: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  badge?: number | string;
  items?: SidebarItem[];
}

export interface SidebarProps {
  items?: SidebarItem[];
  tools?: SidebarItem[];
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  activeItem?: string;
  onItemClick?: (item: SidebarItem) => void;
  className?: string;
}

// Default navigation items
const defaultNavItems: SidebarItem[] = [
  { id: 'home', name: 'Home', icon: Home, href: '/' },
  { id: 'journal', name: 'Journal', icon: FileText, href: '/journal' },
  { id: 'calendar', name: 'Calendar', icon: Calendar, href: '/calendar' },
  { id: 'settings', name: 'Settings', icon: Settings, href: '/settings' },
];

// Default tool items
const defaultToolItems: SidebarItem[] = [
  { id: 'select', name: 'Select', icon: MousePointer },
  { id: 'pan', name: 'Pan', icon: Hand },
  { id: 'pen', name: 'Pen', icon: PenTool },
  { id: 'text', name: 'Text', icon: Type },
  { id: 'rectangle', name: 'Rectangle', icon: Square },
  { id: 'circle', name: 'Circle', icon: Circle },
  { id: 'triangle', name: 'Triangle', icon: Triangle },
  { id: 'eraser', name: 'Eraser', icon: Eraser },
  { id: 'layers', name: 'Layers', icon: Layers },
  { id: 'theme', name: 'Theme', icon: Palette },
];

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      items = defaultNavItems,
      tools = defaultToolItems,
      collapsed = false,
      onCollapsedChange,
      activeItem,
      onItemClick,
      className,
    },
    ref
  ) => {
    const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

    const toggleExpanded = (itemId: string) => {
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      setExpandedItems(newExpanded);
    };

    const handleItemClick = (item: SidebarItem) => {
      if (item.items && item.items.length > 0) {
        toggleExpanded(item.id);
      } else {
        onItemClick?.(item);
      }
    };

    const renderItem = (item: SidebarItem, depth = 0) => {
      const isActive = activeItem === item.id;
      const isExpanded = expandedItems.has(item.id);
      const hasChildren = item.items && item.items.length > 0;
      const Icon = item.icon;

      return (
        <div key={item.id}>
          <motion.button
            className={cn(
              'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              isActive && 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100',
              !isActive && 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100',
              depth > 0 && 'pl-9'
            )}
            onClick={() => handleItemClick(item)}
            whileHover={{ x: collapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0', collapsed && 'mx-auto')} />

            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  className="flex-1 text-left"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>

            {!collapsed && item.badge && (
              <span
                className={cn(
                  'ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold',
                  'bg-primary-500 text-white'
                )}
              >
                {item.badge}
              </span>
            )}

            {!collapsed && hasChildren && (
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            )}

            {/* Tooltip for collapsed state */}
            {collapsed && (
              <motion.div
                className={cn(
                  'absolute left-full ml-2 hidden rounded-md bg-neutral-900 px-2 py-1 text-xs text-white',
                  'group-hover:block dark:bg-neutral-100 dark:text-neutral-900'
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1 }}
              >
                {item.name}
                {item.badge && (
                  <span className="ml-2 text-primary-400 dark:text-primary-600">
                    ({item.badge})
                  </span>
                )}
              </motion.div>
            )}
          </motion.button>

          {/* Render children */}
          <AnimatePresence>
            {!collapsed && hasChildren && isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {item.items!.map((child) => renderItem(child, depth + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    };

    return (
      <motion.aside
        ref={ref}
        className={cn(
          'relative flex h-full flex-col border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          className
        )}
        initial={false}
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Collapse Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCollapsedChange?.(!collapsed)}
          className={cn(
            'absolute -right-4 top-20 z-10 h-8 w-8 rounded-full border bg-background shadow-md',
            'hover:shadow-lg'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            {items.map((item) => renderItem(item))}
          </nav>

          {/* Tools Section */}
          {tools.length > 0 && (
            <>
              <div className="my-4 border-t border-border" />
              <div className="space-y-1">
                {!collapsed && (
                  <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tools
                  </h3>
                )}
                {tools.map((tool) => renderItem(tool))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                'bg-gradient-to-br from-primary-400 to-primary-600 text-white',
                'shadow-lg'
              )}
            >
              <span className="text-sm font-bold">BJ</span>
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <p className="text-sm font-medium">Bullet Journal</p>
                <p className="text-xs text-muted-foreground">Digital Edition</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>
    );
  }
);

Sidebar.displayName = 'Sidebar';

// Mobile Sidebar with overlay
export interface MobileSidebarProps extends SidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const MobileSidebar = React.forwardRef<HTMLElement, MobileSidebarProps>(
  ({ open = false, onOpenChange, ...props }, ref) => {
    return (
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange?.(false)}
            />

            {/* Sidebar */}
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <Sidebar ref={ref} {...props} collapsed={false} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
);

MobileSidebar.displayName = 'MobileSidebar';

export { Sidebar };