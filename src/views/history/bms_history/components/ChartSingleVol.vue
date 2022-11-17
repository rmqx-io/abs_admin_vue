<template>
  <el-card class="card" shadow="hover">
    <div ref="chart_single_vol" style="height: 350px"></div>
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
      init(arr) {
        var series = []
        arr[0].forEach((items, index) => {
          //每一串电池定义一个类型 最多20
          series.push({
            name: '电池' + index,
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: [], //最终是一个类型 如电池1，多个[时间，数值] 共20个
          })
        })
        //遍历 x时间点 items 每个时间点的电池数组
        arr.forEach((items, index) => {
          var maxVol = -1
          var mixVol = -1
          items.forEach((items2, index2) => {
            if (index2 == 0) {
              maxVol = items2.value
              mixVol = items2.value
            }
            if (items2.value > maxVol) {
              maxVol = items2.value
            } else if (items2.value < mixVol) {
              mixVol = items2.value
            }
            //补充到相对于的编号index2
            series[index2].data.push([new Date(items2.date), items2.value])
          })

          series.forEach((item3, index3) => {
            var listIndex = item3.data.length - 1
            // console.log('############前#', item3.data[listIndex])
            item3.data[listIndex].push(maxVol)
            item3.data[listIndex].push(mixVol)

            // console.log('############后#', item3.data[listIndex])
          })
        })
        // this.seriesTemp = series
        this.drawLineChart(series)
      },
      drawLineChart(series) {
        var that = this
        this.chartHis = echarts.init(this.$refs.chart_single_vol)

        // var series = []
        // //数据
        // for (let index = 1; index <= 20; index++) {
        //   series.push({
        //     name: '电池' + index,
        //     type: 'line',
        //     smooth: true,
        //     symbol: 'none',
        //     areaStyle: {},
        //     data: [],
        //   })
        // }
        // var dateY = []
        // for (let x = 0; x < 300; x++) {
        //   dateY.push(new Date(2020, 1, x + 1))
        // }
        // for (let i = 0; i < dateY.length; i++) {
        //   for (let j = 0; j < series.length; j++) {
        //     series[j].data.push([
        //       dateY[i],
        //       Math.round(Math.random() * 60) + 500,
        //     ])
        //   }
        // }

        //配置
        let option = {
          sampling: 'lttb',
          color: [
            '#1abc9c',
            '#2ecc71',
            '#3498db',
            '#9b59b6',
            '#34495e',

            '#f1c40f',
            '#e67e22',
            '#e74c3c',
            '#ff9ff3',
            '#54a0ff',

            '#00a8ff',
            '#9c88ff',
            '#487eb0',
            '#e84118',

            '#FD7272',
            '#ff6700',
            '#F97F51',
            '#BDC581',
            '#47ba80',
          ],
          tooltip: {
            trigger: 'axis',
            formatter: function (params, ticket, callback) {
              var htmlStr = ''
              for (var i = 0; i < params.length; i++) {
                var param = params[i]
                // console.log('########测试', param)
                var xValue = getDateStr(param.value[0]) //x轴的名称
                var yValue = param.value[1] //Y
                var maxVol = param.value[2]
                var mixVol = param.value[3]
                var seriesName = param.seriesName //图例名称
                // var value = param.value //y轴值
                var color = param.color //图例颜色

                if (i === 0) {
                  htmlStr += xValue + '<br/>' //x轴的名称
                }
                if (i % 4 == 0) {
                  htmlStr += '<div>'
                }
                //为了保证和原来的效果一样，这里自己实现了一个点的效果
                htmlStr +=
                  '<span style="margin-right:5px; ' +
                  (i % 4 == 0 ? '' : 'margin-left:15px;') +
                  'display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
                  color +
                  ';"></span>'
                // 文本颜色设置-(需要设置,请解注释下面一行)
                if (maxVol == yValue) {
                  htmlStr += '<span style="color:#47ba80">'
                } else if (mixVol == yValue) {
                  htmlStr += '<span style="color:#f34d37">'
                }
                //圆点后面显示的文本
                htmlStr += seriesName + '：' + yValue + 'V'
                // 文本颜色设置-(需要设置,请解注释下面一行)
                htmlStr += '</span>'
                if (i % 4 == 3) {
                  htmlStr += '</div>'
                }
              }
              return htmlStr
            },
          },
          title: {
            left: 'center',
            text: '单体电压统计图',
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
            name: '单体电压/V',
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
