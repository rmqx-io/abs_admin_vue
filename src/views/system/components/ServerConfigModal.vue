<template>
  <a-modal
    :visible="visible"
    :title="modalTitle"
    width="800px"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
    :destroyOnClose="true"
  >
    <a-form :form="form" layout="vertical">
      <!-- 基本信息 -->
      <a-card title="基本信息" size="small" class="form-card">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="服务器名称">
              <a-input
                v-decorator="['server_name', {
                  rules: [{ required: true, message: '请输入服务器名称' }]
                }]"
                placeholder="请输入服务器名称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="服务器类型">
              <a-select
                v-decorator="['server_type', {
                  rules: [{ required: true, message: '请选择服务器类型' }]
                }]"
                placeholder="请选择服务器类型"
              >
                <a-select-option value="web">Web服务器</a-select-option>
                <a-select-option value="database">数据库服务器</a-select-option>
                <a-select-option value="cache">缓存服务器</a-select-option>
                <a-select-option value="message">消息服务器</a-select-option>
                <a-select-option value="file">文件服务器</a-select-option>
                <a-select-option value="monitor">监控服务器</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="运行环境">
              <a-select
                v-decorator="['environment', {
                  rules: [{ required: true, message: '请选择运行环境' }]
                }]"
                placeholder="请选择运行环境"
              >
                <a-select-option value="production">生产环境</a-select-option>
                <a-select-option value="staging">测试环境</a-select-option>
                <a-select-option value="development">开发环境</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="版本号">
              <a-input
                v-decorator="['version']"
                placeholder="请输入版本号，如 v1.0.0"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="服务器描述">
          <a-textarea
            v-decorator="['description']"
            placeholder="请输入服务器描述"
            :rows="2"
          />
        </a-form-item>
      </a-card>

      <!-- 连接配置 -->
      <a-card title="连接配置" size="small" class="form-card">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="IP地址">
              <a-input
                v-decorator="['ip_address', {
                  rules: [
                    { required: true, message: '请输入IP地址' },
                    { pattern: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, message: 'IP地址格式不正确' }
                  ]
                }]"
                placeholder="请输入IP地址，如 192.168.1.100"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="端口号">
              <a-input-number
                v-decorator="['port', {
                  rules: [{ required: true, message: '请输入端口号' }]
                }]"
                placeholder="请输入端口号"
                :min="1"
                :max="65535"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="协议类型">
              <a-select
                v-decorator="['protocol', {
                  rules: [{ required: true, message: '请选择协议类型' }]
                }]"
                placeholder="请选择协议类型"
                @change="handleProtocolChange"
              >
                <a-select-option value="HTTP">HTTP</a-select-option>
                <a-select-option value="HTTPS">HTTPS</a-select-option>
                <a-select-option value="TCP">TCP</a-select-option>
                <a-select-option value="UDP">UDP</a-select-option>
                <a-select-option value="MQTT">MQTT</a-select-option>
                <a-select-option value="WebSocket">WebSocket</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态">
              <a-select
                v-decorator="['status', { initialValue: 'online' }]"
                placeholder="请选择状态"
              >
                <a-select-option value="online">在线</a-select-option>
                <a-select-option value="offline">离线</a-select-option>
                <a-select-option value="warning">异常</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="连接URL">
          <a-input
            v-decorator="['connection_url']"
            placeholder="完整的连接URL，如 https://api.example.com:443"
            :addon-before="urlPrefix"
          />
        </a-form-item>
      </a-card>

      <!-- 安全配置 -->
      <a-card title="安全配置" size="small" class="form-card">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="SSL配置">
              <a-switch
                v-decorator="['ssl_enabled', { valuePropName: 'checked' }]"
                @change="handleSslChange"
              />
              <span style="margin-left: 8px">启用SSL加密传输</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="身份认证">
              <a-switch
                v-decorator="['auth_required', { valuePropName: 'checked' }]"
                @change="handleAuthChange"
              />
              <span style="margin-left: 8px">需要身份认证</span>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- SSL证书配置 -->
        <div v-if="sslEnabled" class="ssl-config">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="证书文件路径">
                <a-input
                  v-decorator="['ssl_cert_path']"
                  placeholder="SSL证书文件路径"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="私钥文件路径">
                <a-input
                  v-decorator="['ssl_key_path']"
                  placeholder="SSL私钥文件路径"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <!-- 认证配置 -->
        <div v-if="authRequired" class="auth-config">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="认证方式">
                <a-select
                  v-decorator="['auth_type', { initialValue: 'basic' }]"
                  placeholder="选择认证方式"
                >
                  <a-select-option value="basic">Basic认证</a-select-option>
                  <a-select-option value="token">Token认证</a-select-option>
                  <a-select-option value="oauth">OAuth认证</a-select-option>
                  <a-select-option value="certificate">证书认证</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="用户名">
                <a-input
                  v-decorator="['auth_username']"
                  placeholder="认证用户名"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="密码/Token">
                <a-input-password
                  v-decorator="['auth_password']"
                  placeholder="认证密码或Token"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </div>
      </a-card>

      <!-- 高级配置 -->
      <a-card title="高级配置" size="small" class="form-card">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="最大连接数">
              <a-input-number
                v-decorator="['max_connections', { initialValue: 100 }]"
                placeholder="最大连接数"
                :min="1"
                :max="10000"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="连接超时(秒)">
              <a-input-number
                v-decorator="['timeout', { initialValue: 30 }]"
                placeholder="连接超时时间"
                :min="1"
                :max="300"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="重试次数">
              <a-input-number
                v-decorator="['retry_attempts', { initialValue: 3 }]"
                placeholder="重试次数"
                :min="0"
                :max="10"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="健康检查URL">
              <a-input
                v-decorator="['health_check_url']"
                placeholder="健康检查接口URL"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="检查间隔(秒)">
              <a-input-number
                v-decorator="['health_check_interval', { initialValue: 60 }]"
                placeholder="健康检查间隔"
                :min="10"
                :max="3600"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="扩展配置">
          <a-textarea
            v-decorator="['extra_config']"
            placeholder="JSON格式的扩展配置参数"
            :rows="3"
          />
          <div class="config-hint">
            请输入JSON格式的配置，例如: {"keepAlive": true, "poolSize": 10}
          </div>
        </a-form-item>
      </a-card>

      <!-- 监控配置 -->
      <a-card title="监控配置" size="small" class="form-card">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="监控启用">
              <a-switch
                v-decorator="['monitoring_enabled', { valuePropName: 'checked', initialValue: true }]"
              />
              <span style="margin-left: 8px">启用监控</span>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="日志级别">
              <a-select
                v-decorator="['log_level', { initialValue: 'info' }]"
                placeholder="选择日志级别"
              >
                <a-select-option value="debug">Debug</a-select-option>
                <a-select-option value="info">Info</a-select-option>
                <a-select-option value="warn">Warn</a-select-option>
                <a-select-option value="error">Error</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="告警阈值(%)">
              <a-input-number
                v-decorator="['alert_threshold', { initialValue: 80 }]"
                placeholder="CPU/内存告警阈值"
                :min="50"
                :max="95"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-card>
    </a-form>

    <!-- 连接测试按钮 -->
    <div class="test-connection">
      <a-button @click="testConnection" :loading="testLoading">
        <a-icon type="api" />
        测试连接
      </a-button>
      <span v-if="testResult" :class="['test-result', testResult.success ? 'success' : 'error']">
        {{ testResult.message }}
      </span>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'ServerConfigModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      default: 'create' // create | edit
    }
  },
  data() {
    return {
      form: this.$form.createForm(this),
      loading: false,
      testLoading: false,
      testResult: null,
      sslEnabled: false,
      authRequired: false,
      selectedProtocol: ''
    }
  },
  computed: {
    modalTitle() {
      return this.mode === 'edit' ? '编辑服务器配置' : '新增服务器配置'
    },
    
    urlPrefix() {
      const protocolMap = {
        HTTP: 'http://',
        HTTPS: 'https://',
        TCP: 'tcp://',
        UDP: 'udp://',
        MQTT: 'mqtt://',
        WebSocket: 'ws://'
      }
      return protocolMap[this.selectedProtocol] || 'http://'
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initForm()
      }
    }
  },
  methods: {
    initForm() {
      this.testResult = null
      
      if (this.mode === 'edit' && this.data) {
        // 编辑模式，填充现有数据
        const formData = {
          server_name: this.data.server_name,
          server_type: this.data.server_type,
          environment: this.data.environment,
          version: this.data.version,
          description: this.data.description,
          ip_address: this.data.ip_address,
          port: this.data.port,
          protocol: this.data.protocol,
          status: this.data.status,
          connection_url: this.data.connection_url,
          ssl_enabled: this.data.ssl_enabled,
          auth_required: this.data.auth_required,
          ssl_cert_path: this.data.ssl_cert_path,
          ssl_key_path: this.data.ssl_key_path,
          auth_type: this.data.auth_type || 'basic',
          auth_username: this.data.auth_username,
          auth_password: this.data.auth_password,
          max_connections: this.data.config?.max_connections || 100,
          timeout: this.data.config?.timeout || 30,
          retry_attempts: this.data.config?.retry_attempts || 3,
          health_check_url: this.data.health_check_url,
          health_check_interval: this.data.health_check_interval || 60,
          extra_config: this.data.extra_config ? JSON.stringify(this.data.extra_config, null, 2) : '',
          monitoring_enabled: this.data.monitoring_enabled !== false,
          log_level: this.data.log_level || 'info',
          alert_threshold: this.data.alert_threshold || 80
        }
        
        this.sslEnabled = this.data.ssl_enabled
        this.authRequired = this.data.auth_required
        this.selectedProtocol = this.data.protocol
        
        this.$nextTick(() => {
          this.form.setFieldsValue(formData)
        })
      } else {
        // 新建模式，设置默认值
        this.sslEnabled = false
        this.authRequired = false
        this.selectedProtocol = ''
        
        this.$nextTick(() => {
          this.form.setFieldsValue({
            status: 'online',
            max_connections: 100,
            timeout: 30,
            retry_attempts: 3,
            health_check_interval: 60,
            monitoring_enabled: true,
            log_level: 'info',
            alert_threshold: 80
          })
        })
      }
    },

    async handleOk() {
      try {
        const values = await this.form.validateFields()
        this.loading = true

        // 处理扩展配置
        let extraConfig = {}
        if (values.extra_config) {
          try {
            extraConfig = JSON.parse(values.extra_config)
          } catch (error) {
            this.$message.error('扩展配置格式错误，请输入有效的JSON')
            return
          }
        }

        const serverData = {
          ...values,
          config: {
            max_connections: values.max_connections,
            timeout: values.timeout,
            retry_attempts: values.retry_attempts
          },
          extra_config: extraConfig,
          connection_url: `${this.urlPrefix}${values.ip_address}:${values.port}`
        }

        // 模拟API调用
        await this.saveServerConfig(serverData)

        this.$message.success(this.mode === 'edit' ? '服务器配置更新成功' : '服务器配置创建成功')
        this.$emit('refresh')
        this.handleCancel()
      } catch (error) {
        if (error.errorFields) {
          return // 表单验证失败
        }
        console.error('保存失败:', error)
        this.$message.error('保存失败，请重试')
      } finally {
        this.loading = false
      }
    },

    handleCancel() {
      this.form.resetFields()
      this.testResult = null
      this.sslEnabled = false
      this.authRequired = false
      this.selectedProtocol = ''
      this.$emit('close')
    },

    async saveServerConfig(data) {
      // 模拟API保存
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('保存服务器配置:', data)
          resolve()
        }, 1000)
      })
    },

    // 协议变化处理
    handleProtocolChange(protocol) {
      this.selectedProtocol = protocol
      
      // 根据协议设置默认端口
      const defaultPorts = {
        HTTP: 80,
        HTTPS: 443,
        TCP: 8080,
        UDP: 8081,
        MQTT: 1883,
        WebSocket: 8082
      }
      
      const defaultPort = defaultPorts[protocol]
      if (defaultPort) {
        this.form.setFieldsValue({ port: defaultPort })
      }
    },

    // SSL开关处理
    handleSslChange(checked) {
      this.sslEnabled = checked
    },

    // 认证开关处理
    handleAuthChange(checked) {
      this.authRequired = checked
    },

    // 测试连接
    async testConnection() {
      try {
        await this.form.validateFields(['ip_address', 'port', 'protocol'])
        this.testLoading = true
        
        // 模拟连接测试
        setTimeout(() => {
          const success = Math.random() > 0.3
          this.testResult = {
            success: success,
            message: success ? '连接测试成功' : '连接测试失败，请检查配置'
          }
          this.testLoading = false
        }, 2000)
      } catch (error) {
        // 表单验证失败
      }
    }
  }
}
</script>

<style scoped>
.form-card {
  margin-bottom: 16px;
}

.ssl-config,
.auth-config {
  background: #fafafa;
  border-radius: 6px;
  padding: 16px;
  margin-top: 12px;
}

.config-hint {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

.test-connection {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;

  .test-result {
    margin-left: 12px;
    font-size: 14px;

    &.success {
      color: #52c41a;
    }

    &.error {
      color: #f5222d;
    }
  }
}
</style>
