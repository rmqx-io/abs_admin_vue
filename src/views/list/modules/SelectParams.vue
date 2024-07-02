<template>
  <a-modal :footer="null" title="生产测试" width="90%" :visible="visible" :confirmLoading="loading"
    :class="{ 'custom-modal-height': true }" @cancel="() => { $emit('cancel') }">
    <!-- dataSource：{{dataSource}} -->
    <a-spin :spinning="loading">
      <a-table rowKey="ce" :dataSource="dataSource" :columns="columns">
        <template slot="action" slot-scope="text, record, index">
          <span @click="delDeviceId(record)" style="color: #40A9FF; cursor: pointer;">删除</span>
        </template>
      </a-table>
    </a-spin>
    <el-button type="primary" style="background-color: #40A9FF; border: #40A9FF;" @click="AddDevice">添加设备<i
        :class="AddDeviceIamge"></i></el-button>
    <el-form v-show="SendInstrucetionStatus">
      <!-- textarea：{{textarea}}<br> devicelist：{{devicelist}} -->
      <el-form-item>设备编号：</el-form-item>
      <el-form-item>
        <el-input type="textarea" :rows="4" placeholder="输入设备编号
  一行一个编号" v-model="textarea">
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" style="background-color: #40A9FF; border: #40A9FF;"
          @click="AddDeviceList">添加</el-button>
        <el-button type="primary" style="background-color: #40A9FF; border: #40A9FF;"
          @click="ClearDeviceList">清空</el-button>
        <el-button type="primary" style="background-color: #40A9FF; border: #40A9FF;" @click="initBMSUI1">查询</el-button>
      </el-form-item>
      <!-- bmsParamInfo:{{bmsParamInfo}} -->
    </el-form>

    <a-table :rowKey="(record, index) => { return index }" :loading="isLoading" :scroll="{ x: 'max-content' ,y:340}"
      :dataSource="InstructionsDataSource" :columns="InstructionsColumns">
      <span slot="bms_status" slot-scope="text">
        <a-tag :color="text == '在线' ? 'green':'red'">
          {{text}}
        </a-tag>
      </span>
      <span slot="satellites" slot-scope="text">
        <a-tag :color="text > 0 ? 'green':'red'">
          {{text}}
        </a-tag>
      </span>
    </a-table>

  </a-modal>
</template>

