<template>
  <a-card title="BMS 历史曲线组件测试页面">
    <div style="margin-bottom: 24px;">
      <a-alert
        message="组件使用与验证说明"
        description="BmsHistory 组件在实际业务中通过指定 deviceId 来自动拉取设备的历史数据并进行曲线绘制。本页面不仅演示了该组件的真实用法，还引入了交互式测试模块，让您能够使用模拟数据直观对比并验证温度传感器故障值 (-273.1 °C) 的过滤与直线桥接效果。"
        type="info"
        show-icon
      />
    </div>

    <!-- 1. Real usage showcase -->
    <a-collapse default-active-key="1" style="margin-bottom: 24px;">
      <a-collapse-panel key="1" header="组件真实引用代码示例 (How to import and use)">
        <p style="margin-bottom: 8px;">在您的 Vue 页面中，您可以像下面这样直接引入并传递 <code>deviceId</code> 属性：</p>
        <pre style="background: #fafafa; padding: 12px; border-radius: 4px; border: 1px solid #e8e8e8; font-family: monospace; font-size: 13px;">
&lt;template&gt;
  &lt;bms-history deviceId="your_device_id_here" /&gt;
&lt;/template&gt;

&lt;script&gt;
import BmsHistory from '@/views/list/components/BmsHistory.vue'

export default {
  components: {
    BmsHistory
  }
}
&lt;/script&gt;
        </pre>
      </a-collapse-panel>
    </a-collapse>

    <!-- 2. Real Component Instance with custom input -->
    <a-card type="inner" title="1. 真实组件运行测试 (读取 API 数据)">
      <div style="margin-bottom: 16px; display: flex; gap: 12px; align-items: center;">
        <span>请输入真实设备ID：</span>
        <a-input v-model="testDeviceId" style="width: 250px" placeholder="请输入设备号" />
        <a-button type="primary" @click="loadComponent">加载/刷新组件</a-button>
      </div>
      <div v-if="renderComponent" style="border: 1px dashed #d9d9d9; padding: 16px; border-radius: 8px; background: #fff; min-height: 200px;">
        <bms-history :deviceId="testDeviceId" />
      </div>
    </a-card>

    <!-- 3. Mock Chart showcasing the -273.1 fix visually -->
    <a-card type="inner" title="2. 故障值过滤与拉直线效果对比 (交互模拟数据)" style="margin-top: 24px;">
      <div style="margin-bottom: 16px;">
        <span style="margin-right: 12px; font-weight: bold;">图表模式切换：</span>
        <a-radio-group v-model="chartMode" @change="updateMockChart">
          <a-radio-button value="fixed">✅ 开启修复 (过滤 -273.1 & 自动拉直线)</a-radio-button>
          <a-radio-button value="raw">❌ 模拟未修复 (包含 -273.1 异常坠落线)</a-radio-button>
        </a-radio-group>
      </div>

      <div style="width: 100%; height: 400px;">
        <bms-chart-component
          ref="mockChart"
          title="电池温度测试曲线 (交互展示)"
          ylabel="温度 (°C)"
          :chartData="mockChartData"
        />
      </div>
    </a-card>
  </a-card>
</template>

<script>
import BmsHistory from '@/views/list/components/BmsHistory.vue'
import BmsChartComponent from '@/views/list/components/BmsChartComponent.vue'

export default {
  name: 'BmsHistoryTest',
  components: {
    BmsHistory,
    BmsChartComponent
  },
  data() {
    return {
      testDeviceId: '60300001',
      renderComponent: true,
      chartMode: 'fixed',
      mockChartData: {}
    }
  },
  mounted() {
    this.updateMockChart()
  },
  methods: {
    loadComponent() {
      this.renderComponent = false
      this.$nextTick(() => {
        this.renderComponent = true
      })
    },
    updateMockChart() {
      const times = [
        '2026-05-22 10:00:00', '2026-05-22 10:05:00', '2026-05-22 10:10:00',
        '2026-05-22 10:15:00', '2026-05-22 10:20:00', '2026-05-22 10:25:00',
        '2026-05-22 10:30:00', '2026-05-22 10:35:00', '2026-05-22 10:40:00',
        '2026-05-22 10:45:00'
      ]

      // 3rd and 7th elements represent sensor drops at -273.1
      let batteryTemp = [25.1, 25.3, 25.5, -273.1, 25.6, 25.4, 25.2, -273.1, 25.3, 25.5]
      let boxTemp = [24.0, 24.1, 24.3, -273.1, 24.4, 24.2, 24.1, -273.1, 24.3, 24.4]
      let powerTemp = [28.5, 29.0, 29.5, -273.1, 30.0, 29.8, 29.2, -273.1, 29.4, 29.6]

      if (this.chartMode === 'fixed') {
        batteryTemp = batteryTemp.map(v => v === -273.1 ? null : v)
        boxTemp = boxTemp.map(v => v === -273.1 ? null : v)
        powerTemp = powerTemp.map(v => v === -273.1 ? null : v)
      }

      this.mockChartData = {
        '电池温度': times.map((t, idx) => ({ time: t, value: batteryTemp[idx] })),
        '箱内温度': times.map((t, idx) => ({ time: t, value: boxTemp[idx] })),
        '功率管温度': times.map((t, idx) => ({ time: t, value: powerTemp[idx] }))
      }

      this.$nextTick(() => {
        if (this.$refs.mockChart) {
          this.$refs.mockChart.updateChart(this.mockChartData)
        }
      })
    }
  }
}
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
