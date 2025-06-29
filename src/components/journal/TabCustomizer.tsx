// ABOUTME: Tab configuration and creation interface
// Allows users to create custom tabs, set colors/icons, and configure auto-switching rules

import React, { useState } from 'react';
import { X, Plus, Palette, Clock, MapPin, Calendar, Copy } from 'lucide-react';
import { Tab, TabType, TAB_TEMPLATES, ICON_SUGGESTIONS, COLOR_PALETTE, createTab } from './TabTypes';
import { cn } from '../../lib/utils';

interface TabCustomizerProps {
  onClose: () => void;
  onAddTab: (tab: Tab) => void;
  onUpdateTab?: (tab: Tab) => void;
  editingTab?: Tab;
}

export const TabCustomizer: React.FC<TabCustomizerProps> = ({ 
  onClose, 
  onAddTab, 
  onUpdateTab, 
  editingTab 
}) => {
  const [activeStep, setActiveStep] = useState<'template' | 'customize' | 'rules'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [tabConfig, setTabConfig] = useState<Partial<Tab>>(editingTab || {
    name: '',
    type: 'custom',
    icon: '',
    color: '',
    description: '',
    settings: {
      autoSwitch: false,
      autoSwitchRules: [],
      sharing: { sharedAcrossTime: false },
      defaultView: 'dot-grid'
    }
  });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleTemplateSelect = (template: any) => {
    setTabConfig({
      ...template,
      id: undefined, // Generate new ID
      createdAt: new Date(),
      lastAccessed: new Date()
    });
    setSelectedTemplate(template.id);
    setActiveStep('customize');
  };

  const handleSave = () => {
    const tab = createTab(tabConfig);
    if (editingTab) {
      onUpdateTab?.(tab);
    } else {
      onAddTab(tab);
    }
    onClose();
  };

  const addAutoSwitchRule = () => {
    setTabConfig({
      ...tabConfig,
      settings: {
        ...tabConfig.settings,
        autoSwitchRules: [
          ...(tabConfig.settings?.autoSwitchRules || []),
          { type: 'time', condition: '' }
        ]
      }
    });
  };

  const updateAutoSwitchRule = (index: number, rule: any) => {
    const rules = [...(tabConfig.settings?.autoSwitchRules || [])];
    rules[index] = rule;
    setTabConfig({
      ...tabConfig,
      settings: { ...tabConfig.settings, autoSwitchRules: rules }
    });
  };

  const removeAutoSwitchRule = (index: number) => {
    const rules = [...(tabConfig.settings?.autoSwitchRules || [])];
    rules.splice(index, 1);
    setTabConfig({
      ...tabConfig,
      settings: { ...tabConfig.settings, autoSwitchRules: rules }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">
            {editingTab ? 'Edit Tab' : 'Create New Tab'}
          </h2>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        {!editingTab && (
          <div className="flex border-b">
            <button
              className={cn(
                "flex-1 py-3 px-4 text-center transition-colors",
                activeStep === 'template' 
                  ? "border-b-2 border-blue-500 text-blue-600 font-medium" 
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              )}
              onClick={() => setActiveStep('template')}
            >
              1. Choose Template
            </button>
            <button
              className={cn(
                "flex-1 py-3 px-4 text-center transition-colors",
                activeStep === 'customize' 
                  ? "border-b-2 border-blue-500 text-blue-600 font-medium" 
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              )}
              onClick={() => setActiveStep('customize')}
            >
              2. Customize
            </button>
            <button
              className={cn(
                "flex-1 py-3 px-4 text-center transition-colors",
                activeStep === 'rules' 
                  ? "border-b-2 border-blue-500 text-blue-600 font-medium" 
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              )}
              onClick={() => setActiveStep('rules')}
            >
              3. Auto-Switch Rules
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Template Selection */}
          {activeStep === 'template' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Time-Based Tabs</h3>
                <div className="grid grid-cols-2 gap-3">
                  {TAB_TEMPLATES.timeBasedTabs.map((template) => (
                    <button
                      key={template.id}
                      className={cn(
                        "p-4 border rounded-lg text-left transition-all",
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        selectedTemplate === template.id && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      )}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {template.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Life Areas</h3>
                <div className="grid grid-cols-2 gap-3">
                  {TAB_TEMPLATES.lifeAreaTabs.map((template) => (
                    <button
                      key={template.id}
                      className={cn(
                        "p-4 border rounded-lg text-left transition-all",
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        selectedTemplate === template.id && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      )}
                      onClick={() => handleTemplateSelect(template)}
                      style={{ borderColor: template.color }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {template.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Smart Tabs</h3>
                <div className="grid grid-cols-2 gap-3">
                  {TAB_TEMPLATES.smartTabs.map((template) => (
                    <button
                      key={template.id}
                      className={cn(
                        "p-4 border rounded-lg text-left transition-all",
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        selectedTemplate === template.id && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      )}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {template.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="w-full p-4 border-2 border-dashed rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setActiveStep('customize')}
              >
                <Plus className="w-5 h-5 mx-auto mb-2" />
                <div className="font-medium">Start from Scratch</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Create a completely custom tab
                </div>
              </button>
            </div>
          )}

          {/* Customization */}
          {(activeStep === 'customize' || editingTab) && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Tab Name</label>
                <input
                  type="text"
                  value={tabConfig.name || ''}
                  onChange={(e) => setTabConfig({ ...tabConfig, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Enter tab name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={tabConfig.description || ''}
                  onChange={(e) => setTabConfig({ ...tabConfig, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  rows={2}
                  placeholder="Brief description of this tab's purpose"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Icon</label>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 border rounded-lg flex items-center justify-center text-2xl">
                    {tabConfig.icon || '📁'}
                  </div>
                  <button
                    className="px-3 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                  >
                    Choose Icon
                  </button>
                </div>
                {showIconPicker && (
                  <div className="mt-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="grid grid-cols-10 gap-2">
                      {Object.values(ICON_SUGGESTIONS).flat().map((icon) => (
                        <button
                          key={icon}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          onClick={() => {
                            setTabConfig({ ...tabConfig, icon });
                            setShowIconPicker(false);
                          }}
                        >
                          <span className="text-xl">{icon}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-12 h-12 border rounded-lg"
                    style={{ backgroundColor: tabConfig.color || '#6B7280' }}
                  />
                  <button
                    className="px-3 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    Choose Color
                  </button>
                </div>
                {showColorPicker && (
                  <div className="mt-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="grid grid-cols-9 gap-2">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          className="w-8 h-8 rounded"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            setTabConfig({ ...tabConfig, color });
                            setShowColorPicker(false);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Default View</label>
                <select
                  value={tabConfig.settings?.defaultView || 'dot-grid'}
                  onChange={(e) => setTabConfig({
                    ...tabConfig,
                    settings: {
                      ...tabConfig.settings,
                      defaultView: e.target.value as any
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="dot-grid">Dot Grid</option>
                  <option value="list">List View</option>
                  <option value="calendar">Calendar View</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tabConfig.settings?.sharing?.sharedAcrossTime || false}
                    onChange={(e) => setTabConfig({
                      ...tabConfig,
                      settings: {
                        ...tabConfig.settings,
                        sharing: {
                          ...tabConfig.settings?.sharing,
                          sharedAcrossTime: e.target.checked
                        }
                      }
                    })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Share content across time periods</span>
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 ml-6">
                  Content in this tab will be visible regardless of the active time period
                </p>
              </div>
            </div>
          )}

          {/* Auto-Switch Rules */}
          {activeStep === 'rules' && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={tabConfig.settings?.autoSwitch || false}
                    onChange={(e) => setTabConfig({
                      ...tabConfig,
                      settings: {
                        ...tabConfig.settings,
                        autoSwitch: e.target.checked
                      }
                    })}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">Enable Auto-Switch</span>
                </label>
              </div>

              {tabConfig.settings?.autoSwitch && (
                <>
                  <div className="space-y-3">
                    {(tabConfig.settings?.autoSwitchRules || []).map((rule, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                        <select
                          value={rule.type}
                          onChange={(e) => updateAutoSwitchRule(index, { ...rule, type: e.target.value as any })}
                          className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700"
                        >
                          <option value="time">Time</option>
                          <option value="location">Location</option>
                          <option value="event">Event</option>
                        </select>

                        {rule.type === 'time' && (
                          <input
                            type="time"
                            value={rule.condition}
                            onChange={(e) => updateAutoSwitchRule(index, { ...rule, condition: e.target.value })}
                            className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700"
                          />
                        )}

                        {rule.type === 'location' && (
                          <input
                            type="text"
                            value={rule.condition}
                            onChange={(e) => updateAutoSwitchRule(index, { ...rule, condition: e.target.value })}
                            placeholder="Office, Home, etc."
                            className="flex-1 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700"
                          />
                        )}

                        {rule.type === 'event' && (
                          <input
                            type="text"
                            value={rule.condition}
                            onChange={(e) => updateAutoSwitchRule(index, { ...rule, condition: e.target.value })}
                            placeholder="Calendar event name"
                            className="flex-1 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700"
                          />
                        )}

                        <button
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          onClick={() => removeAutoSwitchRule(index)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={addAutoSwitchRule}
                  >
                    <Plus className="w-4 h-4" />
                    Add Rule
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <button
            className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {!editingTab && activeStep !== 'template' && (
              <button
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setActiveStep(activeStep === 'rules' ? 'customize' : 'template')}
              >
                Back
              </button>
            )}
            {activeStep !== 'rules' && !editingTab && (
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={() => setActiveStep(activeStep === 'template' ? 'customize' : 'rules')}
              >
                Next
              </button>
            )}
            {(activeStep === 'rules' || editingTab) && (
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={handleSave}
                disabled={!tabConfig.name}
              >
                {editingTab ? 'Save Changes' : 'Create Tab'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};