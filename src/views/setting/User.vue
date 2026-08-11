<template>

  <div class='dataBody'>
    <a-form
      layout='inline'
    >
      <!--<a-form-item>-->
      <!--<a-input-->
      <!--placeholder="请输入手机号"-->
      <!--v-model="queryData.phone"-->
      <!--&gt;-->
      <!--<a-icon-->
      <!--slot="prefix"-->
      <!--type="user"-->
      <!--style="color:rgba(0,0,0,.25)"-->
      <!--/>-->
      <!--</a-input>-->
      <!--</a-form-item>-->
      <a-form-item>
        <a-input
          v-model='queryData.account'
          placeholder='请输入账号'
          :allowClear='true'
          :maxLength='11'
        >
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input
          v-model='queryData.name'
          placeholder='请输入名称'
          :allowClear='true'
        >
        </a-input>
      </a-form-item>
      <a-form-item>
        <org-select
          v-model='queryData.organization_id'
          :org-list='orgList'
          placeholder='选择组织'
          style='width: 180px'
        >
        </org-select>
      </a-form-item>
      <a-form-item>
        <a-select
          mode='combobox'
          v-model='queryData.role_name'
          placeholder='请输入或选择角色'
          :allowClear='true'
          style='width: 180px'
        >
          <a-select-option v-for='name in roleNameList' :key='name' :value='name'>
            {{ name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        :wrapper-col='{ span: 12, offset: 5 }'
      >
        <a-button
          type='primary'
          html-type='submit'
          @click='fetch_no_page'
        >
          查询
        </a-button>
      </a-form-item>
    </a-form>
    <div class='operate'>
      <a-button type='dashed' style='width: 100%' icon='plus' @click='addData'>添加</a-button>
    </div>
    <a-table
:columns='columns'
             :rowKey='record => record.id'
             :dataSource='data'
             :pagination='pagination'
             :loading='loading'
             :indentSize='15'
             childrenColumnName='childs'
             @change='handleTableChange'
    >
      <div
        slot='expandedRowRender'
        slot-scope='record'
        style='margin: 0'>
        <div
          v-if='record!==null && record.role!==null'
        >
          <a-tag color='blue'>角色名称: {{ record.role.name }}</a-tag>
          <a-tree
            :selected-keys='[]'
            :replace-fields="{ children: 'childs', title: 'name', key: 'id' }"
            :autoExpandParent='true'
            :tree-data='[record.role]'
          />
        </div>
      </div>

      <!--<template slot="rate" slot-scope="rate">-->
      <!--{{rate+'%'}}-->
      <!--</template>-->
      <template slot='state' slot-scope='state'>
        <a-tag color='blue' v-if='state === 1'>启用</a-tag>
        <a-tag v-if='state === 0'>禁用</a-tag>
      </template>
      <template slot='action' slot-scope='scope'>
        <div style='width: 110px;'>
          <a style='color:#f5222d' @click='handleEnableDisable(scope)'>{{ scope.state === 0 ? '启用' : '禁用' }}</a>
          <a-dropdown style='margin-left: 5px'>
            <a class='ant-dropdown-link'>
              更多
              <a-icon type='down' />
            </a>
            <a-menu slot='overlay'>
              <a-menu-item>
                <a style='color: #1890ff' @click='handleEdit(scope)'>编辑</a>
              </a-menu-item>
              <a-menu-item>
                <a style='color: #1890ff' @click='handleChangePassword(scope)'>修改密码</a>
              </a-menu-item>
              <a-menu-item>
                <a style='color:#f5222d' @click='handleDelete(scope)'>删除</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>

      </template>
    </a-table>

    <a-modal
      :title="dialogMode==='add'?'添加':'编辑'"
      cancelText='取消'
      okText='确定'
      v-if='visible'
      v-model='visible'
      :width='500'
      :maskClosable='false'
      @ok='handleAddData'
    >
      <a-form
        labelAlign='right'
        v-bind='{
        labelCol: {
          // xs: { span: 24 },
          sm: { span: 4 },
        },
        wrapperCol: {
          //xs: { span: 24 },
          sm: { span: 20 },
        },
      }'
      >
        <!--        <a-form-item label='id'>-->
        <!--          <a-input-->
        <!--            style='width: 300px'-->
        <!--            v-model='dialogData.id'-->
        <!--            placeholder='请输入ID(唯一)'>-->
        <!--          </a-input>-->
        <!--        </a-form-item>-->

        <a-form-item label='姓名'>
          <a-input
            v-model='dialogData.name'
            placeholder='姓名'>
          </a-input>
        </a-form-item>
        <a-form-item label='手机号'>
          <a-input
            v-model='dialogData.account'
            :maxLength='11'
            :disabled="dialogMode !== 'add'"
            placeholder='账号/手机号'>
          </a-input>
        </a-form-item>
        <a-form-item label='初始密码' v-if='dialogMode === "add" || dialogMode === "edit"'>
          <a-switch default-checked v-model='dialogData.set_pwd' />
        </a-form-item>
        <a-form-item label='密码' v-if='dialogData.set_pwd===true'>
          <a-input-password
            v-model='dialogData.password'
            placeholder='密码'>
          </a-input-password>
        </a-form-item>
        <a-form-item label='确认密码' v-if='dialogData.set_pwd===true '>
          <a-input-password
            v-model='dialogData.password_confirm'
            placeholder='确认密码'>
          </a-input-password>
        </a-form-item>
        <a-form-item label="上级组织">
          <org-select
            v-model='dialogData.organization_id'
            :org-list="orgList"
          />
        </a-form-item>
        <a-form-item label='角色集'>
          <a-tree
            v-model='dialogData.role_ids'
            :replace-fields="{ children: 'childs', title: 'name', key: 'id' }"
            checkable
            :auto-expand-parent='true'
            :tree-data='all_role'
            :checkStrictly='true'
            @check='onRolesCheck'
          />
        </a-form-item>
      </a-form>

    </a-modal>

    <a-modal
      title='修改密码'
      cancelText='取消'
      okText='确定'
      v-if='pwdVisible'
      v-model='pwdVisible'
      :width='500'
      :maskClosable='false'
      @ok='handleSavePassword'
    >
      <a-form
        labelAlign='right'
        v-bind='{
          labelCol: { sm: { span: 5 } },
          wrapperCol: { sm: { span: 19 } },
        }'
      >
        <a-form-item label='账号'>
          <a-input v-model='pwdData.account' :disabled='true' />
        </a-form-item>
        <a-form-item label='姓名'>
          <a-input v-model='pwdData.name' :disabled='true' />
        </a-form-item>
        <a-form-item label='新密码'>
          <a-input-password
            v-model='pwdData.password'
            placeholder='请输入新密码'>
          </a-input-password>
        </a-form-item>
        <a-form-item label='确认新密码'>
          <a-input-password
            v-model='pwdData.password_confirm'
            placeholder='请再次输入新密码'>
          </a-input-password>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>

