// ABOUTME: Template browser component with categories, search, and drag-drop
// Visual template library for bullet journal layouts

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Star, 
  Clock, 
  Grid3x3, 
  CalendarDays,
  DollarSign,
  Heart,
  Briefcase,
  Plus,
  X,
  Download,
  Upload,
  Copy,
  Trash2,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { 
  Template, 
  TemplateCategory, 
  templateEngine,
  createDefaultTemplates 
} from '@/lib/templates/template-engine';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface TemplateLibraryProps {
  onTemplateSelect?: (template: Template) => void;
  onClose?: () => void;
  showFavorites?: boolean;
  className?: string;
}

const categoryIcons: Record<TemplateCategory, React.ReactNode> = {
  daily: <CalendarDays className="w-5 h-5" />,
  weekly: <Grid3x3 className="w-5 h-5" />,
  monthly: <CalendarDays className="w-5 h-5" />,
  habit: <Clock className="w-5 h-5" />,
  finance: <DollarSign className="w-5 h-5" />,
  project: <Briefcase className="w-5 h-5" />,
  health: <Heart className="w-5 h-5" />,
  custom: <Plus className="w-5 h-5" />,
};

const categoryLabels: Record<TemplateCategory, string> = {
  daily: 'Daily Logs',
  weekly: 'Weekly Spreads',
  monthly: 'Monthly Views',
  habit: 'Habit Trackers',
  finance: 'Finance Tracking',
  project: 'Project Planning',
  health: 'Health & Wellness',
  custom: 'Custom Templates',
};

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  onTemplateSelect,
  onClose,
  showFavorites = false,
  className,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentTemplates, setRecentTemplates] = useState<string[]>([]);
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      await templateEngine.loadTemplates();
      
      // Add default templates if none exist
      const existingTemplates = templateEngine.getTemplatesByCategory('daily');
      if (existingTemplates.length === 0) {
        const defaults = createDefaultTemplates();
        setTemplates(defaults);
      } else {
        // Get all templates
        const allCategories: TemplateCategory[] = [
          'daily', 'weekly', 'monthly', 'habit', 
          'finance', 'project', 'health', 'custom'
        ];
        const allTemplates = allCategories.flatMap(cat => 
          templateEngine.getTemplatesByCategory(cat)
        );
        setTemplates(allTemplates);
      }
    };

    loadTemplates();

    // Load favorites and recent from localStorage
    const storedFavorites = localStorage.getItem('bujo-favorite-templates');
    const storedRecent = localStorage.getItem('bujo-recent-templates');
    
    if (storedFavorites) setFavoriteTemplates(JSON.parse(storedFavorites));
    if (storedRecent) setRecentTemplates(JSON.parse(storedRecent));
  }, []);

  // Filter templates based on category and search
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory === 'favorites') {
      filtered = templates.filter(t => favoriteTemplates.includes(t.id));
    } else if (selectedCategory !== 'all') {
      filtered = templates.filter(t => t.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = templateEngine.searchTemplates(searchQuery);
    }

    // Sort with recent first
    filtered.sort((a, b) => {
      const aRecent = recentTemplates.indexOf(a.id);
      const bRecent = recentTemplates.indexOf(b.id);
      if (aRecent !== -1 && bRecent !== -1) return aRecent - bRecent;
      if (aRecent !== -1) return -1;
      if (bRecent !== -1) return 1;
      return 0;
    });

    return filtered;
  }, [templates, selectedCategory, searchQuery, favoriteTemplates, recentTemplates]);

  // Handle template selection
  const handleSelectTemplate = (template: Template) => {
    // Add to recent templates
    const newRecent = [template.id, ...recentTemplates.filter(id => id !== template.id)].slice(0, 10);
    setRecentTemplates(newRecent);
    localStorage.setItem('bujo-recent-templates', JSON.stringify(newRecent));

    onTemplateSelect?.(template);
  };

  // Toggle favorite
  const toggleFavorite = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = favoriteTemplates.includes(templateId)
      ? favoriteTemplates.filter(id => id !== templateId)
      : [...favoriteTemplates, templateId];
    
    setFavoriteTemplates(newFavorites);
    localStorage.setItem('bujo-favorite-templates', JSON.stringify(newFavorites));
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, template: Template) => {
    e.dataTransfer.setData('template', JSON.stringify(template));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Render template preview
  const renderTemplatePreview = (template: Template) => {
    const gridSize = 4; // Small grid for preview
    const previewScale = 120 / Math.max(template.gridSize.columns, template.gridSize.rows);

    return (
      <svg 
        viewBox={`0 0 ${template.gridSize.columns * gridSize} ${template.gridSize.rows * gridSize}`}
        className="w-full h-full"
      >
        {/* Dot grid background */}
        <defs>
          <pattern id={`grid-${template.id}`} width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <circle cx={gridSize/2} cy={gridSize/2} r="0.5" fill="#e5e7eb" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${template.id})`} />

        {/* Render template elements */}
        {template.elements.map(element => {
          const x = element.position.x * gridSize;
          const y = element.position.y * gridSize;
          const width = element.position.width * gridSize;
          const height = element.position.height * gridSize;

          switch (element.type) {
            case 'box':
              return (
                <g key={element.id}>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth="1"
                    strokeDasharray={element.style?.borderStyle === 'dashed' ? '2,2' : undefined}
                  />
                  {element.label && (
                    <text
                      x={x + 2}
                      y={y + 10}
                      fontSize="8"
                      fill="#374151"
                    >
                      {element.label}
                    </text>
                  )}
                </g>
              );
            case 'text':
              return (
                <text
                  key={element.id}
                  x={x}
                  y={y + height / 2}
                  fontSize="8"
                  fill="#374151"
                  dominantBaseline="middle"
                >
                  {element.content}
                </text>
              );
            case 'tracker':
              return (
                <g key={element.id}>
                  {Array.from({ length: element.config?.rows || 7 }).map((_, row) => (
                    Array.from({ length: element.config?.columns || 7 }).map((_, col) => (
                      <rect
                        key={`${row}-${col}`}
                        x={x + col * (width / (element.config?.columns || 7))}
                        y={y + row * (height / (element.config?.rows || 7))}
                        width={width / (element.config?.columns || 7) - 1}
                        height={height / (element.config?.rows || 7) - 1}
                        fill="none"
                        stroke="#d1d5db"
                        strokeWidth="0.5"
                      />
                    ))
                  ))}
                </g>
              );
            default:
              return null;
          }
        })}
      </svg>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'bg-white dark:bg-neutral-900 rounded-xl shadow-2xl',
        'border border-neutral-200 dark:border-neutral-700',
        'max-w-6xl w-full h-[80vh] flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Template Library
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Categories */}
        <div className="w-64 border-r border-neutral-200 dark:border-neutral-700 p-4 overflow-y-auto">
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                selectedCategory === 'all'
                  ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <Grid3x3 className="w-5 h-5" />
              <span>All Templates</span>
            </button>

            {showFavorites && (
              <button
                onClick={() => setSelectedCategory('favorites')}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                  selectedCategory === 'favorites'
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
              >
                <Star className="w-5 h-5" />
                <span>Favorites</span>
                {favoriteTemplates.length > 0 && (
                  <span className="ml-auto text-xs bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded-full">
                    {favoriteTemplates.length}
                  </span>
                )}
              </button>
            )}

            <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-2" />

            {(Object.keys(categoryIcons) as TemplateCategory[]).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                  selectedCategory === category
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
              >
                {categoryIcons[category]}
                <span>{categoryLabels[category]}</span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-2">
            <Button variant="outline" size="sm" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Import Template
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500">
              <Grid3x3 className="w-12 h-12 mb-4" />
              <p>No templates found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredTemplates.map(template => (
                  <motion.div
                    key={template.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      'relative group cursor-pointer',
                      'bg-white dark:bg-neutral-800 rounded-lg border',
                      'border-neutral-200 dark:border-neutral-700',
                      'hover:shadow-lg transition-all duration-200',
                      hoveredTemplate === template.id && 'ring-2 ring-primary-500'
                    )}
                    draggable
                    onDragStart={(e) => handleDragStart(e, template)}
                    onClick={() => handleSelectTemplate(template)}
                    onMouseEnter={() => setHoveredTemplate(template.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                  >
                    {/* Preview */}
                    <div className="aspect-square p-4 bg-neutral-50 dark:bg-neutral-900 rounded-t-lg">
                      {renderTemplatePreview(template)}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 mb-1">
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => toggleFavorite(template.id, e)}
                          className={cn(
                            'p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700',
                            favoriteTemplates.includes(template.id) && 'text-yellow-500'
                          )}
                        >
                          <Star className="w-3.5 h-3.5" fill={favoriteTemplates.includes(template.id) ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle duplicate
                          }}
                          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle export
                          }}
                          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Recent indicator */}
                    {recentTemplates.slice(0, 3).includes(template.id) && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs">
                        <Clock className="w-3 h-3" />
                        Recent
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TemplateLibrary;