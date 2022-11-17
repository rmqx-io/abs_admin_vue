<template>
  <a-card>
    <div><a @click="handleClose()"><< 返回</a></div>
    <div>
      <br />
    </div>
    <div>
      设备：{{ this.deviceId }}
    </div>
    <div>
      <br />
    </div>
    <el-row type="flex" align="middle" style="padding: 8px">
      <el-col :span="10" type="flex" align="middle">
        <div class="content_bt" style="width: 300px; margin-top: 16px">
          <span
            style="
              font-size: 14px;
              font-weight: bold;
              text-align: left;
              line-height: 200%;
            "
          >
            电池编码：{{ this.batteryBt }}
            <br />
            更新时间：{{ this.mRefreshDate }}
            <el-tag
              :type="this.mCurA == 0 ? 'info' : this.mCurA > 0 ? 'warning' : 'danger'"
            >
              {{ this.mCurA == 0 ? '搁置中' : this.mCurA > 0 ? '充电中' : '放电中' }}
            </el-tag>
          </span>
        </div>
        <el-row>
          <span class="title_tx2">SOC:{{ this.mCurSoc }}%</span>
          <el-image
            style="margin-top: 15px; width: 300px; height: 160px"
            class="img_battery"
            fit="fill"
            :src="require('@/assets/battery/icon_battery_' + this.mSocImg + '.png')"
          />
        </el-row>
        <el-row type="flex" align="middle" style="margin-top: 20px">
          <el-col :span="2" :offset="6" type="flex" align="middle">
            <span
              class="tx_soh"
              :style="
                mSoh < 30
                  ? 'color:#f34d37'
                  : mSoh < 70
                    ? 'color:#F8B34D'
                    : 'color:#47ba80'
              "
            >
              SOH:
            </span>
          </el-col>
          <el-col :span="10" type="flex" align="middle">
            <el-progress
              :text-inside="true"
              :stroke-width="20"
              :percentage="mSoh"
              :color="customColorMethod"
            ></el-progress>
          </el-col>
        </el-row>

        <el-col
          :span="24"
          type="flex"
          align="middle"
          justify="middle"
          style="margin-top: 30px; margin-bottom: 30px"
        >
          <el-descriptions :column="2" border>
            <el-descriptions-item label="充电MOS" span="1">
              <el-switch
                v-model="isMosRec"
                disabled
                active-color="#41b584"
                inactive-color="#f34d37"
              ></el-switch>
            </el-descriptions-item>
            <el-descriptions-item label="放电MOS" span="1">
              <el-switch
                v-model="isMosDis"
                disabled
                active-color="#41b584"
                inactive-color="#f34d37"
              ></el-switch>
            </el-descriptions-item>
            <el-descriptions-item label="当前电流" span="1">
              <el-tag
                size="small"
                :type="mCurA == 0 ? 'info' : mCurA > 0 ? 'warning' : 'danger'"
              >
                {{ mCurA }}A
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="当前电压" span="1">
              <el-tag size="small">{{ mCurV }}V</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="剩余容量" span="1">
              <el-tag size="small">{{ mSurplusCapacity }}ah</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="循环次数" span="1">
              <el-tag size="small">{{ mRecIndex }}次</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-col>

        <el-row type="flex" align="middle" style="padding: 8px">
          <el-col :span="12" type="flex" align="middle">
            <span>放电MOS:</span>
            <el-tag
              size="mini"
              type="danger"
              effect="dark"
              @click="onSendOrderTag('放电MOS关闭')"
            >
              关闭
            </el-tag>
            <el-tag
              size="mini"
              type="success"
              effect="dark"
              @click="onSendOrderTag('放电MOS打开')"
            >
              开启
            </el-tag>
          </el-col>
          <el-col :span="12" type="flex" align="middle">
            <span>充电MOS:</span>
            <el-tag
              size="mini"
              type="danger"
              effect="dark"
              @click="onSendOrderTag('充电MOS关闭')"
            >
              关闭
            </el-tag>
            <el-tag
              size="mini"
              type="success"
              effect="dark"
              @click="onSendOrderTag('充电MOS打开')"
            >
              开启
            </el-tag>
          </el-col>
        </el-row>
        <el-row type="flex" align="middle" style="padding: 8px"></el-row>
      </el-col>

    </el-row>
    <div class="table-page-search-wrapper">
      <a-spin :spinning="bms_loading">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item aria-label="起始日期">
                <a-date-picker v-model="queryData.start_date" style="width: 100%" placeholder="起始日期"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item aria-label="起始时间">
                <a-time-picker v-model="queryData.start_time" style="width: 100%" placeholder="起始时间"/>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item aria-label="结束日期">
                <a-date-picker
                  v-model="queryData.end_date"
                  style="width: 100%"
                  placeholder="结束日期"
                />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item aria-label="结束时间">
                <a-time-picker
                  v-model="queryData.end_time"
                  style="width: 100%"
                  placeholder="结束时间"
                />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-button type="primary" @click="$refs.batteryInfoTable.refresh(true)">查询</a-button>
            </a-col>
          </a-row>
        </a-form>
      </a-spin>
    </div>
    <s-table
      ref="batteryInfoTable"
      size="default"
      rowKey="(record) => record.data.id"
      :columns="columns"
      :data="loadData"
      :alert="true"
      :rowSelection="rowSelection"
      :showPagination="false"
    >
      <span slot='info_id' slot-scope="text, record">
        <template>
          <span>{{ record.id }}</span>
        </template>
      </span>
      <span slot='time_track' slot-scope="text, record">
        <template>
          <span>{{ record.time_tracking }}</span>
        </template>
      </span>
      <span slot='single_battery_voltage' slot-scope="text, record">
        <template>
          <span>{{ record.single_battery_voltage_arr }}</span>
        </template>
      </span>
      <span slot='battery_capacity_soc' slot-scope="text, record">
        <template>
          <span>{{ record.battery_capacity_soc }}</span>
        </template>
      </span>
      <span slot='battery_voltage' slot-scope="text, record">
        <template>
          <span>{{ record.battery_voltage }}</span>
        </template>
      </span>
    </s-table>
  </a-card>
