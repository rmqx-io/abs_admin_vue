<template>
  <div>
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item :label="$t('list.table.form.ruleId')">
              <a-input v-model="queryParam.id" placeholder=""/>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item :label="$t('list.table.form.status')">
              <a-select v-model="queryParam.status" :placeholder="$t('common.selectPlaceholder')" default-value="0">
                <a-select-option value="0">{{ $t('list.table.status.all') }}</a-select-option>
                <a-select-option value="1">{{ $t('list.table.status.closed') }}</a-select-option>
                <a-select-option value="2">{{ $t('list.table.status.running') }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item :label="$t('list.table.form.callCount')">
                <a-input-number v-model="queryParam.callNo" style="width: 100%"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item :label="$t('list.table.form.updateDate')">
                <a-date-picker v-model="queryParam.date" style="width: 100%" :placeholder="$t('list.table.form.updateDatePlaceholder')"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item :label="$t('list.table.form.status')">
                <a-select v-model="queryParam.useStatus" :placeholder="$t('common.selectPlaceholder')" default-value="0">
                  <a-select-option value="0">{{ $t('list.table.status.all') }}</a-select-option>
                  <a-select-option value="1">{{ $t('list.table.status.closed') }}</a-select-option>
                  <a-select-option value="2">{{ $t('list.table.status.running') }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item :label="$t('list.table.form.status')">
                <a-select :placeholder="$t('common.selectPlaceholder')" default-value="0">
                  <a-select-option value="0">{{ $t('list.table.status.all') }}</a-select-option>
                  <a-select-option value="1">{{ $t('list.table.status.closed') }}</a-select-option>
                  <a-select-option value="2">{{ $t('list.table.status.running') }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="$refs.table.refresh(true)">{{ $t('common.search') }}</a-button>
              <a-button style="margin-left: 8px" @click="handleReset">{{ $t('common.reset') }}</a-button>
              <a @click="toggleAdvanced" style="margin-left: 8px">
                {{ advanced ? $t('common.collapse') : $t('common.expand') }}
                <a-icon :type="advanced ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleEdit()">{{ $t('list.table.actions.new') }}</a-button>
      <a-button type="dashed" @click="tableOption">{{ optionAlertShow ? $t('common.close') : $t('common.open') }} alert</a-button>
      <a-dropdown v-action:edit v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1"><a-icon type="delete" />{{ $t('common.delete') }}</a-menu-item>
          <!-- lock | unlock -->
          <a-menu-item key="2"><a-icon type="lock" />{{ $t('common.lock') }}</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          {{ $t('common.batchActions') }} <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <s-table
      ref="table"
      size="default"
      rowKey="key"
      :columns="columns"
      :data="loadData"
      :alert="options.alert"
      :rowSelection="options.rowSelection"
    >
      <span slot="serial" slot-scope="text, record, index">
        {{ index + 1 }}
      </span>
      <span slot="action" slot-scope="text, record">
        <template>
          <a @click="handleEdit(record)">{{ $t('common.edit') }}</a>
          <a-divider type="vertical" />
        </template>
        <a-dropdown>
          <a class="ant-dropdown-link">
            {{ $t('common.more') }} <a-icon type="down" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a href="javascript:;">{{ $t('common.detail') }}</a>
            </a-menu-item>
            <a-menu-item v-if="$auth('table.disable')">
              <a href="javascript:;">{{ $t('common.disable') }}</a>
            </a-menu-item>
            <a-menu-item v-if="$auth('table.delete')">
              <a href="javascript:;">{{ $t('common.delete') }}</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </span>
    </s-table>
  </div>
</template>

<script>
import moment from 'moment'
import { STable } from '@/components'
import { getRoleList, getServiceList } from '@/api/manage'

export default {
  name: 'TableList',
  components: {
    STable
  },
  data () {
    return {
      mdl: {},
      // advanced search toggle
      advanced: false,
      // query parameters
      queryParam: {},
      // table columns
      columns: [],
      // data loader must return a Promise
      loadData: parameter => {
        console.log('loadData.parameter', parameter)
        return getServiceList(Object.assign(parameter, this.queryParam))
          .then(res => {
            return res.result
          })
      },
      selectedRowKeys: [],
      selectedRows: [],

      // custom table alert & rowSelection
      options: {
        alert: { show: true, clear: () => { this.selectedRowKeys = [] } },
        rowSelection: {
          selectedRowKeys: this.selectedRowKeys,
          onChange: this.onSelectChange
        }
      },
      optionAlertShow: false
    }
  },
  created () {
    this.tableOption()
    getRoleList({ t: new Date() })
    this.updateColumns()
  },
  watch: {
    '$i18n.locale' () {
      this.updateColumns()
    }
  },
  methods: {
    updateColumns () {
      this.columns = [
        {
          title: this.$t('list.table.columns.index'),
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: this.$t('list.table.columns.ruleId'),
          dataIndex: 'no'
        },
        {
          title: this.$t('list.table.columns.description'),
          dataIndex: 'description'
        },
        {
          title: this.$t('list.table.columns.callNo'),
          dataIndex: 'callNo',
          sorter: true,
          needTotal: true,
          customRender: (text) => `${text} ${this.$t('list.table.columns.callNoSuffix')}`
        },
        {
          title: this.$t('list.table.columns.status'),
          dataIndex: 'status',
          needTotal: true
        },
        {
          title: this.$t('list.table.columns.updatedAt'),
          dataIndex: 'updatedAt',
          sorter: true
        },
        {
          title: this.$t('list.table.columns.action'),
          dataIndex: 'action',
          width: '150px',
          scopedSlots: { customRender: 'action' }
        }
      ]
    },
    tableOption () {
      if (!this.optionAlertShow) {
        this.options = {
          alert: { show: true, clear: () => { this.selectedRowKeys = [] } },
          rowSelection: {
            selectedRowKeys: this.selectedRowKeys,
            onChange: this.onSelectChange
          }
        }
        this.optionAlertShow = true
      } else {
        this.options = {
          alert: false,
          rowSelection: null
        }
        this.optionAlertShow = false
      }
    },

    handleReset () {
      this.queryParam = {}
    },

    handleEdit (record) {
      this.$emit('onEdit', record)
    },
    handleOk () {

    },

    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },

    resetSearchForm () {
      this.queryParam = {
        date: moment(new Date())
      }
    }
  }
}
</script>
