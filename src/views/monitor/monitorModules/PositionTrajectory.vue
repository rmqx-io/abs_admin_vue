<template>
  <div>
    <el-card>
      <el-row :gutter="48">
        <el-col :md="12" :sm="6">
          <div style="display: flex;">
            <span style="font-size: 18px; font-weight: bold;">电池编号：{{deviceId}}</span>
            <a-radio-group v-model="rdiaoValue" @change="onChange" style="margin-left: 20px;">
              <a-radio-button value="a">
                位置
              </a-radio-button>
              <a-radio-button value="b">
                轨迹
              </a-radio-button>
            </a-radio-group>
            <a-button type="primary" style="margin-left: 10px;" @click="sendCommand">下发指令</a-button>
          </div>
        </el-col>
        <el-col :md="12" :sm="6">
          <template v-for="item in Tags">
            <a-tag :color="item === 'loser' ? 'volcano' : item.length < 5 ? 'red' : 'green'">{{item}}</a-tag>
          </template>
        </el-col>
      </el-row>
      <div v-if="openPosition" class="myclass" style="margin-bottom: 20px;">
        <div class="block">
          <el-date-picker v-model="selectDate" type="datetimerange" start-placeholder="开始日期" end-placeholder="结束日期"
            :default-time="['12:00:00']">
          </el-date-picker>
        </div>
        <div class="mystyle">
          <a-button type="primary" @click="handStart" size="small">轨迹开始</a-button>
          <a-button v-if="buttonStart" :type="buttonType" @click="toggleButton"
            size="small">{{buttonText}}：{{sliderValue}}/{{max}}</a-button>
          <a-button v-if="buttonStart" type="primary" size="small">查看原始数据</a-button>
        </div>
        <a-checkbox @change="onChange" style="margin-left: 15px;">
          只显示GSP
        </a-checkbox>
      </div>
      <div v-if="buttonStart" class="myclass">
        <div>
          <template v-for="item in Tags2">
            <a-tag color="green">{{item}}</a-tag>
          </template>
        </div>
        <div class="myclass" style=" margin-left: 20px;">
          <a-button icon="minus" size="small" @click="decrease"></a-button>
          <el-slider v-model="sliderValue" :min="min" :max="max" style="width: 700px; margin: 0 20px;"></el-slider>
          <a-button type="primary" icon="plus" size="small" @click="increase"></a-button>
        </div>
      </div>
      <!-- <el-row :gutter="24"> -->
      <!-- <el-col :span="17"> -->
      <div style="display: flex; align-items: center;margin-top: 20px">
        <div style='height: 400px; width: 900px; '>
          <device-map />
        </div>
        <!-- </el-col> -->
        <!-- <el-col :span="7"> -->
        <div style="width: 250px;">
          <a-table v-if="buttonStart" :columns="columns" :data-source="data" :scroll="{ y: 350,x: 'max-content'}"
            :bordered="true" :pagination="false">
            <span slot="updateTime" slot-scope="updateTime">
              <a-tag v-for="up in updateTime" :key="up"
                :color="up === 'loser' ? 'volcano' : up.length < 5 ? 'geekblue' : 'green'">
                {{ up.toUpperCase() }}
              </a-tag>
            </span>
            <span slot="statu" slot-scope="statu">
              <a-tag v-for="s in statu" :key="s"
                :color="s === 'loser' ? 'volcano' : s.length < 5 ? 'geekblue' : 'green'">
                {{ s.toUpperCase() }}
              </a-tag>
            </span>
            <span slot="signal" slot-scope="signal">
              <a-tag v-for="s in signal" :key="s"
                :color="s === 'loser' ? 'volcano' : s.length < 5 ? 'geekblue' : 'green'">
                {{ s.toUpperCase() }}
              </a-tag>
            </span>
          </a-table>
        </div>
      </div>
    </el-card>
    <send-command-form style="z-index: 10000;" ref="sendCommandModal" :visible="send_command_form_visible"
      :model="send_command_form_data" :device-ids="device_ids" @cancel="handleSendCommandFormCancel"
      @ok="handleSendCommandFormOk" />
  </div>