<script>
  import ChartBmsMore from '@/views/history/bms_history/components/ChartBmsMore.vue'
  // import BmsInfoCharts from '@/views/list/components/BmsInfoCharts'
  import {
    getBatteryInfo,
    getBatteryInfoLatest,
    getBmsType,
    getBmsTypeInt,
    sendFmBmsCommand,
    refreshOnlineStatus,
    getDeviceList
  } from '@/api/manage'
  import moment from 'moment/moment'
  export default {
    components: {},
    props: {
      visible: {
        type: Boolean,
        required: true
      },
      loading: {
        type: Boolean,
        default: () => false
      },

    },
    data() {
      return {
        devicelist: [],
        bmsList: [],
        bms_type: '',
        textarea: "",
        bmsParamInfo: {
          alias: '',
          bms_bt: '',
          bms_soc: '',
          bms_soh: '',
          h_ver: '',
          organization_name: '',
          satellites: '',
          signal: '',
          location_time: '',
          last_communication_time: '',
          update_time: ''
        },
        // 查看参数控制
        SendInstrucetion: false,
        isLoading: false,
        SendInstrucetionStatus: false,
        AddDeviceIamge: 'el-icon-caret-bottom',
        confirmLoading: false,
        bms_status: null,
        pageSize: 20,
        current: 4,
        queryData: {
          device_id: null,
          account: null,
          name: null,
          page_no: 1,
          page_size: 5,
          start_date: moment(new Date() - 2 * 60 * 60 * 1000),
          start_time: moment(new Date() - 2 * 60 * 60 * 1000),
          organization_id: null,
          bt_code: null,
          iccid: null,
          soh: null,
          soc: null,
          alarm: null
        },
        InstructionsDataSource: [],
        dataSource: [],
        // {
        //           id: 1
        //         }, {
        //           id: 2
        //         }
        columns: [{
            title: '设备ID',
            dataIndex: 'deviceId',
            key: 'deviceId',
          },
          {
            title: '操作',
            key: 'action',
            width: 100,
            scopedSlots: {
              customRender: 'action'
            },
          },
        ],
        InstructionsColumns: [{
          title: '设备号',
          dataIndex: 'alias',
          key: 'alias',
          width: 100
        }, {
          title: '网络状态',
          dataIndex: 'bms_status',
          align: 'center',
          key: 'bms_status',
          width: 50,
          scopedSlots: {
            customRender: 'bms_status'
          },
        }, {
          title: 'ACC状态',
          dataIndex: 'acc_status',
          align: 'center',
          key: 'acc_status',
          width: 50
        }, {
          title: 'BT码',
          dataIndex: 'bms_bt',
          key: 'bms_bt',
          width: 100
        }, {
          title: '最近活动时间',
          dataIndex: 'last_communication_time',
          key: 'last_communication_time',
          width: 150
        }, {
          title: '卫星数',
          dataIndex: 'satellites',
          key: 'satellites',
          width: 50,
          align: 'center',
          scopedSlots: {
            customRender: 'satellites'
          },
        }, {
          title: '网络信号强度',
          dataIndex: 'signal',
          align: 'center',
          key: 'signal',
          width: 50
        }, {
          title: 'GPS定位时间',
          dataIndex: 'location_time',
          key: 'location_time',
          width: 150
        }, {
          title: 'SOC/SOH',
          dataIndex: 'bms_soc',
          align: 'center',
          key: 'bms_soc',
          width: 100
        }, {
          title: 'bms数据更新时间',
          dataIndex: 'update_time',
          key: 'update_time',
          width: 150
        }, {
          title: '硬件版本',
          dataIndex: 'h_ver',
          key: 'h_ver',
          width: 150
        }, {
          title: '组织信息',
          dataIndex: 'organization_name',
          key: 'organization_name',
          width: 100
        }],
      }
    },
    watch: {
      // textarea(newVal, oldVal) {
      //   // 这里可以处理 textarea 数据的变化  
      //   console.log('textarea changed from', oldVal, 'to', newVal);
      // }
    },
    created() {

    },
    methods: {
      initBMSUI1() {
        this.InstructionsDataSource = []

        this.dataSource.forEach(async (item, ix) => {
          this.initBMSUI(item)
        })
      },
      async initBMSUI(item) {
        this.isLoading = true
        let temId = item.deviceId
        let bms_type = null
        let receive_time = null
        let acc_status = null
        let soc = 0
        try {
          let temRes1 = await getBmsType(temId)
          if (temRes1.code === "SUCCESS") {
            bms_type = temRes1.data.bms_type
          } else {
            console.error('获取BMS类型失败，状态码：', temRes1.status);
            // 可以设置bms_type为一个默认值或者null  
            bms_type = null; // 或者其他默认值 
          }
        } catch (e) {
          // 处理任何在await调用中抛出的错误  
          console.log('获取BMS类型时发生错误：', e);
          bms_type = null; // 或者其他默认值  

          acc_status = 0
          console.log("heihei", acc_status);
        }
        if (bms_type != null) {

          try {
            let temRes2 = await getBatteryInfoLatest(temId, bms_type);
            if (!(temRes2.data && temRes2.data.vehicle_detail_vo)) {
              console.log("数据没有！");
            }
            if (temRes2.data.logs && temRes2.data.logs.length > 0) {
              var logItem = temRes2.data.logs[0];
              if (logItem) {
                soc = logItem.battery_capacity_soc
                // console.log("soc 1", soc);
              }
            }
            receive_time = moment(temRes2.data.vehicle_detail_vo.receive_time).format('YYYY-MM-DD HH:mm:ss');
            // console.log("kkk", receive_time);
            acc_status = temRes2.data.vehicle_detail_vo.status;
            console.log("acc_status 1", acc_status);
          } catch (error) {
            // 捕获getBatteryInfoLatest抛出的任何错误  
            console.error('获取电池信息时发生错误：', error);
          }
        }


        let temRes3 = await refreshOnlineStatus(temId, bms_type)
        let bms_status = temRes3.data ? "在线" : "离线"



        let temRes4 = await getDeviceList(
          Object.assign((this.queryData, {
            device_id: temId,
            device_status: "total",
            location_only: false
          })))
        let bmsParamInfo = temRes4.data.records
        bmsParamInfo.forEach(item => {
          console.log("acc_status 2", item);
          if (bms_type == null) {
            soc = item.bms_soc != null ? item.bms_soc / 50 : '0'
            // console.log("soc 2", soc);
          }
          let soh = item.bms_soh != null ? item.bms_soh : '_'
          let last_communication_time = moment(item.last_communication_time).format(
            'YYYY-MM-DD HH:mm:ss');
          let location_time = moment(item.location_time).format(
            'YYYY-MM-DD HH:mm:ss');
          if (last_communication_time == 'Invalid date') {
            last_communication_time = ''
          }
          if (location_time == 'Invalid date') {
            location_time = ''
          }
          Object.assign(item, {
            bms_status: bms_status,
            update_time: receive_time,
            last_communication_time: last_communication_time,
            location_time: location_time,
            acc_status: acc_status == 0 ? '静止' : '运动',
            bms_soc: `${soc}%/${soh}`
          })
        })
        this.InstructionsDataSource.push(...bmsParamInfo)
        this.isLoading = false
        return




        return new Promise((res_my) => {

          const arg = Object.assign(this.queryData)
          arg.device_id = this.dataSource[ix].deviceId
          arg.device_status = "total"
          arg.location_only = false


          const argtime = {
            start_date: moment(new Date() - 2 * 60 * 60 * 1000),
            start_time: moment(new Date() - 2 * 60 * 60 * 1000)
          }



          /**
           * 查询修改时间
           */

          getBmsType(arg.device_id).then(res => {
            console.log('bms type', res.data.bms_type)
            const bms_type = res.data.bms_type


            console.log("kkkk")
            console.log(ix)
            console.log(arg.device_id)
            getBatteryInfoLatest(arg.device_id, res.data.bms_type, {})
              .then(res => {
                console.log('battery info latest', res)
                if (res.data && res.data.vehicle_detail_vo) {
                  this.receive_time = moment(res.data.vehicle_detail_vo.receive_time).format(
                    'YYYY-MM-DD HH:mm:ss')
                  this.acc_status = res.data.vehicle_detail_vo.status


                  /**
                   * 网络状态的接口
                   */
                  refreshOnlineStatus(arg.device_id).then(res => {
                    console.log(res)
                    if (res.data) {
                      this.bms_status = '在线'
                    } else {
                      this.bms_status = '离线'
                    }


                    /**
                     * 查询设备基本的参数
                     */
                    getDeviceList(arg).then(res => {
                      this.bmsParamInfo = res.data.records


                      this.bmsParamInfo.forEach(item => {
                        Object.assign(item, {
                          bms_status: this.bms_status,
                          update_time: this.receive_time,
                          acc_status: item.acc_status == 0 ? '静止' : '运动',
                          bms_soc: `${item.bms_soc}%/${item.bms_soh}`

                        })
                      })
                      console.log("=======")
                      console.log(this.bmsParamInfo)
                      console.log(this.receive_time);
                      console.log(this.bms_status)
                      this.InstructionsDataSource.push(...this.bmsParamInfo)

                      res_my("ok")
                    })


                  }).catch(err => {
                    console.log('refresh online status', err)
                    this.$message.error(err.data.message)
                  })






                }
              }).catch(err => {
                console.log('battery info latest', err)
              })
          }).catch(err => {
            console.log('bms type', err)
          })

        })

      },
      //这里留着写删除~~~
      delDeviceId({
        id
      }) {
        let temFindCurrent = this.dataSource.findIndex(item => {
          return item.id == id
        })
        this.dataSource.splice(temFindCurrent, 1)
      },

      //添加
      AddDeviceList() {
        this.devicelist = this.textarea.split('\n');

        let uniqueDeviceIds = this.devicelist
          .map(deviceId => {
            // 查找分号的位置  
            const semicolonIndex = deviceId.indexOf(';'); // 注意这里使用的是全角分号 '；' 而不是半角分号 ';'  

            // 如果没有找到分号或者分号前的部分不是数字，则保持原样  
            if (semicolonIndex === -1 || !/^\d+$/.test(deviceId.substring(0, semicolonIndex))) {
              return deviceId;
            }

            // 截取分号前的部分  
            const partBeforeSemicolon = deviceId.substring(0, semicolonIndex);

            // 如果截取的部分长度大于或等于12，则取最后12位数字，否则取全部数字  
            return partBeforeSemicolon.length >= 12 && /^\d+$/.test(partBeforeSemicolon) ?
              partBeforeSemicolon.substring(partBeforeSemicolon.length - 12) :
              partBeforeSemicolon;
          })
          .filter(deviceId => /^\d{12}$/.test(deviceId) && !this.dataSource.some(item => item.deviceId === deviceId));

        let newDevices = uniqueDeviceIds.map(deviceId => ({
          deviceId
        }));

        // 合并新旧数据源    
        this.dataSource = this.dataSource.concat(newDevices);
      },
      //添加设备按钮
      AddDevice() {
        this.SendInstrucetionStatus = !this.SendInstrucetionStatus
        if (this.SendInstrucetionStatus == true) {
          this.AddDeviceIamge = 'el-icon-caret-top'
        } else {
          this.AddDeviceIamge = 'el-icon-caret-bottom'
        }
      },
      ClearDeviceList() {
        this.textarea = ''
        this.dataSource = []
        this.InstructionsDataSource = []
      },


      onShowSizeChange(current, pageSize) {
        console.log(current, pageSize);
      },
      test() {
        this.$emit("showChild")
      },
      // 点击关闭回调---指令
      tableFunCan() {
        this.SendInstrucetion = false
      }
    }
  }
</script>

<style>
  .custom-modal-height .ant-modal-content {
    height: 600px;
    /* 设置你想要的高度 */
    overflow-y: auto;
    /* 当内容超出高度时显示滚动条 */
  }
</style>