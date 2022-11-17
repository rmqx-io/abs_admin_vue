<template>
  <el-card class="card" shadow="hover">
    <div ref="chart_bms" style="height: 300px"></div>
  </el-card>
</template>

<script>
  import * as echarts from 'echarts'
  import { getDateStr } from '@/utils/dateUtils'
  export default {
    data() {
      return {
        // seriesTemp: [],
        chartHis: null,
      }
    },
    mounted() {},
    methods: {
      init(arr, title, color, name, unitTag, unit) {
        var series = []
        title.forEach((items, index) => {
          //每一串电池定义一个类型 最多20
          series.push({
            name: items,
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: [], //最终是一个类型 如电池1，多个[时间，数值] 共20个
            markPoint: {
              data: [
                {
                  type: 'max',
                  name: '最大值',
                },
                {
                  type: 'min',
                  name: '最小值',
                  itemStyle: { color: '#f34d37' },
                },
              ],
            },
          })
        })
        //遍历 x时间点 items 每个时间点的电池数组
        arr.forEach((items, index) => {
          items.forEach((items2, index2) => {
            //补充到相对于的编号index2
            series[index2].data.push([new Date(items2.date), items2.value])
          })
        })
        this.drawLineChart(series, color, name, unitTag, unit)
      },
      drawLineChart(series, color, name, unitTag, unit) {
        var that = this
        this.chartHis = echarts.init(this.$refs.chart_bms)
        //配置
        let option = {
          sampling: 'lttb',
          color: color,
          tooltip: {
            trigger: 'axis',
            formatter: function (params, ticket, callback) {
              var htmlStr = ''
              for (var i = 0; i < params.length; i++) {
                var param = params[i]
                var xValue = getDateStr(param.value[0]) //x轴的名称
                var yValue = param.value[1] //Y
                var seriesName = param.seriesName //图例名称
                var color = param.color //图例颜色

                if (i === 0) {
                  htmlStr += xValue + '<br/>' //x轴的名称
                }
                htmlStr += '<div>'
                //为了保证和原来的效果一样，这里自己实现了一个点的效果
                htmlStr +=
                  '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
                  color +
                  ';"></span>'
                // 文本颜色设置-(需要设置,请解注释下面一行)
                // if (maxVol == yValue) {
                //   htmlStr += '<span style="color:#47ba80">'
                // } else if (mixVol == yValue) {
                //   htmlStr += '<span style="color:#f34d37">'
                // } else {
                //   console.log('#对比#', yValue, maxVol, mixVol)
                // }
                //圆点后面显示的文本
                htmlStr += seriesName + '：' + yValue + unit
                // 文本颜色设置-(需要设置,请解注释下面一行)
                htmlStr += '</span>'
                htmlStr += '</div>'
              }
              return htmlStr
            },
          },
          title: {
            left: 'center',
            text: name,
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none',
              },
              restore: {},
              saveAsImage: {},
            },
          },
          xAxis: {
            type: 'time',
            boundaryGap: false,
          },
          yAxis: {
            type: 'value',
            boundaryGap: [0, '10%'],
            name: unitTag,
          },
          dataZoom: [
            {
              type: 'inside',
              start: 0,
              end: 100,
            },
            {
              start: 0,
              end: 20,
            },
          ],
          series: series,
        }
        // 使用刚指定的配置项和数据显示图表
        this.chartHis.setOption(option)
      },
    },
  }
</script>