</template>

<script>
  import DeviceMap from '@/views/list/components/DeviceMap'
  import SendCommandForm from '@/views/list/modules/SendCommandForm'

  const columns = [{
      title: '位置',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center'
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      scopedSlots: {
        customRender: 'updateTime'
      },
      width: 100,
      align: 'center'
    },
    {
      title: '状态',
      dataIndex: 'statu',
      key: 'statu',
      scopedSlots: {
        customRender: 'statu'
      },
      width: 150,
      align: 'center'
    },
    {
      title: '信号',
      dataIndex: 'signal',
      key: 'signal',
      scopedSlots: {
        customRender: 'signal'
      },
      width: 80,
      align: 'center'
    },
    {
      title: 'GPS电压',
      dataIndex: 'voltage',
      key: 'voltage',
      scopedSlots: {
        customRender: 'voltage'
      },
      width: 80,
      align: 'center'
    }
  ];

  const data = [];
  for (let i = 0; i < 270; i++) {
    data.push({
      key: i,
      index: i,
      updateTime: ['00:01:17', '0km/h', '3534.6km'],
      statu: ['ACC关', '油电关', 'lon:104.018516317064', 'lat:30.6746226449065'],
      signal: ['GPS:0', 'GSM:27'],
      voltage: '66.94V'
    })
  }


  export default {
    components: {
      DeviceMap,
      SendCommandForm
    },
    props: {
      deviceId: {
        type: String,
        default: 'default device id'
      }
    },
    data() {
      return {
        send_command_form_data: null,
        send_command_form_visible: false,
        columns,
        data,
        device_ids: [],
        rdiaoValue: '',
        Tags: ['速度:0km/h', 'gps.mill:3578.4km', 'GPS电压:66.85V', 'ACC关', '油电关', 'GPS定位 : 2024-05-14 14:05:32'],
        Tags2: ['2024-05-14 00:46:24', 'list.acc1', '29.7km/h'],
        openPosition: false,
        selectDate: '',
        isPaused: true,
        buttonType: 'danger', // 红色，对应“暂停”状态  
        buttonText: '暂停', // 默认文本
        number: '223',
        buttonStart: false,
        customColor: '#1890FF',
        min: 0,
        max: 223,
        sliderValue: 0
      }
    },
    methods: {
      onChange() {
        if (this.rdiaoValue === 'a') {
          this.openPosition = true;
        } else {
          this.openPosition = false;
        }
      },
      handStart() {
        this.buttonStart = true;
      },
      toggleButton() {
        this.isPaused = !this.isPaused; // 切换状态  
        this.buttonType = this.isPaused ? 'danger' : 'primary'; // 根据状态更改按钮类型（颜色）  
        this.buttonText = this.isPaused ? '暂停' : '继续'; // 根据状态更改按钮文本
      },
      increase() {
        this.sliderValue += 1;
        if (this.percentage > this.max) {
          this.percentage = this.max;
        }
      },
      decrease() {
        this.sliderValue -= 1;
        if (this.percentage < 0) {
          this.percentage = 0;
        }
      },
      sendCommand() {
        this.device_ids.push({
          deviceId: this.deviceId
        })
        console.log('send command batch')
        this.send_command_form_visible = true
      },
      handleSendCommandFormCancel() {
        this.send_command_form_visible = false
        this.device_ids = []
      },
      handleSendCommandFormOk(id) {
        console.log('handleSendCommandFormOk', id)
        this.send_command_form_visible = false
        this.device_ids = []
        // this.currentBatchSendCommandId = id
        // this.showBatchCommandManagerDevices = true
      },
    },
  }
</script>
<style>
  .ant-modal-wrap {
    z-index: 99999 !important;
  }
</style>
<style>
  .mystyle>button {
    margin-left: 15px;
    font-size: 12px;
    border-radius: 4px;
  }

  .myclass {
    display: flex;
    align-items: center;
  }

  .el-slider__bar {
    background-color: #1890FF;
  }

  .el-slider__button {
    border: 3px solid #1890FF;
  }
</style>