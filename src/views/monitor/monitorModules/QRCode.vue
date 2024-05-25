<template>
  <a-modal :footer="null" :title="`[${title}]的二维码`" width="20%" :visible="visible" :confirmLoading="loading"
    :class="{ 'custom-modal-height': true }" @cancel="() => { $emit('cancel') }">
    <QRCodeVue :text="title" :size="250" :width="100" :height="100" level="H"></QRCodeVue>
  </a-modal>
</template>


<script>
  import QRCodeVue from 'vue-qrcode-component';

  export default {
    components: {
      QRCodeVue,
    },
    props: {
      title: {
        type: String
      },
      visible: {
        type: Boolean,
        required: true
      },
      loading: {
        type: Boolean,
        default: () => false
      },
    },
    data() {
      return {
        nowtitle: ''
      }
    },
  }
</script>

<style>

</style>