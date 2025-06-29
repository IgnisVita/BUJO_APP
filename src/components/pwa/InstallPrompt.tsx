// ABOUTME: PWA install prompt component with beautiful UI and iOS instructions
// Handles A2HS (Add to Home Screen) prompts for all platforms

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Share, Plus, ExternalLink } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { usePWAInstall } from '@/lib/utils/pwa';


export function InstallPrompt() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
      }
    }
  }, []);

  const handleInstall = async () => {
    const { outcome } = await promptInstall();
    if (outcome === 'accepted') {
      // Track installation
      if ('gtag' in window) {
        (window as any).gtag('event', 'pwa_install', {
          event_category: 'PWA',
          event_label: 'Install Prompt',
        });
      }
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleIOSInstructions = () => {
    setShowIOSInstructions(true);
  };

  // Don't show if already installed, dismissed, or not installable (and not iOS)
  if (isInstalled || isDismissed || (!isInstallable && !isIOS)) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {(isInstallable || isIOS) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-md"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Install Digital Bullet Journal
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get the full app experience
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label="Dismiss install prompt"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Download className="w-4 h-4" />
                    <span>Works offline</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <ExternalLink className="w-4 h-4" />
                    <span>Launches from home screen</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Plus className="w-4 h-4" />
                    <span>Full-screen experience</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {isIOS ? (
                    <button
                      onClick={handleIOSInstructions}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center justify-center space-x-2"
                    >
                      <Share className="w-5 h-5" />
                      <span>How to Install</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleInstall}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center justify-center space-x-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>Install App</span>
                    </button>
                  )}
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowIOSInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Install on iOS
                  </h3>
                  <button
                    onClick={() => setShowIOSInstructions(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium mb-1">
                        Tap the Share button
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Look for the <Share className="inline w-4 h-4" /> icon in Safari's toolbar
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium mb-1">
                        Scroll down and tap "Add to Home Screen"
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        You might need to scroll in the share menu
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium mb-1">
                        Tap "Add" to install
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        The app will appear on your home screen
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> This app works best when installed from Safari on iOS.
                  </p>
                </div>

                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-shadow"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}