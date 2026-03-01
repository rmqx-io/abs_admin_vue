<template>
  <page-header-wrapper>
    <a-row :gutter="24">
      <a-col :sm="24" :md="12" :xl="8" v-for="(item, key) in componentStatusData" :key="key" style="margin-bottom: 24px;">
        <a-card :title="key.toUpperCase()" :bordered="false">
          <div slot="extra">
            <a-tag :color="getStatusColor(item.status)">
              {{ item.status }}
            </a-tag>
          </div>
          <p>{{ item.message }}</p>
        </a-card>
      </a-col>
    </a-row>
    <a-card title="Database Configurations" :bordered="false" style="margin-bottom: 24px;">
      <a-row :gutter="16">
        <a-col :sm="24" :md="12" v-for="(value, key) in dbConfigurations" :key="`db-config-${key}`" style="margin-bottom: 12px;">
          <div>
            <strong>{{ formatKey(key) }}:</strong>
            <span style="word-break: break-all; margin-left: 8px;">{{ formatValue(value) }}</span>
          </div>
        </a-col>
      </a-row>
    </a-card>
    <a-card title="DB Proxy Metrics" :bordered="false" style="margin-bottom: 24px;">
      <a-row :gutter="24">
        <a-col :sm="24" :md="8" style="margin-bottom: 16px;">
          <a-statistic title="Active Connections" :value="dbProxyMetrics.active_connections" :value-style="dbProxyMetrics.active_connections > 100 ? 'color: red;' : 'color: green;'">
            <template #suffix>
              <a-icon type="user" />
            </template>
          </a-statistic>
        </a-col>
        <a-col :sm="24" :md="8" style="margin-bottom: 16px;">
          <a-statistic title="In-Flight Ops" :value="dbProxyMetrics.in_flight_ops" :value-style="dbProxyMetrics.in_flight_ops > 50 ? 'color: orange;' : 'color: blue;'">
            <template #suffix>
              <a-icon type="sync" />
            </template>
          </a-statistic>
        </a-col>
        <a-col :sm="24" :md="8" style="margin-bottom: 16px;">
          <a-statistic title="Queue Depth" :value="dbProxyMetrics.queue_depth" :value-style="dbProxyMetrics.queue_depth > 1000 ? 'color: red;' : 'color: green;'">
            <template #suffix>
              <a-icon type="queue" />
            </template>
          </a-statistic>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col :sm="24" :md="12" style="margin-bottom: 16px;">
          <a-statistic title="Processed Requests" :value="dbProxyMetrics.processed_requests" precision="0">
            <template #suffix>
              <a-icon type="check-circle" />
            </template>
          </a-statistic>
        </a-col>
        <a-col :sm="24" :md="12" style="margin-bottom: 16px;">
          <a-statistic title="Failed Requests" :value="dbProxyMetrics.failed_requests" :value-style="dbProxyMetrics.failed_requests > 0 ? 'color: red;' : 'color: green;'">
            <template #suffix>
              <a-icon type="close-circle" />
            </template>
          </a-statistic>
        </a-col>
      </a-row>
    </a-card>
    <a-card title="DB Proxy Runtime Flags" :bordered="false" style="margin-bottom: 24px;">
      <a-row v-if="runtimeTarantoolOnly !== null" style="margin-bottom: 12px;">
        <a-col :span="24">
          <strong>Runtime Mode:</strong>
          <a-tag :color="runtimeTarantoolOnly ? 'green' : 'blue'" style="margin-left: 8px;">
            {{ runtimeTarantoolOnly ? 'Tarantool Only (Read/Write)' : 'Non Tarantool-Only' }}
          </a-tag>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :sm="24" :md="12" v-for="(value, key) in dbProxyRuntimeFlags" :key="`db-proxy-runtime-${key}`" style="margin-bottom: 12px;">
          <div>
            <strong>{{ formatKey(key) }}:</strong>
            <span style="word-break: break-all; margin-left: 8px;">{{ formatValue(value) }}</span>
          </div>
        </a-col>
      </a-row>
    </a-card>
    
    <a-card v-if="dbOperationMetrics" title="DB Operation Metrics (Proxy)" :bordered="false" style="margin-bottom: 24px;">
      <a-row :gutter="24" style="margin-bottom: 24px;">
        <a-col :sm="24" :md="12">
          <a-statistic title="MySQL Operations" :value="dbOperationMetrics.total_mysql_ops" group-separator=",">
            <template #suffix>
              <span style="font-size: 14px; color: #ff4d4f" v-if="dbOperationMetrics.mysql_errors > 0">
                ({{ dbOperationMetrics.mysql_errors }} errors)
              </span>
            </template>
          </a-statistic>
        </a-col>
        <a-col :sm="24" :md="12">
          <a-statistic title="Tarantool Operations" :value="dbOperationMetrics.total_tarantool_ops" group-separator=",">
             <template #suffix>
              <span style="font-size: 14px; color: #ff4d4f" v-if="dbOperationMetrics.tarantool_errors > 0">
                ({{ dbOperationMetrics.tarantool_errors }} errors)
              </span>
            </template>
          </a-statistic>
        </a-col>
      </a-row>
      
      <a-tabs default-active-key="mysql" style="margin-top: 16px;">
        <a-tab-pane key="mysql" tab="MySQL Slow Ops">
          <a-table 
            v-if="dbOperationMetrics.top_slow_ops_mysql && dbOperationMetrics.top_slow_ops_mysql.length > 0"
            :columns="opColumns" 
            :data-source="dbOperationMetrics.top_slow_ops_mysql" 
            :pagination="false" 
            size="small"
            row-schema="db-op-row"
          >
          </a-table>
          <div v-else style="padding: 16px; text-align: center; color: rgba(0,0,0,0.45);">
            No slow operations recorded
          </div>
        </a-tab-pane>
        <a-tab-pane key="tarantool" tab="Tarantool Slow Ops">
          <a-table 
            v-if="dbOperationMetrics.top_slow_ops_tarantool && dbOperationMetrics.top_slow_ops_tarantool.length > 0"
            :columns="opColumns" 
            :data-source="dbOperationMetrics.top_slow_ops_tarantool" 
            :pagination="false" 
            size="small"
            row-schema="db-op-row"
          >
          </a-table>
          <div v-else style="padding: 16px; text-align: center; color: rgba(0,0,0,0.45);">
            No slow operations recorded
          </div>
        </a-tab-pane>
        <a-tab-pane key="failures" tab="Latest Failures">
          <a-table 
            v-if="dbOperationMetrics.latest_failures && dbOperationMetrics.latest_failures.length > 0"
            :columns="failureColumns" 
            :data-source="dbOperationMetrics.latest_failures" 
            :pagination="{ pageSize: 10 }" 
            size="small"
            row-key="time"
          >
            <template slot="error" slot-scope="text">
              <span style="color: #ff4d4f; font-family: monospace; font-size: 12px; word-break: break-all;">{{ text }}</span>
            </template>
          </a-table>
          <div v-else style="padding: 16px; text-align: center; color: rgba(0,0,0,0.45);">
            No failures recorded
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <a-card title="System Actions" :bordered="false">
      <a-button type="primary" @click="fetchStatus" :loading="loading">
        Refresh Status
      </a-button>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'SystemStatus',
  computed: {
    runtimeTarantoolOnly () {
      if (this.dbProxyRuntimeFlags.tarantool_only === true || this.dbProxyRuntimeFlags.tarantool_only === false) {
        return this.dbProxyRuntimeFlags.tarantool_only
      }
      if (this.dbProxyRuntimeFlags.health_tarantool_only === true || this.dbProxyRuntimeFlags.health_tarantool_only === false) {
        return this.dbProxyRuntimeFlags.health_tarantool_only
      }
      return null
    }
  },
  data () {
    return {
      loading: false,
      componentStatusData: {
        mysql: { status: 'UNKNOWN', message: 'Loading...' },
        mysql_slave: { status: 'UNKNOWN', message: 'Loading...' },
        cassandra: { status: 'UNKNOWN', message: 'Loading...' },
        redis: { status: 'UNKNOWN', message: 'Loading...' },
        queue: { status: 'UNKNOWN', message: 'Loading...' },
        tarantool: { status: 'UNKNOWN', message: 'Loading...' },
        broker: { status: 'UNKNOWN', message: 'Loading...' }
      },
      dbConfigurations: {},
      dbProxyRuntimeFlags: {},
      dbProxyMetrics: {
        active_connections: 0,
        in_flight_ops: 0,
        processed_requests: 0,
        failed_requests: 0,
        queue_depth: 0
      },
      dbOperationMetrics: null,
      opColumns: [
        { title: 'DB', dataIndex: 'db', key: 'db', width: '10%' },
        { title: 'Operation', dataIndex: 'op', key: 'op', width: '20%' },
        { title: 'Kind', dataIndex: 'kind', key: 'kind', width: '10%' },
        { title: 'Result', dataIndex: 'result', key: 'result', width: '10%' },
        { title: 'Count', dataIndex: 'count', key: 'count', width: '10%' },
        { 
          title: 'Avg (ms)', 
          dataIndex: 'avg_latency_ms', 
          key: 'avg_latency_ms', 
          width: '10%',
          customRender: (text) => text !== undefined ? Number(text).toFixed(2) : '0.00'
        },
        { 
          title: 'P95 (ms)', 
          dataIndex: 'p95_latency_ms', 
          key: 'p95_latency_ms', 
          width: '10%',
          customRender: (text) => text !== undefined ? Number(text).toFixed(2) : '0.00'
        },
        { 
          title: 'P99 (ms)', 
          dataIndex: 'p99_latency_ms', 
          key: 'p99_latency_ms', 
          width: '10%',
          customRender: (text) => text !== undefined ? Number(text).toFixed(2) : '0.00'
        },
      ],
      failureColumns: [
        { title: 'Time', dataIndex: 'time', key: 'time', width: '15%' },
        { title: 'DB', dataIndex: 'db', key: 'db', width: '8%' },
        { title: 'Op', dataIndex: 'op', key: 'op', width: '12%' },
        { title: 'Path', dataIndex: 'path', key: 'path', width: '8%' },
        { 
          title: 'Error Message', 
          dataIndex: 'error', 
          key: 'error', 
          scopedSlots: { customRender: 'error' }
        },
      ]
    }
  },
  created () {
    this.fetchStatus()
  },
  methods: {
    fetchStatus () {
      this.loading = true
      getAction('/admin/tools/system_status').then(res => {
        if (res.code === 'SUCCESS') {
          const data = res.data || {}
          const { db_configurations, db_proxy_runtime_flags, db_operation_metrics, ...componentStatuses } = data
          this.componentStatusData = componentStatuses
          this.dbConfigurations = db_configurations || {}
          this.dbProxyRuntimeFlags = db_proxy_runtime_flags || {}
          this.dbOperationMetrics = db_operation_metrics
          
          // Extract metrics from runtime flags
          if (db_proxy_runtime_flags) {
            this.dbProxyMetrics = {
              active_connections: db_proxy_runtime_flags.active_connections || 0,
              in_flight_ops: db_proxy_runtime_flags.in_flight_ops || 0,
              processed_requests: db_proxy_runtime_flags.processed_requests || 0,
              failed_requests: db_proxy_runtime_flags.failed_requests || 0,
              queue_depth: db_proxy_runtime_flags.queue_depth || 0
            }
          }
        } else {
          this.$message.error('Failed to fetch system status')
        }
      }).finally(() => {
        this.loading = false
      })
    },
    formatKey (key) {
      return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    },
    formatValue (value) {
      if (value === null || value === undefined || value === '') {
        return 'N/A'
      }
      if (typeof value === 'object') {
        return JSON.stringify(value)
      }
      return String(value)
    },
    getStatusColor (status) {
      switch (status) {
        case 'UP': return 'green'
        case 'DOWN': return 'red'
        case 'DEGRADED': return 'orange'
        default: return 'gray'
      }
    }
  }
}
</script>

<style scoped>
</style>
