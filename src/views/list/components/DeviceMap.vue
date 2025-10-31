<template>
  <div
    id="map"
    style="width: 100%; height: 100%"
    ref="deviceMap"
  >
    <div
      v-if="isGettingDeviceLocation"
      class='popup'
    >
      <a-progress
        :percent="getDevicesLocationPageNo/ getDevicesLocationPages * 100"
        :status="getDevicesLocationPageNo === getDevicesLocationPages ? 'success' : 'active'"
        :stroke-width="10"
        :format="percent => `${percent.toFixed(0)}%`"
      />
      <span>{{ getDevicesLocationPageNo }}</span> / <span>{{ getDevicesLocationPages }}</span>, <span>{{ markersFound }}</span>
    </div>
    <!-- AMap for Chinese users -->
    <amap
      v-if="!useLeaflet && refresh_map"
      cache-key="marker-cluster-map"
      :zoom="4"
      async
      :center="center"
    >
      <!-- 点聚合 -->
      <amap-marker-cluster
        :data="deviceMarkers"
        key="custom-cluster"
        :grid-size="options.gridSize"
        :average-center="options.averageCenter"
      >
        <!-- :marker-options="getMarkerOptions"
          :cluster-options="getClusterOptions" -->
      </amap-marker-cluster>
    </amap>
    <!-- Leaflet for English users -->
    <l-map
      v-if="useLeaflet && refresh_map"
      ref="leafletMap"
      :zoom="13"
      :center="center"
      height="100%"
      @ready="onLeafletMapReady"
      @complete="onMapComplete"
    />
  </div>
</template>

<script>
import {
  getDeviceList,
  wgs84togcj02
} from '@/api/manage'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import LMap from '@/components/leaflet/LMap.vue'

