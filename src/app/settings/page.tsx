// ABOUTME: Settings page with theme preferences, customization options, and data management
// Features organized sections with search, keyboard shortcuts help, and import/export

'use client';

import { motion } from 'framer-motion';
import {
  Settings,
  Palette,
  Keyboard,
  Download,
  Upload,
  Moon,
  Sun,
  Monitor,
  Eye,
  Type,
  Zap,
  Shield,
  HardDrive,
  Bell,
  Globe,
  User,
  Save,
  RotateCcw,
  Search,
  ChevronRight,
  Info,
  CheckCircle,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

interface BulletSymbol {
  id: string;
  name: string;
  symbol: string;
  description: string;
  default?: boolean;
}

const bulletSymbols: BulletSymbol[] = [
  { id: 'dot', name: 'Dot', symbol: '•', description: 'Tasks', default: true },
  { id: 'dash', name: 'Dash', symbol: '–', description: 'Notes' },
  { id: 'star', name: 'Star', symbol: '★', description: 'Events' },
  { id: 'exclamation', name: 'Exclamation', symbol: '!', description: 'Priority' },
  { id: 'question', name: 'Question', symbol: '?', description: 'Ideas' },
  { id: 'arrow', name: 'Arrow', symbol: '→', description: 'Scheduled' },
  { id: 'x', name: 'Cross', symbol: '✗', description: 'Completed' },
  { id: 'check', name: 'Check', symbol: '✓', description: 'Done' },
];

const themes = [
  { id: 'light', name: 'Light', icon: <Sun className="h-4 w-4" /> },
  { id: 'dark', name: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { id: 'system', name: 'System', icon: <Monitor className="h-4 w-4" /> },
];

const keyboardShortcuts = [
  { category: 'Navigation', shortcuts: [
    { keys: '⌘ + J', description: 'Open Journal' },
    { keys: '⌘ + D', description: 'Open Drawing Canvas' },
    { keys: '⌘ + B', description: 'Open Dashboard' },
    { keys: '⌘ + ,', description: 'Open Settings' },
  ]},
  { category: 'Quick Actions', shortcuts: [
    { keys: '⌘ + K', description: 'Command Palette' },
    { keys: '⌘ + F', description: 'Search' },
    { keys: '⌘ + N', description: 'New Entry' },
    { keys: '⌘ + S', description: 'Save' },
  ]},
  { category: 'Tools', shortcuts: [
    { keys: '⌘ + T', description: 'Timer' },
    { keys: '⌘ + C', description: 'Calculator' },
    { keys: 'F1', description: 'Help' },
  ]},
];

function ThemeSettings() {
  const [selectedTheme, setSelectedTheme] = React.useState('system');

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize how the app looks and feels
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setSelectedTheme(theme.id)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors',
              selectedTheme === theme.id
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-accent'
            )}
          >
            <div className={cn(
              'p-2 rounded-full',
              selectedTheme === theme.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
              {theme.icon}
            </div>
            <span className="text-sm font-medium">{theme.name}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Font Size</label>
            <p className="text-xs text-muted-foreground">Adjust text size for better readability</p>
          </div>
          <select className="px-3 py-1 border rounded">
            <option value="small">Small</option>
            <option value="medium" defaultValue>Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Compact Mode</label>
            <p className="text-xs text-muted-foreground">Reduce spacing for more content</p>
          </div>
          <input type="checkbox" className="toggle" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">High Contrast</label>
            <p className="text-xs text-muted-foreground">Increase contrast for accessibility</p>
          </div>
          <input type="checkbox" className="toggle" />
        </div>
      </div>
    </div>
  );
}

function BulletSymbolSettings() {
  const [customSymbols, setCustomSymbols] = React.useState(bulletSymbols);

  const updateSymbol = (id: string, symbol: string) => {
    setCustomSymbols(prev => prev.map(s => 
      s.id === id ? { ...s, symbol } : s
    ));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Bullet Symbols</h3>
        <p className="text-sm text-muted-foreground">
          Customize symbols used in your bullet journal
        </p>
      </div>

      <div className="space-y-3">
        {customSymbols.map((bullet) => (
          <div key={bullet.id} className="flex items-center gap-4 p-3 border rounded-lg">
            <input
              type="text"
              value={bullet.symbol}
              onChange={(e) => updateSymbol(bullet.id, e.target.value)}
              className="w-12 h-12 text-center text-lg border rounded-md"
              maxLength={1}
            />
            <div className="flex-1">
              <div className="font-medium">{bullet.name}</div>
              <div className="text-sm text-muted-foreground">{bullet.description}</div>
            </div>
            {bullet.default && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                Default
              </span>
            )}
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full">
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset to Defaults
      </Button>
    </div>
  );
}

function KeyboardShortcutsSettings() {
  const [showHelp, setShowHelp] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Keyboard Shortcuts</h3>
          <p className="text-sm text-muted-foreground">
            View and customize keyboard shortcuts
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowHelp(!showHelp)}
        >
          {showHelp ? 'Hide' : 'Show'} Shortcuts
        </Button>
      </div>

      {showHelp && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          {keyboardShortcuts.map((category) => (
            <div key={category.category}>
              <h4 className="font-medium mb-2">{category.category}</h4>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-background border rounded text-xs font-mono">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Enable Shortcuts</label>
            <p className="text-xs text-muted-foreground">Global keyboard shortcuts</p>
          </div>
          <input type="checkbox" className="toggle" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Show Hints</label>
            <p className="text-xs text-muted-foreground">Display shortcut hints in UI</p>
          </div>
          <input type="checkbox" className="toggle" defaultChecked />
        </div>
      </div>
    </div>
  );
}

function DataSettings() {
  const [dataSize, setDataSize] = React.useState('2.4 MB');
  const [lastBackup, setLastBackup] = React.useState('2 days ago');

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting data...');
  };

  const handleImport = () => {
    // TODO: Implement import functionality
    console.log('Importing data...');
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Data Management</h3>
        <p className="text-sm text-muted-foreground">
          Import, export, and manage your data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HardDrive className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">Storage Used</div>
              <div className="text-sm text-muted-foreground">{dataSize}</div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Journal entries</span>
              <span>1.8 MB</span>
            </div>
            <div className="flex justify-between">
              <span>Drawings</span>
              <span>0.4 MB</span>
            </div>
            <div className="flex justify-between">
              <span>Settings</span>
              <span>0.2 MB</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium">Last Backup</div>
              <div className="text-sm text-muted-foreground">{lastBackup}</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Automatic backups are enabled and running smoothly.
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <Button onClick={handleExport} className="w-full justify-start">
          <Download className="h-4 w-4 mr-2" />
          Export All Data
        </Button>

        <Button onClick={handleImport} variant="outline" className="w-full justify-start">
          <Upload className="h-4 w-4 mr-2" />
          Import Data
        </Button>

        <div className="border-t pt-3">
          <div className="text-sm text-muted-foreground mb-2">
            Danger Zone
          </div>
          <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
            Clear All Data
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeSection, setActiveSection] = React.useState('appearance');

  const sections: SettingSection[] = [
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Theme, colors, and visual preferences',
      icon: <Palette className="h-5 w-5" />,
      component: <ThemeSettings />,
    },
    {
      id: 'bullets',
      title: 'Bullet Symbols',
      description: 'Customize bullet journal symbols',
      icon: <Type className="h-5 w-5" />,
      component: <BulletSymbolSettings />,
    },
    {
      id: 'shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'View and customize shortcuts',
      icon: <Keyboard className="h-5 w-5" />,
      component: <KeyboardShortcutsSettings />,
    },
    {
      id: 'data',
      title: 'Data & Storage',
      description: 'Import, export, and manage data',
      icon: <HardDrive className="h-5 w-5" />,
      component: <DataSettings />,
    },
  ];

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSection = sections.find(s => s.id === activeSection) || sections[0];

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Customize your Digital Bullet Journal experience
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="p-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  )}
                >
                  <div className={cn(
                    'flex-shrink-0',
                    activeSection === section.id ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}>
                    {section.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{section.title}</div>
                    <div className={cn(
                      'text-xs truncate',
                      activeSection === section.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    )}>
                      {section.description}
                    </div>
                  </div>
                  {activeSection === section.id && (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ))}
            </nav>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card className="p-6">
            {currentSection.component}
            
            {/* Save Button */}
            <div className="mt-6 pt-6 border-t flex justify-end gap-3">
              <Button variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}