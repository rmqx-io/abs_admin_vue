<template>
    <a-card>
        <div>
            <h2>告警数据库配置</h2>
            <p>管理告警数据是否写入数据库的开关</p>
            
            <a-form :model="configForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-form-item label="告警数据库写入">
                    <a-switch
                        v-model="configForm.enabled"
                        @change="onSwitchChange"
                        :loading="loading"
                    />
                    <span class="switch-text">
                        {{ configForm.enabled ? '已启用' : '已禁用' }}
                    </span>
                </a-form-item>
                
                <a-form-item label="当前状态">
                    <a-tag :color="configForm.enabled ? 'green' : 'red'">
                        {{ configForm.enabled ? '告警数据将写入数据库' : '告警数据不会写入数据库' }}
                    </a-tag>
                </a-form-item>
                
                <a-form-item label="说明">
                    <div>
                        <p>• 启用时：所有BMS告警数据将正常写入数据库</p>
                        <p>• 禁用时：BMS告警数据将被跳过，不写入数据库，但其他数据处理逻辑不受影响</p>
                        <p>• 此设置可以实时生效，无需重启服务</p>
                    </div>
                </a-form-item>
            </a-form>
            
            <div class="action-buttons">
                <a-button type="primary" @click="refreshConfig" :loading="loading">
                    刷新状态
                </a-button>
            </div>
        </div>
    </a-card>
</template>

<script>
import request from '@/utils/request'
import { api } from '@/api/manage'

// API functions
const getAlarmConfig = async () => {
  return request({
    url: api.tools_alarm_config,
    method: 'get'
    })
}

const setAlarmConfig = async (config) => {
    return request({
        url: api.tools_alarm_config,
        method: 'post',
        data: config
    })
}

export default {
    name: 'AlarmConfig',
    data () {
        return {
            configForm: {
                enabled: true
            },
            loading: false
        }
    },
    mounted () {
        this.refreshConfig()
    },
    methods: {
        async refreshConfig () {
            this.loading = true
            try {
                const res = await getAlarmConfig()
                console.log('getAlarmConfig response:', res)
                if (res && res.data) {
                    this.configForm.enabled = res.data.enabled
                }
            } catch (error) {
                console.error('获取告警配置失败:', error)
                this.$message.error('获取配置失败')
            } finally {
                this.loading = false
            }
        },
        
        async onSwitchChange (checked) {
            this.loading = true
            try {
                const res = await setAlarmConfig({ enabled: checked })
                console.log('setAlarmConfig response:', res)
                this.$message.success(`告警数据库写入已${checked ? '启用' : '禁用'}`)
            } catch (error) {
                console.error('设置告警配置失败:', error)
                this.$message.error('设置配置失败')
                // 回滚开关状态
                this.configForm.enabled = !checked
            } finally {
                this.loading = false
            }
        }
    }
}
</script>

<style scoped>
.switch-text {
    margin-left: 8px;
    color: #666;
}

.action-buttons {
    margin-top: 24px;
    text-align: center;
}

.ant-form-item {
    margin-bottom: 24px;
}

h2 {
    color: #1890ff;
    margin-bottom: 16px;
}

p {
    margin-bottom: 8px;
    color: #666;
}
</style> 