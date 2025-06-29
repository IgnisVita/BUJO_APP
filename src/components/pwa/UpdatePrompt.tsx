// ABOUTME: PWA update notification component with smooth update flow
// Handles service worker updates and provides user-friendly update experience

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, CheckCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { usePWAUpdate } from '@/lib/utils/pwa';


export function UpdatePrompt() {
  const { updateAvailable, applyUpdate, dismissUpdate } = usePWAUpdate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateComplete, setUpdateComplete] = useState(false);

  useEffect(() => {
    // Auto-hide success message after 3 seconds
    if (updateComplete) {
      const timer = setTimeout(() => {
        setUpdateComplete(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateComplete]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    // Apply the update
    applyUpdate();
    
    // Show success message briefly before reload
    setTimeout(() => {
      setUpdateComplete(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }, 500);
  };

  const handleSkip = () => {
    dismissUpdate();
    
    // Ask again in 24 hours
    setTimeout(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }
    }, 24 * 60 * 60 * 1000);
  };

  if (!updateAvailable && !updateComplete) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {updateComplete ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Update complete! Reloading...</span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="prompt"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                      <RefreshCw className={`w-6 h-6 text-white ${isUpdating ? 'animate-spin' : ''}`} />
                    </div>
                    {/* Pulse animation for attention */}
                    <div className="absolute inset-0 bg-green-500 rounded-xl animate-ping opacity-20" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Update Available
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      New features and improvements
                    </p>
                  </div>
                </div>
                {!isUpdating && (
                  <button
                    onClick={dismissUpdate}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label="Dismiss update"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A new version of Digital Bullet Journal is available. Update now to get the latest features and performance improvements.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      <span>Update Now</span>
                    </>
                  )}
                </button>
                {!isUpdating && (
                  <button
                    onClick={handleSkip}
                    className="px-4 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Later
                  </button>
                )}
              </div>

              {/* Update progress indicator */}
              {isUpdating && (
                <div className="mt-4">
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, ease: 'easeInOut' }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Please wait while we update the app...
                  </p>
                </div>
              )}
            </div>

            {/* Feature highlights (optional) */}
            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>What's new:</strong> Performance improvements, bug fixes, and enhanced offline support.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Minimal update banner variant for less intrusive notifications
export function UpdateBanner() {
  const { updateAvailable, applyUpdate, dismissUpdate } = usePWAUpdate();
  
  if (!updateAvailable) {
    return null;
  }

  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      exit={{ height: 0 }}
      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white overflow-hidden"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5" />
          <span className="text-sm font-medium">
            A new version is available!
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={applyUpdate}
            className="text-sm font-medium underline hover:no-underline"
          >
            Update now
          </button>
          <button
            onClick={dismissUpdate}
            className="text-white/70 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}