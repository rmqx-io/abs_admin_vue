# Leaflet Polyline Fix Summary

## Root Cause
- `LMap.vue` rendered only the internal `<div ref="mapContainer">` and dropped any slotted children.
- Components such as `<l-polyline>` never mounted, so their lifecycle hooks and map access logic never executed.

## Fix
- Wrap the map container in a parent wrapper that exposes a `<slot>` to descendants.
- Ensure the wrapper/layout keeps the map at full size via simple scoped CSS.

```vue
<template>
  <div class="leaflet-map-wrapper" :style="{ width: '100%', height: mapHeight }">
    <div ref="mapContainer" class="leaflet-map-container"></div>
    <slot></slot>
  </div>
</template>

<style scoped>
.leaflet-map-wrapper {
  position: relative;
  width: 100%;
}

.leaflet-map-container {
  width: 100%;
  height: 100%;
}
</style>
```

## Result
- `<l-polyline>` and other Leaflet child components mount correctly.
- Polyline creation logic runs, rendering the route as expected.
- Existing marker and bounds logic continue to work without layout regressions.
