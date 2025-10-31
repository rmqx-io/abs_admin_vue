# Leaflet Integration - Testing Checklist

## ✅ Changes Made

### 1. Updated Leaflet Components
- **LMap.vue**: Added console logging for debugging, improved map initialization
- **LPolyline.vue**: Added delayed mounting and logging for polyline creation
- **LCircleMarker.vue**: Added delayed mounting and logging for marker creation
- All components now wait 100ms after mounting to ensure parent map is ready

### 2. Updated DeviceList.vue
- Added `onLeafletMapReady` handler to track when map is ready
- Improved `fitMapBounds` with retry logic (up to 5 retries with 200ms delays)
- Added `@ready` event handlers to both leafletMap and leafletClusterMap
- Enhanced console logging throughout for debugging

### 3. Key Improvements
- **Coordinate Conversion**: Automatic [lng, lat] → [lat, lng] conversion in Leaflet components
- **Retry Logic**: fitMapBounds now retries if map isn't ready (useful for timing issues)
- **Debug Logging**: Extensive console.log statements to track component lifecycle

## 🧪 Testing Steps

### Test 1: Route History with Polyline and Markers

1. **Switch to English locale**
   ```javascript
   // In browser console or via UI language switcher
   // Should show: this.$i18n.locale === 'en'
   ```

2. **Navigate to Device List**
   - Go to device list page
   - Select a device with location history

3. **View History Route**
   - Click on device → "History Route" (历史轨迹)
   - Map should load with OpenStreetMap tiles
   - **Expected console output:**
     ```
     Initializing Leaflet map at: [22.52, 113.94] zoom: 14
     Leaflet map initialized, emitting ready event
     Leaflet map ready event received: [object]
     Leaflet map ready, emitting complete event
     Map loaded and ready
     Creating polyline with path: [[113.94, 22.52], ...]
     Converted to latLngs: [[22.52, 113.94], ...]
     Polyline added to map
     Creating circle marker at: [113.94, 22.52]
     Circle marker added to map
     fitMapBounds called with markers: [[113.94, 22.52], ...]
     Fitting Leaflet bounds: [[22.52, 113.94], ...]
     Fitting bounds to: [[22.52, 113.94], ...]
     ```

4. **Verify Visual Elements**
   - ✅ Blue polyline connecting points
   - ✅ Pink circle markers at each location
   - ✅ Map auto-zooms to show all markers
   - ✅ OpenStreetMap attribution visible

### Test 2: Device Cluster Map

1. **Go to Map Tab**
   - Click "Map" tab on device list
   - **Expected**: Leaflet map with OpenStreetMap

2. **Verify Clustering**
   - Markers should cluster when many devices are close
   - Click cluster → should zoom in and expand
   - Hover over markers → tooltips show device info

3. **Check Console**
   ```
   Leaflet map ready event received
   Leaflet map initialized
   Creating markers for clustering...
   ```

### Test 3: Language Switching

1. **Start with English**
   - Verify Leaflet/OpenStreetMap loads

2. **Switch to Chinese**
   - Map should change to AMap (高德地图)
   - Data should remain the same

3. **Switch back to English**
   - Map should return to Leaflet
   - All markers and routes preserved

## 🐛 Troubleshooting

### Issue: Polyline not showing
**Check Console for:**
```
Polyline: waiting for map or path
```
**Solution:** Map might not be ready. Check that retry logic is running.

### Issue: Markers not visible
**Check Console for:**
```
CircleMarker: waiting for map or center
```
**Solution:** Increase timeout in component mounting (currently 100ms).

### Issue: Map is blank
**Possible causes:**
1. Center coordinates are invalid
2. Tiles not loading (network issue)
3. CSS not imported

**Debug:**
```javascript
// In browser console
console.log('Map ref:', this.$refs.leafletMap)
console.log('Map instance:', this.$refs.leafletMap?.getMap())
console.log('Center:', this.center)
console.log('Path:', this.polyline.path)
```

### Issue: fitBounds not working
**Check Console for:**
```
Leaflet map not ready yet, retry: 0
Leaflet map not ready yet, retry: 1
...
```
**Solution:** Retries will continue up to 5 times. If still failing, increase retry count.

## 📊 Expected Console Output (Full Flow)

### Successful Route History Load:
```
loadData request arg: {device_id: "xxx", ...}
Initializing Leaflet map at: [22.52, 113.94] zoom: 14
Leaflet map initialized, emitting ready event
Leaflet map ready event received: L.Map {...}
Leaflet map ready, emitting complete event
Map loaded and ready
Path data prepared: [[113.94, 22.52], [113.95, 22.53], ...]
Creating polyline with path: [[113.94, 22.52], ...]
Converted to latLngs: [[22.52, 113.94], [22.53, 113.95], ...]
Polyline added to map
Creating circle marker at: [113.94, 22.52]
Circle marker added to map
Creating circle marker at: [113.95, 22.53]
Circle marker added to map
...
fitMapBounds called with markers: [[113.94, 22.52], [113.95, 22.53], ...]
Fitting Leaflet bounds: [[22.52, 113.94], [22.53, 113.95], ...]
Fitting bounds to: [[22.52, 113.94], [22.53, 113.95], ...]
```

## 🎯 Success Criteria

- [ ] Map loads with OpenStreetMap tiles (English locale)
- [ ] Blue polyline connects all location points
- [ ] Pink circle markers appear at each point
- [ ] Map automatically fits bounds to show all markers
- [ ] No console errors
- [ ] Switching between languages works smoothly
- [ ] Marker clustering works on device list map
- [ ] Tooltips display device information

## 📝 Notes

- Leaflet uses **[lat, lng]** while AMap uses **[lng, lat]**
- All conversions are handled automatically in components
- Retry logic helps handle timing issues with async map loading
- Console logging can be removed in production

---

**Testing Date:** _____________
**Tested By:** _____________
**Status:** ⭐ Pass / ❌ Fail