</template>

<script>
import {
  sys_role_layer_top,
  sys_user_add,
  sys_user_remove,
  sys_user_page,
  sys_user_update,
  getAdminOrgTree,
  sys_user_change_password
} from '@/api/manage'
import { OrgSelect } from '@/components'
import { showMsg } from '@/utils/data'

const columns = [
  {
    title: 'id',
    dataIndex: 'id'
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '名称',
    dataIndex: 'name'
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '账号',
    dataIndex: 'account'
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '角色名称',
    dataIndex: 'role.name'
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '组织',
    dataIndex: 'organization_name'
  },
  {
    title: '状态',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
  },
  {
    title: '创建时间',
    dataIndex: 'create_date'
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '操作',
    // dataIndex: 'create_time',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  components: {
    OrgSelect
  },
  mounted() {
    this.fetch()
    this.getAllRole()
  },
  data() {
    return {
      data: [],
      pagination: {},
      loading: false,
      columns,

      queryData: {
        id: null,
        account: null,
        name: null,
        organization_id: null,
        role_name: null,
        page_no: 1,
        page_size: 5
      },
      dialogData: {
        id: null,
        role_ids: [],
        role_id: null,
        password_confirm: null,
        set_pwd: false,
        organization_id: null
      },
      visible: false,
      dialogMode: 'add',
      pwdVisible: false,
      pwdData: {
        id: null,
        account: '',
        name: '',
        password: '',
        password_confirm: ''
      },
      all_role: [],
      orgList: [],
      roleNameList: []
    }
  },
  created () {
    this.getAdminOrgList()
  },
  methods: {
    handleTableChange(pagination, filters, sorter) {
      console.log(pagination)
      const pager = { ...this.pagination }
      pager.current = pagination.current
      pager.pageSize = 5
      this.pagination = pager
      this.queryData.page_no = pagination.current
      this.fetch()
    },
    fetch_no_page() {
      this.pagination.current = 1
      this.queryData.page_no = 1
      this.queryData.page_size = 5
      this.fetch()
    },
    fetch() {
      this.loading = true
      var arg = Object.assign({}, this.queryData)
      if (arg.time_start != null) {
        arg.time_start = arg.time_start.format('YYYY-MM-DDThh:mm:ss')
      }
      if (arg.time_end != null) {
        arg.time_end = arg.time_end.format('YYYY-MM-DDThh:mm:ss')
      }

      if (arg.account === '') {
        arg.account = null
      }
      if (arg.name === '') {
        arg.name = null
      }
      if (arg.role_name === '') {
        arg.role_name = null
      }
      // 取分页数据
      sys_user_page(arg).then((res) => {
        // alert(JSON.stringify(res))
        const pagination = { ...this.pagination }
        this.loading = false
        this.data = res.data.records
        pagination.total = res.data.total
        pagination.pageSize = res.data.page_size
        this.pagination = pagination
      })
    },

    addData: function() {
      this.handleDialogCancel()
      this.visible = true
      this.dialogMode = 'add'
    },
    // 处理添加产品
    handleAddData: function() {
      console.log('dialog data', this.dialogData)
      if (this.dialogData.set_pwd && this.dialogData.password_confirm !== this.dialogData.password) {
        this.$message.info('密码不一致!')
        return
      }
      if (this.dialogMode === 'add') {
        sys_user_add(this.dialogData)
          .then((res) => {
            this.visible = false
            this.fetch()
          }).catch(err => {

        })
      } else if (this.dialogMode === 'edit') {
        sys_user_update(this.dialogData)
          .then((res) => {
            this.visible = false
            this.fetch()
          })
      }
    },
    handleAddChild: function(scope) {
      this.visible = true
      this.dialogMode = 'add'
      if (scope.role !== undefined && scope.role !== null) {
        this.dialogData = Object.assign({ role_ids: [scope.role.id], role_id: scope.role.id }, scope)
      } else {
        this.dialogData = Object.assign({ role_ids: [], role_id: null }, scope)
      }
    },
    // handleEdit
    handleEdit: function(scope) {
      this.visible = true
      this.dialogMode = 'edit'
      if (scope.role !== undefined && scope.role !== null) {
        this.dialogData = Object.assign({ role_ids: [scope.role.id], role_id: scope.role.id }, scope)
      } else {
        this.dialogData = Object.assign({ role_ids: [], role_id: null }, scope)
      }
      this.dialogData.organization_id = scope.organization_id
    },
    handleDelete: function(scope) {
      const self = this
      this.$confirm({
        title: '你确定要删除?',
        content: '你确定要删除！',
        onOk() {
          sys_user_remove(scope)
            .then((res) => {
              showMsg(self, res)
              self.visible = false
              self.fetch()
            })
        },
        onCancel() {
          // console.log('Cancel');
        },
        class: 'test'
      })
    },
    handleEnableDisable: function(scope) {
      const self = this
      this.$confirm({
        title: scope.state === 0 ? '你确定要启用?' : '你确定要禁用?',
        content: scope.state === 0 ? '你确定要启用?' : '你确定要禁用?',
        onOk() {
          scope.state = scope.state === 0 ? 1 : 0
          sys_user_update(scope)
            .then((res) => {
              showMsg(self, res)
              self.visible = false
              self.fetch()
            })
        },
        onCancel() {
          // console.log('Cancel');
        },
        class: 'test'
      })
    },
    handleDialogCancel: function() {
      this.dialogData = {
        id: null,
        role_ids: [],
        role_id: null
      }
    },
    getAllRole: function() {
      sys_role_layer_top({})
        .then((res) => {
          this.all_role = res.data
          this.roleNameList = this.getFlatRoleNames(res.data)
        })
    },
    getFlatRoleNames(roles) {
      const names = []
      const traverse = (list) => {
        if (!list) return
        list.forEach(item => {
          if (item.name) {
            names.push(item.name)
          }
          if (item.childs) {
            traverse(item.childs)
          }
        })
      }
      traverse(roles)
      return [...new Set(names)]
    },
    onRolesCheck: function(data) {
      const len = data.checked.length
      if (len >= 1) {
        this.dialogData.role_ids = { 'checked': [data.checked[len - 1]], 'halfChecked': [] }
        this.dialogData.role_id = data.checked[len - 1]
      } else {
        this.dialogData.role_ids = []
        this.dialogData.role_id = null
      }
    },
    getAdminOrgList () {
      return getAdminOrgTree(this.queryParam)
        .then(res => {
          console.log('org list', res)
          this.orgList = res.data ? [res.data] : []
        })
    },
    handleChangePassword: function(scope) {
      this.pwdData = {
        id: scope.id,
        account: scope.account,
        name: scope.name,
        password: '',
        password_confirm: ''
      }
      this.pwdVisible = true
    },
    handleSavePassword: function() {
      if (!this.pwdData.password) {
        this.$message.info('请输入新密码!')
        return
      }
      if (this.pwdData.password !== this.pwdData.password_confirm) {
        this.$message.info('密码不一致!')
        return
      }
      sys_user_change_password({
        id: this.pwdData.id,
        password: this.pwdData.password
      }).then((res) => {
        this.$message.success('密码修改成功!')
        this.pwdVisible = false
        this.fetch()
      }).catch(err => {
        console.error(err)
      })
    }
  }
}
</script>

<style lang='less'>
.dataBody {
  background: #ffffff;
  padding: 10px;
}
</style>
