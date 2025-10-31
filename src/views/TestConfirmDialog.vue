<template>
  <div class="test-confirm-dialog">
    <h1>Confirm Dialog Test Page</h1>

    <div class="test-controls">
      <el-button type="primary" @click="showBasicConfirm">Basic Confirmation</el-button>
      <el-button type="warning" @click="showWarningConfirm">Warning Confirmation</el-button>
      <el-button type="danger" @click="showDangerConfirm">Danger Confirmation</el-button>
      <el-button type="info" @click="showCustomConfirm">Custom Confirmation</el-button>
      <el-button type="success" @click="showResumeExportConfirm">Resume Export Confirmation</el-button>
      <el-button type="primary" @click="showAsyncConfirm">Async Confirmation</el-button>
    </div>

    <div class="result-panel" v-if="lastResult !== null">
      <h3>Last Result:</h3>
      <pre>{{ lastResult }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestConfirmDialog',
  data() {
    return {
      lastResult: null
    }
  },
  methods: {
    showBasicConfirm() {
      this.$confirm('Are you sure you want to proceed?', 'Confirmation', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'info'
      }).then(() => {
        this.lastResult = 'User confirmed the basic dialog'
      }).catch(() => {
        this.lastResult = 'User cancelled the basic dialog'
      })
    },

    showWarningConfirm() {
      this.$confirm('This action may have consequences. Continue?', 'Warning', {
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.lastResult = 'User confirmed the warning dialog'
      }).catch(() => {
        this.lastResult = 'User cancelled the warning dialog'
      })
    },

    showDangerConfirm() {
      this.$confirm('This action cannot be undone! Are you sure?', 'Danger', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'error'
      }).then(() => {
        this.lastResult = 'User confirmed the danger dialog'
      }).catch(() => {
        this.lastResult = 'User cancelled the danger dialog'
      })
    },

    showCustomConfirm() {
      this.$confirm('Would you like to save your changes before continuing?', 'Custom Confirmation', {
        confirmButtonText: 'Save',
        cancelButtonText: 'Don\'t Save',
        distinguishCancelAndClose: true,
        showClose: true,
        type: 'info',
        center: true
      }).then(() => {
        this.lastResult = 'User clicked Save'
      }).catch((action) => {
        if (action === 'cancel') {
          this.lastResult = 'User clicked Don\'t Save'
        } else {
          this.lastResult = 'User closed the dialog'
        }
      })
    },

    showResumeExportConfirm() {
      const exportedCount = 150;
      const totalCount = 500;

      this.$confirm(
        `发现未完成的导出任务 (已导出 ${exportedCount}/${totalCount} 条记录)，是否继续上次的导出?`,
        '继续导出',
        {
          confirmButtonText: '继续导出',
          cancelButtonText: '重新导出',
          type: 'info'
        }
      ).then(() => {
        this.lastResult = 'User chose to resume the export'
      }).catch(() => {
        this.lastResult = 'User chose to restart the export'
      })
    },

    async showAsyncConfirm() {
      try {
        // The proper way to wait for confirmation dialog results is to use await
        const confirmed = await this.$confirm(
          'This is an async confirmation dialog. The code will wait for your response.',
          'Async Confirmation',
          {
            confirmButtonText: 'Proceed',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }
        ).then(() => true).catch(() => false);

        // This code will only execute after the user has responded to the dialog
        if (confirmed) {
          this.lastResult = 'User confirmed the async dialog - code continued execution after confirmation';
        } else {
          this.lastResult = 'User cancelled the async dialog - code continued execution after cancellation';
        }

        // You can perform additional async operations here
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.lastResult += '\nAdditional async operations completed';
      } catch (error) {
        this.lastResult = `Error in async confirmation: ${error.message}`;
      }
    }
  }
}
</script>

<style scoped>
.test-confirm-dialog {
  padding: 20px;
}

.test-controls {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.result-panel {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

pre {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
