<template>
  <div class="system-config">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">
          <a-icon type="setting" />
          系统配置
        </h2>
        <div class="header-actions">
          <a-button type="primary" @click="showAddModal">
            <a-icon type="plus" />
            新增服务器
          </a-button>
          <a-button @click="exportConfig">
            <a-icon type="export" />
            导出配置
          </a-button>
          <a-button @click="importConfig">
            <a-icon type="import" />
            导入配置
          </a-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="6" :lg="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">服务器总数</div>
            </div>
            <a-icon type="server" class="stat-icon" />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6" :lg="6">
          <a-card class="stat-card online">
            <div class="stat-content">
              <div class="stat-value">{{ stats.online }}</div>
              <div class="stat-label">在线服务器</div>
            </div>
            <a-icon type="check-circle" class="stat-icon" />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6" :lg="6">
          <a-card class="stat-card offline">
            <div class="stat-content">
              <div class="stat-value">{{ stats.offline }}</div>
              <div class="stat-label">离线服务器</div>
            </div>
            <a-icon type="exclamation-circle" class="stat-icon" />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6" :lg="6">
          <a-card class="stat-card warning">
            <div class="stat-content">
              <div class="stat-value">{{ stats.warning }}</div>
              <div class="stat-label">异常服务器</div>
            </div>
            <a-icon type="warning" class="stat-icon" />
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 筛选和搜索 -->
    <a-card class="filter-card">
      <a-form layout="inline">
        <a-form-item label="服务器类型">
          <a-select
            v-model="searchParams.serverType"
            placeholder="选择服务器类型"
            style="width: 150px"
            @change="handleSearch"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="web">Web服务器</a-select-option>
            <a-select-option value="database">数据库服务器</a-select-option>
            <a-select-option value="cache">缓存服务器</a-select-option>
            <a-select-option value="message">消息服务器</a-select-option>
            <a-select-option value="file">文件服务器</a-select-option>
            <a-select-option value="monitor">监控服务器</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="运行状态">
          <a-select
            v-model="searchParams.status"
            placeholder="选择状态"
            style="width: 120px"
            @change="handleSearch"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="online">在线</a-select-option>
            <a-select-option value="offline">离线</a-select-option>
            <a-select-option value="warning">异常</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="协议类型">
          <a-select
            v-model="searchParams.protocol"
            placeholder="选择协议"
            style="width: 120px"
            @change="handleSearch"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="HTTP">HTTP</a-select-option>
            <a-select-option value="HTTPS">HTTPS</a-select-option>
            <a-select-option value="TCP">TCP</a-select-option>
            <a-select-option value="UDP">UDP</a-select-option>
            <a-select-option value="MQTT">MQTT</a-select-option>
            <a-select-option value="WebSocket">WebSocket</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="关键词">
          <a-input
            v-model="searchParams.keyword"
            placeholder="搜索服务器名称或IP"
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

    <!-- 服务器配置表格 -->
    <a-card class="table-card">
      <a-table
        :columns="columns"
        :data-source="servers.records"
        :pagination="pagination"
        :loading="loading"
        :scroll="{ x: 1500 }"
        @change="handleTableChange"
        size="middle"
        :row-selection="rowSelection"
      >
        <!-- 服务器状态列 -->
        <template slot="status" slot-scope="status">
          <a-badge
            :status="getStatusBadge(status)"
            :text="getStatusText(status)"
          />
        </template>

        <!-- 服务器类型列 -->
        <template slot="serverType" slot-scope="type">
          <a-tag :color="getTypeColor(type)">
            <a-icon :type="getTypeIcon(type)" />
            {{ getTypeText(type) }}
          </a-tag>
        </template>

        <!-- 服务器信息列 -->
        <template slot="serverInfo" slot-scope="text, record">
          <div class="server-info">
            <div class="server-name">
              <a-icon :type="getTypeIcon(record.server_type)" />
              {{ record.server_name }}
            </div>
            <div class="server-desc">{{ record.description }}</div>
          </div>
        </template>

        <!-- 连接信息列 -->
        <template slot="connection" slot-scope="text, record">
          <div class="connection-info">
            <div class="conn-item">
              <span class="label">IP:</span>
              <a-tag color="blue">{{ record.ip_address }}</a-tag>
            </div>
            <div class="conn-item">
              <span class="label">端口:</span>
              <span class="value">{{ record.port }}</span>
            </div>
            <div class="conn-item">
              <span class="label">协议:</span>
              <a-tag :color="getProtocolColor(record.protocol)">
                {{ record.protocol }}
              </a-tag>
            </div>
          </div>
        </template>

        <!-- 安全配置列 -->
        <template slot="security" slot-scope="text, record">
          <div class="security-info">
            <div class="security-item">
              <a-icon
                :type="record.ssl_enabled ? 'lock' : 'unlock'"
                :style="{ color: record.ssl_enabled ? '#52c41a' : '#f5222d' }"
              />
              <span>{{ record.ssl_enabled ? 'SSL启用' : 'SSL禁用' }}</span>
            </div>
            <div class="security-item">
              <a-icon
                :type="record.auth_required ? 'safety-certificate' : 'stop'"
                :style="{ color: record.auth_required ? '#52c41a' : '#faad14' }"
              />
              <span>{{ record.auth_required ? '需要认证' : '无需认证' }}</span>
            </div>
          </div>
        </template>

        <!-- 性能指标列 -->
        <template slot="performance" slot-scope="text, record">
          <div class="performance-info">
            <div class="perf-item">
              <span class="label">CPU:</span>
              <a-progress
                :percent="record.cpu_usage"
                size="small"
                :status="record.cpu_usage > 80 ? 'exception' : 'active'"
              />
            </div>
            <div class="perf-item">
              <span class="label">内存:</span>
              <a-progress
                :percent="record.memory_usage"
                size="small"
                :status="record.memory_usage > 80 ? 'exception' : 'active'"
              />
            </div>
          </div>
        </template>

        <!-- 最后更新时间列 -->
        <template slot="updateTime" slot-scope="time">
          <div class="update-time">
            {{ formatTime(time) }}
          </div>
        </template>

        <!-- 操作列 -->
        <template slot="action" slot-scope="text, record">
          <div class="action-buttons">
            <a-button size="small" @click="testConnection(record)">
              <a-icon type="api" />
              测试
            </a-button>
            <a-button size="small" @click="viewDetail(record)">
              <a-icon type="eye" />
              详情
            </a-button>
            <a-button size="small" type="primary" @click="editServer(record)">
              <a-icon type="edit" />
              编辑
            </a-button>
            <a-popconfirm
              title="确定要删除这个服务器配置吗？"
              @confirm="deleteServer(record)"
              okText="确定"
              cancelText="取消"
            >
              <a-button size="small" type="danger">
                <a-icon type="delete" />
                删除
              </a-button>
            </a-popconfirm>
          </div>
        </template>
      </a-table>
    </a-card>

    <!-- 服务器配置弹窗 -->
    <ServerConfigModal
      :visible="showConfigModal"
      :data="selectedServer"
      :mode="configModalMode"
      @close="showConfigModal = false"
      @refresh="loadServers"
    />

    <!-- 服务器详情弹窗 -->
    <ServerDetailModal
      :visible="showDetailModal"
      :data="selectedServer"
      @close="showDetailModal = false"
    />

    <!-- 批量操作弹窗 -->
    <BatchOperationModal
      :visible="showBatchModal"
      :selected-servers="selectedServers"
      @close="showBatchModal = false"
      @refresh="loadServers"
    />

    <!-- 文件上传弹窗 -->
    <input
      ref="fileInput"
      type="file"
      accept=".json,.csv"
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>

