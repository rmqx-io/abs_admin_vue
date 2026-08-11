<template>
  <div class="org-select-container">
    <a-tooltip :title="fullPathLabel" placement="topLeft" :mouseEnterDelay="0.5">
      <a-input
        :placeholder="placeholder"
        :value="displayValue"
        read-only
        class="org-input"
        @click="handleOpenModal"
      >
        <div slot="suffix" class="org-input-suffix">
          <a-icon v-if="value" type="close-circle" class="clear-icon" @click.stop="handleClear" />
          <a-icon type="cluster" :style="{ color: value ? '#1890ff' : 'rgba(0,0,0,.25)' }" />
        </div>
      </a-input>
    </a-tooltip>

    <a-modal
      :title="placeholder"
      :visible="visible"
      :width="600"
      @ok="handleOk"
      @cancel="handleCancel"
      centered
      :bodyStyle="{ padding: '16px' }"
    >
      <div class="org-picker-content">
        <a-input-search
          v-model="searchText"
          placeholder="搜索机构名称"
          style="margin-bottom: 16px"
          @search="onSearch"
          allow-clear
        />

        <div class="tree-toolbar">
          <a-button type="link" size="small" icon="plus-square" @click="expandAll">展开全部</a-button>
          <a-button type="link" size="small" icon="minus-square" @click="collapseAll">折叠全部</a-button>
        </div>

        <div class="tree-wrapper" :style="{ maxHeight: '450px', overflowY: 'auto' }">
          <a-empty v-if="!treeData || treeData.length === 0" />
          <a-tree
            v-else
            :tree-data="treeData"
            :expanded-keys="expandedKeys"
            :auto-expand-parent="autoExpandParent"
            :selected-keys="selectedKeys"
            @expand="onExpand"
            @select="onSelect"
            :replace-fields="{ children: 'children', title: 'title', key: 'value' }"
          >
            <template slot="title" slot-scope="item">
              <span v-if="item.title.toLowerCase().indexOf(searchText.toLowerCase()) > -1" :style="item.selectable === false ? { color: 'rgba(0,0,0,0.25)', cursor: 'not-allowed' } : {}">
                {{ item.title.substring(0, item.title.toLowerCase().indexOf(searchText.toLowerCase())) }}
                <span style="color: #f50">{{ searchText }}</span>
                {{ item.title.substring(item.title.toLowerCase().indexOf(searchText.toLowerCase()) + searchText.length) }}
              </span>
              <span v-else :style="item.selectable === false ? { color: 'rgba(0,0,0,0.25)', cursor: 'not-allowed' } : {}">{{ item.title }}</span>
            </template>
          </a-tree>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: 'OrgSelect',
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    orgList: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: '选择机构'
    },
    selectableNodeCheck: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      visible: false,
      searchText: '',
      expandedKeys: [],
      autoExpandParent: true,
      selectedKeys: [],
      tempSelectedId: null,
      tempSelectedPath: '',
      flatData: []
    }
  },
  computed: {
    treeData() {
      const normalize = (nodes, depth = 0) => {
        return nodes.map(node => {
          const value = node.value !== undefined ? node.value : node.id
          const normalizedNode = {
            ...node,
            title: node.title || node.name || '',
            value: value
          }
          if (this.selectableNodeCheck) {
            normalizedNode.selectable = this.selectableNodeCheck(normalizedNode, depth)
          }
          normalizedNode.children = (node.children || node.childs) ? normalize(node.children || node.childs, depth + 1) : []
          return normalizedNode
        })
      }
      const data = normalize(this.orgList)

      // If no search, return full tree
      if (!this.searchText) return data

      // Filter tree based on search text
      const gData = JSON.parse(JSON.stringify(data))
      const filterTree = (nodes) => {
        return nodes.filter(node => {
          const match = node.title.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1
          if (node.children && node.children.length) {
            node.children = filterTree(node.children)
          }
          return match || (node.children && node.children.length > 0)
        })
      }
      const filtered = filterTree(gData)

      // Collect all keys present in the filtered tree so we can expand them all
      const collectKeys = (nodes, keys = []) => {
        nodes.forEach(node => {
          keys.push(node.value)
          if (node.children && node.children.length) collectKeys(node.children, keys)
        })
        return keys
      }
      this.$nextTick(() => {
        this.expandedKeys = collectKeys(filtered)
        this.autoExpandParent = true
      })

      return filtered
    },
    selectedNode() {
      return this.flatData.find(item => item.value === this.value) || {}
    },
    displayValue() {
      return this.selectedNode.title || ''
    },
    fullPathLabel() {
      return this.selectedNode.fullName || ''
    },
    allKeys() {
      const collect = (nodes, keys = []) => {
        nodes.forEach(node => {
          keys.push(node.value)
          if (node.children && node.children.length) collect(node.children, keys)
        })
        return keys
      }
      return collect(this.treeData)
    }
  },
  watch: {
    orgList: {
      immediate: true,
      handler(val) {
        this.generateFlatData(val)
        // Defaultly expand first level nodes
        if (val && val.length > 0 && this.expandedKeys.length === 0) {
          this.expandedKeys = val.map(node => node.value !== undefined ? node.value : node.id)
        }
      }
    },
    value: {
      immediate: true,
      handler(val) {
        if (val) {
          this.selectedKeys = [val]
          this.tempSelectedId = val
        } else {
          this.selectedKeys = []
          this.tempSelectedId = null
        }
      }
    }
  },
  methods: {
    generateFlatData(nodes, path = [], result = []) {
      if (!nodes) return
      nodes.forEach(node => {
        const title = node.title || node.name || ''
        const currentPath = [...path, title]
        const value = node.value !== undefined ? node.value : node.id
        result.push({
          value: value,
          title: title,
          fullName: currentPath.join(' / ')
        })
        const children = node.children || node.childs
        if (children) {
          this.generateFlatData(children, currentPath, result)
        }
      })
      this.flatData = result
    },
    handleOpenModal() {
      this.visible = true
      this.searchText = ''
      this.tempSelectedId = this.value
      if (this.value) {
        this.selectedKeys = [this.value]
      }
    },
    handleOk() {
      this.$emit('change', this.tempSelectedId)
      this.$emit('input', this.tempSelectedId)
      this.visible = false
    },
    handleCancel() {
      this.visible = false
    },
    handleClear() {
      this.$emit('change', null)
      this.$emit('input', null)
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    onSelect(selectedKeys, info) {
      this.selectedKeys = selectedKeys
      if (selectedKeys.length > 0) {
        this.tempSelectedId = selectedKeys[0]
      } else {
        this.tempSelectedId = null
      }
    },
    onSearch(val) {
      // Expansion is handled reactively by the searchText watcher via treeData.
      // Reset when cleared.
      if (!val) {
        this.expandedKeys = this.orgList.map(node => node.value !== undefined ? node.value : node.id)
        this.autoExpandParent = false
      }
    },
    expandAll() {
      this.expandedKeys = [...this.allKeys]
      this.autoExpandParent = false
    },
    collapseAll() {
      this.expandedKeys = []
      this.autoExpandParent = false
    }
  }
}
</script>

<style scoped>
.org-input {
  cursor: pointer;
}
.org-input /deep/ input {
  cursor: pointer;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding-right: 52px !important;
}
.org-input-suffix {
  display: flex;
  align-items: center;
  gap: 8px;
}
.clear-icon {
  color: rgba(0,0,0,.25);
  transition: color 0.3s;
  font-size: 12px;
  cursor: pointer;
}
.clear-icon:hover {
  color: rgba(0,0,0,.45);
}
.tree-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-bottom: 6px;
}
.tree-wrapper {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 8px;
}
</style>
