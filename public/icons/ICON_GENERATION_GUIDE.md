# Icon Generation Guide for PWA

This guide explains how to generate all required icons for the Digital Bullet Journal PWA.

## Required Icons

### Standard App Icons
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### Maskable Icons (for Android Adaptive Icons)
- icon-maskable-192x192.png
- icon-maskable-512x512.png

### Apple Touch Icons
- apple-touch-icon.png (180x180)

### Favicon
- favicon.ico (multi-resolution: 16x16, 32x32, 48x48)

### Additional Icons
- badge-72x72.png (for notification badges)
- shortcut-new-entry.png (96x96)
- shortcut-today.png (96x96)
- shortcut-draw.png (96x96)

## Design Requirements

1. **Safe Zone for Maskable Icons**: Ensure important content is within the safe zone (80% of the icon area)
2. **Background**: Use a solid color or subtle gradient
3. **Padding**: Add appropriate padding for maskable icons
4. **Format**: Use PNG format with transparency (except maskable icons)

## Generation Methods

### Method 1: Using PWA Asset Generator (Recommended)

```bash
# Install the generator
npm install -g pwa-asset-generator

# Generate all icons from a source image (at least 512x512px)
pwa-asset-generator [source-image.png] ./public/icons \
  --manifest ./public/manifest.json \
  --opaque false \
  --maskable true \
  --favicon true \
  --type png \
  --quality 90
```

### Method 2: Using Sharp (Programmatic)

Create a script `generate-icons.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = './source-icon.png'; // Your source icon (at least 512x512)

// Ensure output directory exists
const outputDir = './public/icons';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate standard icons
sizes.forEach(size => {
  sharp(inputFile)
    .resize(size, size)
    .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
    .then(() => console.log(`Generated icon-${size}x${size}.png`))
    .catch(err => console.error(`Error generating ${size}x${size}:`, err));
});

// Generate maskable icons with padding
[192, 512].forEach(size => {
  sharp(inputFile)
    .resize(Math.round(size * 0.8), Math.round(size * 0.8))
    .extend({
      top: Math.round(size * 0.1),
      bottom: Math.round(size * 0.1),
      left: Math.round(size * 0.1),
      right: Math.round(size * 0.1),
      background: { r: 26, g: 26, b: 26, alpha: 1 } // #1a1a1a
    })
    .toFile(path.join(outputDir, `icon-maskable-${size}x${size}.png`))
    .then(() => console.log(`Generated icon-maskable-${size}x${size}.png`))
    .catch(err => console.error(`Error generating maskable ${size}x${size}:`, err));
});

// Generate Apple touch icon
sharp(inputFile)
  .resize(180, 180)
  .toFile(path.join(outputDir, 'apple-touch-icon.png'))
  .then(() => console.log('Generated apple-touch-icon.png'))
  .catch(err => console.error('Error generating Apple touch icon:', err));

// Generate favicon (you'll need to convert to .ico separately)
sharp(inputFile)
  .resize(32, 32)
  .toFile(path.join(outputDir, 'favicon-32.png'))
  .then(() => console.log('Generated favicon-32.png'))
  .catch(err => console.error('Error generating favicon:', err));
```

### Method 3: Using ImageMagick

```bash
# Install ImageMagick
sudo apt-get install imagemagick # Linux
brew install imagemagick # macOS

# Generate icons
for size in 72 96 128 144 152 192 384 512; do
  convert source-icon.png -resize ${size}x${size} public/icons/icon-${size}x${size}.png
done

# Generate maskable icons with padding
convert source-icon.png -resize 154x154 -gravity center -background "#1a1a1a" -extent 192x192 public/icons/icon-maskable-192x192.png
convert source-icon.png -resize 410x410 -gravity center -background "#1a1a1a" -extent 512x512 public/icons/icon-maskable-512x512.png

# Generate Apple touch icon
convert source-icon.png -resize 180x180 public/icons/apple-touch-icon.png

# Generate favicon
convert source-icon.png -resize 16x16 favicon-16.png
convert source-icon.png -resize 32x32 favicon-32.png
convert source-icon.png -resize 48x48 favicon-48.png
convert favicon-16.png favicon-32.png favicon-48.png favicon.ico
```

### Method 4: Online Tools

1. **RealFaviconGenerator**: https://realfavicongenerator.net/
2. **PWA Manifest Generator**: https://www.simicart.com/manifest-generator.html/
3. **Maskable.app**: https://maskable.app/ (for testing maskable icons)

## Icon Design Tips

1. **Source Image**: Start with a high-resolution image (at least 1024x1024px)
2. **Simple Design**: Keep the design simple and recognizable at small sizes
3. **Contrast**: Ensure good contrast between icon and background
4. **Test**: Test icons on different devices and backgrounds
5. **Consistency**: Maintain consistent styling across all icon sizes

## Temporary Placeholder Generation

For development, you can create simple placeholder icons:

```javascript
// Create placeholder-icon.html
const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; }
    .icon { width: 512px; height: 512px; background: #1a1a1a; color: white; display: flex; align-items: center; justify-content: center; font-family: Arial; font-size: 200px; border-radius: 20%; }
  </style>
</head>
<body>
  <div class="icon">BJ</div>
</body>
</html>
`;

// Use Puppeteer or Playwright to capture screenshots at different sizes
```

## Validation

After generating icons, validate them:

1. **Chrome DevTools**: Application > Manifest
2. **Lighthouse**: Run PWA audit
3. **PWA Builder**: https://www.pwabuilder.com/
4. **Maskable.app**: Test maskable icons

## File Optimization

Optimize PNG files to reduce size:

```bash
# Using pngquant
pngquant --quality=65-80 public/icons/*.png

# Using optipng
optipng -o5 public/icons/*.png
```