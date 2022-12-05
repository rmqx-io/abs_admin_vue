<template>
  <div>
    <!--<div>bms config</div>-->
    <el-descriptions :column="6" size="mini" border>
      <el-descriptions-item
        span="2"
        v-for="(value, name, index) in this.bmsConfig"
        :key="name"
        :label="bmsConfigKeyToName[name]"
      >
        {{ (value) }}
      </el-descriptions-item>
    </el-descriptions>
    <!--<div>{{ this.deviceId }}</div>-->
    <!--<div>{{ this.bmsConfig }}</div>-->
  </div>
</template>

<script>
import { getBatteryInfoLatest } from '@/api/manage'

export default {
  name: 'BmsConfig',
  props: {
    deviceId: {
      type: String,
      default: () => {}
    }
  },
  mounted () {
    getBatteryInfoLatest(this.deviceId, {})
      .then(res => {
        console.log('res', res.data.device_bms_config)
        this.bmsConfig = res.data.device_bms_config
        // remove id
        delete this.bmsConfig.id
        delete this.bmsConfig.device_id
      })
  },
  data () {
    return {
      bmsConfigKeyToName: {
        'battery_cell_count': '电池总串数',
        'total_voltage_over_voltage_protection': '总电压过压保护',
        'total_voltage_under_voltage_protection': '总电压欠压保护',
        'per_voltage_over_voltage_protection': '单体过压保护电压',
        'per_voltage_over_voltage_recover': '单体过压恢复电压',
        'per_voltage_over_voltage_protection_delay': '单体过压保护延时',
        'per_voltage_under_voltage_protection': '单体欠压保护电压',
        'per_voltage_under_voltage_recover': '单体欠压恢复电压',
        'per_voltage_under_voltage_protection_delay': '单体欠压保护延时',
        'battery_voltage_different_protection': '电芯压差保护值',
        'discharge_over_current': '放电过流保护值',
        'discharge_over_current_delay': '放电过流延时',
        'charge_over_current': '充电过流保护值',
        'charge_over_current_delay': '充电过流延时',
        'balance_start_voltage': '均衡启动电压',
        'balance_start_pressure': '均衡开启压差',
        'power_transistor_temperature_protection': '功率管温度保护值',
        'power_transistor_temperature_restore': '功率管温度恢复值',
        'power_box_temperature_protection': '电池箱内温度保护值',
        'power_box_temperature_restore': '电池箱内温度恢复值',
        'battery_temperature_difference_protection': '电池温差保护值',
        'battery_charge_high_temperature_protection': '电池充电高温保护值',
        'battery_discharge_high_temperature_protection': '电池放电高温保护值',
        'battery_charge_low_temperature_protection': '充电低温保护值',
        'battery_charge_low_temperature_restore': '充电低温保护恢复值',
        'battery_discharge_low_temperature_protection': '放电低温保护值',
        'battery_discharge_low_temperature_restore': '放电低温保护恢复值',
        'battery_cell_config': '电池串数设置',
        'battery_capacity_config': '电池容量设置',
        'current_calibration': '电流校准',
        'protection_board_address': '保护板地址',
        'battery_type': '电池类型',
        'sleep_delay': '休眠等待时间',
        'low_power_alarm_threshold': '低容量报警值',
        'battery_device_id': '设备码',
        'product_date': '出厂日期',
        'battery_uptime': '系统工作时间',
        'software_version': '软件版本号',
        'current_calibration_switch': '是否启动电流校准',
        'battery_real_capacity': '电池实际容量',
        'factory_id': '厂家命名',
        'close_gps_capacity_threshold': '关闭供电的电芯电压值',
        'restore_gps_capacity_threshold': '恢复供电的电芯电压值',
        'alarm_humidity_threshold': '报警湿度阈值',
        'short_circuit_current': '设定短路电流值',
        'short_circuit_delay': '设定短路延时时间'
      },
      bmsConfig: {}
    }
  }
}
</script>

<style scoped>

</style>
