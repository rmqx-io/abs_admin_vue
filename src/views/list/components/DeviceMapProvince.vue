<template>
  <div id="map-container">
    <amap :zoom="5" :center="center">
      <amap-polygon v-for="(boundary, provinceName) in provinceBoundaries" :path="boundary" :strokeWeight="1"
        :fillOpacity="0.5" :fillColor="getProvinceColor(provinceName)" @mouseover="showProvinceData(provinceName)"
        @mouseout="hideProvinceData()" />
    </amap>
  </div>
</template>

<script>
export default {
  data() {
    return {
      center: [104.0, 37.5], // Initial map center coordinates
      provinceBoundaries: {}, // Object containing province boundaries, with provinceName as the key and boundary path as the value
      provinceData: {} // Object containing province data, with provinceName as the key and associated data as the value
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      // Load province boundaries data (you need to implement this)
      // For example, you can fetch the data from a backend API or import a JSON file.
      // The data should be in the format of { provinceName: [boundaryCoordinates] }
      // Replace 'loadProvinceBoundariesData' with your method to fetch the data.
      this.loadProvinceBoundariesData().then((data) => {
        this.provinceBoundaries = data;
      });
    },
    getProvinceColor(provinceName) {
      // Implement your logic to return the color based on province data
      // For example: if (this.provinceData[provinceName] > 1000) { return 'red'; } else { return 'blue'; }
      return "blue";
    },
    showProvinceData(provinceName) {
      // Show province data when the user hovers over a province
      const data = this.provinceData[provinceName];
      // Use AMap's InfoWindow or other means to display the data
    },
    hideProvinceData() {
      // Hide province data when the user leaves the province
      // For example: this.map.clearInfoWindow();
    },
    loadProvinceBoundariesData() {
      const chinaProvincesBoundaries = {
        "北京市": [
          [
            [116.10196, 40.22686],
            [116.38368, 40.22686],
            [116.38368, 40.00797],
            [116.10196, 40.00797],
            [116.10196, 40.22686],
          ]
          // ... other boundary coordinates for Beijing ...
        ],
        "天津市": [
          [
            [117.06128, 39.34056],
            [117.81936, 39.34056],
            [117.81936, 38.53005],
            [117.06128, 38.53005],
            [117.06128, 39.34056]
          ]
          // ... other boundary coordinates for Tianjin ...
        ],
        "河北省": [
          [
            [113.70279, 42.63052],
            [119.48684, 42.63052],
            [119.48684, 36.05765],
            [113.70279, 36.05765],
            [113.70279, 42.63052]
          ]
          // ... other boundary coordinates for Hebei ...
        ],
        // ... other provinces ...
      };


      // Replace this with your method to fetch province boundaries data
      // For example, you can use axios or fetch to get the data from your backend API
      // and return a promise that resolves with the data.
      // Ensure that the data is in the format of { provinceName: [boundaryCoordinates] }
      // For example:
      // return axios.get('/api/provinceBoundaries').then(response => response.data);
      // or return fetch('/api/provinceBoundaries').then(response => response.json());
      // Replace the example URLs with your actual API endpoints.
      // For this example, I'm returning mock data:
      return Promise.resolve(
        chinaProvincesBoundaries
      );
    }
  }
};
</script>

<style>
#map-container {
  width: 100%;
  height: 500px;
}
</style>
