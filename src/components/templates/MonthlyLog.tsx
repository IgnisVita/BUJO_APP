// ABOUTME: Monthly log template for bullet journal - calendar, tasks, events, goals
// Aligns perfectly with dot grid for authentic bullet journal experience

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Circle,
  Square,
  Triangle,
  Star,
  ChevronRight,
  Target,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns';
import { Template, TemplateElement, templateEngine } from '@/lib/templates/template-engine';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface MonthlyLogProps {
  month?: Date;
  onSaveTemplate?: (template: Template) => void;
  gridSpacing?: number; // Default 5mm = ~19px
  className?: string;
}

interface Task {
  id: string;
  content: string;
  type: 'task' | 'event' | 'note';
  completed?: boolean;
  migrated?: boolean;
  scheduled?: boolean;
}

interface MonthGoal {
  id: string;
  content: string;
  achieved?: boolean;
}

const bulletSymbols = {
  task: '•',
  event: '○',
  note: '—',
  completed: '×',
  migrated: '>',
  scheduled: '<',
  priority: '*',
};

export const MonthlyLog: React.FC<MonthlyLogProps> = ({
  month = new Date(),
  onSaveTemplate,
  gridSpacing = 19, // ~5mm
  className,
}) => {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Record<number, Task[]>>({});
  const [monthlyTasks, setMonthlyTasks] = useState<Task[]>([]);
  const [monthlyEvents, setMonthlyEvents] = useState<Task[]>([]);
  const [goals, setGoals] = useState<MonthGoal[]>([
    { id: '1', content: 'Read 3 books', achieved: false },
    { id: '2', content: 'Exercise 20 days', achieved: false },
    { id: '3', content: 'Complete project X', achieved: false },
  ]);
  const [habits, setHabits] = useState<string[]>(['Water', 'Exercise', 'Read', 'Meditate']);
  const [habitTracker, setHabitTracker] = useState<Record<string, boolean[]>>({});

  // Calculate calendar grid
  const calendarData = useMemo(() => {
    const daysInMonth = getDaysInMonth(month);
    const firstDay = startOfMonth(month);
    const startDayOfWeek = getDay(firstDay);
    
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = new Array(startDayOfWeek).fill(null);
    
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Fill last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return { weeks, daysInMonth };
  }, [month]);

  // Grid calculations for perfect alignment
  const gridLayout = {
    // Calendar takes up left 2/3
    calendarWidth: gridSpacing * 20, // 20 cells wide
    calendarHeight: gridSpacing * 12, // 6 weeks + headers
    
    // Tasks/events on right 1/3
    sidebarWidth: gridSpacing * 10,
    
    // Goals section below calendar
    goalsY: gridSpacing * 14,
    goalsHeight: gridSpacing * 4,
    
    // Mini habit tracker
    habitY: gridSpacing * 19,
    habitHeight: gridSpacing * 6,
  };

  const addTask = (day: number | null, task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random()}`,
    };

    if (day === null) {
      if (task.type === 'event') {
        setMonthlyEvents([...monthlyEvents, newTask]);
      } else {
        setMonthlyTasks([...monthlyTasks, newTask]);
      }
    } else {
      setTasks({
        ...tasks,
        [day]: [...(tasks[day] || []), newTask],
      });
    }
  };

  const toggleTask = (day: number | null, taskId: string) => {
    if (day === null) {
      setMonthlyTasks(monthlyTasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
    } else {
      setTasks({
        ...tasks,
        [day]: tasks[day].map(t => 
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ),
      });
    }
  };

  const toggleGoal = (goalId: string) => {
    setGoals(goals.map(g => 
      g.id === goalId ? { ...g, achieved: !g.achieved } : g
    ));
  };

  const toggleHabit = (habit: string, day: number) => {
    const current = habitTracker[habit] || new Array(31).fill(false);
    current[day - 1] = !current[day - 1];
    setHabitTracker({
      ...habitTracker,
      [habit]: [...current],
    });
  };

  const saveAsTemplate = () => {
    const template = templateEngine.createTemplate({
      name: `Monthly Log - ${format(month, 'MMMM yyyy')}`,
      category: 'monthly',
      description: 'Complete monthly spread with calendar, tasks, and goals',
      gridSize: { columns: 30, rows: 40 },
    });

    // Add to template...
    onSaveTemplate?.(template);
  };

  return (
    <Card className={cn('p-6 bg-white dark:bg-neutral-900', className)}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'serif' }}>
          {format(month, 'MMMM yyyy')}
        </h1>
        <Button onClick={saveAsTemplate} size="sm">
          Save Template
        </Button>
      </div>

      <div className="relative" style={{ minHeight: `${gridSpacing * 30}px` }}>
        {/* Calendar Grid */}
        <div 
          className="absolute"
          style={{
            left: 0,
            top: 0,
            width: `${gridLayout.calendarWidth}px`,
            height: `${gridLayout.calendarHeight}px`,
          }}
        >
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="text-center text-xs font-medium text-neutral-600"
                style={{ height: `${gridSpacing}px`, lineHeight: `${gridSpacing}px` }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          {calendarData.weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-0">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={`${weekIndex}-${dayIndex}`}
                  whileHover={day ? { scale: 1.05 } : {}}
                  whileTap={day ? { scale: 0.95 } : {}}
                  onClick={() => day && setSelectedDate(day)}
                  className={cn(
                    'border border-neutral-200 dark:border-neutral-700',
                    'cursor-pointer transition-colors',
                    day && selectedDate === day && 'bg-primary-50 dark:bg-primary-900/20',
                    !day && 'bg-neutral-50 dark:bg-neutral-800/50 cursor-default'
                  )}
                  style={{
                    width: `${gridSpacing * 2.8}px`,
                    height: `${gridSpacing * 2}px`,
                  }}
                >
                  {day && (
                    <div className="p-1 h-full">
                      <div className="text-sm font-medium mb-0.5">{day}</div>
                      <div className="flex flex-wrap gap-0.5">
                        {tasks[day]?.slice(0, 3).map((task, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              'w-1 h-1 rounded-full',
                              task.type === 'event' ? 'bg-blue-500' : 'bg-neutral-600',
                              task.completed && 'opacity-50'
                            )}
                          />
                        ))}
                        {tasks[day]?.length > 3 && (
                          <span className="text-xs text-neutral-500">+{tasks[day].length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        {/* Tasks & Events Sidebar */}
        <div
          className="absolute"
          style={{
            left: `${gridLayout.calendarWidth + gridSpacing}px`,
            top: 0,
            width: `${gridLayout.sidebarWidth}px`,
          }}
        >
          {/* Monthly Tasks */}
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
              <Square className="w-3 h-3" />
              TASKS
            </h3>
            <div className="space-y-1">
              {monthlyTasks.map(task => (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-center gap-2 text-sm cursor-pointer',
                    task.completed && 'line-through opacity-50'
                  )}
                  onClick={() => toggleTask(null, task.id)}
                >
                  <span className="font-mono">{task.completed ? '×' : '•'}</span>
                  <span>{task.content}</span>
                </div>
              ))}
              <button
                onClick={() => addTask(null, { type: 'task', content: 'New task' })}
                className="text-xs text-neutral-500 hover:text-neutral-700"
              >
                + Add task
              </button>
            </div>
          </div>

          {/* Monthly Events */}
          <div>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
              <Circle className="w-3 h-3" />
              EVENTS
            </h3>
            <div className="space-y-1">
              {monthlyEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="font-mono">○</span>
                  <span>{event.content}</span>
                </div>
              ))}
              <button
                onClick={() => addTask(null, { type: 'event', content: 'New event' })}
                className="text-xs text-neutral-500 hover:text-neutral-700"
              >
                + Add event
              </button>
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: `${gridLayout.goalsY}px`,
            width: `${gridLayout.calendarWidth}px`,
            height: `${gridLayout.goalsHeight}px`,
          }}
        >
          <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
            <Target className="w-3 h-3" />
            MONTHLY GOALS
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {goals.map(goal => (
              <div
                key={goal.id}
                className={cn(
                  'flex items-center gap-2 text-sm cursor-pointer p-2',
                  'border border-neutral-200 dark:border-neutral-700 rounded',
                  goal.achieved && 'bg-green-50 dark:bg-green-900/20'
                )}
                onClick={() => toggleGoal(goal.id)}
              >
                {goal.achieved ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
                <span className={cn(goal.achieved && 'line-through')}>{goal.content}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Habit Tracker */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: `${gridLayout.habitY}px`,
            width: '100%',
            height: `${gridLayout.habitHeight}px`,
          }}
        >
          <h3 className="text-sm font-bold mb-2">HABIT TRACKER</h3>
          <div className="flex gap-4">
            <div className="space-y-1">
              {habits.map(habit => (
                <div key={habit} className="text-sm" style={{ height: `${gridSpacing}px` }}>
                  {habit}
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-0.5">
                {Array.from({ length: calendarData.daysInMonth }, (_, i) => i + 1).map(day => (
                  <div key={day} className="flex flex-col gap-0.5">
                    <div className="text-xs text-center text-neutral-500 w-4">{day}</div>
                    {habits.map(habit => (
                      <button
                        key={`${habit}-${day}`}
                        onClick={() => toggleHabit(habit, day)}
                        className={cn(
                          'w-4 h-4 border border-neutral-300 rounded-sm',
                          'hover:border-neutral-400 transition-colors',
                          habitTracker[habit]?.[day - 1] && 'bg-green-500 border-green-500'
                        )}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MonthlyLog;