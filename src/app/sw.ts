import { defaultCache } from '@serwist/next/worker'
import { Serwist } from 'serwist'

import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest by `@serwist/next`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    document: '/offline',
  },
})

// Add event listeners
serwist.addEventListeners()

// Custom service worker logic
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || 'Digital Bullet Journal'
  const body = data.body || 'You have a new notification'
  const icon = data.icon || '/icon-192.png'
  const badge = data.badge || '/icon-192.png'
  
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      vibrate: [200, 100, 200],
      tag: 'bujo-notification',
      requireInteraction: false,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          const client = clientList[0]
          client.focus()
        } else {
          self.clients.openWindow('/')
        }
      })
  )
})