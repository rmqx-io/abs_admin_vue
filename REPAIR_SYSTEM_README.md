# 报修消息管理系统

## 项目概述

本项目实现了一个完整的报修消息管理系统，包含报修信息的展示、处理状态跟踪、文件附件管理等功能。

## 功能特性

### 1. 报修消息列表 (`RepairMessageList.vue`)
- **基本信息展示**：报修单号、设备信息、故障描述、紧急程度
- **状态管理**：待处理、处理中、已完成、已拒绝四种状态
- **搜索筛选**：支持按设备名称、故障类型、处理状态等条件筛选
- **批量操作**：支持批量分配、批量导出等操作
- **统计看板**：实时显示各状态报修数量统计
- **响应式设计**：适配移动端和桌面端显示

### 2. 报修详情弹窗 (`RepairDetailModal.vue`)
- **基本信息**：完整的报修信息展示
- **设备信息**：设备详细参数和位置信息
- **报修人信息**：联系方式和部门信息
- **处理状态**：当前处理进度和状态
- **附件管理**：支持图片、文档等多种格式附件预览和下载
- **处理历史**：完整的处理时间线和操作记录
- **操作按钮**：接受处理、完成处理、拒绝处理等快捷操作

### 3. 报修处理弹窗 (`RepairProcessModal.vue`)
- **接受处理**：设置预计时长、分配人员、制定处理计划
- **完成处理**：记录实际时长、故障原因、解决方案、更换配件、维修费用
- **拒绝处理**：选择拒绝原因、详细说明、建议方案
- **附件上传**：支持处理过程中的相关文件上传
- **通知设置**：短信、邮件、APP推送等多种通知方式

### 4. 分配用户弹窗 (`AssignUserModal.vue`)
- **人员选择**：显示可用维修人员及其当前工作状态
- **人员详情**：专业技能、工作经验、好评率等信息
- **优先级调整**：可调整报修的紧急程度
- **分配说明**：添加特殊要求或说明
- **通知方式**：选择通知处理人员的方式

### 5. 附件查看器 (`AttachmentViewerModal.vue`)
- **多格式支持**：图片、PDF、视频、音频、文本等格式预览
- **导航功能**：支持多个附件间的切换浏览
- **缩略图**：提供缩略图快速导航
- **下载功能**：支持单个文件下载
- **响应式**：适配不同屏幕尺寸

## 技术栈

- **前端框架**：Vue.js 2.x
- **UI 组件库**：Ant Design Vue
- **日期处理**：moment.js / dayjs
- **图标库**：Ant Design Icons
- **样式预处理**：Less/SCSS

## 文件结构

```
src/views/repair/
├── RepairMessageList.vue              # 主页面 - 报修消息列表
└── components/
    ├── RepairDetailModal.vue          # 报修详情弹窗
    ├── RepairProcessModal.vue         # 报修处理弹窗
    ├── AssignUserModal.vue           # 分配用户弹窗
    └── AttachmentViewerModal.vue     # 附件查看器弹窗
```

## 路由配置

已在 `src/config/router.config.js` 中添加路由：

```javascript
{
  path: '/list/repair-messages',
  name: 'RepairMessageList',
  component: () => import('@/views/repair/RepairMessageList'),
  meta: { title: '报修消息', keepAlive: true, permission: ['table'] }
}
```

## 数据结构

### 报修消息对象
```javascript
{
  id: Number,                    // 报修ID
  device_id: String,            // 设备ID
  device_name: String,          // 设备名称
  device_type: String,          // 设备类型
  device_location: String,      // 设备位置
  fault_type: String,           // 故障类型
  description: String,          // 故障描述
  priority: String,             // 紧急程度 (low/medium/high/urgent)
  status: String,               // 处理状态 (pending/processing/completed/rejected)
  reporter_name: String,        // 报修人姓名  
  reporter_phone: String,       // 报修人电话
  reporter_department: String,  // 报修人部门
  created_at: String,          // 报修时间
  processed_at: String,        // 处理时间
  completed_at: String,        // 完成时间
  assigned_to: String,         // 分配给
  attachments: Array,          // 附件列表
  processing_history: Array    // 处理历史
}
```

## 核心功能实现

### 1. 状态管理
- 使用颜色编码区分不同状态
- 状态变更时自动更新相关时间戳
- 状态流转：待处理 → 处理中 → 已完成/已拒绝

### 2. 搜索筛选
- 实时搜索功能，支持设备名称、故障描述等
- 多条件筛选：状态、优先级、故障类型、时间范围
- 高级筛选选项支持复杂查询条件

### 3. 分页处理
- 支持前端分页和后端分页
- 可配置每页显示数量
- 分页信息持久化

### 4. 附件管理
- 支持多种文件格式上传和预览
- 文件大小和格式验证
- 安全的文件下载功能

### 5. 响应式设计
- 移动端适配
- 表格列自适应
- 弹窗尺寸响应式调整

## 使用说明

1. **访问系统**：启动项目后访问 `/list/repair-messages` 路由
2. **查看报修**：在列表中点击"详情"按钮查看完整信息
3. **处理报修**：点击"处理"按钮进行接受、完成或拒绝操作
4. **分配人员**：点击"分配"按钮指定处理人员
5. **查看附件**：点击附件图标预览或下载相关文件

## 开发运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run serve

# 访问地址
http://localhost:8001/
```

## 特色亮点

1. **完整的工作流程**：从报修提交到处理完成的全流程管理
2. **丰富的交互体验**：多种弹窗、表单验证、实时反馈
3. **专业的UI设计**：统一的视觉风格和用户体验
4. **灵活的扩展性**：组件化设计，易于功能扩展和维护
5. **实用的功能特性**：批量操作、导出功能、通知系统等

此系统为企业级应用提供了完整的报修消息管理解决方案，具备良好的用户体验和维护性。