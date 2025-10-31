<template>
  <div style="display: none;"></div>
</template>

<script>
import L from 'leaflet'

export default {
  name: 'LCircleMarker',
  props: {
    center: {
      type: Array,
      required: true
    },
    radius: {
      type: Number,
      default: 5
    },
    strokeColor: {
      type: String,
      default: '#FF33FF'
    },
    strokeWeight: {
      type: Number,
      default: 2
    },
    strokeOpacity: {
      type: Number,
      default: 1
    },
    fillColor: {
      type: String,
      default: '#FF99FF'
    },
    fillOpacity: {
      type: Number,
      default: 0.8
    }
  },
  data() {
    return {
      circleMarker: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      // Wait a bit for parent map to be fully ready
      setTimeout(() => {
        this.createCircleMarker()
      }, 100)
    })
  },
  beforeDestroy() {
    this.removeCircleMarker()
  },
  watch: {
    center() {
      this.updateCircleMarker()
    }
  },
  methods: {
    createCircleMarker() {
      const map = this.getMap()
      if (!map || !this.center || this.center.length !== 2) {
        console.log('CircleMarker: waiting for map or center', { hasMap: !!map, center: this.center })
        return
      }

      console.log('Creating circle marker at:', this.center)
      // Convert [lng, lat] to [lat, lng] for Leaflet
      const latLng = [this.center[1], this.center[0]]

      this.circleMarker = L.circleMarker(latLng, {
        radius: this.radius,
        color: this.strokeColor,
        weight: this.strokeWeight,
        opacity: this.strokeOpacity,
        fillColor: this.fillColor,
        fillOpacity: this.fillOpacity
      })

      map.addLayer(this.circleMarker)
      console.log('Circle marker added to map')
    },
    updateCircleMarker() {
      this.removeCircleMarker()
      this.createCircleMarker()
    },
    removeCircleMarker() {
      const map = this.getMap()
      if (map && this.circleMarker) {
        map.removeLayer(this.circleMarker)
        this.circleMarker = null
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
