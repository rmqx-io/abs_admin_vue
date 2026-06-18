<template>
  <a-card :bordered="false" :bodyStyle="{ padding: '16px 16px', height: '100%' }" :style="{ height: '100%' }">
    <div class='table-page-search-wrapper'>
      <a-form>
        <a-row :gutter='48'>
          <a-col :span='12'>
            <a-form-item label='时间'>
              <a-range-picker
                v-model='queryData.time'
                @change='handleTimeChange'
                format='YYYY-MM-DD HH:mm:ss'
                showTime
              />
            </a-form-item>
          </a-col>
          <a-col :span='4'>
            <a-form-item label='命令'>
              <a-input
                v-model='queryData.command'
                placeholder='请输入命令 16 进制'
              />
            </a-form-item>
          </a-col>
          <a-col :span='4'>
            <a-form-item label='方向'>
              <a-select
                v-model='queryData.upload'
                @change='handleUploadChange'
                placeholder='请选择方向'
              >
                <a-select-option value=''>全部</a-select-option>
                <a-select-option value='true'>上行</a-select-option>
                <a-select-option value='false'>下行</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span='4'>
            <a-form-item label='编号'>
              <a-input
                v-model='queryData.id'
                placeholder='请输入协议日志编号'
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span='4'>
            <a-button type='primary' @click='handleSearch'>查询</a-button>
          </a-col>
        </a-row>
      </a-form>
      <div>
        <s-table
          ref='packetLogTable'
          :columns='columns'
          rowKey='id'
          :data='loadData'
          showPagination='auto'
          :customRow='rowClick'
          :pageSize=100
        >
          <span slot='time_tracking' slot-scope="text, record">
            <template>
              <span>
                {{ record.time_tracking ? localTime(record.time_tracking) : '' }}
              </span>
            </template>
          </span>
          <span slot='command' slot-scope='text, record'>
            <template>
              {{ record.command ? '0x' + record.command.toString(16).padStart(4, '0') : '' }}
            </template>
          </span>
          <span slot='upload' slot-scope='text, record'>
            <template>
              <span v-if='record.upload'>
                <img width='16' src="../../../assets/icons/upload.png" alt="Upload Image">
                <span>上行</span>
              </span>
              <span v-if='!record.upload'>
                <img width='16' src="../../../assets/icons/download.png" alt="Download Image">
                <span>下行</span>
              </span>
            </template>
          </span>
          <span slot='packet' slot-scope="text, record">
            <template>
              <div class="packet-content">{{ byteArrayToHexArray(record.packet).join(' ') }}</div>
              <div v-if="record.packet_parse" style="margin-top: 8px;">
                <a-collapse :bordered="false" class="packet-collapse">
                  <a-collapse-panel key="1" header="解析结果 (点击折叠)">
                    <div class="packet-parse-summary-list">
                      <div v-for="(item, idx) in record.packet_parse" :key="idx" class="packet-parse-item">
                        <div class="parse-meta-info">
                          <span v-if="item.device_id">设备ID: <strong>{{ item.device_id }}</strong></span>
                          <span v-if="item.data_code" style="margin-left: 12px;">命令代码: <strong>{{ item.data_code }}</strong></span>
                        </div>
                        <pre class="packet-parse-json">{{ formatJson(item.body) }}</pre>
                      </div>
                    </div>
                  </a-collapse-panel>
                </a-collapse>
              </div>
            </template>
          </span>
        </s-table>
        <div class='pagination'>
          <Button :disabled='currentPage === 1' @click='handleFirstPage()' >首页</Button>
    <!--      <Button :disabled='currentPage === 1' @click="handlePreviousPage()">上一页</Button>-->
          <Button :disabled='hasMore === false' @click='handleNextPage()'>下一页</Button>
        </div>
      </div>
      <a-modal
        title="协议解析详情"
        width="70vw"
        :visible="packet_parse_visible"
        @cancel="handlePacketParseCancel"
        @ok="handlePacketParseCancel"
        :footer="null"
        destroyOnClose
      >
        <div class="parse-details-container">
          <div v-for="(item, idx) in packet_parse" :key="idx" class="parse-card-wrapper">
            <a-card :bordered="true" class="parse-main-card">
              <template slot="title">
                <div class="card-title-flex">
                  <span class="device-id-label">设备ID: <strong class="highlight-text">{{ item.device_id || '未知' }}</strong></span>
                  <a-tag color="blue" class="custom-tag">数据类型: {{ item.data_code || '未知' }}</a-tag>
                </div>
              </template>
              <!-- JSON VIEW -->
              <div class="raw-json-dashboard">
                <div class="json-header">解析数据:</div>
                <pre class="json-block">{{ formatJson(item.body) }}</pre>
              </div>

              <!-- Raw Hex Block -->
              <div class="raw-hex-section" style="margin-top: 16px;">
                <div class="hex-title">原始 16 进制报文:</div>
                <div class="hex-body">{{ formatHex(item.packet) }}</div>
              </div>
            </a-card>
          </div>
        </div>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import Button from 'ant-design-vue/lib/button'
