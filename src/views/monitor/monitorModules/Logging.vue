<template>
  <div>
    <!-- 组件日志记录：Logging -->
    <el-card>
      <div style="display: flex; justify-content: space-between;">
        <div>日期选择：
          <el-date-picker v-model="selectData" type="date" placeholder="选择日期">
          </el-date-picker>
        </div>
        <div style="display: flex;">
          <a-input v-model="deviceNo" disabled></a-input>
          <a-button type="primary" icon="search" style="margin-left: 10px;">查询</a-button>
        </div>
      </div>
      <div style="margin: 10px 0;">
        <a-tag color="orange">
          7E0102有1条
        </a-tag>
        <a-tag color="green">
          7E0900有195条
        </a-tag>
        <a-tag color="blue">
          7E0200有18条
        </a-tag>
        <a-tag color="#F4F4F5" style="color: #828282;">
          总大小：12.7kb
        </a-tag>
      </div>
      <template>
        <a-table :columns="columns" :data-source="data" :scroll="{ y: 340 }" bordered="true"
          :pagination="{showSizeChanger: true, pageSizeOptions:['300','500','1000','2000','5000'] ,defaultPageSize:'300'}">
          <span slot="rawData" slot-scope="rawData">
            <a-tag v-for="raw in rawData" :key="raw"
              :color="raw === 'loser' ? 'volcano' : raw.length < 5 ? 'geekblue' : 'green'">
              {{ raw.toUpperCase() }}
            </a-tag>
          </span>
          <span slot="action" slot-scope="text, record">
            <a>Invite 一 {{ record.name }}</a>
            <a-divider type="vertical" />
            <a>Delete</a>
            <a-divider type="vertical" />
            <a class="ant-dropdown-link"> More actions <a-icon type="down" /> </a>
          </span>
        </a-table>
      </template>
    </el-card>
  </div>
</template>

<script>
  const columns = [{
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 130
    },
    {
      title: '原始数据',
      dataIndex: 'rawData',
      key: 'rawData',
      scopedSlots: {
        customRender: 'rawData'
      },
      width: 100
    },
    {
      title: '原始数据',
      dataIndex: 'Hexadecimal',
      key: 'Hexadecimal',
    }
  ];

  const data = [];
  for (let i = 0; i < 1000; i++) {
    data.push({
      key: i,
      time: '2024-05-13 11:18:43',
      rawData: ['7E-02-00', '87字节'],
      Hexadecimal: '7E-02-00-00-48-05-82-33-80-12-01-04-68-00-00-00-00-00-0C-10-00-01-D4-CF-F3-06-32-EF-67-00-00-00-00-00-58-24-05-13-11-18-42-01-04-00-00-89-86-02-02-00-00-03-02-00-00-25-04-00-00-00-00-2A-02-00-00-2B-04-00-00-00-00-30-01-10-31-01-00-E3-06-00-00-1A-53-00-00-F9-7E',
    })
  }


  export default {
    props: {
      deviceNo: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        selectData: '',
        data,
        columns
      }
    }
  }
</script>

<style>
</style>