<script>
import moment from 'moment'
import ServerConfigModal from './components/ServerConfigModal'
import ServerDetailModal from './components/ServerDetailModal'
import BatchOperationModal from './components/BatchOperationModal'

export default {
  name: 'SystemConfig',
  components: {
    ServerConfigModal,
    ServerDetailModal,
    BatchOperationModal
  },
  data() {
    return {
      loading: false,
      showConfigModal: false,
      showDetailModal: false,
      showBatchModal: false,
      selectedServer: null,
      configModalMode: 'create',
      selectedRowKeys: [],
      selectedRows: [],

      // 搜索参数
      searchParams: {
        serverType: '',
        status: '',
        protocol: '',
        keyword: ''
      },

      // 统计数据
      stats: {
        total: 0,
        online: 0,
        offline: 0,
        warning: 0
      },

      // 服务器数据
      servers: {
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
          title: '状态',
          dataIndex: 'status',
          width: 100,
          scopedSlots: { customRender: 'status' },
          filters: [
            { text: '在线', value: 'online' },
            { text: '离线', value: 'offline' },
            { text: '异常', value: 'warning' }
          ]
        },
        {
          title: '服务器信息',
          dataIndex: 'server_info',
          width: 200,
          scopedSlots: { customRender: 'serverInfo' }
        },
        {
          title: '类型',
          dataIndex: 'server_type',
          width: 120,
          scopedSlots: { customRender: 'serverType' },
          filters: [
            { text: 'Web服务器', value: 'web' },
            { text: '数据库服务器', value: 'database' },
            { text: '缓存服务器', value: 'cache' },
            { text: '消息服务器', value: 'message' },
            { text: '文件服务器', value: 'file' },
            { text: '监控服务器', value: 'monitor' }
          ]
        },
        {
          title: '连接信息',
          dataIndex: 'connection',
          width: 220,
          scopedSlots: { customRender: 'connection' }
        },
        {
          title: '安全配置',
          dataIndex: 'security',
          width: 140,
          scopedSlots: { customRender: 'security' }
        },
        {
          title: '性能指标',
          dataIndex: 'performance',
          width: 160,
          scopedSlots: { customRender: 'performance' }
        },
        {
          title: '最后更新',
          dataIndex: 'last_update',
          width: 140,
          scopedSlots: { customRender: 'updateTime' },
          sorter: true
        },
        {
          title: '操作',
          width: 200,
          fixed: 'right',
          scopedSlots: { customRender: 'action' }
        }
      ]
    }
  },

  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange,
        onSelectAll: this.onSelectAll
      }
    },

    selectedServers() {
      return this.selectedRows
    }
  },

  created() {
    this.loadStats()
    this.loadServers()
  },

  methods: {
    // 加载统计数据
    async loadStats() {
      try {
        // 模拟API调用
        this.stats = {
          total: 24,
          online: 18,
          offline: 3,
          warning: 3
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    },

    // 加载服务器数据
    async loadServers() {
      this.loading = true
      try {
        const params = this.getSearchParams()
        const data = await this.fetchServers(params)
        
        this.servers = data
        this.pagination.total = data.total
      } catch (error) {
        console.error('加载服务器配置失败:', error)
        this.$message.error('加载服务器配置失败')
      } finally {
        this.loading = false
      }
    },

    // 获取搜索参数
    getSearchParams() {
      return {
        ...this.searchParams,
        page: this.pagination.current,
        pageSize: this.pagination.pageSize
      }
    },

    // 模拟获取服务器数据
    async fetchServers(params) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockData = this.generateMockServers(params)
          resolve(mockData)
        }, 800)
      })
    },

    // 生成模拟服务器数据
    generateMockServers(params) {
      const serverTypes = ['web', 'database', 'cache', 'message', 'file', 'monitor']
      const statuses = ['online', 'offline', 'warning']
      const protocols = ['HTTP', 'HTTPS', 'TCP', 'UDP', 'MQTT', 'WebSocket']
      
      const servers = []
      for (let i = 1; i <= 50; i++) {
        const serverType = serverTypes[Math.floor(Math.random() * serverTypes.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const protocol = protocols[Math.floor(Math.random() * protocols.length)]
        
        servers.push({
          id: i,
          server_name: `${this.getTypeText(serverType)}-${String(i).padStart(2, '0')}`,
          server_type: serverType,
          description: this.getServerDescription(serverType),
          ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          port: this.getDefaultPort(protocol),
          protocol: protocol,
          status: status,
          ssl_enabled: Math.random() > 0.5,
          auth_required: Math.random() > 0.3,
          cpu_usage: Math.floor(Math.random() * 100),
          memory_usage: Math.floor(Math.random() * 100),
          disk_usage: Math.floor(Math.random() * 100),
          network_in: Math.floor(Math.random() * 1000),
          network_out: Math.floor(Math.random() * 1000),
          last_update: moment().subtract(Math.floor(Math.random() * 60), 'minutes').format(),
          created_at: moment().subtract(Math.floor(Math.random() * 30), 'days').format(),
          environment: ['production', 'staging', 'development'][Math.floor(Math.random() * 3)],
          version: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
          config: {
            max_connections: Math.floor(Math.random() * 1000) + 100,
            timeout: Math.floor(Math.random() * 30) + 5,
            retry_attempts: Math.floor(Math.random() * 5) + 1
          }
        })
      }

      // 应用筛选
      let filteredServers = servers
      if (params.serverType) {
        filteredServers = filteredServers.filter(server => server.server_type === params.serverType)
      }
      if (params.status) {
        filteredServers = filteredServers.filter(server => server.status === params.status)
      }
      if (params.protocol) {
        filteredServers = filteredServers.filter(server => server.protocol === params.protocol)
      }
      if (params.keyword) {
        filteredServers = filteredServers.filter(server =>
          server.server_name.toLowerCase().includes(params.keyword.toLowerCase()) ||
          server.ip_address.includes(params.keyword)
        )
      }

      // 分页
      const start = (params.page - 1) * params.pageSize
      const end = start + params.pageSize
      
      return {
        records: filteredServers.slice(start, end),
        total: filteredServers.length
      }
    },

    getServerDescription(type) {
      const descriptions = {
        web: 'Web应用服务器，提供HTTP服务',
        database: '数据库服务器，存储业务数据',
        cache: '缓存服务器，提供数据缓存服务',
        message: '消息队列服务器，处理异步消息',
        file: '文件存储服务器，管理文件资源',
        monitor: '监控服务器，系统监控和告警'
      }
      return descriptions[type] || '服务器'
    },

    getDefaultPort(protocol) {
      const ports = {
        HTTP: 80,
        HTTPS: 443,
        TCP: 8080,
        UDP: 8081,
        MQTT: 1883,
        WebSocket: 8082
      }
      return ports[protocol] || 8080
    },

    // 搜索处理
    handleSearch() {
      this.pagination.current = 1
      this.loadServers()
    },

    // 重置搜索
    resetSearch() {
      this.searchParams = {
        serverType: '',
        status: '',
        protocol: '',
        keyword: ''
      }
      this.pagination.current = 1
      this.loadServers()
    },

    // 表格变化处理
    handleTableChange(pagination, filters, sorter) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
      this.loadServers()
    },

    // 行选择
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    onSelectAll(selected, selectedRows, changeRows) {
      // 处理全选逻辑
    },

    // 新增服务器
    showAddModal() {
      this.selectedServer = null
      this.configModalMode = 'create'
      this.showConfigModal = true
    },

    // 编辑服务器
    editServer(record) {
      this.selectedServer = record
      this.configModalMode = 'edit'
      this.showConfigModal = true
    },

    // 查看详情
    viewDetail(record) {
      this.selectedServer = record
      this.showDetailModal = true
    },

    // 测试连接
    async testConnection(record) {
      try {
        this.$message.loading('正在测试连接...', 0)
        
        // 模拟连接测试
        setTimeout(() => {
          this.$message.destroy()
          const success = Math.random() > 0.3
          if (success) {
            this.$message.success(`${record.server_name} 连接测试成功`)
          } else {
            this.$message.error(`${record.server_name} 连接测试失败`)
          }
        }, 2000)
      } catch (error) {
        this.$message.destroy()
        this.$message.error('连接测试失败')
      }
    },

    // 删除服务器
    async deleteServer(record) {
      try {
        // 模拟删除操作
        await this.mockApiCall()
        this.$message.success('服务器配置删除成功')
        this.loadServers()
      } catch (error) {
        console.error('删除失败:', error)
        this.$message.error('删除失败')
      }
    },

    // 导出配置
    exportConfig() {
      try {
        const configData = {
          servers: this.servers.records,
          exported_at: moment().format(),
          version: '1.0'
        }
        
        const blob = new Blob([JSON.stringify(configData, null, 2)], {
          type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `server_config_${moment().format('YYYYMMDD_HHmmss')}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        this.$message.success('配置导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败')
      }
    },

    // 导入配置
    importConfig() {
      this.$refs.fileInput.click()
    },

    // 处理文件导入
    handleFileImport(event) {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const configData = JSON.parse(e.target.result)
          this.processImportedConfig(configData)
        } catch (error) {
          console.error('解析文件失败:', error)
          this.$message.error('文件格式错误')
        }
      }
      reader.readAsText(file)
    },

    // 处理导入的配置
    processImportedConfig(configData) {
      this.$confirm({
        title: '确认导入',
        content: `即将导入 ${configData.servers?.length || 0} 个服务器配置，是否继续？`,
        okText: '确认导入',
        cancelText: '取消',
        onOk: () => {
          // 模拟导入处理
          this.$message.success('配置导入成功')
          this.loadServers()
        }
      })
    },

    // 工具方法
    async mockApiCall() {
      return new Promise((resolve) => {
        setTimeout(resolve, 1000)
      })
    },

    getStatusBadge(status) {
      const badges = {
        online: 'success',
        offline: 'error',
        warning: 'warning'
      }
      return badges[status] || 'default'
    },

    getStatusText(status) {
      const texts = {
        online: '在线',
        offline: '离线',
        warning: '异常'
      }
      return texts[status] || status
    },

    getTypeColor(type) {
      const colors = {
        web: 'blue',
        database: 'green',
        cache: 'orange',
        message: 'purple',
        file: 'cyan',
        monitor: 'red'
      }
      return colors[type] || 'default'
    },

    getTypeIcon(type) {
      const icons = {
        web: 'global',
        database: 'database',
        cache: 'thunderbolt',
        message: 'message',
        file: 'folder',
        monitor: 'monitor'
      }
      return icons[type] || 'server'
    },

    getTypeText(type) {
      const texts = {
        web: 'Web服务器',
        database: '数据库服务器',
        cache: '缓存服务器',
        message: '消息服务器',
        file: '文件服务器',
        monitor: '监控服务器'
      }
      return texts[type] || type
    },

    getProtocolColor(protocol) {
      const colors = {
        HTTP: 'blue',
        HTTPS: 'green',
        TCP: 'orange',
        UDP: 'purple',
        MQTT: 'cyan',
        WebSocket: 'red'
      }
      return colors[protocol] || 'default'
    },

    formatTime(time) {
      return moment(time).format('MM-DD HH:mm')
    }
  }
}
</script>

<style scoped>
.system-config {
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

      &.online {
        border-left: 4px solid #52c41a;
      }

      &.offline {
        border-left: 4px solid #f5222d;
      }

      &.warning {
        border-left: 4px solid #faad14;
      }

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
    .server-info {
      .server-name {
        font-weight: 500;
        color: #262626;
        margin-bottom: 2px;

        .anticon {
          margin-right: 4px;
          color: #1890ff;
        }
      }

      .server-desc {
        font-size: 12px;
        color: #8c8c8c;
      }
    }

    .connection-info {
      .conn-item {
        display: flex;
        align-items: center;
        margin-bottom: 2px;
        font-size: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          width: 30px;
          color: #8c8c8c;
        }

        .value {
          color: #262626;
        }
      }
    }

    .security-info {
      .security-item {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        font-size: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .anticon {
          margin-right: 4px;
        }
      }
    }

    .performance-info {
      .perf-item {
        display: flex;
        align-items: center;
        margin-bottom: 4px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          width: 40px;
          font-size: 12px;
          color: #8c8c8c;
        }

        .ant-progress {
          flex: 1;
          margin-left: 8px;
        }
      }
    }

    .update-time {
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      color: #595959;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
  }
}

@media (max-width: 768px) {
  .system-config {
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

    .table-card {
      .action-buttons {
        .ant-btn {
          margin: 2px;
        }
      }
    }
  }
}
</style>
