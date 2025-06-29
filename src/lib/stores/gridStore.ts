// ABOUTME: Zustand store for grid customization state management
// Persists user's grid preferences and manages boxes

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  GridCustomizationState, 
  GridConfig, 
  Box, 
  GridPreset,
  SnapSettings,
  RulerSettings,
  AlignmentGuide,
  defaultGridConfig,
  defaultSnapSettings,
  defaultRulerSettings
} from '@/types/grid';

interface GridStore extends GridCustomizationState {
  // Actions
  setConfig: (config: GridConfig) => void;
  updateConfig: (updates: Partial<GridConfig>) => void;
  
  // Box management
  addBox: (box: Box) => void;
  updateBox: (id: string, updates: Partial<Box>) => void;
  deleteBox: (id: string) => void;
  selectBox: (id: string | undefined) => void;
  copyBox: (box: Box) => void;
  pasteBox: (position: { x: number; y: number }) => void;
  
  // Preset management
  savePreset: (preset: GridPreset) => void;
  deletePreset: (id: string) => void;
  loadPreset: (preset: GridPreset) => void;
  
  // Settings
  setSnapSettings: (settings: SnapSettings) => void;
  setRulerSettings: (settings: RulerSettings) => void;
  
  // Alignment guides
  addAlignmentGuide: (guide: AlignmentGuide) => void;
  removeAlignmentGuide: (id: string) => void;
  clearTemporaryGuides: () => void;
  
  // Utility
  reset: () => void;
  exportConfig: () => string;
  importConfig: (configJson: string) => void;
}

const initialState: GridCustomizationState = {
  config: defaultGridConfig,
  presets: [],
  activePresetId: undefined,
  snapSettings: defaultSnapSettings,
  rulerSettings: defaultRulerSettings,
  alignmentGuides: [],
  boxes: [],
  selectedBoxId: undefined,
  copiedBox: undefined,
};

export const useGridStore = create<GridStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Config actions
      setConfig: (config) => set({ config }),
      updateConfig: (updates) => set(state => ({ 
        config: { ...state.config, ...updates } 
      })),

      // Box management
      addBox: (box) => set(state => ({ 
        boxes: [...state.boxes, box],
        selectedBoxId: box.id 
      })),
      
      updateBox: (id, updates) => set(state => ({
        boxes: state.boxes.map(box => 
          box.id === id ? { ...box, ...updates } : box
        )
      })),
      
      deleteBox: (id) => set(state => ({
        boxes: state.boxes.filter(box => box.id !== id),
        selectedBoxId: state.selectedBoxId === id ? undefined : state.selectedBoxId
      })),
      
      selectBox: (id) => set({ selectedBoxId: id }),
      
      copyBox: (box) => set({ copiedBox: box }),
      
      pasteBox: (position) => {
        const state = get();
        if (!state.copiedBox) return;
        
        const newBox: Box = {
          ...state.copiedBox,
          id: `box-${Date.now()}`,
          x: position.x,
          y: position.y,
        };
        
        set(state => ({
          boxes: [...state.boxes, newBox],
          selectedBoxId: newBox.id
        }));
      },

      // Preset management
      savePreset: (preset) => set(state => ({
        presets: [...state.presets, preset],
        activePresetId: preset.id
      })),
      
      deletePreset: (id) => set(state => ({
        presets: state.presets.filter(p => p.id !== id),
        activePresetId: state.activePresetId === id ? undefined : state.activePresetId
      })),
      
      loadPreset: (preset) => set({
        config: preset.config,
        activePresetId: preset.id
      }),

      // Settings
      setSnapSettings: (settings) => set({ snapSettings: settings }),
      setRulerSettings: (settings) => set({ rulerSettings: settings }),

      // Alignment guides
      addAlignmentGuide: (guide) => set(state => ({
        alignmentGuides: [...state.alignmentGuides, guide]
      })),
      
      removeAlignmentGuide: (id) => set(state => ({
        alignmentGuides: state.alignmentGuides.filter(g => g.id !== id)
      })),
      
      clearTemporaryGuides: () => set(state => ({
        alignmentGuides: state.alignmentGuides.filter(g => !g.temporary)
      })),

      // Utility
      reset: () => set(initialState),
      
      exportConfig: () => {
        const state = get();
        return JSON.stringify({
          config: state.config,
          presets: state.presets,
          snapSettings: state.snapSettings,
          rulerSettings: state.rulerSettings,
          boxes: state.boxes,
        }, null, 2);
      },
      
      importConfig: (configJson) => {
        try {
          const data = JSON.parse(configJson);
          set({
            config: data.config || defaultGridConfig,
            presets: data.presets || [],
            snapSettings: data.snapSettings || defaultSnapSettings,
            rulerSettings: data.rulerSettings || defaultRulerSettings,
            boxes: data.boxes || [],
          });
        } catch (error) {
          console.error('Failed to import config:', error);
        }
      },
    }),
    {
      name: 'grid-customization',
      partialize: (state) => ({
        config: state.config,
        presets: state.presets,
        snapSettings: state.snapSettings,
        rulerSettings: state.rulerSettings,
      }),
    }
  )
);