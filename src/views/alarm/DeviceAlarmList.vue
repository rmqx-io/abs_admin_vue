<template>
  <div class="device-alarm-list">
    <a-card :bordered="false">
      <!-- 搜索筛选区域 -->
      <div class="search-form">
        <a-form layout="inline" :form="searchForm">
          <a-form-item label="设备名称">
            <a-input
              v-decorator="['device_name']"
              placeholder="请输入设备名称"
              style="width: 180px"
              allowClear
            />
          </a-form-item>
          <a-form-item label="预警级别">
            <a-select
              v-decorator="['alarm_level']"
              placeholder="请选择预警级别"
              style="width: 150px"
              allowClear
            >
              <a-select-option value="critical">严重</a-select-option>
              <a-select-option value="warning">警告</a-select-option>
              <a-select-option value="info">信息</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="预警状态">
            <a-select
              v-decorator="['status']"
              placeholder="请选择状态"
              style="width: 150px"
              allowClear
            >
              <a-select-option value="pending">待处理</a-select-option>
              <a-select-option value="processing">处理中</a-select-option>
              <a-select-option value="resolved">已解决</a-select-option>
              <a-select-option value="ignored">已忽略</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="时间范围">
            <a-range-picker
              v-decorator="['date_range']"
              style="width: 240px"
              :placeholder="['开始时间', '结束时间']"
              format="YYYY-MM-DD"
            />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch" :loading="loading">
              <a-icon type="search" />
              搜索
            </a-button>
            <a-button style="margin-left: 8px" @click="handleReset">
              <a-icon type="reload" />
              重置
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <a-row :gutter="16">
          <a-col :xs="12" :sm="6">
            <div class="stat-card critical">
              <div class="stat-icon">
                <a-icon type="exclamation-circle" />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ statistics.critical }}</div>
                <div class="stat-label">严重预警</div>
              </div>
            </div>
          </a-col>
          <a-col :xs="12" :sm="6">
            <div class="stat-card warning">
              <div class="stat-icon">
                <a-icon type="warning" />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ statistics.warning }}</div>
                <div class="stat-label">一般预警</div>
              </div>
            </div>
          </a-col>
          <a-col :xs="12" :sm="6">
            <div class="stat-card pending">
              <div class="stat-icon">
                <a-icon type="clock-circle" />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ statistics.pending }}</div>
                <div class="stat-label">待处理</div>
              </div>
            </div>
          </a-col>
          <a-col :xs="12" :sm="6">
            <div class="stat-card resolved">
              <div class="stat-icon">
                <a-icon type="check-circle" />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ statistics.resolved }}</div>
                <div class="stat-label">已解决</div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 操作栏 -->
      <div class="table-operations">
        <div class="operations-left">
          <a-button
            type="primary"
            @click="handleBatchProcess"
            :disabled="!hasSelected"
          >
            <a-icon type="check" />
            批量处理
          </a-button>
          <a-button
            @click="handleBatchIgnore"
            :disabled="!hasSelected"
          >
            <a-icon type="stop" />
            批量忽略
          </a-button>
          <a-dropdown>
            <a-menu slot="overlay" @click="handleExport">
              <a-menu-item key="excel">
                <a-icon type="file-excel" />
                导出Excel
              </a-menu-item>
              <a-menu-item key="pdf">
                <a-icon type="file-pdf" />
                导出PDF
              </a-menu-item>
            </a-menu>
            <a-button>
              导出数据 <a-icon type="down" />
            </a-button>
          </a-dropdown>
        </div>
        <div class="operations-right">
          <a-tooltip title="刷新">
            <a-button icon="reload" @click="loadData" :loading="loading" />
          </a-tooltip>
          <a-tooltip title="列设置">
            <a-button icon="setting" @click="showColumnSettings" />
          </a-tooltip>
        </div>
      </div>

      <!-- 预警消息表格 -->
      <a-table
        :columns="columns"
        :dataSource="data"
        :pagination="pagination"
        :loading="loading"
        :rowSelection="rowSelection"
        rowKey="id"
        @change="handleTableChange"
        :scroll="{ x: 1200 }"
      >
        <span slot="alarm_level" slot-scope="text">
          <a-tag :color="getLevelColor(text)">
            <a-icon :type="getLevelIcon(text)" />
            {{ getLevelText(text) }}
          </a-tag>
        </span>

        <span slot="device_info" slot-scope="text, record">
          <div class="device-info">
            <div class="device-name">
              <a @click="viewDeviceDetail(record.device_id)">
                {{ record.device_name }}
              </a>
            </div>
            <div class="device-location">
              <a-icon type="environment" />
              {{ record.device_location }}
            </div>
          </div>
        </span>

        <span slot="alarm_type" slot-scope="text">
          <a-tag color="blue">{{ getAlarmTypeText(text) }}</a-tag>
        </span>

        <span slot="status" slot-scope="text">
          <a-badge 
            :status="getStatusBadge(text)" 
            :text="getStatusText(text)"
          />
        </span>

        <span slot="created_at" slot-scope="text">
          {{ formatDate(text) }}
        </span>

        <span slot="duration" slot-scope="text, record">
          <span :class="getDurationClass(record.created_at, record.resolved_at)">
            {{ calculateDuration(record.created_at, record.resolved_at) }}
          </span>
        </span>

        <span slot="action" slot-scope="text, record">
          <div class="action-buttons">
            <a-tooltip title="查看详情">
              <a-button
                type="link"
                size="small"
                icon="eye"
                @click="viewAlarmDetail(record)"
              />
            </a-tooltip>
            <a-tooltip title="处理" v-if="record.status === 'pending'">
              <a-button
                type="link"
                size="small"
                icon="check"
                @click="processAlarm(record)"
              />
            </a-tooltip>
            <a-tooltip title="忽略" v-if="record.status === 'pending'">
              <a-button
                type="link"
                size="small"
                icon="stop"
                @click="ignoreAlarm(record)"
              />
            </a-tooltip>
            <a-tooltip title="重新处理" v-if="record.status === 'ignored'">
              <a-button
                type="link"
                size="small"
                icon="redo"
                @click="reopenAlarm(record)"
              />
            </a-tooltip>
          </div>
        </span>
      </a-table>
    </a-card>

    <!-- 详情弹窗 -->
    <alarm-detail-modal
      :visible="detailModalVisible"
      :alarm="selectedAlarm"
      @close="handleDetailClose"
      @process="handleAlarmProcess"
    />

    <!-- 处理弹窗 -->
    <alarm-process-modal
      :visible="processModalVisible"
      :alarm="selectedAlarm"
      :batch="isBatchProcess"
      :selected-ids="selectedRowKeys"
      @close="handleProcessClose"
      @success="handleProcessSuccess"
    />

    <!-- 列设置弹窗 -->
    <column-settings-modal
      :visible="columnSettingsVisible"
      :columns="allColumns"
      :selected-columns="visibleColumns"
      @close="handleColumnSettingsClose"
      @save="handleColumnSettingsSave"
    />
  </div>
