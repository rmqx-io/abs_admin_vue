<template>
  <div class="log-management">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">
          <a-icon type="file-text" />
          日志管理
        </h2>
        <div class="header-actions">
          <a-button type="primary" @click="showCleanupModal = true">
            <a-icon type="delete" />
            日志清理
          </a-button>
          <a-button @click="exportLogs">
            <a-icon type="export" />
            导出日志
          </a-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stats.device }}</div>
              <div class="stat-label">设备日志</div>
            </div>
            <a-icon type="laptop" class="stat-icon" />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stats.user }}</div>
              <div class="stat-label">用户日志</div>
            </div>
            <a-icon type="user" class="stat-icon" />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stats.admin }}</div>
              <div class="stat-label">后台日志</div>
            </div>
            <a-icon type="setting" class="stat-icon" />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stats.operation }}</div>
              <div class="stat-label">操作日志</div>
            </div>
            <a-icon type="interaction" class="stat-icon" />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stats.maintenance }}</div>
              <div class="stat-label">维修日志</div>
            </div>
            <a-icon type="tool" class="stat-icon" />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ formatSize(stats.totalSize) }}</div>
              <div class="stat-label">总存储</div>
            </div>
            <a-icon type="database" class="stat-icon" />
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 筛选和搜索 -->
    <a-card class="filter-card">
      <a-form layout="inline" :form="searchForm">
        <a-form-item label="日志类型">
          <a-select
            v-decorator="['logType']"
            placeholder="选择日志类型"
            style="width: 150px"
            @change="handleSearch"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="device">设备日志</a-select-option>
            <a-select-option value="user">用户日志</a-select-option>
            <a-select-option value="admin">后台日志</a-select-option>
            <a-select-option value="operation">操作日志</a-select-option>
            <a-select-option value="maintenance">维修日志</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="日志级别">
          <a-select
            v-decorator="['level']"
            placeholder="选择级别"
            style="width: 120px"
            @change="handleSearch"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="info">信息</a-select-option>
            <a-select-option value="warn">警告</a-select-option>
            <a-select-option value="error">错误</a-select-option>
            <a-select-option value="debug">调试</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="时间范围">
          <a-range-picker
            v-decorator="['dateRange']"
            @change="handleSearch"
            :show-time="{ format: 'HH:mm' }"
            format="YYYY-MM-DD HH:mm"
          />
        </a-form-item>

        <a-form-item label="关键词">
          <a-input
            v-decorator="['keyword']"
            placeholder="搜索日志内容"
            style="width: 200px"
            @pressEnter="handleSearch"
          >
            <a-icon slot="suffix" type="search" @click="handleSearch" />
          </a-input>
        </a-form-item>

        <a-form-item>
          <a-button @click="resetSearch">
            <a-icon type="reload" />
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 日志表格 -->
    <a-card class="table-card">
      <a-table
        :columns="columns"
        :data-source="logs.records"
        :pagination="pagination"
        :loading="loading"
        :scroll="{ x: 1200 }"
        @change="handleTableChange"
        size="middle"
      >
        <!-- 日志类型列 -->
        <template slot="logType" slot-scope="type">
          <a-tag :color="getLogTypeColor(type)">
            <a-icon :type="getLogTypeIcon(type)" />
            {{ getLogTypeText(type) }}
          </a-tag>
        </template>

        <!-- 日志级别列 -->
        <template slot="level" slot-scope="level">
          <a-tag :color="getLevelColor(level)">
            {{ getLevelText(level) }}
          </a-tag>
        </template>

        <!-- 用户/设备信息列 -->
        <template slot="source" slot-scope="text, record">
          <div class="source-info">
            <div class="source-name">{{ record.source_name }}</div>
            <div class="source-id">{{ record.source_id }}</div>
          </div>
        </template>

        <!-- 日志内容列 -->
        <template slot="content" slot-scope="content">
          <div class="log-content">
            <a-tooltip :title="content">
              <div class="content-preview">{{ content }}</div>
            </a-tooltip>
          </div>
        </template>

        <!-- IP地址列 -->
        <template slot="ip" slot-scope="ip">
          <a-tag v-if="ip" color="blue">{{ ip }}</a-tag>
        </template>

        <!-- 时间列 -->
        <template slot="timestamp" slot-scope="timestamp">
          <div class="timestamp">
            {{ formatTimestamp(timestamp) }}
          </div>
        </template>

        <!-- 操作列 -->
        <template slot="action" slot-scope="text, record">
          <div class="action-buttons">
            <a-button size="small" @click="viewDetail(record)">
              <a-icon type="eye" />
              详情
            </a-button>
            <a-button
              v-if="record.log_type === 'maintenance'"
              size="small"
              type="primary"
              @click="editMaintenanceLog(record)"
            >
              <a-icon type="edit" />
              编辑
            </a-button>
          </div>
        </template>
      </a-table>
    </a-card>

    <!-- 日志详情弹窗 -->
    <LogDetailModal
      :visible="showDetailModal"
      :data="selectedLog"
      @close="showDetailModal = false"
    />

    <!-- 维修日志编辑弹窗 -->
    <MaintenanceLogModal
      :visible="showMaintenanceModal"
      :data="selectedLog"
      :mode="maintenanceModalMode"
      @close="showMaintenanceModal = false"
      @refresh="loadLogs"
    />

    <!-- 日志清理弹窗 -->
    <LogCleanupModal
      :visible="showCleanupModal"
      @close="showCleanupModal = false"
      @refresh="loadStats"
    />
  </div>
