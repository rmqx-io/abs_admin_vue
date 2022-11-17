<template>
  <div class="table-container">
    <el-table
      ref="tableSort"
      border
      stripe
      highlight-current-row
      :data="list"
      :element-loading-text="elementLoadingText"
      :height="600"
    >
      <!-- tab -->
      <el-table-column
        show-overflow-tooltip
        prop="ReceiveTime"
        label="更新时间"
        width="170"
      ></el-table-column>
      <!-- tab -->
      <el-table-column
        show-overflow-tooltip
        prop="TotalBatteryVoltage"
        label="总电压(V)"
      ></el-table-column>
      <!-- tab -->
      <el-table-column
        show-overflow-tooltip
        prop="Current"
        label="电流(A)"
      ></el-table-column>
      <!-- tab -->
      <el-table-column
        show-overflow-tooltip
        prop="SOC"
        label="SOC(%)"
      ></el-table-column>
      <!-- tab -->
      <el-table-column
        show-overflow-tooltip
        prop="EqualizerTemperature"
        label="箱内温度(℃)"
      ></el-table-column>
      <!-- tab -->
      <el-table-column
        show-overflow-tooltip
        prop="CellTemperature"
        label="电池温度(℃)"
      ></el-table-column>
      <!-- tab -->
      <el-table-column
        show-overflow-tooltip
        prop="PowerTubeTemperature"
        label="功率管温度(℃)"
      ></el-table-column>
      <!-- tab -->
      <el-table-column
        show-overflow-tooltip
        prop="SpecialChargerSwitch"
        label="专用充电器"
      ></el-table-column>
      <!-- tab -->
      <el-table-column
        show-overflow-tooltip
        prop="ChargingMOSStatus"
        label="充电管状态"
      ></el-table-column>
      <!-- tab -->
      <el-table-column
        show-overflow-tooltip
        prop="DisChargingMOSStatus"
        label="放电管状态"
      ></el-table-column>
    </el-table>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        list: [],
        elementLoadingText: '正在加载...',
      }
    },
    created() {},
    beforeDestroy() {},
    mounted() {},
    methods: {
      initLog(arr) {
        if (arr != null && arr.length > 0) {
          for (var i = 0; i < arr.length; i++) {
            arr[i].TotalBatteryVoltage = (
              arr[i].TotalBatteryVoltage / 100
            ).toFixed(2)
            arr[i].Current = (arr[i].Current / 1000).toFixed(3)
          }
        }
        this.list = arr
      },
    },
  }
</script>
