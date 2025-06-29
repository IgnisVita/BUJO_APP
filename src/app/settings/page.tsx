// ABOUTME: Simple settings page for grid and app preferences
// Focused on essential customization options

'use client';

import Link from 'next/link';
import { ArrowLeft, Grid3x3, Palette, Moon, Sun, Monitor } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { GRID_PRESETS } from '@/lib/constants/grid-config';

export default function SettingsPage() {
  const [selectedGrid, setSelectedGrid] = useState('Standard 5mm');
  const [theme, setTheme] = useState('system');
  const [gridOpacity, setGridOpacity] = useState(0.3);
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [showPageShadow, setShowPageShadow] = useState(true);

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Simple Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/journal"
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-semibold">Settings</h1>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Grid Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <Grid3x3 className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">Grid Settings</h2>
            </div>

            <div className="space-y-6">
              {/* Grid Type */}
              <div>
                <label className="block text-sm font-medium mb-3">Grid Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.values(GRID_PRESETS).map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setSelectedGrid(preset.name)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedGrid === preset.name
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {preset.spacing}mm spacing
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Opacity */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Grid Opacity: {Math.round(gridOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={gridOpacity}
                  onChange={(e) => setGridOpacity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Grid Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showPageNumbers}
                    onChange={(e) => setShowPageNumbers(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm">Show page numbers</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showPageShadow}
                    onChange={(e) => setShowPageShadow(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm">Show page shadow</span>
                </label>
              </div>
            </div>
          </motion.section>

          {/* Appearance Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">Appearance</h2>
            </div>

            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setTheme(option.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === option.id
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-2" />
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <button className="px-8 py-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors">
              Save Changes
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}