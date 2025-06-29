// ABOUTME: Simplified journal page without complex dependencies
// Basic page structure for navigation testing

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { 
  Plus, 
  Calendar,
  Search,
  Book,
  PenTool,
  CheckSquare,
  Circle,
  Minus
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';

interface MockEntry {
  id: number;
  content: string;
  type: 'task' | 'note' | 'event';
  status?: 'completed' | 'pending';
  timestamp: Date;
}

const mockEntries: MockEntry[] = [
  {
    id: 1,
    content: 'Review project proposal',
    type: 'task',
    status: 'pending',
    timestamp: new Date(),
  },
  {
    id: 2,
    content: 'Meeting with design team at 2pm',
    type: 'event',
    timestamp: new Date(),
  },
  {
    id: 3,
    content: 'Great progress on the new feature today. Team collaboration was excellent.',
    type: 'note',
    timestamp: new Date(),
  },
  {
    id: 4,
    content: 'Call Sarah about project timeline',
    type: 'task',
    status: 'completed',
    timestamp: new Date(),
  },
];

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEntry, setNewEntry] = useState('');
  const [entries, setEntries] = useState<MockEntry[]>(mockEntries);

  const handleAddEntry = () => {
    if (!newEntry.trim()) return;

    const entry: MockEntry = {
      id: Date.now(),
      content: newEntry,
      type: newEntry.startsWith('•') ? 'task' : 'note',
      status: newEntry.startsWith('•') ? 'pending' : undefined,
      timestamp: new Date(),
    };

    setEntries([entry, ...entries]);
    setNewEntry('');
  };

  const toggleTaskStatus = (id: number) => {
    setEntries(entries.map(entry => 
      entry.id === id && entry.type === 'task'
        ? { ...entry, status: entry.status === 'completed' ? 'pending' : 'completed' }
        : entry
    ));
  };

  const getEntryIcon = (entry: MockEntry) => {
    if (entry.type === 'task') {
      return entry.status === 'completed' 
        ? <CheckSquare className="w-4 h-4 text-green-600" />
        : <Circle className="w-4 h-4 text-blue-600" />;
    }
    if (entry.type === 'event') {
      return <Calendar className="w-4 h-4 text-purple-600" />;
    }
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8 max-w-4xl"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Journal
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Calendar View
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Entry */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Quick Entry
          </h2>
          <div className="flex gap-3">
            <Input
              placeholder="What's on your mind? Use • for tasks, → for events"
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddEntry();
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleAddEntry}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
          <div className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
            Tip: Start with • for tasks, → for events, or just write notes naturally
          </div>
        </Card>

        {/* Entries */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Today's Entries
            </h2>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {entries.length} entries
            </span>
          </div>

          <div className="space-y-4">
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-lg border transition-all',
                  'hover:bg-neutral-50 dark:hover:bg-neutral-800',
                  entry.type === 'task' && entry.status === 'completed' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700'
                )}
              >
                <button
                  onClick={() => toggleTaskStatus(entry.id)}
                  className="mt-0.5 hover:scale-110 transition-transform"
                  disabled={entry.type !== 'task'}
                >
                  {getEntryIcon(entry)}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-neutral-900 dark:text-neutral-100',
                    entry.type === 'task' && entry.status === 'completed' && 'line-through opacity-70'
                  )}>
                    {entry.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="capitalize">{entry.type}</span>
                    <span>•</span>
                    <span>{format(entry.timestamp, 'h:mm a')}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {entries.length === 0 && (
              <div className="text-center py-12">
                <Book className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No entries yet
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Start writing your thoughts, tasks, and experiences
                </p>
                <Button onClick={() => document.querySelector('input')?.focus()}>
                  <PenTool className="w-4 h-4 mr-2" />
                  Write your first entry
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
            <span>Press Enter to add entries</span>
            <span>•</span>
            <span>Click icons to toggle tasks</span>
            <span>•</span>
            <Link href="/calendar" className="hover:text-primary-600 transition-colors">
              View in Calendar
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}