// ABOUTME: Beautiful date navigation with calendar popup and keyboard navigation
// Features month/year navigation, today indicator, and accessibility support

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  ArrowLeft,
  ArrowRight,
  Home
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { format, 
  addDays, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  subMonths,
  isSameDay,
  isToday,
  isSameMonth,
  getDay
} from 'date-fns';

import { cn } from '@/lib/utils/cn';
import { animations } from '@/lib/constants/design-tokens';
import { Button } from '@/components/ui/Button';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
  showWeekNumbers?: boolean;
  firstDayOfWeek?: 0 | 1; // 0 = Sunday, 1 = Monday
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function DatePicker({ 
  selectedDate, 
  onDateChange, 
  className,
  showWeekNumbers = false,
  firstDayOfWeek = 0
}: DatePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  // Generate calendar days
  const generateCalendarDays = useCallback(() => {
    const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: firstDayOfWeek });
    const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: firstDayOfWeek });
    
    const days = [];
    let current = start;
    
    while (current <= end) {
      days.push(current);
      current = addDays(current, 1);
    }
    
    return days;
  }, [viewDate, firstDayOfWeek]);

  const calendarDays = generateCalendarDays();

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCalendarOpen) return;

      switch (e.key) {
        case 'Escape':
          setIsCalendarOpen(false);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onDateChange(subDays(selectedDate, 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          onDateChange(addDays(selectedDate, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          onDateChange(subDays(selectedDate, 7));
          break;
        case 'ArrowDown':
          e.preventDefault();
          onDateChange(addDays(selectedDate, 7));
          break;
        case 'Home':
          e.preventDefault();
          onDateChange(new Date());
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCalendarOpen, selectedDate, onDateChange]);

  // Navigation functions
  const goToPreviousDay = () => onDateChange(subDays(selectedDate, 1));
  const goToNextDay = () => onDateChange(addDays(selectedDate, 1));
  const goToToday = () => onDateChange(new Date());
  
  const goToPreviousMonth = () => setViewDate(subMonths(viewDate, 1));
  const goToNextMonth = () => setViewDate(addMonths(viewDate, 1));

  const handleDateClick = (date: Date) => {
    onDateChange(date);
    setIsCalendarOpen(false);
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    setViewDate(newDate);
    setIsYearPickerOpen(false);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  return (
    <div className={cn("relative", className)}>
      {/* Main Date Navigation */}
      <div className="flex items-center gap-2">
        {/* Previous Day */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousDay}
          className="h-9 w-9"
          aria-label="Previous day"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* Date Display & Calendar Toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
            'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700',
            'hover:bg-neutral-50 dark:hover:bg-neutral-800',
            'focus:ring-2 focus:ring-primary-500 focus:outline-none',
            isCalendarOpen && 'ring-2 ring-primary-500'
          )}
        >
          <Calendar className="h-4 w-4 text-neutral-500" />
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </span>
          {isToday(selectedDate) && (
            <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full">
              Today
            </span>
          )}
        </motion.button>

        {/* Next Day */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextDay}
          className="h-9 w-9"
          aria-label="Next day"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>

        {/* Today Button */}
        {!isToday(selectedDate) && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            leftIcon={<Home className="h-3 w-3" />}
          >
            Today
          </Button>
        )}
      </div>

      {/* Calendar Popup */}
      <AnimatePresence>
        {isCalendarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsCalendarOpen(false)}
            />

            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                'absolute top-12 left-0 z-50 bg-white dark:bg-neutral-900',
                'border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg',
                'p-4 min-w-[320px]'
              )}
            >
              {/* Month/Year Header */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPreviousMonth}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <button
                  onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {format(viewDate, 'MMMM yyyy')}
                  </span>
                </button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextMonth}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Year Picker */}
              <AnimatePresence>
                {isYearPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 max-h-32 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg"
                  >
                    <div className="grid grid-cols-4 gap-1 p-2">
                      {generateYearOptions().map((year) => (
                        <button
                          key={year}
                          onClick={() => handleYearChange(year)}
                          className={cn(
                            'p-1 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-800',
                            year === viewDate.getFullYear() && 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          )}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className="h-8 flex items-center justify-center text-xs font-medium text-neutral-500 dark:text-neutral-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date) => {
                  const isSelected = isSameDay(date, selectedDate);
                  const isTodayDate = isToday(date);
                  const isCurrentMonth = isSameMonth(date, viewDate);

                  return (
                    <motion.button
                      key={date.toISOString()}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDateClick(date)}
                      className={cn(
                        'h-8 w-8 rounded-lg text-sm font-medium transition-all',
                        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                        'focus:ring-2 focus:ring-primary-500 focus:outline-none',
                        !isCurrentMonth && 'text-neutral-400 dark:text-neutral-600',
                        isCurrentMonth && 'text-neutral-900 dark:text-neutral-100',
                        isTodayDate && 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
                        isSelected && 'bg-primary-600 text-white hover:bg-primary-700'
                      )}
                    >
                      {format(date, 'd')}
                    </motion.button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToToday}
                  leftIcon={<Home className="h-3 w-3" />}
                >
                  Today
                </Button>

                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Use arrow keys to navigate
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export const MemoizedDatePicker = motion.memo(DatePicker);