<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper" style="margin-bottom: 16px">
      <a-form layout="inline">
        <a-form-item :label="$t('gps.common.deviceId')">
          <a-input v-model="query.device_id" :placeholder="$t('gps.common.deviceId')" style="width: 180px" @keyup.enter.native="resetPage()" />
        </a-form-item>
        <a-form-item :label="$t('gps.rule.type')">
          <a-select v-model="query.rule_type" style="width: 160px" allow-clear @change="resetPage()">
            <a-select-option :value="1">{{ $t('gps.rule.speed') }}</a-select-option>
            <a-select-option :value="2">{{ $t('gps.rule.powerOff') }}</a-select-option>
            <a-select-option :value="3">{{ $t('gps.rule.lowBattery') }}</a-select-option>
            <a-select-option :value="4">{{ $t('gps.rule.vibration') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" icon="search" @click="resetPage()">{{ $t('common.search') }}</a-button>
        </a-form-item>
      </a-form>
    </div>

    <div class="table-operator" style="margin-bottom: 16px">
      <a-button type="primary" icon="plus" @click="openEdit()">{{ $t('gps.rule.add') }}</a-button>
    </div>

    <a-table
      row-key="id"
      size="middle"
      :columns="columns"
      :data-source="rows"
      :loading="loading"
      :pagination="pagination"
      @change="onPageChange"
    >
      <template slot="rule_type" slot-scope="text">
        <a-tag :color="ruleColor(text)">{{ ruleName(text) }}</a-tag>
      </template>
      <template slot="threshold" slot-scope="record">
        <span v-if="record.rule_type === 3 && record.threshold && record.threshold <= 100">{{ record.threshold }} {{ $t('gps.rule.percent') }}</span>
        <span v-else-if="record.rule_type === 3">{{ record.threshold }} mV</span>
        <span v-else-if="record.rule_type === 1">{{ record.threshold }} km/h</span>
        <span v-else>-</span>
      </template>
      <template slot="enabled" slot-scope="text">
        <a-tag :color="text === 1 ? 'green' : 'red'">{{ text === 1 ? $t('gps.common.enabled') : $t('gps.common.disabled') }}</a-tag>
      </template>
      <template slot="action" slot-scope="record">
        <a @click="openEdit(record)">{{ $t('gps.common.edit') }}</a>
        <a-divider type="vertical" />
        <a-popconfirm :title="$t('gps.common.confirmDelete')" @confirm="removeRule(record)">
          <a style="color: red">{{ $t('gps.common.delete') }}</a>
        </a-popconfirm>
      </template>
    </a-table>

    <a-modal
      :title="editing.id ? $t('gps.rule.edit') : $t('gps.rule.add')"
      v-model="editVisible"
      :width="560"
      @ok="saveRule"
    >
      <a-form :label-col="{ span: 7 }" :wrapper-col="{ span: 14 }">
        <a-form-item :label="$t('gps.common.deviceId')">
          <a-input v-model="editing.device_id" />
        </a-form-item>
        <a-form-item :label="$t('gps.rule.type')">
          <a-select v-model="editing.rule_type">
            <a-select-option :value="1">{{ $t('gps.rule.speed') }}</a-select-option>
            <a-select-option :value="2">{{ $t('gps.rule.powerOff') }}</a-select-option>
            <a-select-option :value="3">{{ $t('gps.rule.lowBattery') }}</a-select-option>
            <a-select-option :value="4">{{ $t('gps.rule.vibration') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="editing.rule_type === 1 || editing.rule_type === 3" :label="$t('gps.rule.threshold')">
          <a-input-number
v-model="editing.threshold"
:min="0"
:step="1"
style="width: 100%"
            :addon-after="editing.rule_type === 3 ? (editing.threshold && editing.threshold <= 100 ? '%' : 'mV') : 'km/h'" />
        </a-form-item>
        <a-form-item :label="$t('gps.rule.enabled')">
          <a-switch :checked="editing.enabled === 1" @change="v => (editing.enabled = v ? 1 : 0)" />
        </a-form-item>
        <a-form-item :label="$t('gps.rule.webhook')">
          <a-input v-model="editing.notify_webhook" :placeholder="'https://example.com/hook'" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script>
import { getAlarmRulePage, addAlarmRule, updateAlarmRule, removeAlarmRule } from '@/api/manage'

export default {
  name: 'AlarmRuleList',
  data () {
    return {
      loading: false,
      rows: [],
      total: 0,
      pageNo: 1,
      pageSize: 10,
      query: { device_id: undefined, rule_type: undefined },
      columns: [
        { title: this.$t('gps.common.deviceId'), dataIndex: 'device_id' },
        { title: this.$t('gps.rule.type'), dataIndex: 'rule_type', scopedSlots: { customRender: 'rule_type' } },
        { title: this.$t('gps.rule.threshold'), scopedSlots: { customRender: 'threshold' } },
        { title: this.$t('gps.common.status'), dataIndex: 'enabled', scopedSlots: { customRender: 'enabled' } },
        { title: this.$t('gps.rule.webhook'), dataIndex: 'notify_webhook' },
        { title: this.$t('gps.common.action'), key: 'action', scopedSlots: { customRender: 'action' } }
      ],
      editVisible: false,
      editing: this.emptyRule()
    }
  },
  computed: {
    pagination () {
      return {
        current: this.pageNo,
        pageSize: this.pageSize,
        total: this.total,
        showSizeChanger: true,
        showTotal: t => `${this.$t('gps.common.total')} ${t}`
      }
    }
  },
  created () {
    this.loadData()
  },
  methods: {
    emptyRule () {
      return { id: undefined, device_id: '', rule_type: 1, threshold: 30, enabled: 1, notify_webhook: undefined }
    },
    ruleName (t) {
      const map = { 1: this.$t('gps.rule.speed'), 2: this.$t('gps.rule.powerOff'), 3: this.$t('gps.rule.lowBattery'), 4: this.$t('gps.rule.vibration') }
      return map[t] || t
    },
    ruleColor (t) {
      const map = { 1: 'blue', 2: 'red', 3: 'orange', 4: 'purple' }
      return map[t] || 'default'
    },
    resetPage () {
      this.pageNo = 1
      this.loadData()
    },
    async loadData () {
      this.loading = true
      try {
        const res = await getAlarmRulePage({
          page_no: this.pageNo,
          page_size: this.pageSize,
          device_id: this.query.device_id || undefined,
          rule_type: this.query.rule_type
        })
        const data = res.data || {}
        this.rows = data.records || []
        this.total = data.total || 0
      } finally {
        this.loading = false
      }
    },
    onPageChange (pag) {
      this.pageNo = pag.current
      this.pageSize = pag.pageSize
      this.loadData()
    },
    openEdit (record) {
      this.editing = record ? { ...this.emptyRule(), ...record } : this.emptyRule()
      this.editVisible = true
    },
    async saveRule () {
      const e = this.editing
      if (!e.device_id) {
        this.$message.error(this.$t('gps.common.deviceIdRequired'))
        return
      }
      try {
        if (e.id) {
          await updateAlarmRule({ id: e.id, threshold: e.threshold, enabled: e.enabled, notify_webhook: e.notify_webhook })
        } else {
          await addAlarmRule({
            device_id: e.device_id,
            rule_type: e.rule_type,
            threshold: e.rule_type === 1 || e.rule_type === 3 ? e.threshold : undefined,
            enabled: e.enabled,
            notify_webhook: e.notify_webhook || undefined
          })
        }
        this.$message.success(this.$t('gps.common.success'))
        this.editVisible = false
        this.loadData()
      } catch (err) {
        this.$message.error(this.$t('gps.common.failed'))
      }
    },
    async removeRule (record) {
      try {
        await removeAlarmRule({ id: String(record.id) })
        this.$message.success(this.$t('gps.common.success'))
        this.loadData()
      } catch (err) {
        this.$message.error(this.$t('gps.common.failed'))
      }
    }
  }
}
</script>
