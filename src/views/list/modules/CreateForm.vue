<template>
  <a-modal
    title="添加设备"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-form-item v-show="model && model.id > 0" label="主键ID">
          <a-input v-decorator="['id', { initialValue: 0 }]" disabled />
        </a-form-item>
        <a-form-item label="设备编号">
          <a-input v-decorator="['code', { initialValue: '', rules: [ {required: true, min: 5, message: '至少5位'} ]}]" />
        </a-form-item>
        <a-form-item label="运营单位">
          <a-tree-select
            show-search
            tree-default-expand-all
            :filterTreeNode="filterTreeNode"
            :treeData="orgList"
            v-decorator="['organization_id', { rules: [ {required: true} ]}]"
          ></a-tree-select>
        </a-form-item>
        <a-form-item label="设备类型">
          <a-select
            v-decorator="['model_name', { rules: [ {required: true} ]}]"
          >
            <a-select-option
              :value=1
              >类型1</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="电池类型">
          <a-select
            v-decorator="['battery_name', { rules: [ {required: false} ]}]"
          >
            <a-select-option
              :value=1
            >类型1</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label='电话卡'>
          <a-input v-decorator="['iccid']"/>
        </a-form-item>
<!--        <a-form-item label="描述">-->
<!--          <a-input v-decorator="['description', {rules: [{required: true, min: 5, message: '请输入至少五个字符的规则描述！'}]}]" />-->
<!--        </a-form-item>-->
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import TagSelectOption from '@/components/TagSelect/TagSelectOption'
import { getAdminOrgTree } from '@/api/manage'

// 表单字段
const fields = ['id', 'code', 'organization_id', 'storehouse_name', 'battery_name', 'model_name', 'bms_bt', 'h_ver', 's_ver', 'iccid']

export default {
  components: { TagSelectOption },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      default: () => false
    },
    model: {
      type: Object,
      default: () => null
    }
  },
  data () {
    this.formLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      }
    }
    return {
      form: this.$form.createForm(this),
      orgList: [],
      org: undefined
    }
  },
  created () {
    console.log('custom modal created')

    this.getAdminOrgList()

    // 防止表单未注册
    fields.forEach(v => this.form.getFieldDecorator(v))

    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      this.model && this.form.setFieldsValue(pick(this.model, fields))
    })
  },
  methods: {
    filterTreeNode (input, option) {
      return (
        option.data.props.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    getAdminOrgList () {
      return getAdminOrgTree(this.queryParam)
        .then(res => {
          console.log('org list', res)
          this.orgList = []
          this.orgList.push(res.data)
        })
    }
  }
}
</script>
