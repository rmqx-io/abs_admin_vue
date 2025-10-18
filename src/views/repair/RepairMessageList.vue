<template>
  <div class="repair-message-list">
    <a-card :bordered="false">
      <!-- 搜索栏 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="设备名称">
                <a-input
                  v-model="queryParam.device_name"
                  placeholder="请输入设备名称"
                  allowClear
                />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="报修状态">
                <a-select
                  v-model="queryParam.status"
                  placeholder="请选择处理状态"
                  allowClear
                >
                  <a-select-option value="pending">待处理</a-select-option>
                  <a-select-option value="processing">处理中</a-select-option>
                  <a-select-option value="completed">已完成</a-select-option>
                  <a-select-option value="rejected">已拒绝</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="紧急程度">
                <a-select
                  v-model="queryParam.priority"
                  placeholder="请选择紧急程度"
                  allowClear
                >
                  <a-select-option value="low">低</a-select-option>
                  <a-select-option value="medium">中</a-select-option>
                  <a-select-option value="high">高</a-select-option>
                  <a-select-option value="urgent">紧急</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="报修类型">
                <a-select
                  v-model="queryParam.repair_type"
                  placeholder="请选择报修类型"
                  allowClear
                >
                  <a-select-option value="hardware">硬件故障</a-select-option>
                  <a-select-option value="software">软件故障</a-select-option>
                  <a-select-option value="network">网络问题</a-select-option>
                  <a-select-option value="power">电源问题</a-select-option>
                  <a-select-option value="other">其他</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="报修时间">
                <a-range-picker
                  v-model="queryParam.date_range"
                  format="YYYY-MM-DD"
                  placeholder="['开始时间', '结束时间']"
                />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="handleSearch">
                  <a-icon type="search" />
                  查询
                </a-button>
                <a-button style="margin-left: 8px" @click="handleReset">
                  <a-icon type="reload" />
                  重置
                </a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <!-- 操作栏 -->
      <div class="table-operator">
        <a-button type="primary" @click="handleRefresh">
          <a-icon type="reload" />
          刷新
        </a-button>
        <a-button @click="handleBatchProcess" :disabled="selectedRowKeys.length === 0">
          <a-icon type="tool" />
          批量处理
        </a-button>
        <a-button @click="handleExport">
          <a-icon type="download" />
          导出
        </a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay" @click="handleBatchAction">
            <a-menu-item key="accept">批量接受</a-menu-item>
            <a-menu-item key="reject">批量拒绝</a-menu-item>
            <a-menu-item key="complete">批量完成</a-menu-item>
          </a-menu>
          <a-button>
            批量操作 <a-icon type="down" />
          </a-button>
        </a-dropdown>

        <!-- 统计信息 -->
        <div class="statistics-info">
          <a-statistic-group>
            <a-statistic title="待处理" :value="statistics.pending" :value-style="{ color: '#ff4d4f' }" />
            <a-statistic title="处理中" :value="statistics.processing" :value-style="{ color: '#faad14' }" />
            <a-statistic title="已完成" :value="statistics.completed" :value-style="{ color: '#52c41a' }" />
            <a-statistic title="总计" :value="statistics.total" />
          </a-statistic-group>
        </div>
      </div>

      <!-- 表格 -->
      <a-table
        ref="table"
        :columns="columns"
        :dataSource="data"
        :pagination="pagination"
        :loading="loading"
        :rowSelection="rowSelection"
        rowKey="id"
        @change="handleTableChange"
        :scroll="{ x: 1500 }"
        size="middle"
      >
        <!-- 设备信息 -->
        <span slot="device_info" slot-scope="text, record">
          <div class="device-info-cell">
            <div class="device-name">
              <a-icon :type="getDeviceIcon(record.device_type)" />
              {{ record.device_name }}
            </div>
            <div class="device-id">ID: {{ record.device_id }}</div>
            <div class="device-location">{{ record.device_location }}</div>
          </div>
        </span>

        <!-- 报修信息 -->
        <span slot="repair_info" slot-scope="text, record">
          <div class="repair-info-cell">
            <div class="repair-type">
              <a-tag :color="getRepairTypeColor(record.repair_type)">
                {{ getRepairTypeText(record.repair_type) }}
              </a-tag>
            </div>
            <div class="priority">
              <a-tag :color="getPriorityColor(record.priority)">
                {{ getPriorityText(record.priority) }}
              </a-tag>
            </div>
            <div class="description" :title="record.description">
              {{ record.description | truncate(30) }}
            </div>
          </div>
        </span>

        <!-- 报修人信息 -->
        <span slot="reporter_info" slot-scope="text, record">
          <div class="reporter-info-cell">
            <div class="reporter-name">{{ record.reporter_name }}</div>
            <div class="reporter-phone">{{ record.reporter_phone }}</div>
            <div class="report-time">{{ record.created_at | formatDateTime }}</div>
          </div>
        </span>

        <!-- 状态 -->
        <span slot="status" slot-scope="text, record">
          <a-badge
            :status="getStatusBadge(record.status)"
            :text="getStatusText(record.status)"
          />
          <div v-if="record.status !== 'pending'" class="status-time">
            {{ record.processed_at | formatDateTime }}
          </div>
        </span>

        <!-- 处理人员 -->
        <span slot="processor" slot-scope="text, record">
          <div v-if="record.processor_name" class="processor-info">
            <div class="processor-name">{{ record.processor_name }}</div>
            <div class="process-time">{{ record.processed_at | formatDateTime }}</div>
          </div>
          <span v-else class="not-assigned">未分配</span>
        </span>

        <!-- 附件 -->
        <span slot="attachments" slot-scope="text, record">
          <div v-if="record.attachments && record.attachments.length > 0" class="attachments-cell">
            <a-tooltip title="查看附件">
              <a-button
                type="link"
                size="small"
                @click="handleViewAttachments(record)"
              >
                <a-icon type="paper-clip" />
                {{ record.attachments.length }}个文件
              </a-button>
            </a-tooltip>
          </div>
          <span v-else>无</span>
        </span>

        <!-- 操作 -->
        <span slot="action" slot-scope="text, record">
          <a-dropdown>
            <a class="ant-dropdown-link">
              操作 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleView(record)">
                  <a-icon type="eye" />
                  查看详情
                </a>
              </a-menu-item>
              <a-menu-item v-if="record.status === 'pending'">
                <a @click="handleAccept(record)">
                  <a-icon type="check" />
                  接受处理
                </a>
              </a-menu-item>
              <a-menu-item v-if="record.status === 'processing'">
                <a @click="handleComplete(record)">
                  <a-icon type="check-circle" />
                  完成处理
                </a>
              </a-menu-item>
              <a-menu-item v-if="['pending', 'processing'].includes(record.status)">
                <a @click="handleReject(record)">
                  <a-icon type="close" />
                  拒绝处理
                </a>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleAssign(record)">
                  <a-icon type="user" />
                  分配人员
                </a>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleAddComment(record)">
                  <a-icon type="message" />
                  添加备注
                </a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-table>
    </a-card>

    <!-- 详情弹窗 -->
    <repair-detail-modal
      :visible="detailModalVisible"
      :data="currentRecord"
      @close="handleDetailClose"
      @refresh="handleRefresh"
    />

    <!-- 处理弹窗 -->
    <repair-process-modal
      :visible="processModalVisible"
      :data="currentRecord"
      :action="processAction"
      @close="handleProcessClose"
      @refresh="handleRefresh"
    />

    <!-- 分配人员弹窗 -->
    <assign-user-modal
      :visible="assignModalVisible"
      :data="currentRecord"
      @close="handleAssignClose"
      @refresh="handleRefresh"
    />

    <!-- 附件查看弹窗 -->
    <attachment-viewer-modal
      :visible="attachmentModalVisible"
      :attachments="currentAttachments"
      @close="handleAttachmentClose"
    />
  </div>
