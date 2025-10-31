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
    console.log('LPolyline mounted with props:', this.$props)
    // Try multiple times to get the map reference
    this.tryCreatePolyline(0)
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
    tryCreatePolyline(attempt) {
      console.log('LPolyline tryCreatePolyline attempt:', attempt)
      const maxAttempts = 10
      const delay = attempt * 50 // Increasing delay
      
      setTimeout(() => {
        const map = this.getMap()
        if (map && this.path && this.path.length > 0) {
          console.log('LPolyline found map on attempt:', attempt)
          this.createPolyline()
        } else if (attempt < maxAttempts) {
          console.log('LPolyline retry attempt:', attempt + 1, 'map:', !!map, 'pathLength:', this.path?.length)
          this.tryCreatePolyline(attempt + 1)
        } else {
          console.warn('LPolyline failed to find map after', maxAttempts, 'attempts')
        }
      }, delay)
    },
    createPolyline() {
      console.log('LPolyline createPolyline called')
      const map = this.getMap()
      console.log('LPolyline getMap result:', map)
      console.log('LPolyline path:', this.path)
      
      if (!map || !this.path || this.path.length === 0) {
        console.log('Polyline: waiting for map or path', {
          hasMap: !!map,
          pathLength: this.path?.length,
          path: this.path
        })
        return
      }

      console.log('Creating polyline with path:', this.path)
      
      // Validate and convert coordinates to [lat, lng] format for Leaflet
      const latLngs = this.path
        .filter(point => Array.isArray(point) && point.length >= 2)
        .map(point => {
          const lng = parseFloat(point[0])
          const lat = parseFloat(point[1])
          
          if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
            console.warn('Invalid coordinates:', point)
            return null
          }
          
          // Convert [lng, lat] to [lat, lng] for Leaflet
          return [lat, lng]
        })
        .filter(point => point !== null)
      
      if (latLngs.length === 0) {
        console.warn('No valid coordinates for polyline')
        return
      }
      
      console.log('Converted to latLngs:', latLngs)

      this.polyline = L.polyline(latLngs, {
        color: this.strokeColor,
        weight: this.strokeWeight,
        opacity: this.strokeOpacity,
        smoothFactor: 1.0,
        noClip: false
      })

      map.addLayer(this.polyline)
      console.log('Polyline added to map with', latLngs.length, 'points')
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
