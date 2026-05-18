<template>
  <div style="display: none"></div>
</template>

<script>
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

export default {
  name: 'LMarkerCluster',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    gridSize: {
      type: Number,
      default: 80
    }
  },
  data() {
    return {
      markerClusterGroup: null,
      markers: [],
      mapReady: false,
      retryCount: 0,
      maxRetries: 10
    }
  },
  mounted() {
    console.log('LMarkerCluster: component mounted, initial data count:', this.data.length)
    this.initClusterGroup()
  },
  beforeDestroy() {
    this.cleanup()
  },
  watch: {
    data: {
      handler(newData) {
        console.log('LMarkerCluster: data changed, count:', newData ? newData.length : 0)
        if (newData && newData.length > 0) {
          this.updateMarkers()
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    initClusterGroup() {
      const tryInit = () => {
        const map = this.getMap()
        if (!map) {
          this.retryCount++
          if (this.retryCount < this.maxRetries) {
            console.log(`LMarkerCluster: Map not ready, retry ${this.retryCount}/${this.maxRetries}`)
            setTimeout(tryInit, 200)
          } else {
            console.error('LMarkerCluster: Failed to get map after max retries')
          }
          return
        }

        console.log('LMarkerCluster: Map found, creating cluster group')
        this.mapReady = true

        // Create cluster group
        this.markerClusterGroup = L.markerClusterGroup({
          maxClusterRadius: this.gridSize,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          spiderfyOnMaxZoom: true,
          removeOutsideVisibleBounds: true,
          animate: true
        })

        // Add to map
        this.markerClusterGroup.addTo(map)
        console.log('LMarkerCluster: Cluster group added to map')

        // If we already have data, add markers
        if (this.data && this.data.length > 0) {
          this.updateMarkers()
        }
      }

      // Start initialization after a short delay
      setTimeout(tryInit, 100)
    },
    getMap() {
      let parent = this.$parent
      while (parent) {
        if (parent.$options.name === 'LMap' && parent.map) {
          return parent.map
        }
        parent = parent.$parent
      }
      return null
    },
    updateMarkers() {
      if (!this.mapReady || !this.markerClusterGroup) {
        console.log('LMarkerCluster: Not ready to update markers yet')
        // Try again after a delay
        setTimeout(() => this.updateMarkers(), 500)
        return
      }

      console.log('LMarkerCluster: Updating markers, data count:', this.data.length)

      // Clear existing markers
      this.markerClusterGroup.clearLayers()
      this.markers = []

      // Add new markers
      this.data.forEach((item, index) => {
        if (!item.lnglat || item.lnglat.length !== 2) {
          console.warn(`LMarkerCluster: Invalid coordinates for marker ${index}:`, item.lnglat)
          return
        }

        const lng = item.lnglat[0]
        const lat = item.lnglat[1]

        // Validate coordinates
        if (isNaN(lng) || isNaN(lat)) {
          console.warn(`LMarkerCluster: Invalid coordinates for marker ${index}: [${lng}, ${lat}]`)
          return
        }

        // For Leaflet, use [lat, lng] order
        const marker = L.marker([lat, lng])

        // Add popup with device info
        if (item.device) {
          const popupContent = `
            <div style="min-width: 200px;">
              <p><strong>${this.$t ? this.$t('list.device.map.tooltip.deviceCode') : 'Device Code'}:</strong> ${item.device.code || 'N/A'}</p>
              <p><strong>${this.$t ? this.$t('list.device.map.tooltip.batteryCode') : 'Battery Code'}:</strong> ${item.device.bms_bt || 'N/A'}</p>
              <p><strong>${this.$t ? this.$t('list.device.map.tooltip.locationTime') : 'Location Time'}:</strong> ${item.device.location_time || 'N/A'}</p>
            </div>
          `
          marker.bindPopup(popupContent)
        }

        this.markers.push(marker)
        console.log(`LMarkerCluster: Added marker ${index} at [${lat}, ${lng}]`)
      })

      // Add all markers to cluster group at once
      if (this.markers.length > 0) {
        this.markerClusterGroup.addLayers(this.markers)
        console.log(`LMarkerCluster: Total ${this.markers.length} markers added to cluster group`)
      } else {
        console.warn('LMarkerCluster: No valid markers to add')
      }
    },
    cleanup() {
      if (this.markerClusterGroup) {
        const map = this.getMap()
        if (map) {
          map.removeLayer(this.markerClusterGroup)
        }
        this.markerClusterGroup = null
      }
      this.markers = []
      this.mapReady = false
    }
  }
}
</script>

<style>
/* Custom marker styles */
.custom-marker {
  width: 30px;
  height: 30px;
  background-color: #3366FF;
  border-radius: 50%;
  border: 2px solid white;
  cursor: pointer;
}
</style>
