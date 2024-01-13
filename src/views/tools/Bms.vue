<template>
    <a-card>
        <div>Bms Tools</div>
        <div>
            <!-- 根据设备号，查询相关 Bms 数据 -->
            <a-form>
                <a-input v-model='device_id' placeholder="请输入设备号" />
                <a-button type="primary" @click="getBmsDebugData">查询</a-button>
            </a-form>
            <div>bms 类型</div>
            <div>{{ this.bms_type_data }}</div>
            <div>最后一笔数据</div>
            <div>{{ this.bms_latest_data }}</div>
            <div>历史数据</div>
            <div>{{ this.bms_history_data }}</div>
        </div>
    </a-card>
</template>

<script>
import {
    getBmsType,
    getBatteryInfoLatest,
    getBatteryInfo
} from '@/api/manage'
import moment from 'moment/moment'

export default {
    name: 'Bms',
    data () {
        return {
            device_id: '',
            bms_type: '',
            bms_type_data: '',
            bms_latest_data: '',
            bms_history_data: ''
        }
    },
    methods: {
        getBmsDebugData () {
            console.log('getBmsDebugData')
            // get bms type
            getBmsType(this.device_id).then(res => {
                console.log('getBmsType', res)
                this.bms_type_data = res.data
                this.bms_type = res.data.bms_type

                // get bms latest data
                getBatteryInfoLatest(this.device_id, this.bms_type, {}).then(res => {
                    console.log('getBatteryInfoLatest', res)
                    this.bms_latest_data = res.data
                })

                // get bms history data
                const arg = {
                    start_date: moment(new Date() - 2 * 60 * 60 * 1000),
                    start_time: moment(new Date() - 2 * 60 * 60 * 1000)
                }
                getBatteryInfo(this.device_id, this.bms_type, arg).then(res => {
                    console.log('getBatteryInfo', res)
                    this.bms_history_data = res.data
                })
            })
        }
    }
}
</script>
