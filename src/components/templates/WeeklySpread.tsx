// ABOUTME: Weekly spread template with customizable layouts
// 7-day grid layout with time blocking and task sections

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Clock,
  CheckSquare,
  List,
  Grid3x3,
  Layout,
  Columns,
  Square,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Template, templateEngine } from '@/lib/templates/template-engine';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface WeeklySpreadProps {
  onSaveTemplate?: (template: Template) => void;
  defaultLayout?: 'horizontal' | 'vertical' | 'grid' | 'classic';
  startDate?: Date;
  gridCellSize?: number;
  className?: string;
}

type LayoutType = 'horizontal' | 'vertical' | 'grid' | 'classic';

interface TimeBlock {
  id: string;
  dayIndex: number;
  startHour: number;
  endHour: number;
  title: string;
  color: string;
}

interface Task {
  id: string;
  dayIndex: number;
  text: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface Note {
  id: string;
  dayIndex: number;
  text: string;
}

const layoutIcons = {
  horizontal: <Layout className="w-4 h-4" />,
  vertical: <Columns className="w-4 h-4" />,
  grid: <Grid3x3 className="w-4 h-4" />,
  classic: <Square className="w-4 h-4" />,
};

const timeSlots = Array.from({ length: 24 }, (_, i) => i);
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const blockColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', 
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f8', '#d946ef', '#ec4899',
];