</template>

<script>
import moment from 'moment'
import RepairDetailModal from './components/RepairDetailModal'
import RepairProcessModal from './components/RepairProcessModal'
import AssignUserModal from './components/AssignUserModal'
import AttachmentViewerModal from './components/AttachmentViewerModal'

const columns = [
  {
    title: '设备信息',
    dataIndex: 'device_info',
    width: 200,
    fixed: 'left',
    scopedSlots: { customRender: 'device_info' }
  },
  {
    title: '报修信息',
    dataIndex: 'repair_info',
    width: 250,
    scopedSlots: { customRender: 'repair_info' }
  },
  {
    title: '报修人',
    dataIndex: 'reporter_info',
    width: 150,
    scopedSlots: { customRender: 'reporter_info' }
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    filters: [
      { text: '待处理', value: 'pending' },
      { text: '处理中', value: 'processing' },
      { text: '已完成', value: 'completed' },
      { text: '已拒绝', value: 'rejected' }
    ],
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '处理人员',
    dataIndex: 'processor',
    width: 120,
    scopedSlots: { customRender: 'processor' }
  },
  {
    title: '附件',
    dataIndex: 'attachments',
    width: 80,
    scopedSlots: { customRender: 'attachments' }
  },
  {
    title: '响应时间',
    dataIndex: 'response_time',
    width: 100,
    sorter: true,
    customRender: (text) => text ? `${text}分钟` : '-'
  },
  {
    title: '处理时长',
    dataIndex: 'process_duration',
    width: 100,
    sorter: true,
    customRender: (text) => text ? `${text}小时` : '-'
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 100,
    fixed: 'right',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'RepairMessageList',
  components: {
    RepairDetailModal,
    RepairProcessModal,
    AssignUserModal,
    AttachmentViewerModal
  },
  data() {
    this.columns = columns
    return {
      // 查询参数
      queryParam: {
        device_name: '',
        status: undefined,
        priority: undefined,
        repair_type: undefined,
        date_range: []
      },
      
      // 表格数据
      data: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `共 ${total} 条记录`
      },
      loading: false,
      
      // 行选择
      selectedRowKeys: [],
      
      // 统计数据
      statistics: {
        pending: 0,
        processing: 0,
        completed: 0,
        rejected: 0,
        total: 0
      },
      
      // 弹窗状态
      detailModalVisible: false,
      processModalVisible: false,
      assignModalVisible: false,
      attachmentModalVisible: false,
      
      // 当前记录
      currentRecord: null,
      processAction: '',
      currentAttachments: []
    }
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  filters: {
    formatDateTime(date) {
      return date ? moment(date).format('MM-DD HH:mm') : '-'
    },
    truncate(text, length = 50) {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
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
        const mockData = this.generateMockData()
        this.data = mockData.records
        this.pagination.total = mockData.total
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },

    async loadStatistics() {
      try {
        // 模拟统计数据
        this.statistics = {
          pending: 15,
          processing: 8,
          completed: 42,
          rejected: 3,
          total: 68
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    },

    generateMockData() {
      const records = []
      const devices = ['智能开关001', '智能灯002', '智能电表003', '智能插座004']
      const repairTypes = ['hardware', 'software', 'network', 'power', 'other']
      const priorities = ['low', 'medium', 'high', 'urgent']
      const statuses = ['pending', 'processing', 'completed', 'rejected']
      
      for (let i = 1; i <= 50; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const createdAt = moment().subtract(Math.floor(Math.random() * 30), 'days')
        const processedAt = status !== 'pending'
          ? createdAt.clone().add(Math.floor(Math.random() * 48), 'hours')
          : null
        
        records.push({
          id: i,
          device_id: `DEV${String(i).padStart(4, '0')}`,
          device_name: devices[Math.floor(Math.random() * devices.length)],
          device_type: ['smart_switch', 'smart_light', 'smart_meter'][Math.floor(Math.random() * 3)],
          device_location: `${['北京', '上海', '深圳'][Math.floor(Math.random() * 3)]}市${['朝阳', '浦东', '南山'][Math.floor(Math.random() * 3)]}区`,
          repair_type: repairTypes[Math.floor(Math.random() * repairTypes.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          description: `设备出现${['断电', '连接异常', '功能故障', '性能下降'][Math.floor(Math.random() * 4)]}问题，需要及时处理`,
          reporter_name: `用户${i}`,
          reporter_phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
          status: status,
          processor_name: status !== 'pending' ? `维修员${Math.ceil(i / 10)}` : null,
          created_at: createdAt.toDate(),
          processed_at: processedAt ? processedAt.toDate() : null,
          response_time: status !== 'pending' ? Math.floor(Math.random() * 120) + 5 : null,
          process_duration: status === 'completed' ? Math.floor(Math.random() * 48) + 1 : null,
          attachments: Math.random() > 0.5 ? [
            { name: '故障图片1.jpg', url: '/files/image1.jpg', type: 'image' },
            { name: '故障视频.mp4', url: '/files/video1.mp4', type: 'video' }
          ] : []
        })
      }
      
      return {
        records: records.slice(
          (this.pagination.current - 1) * this.pagination.pageSize,
          this.pagination.current * this.pagination.pageSize
        ),
        total: records.length
      }
    },

    handleSearch() {
      this.pagination.current = 1
      this.loadData()
    },

    handleReset() {
      this.queryParam = {
        device_name: '',
        status: undefined,
        priority: undefined,
        repair_type: undefined,
        date_range: []
      }
      this.pagination.current = 1
      this.loadData()
    },

    handleRefresh() {
      this.loadData()
      this.loadStatistics()
    },

    handleTableChange(pagination, filters, sorter) {
      this.pagination = pagination
      this.loadData()
    },

    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },

    // 查看详情
    handleView(record) {
      this.currentRecord = record
      this.detailModalVisible = true
    },

    handleDetailClose() {
      this.detailModalVisible = false
      this.currentRecord = null
    },

    // 接受处理
    handleAccept(record) {
      this.currentRecord = record
      this.processAction = 'accept'
      this.processModalVisible = true
    },

    // 完成处理
    handleComplete(record) {
      this.currentRecord = record
      this.processAction = 'complete'
      this.processModalVisible = true
    },

    // 拒绝处理
    handleReject(record) {
      this.currentRecord = record
      this.processAction = 'reject'
      this.processModalVisible = true
    },

    handleProcessClose() {
      this.processModalVisible = false
      this.currentRecord = null
      this.processAction = ''
    },

    // 分配人员
    handleAssign(record) {
      this.currentRecord = record
      this.assignModalVisible = true
    },

    handleAssignClose() {
      this.assignModalVisible = false
      this.currentRecord = null
    },

    // 查看附件
    handleViewAttachments(record) {
      this.currentAttachments = record.attachments || []
      this.attachmentModalVisible = true
    },

    handleAttachmentClose() {
      this.attachmentModalVisible = false
      this.currentAttachments = []
    },

    // 添加备注
    handleAddComment(record) {
      this.$message.info('添加备注功能开发中')
    },

    // 批量操作
    handleBatchProcess() {
      this.$message.info('批量处理功能开发中')
    },

    handleBatchAction({ key }) {
      const actionMap = {
        accept: '批量接受',
        reject: '批量拒绝',
        complete: '批量完成'
      }
      this.$message.info(`${actionMap[key]}功能开发中`)
    },

    // 导出
    handleExport() {
      this.$message.info('导出功能开发中')
    },

    // 工具方法
    getDeviceIcon(type) {
      const iconMap = {
        smart_switch: 'control',
        smart_light: 'bulb',
        smart_meter: 'dashboard'
      }
      return iconMap[type] || 'question'
    },

    getRepairTypeColor(type) {
      const colorMap = {
        hardware: 'red',
        software: 'blue',
        network: 'orange',
        power: 'purple',
        other: 'default'
      }
      return colorMap[type] || 'default'
    },

    getRepairTypeText(type) {
      const textMap = {
        hardware: '硬件故障',
        software: '软件故障',
        network: '网络问题',
        power: '电源问题',
        other: '其他'
      }
      return textMap[type] || type
    },

    getPriorityColor(priority) {
      const colorMap = {
        low: 'green',
        medium: 'blue',
        high: 'orange',
        urgent: 'red'
      }
      return colorMap[priority] || 'default'
    },

    getPriorityText(priority) {
      const textMap = {
        low: '低',
        medium: '中',
        high: '高',
        urgent: '紧急'
      }
      return textMap[priority] || priority
    },

    getStatusBadge(status) {
      const badgeMap = {
        pending: 'error',
        processing: 'processing',
        completed: 'success',
        rejected: 'default'
      }
      return badgeMap[status] || 'default'
    },

    getStatusText(status) {
      const textMap = {
        pending: '待处理',
        processing: '处理中',
        completed: '已完成',
        rejected: '已拒绝'
      }
      return textMap[status] || status
    }
  }
}
</script>

<style scoped>
.repair-message-list {
  .table-page-search-wrapper {
    .ant-form-inline {
      .ant-form-item {
        display: flex;
        margin-bottom: 12px;
        margin-right: 0;

        .ant-form-item-control-wrapper {
          flex: 1 1;
          display: inline-block;
          vertical-align: middle;
        }
      }
    }

    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 12px;
      white-space: nowrap;
    }
  }

  .table-operator {
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;

    .statistics-info {
      margin-left: auto;
      
      .ant-statistic-group {
        .ant-statistic {
          margin: 0 16px;
          .ant-statistic-title {
            font-size: 12px;
          }
          .ant-statistic-content {
            font-size: 16px;
          }
        }
      }
    }
  }

  /* 表格单元格样式 */
  .device-info-cell {
    .device-name {
      font-weight: 500;
      color: #262626;
      margin-bottom: 2px;
      
      .anticon {
        margin-right: 4px;
        color: #1890ff;
      }
    }
    
    .device-id {
      font-size: 12px;
      color: #8c8c8c;
      margin-bottom: 2px;
    }
    
    .device-location {
      font-size: 12px;
      color: #595959;
    }
  }

  .repair-info-cell {
    .repair-type {
      margin-bottom: 4px;
    }
    
    .priority {
      margin-bottom: 4px;
    }
    
    .description {
      font-size: 12px;
      color: #595959;
      line-height: 1.4;
    }
  }

  .reporter-info-cell {
    .reporter-name {
      font-weight: 500;
      color: #262626;
      margin-bottom: 2px;
    }
    
    .reporter-phone {
      font-size: 12px;
      color: #595959;
      margin-bottom: 2px;
    }
    
    .report-time {
      font-size: 12px;
      color: #8c8c8c;
    }
  }

  .processor-info {
    .processor-name {
      font-weight: 500;
      color: #262626;
      margin-bottom: 2px;
    }
    
    .process-time {
      font-size: 12px;
      color: #8c8c8c;
    }
  }

  .not-assigned {
    color: #bfbfbf;
    font-style: italic;
  }

  .status-time {
    font-size: 12px;
    color: #8c8c8c;
    margin-top: 2px;
  }

  .attachments-cell {
    text-align: center;
  }
}

@media (max-width: 768px) {
  .repair-message-list {
    .table-operator {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      
      .statistics-info {
        margin-left: 0;
        order: -1;
      }
    }
    
    .statistics-info {
      .ant-statistic-group {
        display: flex;
        justify-content: space-around;
        
        .ant-statistic {
          margin: 0;
          text-align: center;
        }
      }
    }
  }
}
</style>