</template>

<script>
import moment from 'moment'
import AlarmDetailModal from './components/AlarmDetailModal'
import AlarmProcessModal from './components/AlarmProcessModal'
import ColumnSettingsModal from './components/ColumnSettingsModal'

const columns = [
  {
    title: '预警级别',
    dataIndex: 'alarm_level',
    key: 'alarm_level',
    width: 100,
    fixed: 'left',
    scopedSlots: { customRender: 'alarm_level' },
    sorter: true,
    filters: [
      { text: '严重', value: 'critical' },
      { text: '警告', value: 'warning' },
      { text: '信息', value: 'info' }
    ]
  },
  {
    title: '设备信息',
    dataIndex: 'device_info',
    key: 'device_info',
    width: 200,
    scopedSlots: { customRender: 'device_info' }
  },
  {
    title: '预警类型',
    dataIndex: 'alarm_type',
    key: 'alarm_type',
    width: 120,
    scopedSlots: { customRender: 'alarm_type' },
    filters: [
      { text: '离线预警', value: 'offline' },
      { text: '故障预警', value: 'fault' },
      { text: '过载预警', value: 'overload' },
      { text: '温度预警', value: 'temperature' },
      { text: '电压预警', value: 'voltage' },
      { text: '通信预警', value: 'communication' }
    ]
  },
  {
    title: '预警消息',
    dataIndex: 'message',
    key: 'message',
    ellipsis: true,
    width: 250
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    scopedSlots: { customRender: 'status' },
    filters: [
      { text: '待处理', value: 'pending' },
      { text: '处理中', value: 'processing' },
      { text: '已解决', value: 'resolved' },
      { text: '已忽略', value: 'ignored' }
    ]
  },
  {
    title: '发生时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 140,
    scopedSlots: { customRender: 'created_at' },
    sorter: true
  },
  {
    title: '持续时间',
    dataIndex: 'duration',
    key: 'duration',
    width: 120,
    scopedSlots: { customRender: 'duration' }
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'DeviceAlarmList',
  components: {
    AlarmDetailModal,
    AlarmProcessModal,
    ColumnSettingsModal
  },
  data() {
    this.columns = columns
    this.allColumns = [...columns]
    return {
      searchForm: this.$form.createForm(this),
      loading: false,
      data: [],
      selectedRowKeys: [],
      
      // 分页
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `共 ${total} 条记录，当前显示 ${range[0]}-${range[1]} 条`
      },

      // 统计数据
      statistics: {
        critical: 0,
        warning: 0,
        pending: 0,
        resolved: 0
      },

      // 弹窗状态
      detailModalVisible: false,
      processModalVisible: false,
      columnSettingsVisible: false,
      selectedAlarm: null,
      isBatchProcess: false,

      // 列设置
      visibleColumns: columns.map(col => col.key)
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange,
        getCheckboxProps: record => ({
          disabled: record.status === 'resolved'
        })
      }
    }
  },
  created() {
    this.loadData()
    this.loadStatistics()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        // 模拟API调用
        const mockData = [
          {
            id: '1',
            device_id: 'DEV001',
            device_name: '智能开关_001',
            device_location: '北京市朝阳区建国门外大街1号',
            alarm_level: 'critical',
            alarm_type: 'offline',
            message: '设备离线超过30分钟，请检查网络连接',
            status: 'pending',
            created_at: moment().subtract(2, 'hours').format('YYYY-MM-DD HH:mm:ss'),
            resolved_at: null,
            assignee: null,
            resolver: null
          },
          {
            id: '2',
            device_id: 'DEV002',
            device_name: '智能灯_002',
            device_location: '上海市浦东新区陆家嘴金融街1号',
            alarm_level: 'warning',
            alarm_type: 'overload',
            message: '设备功率超过额定功率80%，建议检查负载',
            status: 'processing',
            created_at: moment().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
            resolved_at: null,
            assignee: '张三',
            resolver: null
          },
          {
            id: '3',
            device_id: 'DEV003',
            device_name: '智能电表_003',
            device_location: '广州市天河区珠江新城1号',
            alarm_level: 'info',
            alarm_type: 'temperature',
            message: '设备温度略高，当前温度45℃',
            status: 'resolved',
            created_at: moment().subtract(3, 'days').format('YYYY-MM-DD HH:mm:ss'),
            resolved_at: moment().subtract(2, 'days').format('YYYY-MM-DD HH:mm:ss'),
            assignee: '李四',
            resolver: '李四'
          }
        ]
        
        this.data = mockData
        this.pagination.total = mockData.length
      } catch (error) {
        this.$message.error('加载预警数据失败')
      } finally {
        this.loading = false
      }
    },

    async loadStatistics() {
      try {
        // 模拟统计数据
        this.statistics = {
          critical: 5,
          warning: 12,
          pending: 8,
          resolved: 45
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    },

    handleSearch() {
      this.pagination.current = 1
      this.loadData()
    },

    handleReset() {
      this.searchForm.resetFields()
      this.pagination.current = 1
      this.loadData()
    },

    handleTableChange(pagination, filters, sorter) {
      this.pagination = { ...this.pagination, ...pagination }
      this.loadData()
    },

    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },

    viewAlarmDetail(alarm) {
      this.selectedAlarm = alarm
      this.detailModalVisible = true
    },

    handleDetailClose() {
      this.detailModalVisible = false
      this.selectedAlarm = null
    },

    processAlarm(alarm) {
      this.selectedAlarm = alarm
      this.isBatchProcess = false
      this.processModalVisible = true
    },

    handleBatchProcess() {
      this.isBatchProcess = true
      this.processModalVisible = true
    },

    handleBatchIgnore() {
      this.$confirm({
        title: '确认批量忽略',
        content: `确定要忽略选中的 ${this.selectedRowKeys.length} 条预警吗？`,
        onOk: () => {
          this.$message.success('批量忽略成功')
          this.selectedRowKeys = []
          this.loadData()
        }
      })
    },

    ignoreAlarm(alarm) {
      this.$confirm({
        title: '确认忽略预警',
        content: '确定要忽略这条预警吗？',
        onOk: () => {
          this.$message.success('预警已忽略')
          this.loadData()
        }
      })
    },

    reopenAlarm(alarm) {
      this.$confirm({
        title: '确认重新处理',
        content: '确定要重新处理这条预警吗？',
        onOk: () => {
          this.$message.success('预警已重新开启')
          this.loadData()
        }
      })
    },

    handleProcessClose() {
      this.processModalVisible = false
      this.selectedAlarm = null
      this.isBatchProcess = false
    },

    handleProcessSuccess() {
      this.processModalVisible = false
      this.selectedAlarm = null
      this.isBatchProcess = false
      this.selectedRowKeys = []
      this.loadData()
      this.loadStatistics()
    },

    handleAlarmProcess(result) {
      this.$message.success('预警处理成功')
      this.handleDetailClose()
      this.loadData()
      this.loadStatistics()
    },

    viewDeviceDetail(deviceId) {
      this.$router.push(`/list/device-list/info/${deviceId}`)
    },

    handleExport({ key }) {
      if (key === 'excel') {
        this.$message.success('Excel导出功能开发中')
      } else if (key === 'pdf') {
        this.$message.success('PDF导出功能开发中')
      }
    },

    showColumnSettings() {
      this.columnSettingsVisible = true
    },

    handleColumnSettingsClose() {
      this.columnSettingsVisible = false
    },

    handleColumnSettingsSave(selectedColumns) {
      this.visibleColumns = selectedColumns
      this.columnSettingsVisible = false
      this.$message.success('列设置已保存')
    },

    getLevelColor(level) {
      const colorMap = {
        'critical': 'red',
        'warning': 'orange',
        'info': 'blue'
      }
      return colorMap[level] || 'default'
    },

    getLevelIcon(level) {
      const iconMap = {
        'critical': 'exclamation-circle',
        'warning': 'warning',
        'info': 'info-circle'
      }
      return iconMap[level] || 'question-circle'
    },

    getLevelText(level) {
      const textMap = {
        'critical': '严重',
        'warning': '警告',
        'info': '信息'
      }
      return textMap[level] || level
    },

    getAlarmTypeText(type) {
      const textMap = {
        'offline': '离线预警',
        'fault': '故障预警',
        'overload': '过载预警',
        'temperature': '温度预警',
        'voltage': '电压预警',
        'communication': '通信预警'
      }
      return textMap[type] || type
    },

    getStatusBadge(status) {
      const badgeMap = {
        'pending': 'error',
        'processing': 'processing',
        'resolved': 'success',
        'ignored': 'default'
      }
      return badgeMap[status] || 'default'
    },

    getStatusText(status) {
      const textMap = {
        'pending': '待处理',
        'processing': '处理中',
        'resolved': '已解决',
        'ignored': '已忽略'
      }
      return textMap[status] || status
    },

    formatDate(dateString) {
      return moment(dateString).format('MM-DD HH:mm')
    },

    calculateDuration(startTime, endTime) {
      const start = moment(startTime)
      const end = endTime ? moment(endTime) : moment()
      const duration = moment.duration(end.diff(start))
      
      if (duration.asDays() >= 1) {
        return `${Math.floor(duration.asDays())}天`
      } else if (duration.asHours() >= 1) {
        return `${Math.floor(duration.asHours())}小时`
      } else {
        return `${Math.floor(duration.asMinutes())}分钟`
      }
    },

    getDurationClass(startTime, endTime) {
      if (endTime) return 'duration-resolved'
      
      const duration = moment().diff(moment(startTime), 'hours')
      if (duration >= 24) return 'duration-critical'
      if (duration >= 4) return 'duration-warning'
      return 'duration-normal'
    }
  }
}
</script>