import {
  getDevicePacketLog,
  devicePacketParse
} from '@/api/manage'
import moment from 'moment'

export default {
  name: 'ProtocolLog',
  components: {
    STable,
    Ellipsis,
    Button
  },
  props: {
    deviceId: { type: String, default: () => null },
    visible: { type: Boolean, required: true },
    model: { type: Object, default: () => null }
  },
  data () {
    return {
      columns: [
        { title: '编号', dataIndex: 'id' },
        { title: '时间', dataIndex: 'time_tracking', scopedSlots: { customRender: 'time_tracking' } },
        { title: '命令', dataIndex: 'command', scopedSlots: { customRender: 'command' } },
        { title: '方向', dataIndex: 'upload', scopedSlots: { customRender: 'upload' } },
        { title: '内容', dataIndex: 'packet', scopedSlots: { customRender: 'packet' } }
      ],
      cursor: null,
      currentPage: 1,
      hasMore: false,
      queryData: {
        time: [moment.utc().local().subtract(1, 'day'), moment.utc().local()]
      },
      packet_parse: [],
      packet_parse_visible: false
    }
  },
  methods: {
    loadData (parameter) {
      console.log('packet log parameter', parameter)
      console.log('packet log queryData', this.queryData)
      const arg = Object.assign(parameter, this.queryData)
      arg.page_no = arg.pageNo
      arg.page_size = arg.pageSize
      if (this.cursor !== null) {
        console.log('packet log cursor', this.cursor)
        arg.cursor = this.cursor.join(',')
      }
      delete arg.pageNo
      delete arg.pageSize
      return getDevicePacketLog(this.deviceId, arg)
        .then(res => {
          console.log('packet log res', res)
          this.hasMore = res.data.has_more
          this.cursor = res.data.cursor
          return {
            // pageSize: res.data.page_size,
            // pageNo: res.data.page_no,
            // totalCount: res.data.total,
            // total: res.data.total,
            pageSize: 100,
            pageNo: 1,
            totalCount: 10,
            totalPage: 1,
            data: res.data.packets
          }
        })
        .catch(err => {
          console.log('packet log err', err)
          // get the body of the response
          const body = err.response.data
          // show the error message
          this.$message.error(body.msg)
          // stop the loading
          return {
            pageSize: 100,
            pageNo: 1,
            totalCount: 10,
            totalPage: 1,
            data: []
          }
        })
    },
    localTime (time) {
      return moment.utc(time).local().format('YYYY-MM-DD HH:mm:ss')
    },
    byteArrayToHexArray (byteArray) {
      const hexArray = []
      for (let i = 0; i < byteArray.length; i++) {
        const hexValue = byteArray[i].toString(16).padStart(2, '0')
        hexArray.push(hexValue)
      }
      return hexArray
    },
    refresh () {
      if (this.currentPage === 1) {
        this.cursor = null
      }
      this.$refs.packetLogTable.refresh()
    },
    handleFirstPage () {
      console.log('handleFirstPage')
      this.currentPage = 1
      this.cursor = null
      this.refresh()
    },
    handlePreviousPage () {
      console.log('handlePreviousPage')
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    handleNextPage () {
      console.log('handleNextPage')
      this.currentPage++
      this.refresh()
    },
    handleTimeChange (value) {
      console.log('handleTimeChange', this.formatDateString(value[0]), this.formatDateString(value[1]))
      this.queryData.time = value
      // this.refresh()
    },
    handleCommandChange (value) {
      console.log('handleCommandChange', value)
      // this.queryData.command = value
      // this.refresh()
    },
    handleUploadChange (value) {
      console.log('handleUploadChange', value)
      this.queryData.upload = value
      // this.refresh()
    },
    formatDateString (date) {
      if (!date) return ''
      return date.format('YYYY-MM-DD HH:mm:ss')
    },
    validateFields (callback) {
      if (this.queryData.time.length !== 2) {
        this.$message.error('请选择时间范围')
        return false
      }
      return true
    },
    handleSearch () {
      console.log('handleSearch', this.queryData)
      const validated = this.validateFields()
      if (validated) {
        // console.log('Received values of form: ', values)
        // this.queryData = values
        this.refresh()
      }
    },
    handlePacketParseCancel () {
      this.packet_parse_visible = false
    },
    rowClick (record) {
      return {
        on: {
          click: (event) => {
            // Avoid triggering details modal when clicking on collapse panels or tags
            if (event.target.closest('.ant-collapse') || event.target.closest('.ant-tag')) {
              return
            }
            console.log('rowClick packet', record.packet)
            const arg = { packet: '' + record.packet }
            // parse packet
            devicePacketParse(arg).then(res => {
              console.log('rowClick packet parse', res)
              const parsedData = (res.data || []).map(item => {
                let parsedBody = null
                if (item.body) {
                  try {
                    parsedBody = JSON.parse(item.body)
                  } catch (e) {
                    console.error('Failed to parse body JSON', e)
                  }
                }
                return {
                  ...item,
                  parsedBody
                }
              })
              // store parse result in the record
              this.$set(record, 'packet_parse', parsedData)
              // still show parse result in a popup view
              this.packet_parse = parsedData
              this.packet_parse_visible = true
            }).catch(err => {
              console.log('rowClick packet parse err', err)
              this.$message.error(err.message || err)
            })
          }
        }
      }
    },

    formatJson (body) {
      if (!body) return ''
      try {
        const obj = typeof body === 'string' ? JSON.parse(body) : body
        return JSON.stringify(obj, null, 2)
      } catch (e) {
        return body
      }
    },
    formatHex (packet) {
      if (!packet) return ''
      return packet.replace(/(.{2})/g, '$1 ').trim().toUpperCase()
    }
  }
}
</script>

<style scoped>
.container {
  margin: 8px;
}
.vm {
  width: 100%;
  max-width: 100%;
}
.packet-content {
  white-space: normal;
  word-wrap: break-word;
  word-break: break-all;
}
.packet-parse-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  max-height: 300px;
  overflow: auto;
}
.packet-collapse {
  margin-bottom: 0;
}
.packet-collapse >>> .ant-collapse-header {
  padding: 4px 16px !important;
  font-size: 13px;
}
.packet-collapse >>> .ant-collapse-content-box {
  padding: 8px !important;
}

