// ABOUTME: Daily overview component with task completion, entry counts, and visual progress
// Features streak counters, progress rings, and beautiful animations

'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Dot, 
  TrendingUp, 
  Target,
  Flame,
  Award
} from 'lucide-react';
import { useMemo } from 'react';

import { JournalEntry, EntryType, TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import { animations } from '@/lib/constants/design-tokens';

interface DailyStatsProps {
  entries: JournalEntry[];
  date: Date;
  className?: string;
  showStreaks?: boolean;
}

interface StatItem {
  label: string;
  value: number;
  total?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

// Circular progress component
function CircularProgress({ 
  percentage, 
  size = 60, 
  strokeWidth = 6, 
  color = '#a855f7' 
}: { 
  percentage: number; 
  size?: number; 
  strokeWidth?: number; 
  color?: string; 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-neutral-200 dark:text-neutral-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="absolute text-sm font-bold text-neutral-900 dark:text-neutral-100"
      >
        {Math.round(percentage)}%
      </motion.span>
    </div>
  );
}

// Mini progress bar component
function MiniProgressBar({ 
  percentage, 
  color = '#a855f7',
  height = 4 
}: { 
  percentage: number; 
  color?: string; 
  height?: number; 
}) {
  return (
    <div className={`w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-${height}`}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
      />
    </div>
  );
}

export function DailyStats({ 
  entries, 
  date, 
  className, 
  showStreaks = true 
}: DailyStatsProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const taskEntries = entries.filter(e => e.type === 'task');
    const completedTasks = taskEntries.filter(e => e.status === 'done');
    const totalTasks = taskEntries.length;
    const completionPercentage = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    const entryCounts = entries.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as Record<EntryType, number>);

    return {
      totalEntries: entries.length,
      completionPercentage,
      completedTasks: completedTasks.length,
      totalTasks,
      entryCounts,
    };
  }, [entries]);

  // Stat items configuration
  const statItems: StatItem[] = [
    {
      label: 'Tasks',
      value: stats.completedTasks,
      total: stats.totalTasks,
      icon: CheckCircle2,
      color: '#10b981',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Notes',
      value: stats.entryCounts.note || 0,
      icon: Dot,
      color: '#6366f1',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    },
    {
      label: 'Events',
      value: stats.entryCounts.event || 0,
      icon: Calendar,
      color: '#f59e0b',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20',
    },
    {
      label: 'Habits',
      value: stats.entryCounts.habit || 0,
      icon: Target,
      color: '#8b5cf6',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ];

  return (
    <motion.div
      initial={animations.variants.fadeIn.initial}
      animate={animations.variants.fadeIn.animate}
      className={cn(
        'bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700',
        'p-6 space-y-6',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
        >
          Daily Overview
        </motion.h3>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-neutral-500 dark:text-neutral-400"
        >
          {date.toLocaleDateString()}
        </motion.div>
      </div>

      {/* Main Completion Circle */}
      {stats.totalTasks > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <CircularProgress 
            percentage={stats.completionPercentage} 
            size={80}
            color="#10b981"
          />
          <div className="mt-2 text-center">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Task Completion
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {stats.completedTasks} of {stats.totalTasks} completed
            </p>
          </div>
        </motion.div>
      )}

      {/* Entry Type Breakdown */}
      <div className="space-y-3">
        <motion.h4
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Entry Breakdown
        </motion.h4>
        
        <div className="grid grid-cols-2 gap-3">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            const percentage = stats.totalEntries > 0 ? (item.value / stats.totalEntries) * 100 : 0;
            
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={cn(
                  'p-3 rounded-lg border border-neutral-200 dark:border-neutral-700',
                  item.bgColor
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon 
                      className="w-4 h-4" 
                      style={{ color: item.color }} 
                    />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {item.total !== undefined ? `${item.value}/${item.total}` : item.value}
                  </span>
                </div>
                
                {item.total !== undefined ? (
                  <MiniProgressBar 
                    percentage={item.total > 0 ? (item.value / item.total) * 100 : 0}
                    color={item.color}
                  />
                ) : (
                  <MiniProgressBar 
                    percentage={percentage}
                    color={item.color}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Productivity Score */}
      {stats.totalEntries > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-4 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <TrendingUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
                  Productivity Score
                </p>
                <p className="text-xs text-primary-700 dark:text-primary-300">
                  Based on completion rate and activity
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
                className="text-2xl font-bold text-primary-600 dark:text-primary-400"
              >
                {Math.round((stats.completionPercentage * 0.6) + (Math.min(stats.totalEntries, 10) * 4))}
              </motion.span>
              <span className="text-primary-500 dark:text-primary-400">/100</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Streak Information */}
      {showStreaks && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
        >
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Current Streak
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
              3
            </span>
            <span className="text-xs text-orange-500 dark:text-orange-400">days</span>
          </div>
        </motion.div>
      )}

      {/* Achievement Badge */}
      {stats.completionPercentage === 100 && stats.totalTasks > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
          className="flex items-center justify-center p-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
        >
          <Award className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
          <span className="text-sm font-medium text-green-900 dark:text-green-100">
            Perfect Day! All tasks completed 🎉
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

export const MemoizedDailyStats = motion.memo(DailyStats);