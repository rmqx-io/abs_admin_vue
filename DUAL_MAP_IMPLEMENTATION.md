# Dual Map Implementation - AMap & Leaflet

This project now supports **dual map services** to provide optimal user experience based on locale:

- **Chinese Users (zh-cn)**: AMap (高德地图) - optimized for China with better local coverage
- **English Users (en)**: Leaflet + OpenStreetMap - international coverage with no API key required

## 🗺️ Features

### AMap (Chinese)
- Full Chinese language support
- Accurate China location data
- Rich local POI information
- Marker clustering
- Polylines and route visualization
- Circle markers

### Leaflet + OpenStreetMap (English)
- International map coverage
- No API key required (free and open-source)
- Marker clustering via leaflet.markercluster
- Polylines and route visualization
- Circle markers
- Responsive and lightweight

## 📁 Architecture

### Leaflet Components
Located in `/src/components/leaflet/`:

1. **LMap.vue** - Main map container
   - Handles map initialization
   - OpenStreetMap tile layer
   - Map events (ready, complete)
   - Coordinate conversion (AMap uses [lng, lat], Leaflet uses [lat, lng])

2. **LPolyline.vue** - Route/path visualization
   - Draws lines between coordinates
   - Customizable stroke color, weight, opacity

3. **LCircleMarker.vue** - Location markers
   - Fixed-size circular markers
   - Customizable colors and styles

4. **LMarkerCluster.vue** - Marker clustering
   - Groups nearby markers
   - Automatic zoom-based clustering
   - Custom tooltips support

## 🔧 Implementation Details

### Automatic Map Selection

The map service is automatically selected based on the i18n locale:

```javascript
computed: {
  isEnglish() {
    return this.$i18n.locale === 'en'
  },
  useLeaflet() {
    return this.isEnglish
  }
}
```

### Template Conditional Rendering

```vue
<!-- AMap for Chinese users -->
<amap v-if="!useLeaflet" ref="map">
  <amap-polyline :path="polyline.path" />
  <amap-circle-marker :center="marker" />
</amap>

<!-- Leaflet for English users -->
<l-map v-if="useLeaflet" ref="leafletMap">
  <l-polyline :path="polyline.path" />
  <l-circle-marker :center="marker" />
</l-map>
```

### Coordinate Handling

⚠️ **Important**: AMap and Leaflet use different coordinate formats:
- **AMap**: `[longitude, latitude]` → `[113.94, 22.52]`
- **Leaflet**: `[latitude, longitude]` → `[22.52, 113.94]`

The Leaflet components automatically handle this conversion internally.

## 📦 Dependencies

### New Dependencies Added
```json
{
  "leaflet": "^1.9.x",
  "leaflet.markercluster": "^1.5.x"
}
```

### Existing Dependencies (Kept)
```json
{
  "@amap/amap-jsapi-loader": "^1.0.1",
  "@amap/amap-vue": "^2.0.13"
}
```

## 🚀 Usage Example

### DeviceList.vue

The main device list component now supports both maps:

1. **Route History Map** - Shows device movement path
   - Polylines connecting location points
   - Circle markers at each location
   - Automatic bounds fitting

2. **Device Cluster Map** - Shows all devices on a map
   - Marker clustering for performance
   - Device tooltips with info
   - Click to zoom functionality

### Adding Maps to New Components

```vue
<template>
  <l-map 
    v-if="isEnglish"
    :center="[113.94, 22.52]" 
    :zoom="13"
    @ready="onMapReady"
  >
    <l-polyline 
      :path="routePath"
      stroke-color="#3366FF"
      :stroke-weight="4"
    />
    <l-marker-cluster 
      :data="markers"
      :grid-size="100"
    />
  </l-map>
</template>

<script>
import LMap from '@/components/leaflet/LMap.vue'
import LPolyline from '@/components/leaflet/LPolyline.vue'
import LMarkerCluster from '@/components/leaflet/LMarkerCluster.vue'

export default {
  components: { LMap, LPolyline, LMarkerCluster },
  computed: {
    isEnglish() {
      return this.$i18n.locale === 'en'
    }
  }
}
</script>
```

## 🌍 Benefits

### For Chinese Users
- ✅ Continue using familiar AMap with accurate local data
- ✅ No disruption to existing functionality
- ✅ Optimized for China's coordinate system (GCJ-02)

### For International Users
- ✅ No API key management required
- ✅ Free and open-source solution
- ✅ Global coverage with OSM
- ✅ Privacy-friendly (no tracking)
- ✅ Better performance outside China

## 🔄 Switching Languages

Users can switch between languages in the application, and the map will automatically update:

1. Change language to Chinese → AMap loads
2. Change language to English → Leaflet loads
3. All map data and markers remain consistent

## 🐛 Troubleshooting

### Map Not Displaying
- Check browser console for errors
- Verify Leaflet CSS is imported in main.js
- Ensure marker icons are properly loaded

### Coordinate Issues
- Remember: AMap uses [lng, lat], Leaflet uses [lat, lng]
- Leaflet components handle conversion automatically
- For custom implementations, swap coordinates when switching maps

### Marker Clustering Not Working
- Verify `leaflet.markercluster` is installed
- Check that CSS files are imported
- Ensure data format matches expected structure

## 📝 Future Improvements

- [ ] Add support for more map providers (Google Maps, Mapbox)
- [ ] Implement custom marker icons
- [ ] Add drawing tools for both maps
- [ ] Support for heat maps
- [ ] Offline tile caching

## 📚 Resources

- [Leaflet Documentation](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [AMap API Documentation](https://lbs.amap.com/)
- [leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)

---

**Note**: This implementation ensures a seamless experience for users worldwide while maintaining optimal performance and functionality for each region.
