<template>
<!--  <page-header-wrapper>-->
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item :label="$t('org.form.id')">
                <a-input v-model="queryParam.id" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="$refs.table.refresh(true)">{{ $t('common.search') }}</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">{{ $t('common.reset') }}</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd">{{ $t('org.actions.add') }}</a-button>
      </div>

      <s-table
        v-if="false"
        ref="table"
        size="default"
        rowKey="(record) => record.data.id"
        :columns="columns"
        :data="loadData"
        :alert="true"
        :rowSelection="rowSelection"
        showPagination="auto"
      >
      </s-table>

      <create-org-form
        ref="createModal"
        :visible="visible"
        :loading="confirmLoading"
        :model="mdl"
        @cancel="handleCancel"
        @ok="handleOk"
      />

      <zk-table
        ref="tree-table"
        sum-text="sum"
        index-text="#"
        :data="orgList"
        :columns="orgColumns"
        :stripe="treeProps.stripe"
        :border="treeProps.border"
        :show-header="treeProps.showHeader"
        :show-summary="treeProps.showSummary"
        :show-row-hover="treeProps.showRowHover"
        :show-index="treeProps.showIndex"
        :tree-type="treeProps.treeType"
        :is-fold="treeProps.isFold"
        :expand-type="treeProps.expandType"
        :selection-type="treeProps.selectionType">
        <template slot="$expand" scope="scope">
          {{ `My name is ${scope.row.name},
     this rowIndex is ${scope.rowIndex}.`
        }}
        </template>
        <template slot="likes" scope="scope">
          {{ scope.row.likes.join(',') }}
        </template>
<!--        <template slot="opt" scope="scope">-->
<!--          <a-button type="primary" icon="el-icon-edit" size="mini">编辑</a-button>-->
<!--          <a-button type="danger" icon="el-icon-delete" size="mini">删除</a-button>-->
<!--        </template>-->
      </zk-table>
    </a-card>
<!--  </page-header-wrapper>-->
</template>

<script>
import { Ellipsis, STable } from '@/components'
import CreateOrgForm from '@/views/org/CreateOrgForm'
import StepByStepModal from '@/views/list/modules/StepByStepModal'
import { addOrg, getAdminOrgTree, getOrgList } from '@/api/manage'

import Vue from 'vue'
import ZkTable from 'vue-table-with-tree-grid'

Vue.use(ZkTable)

export default {
  name: 'OrgList',
  components: {
    STable,
    Ellipsis,
    CreateOrgForm,
    StepByStepModal
  },
  data () {
    return {
      // create model
      visible: false,
      confirmLoading: false,
      mdl: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      queryData: {
        id: null,
        account: null,
        name: null,
        page_no: 1,
        page_size: 5
      },
      columns: [],
      loadData: parameter => {
        const arg = Object.assign(parameter, this.queryData)
        arg.page_no = arg.pageNo
        arg.page_size = arg.pageSize
        delete arg.pageNo
        delete arg.pageSize
        console.log('loadData request arg:', arg)
        return getOrgList(arg)
          .then(res => {
            console.log('load data', res)
            const pages = Math.ceil(res.data.total / res.data.page_size)

            return {
              pageSize: res.data.page_size,
              pageNo: res.data.page_no,
              totalCount: res.data.total,
              totalPage: pages,
              data: res.data.records
            }
          })
      },
      selectedRowKeys: [],
      selectedRows: [],
      treeProps: {
        stripe: false,
        border: false,
        showHeader: true,
        showSummary: false,
        showRowHover: true,
        showIndex: false,
        treeType: true,
        isFold: false,
        expandType: false,
        selectionType: false
      },
      orgList: [],
      orgColumns: []
    }
  },
  created () {
    this.updateColumns()
    this.loadOrgTree()
  },
  watch: {
    '$i18n.locale' () {
      this.updateColumns()
    }
  },
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    updateColumns () {
      this.columns = [
        {
          title: this.$t('org.table.columns.id'),
          dataIndex: 'id'
        },
        {
          title: this.$t('org.table.columns.name'),
          dataIndex: 'name'
        },
        {
          title: this.$t('org.table.columns.parent'),
          dataIndex: 'parent'
        },
        {
          title: this.$t('org.table.columns.description'),
          dataIndex: 'description'
        },
        {
          title: this.$t('org.table.columns.createTime'),
          dataIndex: 'create_date'
        },
        {
          title: this.$t('org.table.columns.updateTime'),
          dataIndex: 'update_time'
        }
      ]

      this.orgColumns = [
        {
          label: this.$t('org.tree.columns.title'),
          prop: 'title'
        },
        {
          label: this.$t('org.tree.columns.value'),
          prop: 'value'
        }
      ]
    },
    handleAdd () {
      console.log('handle add')
      this.mdl = null
      this.visible = true
    },
    handleEdit (record) {
      this.visible = true
      this.mdl = { ...record }
    },
    handleOk () {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          console.log('values', values)
          if (values.id > 0) {
            // 修改 e.g.
            new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve()
              }, 1000)
            }).then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              // this.$refs.table.refresh()
              this.loadOrgTree()

              this.$message.info(this.$t('org.message.updateSuccess'))
            })
          } else {
            delete values.id
            // 新增
            new Promise((resolve, reject) => {
              addOrg(values)
                .then(res => {
                  console.log(res)
                  this.$refs.createModal.getAdminOrgList()
                  resolve()
                }).catch(err => {
                console.log('add org', err)
                this.confirmLoading = false
                this.$message.error(err)
                reject(err)
              })
            }).then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              // this.$refs.table.refresh()
              this.loadOrgTree()

              this.$message.info(this.$t('org.message.createSuccess'))
            })
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleCancel () {
      console.log('handle cancel')
      this.visible = false

      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    loadOrgTree () {
      getAdminOrgTree(this.queryParam)
        .then(res => {
          console.log('org tree', res)
          this.orgList = []
          this.orgList.push(res.data)
        })
    }
  }
}
</script>

<style scoped>

</style>
