import { shallowMount } from '@vue/test-utils'
import BmsHistory from '@/views/list/components/BmsHistory.vue'
import BmsChartComponent from '@/views/list/components/BmsChartComponent.vue'
import { getBmsType, getBatteryInfo } from '@/api/manage'

// Mock the API layer
jest.mock('@/api/manage', () => ({
  getBmsType: jest.fn(),
  getBatteryInfo: jest.fn()
}))

// Mock Echarts for BmsChartComponent testing
const setOptionMock = jest.fn()
jest.mock('echarts', () => ({
  init: jest.fn(() => ({
    setOption: setOptionMock
  })),
  getInstanceByDom: jest.fn(() => null)
}))

describe('BmsHistory and BmsChartComponent temperature fix', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('BmsHistory should filter out -273.1 temperature values to null', async () => {
    // Set up mock API responses
    getBmsType.mockResolvedValue({
      data: {
        bms_type: 'test_bms'
      }
    })

    getBatteryInfo.mockResolvedValue({
      data: [
        {
          time_tracking: '2026-05-22 12:00:00',
          battery_voltage: 50.5,
          battery_currency: 1.5,
          battery_capacity_soc: 95.0,
          battery_temperature: -273.1, // Should become null
          battery_box_temperature: 25.5, // Should remain 25.5
          power_transistor_temperature: -273.1, // Should become null
          single_battery_voltage_arr: '3.2,3.3'
        }
      ]
    })

    // Mount BmsHistory component
    const wrapper = shallowMount(BmsHistory, {
      propsData: {
        deviceId: 'test_device'
      }
    })

    // Wait for the mounted lifecycle and API calls to complete
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Assert that the API was called with the device ID
    expect(getBmsType).toHaveBeenCalledWith('test_device')
    expect(getBatteryInfo).toHaveBeenCalled()

    // Assert that -273.1 was parsed as null, while normal temperature remained correct
    expect(wrapper.vm.temperatureData['电池温度'][0].value).toBeNull()
    expect(wrapper.vm.temperatureData['箱内温度'][0].value).toBe(25.5)
    expect(wrapper.vm.temperatureData['功率管温度'][0].value).toBeNull()
  })

  it('BmsChartComponent should render series with connectNulls: true', () => {
    const chartData = {
      '电池温度': [
        { time: '2026-05-22 12:00:00', value: null },
        { time: '2026-05-22 12:05:00', value: 25.5 }
      ]
    }

    const wrapper = shallowMount(BmsChartComponent, {
      propsData: {
        title: '电池温度',
        ylabel: '温度 (°C)',
        chartData: chartData
      }
    })

    // Call updateChart to render options
    wrapper.vm.updateChart(chartData)

    // Assert that echarts was initialized and setOption was called with connectNulls: true
    expect(setOptionMock).toHaveBeenCalled()
    const lastCalledOptions = setOptionMock.mock.calls[setOptionMock.mock.calls.length - 1][0]
    expect(lastCalledOptions.series[0]).toEqual(
      expect.objectContaining({
        type: 'line',
        connectNulls: true,
        data: [
          ['2026-05-22 12:00:00', null],
          ['2026-05-22 12:05:00', 25.5]
        ]
      })
    )
  })
})
