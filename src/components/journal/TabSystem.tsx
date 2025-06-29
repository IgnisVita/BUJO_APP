// ABOUTME: Main tab container component for journal organization
// Manages tab bar, navigation, drag-and-drop reordering, and mobile-friendly interactions

import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTabSync } from '../../hooks/useTabSync';
import { Tab, TabType } from './TabTypes';
import { TimeBasedTabs } from './TimeBasedTabs';
import { TabCustomizer } from './TabCustomizer';
import { cn } from '../../lib/utils';

interface TabSystemProps {
  children?: React.ReactNode;
  onTabChange?: (tab: Tab) => void;
}

export const TabSystem: React.FC<TabSystemProps> = ({ children, onTabChange }) => {
  const {
    tabs,
    activeTabId,
    setActiveTab,
    addTab,
    removeTab,
    updateTab,
    reorderTabs,
    getTabHistory,
    navigateTabHistory
  } = useTabSync();

  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Check scroll availability
  const checkScroll = () => {
    const container = tabsContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tabs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + number to switch tabs
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (index < tabs.length) {
          setActiveTab(tabs[index].id);
        }
      }

      // Ctrl/Cmd + Tab to cycle tabs
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const nextIndex = e.shiftKey 
          ? (currentIndex - 1 + tabs.length) % tabs.length
          : (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
      }

      // Alt + Left/Right for tab history navigation
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        navigateTabHistory(e.key === 'ArrowLeft' ? 'back' : 'forward');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, setActiveTab, navigateTabHistory]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    reorderTabs(result.source.index, result.destination.index);
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    const container = tabsContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth / 2;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabs.find(t => t.id === tabId)!);
    setShowMobileDrawer(false);
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="flex flex-col h-full">
      {/* Desktop Tab Bar */}
      <div className="hidden md:flex items-center border-b bg-white dark:bg-gray-900 px-2 py-1">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          onClick={() => setShowMobileDrawer(!showMobileDrawer)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            onClick={() => scrollTabs('left')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Tabs Container */}
        <div 
          ref={tabsContainerRef}
          className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide"
          onScroll={checkScroll}
        >
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tabs" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex items-center gap-1"
                >
                  {tabs.map((tab, index) => (
                    <Draggable key={tab.id} draggableId={tab.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            "group relative flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all",
                            "hover:bg-gray-100 dark:hover:bg-gray-800",
                            activeTabId === tab.id && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
                            snapshot.isDragging && "opacity-50"
                          )}
                          onClick={() => handleTabClick(tab.id)}
                          style={{
                            backgroundColor: tab.color && activeTabId === tab.id ? `${tab.color}20` : undefined,
                            borderColor: tab.color,
                            borderWidth: tab.color ? '2px' : undefined
                          }}
                        >
                          {tab.icon && (
                            <span className="text-lg" role="img" aria-label={tab.name}>
                              {tab.icon}
                            </span>
                          )}
                          <span className="text-sm font-medium whitespace-nowrap">
                            {tab.name}
                          </span>
                          {tab.type !== 'time-based' && tabs.length > 1 && (
                            <button
                              className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTab(tab.id);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            onClick={() => scrollTabs('right')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Add Tab Button */}
        <button
          className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          onClick={() => setShowCustomizer(true)}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-between border-b bg-white dark:bg-gray-900 px-4 py-2">
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          onClick={() => setShowMobileDrawer(!showMobileDrawer)}
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          {activeTab?.icon && (
            <span className="text-lg" role="img" aria-label={activeTab.name}>
              {activeTab.icon}
            </span>
          )}
          <span className="font-medium">{activeTab?.name}</span>
        </div>
        
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          onClick={() => setShowCustomizer(true)}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Tab Drawer */}
      {showMobileDrawer && (
        <div className="md:hidden absolute inset-x-0 top-14 z-50 bg-white dark:bg-gray-900 border-b shadow-lg">
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  activeTabId === tab.id && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                )}
                onClick={() => handleTabClick(tab.id)}
                style={{
                  backgroundColor: tab.color && activeTabId === tab.id ? `${tab.color}20` : undefined,
                  borderColor: tab.color,
                  borderWidth: tab.color ? '2px' : undefined
                }}
              >
                {tab.icon && (
                  <span className="text-xl" role="img" aria-label={tab.name}>
                    {tab.icon}
                  </span>
                )}
                <div className="flex-1">
                  <div className="font-medium">{tab.name}</div>
                  {tab.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {tab.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab?.type === 'time-based' ? (
          <TimeBasedTabs tab={activeTab} />
        ) : (
          children
        )}
      </div>

      {/* Tab Customizer */}
      {showCustomizer && (
        <TabCustomizer
          onClose={() => setShowCustomizer(false)}
          onAddTab={(tab) => {
            addTab(tab);
            setShowCustomizer(false);
          }}
          onUpdateTab={(tab) => {
            updateTab(tab.id, tab);
            setShowCustomizer(false);
          }}
        />
      )}
    </div>
  );
};