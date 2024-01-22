<template>
  <a-modal
    title="添加/修改 设备"
    width="90vw"
    centered
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
          <!-- <a-input v-decorator="['code', { initialValue: '', rules: [ {required: true, min: 5, message: '至少5位'} ]}]" /> -->
          <a-textarea
            v-decorator="['code', { rules: [{ required: true, message: '设备编号' }] }]"
            :rows="4"
            placeholder='输入设备编号
一行一个设备' />
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
            :options="options"
            v-decorator="['model_id', { rules: [ {required: true} ]}]"
          >
          </a-select>
        </a-form-item>
        <a-form-item label="电池类型">
          <a-select
            :options="batteryModelOptions"
            v-decorator="['battery_id', { rules: [ {required: false} ]}]"
          >
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
import { getAdminOrgTree, getBatteryModelList, getDeviceModelList } from '@/api/manage'

// 表单字段
const fields = ['id', 'code', 'organization_id', 'storehouse_name', 'battery_id', 'model_id', 'bms_bt', 'h_ver', 's_ver', 'iccid']

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
      options: [],
      batteryModelOptions: []
    }
  },
  created () {
    console.log('custom modal created')

    this.getAdminOrgList()
    this.getDeviceModelListOptions()
    this.getBatteryModelOptions()

    // 防止表单未注册
    fields.forEach(v => this.form.getFieldDecorator(v))

    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      console.log('set fields value', this.model)
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
    },
    getDeviceModelListOptions () {
      let parameter = {}
      let arg = Object.assign(parameter, this.queryData)
      arg.page_no = arg.pageNo
      arg.page_size = arg.pageSize
      delete arg.pageNo
      delete arg.pageSize

      return getDeviceModelList(arg)
        .then(res => {
          console.log('device model list', res.data.records)
          res.data.records.forEach((model) => {
            this.options.push({ value: model.id, label: model.name })
          })
          console.log('device model', this.options)
        })
    },
    getBatteryModelOptions () {
      return getBatteryModelList({})
        .then(res => {
          console.log('battery model list', res.data.records)
          res.data.records.forEach((model) => {
            this.batteryModelOptions.push({ value: model.id, label: model.name })
          })
          console.log('battery model', this.batteryModelOptions)
        })
    }
  }
}
</script>
