# Testing Guide - Dual Map System

## Quick Test Checklist

### ✅ Installation Verification
- [x] Leaflet installed (`leaflet@^1.9.4`)
- [x] Leaflet MarkerCluster installed (`leaflet.markercluster@^1.5.3`)
- [x] Vue2-Leaflet installed (`vue2-leaflet@^2.7.1`)

### 🧪 Test Scenarios

#### 1. Chinese Language Test (AMap)
1. Set language to Chinese (zh-cn)
2. Navigate to Device List page
3. Click on "Map" tab
4. **Expected**: AMap (高德地图) should display
5. Verify markers cluster properly
6. Click on a device → History Route
7. **Expected**: Polyline and circle markers display on AMap

#### 2. English Language Test (Leaflet)
1. Set language to English (en)
2. Navigate to Device List page
3. Click on "Map" tab
4. **Expected**: OpenStreetMap (via Leaflet) should display
5. Verify markers cluster properly
6. Click on a device → History Route
7. **Expected**: Polyline and circle markers display on Leaflet

#### 3. Language Switching Test
1. Start with Chinese → verify AMap displays
2. Switch to English → verify map changes to Leaflet
3. Switch back to Chinese → verify map returns to AMap
4. **Expected**: Seamless transition with data preserved

### 🎯 Features to Test

#### Route History Map
- [ ] Polylines render correctly
- [ ] Circle markers at each location
- [ ] Map auto-fits to show all markers
- [ ] Date/time filters work
- [ ] Back button returns to device list

#### Device Cluster Map
- [ ] All devices load on map
- [ ] Markers cluster at appropriate zoom levels
- [ ] Click cluster → zooms and expands
- [ ] Tooltips show device info
- [ ] Progress bar displays while loading

### 🔍 Visual Checks

#### AMap (Chinese)
- Map tiles load correctly
- Chinese labels visible
- Zoom controls present
- Attribution text visible

#### Leaflet (English)
- OpenStreetMap tiles load
- English labels visible
- Zoom controls present
- OSM attribution visible

### 🐛 Common Issues & Solutions

#### Issue: Map not displaying
**Solution**: Check browser console, verify CSS imports in main.js

#### Issue: Markers in wrong location
**Solution**: Coordinates may need conversion - Leaflet uses [lat, lng]

#### Issue: Clustering not working
**Solution**: Verify leaflet.markercluster CSS is imported

#### Issue: Map blank after language switch
**Solution**: Clear refresh_map flag and trigger re-render

### 📱 Browser Testing

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on macOS)
- [ ] Mobile browsers (responsive view)

### 🚀 Performance Checks

- [ ] Map loads in < 2 seconds
- [ ] Clustering handles 1000+ markers smoothly
- [ ] No memory leaks when switching languages
- [ ] Smooth zoom/pan interactions

### 📊 Data Verification

- [ ] Device locations accurate on both maps
- [ ] Route history shows correct path
- [ ] Time stamps match between maps
- [ ] All device info displayed in tooltips

## Testing Commands

```bash
# Start development server
npm run serve

# Build for production (test for build errors)
npm run build

# Run linter
npm run lint
```

## Expected Console Output

### Successful Load (Chinese - AMap)
```
Map loaded and ready
Device list loaded: 150 devices
Markers found: 142
AMap ready promise resolved
```

### Successful Load (English - Leaflet)
```
Map loaded and ready
Device list loaded: 150 devices
Markers found: 142
Leaflet map initialized
```

## Reporting Issues

If you encounter issues, please note:
1. Browser and version
2. Language setting (en/zh-cn)
3. Console errors (if any)
4. Steps to reproduce
5. Screenshot of the issue

---

**Test Date**: ___________
**Tested By**: ___________
**Result**: ⭐⭐⭐⭐⭐ (Pass/Fail)
