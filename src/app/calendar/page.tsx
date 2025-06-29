// ABOUTME: Calendar page with month/week views, event management, and journal integration
// Features date navigation, event creation, and seamless integration with journal entries

'use client';

import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock,
  MapPin,
  User,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  duration?: number;
  location?: string;
  description?: string;
  color: string;
  type: 'event' | 'task' | 'reminder';
}

const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    date: new Date(),
    time: '10:00',
    duration: 60,
    location: 'Conference Room A',
    color: 'bg-blue-500',
    type: 'event'
  },
  {
    id: '2',
    title: 'Project Deadline',
    date: addDays(new Date(), 3),
    time: '17:00',
    color: 'bg-red-500',
    type: 'task'
  },
  {
    id: '3',
    title: 'Doctor Appointment',
    date: addDays(new Date(), 7),
    time: '14:30',
    duration: 30,
    location: 'Medical Center',
    color: 'bg-green-500',
    type: 'event'
  }
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [events] = useState<CalendarEvent[]>(sampleEvents);

  // Calculate calendar days for the current month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = [];
    let currentDay = calendarStart;

    while (currentDay <= calendarEnd) {
      days.push(new Date(currentDay));
      currentDay = addDays(currentDay, 1);
    }

    return days;
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8 max-w-7xl"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Calendar
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Manage your schedule and plan your days
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={goToToday}
                className="text-sm"
              >
                Today
              </Button>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPreviousMonth}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 px-4">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextMonth}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Event
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div
                    key={day}
                    className="p-3 text-center text-sm font-medium text-neutral-600 dark:text-neutral-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate);
                  const dayEvents = getEventsForDate(day);

                  return (
                    <motion.div
                      key={day.toISOString()}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className={cn(
                        'p-2 min-h-[80px] border border-neutral-200 dark:border-neutral-700 cursor-pointer transition-all',
                        'hover:bg-neutral-50 dark:hover:bg-neutral-800',
                        !isCurrentMonth && 'text-neutral-400 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-900',
                        isSelected && 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700',
                        isToday && 'bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-800'
                      )}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="flex flex-col h-full">
                        <div className={cn(
                          'text-sm font-medium mb-1',
                          isToday && 'text-primary-600 dark:text-primary-400 font-bold'
                        )}>
                          {format(day, 'd')}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={cn(
                                'text-xs p-1 rounded text-white truncate',
                                event.color
                              )}
                              title={event.title}
                            >
                              {event.time && (
                                <span className="opacity-90">{event.time} </span>
                              )}
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h3>
              
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn('w-3 h-3 rounded-full mt-1', event.color)} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {event.title}
                          </p>
                          {event.time && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                              <Clock className="w-3 h-3" />
                              {event.time}
                              {event.duration && ` (${event.duration}m)`}
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    No events scheduled
                  </p>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Event
                  </Button>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="space-y-2">
                  <Link href={`/journal/${format(selectedDate, 'yyyy-MM-dd')}`}>
                    <Button variant="outline" size="sm" fullWidth className="justify-start gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Open Journal Entry
                    </Button>
                  </Link>
                  
                  <Button variant="outline" size="sm" fullWidth className="justify-start gap-2">
                    <Plus className="w-4 h-4" />
                    Create Event
                  </Button>
                </div>
              </div>
            </Card>

            {/* Calendar Legend */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Event Types
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Events</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Tasks</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Reminders</span>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                This Month
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Events</span>
                  <span className="font-medium">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">This Week</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Completed</span>
                  <span className="font-medium text-green-600 dark:text-green-400">2</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}