// ABOUTME: UI state management store for sidebar, modals, theme, and notifications
// Handles all UI-related state that doesn't belong to specific features

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { Toast, Modal } from '../types';

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  sidebarWidth: number;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  actualTheme: 'light' | 'dark'; // Resolved theme based on system preference
  
  // Modals
  modals: Modal[];
  
  // Toasts
  toasts: Toast[];
  
  // General UI
  isFullscreen: boolean;
  isMobile: boolean;
  isTablet: boolean;
  viewMode: 'list' | 'grid' | 'calendar';
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;
  
  // Actions - Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSidebarWidth: (width: number) => void;
  
  // Actions - Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  initializeTheme: () => void;
  
  // Actions - Modals
  openModal: (modal: Modal) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
  
  // Actions - Toasts
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (toastId: string) => void;
  clearToasts: () => void;
  
  // Actions - General UI
  setViewMode: (mode: 'list' | 'grid' | 'calendar') => void;
  setDeviceType: (isMobile: boolean, isTablet: boolean) => void;
  toggleFullscreen: () => void;
  
  // Actions - Loading
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Utility
  showErrorToast: (message: string) => void;
  showSuccessToast: (message: string) => void;
  showInfoToast: (message: string) => void;
  showWarningToast: (message: string) => void;
  
  // Confirmation dialog helper
  showConfirmation: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
}

// Theme detection utility
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') {
return 'light';
}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Toast ID generator
let toastIdCounter = 0;
const generateToastId = () => `toast-${Date.now()}-${++toastIdCounter}`;

// Modal ID generator
let modalIdCounter = 0;
const generateModalId = () => `modal-${Date.now()}-${++modalIdCounter}`;

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        isSidebarOpen: true,
        sidebarWidth: 280,
        theme: 'system',
        actualTheme: 'light',
        modals: [],
        toasts: [],
        isFullscreen: false,
        isMobile: false,
        isTablet: false,
        viewMode: 'list',
        globalLoading: false,
        loadingMessage: null,

        // Sidebar Actions
        toggleSidebar: () => {
          set((state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
          });
        },

        setSidebarOpen: (isOpen: boolean) => {
          set((state) => {
            state.isSidebarOpen = isOpen;
          });
        },

        setSidebarWidth: (width: number) => {
          set((state) => {
            state.sidebarWidth = Math.max(200, Math.min(400, width));
          });
        },

        // Theme Actions
        setTheme: (theme: 'light' | 'dark' | 'system') => {
          set((state) => {
            state.theme = theme;
            state.actualTheme = theme === 'system' ? getSystemTheme() : theme;
          });

          // Apply theme to document
          if (typeof window !== 'undefined') {
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(get().actualTheme);
            root.style.colorScheme = get().actualTheme;
          }
        },

        initializeTheme: () => {
          const { theme } = get();
          const actualTheme = theme === 'system' ? getSystemTheme() : theme;
          
          set((state) => {
            state.actualTheme = actualTheme;
          });

          if (typeof window !== 'undefined') {
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(actualTheme);
            root.style.colorScheme = actualTheme;

            // Listen for system theme changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e: MediaQueryListEvent) => {
              if (get().theme === 'system') {
                get().setTheme('system');
              }
            };
            
            mediaQuery.addEventListener('change', handleChange);
            
            // Cleanup would be in a React effect
          }
        },

        // Modal Actions
        openModal: (modal: Modal) => {
          set((state) => {
            // Check if modal already exists
            const existingIndex = state.modals.findIndex(m => m.id === modal.id);
            if (existingIndex !== -1) {
              // Update existing modal
              state.modals[existingIndex] = modal;
            } else {
              // Add new modal
              state.modals.push(modal);
            }
          });
        },

        closeModal: (modalId: string) => {
          set((state) => {
            state.modals = state.modals.filter(m => m.id !== modalId);
          });
        },

        closeAllModals: () => {
          set((state) => {
            state.modals = [];
          });
        },

        // Toast Actions
        showToast: (toast: Omit<Toast, 'id'>) => {
          const id = generateToastId();
          const duration = toast.duration || 5000;

          set((state) => {
            state.toasts.push({ ...toast, id });
          });

          // Auto dismiss
          if (duration > 0) {
            setTimeout(() => {
              get().dismissToast(id);
            }, duration);
          }
        },

        dismissToast: (toastId: string) => {
          set((state) => {
            state.toasts = state.toasts.filter(t => t.id !== toastId);
          });
        },

        clearToasts: () => {
          set((state) => {
            state.toasts = [];
          });
        },

        // General UI Actions
        setViewMode: (mode: 'list' | 'grid' | 'calendar') => {
          set((state) => {
            state.viewMode = mode;
          });
        },

        setDeviceType: (isMobile: boolean, isTablet: boolean) => {
          set((state) => {
            state.isMobile = isMobile;
            state.isTablet = isTablet;
            
            // Auto-close sidebar on mobile
            if (isMobile && state.isSidebarOpen) {
              state.isSidebarOpen = false;
            }
          });
        },

        toggleFullscreen: () => {
          if (typeof document === 'undefined') {
return;
}

          const isCurrentlyFullscreen = document.fullscreenElement !== null;

          if (isCurrentlyFullscreen) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }

          set((state) => {
            state.isFullscreen = !isCurrentlyFullscreen;
          });
        },

        // Loading Actions
        setGlobalLoading: (loading: boolean, message?: string) => {
          set((state) => {
            state.globalLoading = loading;
            state.loadingMessage = message || null;
          });
        },

        // Toast Helpers
        showErrorToast: (message: string) => {
          get().showToast({
            type: 'error',
            message,
            duration: 6000
          });
        },

        showSuccessToast: (message: string) => {
          get().showToast({
            type: 'success',
            message,
            duration: 4000
          });
        },

        showInfoToast: (message: string) => {
          get().showToast({
            type: 'info',
            message,
            duration: 4000
          });
        },

        showWarningToast: (message: string) => {
          get().showToast({
            type: 'warning',
            message,
            duration: 5000
          });
        },

        // Confirmation Dialog Helper
        showConfirmation: (
          title: string,
          message: string,
          onConfirm: () => void,
          onCancel?: () => void
        ) => {
          const modalId = generateModalId();
          
          get().openModal({
            id: modalId,
            component: 'ConfirmationDialog',
            props: {
              title,
              message,
              onConfirm: () => {
                onConfirm();
                get().closeModal(modalId);
              },
              onCancel: () => {
                onCancel?.();
                get().closeModal(modalId);
              }
            }
          });
        }
      })),
      {
        name: 'ui-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarWidth: state.sidebarWidth,
          viewMode: state.viewMode,
          // Don't persist actual sidebar state on mobile
          isSidebarOpen: state.isMobile ? true : state.isSidebarOpen
        })
      }
    )
  )
);

// Initialize theme on store creation
if (typeof window !== 'undefined') {
  useUIStore.getState().initializeTheme();
  
  // Set up device type detection
  const checkDeviceType = () => {
    const width = window.innerWidth;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    useUIStore.getState().setDeviceType(isMobile, isTablet);
  };
  
  checkDeviceType();
  window.addEventListener('resize', checkDeviceType);
  
  // Set up fullscreen detection
  document.addEventListener('fullscreenchange', () => {
    const isFullscreen = document.fullscreenElement !== null;
    useUIStore.setState({ isFullscreen });
  });
}