<template>
    <a-modal
        title="下发 BT 码"
        width="90vw"
        centered
        :visible="visible"
        :confirmLoading="loading"
        @ok="() => { handleOk() }"
        @cancel="() => { handleCancel(); $emit('cancel') }"
    >
        <div>
            <a-form-item
                :label="`设备编号和 BT 码`"
            >
            <a-textarea
                v-decorator="['device_id_and_bt_code', {rules: [{required: true, message: '设备编号'}]}]"
                :rows="4"
                v-model='device_id_and_bt_code'
                placeholder='输入设备编号和 BT 码
一行一个设备
012345678901    BT12345678
'
            />
            </a-form-item>
            <div v-if='formErrorMessage' class='error'>{{ this.formErrorMessage }}</div>
            <a-button type="primary" @click="handleSend">
                下发
            </a-button>
        </div>
    </a-modal>
</template>

<script>

import { sendCommandSetBtCodes } from '@/api/manage'

export default {
    name: 'SendBtCode',
    props: {
        visible: {
            type: Boolean,
            required: true
        },
        loading: {
            type: Boolean,
            default: () => false
        }
    },
    data () {
        return {
            formErrorMessage: null,
            device_id_and_bt_code: ''
        }
    },
    methods: {
        handleOk() {
            this.$emit('ok')
        },
        handleCancel() {
            this.$emit('cancel')
        },
        handleSend() {
            const arg = {
                device_id_and_bt_code: this.device_id_and_bt_code
            }
            sendCommandSetBtCodes(arg)
                .then(res => {
                    if (res.data) {
                        this.$message.success('下发成功')
                        this.handleCancel()
                    } else {
                        this.formErrorMessage = res.data.message
                    }
                })
                .catch(err => {
                    this.formErrorMessage = err.message
                })
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
</style>
