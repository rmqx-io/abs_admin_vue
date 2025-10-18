<template>
  <a-modal
    title="列设置"
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    width="500px"
    :destroyOnClose="true"
  >
    <div class="column-settings">
      <div class="settings-header">
        <a-checkbox
          :indeterminate="indeterminate"
          :checked="checkAll"
          @change="onCheckAllChange"
        >
          全选
        </a-checkbox>
        <a-button type="link" @click="handleReset">
          重置默认
        </a-button>
      </div>
      
      <a-divider />
      
      <div class="column-list">
        <a-checkbox-group
          v-model="checkedColumns"
          @change="onCheckChange"
        >
          <div
            v-for="column in allColumns"
            :key="column.key"
            class="column-item"
          >
            <a-checkbox
              :value="column.key"
              :disabled="column.fixed === 'left'"
            >
              {{ column.title }}
            </a-checkbox>
            <span v-if="column.fixed === 'left'" class="fixed-tag">
              固定
            </span>
          </div>
        </a-checkbox-group>
      </div>
      
      <div class="settings-hint">
        <a-icon type="info-circle" />
        提示：固定列无法取消显示
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'ColumnSettingsModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Array,
      default: () => []
    },
    selectedColumns: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      checkedColumns: []
    }
  },
  computed: {
    allColumns() {
      return this.columns.filter(col => col.key !== 'action')
    },
    
    indeterminate() {
      const selectableColumns = this.allColumns.filter(col => col.fixed !== 'left')
      const checkedSelectableColumns = this.checkedColumns.filter(key => {
        const column = this.allColumns.find(col => col.key === key)
        return column && column.fixed !== 'left'
      })
      
      return checkedSelectableColumns.length > 0 && checkedSelectableColumns.length < selectableColumns.length
    },
    
    checkAll() {
      const selectableColumns = this.allColumns.filter(col => col.fixed !== 'left')
      const checkedSelectableColumns = this.checkedColumns.filter(key => {
        const column = this.allColumns.find(col => col.key === key)
        return column && column.fixed !== 'left'
      })
      
      return selectableColumns.length > 0 && checkedSelectableColumns.length === selectableColumns.length
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.checkedColumns = [...this.selectedColumns]
      }
    }
  },
  methods: {
    onCheckAllChange(e) {
      const checked = e.target.checked
      const selectableColumns = this.allColumns.filter(col => col.fixed !== 'left')
      const fixedColumns = this.allColumns.filter(col => col.fixed === 'left')
      
      if (checked) {
        this.checkedColumns = [
          ...fixedColumns.map(col => col.key),
          ...selectableColumns.map(col => col.key)
        ]
      } else {
        this.checkedColumns = fixedColumns.map(col => col.key)
      }
    },
    
    onCheckChange(checkedList) {
      this.checkedColumns = checkedList
    },
    
    handleReset() {
      this.checkedColumns = this.allColumns.map(col => col.key)
    },
    
    handleOk() {
      // 确保操作列始终包含在内
      const finalColumns = [...this.checkedColumns]
      if (!finalColumns.includes('action')) {
        finalColumns.push('action')
      }
      
      this.$emit('save', finalColumns)
    },
    
    handleCancel() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.column-settings {
  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .column-list {
    max-height: 300px;
    overflow-y: auto;
    
    .column-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .fixed-tag {
        font-size: 12px;
        color: #1890ff;
        background: #e6f7ff;
        padding: 2px 6px;
        border-radius: 2px;
      }
    }
  }
  
  .settings-hint {
    margin-top: 16px;
    padding: 8px 12px;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 4px;
    font-size: 12px;
    color: #52c41a;
    
    .anticon {
      margin-right: 6px;
    }
  }
}
</style>