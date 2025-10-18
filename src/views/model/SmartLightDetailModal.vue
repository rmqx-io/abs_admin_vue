<template>
  <a-modal
    :visible="visible"
    title="智能照明详情"
    width="800px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div v-if="data">
      <a-descriptions bordered>
        <a-descriptions-item label="设备ID">{{ data.device_id }}</a-descriptions-item>
        <a-descriptions-item label="设备名称">{{ data.device_name }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ data.status }}</a-descriptions-item>
      </a-descriptions>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'SmartLightDetailModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    }
  },
  methods: {
    handleCancel() {
      this.$emit('close')
    }
  }
}
</script>
