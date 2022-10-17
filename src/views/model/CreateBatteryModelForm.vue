<template>
  <a-modal
    title="添加组织"
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
        <a-form-item label="名称">
          <a-input v-decorator="['name', { initialValue: '', rules: [ {required: true, min: 1} ]}]" />
        </a-form-item>
        <a-form-item label="上级组织">
          <a-tree-select
            show-search
            tree-default-expand-all
            :filterTreeNode="filterTreeNode"
            :treeData="orgList"
            v-decorator="['parent_id', { rules: [ {required: true} ]}]"
          ></a-tree-select>
        </a-form-item>
        <a-form-item label="描述">
          <a-input v-decorator="['description', {rules: [{required: false}]}]" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>

</template>

<script>
import pick from 'lodash.pick'
import TagSelectOption from '@/components/TagSelect/TagSelectOption'
import { getAdminOrgTree } from '@/api/manage'

// 表单字段
const fields = ['description', 'id']

export default {
  name: 'CreateBatteryModelForm',
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
      orgList: [
        {
          title: '根',
          value: 0,
          key: 0,
          children: [
            {
              title: '客户公司1',
              value: 1,
              key: 1
            },
            {
              title: '客户团体2',
              value: 2,
              key: 2
            }
          ]
        }
      ]
    }
  },
  created () {
    console.log('create battery model modal created')

    // this.getAdminOrgList()

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
    onChange () {
      this.$emit('onChange', {
        type: this.item.value,
        key: this.item.value,
        value: {
          tag_contain: this.include_tag,
          tag_no_contain: this.not_include_tag
        }
      })
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

<style scoped>

</style>
