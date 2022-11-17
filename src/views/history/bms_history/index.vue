<template>
  <div class="table-container">
    <!-- 顶部 -->
    <vab-query-form>
      <!-- 顶部添加/删除按钮 -->
      <vab-query-form-left-panel>
        <div class="block">
          <span style="margin-right: 8px">日期选择</span>
          <el-date-picker
            v-model="valueDate"
            style="margin-right: 8px"
            type="datetimerange"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
            @change="onBtnTrackStart"
          ></el-date-picker>
        </div>
      </vab-query-form-left-panel>
      <!-- 输入框 -->
      <vab-query-form-right-panel>
        <el-form
          ref="form"
          :model="queryForm"
          :inline="true"
          @submit.native.prevent
        >
          <el-form-item>
            <el-input
              v-model="queryForm.key"
              :disabled="hasInit"
              placeholder="输入搜索内容"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              icon="el-icon-search"
              type="primary"
              native-type="submit"
              :loading="searchLoading"
              @click="handleQuery"
            >
              查询
            </el-button>
          </el-form-item>
        </el-form>
      </vab-query-form-right-panel>
    </vab-query-form>
    <span>
      {{ mAddPage }}/{{ mTotalPage }} 共{{ mDataCount }}条 耗时:{{ mUseTime }}秒
      {{ mAddPage == mTotalPage ? '(绘制图表)' : '' }}
    </span>
    <el-row :gutter="10">
      <el-col
        v-if="!isBms"
        :xs="24"
        :sm="24"
        :md="24"
        :lg="24"
        :xl="24"
        style="padding: 16px"
      >
        {{
          loading
            ? '正在搜索中，请等待...'
            : '搜索时间长数据量较大耐心等待，数据量太大内存不足可能会出现崩溃现象（绘制图表也需要较长时间和较多内存），请适当调整搜索时间。'
        }}
      </el-col>
      <el-col
        v-if="isBms && hasDate == false"
        :xs="24"
        :sm="24"
        :md="24"
        :lg="24"
        :xl="24"
        style="padding: 16px"
      >
        {{ '该时间段，设备无数据' }}
      </el-col>
      <el-col
        v-if="isBms && hasDate"
        :xs="24"
        :sm="24"
        :md="12"
        :lg="12"
        :xl="12"
      >
        <chart-bms ref="bmsVol"></chart-bms>
      </el-col>
      <el-col
        v-if="isBms && hasDate"
        :xs="24"
        :sm="24"
        :md="12"
        :lg="12"
        :xl="12"
      >
        <chart-bms ref="bmsSoc"></chart-bms>
      </el-col>
      <el-col
        v-if="isBms && hasDate"
        :xs="24"
        :sm="24"
        :md="12"
        :lg="12"
        :xl="12"
      >
        <chart-bms ref="bmsCur"></chart-bms>
      </el-col>
      <el-col
        v-if="isBms && hasDate"
        :xs="24"
        :sm="24"
        :md="12"
        :lg="12"
        :xl="12"
      >
        <chart-bms ref="bmsTemp"></chart-bms>
      </el-col>
      <el-col
        v-if="isBms && hasDate"
        :xs="24"
        :sm="24"
        :md="24"
        :lg="24"
        :xl="24"
      >
        <chart-single-vol ref="bmsSingle"></chart-single-vol>
      </el-col>

      <el-col
        v-if="isBms && hasDate && type == 227"
        :xs="24"
        :sm="24"
        :md="24"
        :lg="24"
        :xl="24"
      >
        <bms-log-fm ref="logFm"></bms-log-fm>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { getEquipList, getBmsHistory } from '@/api/monitor'
  import { getDateStr } from '@/utils/dateUtils'
  import ChartSingleVol from './components/ChartSingleVol.vue'
  import ChartBms from './components/ChartBms.vue'
  import BmsLogFm from './components/BmsLogFm.vue'
  export default {
    components: {
      ChartSingleVol,
      ChartBms,
      BmsLogFm,
    },
    data() {
      var curDate = new Date()
      let yy = curDate.getFullYear()
      let mm = curDate.getMonth()
      let dd = curDate.getDate()
      return {
        mAddPage: '0',
        mTotalPage: '0',
        mDataCount: '0',
        dateInit: 0,
        dateBefore: 0,
        beforeTime: 0,
        mUseTime: 0,
        type: '',
        hasInit: false,
        searchLoading: false,
        isBms: false,
        loading: false,
        dataListFM: [],
        dataListMT: [],
        dataListMY: [],
        dataListCLY2: [],
        dataListCLY3: [],
        dataListCLY4: [],
        valueDate: [new Date(yy, mm, dd, 0, 0), new Date(yy, mm, dd, 23, 59)],
        queryForm: {
          Flag: 0,
          key: '',
          page: 1,
          pageSize: 10,
          WithChildren: true,
        },
        pickerOptions: {
          shortcuts: [
            {
              text: '最近一周',
              onClick(picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                picker.$emit('pick', [start, end])
              },
            },
            {
              text: '最近一个月',
              onClick(picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                picker.$emit('pick', [start, end])
              },
            },
            {
              text: '上个月',
              onClick(picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 60)
                end.setTime(end.getTime() - 3600 * 1000 * 24 * 30)
                picker.$emit('pick', [start, end])
              },
            },
          ],
        },
      }
    },
    computed: {
      height() {
        return this.$baseTableHeight()
      },
    },
    created() {},
    beforeDestroy() {
      console.log('#######结束')
    },
    mounted() {
      // var key = this.$router.params.key
      // console.log('################key#', this.$route.params.key)
      this.queryForm.key = this.$route.params.key
      if (this.$route.params.key != undefined) {
        this.handleQuery()
      }
    },
    methods: {
      initHistory(sn) {
        this.queryForm.key = sn
        this.hasInit = true
        this.handleQuery()
      },
      //点击开始
      onBtnTrackStart() {
        this.handleQuery()
      },
      //第一页
      handleQuery() {
        // console.log('#this.queryForm.key', this.queryForm.key)
        if (this.queryForm.key == '') {
          this.$baseMessage('请输入设备号', 'error')
        } else {
          this.fetchData()
        }
      },
      async getBmsHisRequest(sn, page, pageSize, type, ptid) {
        const { response } = await getBmsHistory({
          Key: sn,
          type: type,
          ptid: ptid,
          StartTime: getDateStr(this.valueDate[0]),
          EndTime: getDateStr(this.valueDate[1]),
          page: page,
          pageSize: pageSize,
        })
        this.dateBefore = Date.parse(new Date())
        this.mUseTime = (this.dateBefore - this.dateInit) / 1000
        this.mTotalPage = response.pageCount
        this.mAddPage = response.page
        this.mDataCount = response.dataCount
        if (response.data.length > 0 && this.hasDate == false) {
          this.hasDate = true
        }
        if (type == 227) {
          this.dataListFM = this.dataListFM.concat(response.data)
        } else if (type == 235) {
          if (response != null) {
            if (ptid == 2) {
              this.dataListCLY2 = this.dataListCLY2.concat(response.data)
            } else if (ptid == 3) {
              this.dataListCLY3 = this.dataListCLY3.concat(response.data)
            } else if (ptid == 4) {
              this.dataListCLY4 = this.dataListCLY4.concat(response.data)
            }
          }
        } else if (type == 254) {
          this.dataListMT = this.dataListMT.concat(response.data)
        } else if (type == 234) {
          this.dataListMY = this.dataListMY.concat(response.data)
        }
        if (response.page < response.pageCount) {
          await this.getBmsHisRequest(
            sn,
            response.page + 1,
            pageSize,
            type,
            ptid
          )
        }
      },
      //多次请求
      async getBmsHis(sn, type, ptid, initer) {
        if (initer) {
          this.searchLoading = true
          this.loading = true
          this.isBms = false
          this.type = type

          var time = setTimeout(() => {
            this.searchLoading = false
            this.loading = false
          }, 10000)
        }
        //遍历循环请求
        this.dateInit = Date.parse(new Date())
        await this.getBmsHisRequest(sn, 1, 1000, type, ptid)
        if (initer) {
          clearTimeout(time)
          this.searchLoading = false
          this.loading = false
          this.isBms = true
        }
        if (type == 227) {
          this.setFmUI()
        } else if (type == 235 && ptid == 2) {
          this.setCYL2UI()
        } else if (type == 235 && ptid == 3) {
          this.setCYL3UI()
        } else if (type == 235 && ptid == 4) {
          this.setCYL4UI()
        } else if (type == 254) {
          this.setMtUI()
        } else if (type == 234) {
          this.setMyUI()
        } else {
          this.$baseMessage('该时间段没有记录', 'error')
        }
      },
      setCYL2UI() {
        var list = this.dataListCLY2
        var batteryList = []
        for (let index = 0; index < list.length; index++) {
          var item = list[index]
          //每一串
          var batteryTemp = JSON.parse(item.BatteryVoltages)
          var batteryItemList = []
          //每个时间的电池数组
          batteryTemp.forEach((items, index) => {
            var vol = parseFloat(items.Voltage / 1000).toFixed(3)
            batteryItemList.push({
              pos: index,
              value: vol,
              date: item.ReceiveTime,
            })
          })
          //每一个时间存一组电池数据 x时间 y每个电池电压
          batteryList.push(batteryItemList)
          //补充数据
          if (index + 1 < list.length) {
            var time1 = Date.parse(new Date(item.ReceiveTime))
            var item2 = list[index + 1]
            var time2 = Date.parse(new Date(item2.ReceiveTime))
            //补充空白数据 间隔 15分钟
            if (time2 - time1 >= 15 * 60 * 1000) {
              var batteryItemList2 = []
              var batteryItemList3 = []
              for (var j = 0; j < batteryTemp.length; j++) {
                // 补充点
                batteryItemList2.push({
                  pos: j,
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                })
                //补充点
                batteryItemList3.push({
                  pos: j,
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                })
              }
              //补充单体电池空白数据
              batteryList.push(batteryItemList2)
              batteryList.push(batteryItemList3)
            }
          }
        }

        setTimeout(() => {
          this.$refs['bmsSingle'].init(batteryList)
        }, 100)
      },
      setCYL3UI() {
        var list = this.dataListCLY3
        var curList = []
        var tempList = []
        var size = 0
        for (let index = 0; index < list.length; index++) {
          var item = list[index]
          curList.push([
            {
              value: parseFloat(item.Current / 1000).toFixed(3),
              date: item.ReceiveTime,
            },
          ])
          tempList.push([
            {
              value: item.MOSTemperature,
              date: item.ReceiveTime,
            },
            {
              value: item.EnvironmentTemperature,
              date: item.ReceiveTime,
            },
          ])
          var batteryTempList = JSON.parse(item.BatteryTemperatures)
          if (batteryTempList != null && batteryTempList.length > 0) {
            size = batteryTempList.length
            batteryTempList.forEach((item2) => {
              tempList[index].push({
                value: item2.Temperature,
                date: item.ReceiveTime,
              })
            })
          }
          //补充数据
          if (index + 1 < list.length) {
            var time1 = Date.parse(new Date(item.ReceiveTime))
            var item2 = list[index + 1]
            var time2 = Date.parse(new Date(item2.ReceiveTime))
            //补充空白数据 间隔 15分钟
            if (time2 - time1 >= 15 * 60 * 1000) {
              //补充电流空白数据
              curList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              curList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
              //补充电量空白数据
              socList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              socList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
            }
          }
        }
        setTimeout(() => {
          this.$refs['bmsCur'].init(
            curList,
            ['电流'],
            ['#2bcbba'],
            '电池电流',
            '电流/A',
            'A'
          )
          var titleList = ['MOS管温度', '环境温度']
          var colorList = ['#EAB543', '#FD7272']
          for (var i = 0; i < size; i++) {
            titleList.push('电芯温度' + i)
            colorList.push('#FEA47F')
          }
          this.$refs['bmsTemp'].init(
            tempList,
            titleList,
            colorList,
            '电池温度',
            '温度/℃',
            '℃'
          )
        }, 100)
      },
      setCYL4UI() {
        var list = this.dataListCLY4
        var socList = []
        var volList = []
        for (let index = 0; index < list.length; index++) {
          var item = list[index]
          socList.push([
            {
              value: item.SOC,
              date: item.ReceiveTime,
            },
          ])
          volList.push([
            {
              value: parseFloat(item.Voltage / 1000).toFixed(3),
              date: item.ReceiveTime,
            },
          ])
          //补充数据
          if (index + 1 < list.length) {
            var time1 = Date.parse(new Date(item.ReceiveTime))
            var item2 = list[index + 1]
            var time2 = Date.parse(new Date(item2.ReceiveTime))
            //补充空白数据 间隔 15分钟
            if (time2 - time1 >= 15 * 60 * 1000) {
              //补充电压空白数据
              volList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              volList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
              //补充电量空白数据
              socList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              socList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
            }
          }
        }
        setTimeout(() => {
          this.$refs['bmsSoc'].init(
            socList,
            ['电量'],
            ['#A3CB38'],
            '电池电量',
            '电量/%',
            '%'
          )
          this.$refs['bmsVol'].init(
            volList,
            ['电压'],
            ['#686de0'],
            '电池电压',
            '电压/V',
            'V'
          )
        }, 100)
      },
      setFmUI() {
        this.list = this.dataListFM
        //单体电池
        var batteryList = []
        var volList = []
        var socList = []
        var curList = []
        var tempList = []
        //遍历当前数据列表-全部
        for (let index = 0; index < this.list.length; index++) {
          var beforeItem = null
          if (index != 0) {
            beforeItem = this.list[index - 1]
          }
          var item = this.list[index]
          //电压、电流、温度、soc
          var shouldAdd = true
          if (beforeItem != null) {
            if (item.ReceiveTime == beforeItem.ReceiveTime) {
              //不添加
              console.log('不添加', index)
              continue
            }
          }
          if (beforeItem != null) {
            if (
              item.TotalBatteryVoltage == beforeItem.TotalBatteryVoltage &&
              item.Current == beforeItem.Current &&
              item.SOC == beforeItem.SOC &&
              item.EqualizerTemperature == beforeItem.EqualizerTemperature &&
              item.CellTemperature == beforeItem.CellTemperature &&
              item.PowerTubeTemperature == beforeItem.PowerTubeTemperature
            ) {
              //不添加
              shouldAdd = false
            }
          }
          if (shouldAdd) {
            curList.push([
              {
                value: parseFloat(item.Current / 1000).toFixed(3),
                date: item.ReceiveTime,
              },
            ])
            volList.push([
              {
                value: parseFloat(item.TotalBatteryVoltage / 100).toFixed(2),
                date: item.ReceiveTime,
              },
            ])
            socList.push([
              {
                value: item.SOC,
                date: item.ReceiveTime,
              },
            ])
            tempList.push([
              {
                value: item.EqualizerTemperature,
                date: item.ReceiveTime,
              },
              {
                value: item.CellTemperature,
                date: item.ReceiveTime,
              },
              {
                value: item.PowerTubeTemperature,
                date: item.ReceiveTime,
              },
            ])
            //每一串
            var batteryTemp = JSON.parse(item.BatteryVoltages)
            var batteryItemList = []
            //每个时间的电池数组
            batteryTemp.forEach((items, index) => {
              var vol = parseFloat(items.Voltage / 1000).toFixed(3)
              batteryItemList.push({
                pos: index,
                value: vol,
                date: item.ReceiveTime,
              })
            })
            //每一个时间存一组电池数据 x时间 y每个电池电压
            batteryList.push(batteryItemList)
          }

          //以下是判断如果两点间隔大于 15分钟，就补充两个空白时间点，折线图才不会很突兀。
          if (index + 1 < this.list.length) {
            var time1 = Date.parse(new Date(item.ReceiveTime))
            var item2 = this.list[index + 1]
            var time2 = Date.parse(new Date(item2.ReceiveTime))
            //补充空白数据 间隔 15分钟
            if (time2 - time1 >= 15 * 60 * 1000) {
              // console.log('离线########################', time1)
              var batteryItemList2 = []
              var batteryItemList3 = []
              for (var j = 0; j < batteryTemp.length; j++) {
                // 补充点
                batteryItemList2.push({
                  pos: j,
                  value: 0,
                  date: getDateStr(new Date(time1 + 1000)),
                })
                //补充点
                batteryItemList3.push({
                  pos: j,
                  value: 0,
                  date: getDateStr(new Date(time2 - 1000)),
                })
              }
              //补充单体电池空白数据
              batteryList.push(batteryItemList2)
              batteryList.push(batteryItemList3)
              //补充电压空白数据
              volList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              volList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
              //补充电流空白数据
              curList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              curList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
              //补充电量空白数据
              socList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              socList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
              //补充温度空白数据
              tempList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              tempList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
            }
          }
          //结束1次循环
        }

        // console.log(
        //   '#测试#',
        //   batteryList,
        //   batteryList.length,
        //   this.list.length
        // )
        setTimeout(() => {
          this.$refs['logFm'].initLog(this.dataListFM)

          this.$refs['bmsSingle'].init(batteryList)
          this.$refs['bmsVol'].init(
            volList,
            ['电压'],
            ['#686de0'],
            '电池电压',
            '电压/V',
            'V'
          )

          this.$refs['bmsSoc'].init(
            socList,
            ['电量'],
            ['#A3CB38'],
            '电池电量',
            '电量/%',
            '%'
          )
          this.$refs['bmsCur'].init(
            curList,
            ['电流'],
            ['#2bcbba'],
            '电池电流',
            '电流/A',
            'A'
          )
          this.$refs['bmsTemp'].init(
            tempList,
            ['箱内温度', '电池温度', '功率管温度'],
            ['#FEA47F', '#EAB543', '#FD7272'],
            '电池温度',
            '温度/℃',
            '℃'
          )
          // console.log('####测试', this.$refs['bmsSingle'])
        }, 100)
        // this.$refs['logFm'].initLog(this.dataListFM)
      },
      setMyUI() {
        this.list = this.dataListMY
        //单体电池
        var batteryList = []
        var volList = []
        var socList = []
        var curList = []
        var tempList = []
        //遍历当前数据列表-全部
        for (let index = 0; index < this.list.length; index++) {
          var item = this.list[index]
          //电压、电流、温度、soc
          volList.push([
            {
              value: (item.TotalBatteryVoltage * 0.1).toFixed(1),
              date: item.ReceiveTime,
            },
          ])
          curList.push([
            {
              value: item.TotalBatteryA.toFixed(1),
              date: item.ReceiveTime,
            },
          ])
          socList.push([
            {
              value: item.SOC,
              date: item.ReceiveTime,
            },
          ])
          tempList.push([
            {
              value: item.BMSTemperature,
              date: item.ReceiveTime,
            },
            {
              value: item.EnvironmentTemperature,
              date: item.ReceiveTime,
            },
          ])

          //每一串
          var batteryTemp = JSON.parse(item.BatteryVoltages)
          var batteryNum = item.TotalCOM
          if (batteryNum >= 21) {
            batteryTemp.push({
              No: 21,
              Voltage: item.BatteryVoltage21,
            })
          }
          if (batteryNum >= 22) {
            batteryTemp.push({
              No: 22,
              Voltage: item.BatteryVoltage22,
            })
          }
          if (batteryNum >= 23) {
            batteryTemp.push({
              No: 23,
              Voltage: item.BatteryVoltage23,
            })
          }
          if (batteryNum >= 24) {
            batteryTemp.push({
              No: 24,
              Voltage: item.BatteryVoltage24,
            })
          }
          var batteryItemList = []
          //每个时间的电池数组
          batteryTemp.forEach((items, index) => {
            var vol = parseFloat(items.Voltage / 1000).toFixed(3)
            batteryItemList.push({
              pos: index,
              value: vol,
              date: item.ReceiveTime,
            })
          })
          //每一个时间存一组电池数据 x时间 y每个电池电压
          batteryList.push(batteryItemList)
          //以下是判断如果两点间隔大于 15分钟，就补充两个空白时间点，折线图才不会很突兀。
          if (index + 1 < this.list.length) {
            var time1 = Date.parse(new Date(item.ReceiveTime))
            var item2 = this.list[index + 1]
            var time2 = Date.parse(new Date(item2.ReceiveTime))

            // console.log(
            //   '时间间隔',
            //   time2 - time1,
            //   index,
            //   getDateStr(new Date(item.ReceiveTime))
            // )
            //补充空白数据 间隔 15分钟
            if (time2 - time1 >= 15 * 60 * 1000) {
              // console.log('离线########################', time1)
              var batteryItemList2 = []
              var batteryItemList3 = []
              for (var j = 0; j < batteryTemp.length; j++) {
                // 补充点
                batteryItemList2.push({
                  pos: j,
                  value: 0,
                  date: getDateStr(new Date(time1 + 1000)),
                })
                //补充点
                batteryItemList3.push({
                  pos: j,
                  value: 0,
                  date: getDateStr(new Date(time2 - 1000)),
                })
              }
              //补充单体电池空白数据
              batteryList.push(batteryItemList2)
              batteryList.push(batteryItemList3)
              //补充电压空白数据
              volList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              volList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
              //补充电流空白数据
              curList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              curList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
              //补充电量空白数据
              socList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              socList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
              //补充温度空白数据
              tempList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              tempList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
            }
          }
          //结束1次循环
        }
        // console.log(
        //   '#测试#',
        //   batteryList,
        //   batteryList.length,
        //   this.list.length
        // )
        setTimeout(() => {
          this.$refs['bmsSingle'].init(batteryList)
          this.$refs['bmsVol'].init(
            volList,
            ['电压'],
            ['#686de0'],
            '电池电压',
            '电压/V',
            'V'
          )

          this.$refs['bmsSoc'].init(
            socList,
            ['电量'],
            ['#A3CB38'],
            '电池电量',
            '电量/%',
            '%'
          )
          this.$refs['bmsCur'].init(
            curList,
            ['电流'],
            ['#2bcbba'],
            '电池电流',
            '电流/A',
            'A'
          )
          this.$refs['bmsTemp'].init(
            tempList,
            ['MOS温度', '环境温度'],
            ['#FEA47F', '#EAB543'],
            '电池温度',
            '温度/℃',
            '℃'
          )
        }, 100)
      },
      setMtUI() {
        this.list = this.dataListMT
        //单体电池
        var batteryList = []
        var volList = []
        var socList = []
        var curList = []
        var tempList = []
        //遍历当前数据列表-全部
        for (let index = 0; index < this.list.length; index++) {
          var item = this.list[index]
          //电压、电流、温度、soc
          volList.push([
            {
              value: parseFloat(item.TotalBatteryVoltage / 100).toFixed(2),
              date: item.ReceiveTime,
            },
          ])
          curList.push([
            {
              value: (item.ChargeA * 0.001).toFixed(3),
              date: item.ReceiveTime,
            },
            {
              value: (item.DischargeA * 0.001).toFixed(3),
              date: item.ReceiveTime,
            },
          ])
          socList.push([
            {
              value: item.SOC,
              date: item.ReceiveTime,
            },
          ])
          tempList.push([
            {
              value: item.MOS1Temperature,
              date: item.ReceiveTime,
            },
            {
              value: item.MOS2Temperature,
              date: item.ReceiveTime,
            },
            {
              value: item.ProtectionTemperature,
              date: item.ReceiveTime,
            },
          ])

          //每一串
          var batteryTemp = JSON.parse(item.BatteryVoltages)
          var batteryItemList = []
          //每个时间的电池数组
          batteryTemp.forEach((items, index) => {
            var vol = parseFloat(items.Voltage / 1000).toFixed(3)
            batteryItemList.push({
              pos: index,
              value: vol,
              date: item.ReceiveTime,
            })
          })
          //每一个时间存一组电池数据 x时间 y每个电池电压
          batteryList.push(batteryItemList)
          //以下是判断如果两点间隔大于 15分钟，就补充两个空白时间点，折线图才不会很突兀。
          if (index + 1 < this.list.length) {
            var time1 = Date.parse(new Date(item.ReceiveTime))
            var item2 = this.list[index + 1]
            var time2 = Date.parse(new Date(item2.ReceiveTime))

            //补充空白数据 间隔 15分钟
            if (time2 - time1 >= 15 * 60 * 1000) {
              // console.log('离线########################', time1)
              var batteryItemList2 = []
              var batteryItemList3 = []
              for (var j = 0; j < batteryTemp.length; j++) {
                // 补充点
                batteryItemList2.push({
                  pos: j,
                  value: 0,
                  date: getDateStr(new Date(time1 + 1000)),
                })
                //补充点
                batteryItemList3.push({
                  pos: j,
                  value: 0,
                  date: getDateStr(new Date(time2 - 1000)),
                })
              }
              //补充单体电池空白数据
              batteryList.push(batteryItemList2)
              batteryList.push(batteryItemList3)
              //补充电压空白数据
              volList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              volList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
              //补充电流空白数据
              curList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              curList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
              //补充电量空白数据
              socList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              socList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
              //补充温度空白数据
              tempList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
                {
                  value: 0,
                  date: getDateStr(new Date(time1 + 60 * 1000)),
                },
              ])
              tempList.push([
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
                {
                  value: 0,
                  date: getDateStr(new Date(time2 - 60 * 1000)),
                },
              ])
            }
          }
          //结束1次循环
        }
        // console.log(
        //   '#测试#',
        //   batteryList,
        //   batteryList.length,
        //   this.list.length
        // )
        setTimeout(() => {
          this.$refs['bmsSingle'].init(batteryList)
          this.$refs['bmsVol'].init(
            volList,
            ['电压'],
            ['#686de0'],
            '电池电压',
            '电压/V',
            'V'
          )

          this.$refs['bmsSoc'].init(
            socList,
            ['电量'],
            ['#A3CB38'],
            '电池电量',
            '电量/%',
            '%'
          )
          this.$refs['bmsCur'].init(
            curList,
            ['充电电流', '放电电流'],
            ['#514EE6', '#6F8FF2'],
            '电流',
            '电流/A',
            'A'
          )
          this.$refs['bmsTemp'].init(
            tempList,
            ['箱内温度', '电池温度', '功率管温度'],
            ['#FEA47F', '#EAB543', '#FD7272'],
            '电池温度',
            '温度/℃',
            '℃'
          )
        }, 100)
      },
      //异步获取数据-网络请求
      async fetchData() {
        // if (true) {
        //   this.getBmsHis(this.queryForm.key)
        //   return
        // }

        const { response } = await getEquipList(this.queryForm)
        this.equipList = response.DeviceList.data
        if (this.equipList.length > 0) {
          var item = this.equipList[0]
          var BMSType = item.BMSType
          var SN = item.Code
          if (BMSType == null) {
            this.$baseMessage('该型号无电池信息', 'error')
            this.isBms = false
            this.bmsType = ''
            return
          }
          var ptid = ''
          this.bmsType = BMSType
          this.hasDate = false
          this.dataListFM = []
          this.dataListMT = []
          this.dataListMY = []
          this.dataListCLY2 = []
          this.dataListCLY3 = []
          this.dataListCLY4 = []
          switch (BMSType) {
            case 227: {
              ptid = 6
              this.getBmsHis(this.queryForm.key, 227, 6, true)
              break
            }
            case 235: {
              ptid = 2
              this.getBmsHis(this.queryForm.key, 235, 2, true)
              this.getBmsHis(this.queryForm.key, 235, 3, true)
              this.getBmsHis(this.queryForm.key, 235, 4, true)
              break
            }
            case 254: {
              ptid = 225
              this.getBmsHis(this.queryForm.key, 254, 225, true)
              break
            }
            case 234: {
              ptid = 234
              this.getBmsHis(this.queryForm.key, 234, 66, true)
              break
            }
          }
          if (ptid == '') {
            this.$baseMessage('未匹配该电池型号', 'error')
            return
          }
        } else {
          this.$baseMessage('未匹配到设备号', 'error')
        }
      },
    },
  }
</script>
