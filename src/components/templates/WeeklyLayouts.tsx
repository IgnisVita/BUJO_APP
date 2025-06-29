// ABOUTME: Weekly layout templates for bullet journal - horizontal, vertical, dutch door
// Multiple authentic layouts that align with dot grid

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  LayoutGrid,
  Columns,
  Rows,
  PanelTop,
  ChevronLeft,
  ChevronRight,
  Circle,
  Square,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { Template, templateEngine } from '@/lib/templates/template-engine';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface WeeklyLayoutsProps {
  startDate?: Date;
  onSaveTemplate?: (template: Template) => void;
  gridSpacing?: number;
  className?: string;
}

type LayoutType = 'horizontal' | 'vertical' | 'twoPage' | 'dutchDoor' | 'boxed';

interface WeekTask {
  id: string;
  day: number; // 0-6 for days of week
  content: string;
  type: 'task' | 'event' | 'note';
  time?: string;
  completed?: boolean;
}

const layoutConfigs = {
  horizontal: {
    name: 'Horizontal Layout',
    description: '7 columns across the page',
    icon: Columns,
  },
  vertical: {
    name: 'Vertical Layout', 
    description: '7 rows down the page',
    icon: Rows,
  },
  twoPage: {
    name: 'Two-Page Spread',
    description: 'Classic Mon-Sun across 2 pages',
    icon: LayoutGrid,
  },
  dutchDoor: {
    name: 'Dutch Door',
    description: 'Split page with weekly overview',
    icon: PanelTop,
  },
  boxed: {
    name: 'Boxed Weekly',
    description: 'Compact boxes for each day',
    icon: Square,
  },
};

