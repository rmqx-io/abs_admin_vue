<template>
  <div style=" background-color: #fff; padding: 20px 10px;">
    <el-form v-show="showMonitor">
      <el-row :gutter="24">
        <el-col :span="6">
          <el-card>
            <template>
              <a-radio-group default-value="a" button-style="solid">
                <a-radio-button value="a">
                  全部(154501)
                </a-radio-button>
                <a-radio-button value="b">
                  在线(69048)
                </a-radio-button>
                <a-radio-button value="c">
                  离线(61411)
                </a-radio-button>
                <a-radio-button value="d">
                  待机(24042)
                </a-radio-button>
              </a-radio-group>
            </template>
            <div style="margin: 20px 0;">
              组搜索：<a-input v-model="keyword" style="width: 180px;" placeholder="输入关键字过滤搜索"></a-input>
            </div>
            <span>
              当前组织：{{SelectionLabel}}
            </span>
            <template><br>
              <a-checkbox style="margin: 20px 0;" @change="onChange">
                显示子组织
              </a-checkbox>
            </template>
            <template>
              <el-tree class="filter-tree" :data="data" default-expand-all :filter-node-method="filterNode" ref="tree"
                node-key="id" :draggable="false" :props="defaultProps" style="height: 400px; overflow: auto;"
                @node-click="Selection">
              </el-tree>
            </template>
          </el-card>
        </el-col>
        <el-col :span="18">
          <el-card>
            <template>
              <a-tag color="green">
                空闲：{{free}}
              </a-tag>
              <a-tag color="green">
                租赁：{{lease}}
              </a-tag>
              <a-tag color="orange">
                出售：{{sell}}
              </a-tag>
              <a-checkbox label="到期">到期:566</a-checkbox>
              <a-checkbox label="报警">报警:26</a-checkbox>
              <a-checkbox label="visbie" @click="showTableChange">隐藏列表(地图)</a-checkbox>
            </template>
            <template>
              <el-row :gutter="24" style="margin: 20px 0;">
                <el-col :span="6">
                  <el-input v-model="selectContext" placeholder="输入搜索内容"></el-input>
                </el-col>
                <el-col :span="6">
                  <el-button type="primary" plain>搜索</el-button>
                  <el-button plain @click="clreaSelectContext">清除</el-button>
                </el-col>
                <el-col :span="8" push="5">
                  <el-button plain @click="monitoringDownload">数据监控下载</el-button>
                  <el-button plain @click="bmsDownload">BMS下载</el-button>
                </el-col>
              </el-row>
            </template>
            <template>
              <a-table v-show="showTable" :columns="columns" :data-source="dataSource" :scroll="{ y: 410 }"
                :loading="loading"
                :pagination="{showSizeChanger: true, pageSizeOptions:['50','100','200','500','800','1000','2000','3000','6000','8000','10000'] ,defaultPageSize:50}">
                <a-button slot="selectDevice" slot-scope="selectDevice,text"
                  @click="handleButtonClick(record,text)">{{ selectDevice }}</a-button>
                <span slot="information" slot-scope="information">
                  <a-tag v-for="i in information" :key="i"
                    :color="i === 'loser' ? 'volcano' : i.length > 5 ? 'geekblue' : 'green'">
                    {{ i.toUpperCase() }}
                  </a-tag>
                </span>
                <span slot="deviceInformation" slot-scope="deviceInformation">
                  <a-tag ref="copyTag" v-for="dev in deviceInformation" :key="dev"
                    :color="dev === 'loser' ? 'volcano' : dev.length > 5 ? 'geekblue' : 'green'"
                    @click="copyTagContent">
                    {{ dev.toUpperCase() }}
                  </a-tag>
                </span>
                <span slot="positionInformation" slot-scope="positionInformation">
                  <a-tag v-for="pi in positionInformation" :key="pi"
                    :color="pi === 'loser' ? 'volcano' : pi.length > 5 ? 'geekblue' : 'green'">
                    {{ pi.toUpperCase() }}
                  </a-tag>
                </span>
                <span slot="alert" slot-scope="alert">
                  <a-tag v-for="a in alert" :key="a"
                    :color="a === 'loser' ? 'volcano' : a.length > 5 ? 'geekblue' : 'green'">
                    {{ a.toUpperCase() }}
                  </a-tag>
                </span>
                <a-button slot="action" slot-scope="action,text"
                  @click="handleClick(record,text)">{{ action }}</a-button>
                <!-- deviceInformation -->
              </a-table>
            </template>
            <QRCode :visible="qrcodeShow" @cancel="handleSendCommandFormCancel" :title="qrTitle"></QRCode>
          </el-card>
          <div style='height: 500px; width: 100%; margin-bottom: 20px'>
            <h4>设备地图</h4>
            <device-map />
          </div>
        </el-col>
      </el-row>
    </el-form>
    <el-form v-show="details">
      <el-card style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between;">
          <div>
            <a-button @click="goback" type="primary" icon="left">重新选择</a-button>
            <span style="margin-left: 20px;">编号：{{batteryNnumber}}</span>
          </div>
          <div>
            {{selectedOption}}
            <a-radio-group button-style="solid" v-model="selectedOption">
              <a-radio-button :value="item.value" v-for="item in radio" :label="item.label">
                {{item.label}}
              </a-radio-button>
            </a-radio-group>
          </div>
        </div>
      </el-card>
      <!-- <el-card> -->
      <BasicInformation v-if="selectedOption==='1'" :deviceId="batteryNnumber" :bms-bt='bmsBt'></BasicInformation>
      <PositionTrajectory v-if="selectedOption==='2'" :deviceId="batteryNnumber"></PositionTrajectory>
      <ConfigurationInformation v-if="selectedOption==='3'" :deviceId="batteryNnumber"> </ConfigurationInformation>
      <HistoricalAnalysis v-if="selectedOption==='4'" :deviceId="batteryNnumber"> </HistoricalAnalysis>
      <AlarmRecords v-if="selectedOption==='5'" :deviceNo="batteryNnumber"> </AlarmRecords>
      <InstructionRecording v-if="selectedOption==='6'" :deviceNo="batteryNnumber"> </InstructionRecording>
      <Logging v-if="selectedOption==='7'" :deviceNo="batteryNnumber"> </Logging>
      <!-- </el-card> -->
    </el-form>
  </div>
