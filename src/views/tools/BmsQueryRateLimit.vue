<template>
  <a-card>
    <div>
      <h2>BMS 查询接口频率限制</h2>
      <p>配置每个登录用户调用 BMS 数据查询接口（/device/bms/query）的每分钟最大次数。0 表示不限制。</p>

      <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 10 }">
        <a-form-item label="每分钟最大调用次数">
          <a-input-number
            v-model="rateLimit"
            :min="0"
            :max="100000"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item label="当前生效值">
          <a-tag color="blue">{{ currentLimit }} 次/分钟</a-tag>
          <span v-if="currentLimit === 0" class="hint">（不限制）</span>
        </a-form-item>

        <a-form-item label="说明">
          <div>
            <p>• 限制按登录用户独立计数，每 60 秒滑动重置</p>
            <p>• 仅系统管理员可修改此配置</p>
            <p>• 修改后立即生效，无需重启服务</p>
          </div>
        </a-form-item>
      </a-form>

      <div class="action-buttons">
        <a-button type="primary" @click="saveConfig" :loading="loading" style="margin-right: 12px">
          保存
        </a-button>
        <a-button @click="refreshConfig" :loading="loading">
          刷新
        </a-button>
      </div>

      <a-divider />

      <div class="stats-header">
        <h3>查询请求统计</h3>
        <span class="stats-meta">进程内实时计数 · 当前窗口 60 秒 · 约每 10 秒自动刷新</span>
      </div>

      <a-row :gutter="16" class="stat-cards">
        <a-col :xs="12" :sm="6">
          <a-card size="small" class="stat-card">
            <div class="stat-label">累计放行</div>
            <div class="stat-value">{{ stats.total_allowed }}</div>
          </a-card>
        </a-col>
        <a-col :xs="12" :sm="6">
          <a-card size="small" class="stat-card">
            <div class="stat-label">累计限流拒绝</div>
            <div class="stat-value reject">{{ stats.total_rejected }}</div>
          </a-card>
        </a-col>
        <a-col :xs="12" :sm="6">
          <a-card size="small" class="stat-card">
            <div class="stat-label">窗口内活跃用户</div>
            <div class="stat-value">{{ stats.active_users }}</div>
          </a-card>
        </a-col>
        <a-col :xs="12" :sm="6">
          <a-card size="small" class="stat-card">
            <div class="stat-label">窗口内请求合计</div>
            <div class="stat-value">{{ stats.current_window_requests }}</div>
          </a-card>
        </a-col>
      </a-row>

      <a-table
        class="stats-table"
        size="middle"
        rowKey="user_id"
        :columns="columns"
        :dataSource="stats.user_stats"
        :loading="loading"
        :pagination="false"
        :locale="{ emptyText: '当前窗口暂无请求' }"
      >
        <template slot="request_count" slot-scope="text, record">
          <a-tag :color="usageColor(record)">{{ text }}</a-tag>
        </template>
        <template slot="remaining" slot-scope="text">
          <span v-if="currentLimit === 0">不限制</span>
          <span v-else>{{ text }}</span>
        </template>
        <template slot="window_elapsed_secs" slot-scope="text">
          {{ text }}s / 60s
        </template>
        <template slot="usage" slot-scope="text, record">
          <a-progress
            v-if="currentLimit > 0"
            :percent="usagePercent(record)"
            :status="usageStatus(record)"
            size="small"
            :showInfo="true"
          />
          <span v-else class="hint">—</span>
        </template>
      </a-table>
    </div>
  </a-card>
</template>

<script>
import request from '@/utils/request'
import { api } from '@/api/manage'

const getRateLimit = () =>
  request({
    url: api.device_bms_query_rate_limit,
    method: 'get'
  })

const setRateLimit = (rate_limit_per_minute) =>
  request({
    url: api.device_bms_query_rate_limit,
    method: 'post',
    data: { rate_limit_per_minute }
  })

const emptyStats = () => ({
  total_allowed: 0,
  total_rejected: 0,
  active_users: 0,
  current_window_requests: 0,
  user_stats: []
})

export default {
  name: 'BmsQueryRateLimit',
  data () {
    return {
      rateLimit: 60,
      currentLimit: 60,
      loading: false,
      refreshTimer: null,
      stats: emptyStats(),
      columns: [
        { title: '用户 ID', dataIndex: 'user_id', key: 'user_id', ellipsis: true },
        { title: '窗口内请求', dataIndex: 'request_count', key: 'request_count', scopedSlots: { customRender: 'request_count' }, width: 120 },
        { title: '剩余额度', dataIndex: 'remaining', key: 'remaining', scopedSlots: { customRender: 'remaining' }, width: 100 },
        { title: '窗口已过', dataIndex: 'window_elapsed_secs', key: 'window_elapsed_secs', scopedSlots: { customRender: 'window_elapsed_secs' }, width: 120 },
        { title: '使用率', key: 'usage', scopedSlots: { customRender: 'usage' }, width: 180 }
      ]
    }
  },
  mounted () {
    this.refreshConfig()
    this.refreshTimer = setInterval(() => {
      this.refreshConfig({ silent: true })
    }, 10000)
  },
  beforeDestroy () {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  },
  methods: {
    applyPayload (data) {
      if (!data) return
      const v = data.rate_limit_per_minute
      if (v !== undefined && v !== null) {
        this.rateLimit = v
        this.currentLimit = v
      }
      this.stats = {
        total_allowed: data.total_allowed || 0,
        total_rejected: data.total_rejected || 0,
        active_users: data.active_users || 0,
        current_window_requests: data.current_window_requests || 0,
        user_stats: Array.isArray(data.user_stats) ? data.user_stats : []
      }
    },
    usagePercent (record) {
      if (!this.currentLimit) return 0
      return Math.min(100, Math.round((record.request_count / this.currentLimit) * 100))
    },
    usageColor (record) {
      const p = this.usagePercent(record)
      if (p >= 100) return 'red'
      if (p >= 80) return 'orange'
      return 'blue'
    },
    usageStatus (record) {
      const p = this.usagePercent(record)
      if (p >= 100) return 'exception'
      if (p >= 80) return 'active'
      return 'normal'
    },
    async refreshConfig ({ silent } = {}) {
      if (!silent) this.loading = true
      try {
        const res = await getRateLimit()
        if (res && res.data) {
          this.applyPayload(res.data)
        }
      } catch (error) {
        console.error('获取 BMS 查询频率限制失败:', error)
        if (!silent) this.$message.error('获取配置失败')
      } finally {
        if (!silent) this.loading = false
      }
    },
    async saveConfig () {
      this.loading = true
      try {
        const res = await setRateLimit(this.rateLimit)
        if (res && res.data) {
          this.applyPayload(res.data)
        }
        this.$message.success('保存成功')
      } catch (error) {
        console.error('设置 BMS 查询频率限制失败:', error)
        this.$message.error('设置配置失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.action-buttons {
  margin-top: 24px;
  text-align: center;
}
.hint {
  margin-left: 8px;
  color: #999;
}
h2 {
  color: #1890ff;
  margin-bottom: 16px;
}
h3 {
  margin: 0;
  color: #1890ff;
}
p {
  margin-bottom: 8px;
  color: #666;
}
.stats-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}
.stats-meta {
  color: #999;
  font-size: 12px;
}
.stat-cards {
  margin-bottom: 16px;
}
.stat-card {
  margin-bottom: 12px;
  text-align: center;
}
.stat-label {
  color: #888;
  font-size: 13px;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #1890ff;
}
.stat-value.reject {
  color: #f5222d;
}
.stats-table {
  margin-top: 8px;
}
</style>
