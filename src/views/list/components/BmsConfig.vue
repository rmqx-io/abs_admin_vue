<template>
  <div>
    <div v-if='errorMsg' class='error'>{{ this.errorMsg }}</div>
    <div v-if='statusMsg' class='success'>{{ this.statusMsg }}</div>
    <div class='reboot-button'><template><a @click='handleRestart()'>重启 BMS</a></template></div>
<!--    <div><template><a @click='handleGetBmsDataTypes()'>get bms data types</a></template></div>-->
<!--    <div><template><a @click='handleGetBmsDataTypesMap()'>get bms data types map</a></template></div>-->
    <!--<div>bms config</div>-->
    <a-modal
      :visible="showSetConfigForm"
      @ok="() => { handleOk() }"
      @cancel="() => { handleCancel() }"
    >
      <h3>修改 BMS 配置</h3>
      <a-form>
        <a-form-item :label="configItem.name_cn">
          <div>当前值: {{ configItem.value }} 范围: {{ configItem.min }} ~ {{ configItem.max }}</div>
          <div>{{ configItem.comment }}</div>
          <div v-if='formErrorMessage' class='error'>{{ this.formErrorMessage}}</div>
          <a-input type="text" v-model="configItem.value" />
        </a-form-item>
      </a-form>
    </a-modal>
    <el-descriptions :column="6" size="mini" border>
      <el-descriptions-item
        span="2"
        v-for="(value, name, index) in this.bmsConfig"
        :key="name"
        :label="bmsConfigKeyToNameFromServer[name].name_cn"
      >
        <span>{{ value }}</span>
        <br />
        <template v-if='bmsConfigKeyToNameFromServer[name].writable'><a @click='handleSetBmsConfig(bmsConfigKeyToNameFromServer[name], value)'>配置</a></template>
      </el-descriptions-item>
    </el-descriptions>
    <!--<div>{{ this.deviceId }}</div>-->
    <!--<div>{{ this.bmsConfig }}</div>-->
  </div>
</template>

<script>
import {
  setBmsConfig, getBatteryInfoLatest, getBmsConfigDataTypes, getBmsConfigDataTypesMap,
  getBmsType
} from '@/api/manage'
import Error from '@/views/result/Error'

function localErrorMessage (errorMsg) {
  if (errorMsg === 'session not found') {
    return '设备不在线'
  }

  return errorMsg
}

export default {
  name: 'BmsConfig',
  components: { Error },
  props: {
    deviceId: {
      type: String,
      default: () => {}
    }
  },
  mounted () {
    getBmsConfigDataTypesMap('nw')
      .then(res => {
        console.log('nw bms data types map', res)
        this.bmsConfigKeyToNameFromServer = res.data
      })
    getBmsType(this.deviceId).then(res => {
      console.log('bms type', res.bms_type)
      getBatteryInfoLatest(this.deviceId, res.bms_type, {})
        .then(res => {
          console.log('latest battery info', res.data.device_bms_config)
          this.bmsConfig = res.data.device_bms_config
          // remove id
          delete this.bmsConfig.id
          delete this.bmsConfig.device_id
        })
    })
  },
  data () {
    return {
      bmsConfigKeyToNameFromServer: {
      },
      bmsConfigDataTypesFromServer: {
      },
      bmsConfig: {},
      errorMsg: null,
      statusMsg: null,
      formErrorMessage: null,
      showSetConfigForm: false,
      configItem: {
        name: '',
        description: ''
      }
    }
  },
  methods: {
    doSetBmsConfig (arg) {
      // clear error & status message
      this.errorMsg = null
      this.statusMsg = null
      this.formErrorMessage = null
      setBmsConfig(this.deviceId, arg)
        .then(res => {
          console.log('res', res)
          this.statusMsg = '发送成功'
        }).catch(err => {
        console.log('err', err.response.data)
        if (err != null && err.response != null && err.response.data != null) {
          if (err.response.data.msg != null) {
            // toast error msg
            let errorMsg = null
            errorMsg = localErrorMessage(err.response.data.msg)
            this.errorMsg = errorMsg
          }
        }
      })
    },
    handleRestart () {
      console.log('send reboot command to', this.deviceId)

      // send reboot command to device
      const arg = {
        name: 'restart', value: '1'
      }
      this.doSetBmsConfig(arg)
    },
    handleGetBmsDataTypes () {
      getBmsConfigDataTypes('nw')
        .then(res => {
          console.log('nw bms data types', res)
        })
    },
    handleGetBmsDataTypesMap () {
      getBmsConfigDataTypesMap('nw')
        .then(res => {
          console.log('nw bms data types map', res)
        })
    },
    handleSetBmsConfig (item, value) {
      this.errorMsg = null
      this.statusMsg = null
      this.formErrorMessage = null

      this.showSetConfigForm = true
      this.configItem = item
      this.configItem.value = value
    },
    handleOk () {
      // handle form submission
      console.log(this.configItem)
      // send config command to device
      const arg = {
        name: this.configItem.name, value: '' + this.configItem.value
      }
      console.log('handleOk', this.configItem)
      if (this.configItem.min != null && this.configItem.max != null) {
        if (this.configItem.value < this.configItem.min || this.configItem.value > this.configItem.max) {
          this.errorMsg = '输入值超出范围'
          this.formErrorMessage = this.errorMsg
        } else {
          this.doSetBmsConfig(arg)
          this.showSetConfigForm = false
        }
      }
    },
    handleCancel () {
      this.showSetConfigForm = false
    }
  }
}
</script>

<style scoped>
.info, .success, .warning, .error, .validation {
  border: 1px solid;
  margin: 10px 0px;
  padding: 15px 10px 15px 50px;
  background-repeat: no-repeat;
  background-position: 10px center;
}
.error{
  color: #D8000C;
  background-color: #FFBABA;
  background-image: url('~@/assets/icons/error.png');
}
.success {
  color: #4F8A10;
  background-color: #DFF2BF;
  background-image: url('~@/assets/icons/success.png');
}
.reboot-button {
  margin-bottom: 8px;
}

</style>