export const WeeklySpread: React.FC<WeeklySpreadProps> = ({
  onSaveTemplate,
  defaultLayout = 'horizontal',
  startDate = startOfWeek(new Date()),
  gridCellSize = 20,
  className,
}) => {
  const [layout, setLayout] = useState<LayoutType>(defaultLayout);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showTimeGrid, setShowTimeGrid] = useState(true);
  
  // Form state
  const [newTask, setNewTask] = useState('');
  const [newNote, setNewNote] = useState('');
  const [timeBlockForm, setTimeBlockForm] = useState({
    startHour: 9,
    endHour: 10,
    title: '',
  });

  // Calculate week dates
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  }, [startDate]);

  // Add time block
  const addTimeBlock = (dayIndex: number) => {
    if (!timeBlockForm.title) return;

    const newBlock: TimeBlock = {
      id: Date.now().toString(),
      dayIndex,
      startHour: timeBlockForm.startHour,
      endHour: timeBlockForm.endHour,
      title: timeBlockForm.title,
      color: blockColors[timeBlocks.length % blockColors.length],
    };

    setTimeBlocks([...timeBlocks, newBlock]);
    setTimeBlockForm({ startHour: 9, endHour: 10, title: '' });
  };

  // Add task
  const addTask = (dayIndex: number) => {
    if (!newTask) return;

    const task: Task = {
      id: Date.now().toString(),
      dayIndex,
      text: newTask,
      completed: false,
    };

    setTasks([...tasks, task]);
    setNewTask('');
  };

  // Toggle task completion
  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Add note
  const addNote = (dayIndex: number) => {
    if (!newNote) return;

    const note: Note = {
      id: Date.now().toString(),
      dayIndex,
      text: newNote,
    };

    setNotes([...notes, note]);
    setNewNote('');
  };

  // Save as template
  const saveAsTemplate = () => {
    let gridSize;
    switch (layout) {
      case 'horizontal':
        gridSize = { columns: 40, rows: 15 };
        break;
      case 'vertical':
        gridSize = { columns: 15, rows: 40 };
        break;
      case 'grid':
        gridSize = { columns: 28, rows: 20 };
        break;
      case 'classic':
        gridSize = { columns: 30, rows: 25 };
        break;
    }

    const template = templateEngine.createTemplate({
      name: `Weekly Spread - ${layout}`,
      category: 'weekly',
      description: `${layout} weekly layout with time blocking and task areas`,
      gridSize,
    });

    // Add elements based on layout
    switch (layout) {
      case 'horizontal':
        // Days as columns
        dayNames.forEach((day, index) => {
          const xOffset = index * 5.5;
          
          // Day header
          templateEngine.addElement(template.id, {
            type: 'text',
            position: { x: xOffset, y: 0, width: 5, height: 1 },
            content: day,
            style: { fontSize: 'medium', fontWeight: 'bold', textAlign: 'center' },
          });

          // Date
          templateEngine.addElement(template.id, {
            type: 'text',
            position: { x: xOffset, y: 1, width: 5, height: 1 },
            content: format(weekDates[index], 'MMM d'),
            style: { fontSize: 'small', textAlign: 'center' },
          });

          // Task area
          templateEngine.addElement(template.id, {
            type: 'box',
            position: { x: xOffset, y: 3, width: 5, height: 6 },
            label: 'Tasks',
          });

          // Notes area
          templateEngine.addElement(template.id, {
            type: 'box',
            position: { x: xOffset, y: 10, width: 5, height: 4 },
            label: 'Notes',
          });
        });
        break;

      case 'vertical':
        // Days as rows
        dayNames.forEach((day, index) => {
          const yOffset = index * 5.5;
          
          // Day header
          templateEngine.addElement(template.id, {
            type: 'text',
            position: { x: 0, y: yOffset, width: 3, height: 1 },
            content: day,
            style: { fontSize: 'medium', fontWeight: 'bold' },
          });

          // Time blocks area
          templateEngine.addElement(template.id, {
            type: 'box',
            position: { x: 4, y: yOffset, width: 6, height: 5 },
            label: 'Schedule',
          });

          // Tasks area
          templateEngine.addElement(template.id, {
            type: 'box',
            position: { x: 11, y: yOffset, width: 4, height: 5 },
            label: 'To-Do',
          });
        });
        break;

      case 'grid':
        // 2x4 grid (one cell for week overview)
        const gridPositions = [
          { x: 0, y: 0 }, { x: 14, y: 0 },
          { x: 0, y: 10 }, { x: 14, y: 10 },
          { x: 0, y: 20 }, { x: 14, y: 20 },
          { x: 0, y: 30 }, { x: 14, y: 30 },
        ];

        // Week overview in first cell
        templateEngine.addElement(template.id, {
          type: 'text',
          position: { x: 0, y: 0, width: 13, height: 1 },
          content: 'Week Overview',
          style: { fontSize: 'large', fontWeight: 'bold' },
        });

        templateEngine.addElement(template.id, {
          type: 'box',
          position: { x: 0, y: 2, width: 13, height: 7 },
          label: 'Goals & Priorities',
        });

        // Daily cells
        dayNames.slice(0, 7).forEach((day, index) => {
          const pos = gridPositions[index + 1];
          
          templateEngine.addElement(template.id, {
            type: 'text',
            position: { x: pos.x, y: pos.y, width: 13, height: 1 },
            content: day,
            style: { fontSize: 'medium', fontWeight: 'bold' },
          });

          templateEngine.addElement(template.id, {
            type: 'box',
            position: { x: pos.x, y: pos.y + 2, width: 13, height: 7 },
          });
        });
        break;

      case 'classic':
        // Traditional bullet journal weekly
        // Left page - Monday to Thursday
        for (let i = 1; i <= 4; i++) {
          const yOffset = (i - 1) * 6;
          
          templateEngine.addElement(template.id, {
            type: 'text',
            position: { x: 0, y: yOffset, width: 14, height: 1 },
            content: `${dayNames[i]} - ${format(weekDates[i], 'MMM d')}`,
            style: { fontSize: 'medium', fontWeight: 'bold' },
          });

          templateEngine.addElement(template.id, {
            type: 'box',
            position: { x: 0, y: yOffset + 1, width: 14, height: 4 },
          });
        }

        // Right page - Friday to Sunday + Notes
        for (let i = 5; i <= 7; i++) {
          const yOffset = (i - 5) * 6;
          
          templateEngine.addElement(template.id, {
            type: 'text',
            position: { x: 15, y: yOffset, width: 14, height: 1 },
            content: `${dayNames[i % 7]} - ${format(weekDates[i % 7], 'MMM d')}`,
            style: { fontSize: 'medium', fontWeight: 'bold' },
          });

          templateEngine.addElement(template.id, {
            type: 'box',
            position: { x: 15, y: yOffset + 1, width: 14, height: 4 },
          });
        }

        // Notes section
        templateEngine.addElement(template.id, {
          type: 'text',
          position: { x: 15, y: 18, width: 14, height: 1 },
          content: 'Notes',
          style: { fontSize: 'medium', fontWeight: 'bold' },
        });

        templateEngine.addElement(template.id, {
          type: 'box',
          position: { x: 15, y: 19, width: 14, height: 5 },
        });
        break;
    }

    onSaveTemplate?.(template);
  };

  // Render day content
  const renderDayContent = (dayIndex: number) => {
    const dayTasks = tasks.filter(t => t.dayIndex === dayIndex);
    const dayNotes = notes.filter(n => n.dayIndex === dayIndex);
    const dayBlocks = timeBlocks.filter(b => b.dayIndex === dayIndex);

    return (
      <div className="h-full flex flex-col p-2">
        {/* Time blocks */}
        {showTimeGrid && layout !== 'grid' && (
          <div className="mb-2">
            <div className="text-xs font-medium mb-1">Schedule</div>
            <div className="relative h-20 bg-neutral-50 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
              {dayBlocks.map(block => {
                const left = (block.startHour / 24) * 100;
                const width = ((block.endHour - block.startHour) / 24) * 100;
                
                return (
                  <div
                    key={block.id}
                    className="absolute top-0 h-full rounded text-xs text-white p-1 overflow-hidden"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: block.color,
                    }}
                  >
                    <div className="font-medium truncate">{block.title}</div>
                    <div className="text-xs opacity-80">
                      {block.startHour}:00 - {block.endHour}:00
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tasks */}
        <div className="flex-1 mb-2">
          <div className="text-xs font-medium mb-1">Tasks</div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {dayTasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-1 text-xs cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded px-1"
                onClick={() => toggleTask(task.id)}
              >
                <CheckSquare 
                  className={cn(
                    'w-3 h-3',
                    task.completed 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-neutral-400'
                  )}
                />
                <span className={cn(
                  'flex-1',
                  task.completed && 'line-through text-neutral-500'
                )}>
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {layout !== 'grid' && (
          <div>
            <div className="text-xs font-medium mb-1">Notes</div>
            <div className="space-y-1 max-h-16 overflow-y-auto">
              {dayNotes.map(note => (
                <div key={note.id} className="text-xs text-neutral-600 dark:text-neutral-400">
                  • {note.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render layout
  const renderLayout = () => {
    switch (layout) {
      case 'horizontal':
        return (
          <div className="grid grid-cols-7 gap-2 h-96">
            {weekDates.map((date, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  'border-2 rounded-lg p-2 cursor-pointer transition-all',
                  selectedDay === index
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600',
                  isSameDay(date, new Date()) && 'bg-blue-50 dark:bg-blue-900/10'
                )}
                onClick={() => setSelectedDay(index)}
              >
                <div className="text-center mb-2">
                  <div className="font-bold text-sm">{dayNamesShort[index]}</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    {format(date, 'd')}
                  </div>
                </div>
                {renderDayContent(index)}
              </motion.div>
            ))}
          </div>
        );

      case 'vertical':
        return (
          <div className="space-y-2">
            {weekDates.map((date, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -2 }}
                className={cn(
                  'border-2 rounded-lg p-3 cursor-pointer transition-all',
                  selectedDay === index
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                    : 'border-neutral-200 dark:border-neutral-700',
                  isSameDay(date, new Date()) && 'bg-blue-50 dark:bg-blue-900/10'
                )}
                onClick={() => setSelectedDay(index)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold">{dayNames[index]}</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {format(date, 'MMM d')}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    {renderDayContent(index)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'grid':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Week overview */}
            <div className="md:col-span-1 border-2 border-primary-200 dark:border-primary-800 rounded-lg p-3 bg-primary-50 dark:bg-primary-900/10">
              <h3 className="font-bold text-sm mb-2">Week Overview</h3>
              <div className="text-xs space-y-1">
                <p className="text-neutral-600 dark:text-neutral-400">
                  {format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d, yyyy')}
                </p>
                <div className="mt-3">
                  <p className="font-medium mb-1">This Week:</p>
                  <p>• {tasks.filter(t => !t.completed).length} tasks pending</p>
                  <p>• {tasks.filter(t => t.completed).length} tasks completed</p>
                  <p>• {timeBlocks.length} time blocks</p>
                </div>
              </div>
            </div>

            {/* Daily cells */}
            {weekDates.map((date, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  'border-2 rounded-lg p-3 cursor-pointer transition-all',
                  selectedDay === index
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                    : 'border-neutral-200 dark:border-neutral-700',
                  isSameDay(date, new Date()) && 'ring-2 ring-blue-400'
                )}
                onClick={() => setSelectedDay(index)}
              >
                <div className="font-bold text-sm mb-1">{dayNamesShort[index]}</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                  {format(date, 'MMM d')}
                </div>
                {renderDayContent(index)}
              </motion.div>
            ))}
          </div>
        );

      case 'classic':
        return (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left page */}
            <div className="space-y-4">
              {weekDates.slice(1, 5).map((date, index) => (
                <motion.div
                  key={index + 1}
                  className={cn(
                    'border rounded-lg p-3',
                    selectedDay === index + 1
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                      : 'border-neutral-300 dark:border-neutral-700'
                  )}
                  onClick={() => setSelectedDay(index + 1)}
                >
                  <div className="font-bold mb-2">
                    {dayNames[index + 1]} - {format(date, 'MMM d')}
                  </div>
                  {renderDayContent(index + 1)}
                </motion.div>
              ))}
            </div>

            {/* Right page */}
            <div className="space-y-4">
              {weekDates.slice(5, 7).concat(weekDates.slice(0, 1)).map((date, index) => {
                const dayIndex = index < 2 ? index + 5 : 0;
                return (
                  <motion.div
                    key={dayIndex}
                    className={cn(
                      'border rounded-lg p-3',
                      selectedDay === dayIndex
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                        : 'border-neutral-300 dark:border-neutral-700'
                    )}
                    onClick={() => setSelectedDay(dayIndex)}
                  >
                    <div className="font-bold mb-2">
                      {dayNames[dayIndex]} - {format(date, 'MMM d')}
                    </div>
                    {renderDayContent(dayIndex)}
                  </motion.div>
                );
              })}

              {/* Notes section */}
              <div className="border border-neutral-300 dark:border-neutral-700 rounded-lg p-3">
                <div className="font-bold mb-2">Weekly Notes</div>
                <div className="h-24 bg-neutral-50 dark:bg-neutral-800 rounded p-2">
                  <textarea
                    className="w-full h-full bg-transparent resize-none text-sm"
                    placeholder="Reflections, goals, ideas..."
                  />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Weekly Spread
          </h2>
          
          <div className="flex items-center gap-2">
            {/* Layout selector */}
            <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              {(Object.keys(layoutIcons) as LayoutType[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLayout(l)}
                  className={cn(
                    'p-2 rounded transition-all',
                    layout === l
                      ? 'bg-white dark:bg-neutral-700 shadow-sm'
                      : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  )}
                  title={l}
                >
                  {layoutIcons[l]}
                </button>
              ))}
            </div>

            <Button onClick={saveAsTemplate} size="sm">
              Save as Template
            </Button>
          </div>
        </div>

        {/* Week navigation */}
        <div className="text-center text-lg font-medium text-neutral-700 dark:text-neutral-300">
          Week of {format(startDate, 'MMMM d, yyyy')}
        </div>
      </div>

      {/* Layout content */}
      {renderLayout()}

      {/* Quick add panel for selected day */}
      {selectedDay !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
        >
          <h3 className="font-bold mb-3">
            Add to {dayNames[selectedDay]} ({format(weekDates[selectedDay], 'MMM d')})
          </h3>
          
          <div className="space-y-3">
            {/* Add time block */}
            {layout !== 'grid' && (
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-xs text-neutral-600 dark:text-neutral-400">Time Block</label>
                  <Input
                    placeholder="Meeting, Focus time..."
                    value={timeBlockForm.title}
                    onChange={(e) => setTimeBlockForm({ ...timeBlockForm, title: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addTimeBlock(selectedDay);
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-600 dark:text-neutral-400">Start</label>
                  <select
                    value={timeBlockForm.startHour}
                    onChange={(e) => setTimeBlockForm({ ...timeBlockForm, startHour: Number(e.target.value) })}
                    className="px-2 py-2 border rounded-lg text-sm bg-white dark:bg-neutral-700"
                  >
                    {timeSlots.map(hour => (
                      <option key={hour} value={hour}>{hour}:00</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-600 dark:text-neutral-400">End</label>
                  <select
                    value={timeBlockForm.endHour}
                    onChange={(e) => setTimeBlockForm({ ...timeBlockForm, endHour: Number(e.target.value) })}
                    className="px-2 py-2 border rounded-lg text-sm bg-white dark:bg-neutral-700"
                  >
                    {timeSlots.map(hour => (
                      <option key={hour} value={hour}>{hour}:00</option>
                    ))}
                  </select>
                </div>
                <Button onClick={() => addTimeBlock(selectedDay)} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Add task */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTask(selectedDay);
                }}
              />
              <Button onClick={() => addTask(selectedDay)} size="sm">
                <CheckSquare className="w-4 h-4 mr-1" />
                Add Task
              </Button>
            </div>

            {/* Add note */}
            {layout !== 'grid' && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addNote(selectedDay);
                  }}
                />
                <Button onClick={() => addNote(selectedDay)} size="sm" variant="outline">
                  <List className="w-4 h-4 mr-1" />
                  Add Note
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </Card>
  );
};

export default WeeklySpread;