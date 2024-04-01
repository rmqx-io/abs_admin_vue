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
    <amap
      cache-key="marker-cluster-map"
      :zoom="4"
      async
      :center="center"
      v-if="refresh_map"
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
  </div>
</template>

<script>
import {
  getDeviceList,
  wgs84togcj02
} from '@/api/manage'

export default {
  name: 'DeviceMap',
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
      isVisible: false
    }
  },
  mounted () {
    this.createObserver();
    this.refreshMap()
  },
  beforeDestroy() {
    this.destroyObserver();
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
              const gcj02 = wgs84togcj02(item.last_location_lng, item.last_location_lat)
              // console.log('gcj02', gcj02)
              this.deviceMarkers.push({
                lnglat: gcj02,
                title: item.code
              })
            }
          })
          if (page_no >= pages || res.data.records.length === 0) {
            this.isGettingDeviceLocation = false
            this.getDevicesLocationPages = 1
            this.getDevicesLocationPageNo = 0
            console.log('markersFound', this.markersFound)
            // refresh map to make sure it is displayed, by hide and show
            this.refresh_map = false
            this.$nextTick(() => {
                this.refresh_map = true
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
    }
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
  backgroud-color: #fff;
}
</style>
