<template>
  <div style="display: none;"></div>
</template>

<script>
import L from 'leaflet'

export default {
  name: 'LPolyline',
  props: {
    path: {
      type: Array,
      required: true
    },
    strokeColor: {
      type: String,
      default: '#3366FF'
    },
    strokeWeight: {
      type: Number,
      default: 3
    },
    strokeOpacity: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      polyline: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      // Wait a bit for parent map to be fully ready
      setTimeout(() => {
        this.createPolyline()
      }, 100)
    })
  },
  beforeDestroy() {
    this.removePolyline()
  },
  watch: {
    path: {
      handler() {
        this.updatePolyline()
      },
      deep: true
    }
  },
  methods: {
    createPolyline() {
      const map = this.getMap()
      if (!map || !this.path || this.path.length === 0) {
        console.log('Polyline: waiting for map or path', { hasMap: !!map, pathLength: this.path?.length })
        return
      }

      console.log('Creating polyline with path:', this.path)
      // Convert [lng, lat] to [lat, lng] for Leaflet
      const latLngs = this.path.map(point => [point[1], point[0]])
      console.log('Converted to latLngs:', latLngs)

      this.polyline = L.polyline(latLngs, {
        color: this.strokeColor,
        weight: this.strokeWeight,
        opacity: this.strokeOpacity
      })

      map.addLayer(this.polyline)
      console.log('Polyline added to map')
    },
    updatePolyline() {
      this.removePolyline()
      this.createPolyline()
    },
    removePolyline() {
      const map = this.getMap()
      if (map && this.polyline) {
        map.removeLayer(this.polyline)
        this.polyline = null
      }
    },
    getMap() {
      let parent = this.$parent
      while (parent && !parent.getMap) {
        parent = parent.$parent
      }
      return parent ? parent.getMap() : null
    }
  }
}
</script>
