// ABOUTME: Analytics dashboard with habit tracking, productivity insights, and progress visualization
// Features interactive charts, goal tracking, and weekly/monthly summaries

'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  Clock,
  BookOpen,
  PenTool,
  CheckCircle,
  Circle,
  Award,
  Flame,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import * as React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

// Mock data - replace with actual data fetching
const mockData = {
  stats: {
    totalEntries: 127,
    streakDays: 12,
    completedTasks: 89,
    totalDrawings: 34,
  },
  weeklyActivity: [
    { day: 'Mon', entries: 3, drawings: 1, tasks: 8 },
    { day: 'Tue', entries: 2, drawings: 0, tasks: 5 },
    { day: 'Wed', entries: 4, drawings: 2, tasks: 12 },
    { day: 'Thu', entries: 1, drawings: 1, tasks: 6 },
    { day: 'Fri', entries: 3, drawings: 0, tasks: 9 },
    { day: 'Sat', entries: 2, drawings: 3, tasks: 4 },
    { day: 'Sun', entries: 1, drawings: 1, tasks: 3 },
  ],
  monthlyProgress: [
    { month: 'Jan', entries: 45, goals: 78 },
    { month: 'Feb', entries: 52, goals: 85 },
    { month: 'Mar', entries: 48, goals: 72 },
    { month: 'Apr', entries: 61, goals: 91 },
    { month: 'May', entries: 58, goals: 88 },
    { month: 'Jun', entries: 67, goals: 95 },
  ],
  habits: [
    { name: 'Morning Pages', completed: 8, total: 10, color: '#8b5cf6' },
    { name: 'Exercise', completed: 6, total: 10, color: '#10b981' },
    { name: 'Reading', completed: 7, total: 10, color: '#f59e0b' },
    { name: 'Meditation', completed: 9, total: 10, color: '#06b6d4' },
  ],
  entryTypes: [
    { name: 'Journal', value: 45, color: '#8b5cf6' },
    { name: 'Tasks', value: 38, color: '#10b981' },
    { name: 'Notes', value: 25, color: '#f59e0b' },
    { name: 'Drawings', value: 19, color: '#06b6d4' },
  ],
  goals: [
    { id: 1, title: 'Write daily journal entries', progress: 80, target: 30, current: 24 },
    { id: 2, title: 'Complete morning routine', progress: 90, target: 30, current: 27 },
    { id: 3, title: 'Finish weekly drawings', progress: 60, target: 4, current: 2.4 },
    { id: 4, title: 'Read 30 minutes daily', progress: 75, target: 30, current: 22.5 },
  ],
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
}

function StatCard({ title, value, change, icon, color = 'text-primary' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-xs",
                change >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {change >= 0 ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {Math.abs(change)}% from last week
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-lg bg-muted", color)}>
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

interface HabitCardProps {
  habit: typeof mockData.habits[0];
  index: number;
}

function HabitCard({ habit, index }: HabitCardProps) {
  const progress = (habit.completed / habit.total) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{habit.name}</h3>
          <span className="text-sm text-muted-foreground">
            {habit.completed}/{habit.total}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          {Array.from({ length: habit.total }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full",
                i < habit.completed ? "bg-current" : "bg-muted"
              )}
              style={{ color: habit.color }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: habit.color,
              }}
            />
          </div>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
      </Card>
    </motion.div>
  );
}

interface GoalCardProps {
  goal: typeof mockData.goals[0];
  index: number;
}

function GoalCard({ goal, index }: GoalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-medium leading-5">{goal.title}</h3>
          <span className="text-sm font-bold text-primary">
            {goal.progress}%
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Target className="h-4 w-4" />
          <span>{goal.current} / {goal.target}</span>
        </div>
        <div className="bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = React.useState<'week' | 'month' | 'year'>('week');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress and insights
          </p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Journal Entries"
          value={mockData.stats.totalEntries}
          change={12}
          icon={<BookOpen className="h-6 w-6" />}
          color="text-purple-600"
        />
        <StatCard
          title="Current Streak"
          value={`${mockData.stats.streakDays} days`}
          change={8}
          icon={<Flame className="h-6 w-6" />}
          color="text-orange-600"
        />
        <StatCard
          title="Tasks Completed"
          value={mockData.stats.completedTasks}
          change={-5}
          icon={<CheckCircle className="h-6 w-6" />}
          color="text-green-600"
        />
        <StatCard
          title="Drawings Created"
          value={mockData.stats.totalDrawings}
          change={25}
          icon={<PenTool className="h-6 w-6" />}
          color="text-blue-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Weekly Activity</h2>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="entries" fill="#8b5cf6" name="Entries" />
                  <Bar dataKey="drawings" fill="#06b6d4" name="Drawings" />
                  <Bar dataKey="tasks" fill="#10b981" name="Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Monthly Progress</h2>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData.monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="entries"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                    name="Entries"
                  />
                  <Area
                    type="monotone"
                    dataKey="goals"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                    name="Goal Progress"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Habits and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habits Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Habit Tracking</h2>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockData.habits.map((habit, index) => (
                <HabitCard key={habit.name} habit={habit} index={index} />
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Entry Types Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Entry Types</h2>
              <Circle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockData.entryTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockData.entryTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {mockData.entryTypes.map((type) => (
                <div key={type.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <span>{type.name}</span>
                  </div>
                  <span className="font-medium">{type.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Goals Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Current Goals</h2>
            <Award className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockData.goals.map((goal, index) => (
              <GoalCard key={goal.id} goal={goal} index={index} />
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}