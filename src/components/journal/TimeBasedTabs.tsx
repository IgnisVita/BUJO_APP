// ABOUTME: Auto-updating time-based tab implementations
// Handles Today, This Week, This Month, and Future Log tabs with automatic date updates

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Tab, getTimeBasedTabContent } from './TabTypes';
import { DotGrid } from './DotGrid';
import { cn } from '../../lib/utils';

interface TimeBasedTabsProps {
  tab: Tab;
  onContentChange?: (date: Date, content: any) => void;
}

export const TimeBasedTabs: React.FC<TimeBasedTabsProps> = ({ tab, onContentChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

  // Auto-update current date
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      if (now.getDate() !== currentDate.getDate()) {
        setCurrentDate(now);
      }
    };

    const interval = setInterval(updateDate, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [currentDate]);

  const period = tab.metadata?.period || 'day';
  const dates = getTimeBasedTabContent(period);

  const renderTodayTab = () => {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-2xl font-bold">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => {
                const yesterday = new Date(currentDate);
                yesterday.setDate(yesterday.getDate() - 1);
                setCurrentDate(yesterday);
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </button>
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => {
                const tomorrow = new Date(currentDate);
                tomorrow.setDate(tomorrow.getDate() + 1);
                setCurrentDate(tomorrow);
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1">
          <DotGrid 
            key={currentDate.toISOString()}
            onContentChange={(content) => onContentChange?.(currentDate, content)}
          />
        </div>
      </div>
    );
  };

  const renderWeekTab = () => {
    const weekDates = dates;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">This Week</h2>
          <div className="flex items-center gap-2">
            <button
              className={cn(
                "px-3 py-1 rounded-lg",
                viewMode === 'single' 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-200 dark:bg-gray-700"
              )}
              onClick={() => setViewMode('single')}
            >
              Single Day
            </button>
            <button
              className={cn(
                "px-3 py-1 rounded-lg",
                viewMode === 'grid' 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-200 dark:bg-gray-700"
              )}
              onClick={() => setViewMode('grid')}
            >
              Week Grid
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="flex-1 grid grid-cols-7 gap-2 p-4">
            {weekDates.map((date) => {
              const isToday = date.toDateString() === today.toDateString();
              const isPast = date < today;
              
              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "border rounded-lg p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
                    isToday && "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
                    isPast && "opacity-60"
                  )}
                  onClick={() => {
                    setSelectedDate(date);
                    setViewMode('single');
                  }}
                >
                  <div className="text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold">{date.getDate()}</div>
                  </div>
                  <div className="mt-2 h-24 bg-gray-100 dark:bg-gray-700 rounded" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex">
            <div className="w-48 border-r p-4 space-y-2">
              {weekDates.map((date) => {
                const isToday = date.toDateString() === today.toDateString();
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                
                return (
                  <button
                    key={date.toISOString()}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      isSelected && "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
                      isToday && "font-bold"
                    )}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {date.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      {isToday && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                          Today
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex-1">
              {selectedDate ? (
                <DotGrid 
                  key={selectedDate.toISOString()}
                  onContentChange={(content) => onContentChange?.(selectedDate, content)}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Select a day to view
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMonthTab = () => {
    const monthDates = dates;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create calendar grid
    const firstDay = monthDates[0];
    const startPadding = firstDay.getDay();
    const calendarDates: (Date | null)[] = Array(startPadding).fill(null).concat(monthDates);

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => {
                const prevMonth = new Date(currentDate);
                prevMonth.setMonth(prevMonth.getMonth() - 1);
                setCurrentDate(prevMonth);
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={() => setCurrentDate(new Date())}
            >
              Current Month
            </button>
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => {
                const nextMonth = new Date(currentDate);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                setCurrentDate(nextMonth);
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          <div className="flex-1 p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 auto-rows-[100px]">
              {calendarDates.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} />;
                }

                const isToday = date.toDateString() === today.toDateString();
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isPast = date < today;

                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      "border rounded p-2 cursor-pointer transition-all",
                      "hover:bg-gray-50 dark:hover:bg-gray-800",
                      isToday && "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
                      isSelected && "ring-2 ring-blue-500",
                      isPast && "opacity-60"
                    )}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="text-sm font-medium">{date.getDate()}</div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {/* Preview of content could go here */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="w-1/2 border-l">
              <div className="p-4 border-b">
                <h3 className="font-medium">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
              </div>
              <div className="h-[calc(100%-60px)]">
                <DotGrid 
                  key={selectedDate.toISOString()}
                  onContentChange={(content) => onContentChange?.(selectedDate, content)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFutureLog = () => {
    const futureMonths = dates;

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Future Log - Next 6 Months</h2>
        </div>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {futureMonths.map((month) => (
            <div
              key={month.toISOString()}
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setSelectedDate(month)}
            >
              <h3 className="font-bold text-lg mb-2">
                {month.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h3>
              <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded">
                {/* Mini preview or notes for the month */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render appropriate view based on period
  switch (period) {
    case 'day':
      return renderTodayTab();
    case 'week':
      return renderWeekTab();
    case 'month':
      return renderMonthTab();
    case 'future':
      return renderFutureLog();
    default:
      return renderTodayTab();
  }
};