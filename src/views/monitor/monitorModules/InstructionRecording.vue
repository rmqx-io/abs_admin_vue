<template>
  <div>
    <el-card>
      <div class="block" style="margin-bottom: 10px;">
        <el-date-picker v-model="selectData" type="datetimerange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
      </div>
      <template>
        <a-table :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }" :columns="columns"
          :scroll="{ x: 'max-content' ,y:340}" :data-source="data" bordered="true"
          :pagination="{showSizeChanger: true, pageSizeOptions:['50','100','500','1000','5000'] ,defaultPageSize:'50'}" />
      </template>
    </el-card>
  </div>
</template>

<script>
  const columns = [{
      title: '设备编号',
      dataIndex: 'deviceNo',
      width: 120,
      fixed: 'left'
    },
    {
      title: '指令类型',
      dataIndex: 'instructionType',
      width: 240
    },
    {
      title: '响应',
      dataIndex: 'response',
      width: 80
    }, {
      title: '发送状态',
      dataIndex: 'sendingStatus',
      width: 100
    }, {
      title: '所在组织',
      dataIndex: 'Organization',
      width: 100
    }, {
      title: '发送时间',
      dataIndex: 'sendingTime',
      width: 150
    }, {
      title: '发送者',
      dataIndex: 'sender',
      width: 80
    }, {
      title: '响应时间',
      dataIndex: 'responseTime',
      width: 150
    }, {
      title: '发送内容',
      dataIndex: 'sendContent',
      width: 1000
    },
  ];

  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      key: i,
      deviceNo: `502031450${i}`,
      // deviceNo: deviceNo,
      instructionType: '读[0x28][单体电压过高]报警参数',
      response: 0,
      sendingStatus: '已响应',
      Organization: '鲟梦动力',
      sendingTime: '2024-05-13 14:06:06',
      sender: 'zrb',
      responseTime: '2024-05-13 14:06:11',
      sendContent: '7E-89-00-00-0E-05-82-33-80-12-01-61-58-EC-00-00-00-0E-00-07-3A-7D-02-01-01-28-00-E2-F2-7E'
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
    computed: {

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