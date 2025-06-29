# PWA Testing Guide

This guide helps ensure your Digital Bullet Journal PWA scores 100 on Lighthouse PWA audit and works correctly across all platforms.

## Prerequisites

1. Build the production app:
```bash
npm run build
npm start
```

2. Serve over HTTPS (required for PWA):
- Use ngrok for local testing: `ngrok http 3000`
- Or deploy to Vercel/Netlify for testing

## Lighthouse PWA Audit

### Running the Audit

1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Progressive Web App" category
4. Run audit on production build

### Required Criteria for 100 Score

✅ **Installable**
- [x] Valid manifest.json with required fields
- [x] Service worker registered
- [x] HTTPS connection
- [x] Icons: 192x192 and 512x512

✅ **PWA Optimized**
- [x] Offline page when offline
- [x] start_url loads offline
- [x] Theme color in manifest
- [x] Viewport meta tag
- [x] Apple touch icon
- [x] Maskable icon

✅ **Additional Requirements**
- [x] No browser errors in console
- [x] Manifest display property set
- [x] Service worker controls page
- [x] Content sized correctly for viewport

## Manual Testing Checklist

### Installation Testing

#### Desktop Chrome/Edge
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] App opens in standalone window
- [ ] App icon appears in taskbar/dock

#### Android Chrome
- [ ] Install banner appears
- [ ] App installs to home screen
- [ ] Splash screen shows during launch
- [ ] Status bar matches theme color

#### iOS Safari
- [ ] Add to Home Screen works
- [ ] App opens in fullscreen
- [ ] Status bar style is correct
- [ ] Splash screen appears

### Offline Functionality
- [ ] Offline page loads when offline
- [ ] Previously visited pages cached
- [ ] New entries saved locally
- [ ] Background sync works when online

### Update Testing
- [ ] Update prompt appears for new version
- [ ] Update installs smoothly
- [ ] No data loss during update

### Push Notifications (if implemented)
- [ ] Permission prompt works
- [ ] Notifications delivered
- [ ] Click actions work
- [ ] Unsubscribe works

## Platform-Specific Testing

### iOS Limitations
- No install prompts (manual only)
- Limited offline storage
- No push notifications (in PWA)
- No background sync

### Android Features
- Full PWA support
- WebAPK generation
- Background sync
- Push notifications

### Desktop Features
- Window controls overlay
- File handling
- Shortcuts work
- Protocol handling

## Performance Testing

### Service Worker
```javascript
// Test in console
navigator.serviceWorker.ready.then(reg => {
  console.log('SW ready:', reg);
  console.log('Scope:', reg.scope);
  console.log('Active:', reg.active);
});
```

### Cache Status
```javascript
// Check caches
caches.keys().then(names => {
  console.log('Cache names:', names);
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(keys => {
        console.log(`${name}: ${keys.length} items`);
      });
    });
  });
});
```

### Storage Quota
```javascript
// Check storage
navigator.storage.estimate().then(estimate => {
  console.log('Storage used:', (estimate.usage / 1024 / 1024).toFixed(2), 'MB');
  console.log('Storage quota:', (estimate.quota / 1024 / 1024).toFixed(2), 'MB');
});
```

## Common Issues & Solutions

### Service Worker Not Registering
- Check HTTPS requirement
- Verify SW scope
- Clear browser cache
- Check console errors

### Install Prompt Not Showing
- Already installed?
- Not served over HTTPS?
- Manifest validation errors?
- User dismissed recently?

### Icons Not Working
- Correct paths in manifest?
- PNG format?
- Proper sizes?
- CORS issues?

### Offline Not Working
- SW installed correctly?
- Offline page cached?
- Navigation preload enabled?
- Cache strategies correct?

## Browser DevTools

### Chrome
- Application > Manifest
- Application > Service Workers
- Application > Storage
- Network > Offline checkbox

### Firefox
- Application > Service Workers
- Application > Manifest
- Storage Inspector

### Safari
- Develop > Service Workers
- Develop > Show Web Inspector

## Automated Testing

### Playwright Test
```javascript
test('PWA installs correctly', async ({ page }) => {
  let installPrompt = null;
  
  page.on('beforeinstallprompt', e => {
    installPrompt = e;
  });
  
  await page.goto('https://localhost:3000');
  expect(installPrompt).toBeTruthy();
});
```

### Puppeteer Test
```javascript
const installable = await page.evaluate(() => {
  return new Promise(resolve => {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      resolve(true);
    });
    setTimeout(() => resolve(false), 5000);
  });
});
```

## Monitoring

### Analytics Events
Track these PWA events:
- Install prompted
- Install accepted/dismissed
- Update available
- Update installed
- Offline usage
- Push subscription

### Error Tracking
Monitor for:
- SW registration failures
- Cache errors
- Sync failures
- Push errors

## Deployment Checklist

- [ ] HTTPS enabled
- [ ] manifest.json accessible
- [ ] Icons uploaded
- [ ] Service worker registered
- [ ] Offline page works
- [ ] CSP headers allow SW
- [ ] Robots.txt allows manifest
- [ ] .well-known configured