export const WeeklyLayouts: React.FC<WeeklyLayoutsProps> = ({
  startDate = new Date(),
  onSaveTemplate,
  gridSpacing = 19,
  className,
}) => {
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('horizontal');
  const [weekStart, setWeekStart] = useState(startOfWeek(startDate, { weekStartsOn: 1 }));
  const [tasks, setTasks] = useState<WeekTask[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [weeklyGoals, setWeeklyGoals] = useState<string[]>([
    'Complete project milestone',
    'Exercise 5 times',
    'Read 50 pages',
  ]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const addTask = (day: number, task: Omit<WeekTask, 'id' | 'day'>) => {
    const newTask: WeekTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random()}`,
      day,
    };
    setTasks([...tasks, newTask]);
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const getDayTasks = (day: number) => {
    return tasks.filter(t => t.day === day).sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      return 0;
    });
  };

  const renderTask = (task: WeekTask) => {
    const symbols = {
      task: task.completed ? '×' : '•',
      event: '○',
      note: '—',
    };

    return (
      <div
        key={task.id}
        className={cn(
          'flex items-start gap-1 text-sm cursor-pointer py-0.5',
          task.completed && 'opacity-50 line-through'
        )}
        onClick={() => task.type === 'task' && toggleTask(task.id)}
      >
        <span className="font-mono text-xs mt-0.5">{symbols[task.type]}</span>
        <div className="flex-1">
          {task.time && <span className="text-xs text-neutral-500 mr-1">{task.time}</span>}
          <span>{task.content}</span>
        </div>
      </div>
    );
  };

  const renderHorizontalLayout = () => (
    <div 
      className="grid grid-cols-7 gap-0 border-t border-l border-neutral-300 dark:border-neutral-700"
      style={{ minHeight: `${gridSpacing * 20}px` }}
    >
      {weekDays.map((day, index) => (
        <div
          key={index}
          className="border-r border-b border-neutral-300 dark:border-neutral-700 p-2"
        >
          <div className="mb-2 pb-1 border-b border-neutral-200 dark:border-neutral-800">
            <div className="font-bold text-sm">{format(day, 'EEE')}</div>
            <div className="text-xs text-neutral-500">{format(day, 'd')}</div>
          </div>
          <div className="space-y-0.5 min-h-[200px]">
            {getDayTasks(index).map(renderTask)}
            <button
              onClick={() => addTask(index, { type: 'task', content: 'New task' })}
              className="text-xs text-neutral-400 hover:text-neutral-600 w-full text-left"
            >
              + Add
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderVerticalLayout = () => (
    <div className="space-y-0">
      {weekDays.map((day, index) => (
        <div
          key={index}
          className="border border-neutral-300 dark:border-neutral-700 p-3"
          style={{ minHeight: `${gridSpacing * 4}px` }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-baseline gap-2">
              <span className="font-bold">{format(day, 'EEEE')}</span>
              <span className="text-sm text-neutral-500">{format(day, 'MMM d')}</span>
            </div>
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-0.5">
              {getDayTasks(index).map(renderTask)}
              <button
                onClick={() => addTask(index, { type: 'task', content: 'New task' })}
                className="text-xs text-neutral-400 hover:text-neutral-600"
              >
                + Add task
              </button>
            </div>
            <div className="border-l border-neutral-200 dark:border-neutral-800 pl-4">
              <div className="text-xs text-neutral-500 mb-1">Notes</div>
              <div className="space-y-1">
                {/* Time slots or notes area */}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTwoPageLayout = () => (
    <div className="grid grid-cols-2 gap-8">
      {/* Left page - Mon-Wed */}
      <div className="space-y-0">
        <div className="text-xs text-neutral-500 mb-2">LEFT PAGE</div>
        {weekDays.slice(0, 3).map((day, index) => (
          <div
            key={index}
            className="border border-neutral-300 dark:border-neutral-700 p-3 mb-4"
            style={{ minHeight: `${gridSpacing * 8}px` }}
          >
            <div className="font-bold mb-2">
              {format(day, 'EEEE, MMM d')}
            </div>
            <div className="space-y-0.5">
              {getDayTasks(index).map(renderTask)}
              <button
                onClick={() => addTask(index, { type: 'task', content: 'New task' })}
                className="text-xs text-neutral-400 hover:text-neutral-600"
              >
                + Add
              </button>
            </div>
          </div>
        ))}
        {/* Sunday on left page */}
        <div
          className="border border-neutral-300 dark:border-neutral-700 p-3"
          style={{ minHeight: `${gridSpacing * 4}px` }}
        >
          <div className="font-bold mb-2">
            {format(weekDays[6], 'EEEE, MMM d')}
          </div>
          <div className="space-y-0.5">
            {getDayTasks(6).map(renderTask)}
          </div>
        </div>
      </div>

      {/* Right page - Thu-Sat + Notes */}
      <div className="space-y-0">
        <div className="text-xs text-neutral-500 mb-2">RIGHT PAGE</div>
        {weekDays.slice(3, 6).map((day, index) => (
          <div
            key={index + 3}
            className="border border-neutral-300 dark:border-neutral-700 p-3 mb-4"
            style={{ minHeight: `${gridSpacing * 8}px` }}
          >
            <div className="font-bold mb-2">
              {format(day, 'EEEE, MMM d')}
            </div>
            <div className="space-y-0.5">
              {getDayTasks(index + 3).map(renderTask)}
              <button
                onClick={() => addTask(index + 3, { type: 'task', content: 'New task' })}
                className="text-xs text-neutral-400 hover:text-neutral-600"
              >
                + Add
              </button>
            </div>
          </div>
        ))}
        {/* Notes section */}
        <div
          className="border border-neutral-300 dark:border-neutral-700 p-3"
          style={{ minHeight: `${gridSpacing * 6}px` }}
        >
          <div className="font-bold mb-2">Notes</div>
          <textarea
            className="w-full h-24 bg-transparent resize-none outline-none text-sm"
            placeholder="Weekly notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderDutchDoorLayout = () => (
    <div>
      {/* Top section - always visible */}
      <div 
        className="border border-neutral-300 dark:border-neutral-700 p-4 mb-4"
        style={{ minHeight: `${gridSpacing * 6}px` }}
      >
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h4 className="font-bold text-sm mb-2">WEEKLY GOALS</h4>
            <div className="space-y-1">
              {weeklyGoals.map((goal, idx) => (
                <div key={idx} className="flex items-start gap-1 text-sm">
                  <Square className="w-3 h-3 mt-0.5" />
                  <span>{goal}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-2">KEY EVENTS</h4>
            <div className="space-y-1">
              {tasks.filter(t => t.type === 'event').slice(0, 5).map(event => (
                <div key={event.id} className="flex items-start gap-1 text-sm">
                  <Circle className="w-3 h-3 mt-0.5" />
                  <span>{format(weekDays[event.day], 'EEE')}: {event.content}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-2">NOTES</h4>
            <textarea
              className="w-full h-16 bg-transparent resize-none outline-none text-sm"
              placeholder="Important reminders..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bottom section - daily */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="border border-neutral-300 dark:border-neutral-700 p-2"
            style={{ minHeight: `${gridSpacing * 12}px` }}
          >
            <div className="text-center mb-2 pb-1 border-b border-neutral-200">
              <div className="font-bold text-xs">{format(day, 'EEE')}</div>
              <div className="text-xs text-neutral-500">{format(day, 'd')}</div>
            </div>
            <div className="space-y-0.5 text-xs">
              {getDayTasks(index).map(renderTask)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBoxedLayout = () => (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {weekDays.map((day, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className={cn(
              'border-2 border-neutral-300 dark:border-neutral-700 p-3 rounded-lg',
              index === 6 && 'col-span-2' // Sunday gets more space
            )}
            style={{ minHeight: `${gridSpacing * 10}px` }}
          >
            <div className="mb-2">
              <div className="font-bold">{format(day, 'EEEE')}</div>
              <div className="text-sm text-neutral-500">{format(day, 'MMMM d')}</div>
            </div>
            <div className="space-y-0.5">
              {getDayTasks(index).map(renderTask)}
              <button
                onClick={() => addTask(index, { type: 'task', content: 'New' })}
                className="text-xs text-neutral-400 hover:text-neutral-600 w-full text-left"
              >
                +
              </button>
            </div>
          </motion.div>
        ))}
        <div className="col-span-2 border-2 border-dashed border-neutral-300 dark:border-neutral-700 p-3 rounded-lg">
          <h4 className="font-bold mb-2">WEEK NOTES</h4>
          <textarea
            className="w-full h-32 bg-transparent resize-none outline-none text-sm"
            placeholder="Reflections, ideas, next week prep..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const layouts = {
    horizontal: renderHorizontalLayout,
    vertical: renderVerticalLayout,
    twoPage: renderTwoPageLayout,
    dutchDoor: renderDutchDoorLayout,
    boxed: renderBoxedLayout,
  };

  const saveAsTemplate = () => {
    const template = templateEngine.createTemplate({
      name: `Weekly ${layoutConfigs[selectedLayout].name} - ${format(weekStart, 'MMM d')}`,
      category: 'weekly',
      description: layoutConfigs[selectedLayout].description,
      gridSize: { columns: 30, rows: 40 },
    });

    onSaveTemplate?.(template);
  };

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setWeekStart(subWeeks(weekStart, 1))}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">
              Week of {format(weekStart, 'MMMM d, yyyy')}
            </h2>
            <button
              onClick={() => setWeekStart(addWeeks(weekStart, 1))}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <Button onClick={saveAsTemplate} size="sm">
            Save Template
          </Button>
        </div>

        {/* Layout selector */}
        <div className="flex gap-2 mb-6 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-fit">
          {Object.entries(layoutConfigs).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedLayout(key as LayoutType)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded transition-all',
                  selectedLayout === key
                    ? 'bg-white dark:bg-neutral-700 shadow-sm'
                    : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{config.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout Content */}
      <div className="weekly-layout-content">
        {layouts[selectedLayout]()}
      </div>

      {/* Quick add buttons */}
      <div className="mt-6 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const day = new Date().getDay();
            const adjustedDay = day === 0 ? 6 : day - 1; // Adjust for Monday start
            addTask(adjustedDay, { 
              type: 'task', 
              content: 'New task',
              time: format(new Date(), 'HH:mm')
            });
          }}
        >
          Add Task Today
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const day = Math.floor(Math.random() * 7);
            addTask(day, { 
              type: 'event', 
              content: 'New event'
            });
          }}
        >
          Add Event
        </Button>
      </div>
    </Card>
  );
};

export default WeeklyLayouts;