<template>
  <div>
    <el-card>
      <div style="display: flex; justify-content: space-between;">
        <div class="block" style="margin-bottom: 10px;">
          <el-date-picker v-model="selectData" type="datetimerange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </div>
        <div style="display: flex;">
          <a-button style="margin-right: 10px;">下载</a-button>
          <a-input v-model="deviceNo" disabled></a-input>
          <a-button type="primary" icon="search" style="margin-left: 10px;">查询</a-button>
        </div>
      </div>
      <template>
        <a-table :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }" :columns="columns"
          :scroll="{ y:340}" :data-source="data" bordered="true"
          :pagination="{showSizeChanger: true, pageSizeOptions:['50','100','500','1000','5000'] ,defaultPageSize:'50'}" />
      </template>
    </el-card>
  </div>
</template>

<script>
  const columns = [{
      title: '设备编号',
      dataIndex: 'deviceNo',
    },
    {
      title: '组织',
      dataIndex: 'Organization',
    }, {
      title: '报警内容',
      dataIndex: 'alarmContent',
    }, {
      title: '报警时间',
      dataIndex: 'alarmTime',
    }, {
      title: '信号时间',
      dataIndex: 'signalTime',
    },
  ];

  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      key: i,
      deviceNo: `502031450${i}`,
      Organization: '鲟梦动力',
      alarmContent: '容量过低报警',
      alarmTime: '2024-05-13 14:36:23',
      signalTime: '2024-05-13 14:36:31'
    });
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
        //选择的日期
        selectData: '',
        data,
        columns,
        //被选中的行
        selectedRowKeys: [], // Check here to configure the default column
        loading: false,
      }
    },
    methods: {
      onSelectChange(selectedRowKeys) {
        // console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.selectedRowKeys = selectedRowKeys;
      },
    }
  }
</script>

<style>
</style>