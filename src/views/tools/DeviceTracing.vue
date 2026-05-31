<template>
  <div class="device-tracing-container">
    <!-- Non-Sysadmin Role Guard -->
    <a-card v-if="!isSysadmin" :bordered="false" class="access-denied-card">
      <div class="denied-content">
        <a-icon type="warning" class="denied-icon" />
        <h1 class="denied-title">{{ $t('menu.exception.not-permission') }}</h1>
        <p class="denied-desc">Only members of the sysadmin group are authorized to configure and view online device tracing records.</p>
        <a-button type="primary" size="large" @click="goHome">
          Return to Dashboard
        </a-button>
      </div>
    </a-card>

    <!-- Sysadmin Workspace -->
    <div v-else class="tracing-workspace">
      <!-- Page Header -->
      <div class="workspace-header">
        <div class="header-main">
          <div class="title-section">
            <h1 class="header-title">Online Device Tracing Control</h1>
            <p class="header-subtitle">Real-time distributed execution telemetry across JT808 Broker, database queues, batchers, and DB proxy.</p>
          </div>
          <!-- Pulse Banner -->
          <div :class="['status-banner', isTracingActive ? 'banner-active' : 'banner-inactive']">
            <div class="banner-pulse"></div>
            <div class="banner-text">
              <span class="banner-status-label">{{ isTracingActive ? 'Active Tracing Engaged' : 'Tracing Suspended' }}</span>
              <span v-if="isTracingActive && expiryCountdown" class="banner-expiry">
                Expires in: <span class="countdown-clock">{{ expiryCountdown }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="workspace-layout">
        <!-- Left Pane: Configuration & Controls -->
        <div class="control-pane">
          <a-card :bordered="false" class="premium-card control-card">
            <div class="card-glow"></div>
            <h2 class="section-title">Telemetry Configuration</h2>
            
            <a-form layout="vertical" class="premium-form">
              <a-form-item label="Device SIM ID / Code">
                <a-input 
                  v-model="config.deviceId" 
                  placeholder="e.g. 058215000251" 
                  size="large"
                  class="premium-input"
                  :disabled="isTracingActive"
                >
                  <a-icon slot="prefix" type="mobile" />
                </a-input>
              </a-form-item>

              <a-form-item label="Capture Duration (TTL)">
                <a-select v-model="config.ttlMinutes" size="large" class="premium-select" :disabled="isTracingActive">
                  <a-select-option :value="5">5 Minutes</a-select-option>
                  <a-select-option :value="15">15 Minutes</a-select-option>
                  <a-select-option :value="30">30 Minutes</a-select-option>
                  <a-select-option :value="60">1 Hour</a-select-option>
                  <a-select-option :value="120">2 Hours</a-select-option>
                  <a-select-option :value="720">12 Hours</a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="Max Captured Records Limit">
                <a-input-number 
                  v-model="config.maxRecords" 
                  :min="10" 
                  :max="10000" 
                  size="large"
                  class="premium-input-number"
                  :disabled="isTracingActive"
                />
              </a-form-item>

              <a-form-item label="Capture Raw Package Body">
                <div class="switch-row">
                  <a-switch v-model="config.includePayload" :disabled="isTracingActive" />
                  <span class="switch-desc">High performance overhead</span>
                </div>
              </a-form-item>

              <!-- Action buttons -->
              <div class="action-zone">
                <a-button 
                  v-if="!isTracingActive"
                  type="primary" 
                  size="large" 
                  block 
                  class="btn-start"
                  @click="startTrace"
                  :loading="btnLoading"
                  :disabled="!config.deviceId"
                >
                  <a-icon type="play-circle" /> Engaged Device Tracing
                </a-button>

                <a-button 
                  v-else
                  type="danger" 
                  size="large" 
                  block 
                  class="btn-stop"
                  @click="stopTrace"
                  :loading="btnLoading"
                >
                  <a-icon type="stop" /> Suspend Tracing
                </a-button>

                <div class="secondary-actions">
                  <a-button size="large" class="btn-clear" @click="clearRecords" :disabled="!config.deviceId">
                    <a-icon type="delete" /> Clear Records
                  </a-button>
                  <a-button size="large" class="btn-refresh" @click="fetchRecords(true)" :disabled="!config.deviceId" :loading="recordsLoading">
                    <a-icon type="reload" /> Pull Logs
                  </a-button>
                </div>
              </div>
            </a-form>
          </a-card>

          <!-- Metrics summary -->
          <a-card :bordered="false" class="premium-card metrics-card mt-4">
            <h2 class="section-title">Telemetry Summary</h2>
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-val">{{ metrics.captured }}</div>
                <div class="metric-lbl">Captured</div>
              </div>
              <div class="metric-item">
                <div class="metric-val">{{ metrics.avgLatency }} ms</div>
                <div class="metric-lbl">Avg Processing</div>
              </div>
              <div class="metric-item">
                <div class="metric-val">{{ metrics.avgQueue }} ms</div>
                <div class="metric-lbl">Avg Queue Wait</div>
              </div>
              <div class="metric-item">
                <div class="metric-val text-red">{{ metrics.dropped }}</div>
                <div class="metric-lbl">Dropped</div>
              </div>
            </div>
          </a-card>
        </div>

        <!-- Right Pane: Telemetry Journey Log -->
        <div class="telemetry-pane">
          <a-card :bordered="false" class="premium-card log-card">
            <div class="log-header">
              <h2 class="section-title">Execution Journey Timeline</h2>
              
              <div class="log-controls">
                <span class="live-label">
                  <a-badge :status="liveMode ? 'processing' : 'default'" /> Live Stream
                </span>
                <a-switch v-model="liveMode" size="small" @change="toggleLiveMode" :disabled="!config.deviceId" />
              </div>
            </div>

            <!-- Record Stream -->
            <div class="record-stream-container">
              <div v-if="recordsLoading && records.length === 0" class="spinner-overlay">
                <a-spin size="large" tip="Streaming distributed telemetry records..." />
              </div>

              <div v-else-if="records.length === 0" class="empty-journey">
                <div class="empty-artwork">
                  <a-icon type="deployment-unit" class="empty-art-icon" />
                </div>
                <h3 class="empty-title">Ready for Telemetry</h3>
                <p class="empty-desc">Enable tracing and dispatch JT808 packets from your device. Real-time path traversal telemetry will stream below automatically.</p>
              </div>

              <!-- Journey Timeline -->
              <div v-else class="timeline-journey">
                <div 
                  v-for="(rec, index) in records" 
                  :key="rec.seq + '-' + index"
                  :class="['journey-node', 'node-' + rec.outcome.toLowerCase()]"
                >
                  <div class="node-time-strip">
                    <div class="node-time">{{ formatTime(rec.ts_unix_ms) }}</div>
                    <div class="node-seq">#{{ rec.seq }}</div>
                  </div>

                  <div class="node-content-card">
                    <div class="node-card-header">
                      <!-- Component Scope Badge -->
                      <div class="header-left">
                        <span :class="['component-badge', 'badge-' + rec.task.toLowerCase()]">
                          {{ rec.task }}
                        </span>
                        <span class="phase-name">{{ rec.phase }}</span>
                      </div>

                      <div class="header-right">
                        <!-- Command ID / Message Type -->
                        <span v-if="rec.packet_cmd" class="cmd-code">{{ rec.packet_cmd }}</span>
                        <span v-if="rec.message_type" class="msg-type">{{ rec.message_type }}</span>
                        
                        <!-- Outcome status badge -->
                        <span :class="['outcome-badge', 'outcome-' + rec.outcome.toLowerCase()]">
                          <a-icon :type="rec.outcome === 'ok' ? 'check-circle' : 'close-circle'" />
                          {{ rec.outcome }}
                        </span>
                      </div>
                    </div>

                    <!-- Latency Chips Row -->
                    <div class="latency-chips" v-if="rec.elapsed_us || rec.elapsed_queue_us || rec.elapsed_exec_us">
                      <div v-if="rec.elapsed_us" class="latency-chip total-latency">
                        <span class="chip-label">Total Duration:</span>
                        <span class="chip-value">{{ formatUs(rec.elapsed_us) }}</span>
                      </div>
                      <div v-if="rec.elapsed_queue_us" class="latency-chip queue-latency">
                        <span class="chip-label">Queue Delay:</span>
                        <span class="chip-value">{{ formatUs(rec.elapsed_queue_us) }}</span>
                      </div>
                      <div v-if="rec.elapsed_exec_us" class="latency-chip db-latency">
                        <span class="chip-label">Storage execution:</span>
                        <span class="chip-value">{{ formatUs(rec.elapsed_exec_us) }}</span>
                      </div>
                    </div>

                    <!-- Details Accordion -->
                    <div v-if="rec.details || rec.trace_id" class="details-section">
                      <details class="details-collapsible">
                        <summary class="details-summary">
                          <span>Metadata & Trace Details</span>
                          <span class="trace-uuid">Trace ID: {{ rec.trace_id }}</span>
                        </summary>
                        <div class="details-body">
                          <pre class="json-code"><code>{{ formatDetails(rec.details) }}</code></pre>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storage from 'store'
import { ROLE } from '@/store/mutation-types'
import { 
  enableDeviceTracing, 
  disableDeviceTracing, 
  getDeviceTracingRecords, 
  clearDeviceTracingRecords 
} from '@/api/manage'

export default {
  name: 'DeviceTracing',
  data() {
    return {
      isSysadmin: false,
      isTracingActive: false,
      btnLoading: false,
      recordsLoading: false,
      liveMode: false,
      lastSeq: 0,
      activeTimer: null,
      liveTimer: null,
      expiryTimeMs: 0,
      expiryCountdown: '',

      config: {
        deviceId: '',
        ttlMinutes: 15,
        maxRecords: 1000,
        includePayload: false
      },

      metrics: {
        captured: 0,
        avgLatency: '0.00',
        avgQueue: '0.00',
        dropped: 0
      },

      records: []
    }
  },

  created() {
    const role = storage.get(ROLE)
    if (role === 'sysadmin') {
      this.isSysadmin = true
    }
    
    // Check if there is an active device trace session saved locally to resume states
    const savedState = localStorage.getItem('active_tracing_state')
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        const now = Date.now()
        if (state.expiryTimeMs > now) {
          this.config.deviceId = state.deviceId
          this.config.ttlMinutes = state.ttlMinutes
          this.config.maxRecords = state.maxRecords
          this.config.includePayload = state.includePayload
          this.expiryTimeMs = state.expiryTimeMs
          this.isTracingActive = true
          this.liveMode = true
          this.startCountdownTimer()
          this.startLiveStreaming()
          this.fetchRecords(true)
        } else {
          localStorage.removeItem('active_tracing_state')
        }
      } catch (e) {
        console.error('Failed to parse active tracing session state:', e)
      }
    }
  },

  beforeDestroy() {
    this.stopTimers()
  },

  methods: {
    goHome() {
      this.$router.push('/dashboard/dashboard')
    },

    stopTimers() {
      if (this.activeTimer) {
        clearInterval(this.activeTimer)
        this.activeTimer = null
      }
      if (this.liveTimer) {
        clearInterval(this.liveTimer)
        this.liveTimer = null
      }
    },

    startCountdownTimer() {
      if (this.activeTimer) clearInterval(this.activeTimer)

      this.activeTimer = setInterval(() => {
        const remaining = this.expiryTimeMs - Date.now()
        if (remaining <= 0) {
          this.expiryCountdown = ''
          this.isTracingActive = false
          this.liveMode = false
          this.stopTimers()
          this.$message.info('Device tracing session expired.')
          localStorage.removeItem('active_tracing_state')
        } else {
          const hours = Math.floor(remaining / 3600000).toString().padStart(2, '0')
          const minutes = Math.floor((remaining % 3600000) / 60000).toString().padStart(2, '0')
          const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0')
          this.expiryCountdown = `${hours}h ${minutes}m ${seconds}s`
        }
      }, 1000)
    },

    startLiveStreaming() {
      if (this.liveTimer) clearInterval(this.liveTimer)

      this.liveTimer = setInterval(() => {
        this.fetchRecords(false)
      }, 2000)
    },

    toggleLiveMode(checked) {
      if (checked) {
        this.startLiveStreaming()
      } else {
        if (this.liveTimer) {
          clearInterval(this.liveTimer)
          this.liveTimer = null
        }
      }
    },

    async startTrace() {
      if (!this.config.deviceId) return
      this.btnLoading = true
      
      const expiryMs = Date.now() + this.config.ttlMinutes * 60 * 1000
      
      const payload = {
        expiry_time_unix_ms: expiryMs,
        max_records: this.config.maxRecords,
        include_payload: this.config.includePayload
      }

      try {
        await enableDeviceTracing(this.config.deviceId, payload)
        this.expiryTimeMs = expiryMs
        this.isTracingActive = true
        this.liveMode = true
        this.records = []
        this.lastSeq = 0
        
        // Save current session to storage
        localStorage.setItem('active_tracing_state', JSON.stringify({
          deviceId: this.config.deviceId,
          ttlMinutes: this.config.ttlMinutes,
          maxRecords: this.config.maxRecords,
          includePayload: this.config.includePayload,
          expiryTimeMs: expiryMs
        }))

        this.startCountdownTimer()
        this.startLiveStreaming()
        this.$message.success('Device tracing engaged successfully')
        this.fetchRecords(true)
      } catch (err) {
        console.error('Failed to engage device tracing:', err)
        this.$message.error('Failed to start device tracing')
      } finally {
        this.btnLoading = false
      }
    },

    async stopTrace() {
      if (!this.config.deviceId) return
      this.btnLoading = true

      try {
        await disableDeviceTracing(this.config.deviceId)
        this.isTracingActive = false
        this.liveMode = false
        this.expiryCountdown = ''
        this.stopTimers()
        localStorage.removeItem('active_tracing_state')
        this.$message.success('Device tracing suspended')
      } catch (err) {
        console.error('Failed to stop device tracing:', err)
        this.$message.error('Failed to suspend device tracing')
      } finally {
        this.btnLoading = false
      }
    },

    async clearRecords() {
      if (!this.config.deviceId) return
      try {
        await clearDeviceTracingRecords(this.config.deviceId)
        this.records = []
        this.lastSeq = 0
        this.updateMetrics()
        this.$message.success('Records database cleared')
      } catch (err) {
        console.error('Failed to clear tracing records:', err)
        this.$message.error('Failed to clear records')
      }
    },

    async fetchRecords(showSpinner = false) {
      if (!this.config.deviceId) return
      if (showSpinner) this.recordsLoading = true

      try {
        // We retrieve records with a window limits
        const res = await getDeviceTracingRecords(this.config.deviceId, {
          since_seq: 0, // Load all captured bounded by UI scroll container
          limit: this.config.maxRecords
        })

        if (res && res.data) {
          // Sort chronologically (oldest first for cascading downward timeline)
          const sorted = [...res.data].sort((a, b) => a.ts_unix_ms - b.ts_unix_ms || a.seq - b.seq)
          this.records = sorted
          
          if (sorted.length > 0) {
            this.lastSeq = sorted[sorted.length - 1].seq
          }
          this.updateMetrics()
        }
      } catch (err) {
        console.error('Failed to pull telemetry logs:', err)
      } finally {
        if (showSpinner) this.recordsLoading = false
      }
    },

    updateMetrics() {
      const count = this.records.length
      this.metrics.captured = count
      this.metrics.dropped = Math.max(0, count - this.config.maxRecords)

      if (count === 0) {
        this.metrics.avgLatency = '0.00'
        this.metrics.avgQueue = '0.00'
        return
      }

      let totalLatency = 0
      let totalQueue = 0
      let latencyCount = 0
      let queueCount = 0

      this.records.forEach(r => {
        if (r.elapsed_us) {
          totalLatency += r.elapsed_us
          latencyCount++
        }
        if (r.elapsed_queue_us) {
          totalQueue += r.elapsed_queue_us
          queueCount++
        }
      })

      this.metrics.avgLatency = latencyCount > 0 ? (totalLatency / latencyCount / 1000).toFixed(2) : '0.00'
      this.metrics.avgQueue = queueCount > 0 ? (totalQueue / queueCount / 1000).toFixed(2) : '0.00'
    },

    formatTime(unixMs) {
      const date = new Date(unixMs)
      const hrs = date.getHours().toString().padStart(2, '0')
      const mins = date.getMinutes().toString().padStart(2, '0')
      const secs = date.getSeconds().toString().padStart(2, '0')
      const ms = (unixMs % 1000).toString().padStart(3, '0')
      return `${hrs}:${mins}:${secs}.${ms}`
    },

    formatUs(us) {
      if (us < 1000) {
        return `${us} μs`
      } else if (us < 1000000) {
        return `${(us / 1000).toFixed(2)} ms`
      } else {
        return `${(us / 1000000).toFixed(2)} s`
      }
    },

    formatDetails(details) {
      if (!details) return '{}'
      return JSON.stringify(details, null, 2)
    }
  }
}
</script>