</template>

<script>
  import DeviceMap from '@/views/list/components/DeviceMap'
  import BasicInformation from './monitorModules/BasicInformation.vue'
  import PositionTrajectory from './monitorModules/PositionTrajectory.vue'
  import ConfigurationInformation from './monitorModules/ConfigurationInformation.vue'
  import HistoricalAnalysis from './monitorModules/HistoricalAnalysis.vue'
  import AlarmRecords from './monitorModules/AlarmRecords.vue'
  import InstructionRecording from './monitorModules/InstructionRecording.vue'
  import Logging from './monitorModules/Logging.vue'
  import QRCode from './monitorModules/QRCode.vue'

  const radio = [{
    label: '基础信息',
    value: '1'
  }, {
    label: '位置轨迹',
    value: '2'
  }, {
    label: '配置信息',
    value: '3'
  }, {
    label: '历史分析',
    value: '4'
  }, {
    label: '报警记录',
    value: '5'
  }, {
    label: '指令记录',
    value: '6'
  }, {
    label: '日志记录',
    value: '7'
  }]

  const columns = [{
      title: '选择设备',
      dataIndex: 'selectDevice',
      width: 100,
      align: 'center', // 设置列内容为水平居中对齐 
      key: 'selectDevice',
      scopedSlots: {
        customRender: 'selectDevice'
      }
    },
    {
      title: '电池编号',
      dataIndex: 'batteryNnumber',
      key: 'batteryNnumber',
    },
    {
      title: '组织信息',
      dataIndex: 'information',
      key: 'information',
      scopedSlots: {
        customRender: 'information'
      }
    },
    {
      title: '设备信息',
      dataIndex: 'deviceInformation',
      key: 'deviceInformation',
      scopedSlots: {
        customRender: 'deviceInformation'
      }
    },
    {
      title: '位置信息',
      key: 'positionInformation',
      dataIndex: 'positionInformation',
      scopedSlots: {
        customRender: 'positionInformation'
      },
    },
    {
      title: '是否报警',
      key: 'alert',
      dataIndex: 'alert',
      scopedSlots: {
        customRender: 'alert'
      },
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      scopedSlots: {
        customRender: 'action'
      },
    },
  ];

  const dataSource = []

  for (let i = 0; i < 1000; i++) {
    dataSource.push({
      selectDevice: "详情",
      batteryNnumber: '05724090129' + i,
      information: ['根节点', '电动车', '电池型号未配置'],
      deviceInformation: ['电池电压53.02V', `ICCID:898604851923700107${i}`, '信号:2024-04-27 17:05:28',
        '版本:g57f.cn.ty.2.1.15-B4.2.13-L01.16'
      ],
      positionInformation: ['信号:24', 'GPS:26', 'GPS定位', 'ACC关', '定位:2024-04-27 17:01:42'],
      alert: ['终端主电源掉电', '震动报警'],
      action: '打开二维码'
    })
  }

  export default {
    components: {
      DeviceMap,
      BasicInformation,
      PositionTrajectory,
      ConfigurationInformation,
      HistoricalAnalysis,
      AlarmRecords,
      InstructionRecording,
      Logging,
      QRCode
    },
    data() {
      return {
        bmsBt: "",
        qrTitle: null,
        qrcodeShow: false,
        //显示表格
        showTable: true,
        //a-radio-group绑定值
        selectedOption: '1',
        //是详情功能页radio的集合
        radio,
        //电池编号
        batteryNnumber: null,
        //详情页面，默认关闭，点击表格第一列的按钮后改为true
        details: false,
        //点击表格第一列的按钮后改为false
        showMonitor: true,
        //表格数据加载
        loading: false,
        //
        device_status: '',
        //选中了当前节点的label(默认根节点)
        SelectionLabel: '根节点',
        //搜索关键字
        keyword: '',
        //搜索内容查询
        selectContext: '',
        //节点数据
        data: [{
          id: 1,
          label: '根节点',
          children: [{
            id: 4,
            label: '测试运营商',
            children: [{
              id: 9,
              label: '三级 1-1-1'
            }, {
              id: 10,
              label: '三级 1-1-2'
            }]
          }, {
            id: 2,
            label: '测试小程序',
            children: [{
              id: 3,
              label: "111"
            }, {
              id: 5,
              label: "222"
            }]
          }, {
            id: 6,
            label: "斯达智能",
            children: [{
              id: 7,
              label: '嘿嘿'
            }, {
              id: 8,
              label: '锂神'
            }]
          }]
        }],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        //空闲
        free: '526836',
        //租赁
        lease: '1426',
        //出售
        sell: '112',
        //表数据源
        dataSource,
        //表数据列
        columns
      };
    },
    watch: {
      keyword(val) {
        this.$refs.tree.filter(val);
      }
    },
    methods: {
      onChange() {},
      showTableChange() {
        this.showTable = !this.showTable
      },
      //复制Tag内容
      copyTagContent() {

      },
      //设备详情按钮
      handleButtonClick(record, text) {
        // console.log(text);
        this.showMonitor = false;
        // console.log(text.batteryNnumber)
        this.batteryNnumber = text.batteryNnumber
        this.details = true;

      },
      filterNode(value, data) {
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
      },
      Selection(data, node, component) {
        // console.log("data：" + data.label);
        this.SelectionLabel = data.label
        if (node.childNodes && node.childNodes.length > 0) {
          // 保持子节点的展开状态  
          node.expanded = true;
        }
      },
      //清除
      clreaSelectContext() {
        this.selectContext = ''
      },
      //监控数据下载方法
      monitoringDownload() {

      },
      //BMS下载方法
      bmsDownload() {

      },
      //打开二维码方法
      handleClick(record, text) {
        // 处理点击事件的逻辑
        this.qrTitle = text.batteryNnumber;
        console.log(text);
        this.qrcodeShow = true;
        // console.log(record);
      },
      handleSendCommandFormCancel() {
        this.qrcodeShow = false
      },
      goback() {
        this.showMonitor = true;
        this.details = false;
      },
    },
  }
</script>

<style>
  .el-tree-node.is-current>.el-tree-node__content {
    background-color: #409EFF;
    /* 选中节点的背景色 */
    color: #fff;
    /* 选中节点的文字颜色 */
  }
</style>