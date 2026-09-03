<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper" style="margin-bottom: 16px">
      <a-form layout="inline">
        <a-form-item :label="$t('gps.group.name')">
          <a-input v-model="query.name" style="width: 180px" @keyup.enter.native="resetPage()" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" icon="search" @click="resetPage()">{{ $t('common.search') }}</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="table-operator" style="margin-bottom: 16px">
      <a-button type="primary" icon="plus" @click="openEdit()">{{ $t('gps.group.add') }}</a-button>
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
      <template slot="action" slot-scope="record">
        <a @click="openEdit(record)">{{ $t('gps.common.edit') }}</a>
        <a-divider type="vertical" />
        <a @click="openBind(record)">{{ $t('gps.group.bindDevices') }}</a>
        <a-divider type="vertical" />
        <a-popconfirm :title="$t('gps.common.confirmDelete')" @confirm="removeGroup(record)">
          <a style="color: red">{{ $t('gps.common.delete') }}</a>
        </a-popconfirm>
      </template>
    </a-table>
    <a-modal :title="editing.id ? $t('gps.group.edit') : $t('gps.group.add')" v-model="editVisible" :width="520" @ok="saveGroup">
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item :label="$t('gps.group.name')">
          <a-input v-model="editing.name" />
        </a-form-item>
        <a-form-item :label="$t('gps.group.description')">
          <a-input v-model="editing.description" />
        </a-form-item>
        <a-form-item v-if="!editing.id" :label="$t('gps.common.deviceId')">
          <a-input v-model="editing.device_ids_text" placeholder="id1,id2" />
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal :title="$t('gps.group.bindDevices')" v-model="bindVisible" :width="520" @ok="saveBind">
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item :label="$t('gps.common.deviceId')">
          <a-input v-model="bindDevicesText" placeholder="id1,id2" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script>
import { getDeviceGroupPage, addDeviceGroup, updateDeviceGroup, removeDeviceGroup, bindDeviceGroupDevices } from '@/api/manage'

export default {
  name: 'DeviceGroupList',
  data () {
    return {
      loading: false,
      rows: [],
      total: 0,
      pageNo: 1,
      pageSize: 10,
      query: { name: undefined },
      columns: [
        { title: this.$t('gps.group.name'), dataIndex: 'name' },
        { title: this.$t('gps.group.description'), dataIndex: 'description' },
        { title: this.$t('gps.fence.deviceCount'), dataIndex: 'device_count' },
        { title: this.$t('gps.common.action'), key: 'action', scopedSlots: { customRender: 'action' } }
      ],
      editVisible: false,
      editing: this.emptyGroup(),
      bindVisible: false,
      bindGroupId: undefined,
      bindDevicesText: ''
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
    emptyGroup () {
      return { id: undefined, name: '', description: undefined, device_ids_text: '' }
    },
    resetPage () {
      this.pageNo = 1
      this.loadData()
    },
    async loadData () {
      this.loading = true
      try {
        const res = await getDeviceGroupPage({
          page_no: this.pageNo,
          page_size: this.pageSize,
          name: this.query.name || undefined
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
      this.editing = record ? { ...this.emptyGroup(), ...record } : this.emptyGroup()
      this.editVisible = true
    },
    async saveGroup () {
      if (!this.editing.name) {
        this.$message.error(this.$t('gps.group.nameRequired'))
        return
      }
      try {
        if (this.editing.id) {
          await updateDeviceGroup({ id: this.editing.id, name: this.editing.name, description: this.editing.description })
        } else {
          const deviceIds = (this.editing.device_ids_text || '').split(',').map(s => s.trim()).filter(Boolean)
          await addDeviceGroup({ name: this.editing.name, description: this.editing.description, device_ids: deviceIds })
        }
        this.$message.success(this.$t('gps.common.success'))
        this.editVisible = false
        this.loadData()
      } catch (e) {
        this.$message.error(this.$t('gps.common.failed'))
      }
    },
    openBind (record) {
      this.bindGroupId = record.id
      this.bindDevicesText = ''
      this.bindVisible = true
    },
    async saveBind () {
      const ids = (this.bindDevicesText || '').split(',').map(s => s.trim()).filter(Boolean)
      try {
        await bindDeviceGroupDevices({ group_id: this.bindGroupId, device_ids: ids, bind: true })
        this.$message.success(this.$t('gps.common.success'))
        this.bindVisible = false
        this.loadData()
      } catch (e) {
        this.$message.error(this.$t('gps.common.failed'))
      }
    },
    async removeGroup (record) {
      try {
        await removeDeviceGroup({ id: String(record.id) })
        this.$message.success(this.$t('gps.common.success'))
        this.loadData()
      } catch (e) {
        this.$message.error(this.$t('gps.common.failed'))
      }
    }
  }
}
</script>
