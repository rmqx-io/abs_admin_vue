<template>
  <div id="map">
    <div>设备地图</div>
    <div id="map1">
      <amap
        cache-key="marker-cluster-map"
        :zoom="13"
        async
        map-style="amap://styles/darkblue"
        :center="center"
      >
        <!-- 点聚合 -->
        <amap-marker-cluster
          :data="data"
          key="custom-cluster"
          :grid-size="options.gridSize"
          :average-center="options.averageCenter"
        >
          <!-- :marker-options="getMarkerOptions"
          :cluster-options="getClusterOptions" -->
        </amap-marker-cluster>
      </amap>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeviceMap',
  data () {
    return {
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
      }
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

</style>
