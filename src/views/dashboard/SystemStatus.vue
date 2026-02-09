<template>
  <page-header-wrapper>
    <a-row :gutter="24">
      <a-col :sm="24" :md="12" :xl="8" v-for="(item, key) in statusData" :key="key" style="margin-bottom: 24px;">
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
      statusData: {
        mysql: { status: 'UNKNOWN', message: 'Loading...' },
        mysql_slave: { status: 'UNKNOWN', message: 'Loading...' },
        cassandra: { status: 'UNKNOWN', message: 'Loading...' },
        redis: { status: 'UNKNOWN', message: 'Loading...' },
        queue: { status: 'UNKNOWN', message: 'Loading...' },
        tarantool: { status: 'UNKNOWN', message: 'Loading...' },
        broker: { status: 'UNKNOWN', message: 'Loading...' }
      }
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
          this.statusData = res.data
        } else {
          this.$message.error('Failed to fetch system status')
        }
      }).finally(() => {
        this.loading = false
      })
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
