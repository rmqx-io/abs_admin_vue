<template>
  <a-card :bordered="false">
    <div class="table-operator" style="margin-bottom: 16px">
      <a-button type="primary" icon="plus" @click="openEdit()">{{ $t('gps.fence.add') }}</a-button>
      <a-button icon="reload" style="margin-left: 8px" @click="loadData()">{{ $t('gps.common.refresh') }}</a-button>
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
      <template slot="shape" slot-scope="text">
        <a-tag :color="text === 1 ? 'blue' : 'purple'">{{ text === 1 ? $t('gps.fence.circle') : $t('gps.fence.polygon') }}</a-tag>
      </template>
      <template slot="enabled" slot-scope="text">
        <a-tag :color="text === 1 ? 'green' : 'red'">{{ text === 1 ? $t('gps.common.enabled') : $t('gps.common.disabled') }}</a-tag>
      </template>
      <template slot="alert" slot-scope="record">
        <a-tag v-if="record.alert_on_enter === 1" color="orange">{{ $t('gps.fence.alertEnter') }}</a-tag>
        <a-tag v-if="record.alert_on_exit === 1" color="volcano">{{ $t('gps.fence.alertExit') }}</a-tag>
        <a-tag v-if="record.speed_limit_kmh && record.speed_limit_kmh > 0" color="cyan">{{ $t('gps.fence.speedLimit') }}: {{ record.speed_limit_kmh }}km/h</a-tag>
      </template>
      <template slot="effective" slot-scope="record">
        <span v-if="record.effective_start || record.effective_end">{{ record.effective_start || '-' }} ~ {{ record.effective_end || '-' }}</span>
        <span v-else>{{ $t('gps.fence.allDay') }}</span>
      </template>
      <template slot="action" slot-scope="record">
        <a @click="openEdit(record)">{{ $t('gps.common.edit') }}</a>
        <a-divider type="vertical" />
        <a @click="openBind(record)">{{ $t('gps.fence.bindDevices') }}</a>
        <a-divider type="vertical" />
        <a-popconfirm :title="$t('gps.common.confirmDelete')" @confirm="removeFence(record)">
          <a style="color: red">{{ $t('gps.common.delete') }}</a>
        </a-popconfirm>
      </template>
    </a-table>

    <!-- 新建 / 编辑围栏 -->
    <a-modal
      :title="editing.id ? $t('gps.fence.edit') : $t('gps.fence.add')"
      v-model="editVisible"
      :width="640"
      @ok="saveFence"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item :label="$t('gps.fence.name')">
          <a-input v-model="editing.name" />
        </a-form-item>
        <a-form-item :label="$t('gps.fence.shape')">
          <a-radio-group v-model="editing.shape" @change="editing.polygon = editing.shape === 2 ? editing.polygon : ''">
            <a-radio :value="1">{{ $t('gps.fence.circle') }}</a-radio>
            <a-radio :value="2">{{ $t('gps.fence.polygon') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <template v-if="editing.shape === 1">
          <a-form-item :label="$t('gps.fence.centerLat')">
            <a-input-number v-model="editing.center_lat" :step="0.000001" style="width: 100%" />
          </a-form-item>
          <a-form-item :label="$t('gps.fence.centerLng')">
            <a-input-number v-model="editing.center_lng" :step="0.000001" style="width: 100%" />
          </a-form-item>
          <a-form-item :label="$t('gps.fence.radius')">
            <a-input-number v-model="editing.radius_m" :min="1" style="width: 100%" :addon-after="$t('gps.fence.meter')" />
          </a-form-item>
        </template>
        <a-form-item v-else :label="$t('gps.fence.polygon')">
          <a-input type="textarea" :rows="3" v-model="editing.polygon" :placeholder="$t('gps.fence.polygonPlaceholder')" />
        </a-form-item>
        <a-form-item :label="$t('gps.fence.enabled')">
          <a-switch :checked="editing.enabled === 1" @change="v => (editing.enabled = v ? 1 : 0)" />
        </a-form-item>
        <a-form-item :label="$t('gps.fence.alertEnter')">
          <a-switch :checked="editing.alert_on_enter === 1" @change="v => (editing.alert_on_enter = v ? 1 : 0)" />
        </a-form-item>
        <a-form-item :label="$t('gps.fence.alertExit')">
          <a-switch :checked="editing.alert_on_exit === 1" @change="v => (editing.alert_on_exit = v ? 1 : 0)" />
        </a-form-item>
        <a-form-item :label="$t('gps.fence.speedLimit')">
          <a-input-number v-model="editing.speed_limit_kmh" :min="0" style="width: 100%" :addon-after="'km/h'" />
        </a-form-item>
        <a-form-item :label="$t('gps.fence.effectiveStart')">
          <a-time-picker v-model="editing.effective_start_moment" format="HH:mm:ss" style="width: 100%" />
        </a-form-item>
        <a-form-item :label="$t('gps.fence.effectiveEnd')">
          <a-time-picker v-model="editing.effective_end_moment" format="HH:mm:ss" style="width: 100%" />
        </a-form-item>
        <a-form-item :label="$t('gps.fence.description')">
          <a-input type="textarea" :rows="2" v-model="editing.description" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 绑定设备 -->
    <a-modal
      :title="`${$t('gps.fence.bindDevices')} - ${bindFence.name}`"
      v-model="bindVisible"
      :width="640"
      @ok="saveBind"
    >
      <a-table
        row-key="code"
        size="small"
        :columns="deviceColumns"
        :data-source="allDevices"
        :loading="deviceLoading"
        :pagination="{ pageSize: 10, showSizeChanger: true }"
        :row-selection="{ selectedRowKeys: boundDeviceKeys, onChange: keys => (boundDeviceKeys = keys) }"
        :scroll="{ y: 360 }"
      />
    </a-modal>
  </a-card>
</template>

<script>
import moment from 'moment'
import {
  getGeoFencePage,
  addGeoFence,
  updateGeoFence,
  removeGeoFence,
  getGeoFenceDevices,
  bindGeoFenceDevices,
  getDeviceList
} from '@/api/manage'

export default {
  name: 'GeoFenceList',
  data () {
    return {
      loading: false,
      rows: [],
      total: 0,
      pageNo: 1,
      pageSize: 10,
      columns: [
        { title: this.$t('gps.fence.name'), dataIndex: 'name' },
        { title: this.$t('gps.fence.shape'), dataIndex: 'shape', scopedSlots: { customRender: 'shape' } },
        { title: this.$t('gps.fence.geometry'), dataIndex: 'geometryText' },
        { title: this.$t('gps.common.status'), dataIndex: 'enabled', scopedSlots: { customRender: 'enabled' } },
        { title: this.$t('gps.fence.alerts'), scopedSlots: { customRender: 'alert' } },
        { title: this.$t('gps.fence.effective'), scopedSlots: { customRender: 'effective' } },
        { title: this.$t('gps.fence.deviceCount'), dataIndex: 'device_count' },
        { title: this.$t('gps.common.action'), key: 'action', scopedSlots: { customRender: 'action' } }
      ],
      editVisible: false,
      editing: this.emptyFence(),
      bindVisible: false,
      bindFence: {},
      allDevices: [],
      deviceLoading: false,
      boundDeviceKeys: [],
      deviceColumns: [
        { title: this.$t('gps.common.deviceId'), dataIndex: 'code' },
        { title: this.$t('gps.common.alias'), dataIndex: 'alias' }
      ]
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
    emptyFence () {
      return {
        id: undefined,
        name: '',
        shape: 1,
        center_lat: undefined,
        center_lng: undefined,
        radius_m: 500,
        polygon: '',
        enabled: 1,
        alert_on_enter: 1,
        alert_on_exit: 1,
        speed_limit_kmh: undefined,
        effective_start: undefined,
        effective_end: undefined,
        effective_start_moment: undefined,
        effective_end_moment: undefined,
        description: undefined
      }
    },
    async loadData () {
      this.loading = true
      try {
        const res = await getGeoFencePage({ page_no: this.pageNo, page_size: this.pageSize })
        const data = res.data || {}
        this.rows = (data.records || []).map(f => ({
          ...f,
          geometryText: f.shape === 1
            ? `${f.center_lat}, ${f.center_lng} / ${f.radius_m}m`
            : (f.polygon || '').substring(0, 60)
        }))
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
      this.editing = record ? { ...this.emptyFence(), ...record } : this.emptyFence()
      if (this.editing.effective_start) {
        this.editing.effective_start_moment = moment(this.editing.effective_start, 'HH:mm:ss')
      }
      if (this.editing.effective_end) {
        this.editing.effective_end_moment = moment(this.editing.effective_end, 'HH:mm:ss')
      }
      this.editVisible = true
    },
    async saveFence () {
      const e = this.editing
      if (!e.name) {
        this.$message.error(this.$t('gps.fence.nameRequired'))
        return
      }
      if (e.shape === 1 && (!e.center_lat || !e.center_lng || !e.radius_m)) {
        this.$message.error(this.$t('gps.fence.circleRequired'))
        return
      }
      if (e.shape === 2 && !e.polygon) {
        this.$message.error(this.$t('gps.fence.polygonRequired'))
        return
      }
      const payload = {
        name: e.name,
        shape: e.shape,
        center_lat: e.shape === 1 ? e.center_lat : undefined,
        center_lng: e.shape === 1 ? e.center_lng : undefined,
        radius_m: e.shape === 1 ? e.radius_m : undefined,
        polygon: e.shape === 2 ? e.polygon : undefined,
        enabled: e.enabled,
        alert_on_enter: e.alert_on_enter,
        alert_on_exit: e.alert_on_exit,
        speed_limit_kmh: e.speed_limit_kmh || undefined,
        effective_start: e.effective_start_moment ? e.effective_start_moment.format('HH:mm:ss') : undefined,
        effective_end: e.effective_end_moment ? e.effective_end_moment.format('HH:mm:ss') : undefined,
        description: e.description || undefined
      }
      try {
        if (e.id) {
          await updateGeoFence({ id: e.id, ...payload })
        } else {
          await addGeoFence(payload)
        }
        this.$message.success(this.$t('gps.common.success'))
        this.editVisible = false
        this.loadData()
      } catch (err) {
        this.$message.error(this.$t('gps.common.failed'))
      }
    },
    async removeFence (record) {
      try {
        await removeGeoFence({ id: String(record.id) })
        this.$message.success(this.$t('gps.common.success'))
        this.loadData()
      } catch (err) {
        this.$message.error(this.$t('gps.common.failed'))
      }
    },
    async openBind (record) {
      this.bindFence = record
      this.bindVisible = true
      this.deviceLoading = true
      this.allDevices = []
      this.boundDeviceKeys = []
      try {
        const [devRes, bindRes] = await Promise.all([
          getDeviceList({ page_no: 1, page_size: 200 }),
          getGeoFenceDevices(record.id)
        ])
        this.allDevices = (devRes.data && devRes.data.records) || []
        this.boundDeviceKeys = (bindRes.data || []).map(d => d.device_id)
      } finally {
        this.deviceLoading = false
      }
    },
    async saveBind () {
      try {
        await bindGeoFenceDevices({ fence_id: this.bindFence.id, device_ids: this.boundDeviceKeys, bind: true })
        this.$message.success(this.$t('gps.common.success'))
        this.bindVisible = false
      } catch (err) {
        this.$message.error(this.$t('gps.common.failed'))
      }
    }
  }
}
</script>