/* 确保表格内容自动换行 */
.s-table >>> .ant-table-tbody > tr > td {
  white-space: normal;
  word-break: break-word;
}

.fullscreen-modal {
  width: 100%;
  max-width: 100%;
  top: 0;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.fullscreen-modal .vm-titlebar {
  flex-shrink: 0;
}
.fullscreen-modal .vm-content {
  padding: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.scrollable-content {
  width: 100%;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 15px 10px 15px;
  flex-grow: 1;
}
.fullscreen-modal .fullscreen-modal-footer {
  border-top: 1px solid #e5e5e5;
  padding: 15px;
}

/* Polished Parse Styles */
.parse-details-container {
  padding: 12px;
  background-color: #f0f2f5;
  border-radius: 8px;
  max-height: 75vh;
  overflow-y: auto;
}

.parse-card-wrapper {
  margin-bottom: 16px;
}

.parse-main-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-title-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.device-id-label {
  font-size: 15px;
  color: #333;
}

.highlight-text {
  color: #1890ff;
  font-weight: 600;
}

.custom-tag {
  font-weight: 500;
  border-radius: 4px;
}

.json-header {
  font-weight: bold;
  margin-bottom: 8px;
  color: #555;
  font-size: 13px;
}

.json-block {
  background: #fdfdfd;
  color: #333;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 1.5;
  max-height: 400px;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
}

.raw-hex-section {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 12px;
}

.hex-title {
  font-size: 12px;
  font-weight: bold;
  color: #888;
  margin-bottom: 4px;
}

.hex-body {
  font-family: monospace;
  font-size: 12px;
  word-wrap: break-word;
  word-break: break-all;
  color: #555;
  letter-spacing: 1px;
}

.packet-parse-item {
  padding: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.packet-parse-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.parse-meta-info {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.packet-parse-json {
  background: #fafafa;
  color: #444;
  padding: 10px;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  line-height: 1.4;
  max-height: 200px;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  margin: 0;
}
</style>