<style scoped>
.device-alarm-list {
  .search-form {
    background: #fafafa;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
  }

  .stats-cards {
    margin-bottom: 20px;

    .stat-card {
      display: flex;
      align-items: center;
      padding: 20px;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        font-size: 24px;
        color: white;
      }

      .stat-content {
        .stat-number {
          font-size: 28px;
          font-weight: bold;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 14px;
          color: #8c8c8c;
          margin-top: 4px;
        }
      }

      &.critical {
        .stat-icon {
          background: #ff4d4f;
        }
        .stat-number {
          color: #ff4d4f;
        }
      }

      &.warning {
        .stat-icon {
          background: #fa8c16;
        }
        .stat-number {
          color: #fa8c16;
        }
      }

      &.pending {
        .stat-icon {
          background: #1890ff;
        }
        .stat-number {
          color: #1890ff;
        }
      }

      &.resolved {
        .stat-icon {
          background: #52c41a;
        }
        .stat-number {
          color: #52c41a;
        }
      }
    }
  }

  .table-operations {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .operations-left {
      .ant-btn {
        margin-right: 8px;
      }
    }

    .operations-right {
      .ant-btn {
        margin-left: 8px;
      }
    }
  }

  .device-info {
    .device-name {
      font-weight: 500;
      margin-bottom: 4px;

      a {
        color: #1890ff;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .device-location {
      font-size: 12px;
      color: #8c8c8c;

      .anticon {
        margin-right: 4px;
      }
    }
  }

  .action-buttons {
    .ant-btn {
      margin-right: 4px;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .duration-critical {
    color: #ff4d4f;
    font-weight: 500;
  }

  .duration-warning {
    color: #fa8c16;
    font-weight: 500;
  }

  .duration-normal {
    color: #1890ff;
  }

  .duration-resolved {
    color: #52c41a;
  }
}

@media (max-width: 768px) {
  .device-alarm-list {
    .search-form {
      padding: 12px;

      .ant-form-item {
        margin-bottom: 8px;
      }
    }

    .stats-cards {
      .stat-card {
        padding: 12px;
        margin-bottom: 8px;

        .stat-icon {
          width: 36px;
          height: 36px;
          font-size: 18px;
          margin-right: 12px;
        }

        .stat-content {
          .stat-number {
            font-size: 20px;
          }

          .stat-label {
            font-size: 12px;
          }
        }
      }
    }

    .table-operations {
      flex-direction: column;
      align-items: stretch;

      .operations-left,
      .operations-right {
        margin-bottom: 8px;
      }
    }
  }
}
</style>