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
    <a-card title="DB Proxy Runtime Flags" :bordered="false" style="margin-bottom: 24px;">
      <a-row :gutter="16">
        <a-col :sm="24" :md="12" v-for="(value, key) in dbProxyRuntimeFlags" :key="`db-proxy-runtime-${key}`" style="margin-bottom: 12px;">
          <div>
            <strong>{{ formatKey(key) }}:</strong>
            <span style="word-break: break-all; margin-left: 8px;">{{ formatValue(value) }}</span>
          </div>
        </a-col>
      </a-row>
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
      dbProxyRuntimeFlags: {}
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
          const { db_configurations, db_proxy_runtime_flags, ...componentStatuses } = data
          this.componentStatusData = componentStatuses
          this.dbConfigurations = db_configurations || {}
          this.dbProxyRuntimeFlags = db_proxy_runtime_flags || {}
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
