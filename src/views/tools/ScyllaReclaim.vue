<template>
  <div class="scylla-reclaim-container">
    <!-- Status & Actions Card -->
    <a-card :bordered="false" class="premium-card status-card mb-4">
      <div class="card-header-gradient">
        <h3>任务控制中心</h3>
        <p>ScyllaDB 磁盘空间回收</p>
      </div>

      <a-row :gutter="24" type="flex" align="middle">
        <a-col :span="24" :md="14">
          <div class="status-indicator-section">
            <div class="status-label">当前运行状态</div>
            <div class="status-badge-wrapper">
              <a-badge :status="statusBadgeType" :text="statusText" class="premium-badge" />
              <div v-if="status.is_running" class="spinner-micro"></div>
            </div>
          </div>

          <div class="metadata-grid">
            <div class="metadata-item">
              <span class="label">上次运行时间</span>
              <span class="value">{{ status.last_run_time || '无记录' }}</span>
            </div>
            <div class="metadata-item">
              <span class="label">上次运行结果</span>
              <span class="value">
                <a-tag :color="resultTagColor" class="status-tag">
                  {{ status.last_run_status || '无记录' }}
                </a-tag>
              </span>
            </div>
          </div>
        </a-col>

        <a-col :span="24" :md="10" class="actions-col">
          <div class="control-actions">
            <a-button 
              type="danger" 
              icon="play-circle" 
              block 
              size="large" 
              class="run-btn shadow-btn" 
              :loading="runningLoading"
              :disabled="status.is_running"
              @click="confirmRunReclaim"
            >
              立即运行回收
            </a-button>
            <a-button 
              v-if="status.is_running"
              type="danger" 
              ghost
              icon="stop" 
              block 
              size="large" 
              class="stop-btn mt-3" 
              :loading="stoppingLoading"
              @click="confirmStopReclaim"
            >
              停止当前任务
            </a-button>
            <a-button 
              type="default" 
              icon="sync" 
              block 
              size="large" 
              class="refresh-btn mt-3" 
              :loading="loading" 
              @click="fetchStatusAndLogs"
            >
              刷新状态与日志
            </a-button>

          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- Real-time Stats Card -->
    <a-card :bordered="false" class="premium-card stats-card mb-4" v-if="realtimeStats && (realtimeStats.total_devices_processed > 0 || realtimeStats.start_time || status.is_running)">
      <div class="card-header-gradient-green">
        <h3>任务实时执行统计</h3>
        <p>实时显示当前或最近一次清理任务在各一级组织的执行细节</p>
      </div>

      <!-- Stats Overview Row -->
      <a-row :gutter="16" class="stats-overview-row mb-4">
        <a-col :span="6">
          <div class="stat-box">
            <div class="stat-title">总处理设备数</div>
            <div class="stat-number">{{ realtimeStats.total_devices_processed }}</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-box">
            <div class="stat-title">当前处理表</div>
            <div class="stat-number-small" :title="realtimeStats.current_table">{{ realtimeStats.current_table || '无' }}</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-box">
            <div class="stat-title">任务启动时间</div>
            <div class="stat-desc">{{ realtimeStats.start_time || '无' }}</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-box">
            <div class="stat-title">最近更新时间</div>
            <div class="stat-desc">{{ realtimeStats.last_update_time || '无' }}</div>
          </div>
        </a-col>
      </a-row>

      <!-- Per-Table Progress Table -->
      <div v-if="realtimeStats.tables && realtimeStats.tables.length > 0">
        <h4 class="section-title">单表处理进度</h4>
        <a-table 
          :columns="tableProgressColumns" 
          :data-source="realtimeStats.tables" 
          row-key="table_name"
          :pagination="false" 
          size="middle"
          class="mb-4"
        >
          <template slot="status" slot-scope="text">
            <a-tag :color="text === 'Completed' ? 'green' : text === 'Processing' ? 'blue' : text === 'Compacting' ? 'purple' : text === 'Pending' ? 'orange' : 'red'">
              {{ text === 'Completed' ? '已完成' : text === 'Processing' ? '清理中' : text === 'Compacting' ? '压缩中' : text === 'Pending' ? '等待中' : text === 'Cancelled' ? '已取消' : '失败' }}
            </a-tag>
          </template>
          <template slot="processed" slot-scope="text">
            <span class="processed-count">{{ text }} 台设备</span>
          </template>
        </a-table>
      </div>

      <!-- Depth-1 Orgs Table -->
      <h4 class="section-title">一级组织处理明细</h4>
      <a-table 
        :columns="realtimeStatsColumns" 
        :data-source="realtimeStats.depth1_orgs" 
        row-key="org_id"
        :pagination="false" 
        size="middle"
      >
        <template slot="retention_days" slot-scope="text">
          <a-tag color="blue">{{ text }} 天</a-tag>
        </template>
        <template slot="processed" slot-scope="text">
          <span class="processed-count">{{ text }} 台设备</span>
        </template>
      </a-table>
    </a-card>

    <!-- Organization Retention Policies Table -->
    <a-card :bordered="false" class="premium-card config-card mt-4">
      <div class="card-header-title" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3>一级组织自定义保留天数配置</h3>
          <span class="subtitle">针对特定一级组织，可自定义数据保留的天数。下级组织将自动继承其保留天数，未配置的组织将默认采用全局配置。</span>
        </div>
        <a-button type="primary" icon="plus" @click="showAddModal">
          添加一级组织自定义保留天数
        </a-button>
      </div>

      <a-table 
        :columns="orgColumns" 
        :data-source="filteredOrgList" 
        row-key="id"
        :pagination="{ pageSize: 5 }" 
        :loading="orgLoading"
        size="middle"
      >
        <template slot="scylla_retention_days" slot-scope="text, record">
          <a-input-number 
            :value="record.scylla_retention_days" 
            :min="1" 
            :max="3650"
            placeholder="默认天数"
            @change="(val) => handleOrgDaysChange(val, record)" 
          />
        </template>
        <template slot="action" slot-scope="text, record">
          <a-button 
            type="primary" 
            size="small" 
            icon="save" 
            @click="saveOrgConfig(record)"
          >
            保存
          </a-button>
          <a-button 
            type="default" 
            size="small" 
            style="margin-left: 8px;"
            @click="clearOrgConfig(record)"
          >
            清除策略
          </a-button>
        </template>
      </a-table>
    </a-card>

    <!-- Clean History Table -->
    <a-card :bordered="false" class="premium-card config-card mt-4">
      <div class="card-header-title">
        <h3>清理执行历史记录</h3>
        <span class="subtitle">展示最近 20 次执行的清理任务的起止时间、状态、触发类型和影响数据行数</span>
      </div>

      <a-table 
        :columns="historyColumns" 
        :data-source="historyList" 
        row-key="id"
        :pagination="{ pageSize: 5 }" 
        :loading="historyLoading"
        size="middle"
      >
        <template slot="status" slot-scope="text">
          <a-tag :color="getHistoryStatusTagColor(text)">
            {{ text === 'Running' ? '运行中' : (text === 'Success' ? '成功' : (text === 'Cancelled' ? '已取消' : '失败')) }}
          </a-tag>
        </template>

        <template slot="trigger_type" slot-scope="text">
          {{ text === 'Manual' ? '手动触发' : '定时计划' }}
        </template>
        <template slot="action" slot-scope="text, record">
          <a-button 
            type="link" 
            icon="file-text" 
            @click="showHistoryLogModal(record)"
          >
            查看历史日志
          </a-button>
          <a-button 
            v-if="record.reclaim_stats"
            type="link" 
            icon="line-chart" 
            @click="showHistoryStatsModal(record)"
          >
            查看统计
          </a-button>
        </template>
      </a-table>
    </a-card>

    <!-- History Log Modal -->
    <a-modal
      v-model="historyLogVisible"
      :title="'执行日志 - 任务 #' + activeHistoryId"
      :width="800"
      :footer="null"
      destroyOnClose
    >
      <div class="console-panel" style="height: 450px;">
        <pre class="console-text">{{ activeHistoryLogs || '加载日志中...' }}</pre>
      </div>
    </a-modal>

    <!-- History Stats Modal -->
    <a-modal
      v-model="historyStatsVisible"
      :title="'任务执行统计 - 任务 #' + activeHistoryId"
      :width="700"
      :footer="null"
      destroyOnClose
    >
      <div v-if="historyStatsData">
        <a-row :gutter="16" class="stats-overview-row mb-4">
          <a-col :span="12">
            <div class="stat-box">
              <div class="stat-title">总处理设备数</div>
              <div class="stat-number">{{ historyStatsData.total_devices_processed }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="stat-box">
              <div class="stat-title">最后处理表</div>
              <div class="stat-number-small" :title="historyStatsData.current_table">{{ historyStatsData.current_table || '无' }}</div>
            </div>
          </a-col>
        </a-row>

        <!-- Per-Table Progress Table in History -->
        <div v-if="historyStatsData.tables && historyStatsData.tables.length > 0">
          <h4 class="section-title">单表处理进度</h4>
          <a-table 
            :columns="tableProgressColumns" 
            :data-source="historyStatsData.tables" 
            row-key="table_name"
            :pagination="false" 
            size="middle"
            class="mb-4"
          >
            <template slot="status" slot-scope="text">
              <a-tag :color="text === 'Completed' ? 'green' : text === 'Processing' ? 'blue' : text === 'Compacting' ? 'purple' : text === 'Pending' ? 'orange' : 'red'">
                {{ text === 'Completed' ? '已完成' : text === 'Processing' ? '清理中' : text === 'Compacting' ? '压缩中' : text === 'Pending' ? '等待中' : text === 'Cancelled' ? '已取消' : '失败' }}
              </a-tag>
            </template>
            <template slot="processed" slot-scope="text">
              <span class="processed-count">{{ text }} 台设备</span>
            </template>
          </a-table>
        </div>

        <h4 class="section-title">一级组织处理明细</h4>
        <a-table 
          :columns="realtimeStatsColumns" 
          :data-source="historyStatsData.depth1_orgs" 
          row-key="org_id"
          :pagination="false" 
          size="middle"
        >
          <template slot="retention_days" slot-scope="text">
            <a-tag color="blue">{{ text }} 天</a-tag>
          </template>
          <template slot="processed" slot-scope="text">
            <span class="processed-count">{{ text }} 台设备</span>
          </template>
        </a-table>
      </div>
      <div v-else style="text-align: center; padding: 24px;">
        <a-empty description="暂无统计数据" />
      </div>
    </a-modal>

    <!-- Add Org Policy Modal -->
    <a-modal
      v-model="addModalVisible"
      title="添加一级组织自定义保留天数"
      @ok="handleAddModalOk"
      :confirmLoading="addModalConfirmLoading"
      destroyOnClose
    >
      <a-form :form="addForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="选择组织" required>
          <org-select
            v-decorator="['org_id', { rules: [{ required: true, message: '请选择一级组织' }] }]"
            :org-list="orgTree"
            placeholder="请选择一级组织"
            :selectable-node-check="checkSelectableNode"
          ></org-select>
        </a-form-item>
        <a-form-item label="保留天数" required>
          <a-input-number
            v-decorator="['scylla_retention_days', { rules: [{ required: true, message: '请输入保留天数' }], initialValue: 30 }]"
            :min="1"
            :max="3650"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Execution Logs Console -->
    <a-card :bordered="false" class="premium-card log-card mt-4">
      <div class="log-header">
        <div class="title-section">
          <a-icon type="code" class="console-icon" />
          <h3>执行日志输出</h3>
        </div>
        <div class="action-section">
          <a-checkbox v-model="autoScroll" class="console-checkbox">自动滚动到底部</a-checkbox>
          <a-button size="small" icon="delete" class="console-btn" @click="clearLogsView">清空屏幕</a-button>
          <a-button size="small" type="primary" icon="reload" class="console-btn" :loading="logsLoading" @click="fetchLogs">刷新日志</a-button>
        </div>
      </div>

      <div class="console-panel" ref="consolePanel">
        <pre class="console-text">{{ logs.logs || '等待日志载入...' }}</pre>
      </div>
    </a-card>

    <!-- Global Config Card -->
    <a-card :bordered="false" class="premium-card config-card mt-4">
      <div class="card-header-title">
        <h3>全局磁盘空间回收配置 (只读)</h3>
        <span class="subtitle" style="color: #faad14;">
          <a-icon type="warning" style="margin-right: 4px;" />
          注意：全局配置已设定为只读模式，仅能由系统管理员直接在服务器的 <code>/etc/default/scylla-disk-reclaim</code> 或者 <code>./scylla-disk-reclaim.env</code> 文件中进行修改。
        </span>
      </div>

      <a-spin :spinning="configLoading">
        <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="定时清理使能">
                <a-switch v-model="config.schedule_enabled" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="定时清理时间">
                <a-input v-model="config.schedule_time" placeholder="例如 03:00" disabled />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="最小磁盘剩余空间 (%)">
                <a-input-number v-model="config.min_free_pct" :min="0" :max="100" style="width: 100%" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="Keyspace 名称">
                <a-input v-model="config.keyspace" placeholder="rmqx" disabled />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="ScyllaDB 节点 IPs">
                <a-input v-model="config.scylla_nodes" placeholder="例如 10.0.0.4 10.0.0.8 10.0.0.10" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="数据挂载路径">
                <a-input v-model="config.data_mount" placeholder="/mnt/vdb" disabled />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="使用 Docker 容器">
                <a-switch v-model="config.use_docker" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="config.use_docker">
              <a-form-item label="Scylla 容器名称">
                <a-input v-model="config.scylla_container_name" placeholder="例如 scylladb" disabled />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="工作目录">
                <a-input v-model="config.work_dir" placeholder="/root/rmqx" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="日志输出目录">
                <a-input v-model="config.log_dir" placeholder="/root/scylla-maintenance/logs" disabled />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="清理 RMQX 快照">
                <a-switch v-model="config.clear_rmqx_snapshots" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="执行强制 Compaction">
                <a-switch v-model="config.run_forced_compaction" disabled />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24" v-if="config.run_forced_compaction">
            <a-col :span="24">
              <a-form-item label="Compaction 表名" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
                <a-select 
                  mode="tags" 
                  v-model="selectedTables" 
                  placeholder="选择或输入需要执行 Compaction 的表"
                  style="width: 100%"
                  disabled
                >
                  <a-select-option v-for="table in dbTables" :key="table" :value="table">
                    {{ table }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-spin>
    </a-card>
  </div>
</template>

<script>
import { Modal } from 'ant-design-vue'
import request from '@/utils/request'
import { api, getAdminOrgTree } from '@/api/manage'
import { OrgSelect } from '@/components'

export default {
  name: 'ScyllaReclaim',
  components: {
    OrgSelect
  },
  data() {
    return {
      status: {
        is_running: false,
        last_run_time: '',
        last_run_status: ''
      },
      realtimeStats: {
        total_devices_processed: 0,
        depth1_orgs: [],
        current_table: '',
        start_time: '',
        last_update_time: '',
        tables: []
      },
      realtimeStatsColumns: [
        {
          title: '组织 ID',
          dataIndex: 'org_id',
          key: 'org_id',
          width: '20%'
        },
        {
          title: '一级组织名称',
          dataIndex: 'org_name',
          key: 'org_name',
          width: '40%'
        },
        {
          title: '数据保留天数',
          dataIndex: 'retention_days',
          key: 'retention_days',
          scopedSlots: { customRender: 'retention_days' },
          width: '20%'
        },
        {
          title: '已处理设备数',
          dataIndex: 'processed',
          key: 'processed',
          scopedSlots: { customRender: 'processed' },
          width: '20%'
        }
      ],
      tableProgressColumns: [
        {
          title: '表名',
          dataIndex: 'table_name',
          key: 'table_name',
          width: '40%'
        },
        {
          title: '处理状态',
          dataIndex: 'status',
          key: 'status',
          scopedSlots: { customRender: 'status' },
          width: '30%'
        },
        {
          title: '已处理设备数',
          dataIndex: 'processed',
          key: 'processed',
          scopedSlots: { customRender: 'processed' },
          width: '30%'
        }
      ],
      logs: {
        logs: ''
      },
      config: {
        work_dir: '',
        log_dir: '',
        data_mount: '',
        min_free_pct: 20,
        scylla_nodes: '',
        keyspace: '',
        clear_rmqx_snapshots: false,
        run_forced_compaction: false,
        compaction_tables: '',
        schedule_enabled: false,
        schedule_time: '',
        use_docker: false,
        scylla_container_name: 'scylladb'
      },
      configLoading: false,
      configSaving: false,
      loading: false,
      runningLoading: false,
      stoppingLoading: false,
      logsLoading: false,
      selectedTables: [],
      dbTables: [],

      orgLoading: false,
      orgList: [],
      addModalVisible: false,
      addModalConfirmLoading: false,
      addForm: this.$form.createForm(this),
      allOrgs: [],
      orgTree: [],
      orgColumns: [
        {
          title: '组织 ID',
          dataIndex: 'id',
          key: 'id',
          width: '20%'
        },
        {
          title: '一级组织名称',
          dataIndex: 'name',
          key: 'name',
          width: '40%'
        },
        {
          title: 'ScyllaDB 保留天数 (天)',
          dataIndex: 'scylla_retention_days',
          key: 'scylla_retention_days',
          scopedSlots: { customRender: 'scylla_retention_days' },
          width: '20%'
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'action' },
          width: '20%'
        }
      ],
      historyList: [],
      historyLoading: false,
      historyColumns: [
        {
          title: '任务 ID',
          dataIndex: 'id',
          key: 'id',
          width: '10%'
        },
        {
          title: '开始时间',
          dataIndex: 'start_time',
          key: 'start_time',
          width: '20%'
        },
        {
          title: '结束时间',
          dataIndex: 'end_time',
          key: 'end_time',
          width: '20%'
        },
        {
          title: '执行状态',
          dataIndex: 'status',
          key: 'status',
          scopedSlots: { customRender: 'status' },
          width: '15%'
        },
        {
          title: '触发方式',
          dataIndex: 'trigger_type',
          key: 'trigger_type',
          width: '15%'
        },
        {
          title: '清理行数',
          dataIndex: 'rows_deleted',
          key: 'rows_deleted',
          width: '10%'
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'action' },
          width: '10%'
        }
      ],
      historyLogVisible: false,
      historyStatsVisible: false,
      historyStatsData: null,
      activeHistoryId: null,
      activeHistoryLogs: '',
      autoScroll: true,
      pollingInterval: null
    }
  },
  computed: {
    statusBadgeType() {
      if (this.status.is_running) return 'processing'
      if (this.status.last_run_status === 'Success') return 'success'
      if (this.status.last_run_status === 'Failed') return 'error'
      if (this.status.last_run_status === 'Cancelled') return 'warning'
      return 'default'
    },
    statusText() {
      if (this.status.is_running) return '清理执行中'
      if (this.status.last_run_status === 'Success') return '空闲 (上次成功)'
      if (this.status.last_run_status === 'Failed') return '空闲 (上次失败)'
      if (this.status.last_run_status === 'Cancelled') return '空闲 (上次已取消)'
      return '空闲 (无状态)'
    },
    resultTagColor() {
      const status = this.status.last_run_status
      if (status === 'Success') return 'green'
      if (status === 'Failed') return 'red'
      if (status === 'Cancelled') return 'gray'
      if (status === 'Running') return 'blue'
      return 'orange'
    },
    filteredOrgList() {
      if (this.allOrgs.length === 0) return this.orgList
      return this.orgList.filter(item => {
        const org = this.allOrgs.find(o => String(o.id) === String(item.id))
        return org ? org.isDepth1 : false
      })
    }
  },

  mounted() {
    this.fetchGlobalConfig()
    this.fetchDbTables()
    this.fetchOrgConfigs()
    this.fetchHistory()
    this.fetchAllOrgs()
    this.fetchRealtimeStats()
    this.initStatusAndPolling()
  },
  beforeDestroy() {
    this.stopPolling()
  },
  methods: {
    async initStatusAndPolling() {
      this.loading = true
      await this.fetchStatus()
      await this.fetchLogs()
      this.loading = false
      if (this.status.is_running) {
        this.startPolling()
      } else {
        this.startIdlePolling()
      }
    },
    startPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
      }
      this.pollingInterval = setInterval(async () => {
        await this.fetchStatus()
        if (this.status.is_running) {
          await this.fetchLogs()
          await this.fetchRealtimeStats()
        } else {
          await this.fetchHistory()
          await this.fetchRealtimeStats()
          this.stopPolling()
          this.startIdlePolling()
        }
      }, 2000)
    },
    startIdlePolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
      }
      this.pollingInterval = setInterval(async () => {
        await this.fetchStatus()
        if (this.status.is_running) {
          this.startPolling()
        }
      }, 8000)
    },
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }
    },
    async fetchStatus() {
      try {
        const res = await request({
          url: api.scylla_reclaim_status,
          method: 'get'
        })
        if (res && res.data) {
          this.status = res.data
        }
      } catch (error) {
        console.error(error)
      }
    },
    async fetchLogs() {
      this.logsLoading = true
      try {
        const res = await request({
          url: api.scylla_reclaim_logs,
          method: 'get'
        })
        if (res && res.data) {
          this.logs = res.data
          this.$nextTick(() => {
            this.scrollConsole()
          })
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.logsLoading = false
      }
    },
    async fetchRealtimeStats() {
      try {
        const res = await request({
          url: api.scylla_reclaim_realtime_stats,
          method: 'get'
        })
        if (res && res.data) {
          this.realtimeStats = res.data
        }
      } catch (error) {
        console.error(error)
      }
    },
    async fetchStatusAndLogs() {
      this.loading = true
      await this.fetchStatus()
      await this.fetchLogs()
      await this.fetchRealtimeStats()
      await this.fetchHistory()
      this.loading = false
      this.$message.success('状态已刷新')
    },
    confirmRunReclaim() {
      Modal.confirm({
        title: '确定要开始磁盘回收吗？',
        content: '数据回收任务将会在后台执行清理，并执行删除老旧 telemetry 数据及 snapshot 等资源。在高负载节点运行 Compact 可能会导致短时间内读取延迟升高。',
        okText: '确定运行',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          console.log('trigger reclaim')
          this.triggerReclaim()
        }
      })
    },
    async triggerReclaim() {
      this.runningLoading = true
      try {
        const res = await request({
          url: api.scylla_reclaim_run,
          method: 'post'
        })
        if (res && res.code === 'SUCCESS') {
          this.$message.success('ScyllaDB 磁盘空间回收任务已在后台触发')
          this.status.is_running = true
          this.startPolling()
        } else {
          this.$message.error(res.msg || '触发任务失败')
        }
      } catch (error) {
        this.$message.error('触发任务失败')
        console.error(error)
      } finally {
        this.runningLoading = false
      }
    },
    confirmStopReclaim() {
      Modal.confirm({
        title: '确定要停止当前的磁盘回收任务吗？',
        content: '停止任务将中断正在执行的清理和 compaction 操作。已经删除的数据不会恢复，但未执行的部分将被取消。',
        okText: '确定停止',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          this.stopReclaim()
        }
      })
    },
    async stopReclaim() {
      this.stoppingLoading = true
      try {
        const res = await request({
          url: api.scylla_reclaim_stop,
          method: 'post'
        })
        if (res && res.code === 'SUCCESS') {
          this.$message.success('已发送停止指令')
          await this.fetchStatus()
          await this.fetchLogs()
        } else {
          this.$message.error(res.msg || '停止任务失败')
        }
      } catch (error) {
        this.$message.error('停止任务失败')
        console.error(error)
      } finally {
        this.stoppingLoading = false
      }
    },

    async fetchGlobalConfig() {
      this.configLoading = true
      try {
        const res = await request({
          url: api.scylla_reclaim_config,
          method: 'get'
        })
        if (res && res.data) {
          this.config = res.data
          this.selectedTables = this.config.compaction_tables ? this.config.compaction_tables.trim().split(/\s+/) : []
        }
      } catch (error) {
        this.$message.error('获取全局配置失败')
        console.error(error)
      } finally {
        this.configLoading = false
      }
    },
    async fetchDbTables() {
      try {
        const res = await request({
          url: api.scylla_reclaim_tables,
          method: 'get'
        })
        if (res && res.code === 'SUCCESS') {
          this.dbTables = res.data || []
        }
      } catch (error) {
        console.error('获取数据库表列表失败', error)
      }
    },
    async saveGlobalConfig() {
      this.configSaving = true
      try {
        this.config.compaction_tables = this.selectedTables ? this.selectedTables.join(' ') : ''
        const res = await request({
          url: api.scylla_reclaim_config,
          method: 'post',
          data: this.config
        })
        if (res && res.code === 'SUCCESS') {
          this.$message.success('全局配置保存成功')
          this.fetchGlobalConfig()
        } else {
          this.$message.error(res.msg || '保存全局配置失败')
        }
      } catch (error) {
        this.$message.error('保存全局配置失败')
        console.error(error)
      } finally {
        this.configSaving = false
      }
    },
    async fetchOrgConfigs() {
      this.orgLoading = true
      try {
        const res = await request({
          url: api.scylla_reclaim_org_configs,
          method: 'get'
        })
        if (res && res.data) {
          this.orgList = res.data
        }
      } catch (error) {
        this.$message.error('获取组织配置失败')
        console.error(error)
      } finally {
        this.orgLoading = false
      }
    },
    handleOrgDaysChange(val, record) {
      record.scylla_retention_days = val
    },
    async saveOrgConfig(record) {
      try {
        const res = await request({
          url: api.scylla_reclaim_org_configs,
          method: 'post',
          data: {
            org_id: record.id,
            scylla_retention_days: record.scylla_retention_days
          }
        })
        if (res && res.code === 'SUCCESS') {
          this.$message.success(`组织【${record.name}】数据保留策略已成功保存`)
          this.fetchOrgConfigs()
        } else {
          this.$message.error(res.msg || '保存失败')
        }
      } catch (error) {
        this.$message.error('保存失败')
        console.error(error)
      }
    },
    async clearOrgConfig(record) {
      record.scylla_retention_days = null
      await this.saveOrgConfig(record)
    },
    scrollConsole() {
      if (this.autoScroll && this.$refs.consolePanel) {
        const el = this.$refs.consolePanel
        el.scrollTop = el.scrollHeight
      }
    },
    clearLogsView() {
      this.logs.logs = ''
    },
    async fetchHistory() {
      this.historyLoading = true
      try {
        const res = await request({
          url: api.scylla_reclaim_history,
          method: 'get'
        })
        if (res && res.data) {
          this.historyList = res.data
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.historyLoading = false
      }
    },
    getHistoryStatusTagColor(status) {
      if (status === 'Success') return 'green'
      if (status === 'Failed') return 'red'
      if (status === 'Running') return 'blue'
      return 'orange'
    },
    async showHistoryLogModal(record) {
      this.activeHistoryId = record.id
      this.historyLogVisible = true
      this.activeHistoryLogs = '加载日志中...'
      try {
        const res = await request({
          url: `${api.scylla_reclaim_history_logs}/${record.id}/logs`,
          method: 'get'
        })
        if (res && res.data) {
          this.activeHistoryLogs = res.data.logs || '暂无日志内容'
        } else {
          this.activeHistoryLogs = '日志内容加载失败'
        }
      } catch (error) {
        this.activeHistoryLogs = '日志内容加载出错'
        console.error(error)
      }
    },
    showHistoryStatsModal(record) {
      this.activeHistoryId = record.id
      this.historyStatsVisible = true
      this.historyStatsData = null
      if (record.reclaim_stats) {
        try {
          this.historyStatsData = JSON.parse(record.reclaim_stats)
        } catch (e) {
          console.error(e)
          this.$message.error('解析统计数据失败')
        }
      }
    },
    async fetchAllOrgs() {
      try {
        const res = await getAdminOrgTree()
        if (res && res.data) {
          const rootNode = res.data
          const list = []
          const isVirtualRoot = rootNode.value === '0' || rootNode.id === 0
          const flatten = (node, depth = 0) => {
            if (node) {
              let isDepth1 = false
              if (isVirtualRoot) {
                isDepth1 = depth === 1
              } else {
                isDepth1 = depth === 0
              }
              node.depth = depth
              node.isDepth1 = isDepth1
              
              if (node.value !== undefined) {
                node.id = parseInt(node.value)
              }
              if (node.title !== undefined) {
                node.name = node.title
              }

              list.push(node)
              const children = node.children || node.childs
              if (children && children.length) {
                children.forEach(child => flatten(child, depth + 1))
              }
            }
          }
          flatten(rootNode)
          this.allOrgs = list
          this.orgTree = [rootNode]
        }
      } catch (error) {
        console.error('获取所有组织失败:', error)
      }
    },
    checkSelectableNode(node) {
      return node.isDepth1
    },
    showAddModal() {
      this.addModalVisible = true
      this.$nextTick(() => {
        this.addForm.resetFields()
      })
    },
    handleAddModalOk() {
      this.addForm.validateFields(async (err, values) => {
        if (!err) {
          this.addModalConfirmLoading = true
          try {
            const org = this.allOrgs.find(item => String(item.id) === String(values.org_id))
            const orgName = org ? org.name : `ID: ${values.org_id}`
            const res = await request({
              url: api.scylla_reclaim_org_configs,
              method: 'post',
              data: {
                org_id: values.org_id,
                scylla_retention_days: values.scylla_retention_days
              }
            })
            if (res && res.code === 'SUCCESS') {
              this.$message.success(`组织【${orgName}】数据保留策略已成功保存`)
              this.addModalVisible = false
              this.fetchOrgConfigs()
            } else {
              this.$message.error(res.msg || '保存失败')
            }
          } catch (error) {
            this.$message.error('保存失败')
            console.error(error)
          } finally {
            this.addModalConfirmLoading = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.card-header-gradient-green {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  padding: 24px;
  margin: -24px -24px 24px -24px;
  color: #ffffff;
}

.card-header-gradient-green h3 {
  color: #ffffff;
  margin: 0 0 4px 0;
  font-weight: 600;
  font-size: 18px;
}

.card-header-gradient-green p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 13px;
}

.stats-overview-row {
  margin-top: 8px;
}

.stat-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-box:hover {
  border-color: #2ecc71;
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.1);
}

.stat-title {
  color: #718096;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-number-small {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-desc {
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin: 20px 0 12px 0;
  border-left: 3px solid #2ecc71;
  padding-left: 8px;
}

.processed-count {
  font-weight: 600;
  color: #27ae60;
}

.scylla-reclaim-container {
  padding: 8px;
}

.premium-card {
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.premium-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.card-header-gradient {
  background: linear-gradient(135deg, #1890ff 0%, #0050b3 100%);
  padding: 24px;
  margin: -24px -24px 24px -24px;
  color: #ffffff;
}

.card-header-gradient h3 {
  color: #ffffff;
  margin: 0 0 4px 0;
  font-weight: 600;
  font-size: 18px;
}

.card-header-gradient p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 13px;
}

.card-header-title {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.card-header-title h3 {
  color: #1890ff;
  margin: 0 0 4px 0;
  font-weight: 600;
  font-size: 18px;
}

.card-header-title .subtitle {
  color: #8c8c8c;
  font-size: 13px;
}

.status-indicator-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0 24px 0;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.status-label {
  font-weight: 500;
  color: #4a5568;
}

.status-badge-wrapper {
  display: flex;
  align-items: center;
}

.premium-badge {
  font-weight: 600;
  font-size: 14px;
}

.spinner-micro {
  margin-left: 8px;
  width: 14px;
  height: 14px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #1890ff;
  border-radius: 50%;
  animation: spin-anim 0.8s linear infinite;
}

@keyframes spin-anim {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.metadata-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metadata-item .label {
  color: #718096;
  font-size: 13px;
}

.metadata-item .value {
  color: #2d3748;
  font-weight: 500;
  font-size: 13px;
}

.premium-divider {
  margin: 16px 0;
  background-color: #e2e8f0;
}

.switch-helper-text {
  margin-left: 10px;
  color: #718096;
  font-size: 13px;
}

.w-100 {
  width: 100%;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-3 {
  margin-top: 12px;
}

.mt-4 {
  margin-top: 24px;
}

.shadow-btn {
  box-shadow: 0 4px 10px rgba(24, 144, 255, 0.15);
  border: none;
}

.run-btn.shadow-btn {
  box-shadow: 0 4px 10px rgba(245, 34, 45, 0.2);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

.log-header .title-section {
  display: flex;
  align-items: center;
}

.log-header .console-icon {
  font-size: 18px;
  color: #1890ff;
  margin-right: 8px;
}

.log-header h3 {
  margin: 0;
  font-weight: 600;
  font-size: 16px;
  color: #262626;
}

.console-btn {
  margin-left: 8px;
}

.console-checkbox {
  margin-right: 12px;
  color: #595959;
}

.console-panel {
  background: #0f172a;
  border-radius: 8px;
  padding: 16px;
  height: 400px;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: #334155 #0f172a;
  border: 1px solid #1e293b;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
}

.console-panel::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.console-panel::-webkit-scrollbar-thumb {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 4px;
}

.console-panel::-webkit-scrollbar-thumb:hover {
  background: #334155;
}

.console-panel::-webkit-scrollbar-track {
  background: #0f172a;
  border-radius: 4px;
}

.console-text {
  color: #38bdf8;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  white-space: pre;
  margin: 0;
}

@media (max-width: 768px) {
  .actions-col {
    margin-top: 16px;
  }
}
</style>
