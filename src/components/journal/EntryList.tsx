// ABOUTME: Virtual scrolling list of journal entries with smooth animations
// Features empty state, loading skeleton, and drag-and-drop reordering

'use client';

import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import { useInView } from 'react-intersection-observer';
import { Book, Plus, Sparkles } from 'lucide-react';
import { useMemo, useCallback, useState } from 'react';

import { JournalEntry } from '@/lib/types';
import { useJournalStore } from '@/lib/stores/journalStore';
import { cn } from '@/lib/utils/cn';
import { animations } from '@/lib/constants/design-tokens';
import { Button } from '@/components/ui/Button';
import { MemoizedEntryItem } from './EntryItem';

interface EntryListProps {
  entries: JournalEntry[];
  isLoading?: boolean;
  onCreateEntry?: () => void;
  className?: string;
  virtualScrolling?: boolean;
  maxHeight?: number;
}

// Loading skeleton component
function EntryItemSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-3 rounded-lg"
    >
      <div className="flex-shrink-0 w-4 h-4 bg-neutral-300 dark:bg-neutral-600 rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse w-1/2" />
      </div>
    </motion.div>
  );
}

// Empty state component
function EmptyState({ onCreateEntry }: { onCreateEntry?: () => void }) {
  return (
    <motion.div
      initial={animations.variants.fadeIn.initial}
      animate={animations.variants.fadeIn.animate}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6"
      >
        <Book className="w-8 h-8 text-white" />
      </motion.div>

      <motion.h3
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2"
      >
        Start Your Journal
      </motion.h3>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-sm"
      >
        Begin by adding your first entry. Capture tasks, notes, events, or habits to organize your thoughts.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={onCreateEntry}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
        >
          Add Your First Entry
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400"
      >
        <Sparkles className="w-3 h-3" />
        <span>Use • for tasks, • for notes, • for events</span>
      </motion.div>
    </motion.div>
  );
}

// Virtual list item renderer
function VirtualListItem({ 
  index, 
  style, 
  data 
}: { 
  index: number; 
  style: React.CSSProperties; 
  data: { entries: JournalEntry[]; onReorder: (entries: JournalEntry[]) => void }; 
}) {
  const entry = data.entries[index];
  
  return (
    <div style={style}>
      <MemoizedEntryItem entry={entry} />
    </div>
  );
}

export function EntryList({ 
  entries, 
  isLoading = false, 
  onCreateEntry, 
  className,
  virtualScrolling = true,
  maxHeight = 600
}: EntryListProps) {
  const [draggedEntry, setDraggedEntry] = useState<JournalEntry | null>(null);
  const { reorderEntries } = useJournalStore();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Memoized entries for performance
  const memoizedEntries = useMemo(() => entries, [entries]);

  // Handle drag and drop reordering
  const handleReorder = useCallback(async (newEntries: JournalEntry[]) => {
    try {
      const entryIds = newEntries.map(entry => entry.id!);
      await reorderEntries(entryIds);
    } catch (error) {
      console.error('Failed to reorder entries:', error);
    }
  }, [reorderEntries]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)} ref={ref}>
        {Array.from({ length: 5 }).map((_, index) => (
          <EntryItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Empty state
  if (memoizedEntries.length === 0) {
    return (
      <div className={className} ref={ref}>
        <EmptyState onCreateEntry={onCreateEntry} />
      </div>
    );
  }

  // Virtual scrolling for large lists
  if (virtualScrolling && memoizedEntries.length > 50) {
    return (
      <motion.div
        initial={animations.variants.fadeIn.initial}
        animate={animations.variants.fadeIn.animate}
        className={cn("border border-neutral-200 dark:border-neutral-700 rounded-lg", className)}
        ref={ref}
      >
        <List
          height={maxHeight}
          itemCount={memoizedEntries.length}
          itemSize={80}
          itemData={{ entries: memoizedEntries, onReorder: handleReorder }}
          className="scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600"
        >
          {VirtualListItem}
        </List>
      </motion.div>
    );
  }

  // Regular list with drag and drop
  return (
    <motion.div
      initial={animations.variants.fadeIn.initial}
      animate={inView ? animations.variants.fadeIn.animate : animations.variants.fadeIn.initial}
      className={cn("space-y-1", className)}
      ref={ref}
    >
      <Reorder.Group
        axis="y"
        values={memoizedEntries}
        onReorder={handleReorder}
        className="space-y-1"
      >
        <AnimatePresence mode="popLayout">
          {memoizedEntries.map((entry) => (
            <Reorder.Item
              key={entry.id}
              value={entry}
              onDragStart={() => setDraggedEntry(entry)}
              onDragEnd={() => setDraggedEntry(null)}
              className="cursor-grab active:cursor-grabbing"
              whileDrag={{
                scale: 1.02,
                rotate: 1,
                zIndex: 10,
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              }}
              layout
              initial={animations.variants.slideIn.initial}
              animate={animations.variants.slideIn.animate}
              exit={animations.variants.slideIn.exit}
            >
              <MemoizedEntryItem 
                entry={entry} 
                isDragging={draggedEntry?.id === entry.id}
              />
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Add entry button at the bottom */}
      {onCreateEntry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pt-4"
        >
          <Button
            variant="ghost"
            onClick={onCreateEntry}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full justify-start text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Add entry
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Performance optimizations
export const MemoizedEntryList = motion.memo(EntryList);