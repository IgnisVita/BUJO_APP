// ABOUTME: Habit tracking template component with customizable grid
// Provides various habit tracker layouts that snap to dot grid

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  Circle, 
  Square, 
  Calendar,
  TrendingUp,
  Award,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { format, getDaysInMonth, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Template, TemplateElement, templateEngine } from '@/lib/templates/template-engine';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface HabitTrackerProps {
  onSaveTemplate?: (template: Template) => void;
  defaultHabits?: string[];
  defaultView?: 'week' | 'month' | 'year';
  gridCellSize?: number;
  className?: string;
}

interface HabitData {
  id: string;
  name: string;
  color: string;
  icon?: 'check' | 'x' | 'circle' | 'square';
  target?: number; // Target days per period
}

interface TrackerCell {
  habitId: string;
  date: Date;
  completed: boolean;
  value?: number;
}

const defaultColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f8', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

export const HabitTracker: React.FC<HabitTrackerProps> = ({
  onSaveTemplate,
  defaultHabits = ['Exercise', 'Water', 'Reading', 'Meditation', 'Sleep 8h'],
  defaultView = 'month',
  gridCellSize = 19, // 5mm grid spacing
  className,
}) => {
  const [habits, setHabits] = useState<HabitData[]>(
    defaultHabits.map((name, index) => ({
      id: `habit-${index}`,
      name,
      color: defaultColors[index % defaultColors.length],
      icon: 'check',
    }))
  );
  
  const [view, setView] = useState<'week' | 'month' | 'year'>(defaultView);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [trackerData, setTrackerData] = useState<TrackerCell[]>([]);
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [newHabitName, setNewHabitName] = useState('');

  // Calculate grid dimensions based on view
  const gridDimensions = useMemo(() => {
    switch (view) {
      case 'week':
        return { columns: 7, rows: habits.length + 1 }; // +1 for header
      case 'month':
        const daysInMonth = getDaysInMonth(selectedMonth);
        return { columns: daysInMonth, rows: habits.length + 1 };
      case 'year':
        return { columns: 52, rows: habits.length + 1 }; // 52 weeks
    }
  }, [view, habits.length, selectedMonth]);

  // Get dates for current view
  const dates = useMemo(() => {
    switch (view) {
      case 'week':
        // Current week
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return Array.from({ length: 7 }, (_, i) => {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + i);
          return date;
        });
      case 'month':
        // Current month
        return eachDayOfInterval({
          start: startOfMonth(selectedMonth),
          end: endOfMonth(selectedMonth),
        });
      case 'year':
        // 52 weeks of the year
        const yearStart = new Date(selectedMonth.getFullYear(), 0, 1);
        return Array.from({ length: 52 }, (_, i) => {
          const date = new Date(yearStart);
          date.setDate(yearStart.getDate() + i * 7);
          return date;
        });
    }
  }, [view, selectedMonth]);

  // Toggle habit completion
  const toggleHabit = (habitId: string, date: Date) => {
    const key = `${habitId}-${format(date, 'yyyy-MM-dd')}`;
    const existing = trackerData.find(
      cell => cell.habitId === habitId && 
      format(cell.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    if (existing) {
      setTrackerData(trackerData.filter(cell => 
        !(cell.habitId === habitId && 
          format(cell.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
      ));
    } else {
      setTrackerData([...trackerData, {
        habitId,
        date,
        completed: true,
      }]);
    }
  };

  // Calculate streak for a habit
  const calculateStreak = (habitId: string): number => {
    const habitCells = trackerData
      .filter(cell => cell.habitId === habitId && cell.completed)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (habitCells.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < habitCells.length; i++) {
      const cellDate = new Date(habitCells[i].date);
      cellDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (cellDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // Add new habit
  const addHabit = () => {
    if (!newHabitName.trim()) return;

    const newHabit: HabitData = {
      id: `habit-${Date.now()}`,
      name: newHabitName,
      color: defaultColors[habits.length % defaultColors.length],
      icon: 'check',
    };

    setHabits([...habits, newHabit]);
    setNewHabitName('');
  };

  // Remove habit
  const removeHabit = (habitId: string) => {
    setHabits(habits.filter(h => h.id !== habitId));
    setTrackerData(trackerData.filter(cell => cell.habitId !== habitId));
  };

  // Update habit
  const updateHabit = (habitId: string, updates: Partial<HabitData>) => {
    setHabits(habits.map(h => 
      h.id === habitId ? { ...h, ...updates } : h
    ));
    setEditingHabit(null);
  };

  // Save as template
  const saveAsTemplate = () => {
    const template = templateEngine.createTemplate({
      name: `Habit Tracker - ${format(new Date(), 'MMM yyyy')}`,
      category: 'habit',
      description: `Track ${habits.length} habits with ${view} view`,
      gridSize: gridDimensions,
    });

    // Add header row
    dates.forEach((date, index) => {
      templateEngine.addElement(template.id, {
        type: 'text',
        position: { 
          x: index + 1, 
          y: 0, 
          width: 1, 
          height: 1 
        },
        content: view === 'year' 
          ? `W${index + 1}`
          : format(date, view === 'week' ? 'EEE' : 'd'),
        style: { 
          fontSize: 'small',
          textAlign: 'center',
          fontWeight: 'bold'
        },
      });
    });

    // Add habit rows
    habits.forEach((habit, habitIndex) => {
      // Habit name
      templateEngine.addElement(template.id, {
        type: 'text',
        position: { 
          x: 0, 
          y: habitIndex + 1, 
          width: 1, 
          height: 1 
        },
        content: habit.name,
        style: { 
          fontSize: 'small',
          color: habit.color,
          fontWeight: 'bold'
        },
      });

      // Checkbox cells
      dates.forEach((date, dateIndex) => {
        templateEngine.addElement(template.id, {
          type: 'checkbox',
          position: { 
            x: dateIndex + 1, 
            y: habitIndex + 1, 
            width: 1, 
            height: 1 
          },
          label: '',
          style: {
            borderStyle: 'solid',
            borderWidth: 1,
          },
        });
      });
    });

    onSaveTemplate?.(template);
  };

  // Render cell based on completion status
  const renderCell = (habitId: string, date: Date) => {
    const isCompleted = trackerData.some(
      cell => cell.habitId === habitId && 
      format(cell.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return null;

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => toggleHabit(habitId, date)}
        className={cn(
          'w-full h-full flex items-center justify-center',
          'transition-all duration-200 cursor-pointer',
          'border border-neutral-300 dark:border-neutral-600',
          isCompleted 
            ? 'bg-opacity-80'
            : 'bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800'
        )}
        style={{
          backgroundColor: isCompleted ? habit.color : undefined,
        }}
      >
        {isCompleted && (
          <Check className="w-3 h-3" style={{ color: habit.color }} />
        )}
      </motion.button>
    );
  };

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Habit Tracker
          </h2>
          
          <div className="flex items-center gap-2">
            {/* View selector */}
            <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
              {(['week', 'month', 'year'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    'px-3 py-1.5 rounded text-sm transition-all',
                    view === v
                      ? 'bg-white dark:bg-neutral-700 shadow-sm'
                      : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  )}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>

            <Button onClick={saveAsTemplate} size="sm">
              Save as Template
            </Button>
          </div>
        </div>

        {/* Month navigation for monthly view */}
        {view === 'month' && (
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-medium">
              {format(selectedMonth, 'MMMM yyyy')}
            </h3>
            <button
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
            >
              <RotateCcw className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}
      </div>

      {/* Tracker Grid - Aligned to dot grid */}
      <div 
        className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 p-2"
        style={{
          display: 'grid',
          gridTemplateColumns: `${gridCellSize * 6}px repeat(${dates.length}, ${gridCellSize}px)`,
          gridTemplateRows: `${gridCellSize * 1.5}px repeat(${habits.length}, ${gridCellSize}px)`,
          gap: '1px',
          width: 'fit-content',
          backgroundColor: 'var(--grid-line-color, #f5f5f5)',
        }}
      >
        {/* Header row - empty cell */}
        <div />
        
        {/* Header row - dates */}
        {dates.map((date, index) => (
          <div
            key={index}
            className="text-xs text-center text-neutral-600 dark:text-neutral-400 flex items-center justify-center bg-white dark:bg-neutral-900 font-medium"
          >
            {view === 'year' 
              ? `W${index + 1}`
              : format(date, view === 'week' ? 'EEE' : 'd')
            }
          </div>
        ))}

        {/* Habit rows */}
        {habits.map((habit) => (
          <React.Fragment key={habit.id}>
            {/* Habit name and streak */}
            <div className="flex items-center justify-between pr-2 bg-white dark:bg-neutral-900">
              {editingHabit === habit.id ? (
                <Input
                  value={habit.name}
                  onChange={(e) => updateHabit(habit.id, { name: e.target.value })}
                  onBlur={() => setEditingHabit(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setEditingHabit(null);
                  }}
                  className="h-6 text-sm"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setEditingHabit(habit.id)}
                  className="text-sm font-medium truncate hover:text-primary-600 transition-colors"
                  style={{ color: habit.color }}
                >
                  {habit.name}
                </button>
              )}
              
              {/* Streak indicator */}
              {calculateStreak(habit.id) > 0 && (
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <TrendingUp className="w-3 h-3" />
                  {calculateStreak(habit.id)}
                </div>
              )}
            </div>

            {/* Habit cells */}
            {dates.map((date, index) => (
              <div key={index} className="bg-white dark:bg-neutral-900">
                {renderCell(habit.id, date)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Add new habit */}
      <div className="mt-6 flex items-center gap-2">
        <Input
          placeholder="Add new habit..."
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addHabit();
          }}
          className="flex-1"
        />
        <Button onClick={addHabit} size="sm">
          Add Habit
        </Button>
      </div>

      {/* Stats summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {habits.length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Total Habits
          </div>
        </div>
        
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {trackerData.filter(cell => 
              format(cell.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            ).length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Completed Today
          </div>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {Math.max(...habits.map(h => calculateStreak(h.id)))}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Best Streak
          </div>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {Math.round((trackerData.length / (habits.length * dates.length)) * 100)}%
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Completion Rate
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HabitTracker;