<style scoped>
.device-tracing-container {
  padding: 0;
  min-height: calc(100vh - 120px);
  background: #0d1117;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Access Denied Card Styling */
.access-denied-card {
  margin: 40px auto;
  max-width: 600px;
  background: #161b22;
  border-radius: 12px;
  border: 1px solid #30363d;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  text-align: center;
}
.denied-content {
  padding: 40px 20px;
}
.denied-icon {
  font-size: 64px;
  color: #da3633;
  margin-bottom: 24px;
}
.denied-title {
  color: #f0f6fc;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
}
.denied-desc {
  color: #8b949e;
  font-size: 16px;
  margin-bottom: 32px;
}

/* Workspace Header Styling */
.workspace-header {
  padding: 24px 32px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.header-title {
  color: #f0f6fc;
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 4px 0;
  background: linear-gradient(90deg, #58a6ff, #1f6feb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.header-subtitle {
  color: #8b949e;
  font-size: 14px;
  margin: 0;
}

/* Status banner pulsing state */
.status-banner {
  display: flex;
  align-items: center;
  padding: 10px 18px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.banner-inactive {
  background: rgba(139, 148, 158, 0.1);
  border: 1px solid rgba(139, 148, 158, 0.2);
  color: #8b949e;
}
.banner-active {
  background: rgba(46, 160, 67, 0.15);
  border: 1px solid #3fb950;
  color: #3fb950;
}
.banner-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50px;
  margin-right: 10px;
}
.banner-inactive .banner-pulse {
  background: #8b949e;
}
.banner-active .banner-pulse {
  background: #3fb950;
  box-shadow: 0 0 8px #3fb950;
  animation: pulse-glow 1.5s infinite ease-in-out;
}
.banner-text {
  display: flex;
  flex-direction: column;
}
.banner-expiry {
  font-size: 11px;
  color: #8b949e;
  margin-top: 2px;
}
.countdown-clock {
  color: #f0f6fc;
  font-family: monospace;
  font-size: 12px;
}

/* Workspace Layout */
.workspace-layout {
  display: flex;
  padding: 32px;
  gap: 32px;
  flex-direction: row;
}

.control-pane {
  width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
.telemetry-pane {
  flex-grow: 1;
  min-width: 0;
}

/* Premium Card Styles */
.premium-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  position: relative;
  overflow: hidden;
}
.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #58a6ff, transparent);
}
.section-title {
  color: #f0f6fc;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #30363d;
}

/* Form element styling */
.premium-form >>> .ant-form-item-label > label {
  color: #8b949e !important;
  font-weight: 500;
  font-size: 13px;
}
.premium-input {
  background: #0d1117 !important;
  border: 1px solid #30363d !important;
  color: #c9d1d9 !important;
  border-radius: 6px !important;
}
.premium-input:focus {
  border-color: #58a6ff !important;
  box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.15) !important;
}
.premium-select >>> .ant-select-selection {
  background-color: #0d1117 !important;
  border: 1px solid #30363d !important;
  color: #c9d1d9 !important;
  border-radius: 6px !important;
}
.premium-input-number {
  background: #0d1117 !important;
  border: 1px solid #30363d !important;
  color: #c9d1d9 !important;
  border-radius: 6px !important;
  width: 100% !important;
}
.switch-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.switch-desc {
  color: #8b949e;
  font-size: 12px;
}

/* Button Zone */
.action-zone {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.btn-start {
  background: linear-gradient(135deg, #2ea043, #238636) !important;
  border: none !important;
  font-weight: 600 !important;
  border-radius: 6px !important;
  box-shadow: 0 4px 12px rgba(46, 160, 67, 0.2) !important;
}
.btn-start:hover {
  filter: brightness(1.1);
}
.btn-stop {
  background: linear-gradient(135deg, #da3633, #b62320) !important;
  border: none !important;
  font-weight: 600 !important;
  border-radius: 6px !important;
  box-shadow: 0 4px 12px rgba(218, 54, 51, 0.2) !important;
}
.btn-stop:hover {
  filter: brightness(1.1);
}
.secondary-actions {
  display: flex;
  gap: 12px;
}
.btn-clear {
  flex: 1;
  background: rgba(240, 246, 252, 0.05) !important;
  border: 1px solid #30363d !important;
  color: #c9d1d9 !important;
  border-radius: 6px !important;
}
.btn-clear:hover {
  background: rgba(240, 246, 252, 0.1) !important;
  border-color: #8b949e !important;
}
.btn-refresh {
  flex: 1;
  background: rgba(88, 166, 255, 0.1) !important;
  border: 1px solid rgba(88, 166, 255, 0.2) !important;
  color: #58a6ff !important;
  border-radius: 6px !important;
}
.btn-refresh:hover {
  background: rgba(88, 166, 255, 0.15) !important;
  border-color: #58a6ff !important;
}

/* Metrics Dashboard */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.metric-item {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}
.metric-val {
  color: #f0f6fc;
  font-size: 20px;
  font-weight: 700;
}
.metric-lbl {
  color: #8b949e;
  font-size: 11px;
  margin-top: 4px;
}
.text-red {
  color: #f85149 !important;
}
.mt-4 {
  margin-top: 16px;
}

/* Telemetry Log Window */
.log-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #30363d;
}
.log-header .section-title {
  margin: 0;
  padding: 0;
  border: none;
}
.log-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}
.live-label {
  font-size: 12px;
  color: #8b949e;
}

.record-stream-container {
  min-height: 400px;
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  position: relative;
  padding-right: 8px;
}
.record-stream-container::-webkit-scrollbar {
  width: 6px;
}
.record-stream-container::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 3px;
}

.spinner-overlay {
  padding: 80px 0;
  text-align: center;
}
.spinner-overlay >>> .ant-spin-text {
  color: #8b949e !important;
  margin-top: 16px;
  font-size: 14px;
}

/* Empty Art State */
.empty-journey {
  padding: 80px 20px;
  text-align: center;
}
.empty-artwork {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(88, 166, 255, 0.05);
  border: 1px solid rgba(88, 166, 255, 0.1);
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
}
.empty-art-icon {
  font-size: 36px;
  color: #58a6ff;
}
.empty-title {
  color: #f0f6fc;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}
.empty-desc {
  color: #8b949e;
  font-size: 14px;
  max-width: 460px;
  margin: 0 auto;
}

/* Timeline Nodes styling */
.timeline-journey {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-left: 20px;
  position: relative;
}
.timeline-journey::before {
  content: "";
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 6px;
  width: 2px;
  background: #30363d;
}

.journey-node {
  display: flex;
  position: relative;
}
.journey-node::before {
  content: "";
  position: absolute;
  left: -18px;
  top: 14px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #0d1117;
  z-index: 2;
}
.node-ok::before {
  border: 2.5px solid #3fb950;
  box-shadow: 0 0 6px rgba(63, 185, 80, 0.4);
}
.node-err::before {
  border: 2.5px solid #f85149;
  box-shadow: 0 0 6px rgba(248, 81, 73, 0.4);
}

.node-time-strip {
  width: 90px;
  flex-shrink: 0;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
}
.node-time {
  font-family: monospace;
  font-size: 11px;
  color: #8b949e;
}
.node-seq {
  font-size: 10px;
  color: #30363d;
  margin-top: 2px;
  font-weight: 600;
}

.node-content-card {
  flex-grow: 1;
  background: #0d1117;
  border: 1px solid #21262d;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
}
.journey-node:hover .node-content-card {
  border-color: #30363d;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.node-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.component-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}
.badge-broker {
  background: rgba(88, 166, 255, 0.15);
  color: #58a6ff;
}
.badge-db_proxy {
  background: rgba(187, 128, 255, 0.15);
  color: #bc8cff;
}
.badge-network_queue {
  background: rgba(255, 128, 191, 0.15);
  color: #ff8cbf;
}
.badge-batcher {
  background: rgba(242, 139, 13, 0.15);
  color: #f28b0d;
}

.phase-name {
  color: #f0f6fc;
  font-weight: 600;
  font-size: 14px;
}
.cmd-code {
  background: #21262d;
  border: 1px solid #30363d;
  color: #8b949e;
  padding: 1px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 11px;
}
.msg-type {
  font-size: 11px;
  color: #8b949e;
  background: rgba(48, 54, 61, 0.5);
  padding: 1px 6px;
  border-radius: 4px;
}

/* Outcome states */
.outcome-badge {
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: capitalize;
}
.outcome-ok {
  background: rgba(46, 160, 67, 0.1);
  color: #3fb950;
}
.outcome-err {
  background: rgba(248, 81, 73, 0.1);
  color: #f85149;
}

/* Latency metrics */
.latency-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(48, 54, 61, 0.5);
}
.latency-chip {
  display: flex;
  font-size: 11px;
  background: #161b22;
  border: 1px solid #21262d;
  border-radius: 4px;
  overflow: hidden;
}
.chip-label {
  padding: 2px 6px;
  color: #8b949e;
  background: #21262d;
}
.chip-value {
  padding: 2px 6px;
  font-weight: 600;
  color: #f0f6fc;
}

/* Expanding JSON detail pane */
.details-section {
  margin-top: 14px;
}
.details-collapsible {
  border: 1px solid #21262d;
  border-radius: 6px;
  background: #161b22;
  overflow: hidden;
}
.details-summary {
  padding: 8px 12px;
  color: #8b949e;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}
.details-summary:hover {
  background: rgba(48, 54, 61, 0.3);
  color: #c9d1d9;
}
.trace-uuid {
  font-family: monospace;
  font-size: 10px;
  color: #30363d;
}
.details-body {
  border-top: 1px solid #21262d;
  padding: 12px;
}
.json-code {
  margin: 0;
  padding: 0;
  background: none;
  border: none;
}
.json-code code {
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  font-size: 11px;
  color: #79c0ff;
  line-height: 1.5;
}

/* Media query for tablet screens */
@media (max-width: 992px) {
  .workspace-layout {
    flex-direction: column;
  }
  .control-pane {
    width: 100%;
  }
}

/* Animations */
@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 0 0 rgba(63, 185, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(63, 185, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(63, 185, 80, 0);
  }
}
</style>
