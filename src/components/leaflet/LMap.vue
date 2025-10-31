<template>
  <div ref="mapContainer" :style="{ width: '100%', height: mapHeight }"></div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  name: 'LMap',
  props: {
    zoom: {
      type: Number,
      default: 13
    },
    center: {
      type: Array,
      default: () => [0, 0]
    },
    height: {
      type: String,
      default: '70vh'
    }
  },
  data() {
    return {
      map: null,
      layers: []
    }
  },
  computed: {
    mapHeight() {
      return this.height
    }
  },
  mounted() {
    this.initMap()
  },
  beforeDestroy() {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
  },
  watch: {
    center(newCenter) {
      if (this.map && newCenter && newCenter.length === 2) {
        this.map.setView([newCenter[1], newCenter[0]], this.zoom)
      }
    },
    zoom(newZoom) {
      if (this.map) {
        this.map.setZoom(newZoom)
      }
    }
  },
  methods: {
    initMap() {
      // Leaflet uses [lat, lng] format, while AMap uses [lng, lat]
      const latLng = [this.center[1], this.center[0]]
      
      console.log('Initializing Leaflet map at:', latLng, 'zoom:', this.zoom)
      
      this.map = L.map(this.$refs.mapContainer, {
        center: latLng,
        zoom: this.zoom,
        zoomControl: true
      })

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map)

      console.log('Leaflet map initialized, emitting ready event')
      this.$emit('ready', this.map)

      // Emit complete event after map is fully loaded
      this.map.whenReady(() => {
        console.log('Leaflet map ready, emitting complete event')
        this.$emit('complete')
      })
    },
    addLayer(layer) {
      if (this.map && layer) {
        layer.addTo(this.map)
        this.layers.push(layer)
      }
    },
    removeLayer(layer) {
      if (this.map && layer) {
        this.map.removeLayer(layer)
        const index = this.layers.indexOf(layer)
        if (index > -1) {
          this.layers.splice(index, 1)
        }
      }
    },
    clearLayers() {
      this.layers.forEach(layer => {
        this.map.removeLayer(layer)
      })
      this.layers = []
    },
    fitBounds(bounds, options = {}) {
      if (this.map && bounds && bounds.length > 0) {
        console.log('Fitting bounds to:', bounds)
        this.map.fitBounds(bounds, { padding: [50, 50], ...options })
      }
    },
    setView(center, zoom) {
      if (this.map) {
        // Convert [lng, lat] to [lat, lng]
        const latLng = [center[1], center[0]]
        this.map.setView(latLng, zoom)
      }
    },
    getMap() {
      return this.map
    }
  }
}
</script>

<style scoped>
</style>
