// ABOUTME: Simple templates page for bullet journal layouts
// Provides pre-made templates without complex UI

'use client';

import Link from 'next/link';
import { ArrowLeft, Grid3x3, Calendar, CheckSquare, Target, Brain, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const templates = [
  {
    id: 'daily-log',
    name: 'Daily Log',
    description: 'Classic bullet journal daily spread',
    icon: Calendar,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'weekly-spread',
    name: 'Weekly Spread',
    description: 'Overview of your entire week',
    icon: Grid3x3,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'habit-tracker',
    name: 'Habit Tracker',
    description: 'Track daily habits and routines',
    icon: CheckSquare,
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'goal-planning',
    name: 'Goal Planning',
    description: 'Set and track your goals',
    icon: Target,
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'brain-dump',
    name: 'Brain Dump',
    description: 'Free-form thought capture',
    icon: Brain,
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'gratitude-log',
    name: 'Gratitude Log',
    description: 'Daily gratitude practice',
    icon: Heart,
    color: 'from-red-500 to-red-600'
  }
];

export default function TemplatesPage() {
  const handleTemplateSelect = (templateId: string) => {
    // In a real app, this would load the template into the journal
    window.location.href = `/journal?template=${templateId}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Simple Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/journal"
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-semibold">Templates</h1>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => {
            const Icon = template.icon;
            return (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleTemplateSelect(template.id)}
                className="group relative bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 text-left"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                  {template.name}
                </h3>
                
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {template.description}
                </p>

                <div className="absolute inset-0 rounded-2xl ring-2 ring-primary-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.button>
            );
          })}
        </div>

        {/* Blank Template Option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Or start with a blank page
          </p>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            <Grid3x3 className="w-4 h-4" />
            Blank Dot Grid
          </Link>
        </motion.div>
      </div>
    </div>
  );
}