// Fix for missing marker icons in webpack builds
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  name: 'DeviceMap',
  components: {
    LMap
  },
  data () {
    return {
      isGettingDeviceLocation: false,
      getDevicesLocationPages: 1,
      getDevicesLocationPageNo: 0,
      markersFound: 0,
      showMarkers: false,
      refresh_map: true,
      deviceMarkers: [],
      center: [118.848765, 28.979693],
      styles: {
        fill: '#FFFF00',
        stroke: '#FFFF00'
      },
      data: [
        { lnglat: [118.855291, 28.968687], weight: 40, obj: { ok: 'dadad' } },
        { lnglat: [118.849403, 28.966571], weight: 40 },
        { lnglat: [118.871908, 28.963937], weight: 40 },
        { lnglat: [118.872013, 28.967893], weight: 40 },
        { lnglat: [118.87678, 28.970008], weight: 40 },
        { lnglat: [118.850768, 28.981658], weight: 40 },
        { lnglat: [118.870611, 28.971511], weight: 40 },
        { lnglat: [118.855715, 28.964949], weight: 40 },
        { lnglat: [118.864793, 28.978257], weight: 40 },
        { lnglat: [118.860867, 28.978625], weight: 40 },
        { lnglat: [118.857047, 28.979299], weight: 40 }
      ],
      options: {
        gridSize: 100,
        averageCenter: true,
        zoomOnClick: true
      },
      observer: null,
      isVisible: false,
      leafletMap: null,
      leafletClusterGroup: null
    }
  },
  computed: {
    isEnglish() {
      const isEnglish = this.$i18n.locale.startsWith('en')
      console.log('DeviceMap i18n.locale', this.$i18n.locale)
      console.log('DeviceMap isEnglish', isEnglish)
      return isEnglish
    },
    useLeaflet() {
      return this.isEnglish
    }
  },
  mounted () {
    this.createObserver();
    this.refreshMap()
  },
  methods: {
    refreshMap () {
      if (this.isGettingDeviceLocation) {
        return
      }
      this.isGettingDeviceLocation = true
      const arg = {}
      arg.page_no = 1
      arg.page_size = 2000
      arg.device_status = 'total'
      this.getDeviceLocation(arg, 1)
    },
    getDeviceLocation (arg, page_no) {
      // get all device location
      console.log('loadData request arg:', arg)
      arg.page_no = page_no
      arg.location_only = true
      console.log('getDeviceLocation', arg, 'page_no', page_no)
      getDeviceList(arg)
        .then(res => {
          console.log('device list', res)

          const pages = Math.ceil(res.data.total / res.data.page_size)

          this.getDevicesLocationPageNo = page_no
          this.getDevicesLocationPages = pages

          // append device to deviceMarkers
          res.data.records.forEach((item, index) => {
            if (item.last_location_lng !== null && item.last_location_lat !== null) {
              this.markersFound += 1
              // For Leaflet (English), use WGS84 directly; for AMap (Chinese), convert to GCJ-02
              const coordinates = this.useLeaflet
                ? [item.last_location_lng, item.last_location_lat]
                : wgs84togcj02(item.last_location_lng, item.last_location_lat)
              console.log('DeviceMap coordinates:', {
                device_id: item.code,
                useLeaflet: this.useLeaflet,
                raw: [item.last_location_lng, item.last_location_lat],
                final: coordinates
              })
              this.deviceMarkers.push({
                lnglat: coordinates,
                title: item.code,
                device: item
              })
            }
          })
          if (page_no >= pages || res.data.records.length === 0) {
            this.isGettingDeviceLocation = false
            this.getDevicesLocationPages = 1
            this.getDevicesLocationPageNo = 0
            console.log('DeviceMap markersFound', this.markersFound)
            // refresh map to make sure it is displayed, by hide and show
            this.refresh_map = false
            this.$nextTick(() => {
                this.refresh_map = true
                // Update Leaflet markers if using Leaflet
                if (this.useLeaflet) {
                  setTimeout(() => {
                    this.updateLeafletMarkers()
                  }, 500)
                }
              }
            )
          } else {
            if (this.isVisible) {
              this.getDeviceLocation(arg, page_no + 1)
            }
          }
        })
    },
    createObserver() {
      console.log('DeviceMap create');
      const options = {
        root: null, // Relative to the viewport
        rootMargin: '0px',
        threshold: 1.0 // Adjust this value based on what % should be visible
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          // Each entry describes an intersection change for one observed
          // target element:
          this.isVisible = entry.isIntersecting;
        });
      }, options);

      this.observer.observe(this.$refs.deviceMap);
    },
    destroyObserver() {
      if (this.observer) {
        this.observer.disconnect();
      }
      console.log('DeviceMap destroy');
    },
    onMapComplete() {
      console.log('DeviceMap: Map loaded and ready');
    },
    onLeafletMapReady(map) {
      console.log('DeviceMap Leaflet map ready:', map)
      this.leafletMap = map
      this.ensureLeafletCluster()
      this.updateLeafletMarkers()
    },
    ensureLeafletCluster() {
      if (!this.useLeaflet || !this.leafletMap) {
        return
      }
      if (!this.leafletClusterGroup) {
        console.log('DeviceMap: creating cluster group')
        const clusterRadius = this.options && this.options.gridSize ? this.options.gridSize : 80
        this.leafletClusterGroup = L.markerClusterGroup({
          maxClusterRadius: clusterRadius,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          spiderfyOnMaxZoom: true,
          removeOutsideVisibleBounds: true,
          animate: true,
          chunkedLoading: false
        })
        this.leafletClusterGroup.addTo(this.leafletMap)
        console.log('DeviceMap: cluster group added to map, has layer:', this.leafletMap.hasLayer(this.leafletClusterGroup))
      }
    },
    updateLeafletMarkers() {
      console.log('DeviceMap: updateLeafletMarkers called, useLeaflet:', this.useLeaflet, 'deviceMarkers.length:', this.deviceMarkers.length)
      
      if (!this.useLeaflet || !this.leafletMap) {
        return
      }

      this.ensureLeafletCluster()

      if (!this.leafletClusterGroup) {
        console.log('DeviceMap: cluster group missing')
        return
      }

      console.log('DeviceMap: clearing existing layers')
      this.leafletClusterGroup.clearLayers()

      const markers = []
      console.log('DeviceMap: processing', this.deviceMarkers.length, 'device markers')
      
      this.deviceMarkers.forEach((item, index) => {
        if (!item.lnglat || item.lnglat.length !== 2) {
          console.log(`DeviceMap: skipping invalid entry ${index}`, item)
          return
        }
        
        let lng = item.lnglat[0]
        let lat = item.lnglat[1]
        
        // Convert to numbers if they are strings
        if (typeof lng === 'string') lng = parseFloat(lng)
        if (typeof lat === 'string') lat = parseFloat(lat)
        
        console.log(`DeviceMap: item ${index} coordinates: lng=${lng}, lat=${lat}`)
        
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
          console.log(`DeviceMap: invalid coordinates for entry ${index}`, item.lnglat)
          return
        }
        
        // Create marker with Leaflet's [lat, lng] order
        const marker = L.marker([lat, lng])
        
        // Add marker to map directly to test if it's visible
        marker.addTo(this.leafletMap)
        console.log(`DeviceMap: marker ${index} added directly to map at [${lat}, ${lng}]`)
        
        if (item.device || item.title) {
          const popupContent = `
            <div>
              <p><b>Device Code:</b> ${(item.device && item.device.code) || item.title || 'N/A'}</p>
              ${item.device && item.device.bms_bt ? `<p><b>Battery Code:</b> ${item.device.bms_bt}</p>` : ''}
              ${item.device && item.device.location_time ? `<p><b>Location Time:</b> ${item.device.location_time}</p>` : ''}
            </div>
          `
          marker.bindPopup(popupContent)
        }
        markers.push(marker)
      })

      console.log('DeviceMap: created', markers.length, 'markers')
      
      // Test: Check if the map container has the correct size
      const mapSize = this.leafletMap.getSize()
      console.log('DeviceMap: map container size:', mapSize)
      
      if (mapSize.x === 0 || mapSize.y === 0) {
        console.warn('DeviceMap: map container has zero size, invalidating size')
        this.leafletMap.invalidateSize()
      }
      
      if (markers.length > 0) {
        // Don't add to cluster for now, keep them on the map directly for testing
        // this.leafletClusterGroup.addLayers(markers)
        
        // Pan to the first marker
        const firstMarker = markers[0]
        const latlng = firstMarker.getLatLng()
        console.log('DeviceMap: panning to first marker at:', latlng)
        this.leafletMap.setView(latlng, 13)
        
        // Check if marker is actually visible in DOM
        setTimeout(() => {
          const markerElements = document.querySelectorAll('.leaflet-marker-icon')
          console.log('DeviceMap: found', markerElements.length, 'marker elements in DOM')
          markerElements.forEach((el, i) => {
            console.log(`DeviceMap: marker element ${i} style:`, el.style.cssText)
          })
        }, 500)
      } else {
        console.log('DeviceMap: no valid markers to add')
      }
    },
    clearLeafletCluster() {
      if (this.leafletClusterGroup && this.leafletMap) {
        this.leafletClusterGroup.clearLayers()
        if (this.leafletMap.hasLayer(this.leafletClusterGroup)) {
          this.leafletMap.removeLayer(this.leafletClusterGroup)
        }
      }
      this.leafletClusterGroup = null
    },
    fitLeafletBounds(retries = 0) {
      if (!this.useLeaflet) {
        return
      }

      const mapComponent = this.$refs.leafletMap
      if (!mapComponent) {
        console.log('DeviceMap: map component not found')
        if (retries < 5) {
          setTimeout(() => this.fitLeafletBounds(retries + 1), 200)
        }
        return
      }

      const map = this.leafletMap || (mapComponent.getMap ? mapComponent.getMap() : null)
      if (!map) {
        console.log('DeviceMap: map not ready yet, retry:', retries)
        if (retries < 5) {
          setTimeout(() => this.fitLeafletBounds(retries + 1), 200)
        }
        return
      }
      this.leafletMap = map

      if (!this.leafletClusterGroup) {
        console.log('DeviceMap: cluster group not ready')
        return
      }

      const layers = this.leafletClusterGroup.getLayers()
      if (!layers || layers.length === 0) {
        console.log('DeviceMap: no layers in cluster group')
        return
      }

      const bounds = this.leafletClusterGroup.getBounds()
      if (!bounds || !bounds.isValid()) {
        console.log('DeviceMap: invalid bounds, trying single marker center')
        const first = layers[0] && layers[0].getLatLng ? layers[0].getLatLng() : null
        if (first) {
          console.log('DeviceMap: centering on first marker:', first)
          map.setView(first, 15)
        }
        return
      }

      console.log('DeviceMap: fitting bounds to markers', bounds)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  },
  beforeDestroy() {
    this.destroyObserver()
    this.clearLeafletCluster()
  }
}
</script>

<style lang='scss' scoped>
#map {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 1200px;
  position: relative;
}

#map1 {
  width: 100%;
  height: 600px;
}

#map2 {
  width: 100%;
  height: 600px;
}

.popup {
  position: absolute;
  z-index: 1;
  width: 100%;
  background-color: #fff;
}
</style>