</template>

<script>
import moment from 'moment'
import LogDetailModal from './components/LogDetailModal'
import MaintenanceLogModal from './components/MaintenanceLogModal'
import LogCleanupModal from './components/LogCleanupModal'

export default {
  name: 'LogManagement',
  components: {
    LogDetailModal,
    MaintenanceLogModal,
    LogCleanupModal
  },
  data() {
    return {
      searchForm: this.$form.createForm(this),
      loading: false,
      showDetailModal: false,
      showMaintenanceModal: false,
      showCleanupModal: false,
      selectedLog: null,
      maintenanceModalMode: 'create',
      
      // 统计数据
      stats: {
        device: 0,
        user: 0,
        admin: 0,
        operation: 0,
        maintenance: 0,
        totalSize: 0
      },

      // 日志数据
      logs: {
        records: [],
        total: 0
      },

      // 分页配置
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
      },

      // 表格列配置
      columns: [
        {
          title: '日志类型',
          dataIndex: 'log_type',
          width: 120,
          scopedSlots: { customRender: 'logType' },
          filters: [
            { text: '设备日志', value: 'device' },
            { text: '用户日志', value: 'user' },
            { text: '后台日志', value: 'admin' },
            { text: '操作日志', value: 'operation' },
            { text: '维修日志', value: 'maintenance' }
          ]
        },
        {
          title: '级别',
          dataIndex: 'level',
          width: 80,
          scopedSlots: { customRender: 'level' },
          filters: [
            { text: '信息', value: 'info' },
            { text: '警告', value: 'warn' },
            { text: '错误', value: 'error' },
            { text: '调试', value: 'debug' }
          ]
        },
        {
          title: '来源',
          dataIndex: 'source',
          width: 150,
          scopedSlots: { customRender: 'source' }
        },
        {
          title: '日志内容',
          dataIndex: 'content',
          scopedSlots: { customRender: 'content' }
        },
        {
          title: 'IP地址',
          dataIndex: 'ip_address',
          width: 120,
          scopedSlots: { customRender: 'ip' }
        },
        {
          title: '时间',
          dataIndex: 'timestamp',
          width: 160,
          scopedSlots: { customRender: 'timestamp' },
          sorter: true,
          defaultSortOrder: 'descend'
        },
        {
          title: '操作',
          width: 150,
          scopedSlots: { customRender: 'action' }
        }
      ]
    }
  },

  created() {
    this.loadStats()
    this.loadLogs()
  },

  methods: {
    // 加载统计数据
    async loadStats() {
      try {
        // 模拟API调用
        this.stats = {
          device: 15432,
          user: 8765,
          admin: 1234,
          operation: 23456,
          maintenance: 456,
          totalSize: 1024 * 1024 * 128 // 128MB
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    },

    // 加载日志数据
    async loadLogs() {
      this.loading = true
      try {
        const params = this.getSearchParams()
        const data = await this.fetchLogs(params)
        
        this.logs = data
        this.pagination.total = data.total
      } catch (error) {
        console.error('加载日志失败:', error)
        this.$message.error('加载日志失败')
      } finally {
        this.loading = false
      }
    },

    // 获取搜索参数
    getSearchParams() {
      const values = this.searchForm.getFieldsValue()
      return {
        logType: values.logType,
        level: values.level,
        keyword: values.keyword,
        startTime: values.dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        endTime: values.dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
        page: this.pagination.current,
        pageSize: this.pagination.pageSize
      }
    },

    // 模拟获取日志数据
    async fetchLogs(params) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockData = this.generateMockLogs(params)
          resolve(mockData)
        }, 800)
      })
    },

    // 生成模拟日志数据
    generateMockLogs(params) {
      const logTypes = ['device', 'user', 'admin', 'operation', 'maintenance']
      const levels = ['info', 'warn', 'error', 'debug']
      
      const logs = []
      for (let i = 1; i <= 200; i++) {
        const logType = logTypes[Math.floor(Math.random() * logTypes.length)]
        const level = levels[Math.floor(Math.random() * levels.length)]
        
        logs.push({
          id: i,
          log_type: logType,
          level: level,
          source_name: this.getSourceName(logType),
          source_id: this.getSourceId(logType),
          content: this.getLogContent(logType, level),
          ip_address: this.getRandomIP(),
          timestamp: moment().subtract(Math.floor(Math.random() * 30), 'days').format(),
          user_agent: 'Mozilla/5.0...',
          extra_data: {}
        })
      }

      // 应用筛选
      let filteredLogs = logs
      if (params.logType) {
        filteredLogs = filteredLogs.filter(log => log.log_type === params.logType)
      }
      if (params.level) {
        filteredLogs = filteredLogs.filter(log => log.level === params.level)
      }
      if (params.keyword) {
        filteredLogs = filteredLogs.filter(log =>
          log.content.toLowerCase().includes(params.keyword.toLowerCase())
        )
      }

      // 分页
      const start = (params.page - 1) * params.pageSize
      const end = start + params.pageSize
      
      return {
        records: filteredLogs.slice(start, end),
        total: filteredLogs.length
      }
    },

    getSourceName(logType) {
      const names = {
        device: ['智能开关001', '温度传感器002', '智能灯具003', '水位传感器004'],
        user: ['张三', '李四', '王五', '赵六'],
        admin: ['管理员', '超级管理员', '运维人员'],
        operation: ['系统管理员', '操作员A', '操作员B'],
        maintenance: ['维修师傅A', '维修师傅B', '维修师傅C']
      }
      const typeNames = names[logType] || ['未知']
      return typeNames[Math.floor(Math.random() * typeNames.length)]
    },

    getSourceId(logType) {
      const prefixes = {
        device: 'DEV',
        user: 'USER',
        admin: 'ADMIN',
        operation: 'OP',
        maintenance: 'MAINT'
      }
      const prefix = prefixes[logType] || 'UNKNOWN'
      return `${prefix}${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
    },

    getLogContent(logType, level) {
      const contents = {
        device: {
          info: '设备正常上线',
          warn: '设备温度过高',
          error: '设备连接失败',
          debug: '设备状态检查'
        },
        user: {
          info: '用户登录成功',
          warn: '用户多次登录失败',
          error: '用户账户被锁定',
          debug: '用户权限检查'
        },
        admin: {
          info: '管理员登录',
          warn: '管理员权限变更',
          error: '管理员操作失败',
          debug: '管理员操作记录'
        },
        operation: {
          info: '操作执行成功',
          warn: '操作需要确认',
          error: '操作执行失败',
          debug: '操作参数检查'
        },
        maintenance: {
          info: '维修任务完成',
          warn: '维修需要更多时间',
          error: '维修过程中出现问题',
          debug: '维修进度记录'
        }
      }
      
      return contents[logType]?.[level] || '日志内容'
    },

    getRandomIP() {
      return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    },

    // 搜索处理
    handleSearch() {
      this.pagination.current = 1
      this.loadLogs()
    },

    // 重置搜索
    resetSearch() {
      this.searchForm.resetFields()
      this.pagination.current = 1
      this.loadLogs()
    },

    // 表格变化处理
    handleTableChange(pagination, filters, sorter) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
      this.loadLogs()
    },

    // 查看详情
    viewDetail(record) {
      this.selectedLog = record
      this.showDetailModal = true
    },

    // 编辑维修日志
    editMaintenanceLog(record) {
      this.selectedLog = record
      this.maintenanceModalMode = 'edit'
      this.showMaintenanceModal = true
    },

    // 导出日志
    async exportLogs() {
      try {
        this.$message.info('正在导出日志...')
        // 模拟导出
        setTimeout(() => {
          this.$message.success('日志导出成功')
        }, 2000)
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败')
      }
    },

    // 获取日志类型颜色
    getLogTypeColor(type) {
      const colors = {
        device: 'blue',
        user: 'green',
        admin: 'purple',
        operation: 'orange',
        maintenance: 'red'
      }
      return colors[type] || 'default'
    },

    // 获取日志类型图标
    getLogTypeIcon(type) {
      const icons = {
        device: 'laptop',
        user: 'user',
        admin: 'setting',
        operation: 'interaction',
        maintenance: 'tool'
      }
      return icons[type] || 'file'
    },

    // 获取日志类型文本
    getLogTypeText(type) {
      const texts = {
        device: '设备',
        user: '用户',
        admin: '后台',
        operation: '操作',
        maintenance: '维修'
      }
      return texts[type] || type
    },

    // 获取级别颜色
    getLevelColor(level) {
      const colors = {
        info: 'blue',
        warn: 'orange',
        error: 'red',
        debug: 'gray'
      }
      return colors[level] || 'default'
    },

    // 获取级别文本
    getLevelText(level) {
      const texts = {
        info: '信息',
        warn: '警告',
        error: '错误',
        debug: '调试'
      }
      return texts[level] || level
    },

    // 格式化文件大小
    formatSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 格式化时间戳
    formatTimestamp(timestamp) {
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>

<style scoped>
.log-management {
  padding: 16px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);

  .page-header {
    margin-bottom: 16px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .page-title {
        margin: 0;
        color: #262626;
        font-size: 20px;
        font-weight: 500;

        .anticon {
          margin-right: 8px;
          color: #1890ff;
        }
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .stats-cards {
    margin-bottom: 16px;

    .stat-card {
      position: relative;
      overflow: hidden;

      .stat-content {
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #262626;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #8c8c8c;
        }
      }

      .stat-icon {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 32px;
        color: #1890ff;
        opacity: 0.1;
      }
    }
  }

  .filter-card {
    margin-bottom: 16px;
  }

  .table-card {
    .source-info {
      .source-name {
        font-weight: 500;
        color: #262626;
        margin-bottom: 2px;
      }

      .source-id {
        font-size: 12px;
        color: #8c8c8c;
      }
    }

    .log-content {
      .content-preview {
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .timestamp {
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      color: #595959;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }
  }
}

@media (max-width: 768px) {
  .log-management {
    padding: 8px;

    .page-header .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .stats-cards .ant-col {
      margin-bottom: 8px;
    }

    .filter-card .ant-form {
      .ant-form-item {
        margin-bottom: 8px;
      }
    }
  }
}
</style>
