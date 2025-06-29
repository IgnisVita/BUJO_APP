// ABOUTME: PWA utility functions for install prompts, updates, offline detection, and push notifications
// Core utilities for Progressive Web App functionality

import { useState, useEffect, useCallback } from 'react';

// Types
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Install Prompt Handler
let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function usePWAInstall() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check for iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      deferredPrompt = null;
      setIsInstallable(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
return { outcome: 'dismissed' as const };
}

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    deferredPrompt = null;
    setIsInstallable(false);
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    return { outcome };
  }, []);

  return {
    isInstallable,
    isInstalled,
    isIOS,
    promptInstall,
  };
}

// Update Notification Handler
export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateController, setUpdateController] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
return;
}

    const handleControllerChange = () => {
      window.location.reload();
    };

    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
return;
}

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) {
return;
}

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              setUpdateController(newWorker);
            }
          });
        });

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    checkForUpdates();

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    if (updateController) {
      updateController.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [updateController]);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
    setUpdateController(null);
  }, []);

  return {
    updateAvailable,
    applyUpdate,
    dismissUpdate,
  };
}

// Offline Detection
export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Trigger sync when coming back online
        if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
          navigator.serviceWorker.ready.then((registration) => {
            return (registration as any).sync.register('sync-journal-entries');
          });
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

// Push Notification Subscription
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
        
        // Get existing subscription
        try {
          const registration = await navigator.serviceWorker.ready;
          const existingSubscription = await registration.pushManager.getSubscription();
          setSubscription(existingSubscription);
        } catch (error) {
          console.error('Error getting push subscription:', error);
        }
      }
    };

    checkSupport();
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
return false;
}

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async (vapidPublicKey: string) => {
    if (!isSupported || permission !== 'granted') {
return null;
}

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      
      setSubscription(sub);
      return sub;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) {
return false;
}

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }, [subscription]);

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Share Target Handler
export async function handleShareTarget() {
  const url = new URL(window.location.href);
  const title = url.searchParams.get('title');
  const text = url.searchParams.get('text');
  const sharedUrl = url.searchParams.get('url');

  if (title || text || sharedUrl) {
    // Handle shared content
    return {
      title,
      text,
      url: sharedUrl,
    };
  }

  return null;
}

// Background Sync Registration
export async function registerBackgroundSync(tag: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register(tag);
    return true;
  } catch (error) {
    console.error('Background sync registration failed:', error);
    return false;
  }
}

// Periodic Background Sync Registration
export async function registerPeriodicSync(tag: string, minInterval: number): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('periodicSync' in ServiceWorkerRegistration.prototype)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const status = await navigator.permissions.query({ name: 'periodic-background-sync' as any });
    
    if (status.state === 'granted') {
      await (registration as any).periodicSync.register(tag, {
        minInterval,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Periodic sync registration failed:', error);
    return false;
  }
}

// Storage Persistence
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage || !navigator.storage.persist) {
    return false;
  }

  try {
    const isPersisted = await navigator.storage.persisted();
    if (isPersisted) {
return true;
}

    const result = await navigator.storage.persist();
    return result;
  } catch (error) {
    console.error('Error requesting persistent storage:', error);
    return false;
  }
}

// Storage Estimation
export async function getStorageEstimate(): Promise<{ usage: number; quota: number; percent: number } | null> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percent = quota > 0 ? (usage / quota) * 100 : 0;

    return { usage, quota, percent };
  } catch (error) {
    console.error('Error getting storage estimate:', error);
    return null;
  }
}