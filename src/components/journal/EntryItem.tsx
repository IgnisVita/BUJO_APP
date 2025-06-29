// ABOUTME: Individual journal entry component with bullet symbols, completion toggle, inline editing
// Features drag handle, context menu, and beautiful animations using Framer Motion

'use client';

import { motion, Reorder } from 'framer-motion';
import { 
  Circle, 
  CheckCircle2, 
  Dot, 
  Calendar, 
  ArrowRight, 
  X, 
  MoreHorizontal,
  GripVertical,
  Edit2,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { JournalEntry, EntryType, TaskStatus } from '@/lib/types';
import { useJournalStore } from '@/lib/stores/journalStore';
import { cn } from '@/lib/utils/cn';
import { animations } from '@/lib/constants/design-tokens';
import { Button } from '@/components/ui/Button';

interface EntryItemProps {
  entry: JournalEntry;
  isDragging?: boolean;
  onEdit?: (entry: JournalEntry) => void;
  onDelete?: (entryId: number) => void;
  onDuplicate?: (entry: JournalEntry) => void;
  className?: string;
}

const BULLET_SYMBOLS = {
  task: {
    todo: Circle,
    done: CheckCircle2,
    migrated: ArrowRight,
    cancelled: X,
    scheduled: Calendar,
  },
  note: Dot,
  event: Calendar,
  habit: Circle,
} as const;

const BULLET_STYLES = {
  task: {
    todo: 'text-neutral-500 hover:text-primary-600',
    done: 'text-green-600',
    migrated: 'text-blue-600',
    cancelled: 'text-red-500',
    scheduled: 'text-orange-500',
  },
  note: 'text-primary-600',
  event: 'text-purple-600',
  habit: 'text-indigo-600',
} as const;

export function EntryItem({ 
  entry, 
  isDragging = false, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  className 
}: EntryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(entry.content);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { updateEntry, completeTask, deleteEntry } = useJournalStore();

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }, [isEditing]);

  const handleBulletClick = async () => {
    if (entry.type === 'task' && entry.status !== 'done') {
      try {
        await completeTask(entry.id!);
      } catch (error) {
        console.error('Failed to complete task:', error);
      }
    }
  };

  const handleEditSubmit = async () => {
    if (editContent.trim() !== entry.content) {
      try {
        await updateEntry(entry.id!, { content: editContent.trim() });
      } catch (error) {
        console.error('Failed to update entry:', error);
        setEditContent(entry.content); // Revert on error
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setEditContent(entry.content);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(entry.id!);
    } else {
      deleteEntry(entry.id!);
    }
    setIsMenuOpen(false);
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(entry);
    }
    setIsMenuOpen(false);
  };

  const BulletIcon = entry.type === 'task' 
    ? BULLET_SYMBOLS.task[entry.status || 'todo']
    : BULLET_SYMBOLS[entry.type];

  const bulletStyles = entry.type === 'task' 
    ? BULLET_STYLES.task[entry.status || 'todo']
    : BULLET_STYLES[entry.type];

  const isCompleted = entry.type === 'task' && entry.status === 'done';

  return (
    <motion.div
      layout
      initial={animations.variants.slideIn.initial}
      animate={animations.variants.slideIn.animate}
      exit={animations.variants.slideIn.exit}
      whileHover={{ x: 2 }}
      className={cn(
        'group relative flex items-start gap-3 rounded-lg p-3 transition-all',
        'hover:bg-neutral-50 dark:hover:bg-neutral-900/50',
        'border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800',
        isDragging && 'opacity-50 rotate-1 scale-105 shadow-lg',
        className
      )}
    >
      {/* Drag Handle */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-neutral-400" />
      </div>

      {/* Bullet Point */}
      <motion.button
        className={cn(
          'flex-shrink-0 rounded-full p-1 transition-all duration-200',
          'hover:bg-neutral-200 dark:hover:bg-neutral-700',
          bulletStyles,
          entry.type === 'task' && 'hover:scale-110'
        )}
        onClick={handleBulletClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        disabled={entry.type !== 'task' || entry.status === 'done'}
        aria-label={
          entry.type === 'task' 
            ? `${entry.status === 'done' ? 'Completed' : 'Mark as complete'} task`
            : `${entry.type} entry`
        }
      >
        <BulletIcon className="h-4 w-4" />
      </motion.button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full resize-none bg-transparent border-none outline-none',
              'text-sm leading-relaxed text-neutral-900 dark:text-neutral-100',
              'placeholder:text-neutral-500 dark:placeholder:text-neutral-400'
            )}
            placeholder="Enter your entry..."
            rows={1}
          />
        ) : (
          <motion.p
            className={cn(
              'text-sm leading-relaxed cursor-text',
              'text-neutral-900 dark:text-neutral-100',
              isCompleted && 'line-through text-neutral-500 dark:text-neutral-400'
            )}
            onClick={() => setIsEditing(true)}
            whileHover={{ x: 2 }}
          >
            {entry.content}
          </motion.p>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {entry.tags.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                )}
              >
                #{tag}
              </motion.span>
            ))}
          </div>
        )}

        {/* Due Date (for tasks) */}
        {entry.type === 'task' && entry.dueDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 mt-2 text-xs text-neutral-500 dark:text-neutral-400"
          >
            <Calendar className="h-3 w-3" />
            <span>
              Due {new Date(entry.dueDate).toLocaleDateString()}
            </span>
          </motion.div>
        )}
      </div>

      {/* Context Menu */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Entry options</span>
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={cn(
                'min-w-[160px] bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700',
                'shadow-lg p-1 z-50'
              )}
              sideOffset={5}
            >
              <DropdownMenu.Item
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 outline-none"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 outline-none"
                onClick={handleDuplicate}
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </DropdownMenu.Item>

              {entry.type === 'task' && entry.status !== 'migrated' && (
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 outline-none"
                >
                  <ExternalLink className="h-4 w-4" />
                  Migrate
                </DropdownMenu.Item>
              )}

              <DropdownMenu.Separator className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />

              <DropdownMenu.Item
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 outline-none"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </motion.div>
  );
}

// Memoized version for performance
export const MemoizedEntryItem = motion.memo(EntryItem);