</template>

<script>
import moment from 'moment'
import { getBatteryInfo } from '@/api/manage'
import { STable } from '@/components'

const columns = [
  {
    title: '编号',
    dataIndex: 'id',
    scopedSlots: { customRender: 'info_id' }
  },
  {
    title: '时间',
    dataIndex: 'time_tracking',
    customRender: (value, row, index) => {
      return moment(value).format('YYYY-MM-DD HH:MM:SS')
    }
    // scopedSlots: { customRender: 'time_track' }
  },
  {
    title: '单个电池电压',
    dataIndex: 'single_battery_voltage_arr',
    scopedSlots: { customRender: 'single_battery_voltage' }
  },
  {
    title: '电池容量',
    dataIndex: 'battery_capacity_soc',
    scopedSlots: { customRender: 'battery_capacity_soc' }
  },
  {
    title: '电池电压',
    dataIndex: 'battery_voltage',
    scopedSlots: { customRender: 'battery_voltage' }
  },

  // battery_box_temperature
  // battery_capacity_soc
  // battery_currency
  // battery_healthy
  // battery_temperature
  // battery_voltage
  // bit_status
// power_transistor_temperature
// single_battery_voltage_arr
// time_tracking
// vehicle_id
]

export default {
  name: 'Info',
  components: {
    STable
  },
  props: {
    loading: {
      type: Boolean,
      default: () => false
    },
    deviceId: {
      type: String,
      default: () => null
    },
    data: {
      type: Object,
      default: () => null
    },
    title: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    bordered: {
      type: Boolean,
      default: false
    }
  },
  data () {
    this.columns = columns
    return {
      bms_loading: false,
      queryParam: {},
      queryData: {
        start_date: moment(new Date() - 2 * 60 * 60 * 1000),
        start_time: moment(new Date() - 2 * 60 * 60 * 1000)
      },
      loadData: parameter => {
        this.bms_loading = true
        // let arg = Object.assign(parameter, this.queryData)
        console.log('parameter', parameter)
        let arg = this.queryData
        console.log('loadData request arg:', arg)
        return getBatteryInfo(this.deviceId, arg)
          .then(res => {
            this.bms_loading = false
            return {
              pageSize: 1000,
              pageNo: 0,
              totalCount: 1,
              totalPage: 1,
              data: res.data
            }
          }).catch(err => {
            console.log('load bms data failed', err)
            this.bms_loading = false
          })
      },
      selectedRowKeys: [],
      selectedRows: [],
      mSocImg: 1,
      mCurSoc: 0,
      batteryBt: '',
      mRefreshDate: '',
      mCurA: 0,
      mSoh: 0,
      isMosRec: false,
      isMosDis: false,
      mCurV: 0,
      mSurplusCapacity: 0,
      mRecIndex: 0
    }
  },
  created () {
  },
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    handleClose: function handleCancel (e) {
      this.$emit('cancel', e)
    },
    getBatteryInfo (deviceId) {
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    customColorMethod (percentage) {
      if (percentage < 30) {
        return '#f34d37'
      } else if (percentage < 70) {
        return '#F8B34D'
      } else {
        return '#47ba80'
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "~ant-design-vue/es/style/themes/default.less";

.header-info {
  position: relative;
  text-align: center;
  & > span {
    display: inline-block;
    margin-bottom: 4px;
    color: @text-color-secondary;
    font-size: @font-size-base;
    line-height: 22px;
  }
  & > p {
    margin: 0;
    color: @heading-color;
    font-size: 24px;
    line-height: 32px;
  }
  & > em {
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 56px;
    background-color: @border-color-split;
  }
}
.img_battery {
  height: 120px;
  width: 230px;
  margin-bottom: 8px;
}
.item_battery {
  height: 30px;
  width: 30px;
}
.title_tx2 {
  position: absolute;
  z-index: 1000;
  font-size: 28px;
  width: 290px;
  top: 80px;
  text-align: center;
}
.tx_soh {
  color: #47ba80;
  font-size: 16px;
  font-weight: bold;
}
.content_bt {
  flex-direction: column;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.content_start {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.content_center_dir {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.content_center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.content_between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.det_title {
  font-size: 18px;
  font-weight: bold;
}
.bg-suc-a {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  color: #fff;
  background: #47ba80;
  border-radius: 4px;
}
.bg-suc-t {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  color: #fff;
  background: #47ba80;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.bg-suc-b {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-style: solid;
  border-color: #47ba80;
  text-decoration: none;
}

.bg-fail-a {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  color: #fff;
  background: #f34d37;
  border-radius: 4px;
}
.bg-fail-t {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  color: #fff;
  background: #f34d37;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.bg-fail-b {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-style: solid;
  border-color: #f34d37;
  text-decoration: none;
}
.text-suc {
  color: #47ba80;
}
.text-fail {
  color: #5a5a5a;
}

</style>
