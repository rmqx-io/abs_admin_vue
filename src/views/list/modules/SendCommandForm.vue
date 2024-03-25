<template>
  <a-modal
    title="下发指令"
    width="90vw"
    centered
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { handleOk() }"
    @cancel="() => { handleCancel(); $emit('cancel') }"
  >
    <select-device-ids
      :deviceIds="deviceIds"
      :showAdd=false
    />
    <a-table
      :dataSource="sendCommandList"
      :columns="columns"
      rowKey="name"
      :customRow="customRow"
    />
    <a-form-item
      v-if="currentRow"
      :label="currentRow.name_cn"
    >
      <!-- create a a-input for each currentRow.params -->
      <!-- loop with index -->
        <p v-if="showHexEdit">字符串辅助填写</p>
        <a-input
            v-if="showHexEdit"
            v-model='help_param'
            placeholder="16进制字符串自动拆分填充"
            @change="helpInputParams"
        ></a-input>
        <a-form-item
            v-if="currentRow.params"
            v-for="(p, i) in currentRow.params"
            :key="p.name"
            :label="p.name"
        >
            <!-- v-if params_errors[i].length > 0 -->
            <p v-if="params_errors[i]" class="error">
                {{ params_errors[i] }}
            </p>
            <a-row :gutter="48">
                <a-col :md="12" :sm="24">
                    <a-input
                        v-model='decimal_params[i]'
                        placeholder="输入参数"
                        @change="handleDecimalParamChange(i)"
                    ></a-input>
                </a-col>
                <a-col :md="4" :sm="12">
                    <span>{{ p.unit }}</span>
                </a-col>
                <a-col v-if="p.options" :md="12" :sm="24">
                    <span v-for="(option, index) in p.options" :key="index">
                        {{ option.value }}: {{ option.label }}
                    </span>
                </a-col>
            </a-row>
            <p v-if="showHexEdit">16进制格式：00 00 （低字节 高字节)</p>
            <a-input
                v-if="showHexEdit"
                v-model='params[i]'
                placeholder="00 00"
                @change="handleParamChange(i)"
            ></a-input>
        </a-form-item>
      <p v-if="currentRow.params">根据上面的参数拼接的结果：</p>
      <a-input
        v-model='param'
        placeholder="输入参数"
      ></a-input>
    </a-form-item>
    <a-form-item>
      <a-checkbox
        v-model:checked="enableOfflineMessage"
        @change="handleSaveOfflineMessageChange"
      >离线设备自动重发</a-checkbox>
        <a-checkbox
            v-model="showHexEdit"
        >16进制编辑</a-checkbox>
    </a-form-item>
    <a-form-item v-if="enableOfflineMessage">
      <a-date-picker
        v-model="offlineMessageTtl"
        :showTime="true"
        :format="'YYYY-MM-DD HH:mm:ss'"
        placeholder="选择离线重发有限截止时间"
        />
        <p v-if="offlineMessageTtl !== null">有效期 {{ getTimeGap(offlineMessageTtl) }}。</p>
    </a-form-item>
    <div v-if='formErrorMessage' class='error'>{{ this.formErrorMessage}}</div>
  </a-modal>
</template>

<script>
import { batchSendCommand, getSendCommandList, sendCommand } from '@/api/manage'
import moment from 'moment'
import res from '@/views/setting/Res'
import SelectDeviceIds from '@/views/list/modules/SelectDeviceIds'

export default {
    props: {
        visible: {
            type: Boolean,
            required: true
        },
        loading: {
            type: Boolean,
            default: () => false
        },
        model: {
            type: Object,
            default: () => null
        },
        deviceIds: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            enableDeviceIdRange: false,
            sendCommandList: [],
            enableOfflineMessage: false,
            offlineMessageTtl: null,
            columns: [
                {
                    title: "指令名称",
                    dataIndex: "name_cn",
                    key: "name_cn"
                },
                {
                    title: "描述",
                    dataIndex: "description_cn",
                    key: "description_cn"
                },
                {
                    title: "指令",
                    dataIndex: "command",
                    key: "command"
                },
                {
                    title: "子指令",
                    dataIndex: "sub_command",
                    key: "sub_command"
                }
            ],
            columnsDeviceIds: [
                {
                    title: "设备ID",
                    dataIndex: "deviceId",
                    key: "deviceId"
                },
                {
                    title: "操作",
                    dataIndex: "action",
                    scopedSlots: { customRender: "action" },
                    fixed: "right"
                }
            ],
            currentRow: null,
            param: null,
            decimal_params: [],
            params: [],
            params_errors: [],
            params_check_timer: [],
            decimal_params_check_timer: [],
            help_param: '',
            showHexEdit: false,
            showAddDevice: false,
            activeTab: "singleDeviceId",
            deviceIdNew: null,
            deviceIdRangeBegin: null,
            deviceIdRangeEnd: null,
            deviceIdSet: null,
            reload: true,
            formErrorMessage: null,
            newDeviceIds: null
        };
    },
    created() {
        this.getSendCommandList();
    },
    methods: {
        getSendCommandList() {
            this.sendCommandList = []
/*
1、单体欠压
7E-89-00-00-0E-05-22-30-10-01-11-24-98-EC-00-00-00-0E-00-07-
3A-7D-02-01-01-
29-
00-
E3-47-7E
2、单体过压
7E-89-00-00-1C-05-22-30-10-01-11-24-97-EC-00-00-00-1C-00-15-
3A-7D-02-01-00-
28-
0E-42-0E-AC-0D-AC-0D-E8-03-0A-00-0A-00-01-00-
B1-A0-7E
3、放电过流
7E-89-00-00-1C-05-22-30-10-01-11-24-D1-EC-00-00-00-1C-00-15-
3A-7D-02-01-00-
2C-
0E-90-01-FB-FF-5E-01-B8-0B-E8-03-D0-07-00-00-
62-D2-7E
4、充电过流
7E-89-00-00-1C-05-22-30-10-01-11-24-D2-EC-00-00-00-1C-00-15-3A-7D-02-01-00-2D-0E-2C-01-FB-FF-18-01-D0-07-D0-07-D0-07-00-00-B9-A9-7E
5、充电低温
6、充电高温
7E-89-00-00-1C-05-22-30-10-01-11-24-E7-EC-00-00-00-1C-00-15-3A-7D-02-01-00-2F-0E-D1-0C-6D-0C-6D-0C-E8-03-E8-03-E8-03-00-00-86-70-7E
7、放电低温
7E-89-00-00-1C-05-22-30-10-01-11-24-E8-EC-00-00-00-1C-00-15-3A-7D-02-01-00-30-0E-E3-09-15-0A-47-0A-E8-03-E8-03-E8-03-00-00-14-97-7E
8、放电高温
7E-89-00-00-1C-05-22-30-10-01-11-24-E6-EC-00-00-00-1C-00-15-3A-7D-02-01-00-2E-0E-35-0D-D1-0C-D1-0C-E8-03-E8-03-E8-03-00-00-B2-A1-7E
*/
/*
单体电压过低保护 低字节
1mV/bit 偏移量： 0
单体电压过低保护 高字节
单体电压过低保护恢复 低字节
1mV/bit 偏移量： 0
单体电压过低保护恢复 高字节
单体电压过低报警 低字节
1mV/bit 偏移量： 0
单体电压过低报警 高字节
单体电压过低保护延时 低字节
100ms/bit
单体电压过低保护延时 高字节
单体电压过低保护恢复延时 低字节
100ms/bit
单体电压过低保护恢复延时 高字节
单体电压过低报警延时 低字节
100ms/bit
单体电压过低报警延时 高字节
单体电压欠压保护使能标志低字节 0： 屏蔽保护 1： 使能
单体电压欠压保护使能标志高字节
*/
            this.sendCommandList.push({
                name_cn: "BMS LS 单体欠压",
                name: "BMS LS single cell under voltage",
                command: "0x8900",
                sub_command: "0x29",
                description: "BMS LS single cell under voltage",
                description_cn: "BMS LS 单体欠压",
                params: [
                    {
                        name: "单体电压过低保护",
                        type: "uint16",
                        description: "单体电压过低保护",
                        unit: "mV",
                    },
                    {
                        name: "单体电压过低保护恢复",
                        type: "uint16",
                        description: "单体电压过低保护恢复",
                        unit: "mV"
                    },
                    {
                        name: "单体电压过低报警",
                        type: "uint16",
                        description: "单体电压过低报警",
                        unit: "mV"
                    },
                    {
                        name: "单体电压过低保护延时",
                        type: "uint16",
                        description: "单体电压过低保护延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "单体电压过低保护恢复延时",
                        type: "uint16",
                        description: "单体电压过低保护恢复延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "单体电压过低报警延时",
                        type: "uint16",
                        description: "单体电压过低报警延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "单体电压欠压保护使能标志",
                        type: "uint16",
                        description: "单体电压欠压保护使能标志",
                        options: [
                            {
                                value: 0,
                                label: "屏蔽保护"
                            },
                            {
                                value: 1,
                                label: "使能"
                            }
                        ]
                    }
                ]
            });
            /*
单体电压过高保护 低字节
1mV/bit 偏移量： 0
单体电压过高保护 高字节
单体电压过高保护恢复 低字节
1mV/bit 偏移量： 0
单体电压过高保护恢复 高字节
单体电压过高报警 低字节
1mV/bit 偏移量： 0
单体电压过高报警 高字节
单体电压过高保护延时 低字节
100ms/bit
单体电压过高保护延时 高字节
单体电压过高保护恢复延时 低字节
100ms/bit
单体电压过高保护恢复延时 高字节
单体电压过高报警延时 低字节
100ms/bit
单体电压过高报警延时 高字节
单体电压过压保护使能标志低字节
0： 屏蔽保护 1： 使能
单体电压过压保护使能标志高字节
            */
            this.sendCommandList.push({
                name_cn: "BMS LS 单体过压",
                name: "BMS LS single cell over voltage",
                command: "0x8900",
                sub_command: "0x28",
                description: "BMS LS single cell over voltage",
                description_cn: "BMS LS 单体过压",
                params: [
                    {
                        name: "单体电压过高保护",
                        type: "uint16",
                        description: "单体电压过高保护",
                        unit: "mV",
                    },
                    {
                        name: "单体电压过高保护恢复",
                        type: "uint16",
                        description: "单体电压过高保护恢复",
                        unit: "mV"
                    },
                    {
                        name: "单体电压过高报警",
                        type: "uint16",
                        description: "单体电压过高报警",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "单体电压过高保护延时",
                        type: "uint16",
                        description: "单体电压过高保护延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "单体电压过高保护恢复延时",
                        type: "uint16",
                        description: "单体电压过高保护恢复延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "单体电压过高报警延时",
                        type: "uint16",
                        description: "单体电压过高报警延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "单体电压过压保护使能标志",
                        type: "uint16",
                        description: "单体电压过压保护使能标志",
                        options: [
                            {
                                value: 0,
                                label: "屏蔽保护"
                            },
                            {
                                value: 1,
                                label: "使能"
                            }
                        ]
                    }
                ]
            });
            /*
            放电电流过高保护 低字节 0.1A/bit 偏移量： 0
放电电流过高保护 高字节
放电电流过高保护恢复 低字节 0.1A/bit 偏移量： 0
放电电流过高保护恢复 高字节
放电电流过高报警 低字节 0.1A/bit 偏移量： 0
放电电流过高报警 高字节
放电电流过高保护延时 低字节 100ms/bit
放电电流过高保护延时 高字节
放电电流过高保护恢复延时 低字节 100ms/bit
放电电流过高保护恢复延时 高字节
放电电流过高报警延时 低字节
100ms/bit
放电电流过高报警延时 高字节
放电电流过高保护使能标志低字节
0： 屏蔽保护 1： 使能 放电电流过高保护使能标志高字节
            */
            this.sendCommandList.push({
                name_cn: "BMS LS 放电过流",
                name: "BMS LS discharge over current",
                command: "0x8900",
                sub_command: "0x2C",
                description: "BMS LS discharge over current",
                description_cn: "BMS LS 放电过流",
                params: [
                    {
                        name: "放电电流过高保护",
                        type: "uint16",
                        description: "放电电流过高保护",
                        unit: "A",
                        formula: "return value * 10"
                    },
                    {
                        name: "放电电流过高保护恢复",
                        type: "uint16",
                        description: "放电电流过高保护恢复",
                        unit: "A",
                        formula: "return value * 10"
                    },
                    {
                        name: "放电电流过高报警",
                        type: "uint16",
                        description: "放电电流过高报警",
                        unit: "A",
                        formula: "return value * 10"
                    },
                    {
                        name: "放电电流过高保护延时",
                        type: "uint16",
                        description: "放电电流过高保护延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "放电电流过高保护恢复延时",
                        type: "uint16",
                        description: "放电电流过高保护恢复延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "放电电流过高报警延时",
                        type: "uint16",
                        description: "放电电流过高报警延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "放电电流过高保护使能标志",
                        type: "uint16",
                        description: "放电电流过高保护使能标志",
                        options: [
                            {
                                value: 0,
                                label: "屏蔽保护"
                            },
                            {
                                value: 1,
                                label: "使能"
                            }
                        ]
                    }
                ]
            });
            /*
            充电电流过高保护 低字节
0.1A/bit 偏移量： 0
充电电流过高保护 高字节
充电电流过高保护恢复 低字节
0.1A/bit 偏移量： 0
充电电流过高保护恢复 高字节
充电电流过高报警 低字节
0.1A/bit 偏移量： 0
充电电流过高报警 高字节
充电电流过高保护延时 低字节
100ms/bit
充电电流过高保护延时 高字节
充电电流过高保护恢复延时 低字节
100ms/bit
充电电流过高保护恢复延时 高字节
充电电流过高报警延时 低字节
100ms/bit
充电电流过高报警延时 高字节
充电电流过高保护使能标志低字节
0： 屏蔽保护 1： 使能 充电电流过高保护使能标志高字节
*/
            this.sendCommandList.push({
                name_cn: "BMS LS 充电过流",
                name: "BMS LS charge over current",
                command: "0x8900",
                sub_command: "0x2D",
                description: "BMS LS charge over current",
                description_cn: "BMS LS 充电过流",
                params: [
                    {
                        name: "充电电流过高保护",
                        type: "uint16",
                        description: "充电电流过高保护",
                        unit: "A",
                        formula: "return value * 10"
                    },
                    {
                        name: "充电电流过高保护恢复",
                        type: "uint16",
                        description: "充电电流过高保护恢复",
                        unit: "A",
                        formula: "return value * 10"
                    },
                    {
                        name: "充电电流过高报警",
                        type: "uint16",
                        description: "充电电流过高报警",
                        unit: "A",
                        formula: "return value * 10"
                    },
                    {
                        name: "充电电流过高保护延时",
                        type: "uint16",
                        description: "充电电流过高保护延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "充电电流过高保护恢复延时",
                        type: "uint16",
                        description: "充电电流过高保护恢复延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "充电电流过高报警延时",
                        type: "uint16",
                        description: "充电电流过高报警延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "充电电流过高保护使能标志",
                        type: "uint16",
                        description: "充电电流过高保护使能标志",
                        options: [
                            {
                                value: 0,
                                label: "屏蔽保护"
                            },
                            {
                                value: 1,
                                label: "使能"
                            }
                        ]
                    }
                ]
            });
            /*
            充电温度过低保护 低字节 计算公式：（ 数据值 - 2731 ） * 0.1，例如： 数据值为 0xAAC , 温
度值为（ 0xAAC - 2731 ） * 0.1 = 0.1 摄氏度 充电温度过低保护 高字节
充电温度过低保护恢复 低字节 计算公式：（ 数据值 - 2731 ） * 0.1，例如： 数据值为 0xAAC , 温
度值为（ 0xAAC - 2731 ） * 0.1 = 0.1 摄氏度 充电温度过低保护恢复 高字节
充电温度过低报警 低字节 计算公式：（ 数据值 - 2731 ） * 0.1，例如： 数据值为 0xAAC , 温
度值为（ 0xAAC - 2731 ） * 0.1 = 0.1 摄氏度 充电温度过低报警 高字节
充电温度过低保护延时 低字节
100ms/bit
充电温度过低保护延时 高字节
充电温度过低保护恢复延时 低字节
100ms/bit
充电温度过低保护恢复延时 高字节
充电温度过低报警延时 低字节
100ms/bit
充电温度过低报警延时 高字节
充电温度过低保护使能标志低字节
0： 屏蔽保护 1： 使能 充电温度过低保护使能标志高字节
            */
            this.sendCommandList.push({
                name_cn: "BMS LS 充电低温",
                name: "BMS LS charge low temperature",
                command: "0x8900",
                sub_command: "0x31",
                description: "BMS LS charge low temperature",
                description_cn: "BMS LS 充电低温",
                params: [
                    {
                        name: "充电温度过低保护",
                        type: "uint16",
                        description: "充电温度过低保护",
                        unit: "摄氏度",
                        formula: "return value * 10 + 2731"
                    },
                    {
                        name: "充电温度过低保护恢复",
                        type: "uint16",
                        description: "充电温度过低保护恢复",
                        unit: "摄氏度",
                        formula: "return value * 10 + 2731"
                    },
                    {
                        name: "充电温度过低报警",
                        type: "uint16",
                        description: "充电温度过低报警",
                        unit: "摄氏度",
                        formula: "return value * 10 + 2731"
                    },
                    {
                        name: "充电温度过低保护延时",
                        type: "uint16",
                        description: "充电温度过低保护延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "充电温度过低保护恢复延时",
                        type: "uint16",
                        description: "充电温度过低保护恢复延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "充电温度过低报警延时",
                        type: "uint16",
                        description: "充电温度过低报警延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "充电温度过低保护使能标志",
                        type: "uint16",
                        description: "充电温度过低保护使能标志",
                        options: [
                            {
                                value: 0,
                                label: "屏蔽保护"
                            },
                            {
                                value: 1,
                                label: "使能"
                            }
                        ]
                    }
                ]
            });
            /*
            充电温度过高保护 低字节 计算公式：（ 数据值 - 2731 ） * 0.1，例如： 数据值为 0xAAC , 温
度值为（ 0xAAC - 2731 ） * 0.1 = 0.1 摄氏度 充电温度过高保护 高字节
充电温度过高保护恢复 低字节 计算公式：（ 数据值 - 2731 ） * 0.1，例如： 数据值为 0xAAC , 温
度值为（ 0xAAC - 2731 ） * 0.1 = 0.1 摄氏度 充电温度过高保护恢复 高字节
充电温度过高报警 低字节 计算公式：（ 数据值 - 2731 ） * 0.1，例如： 数据值为 0xAAC , 温
度值为（ 0xAAC - 2731 ） * 0.1 = 0.1 摄氏度 充电温度过高报警 高字节
充电温度过高保护延时 低字节
100ms/bit
充电温度过高保护延时 高字节
充电温度过高保护恢复延时 低字节
100ms/bit
充电温度过高保护恢复延时 高字节
充电温度过高报警延时 低字节
100ms/bit
充电温度过高报警延时 高字节
充电温度过高保护使能标志低字节
0： 屏蔽保护 1： 使能 充电温度过高保护使能标志高字节
            */
            this.sendCommandList.push({
                name_cn: "BMS LS 充电高温",
                name: "BMS LS charge high temperature",
                command: "0x8900",
                sub_command: "0x2F",
                description: "BMS LS charge high temperature",
                description_cn: "BMS LS 充电高温",
                params: [
                    {
                        name: "充电温度过高保护",
                        type: "uint16",
                        description: "充电温度过高保护",
                        unit: "摄氏度",
                        formula: "return value * 10 + 2731"
                    },
                    {
                        name: "充电温度过高保护恢复",
                        type: "uint16",
                        description: "充电温度过高保护恢复",
                        unit: "摄氏度",
                        formula: "return value * 10 + 2731"
                    },
                    {
                        name: "充电温度过高报警",
                        type: "uint16",
                        description: "充电温度过高报警",
                        unit: "摄氏度",
                        formula: "return value * 10 + 2731"
                    },
                    {
                        name: "充电温度过高保护延时",
                        type: "uint16",
                        description: "充电温度过高保护延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "充电温度过高保护恢复延时",
                        type: "uint16",
                        description: "充电温度过高保护恢复延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "充电温度过高报警延时",
                        type: "uint16",
                        description: "充电温度过高报警延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "充电温度过高保护使能标志",
                        type: "uint16",
                        description: "充电温度过高保护使能标志",
                        options: [
                            {
                                value: 0,
                                label: "屏蔽保护"
                            },
                            {
                                value: 1,
                                label: "使能"
                            }
                        ]
                    }
                ]
            });
            /*
            放电温度过低保护 低字节
计算公式：（ 数据值 - 2731 ） * 0.1，例如： 数据值为 0xAAC , 温度值为（ 0xAAC - 2731 ） * 0.1 = 0.1 摄氏度
放电温度过低保护 高字节 度值为（ 0xAAC - 2731 ） * 0.1 = 0.1 摄氏度
放电温度过低保护恢复 低字节 计算公式：（ 数据值 - 2731 ） * 0.1，例如： 数据值为 0xAAC , 温
度值为（ 0xAAC - 2731 ） * 0.1 = 0.1 摄氏度 放电温度过低保护恢复 高字节
放电温度过低报警 低字节 计算公式：（ 数据值 - 2731 ） * 0.1，例如： 数据值为 0xAAC , 温
度值为（ 0xAAC - 2731 ） * 0.1 = 0.1 摄氏度 放电温度过低报警 高字节
放电温度过低保护延时 低字节
100ms/bit
放电温度过低保护延时 高字节
放电温度过低保护恢复延时 低字节
100ms/bit
放电温度过低保护恢复延时 高字节
放电温度过低报警延时 低字节
100ms/bit
放电温度过低报警延时 高字节
放电温度过低保护使能标志低字节
0： 屏蔽保护 1： 使能 放电温度过低保护使能标志高字节
*/
            this.sendCommandList.push({
                name_cn: "BMS LS 放电低温",
                name: "BMS LS discharge low temperature",
                command: "0x8900",
                sub_command: "0x30",
                description: "BMS LS discharge low temperature",
                description_cn: "BMS LS 放电低温",
                params: [
                    {
                        name: "放电温度过低保护",
                        type: "uint16",
                        description: "放电温度过低保护",
                        unit: "摄氏度",
                        formula: "return value * 10 + 2731"
                    },
                    {
                        name: "放电温度过低保护恢复",
                        type: "uint16",
                        description: "放电温度过低保护恢复",
                        unit: "摄氏度",
                        formula: "return value * 10 + 2731"
                    },
                    {
                        name: "放电温度过低报警",
                        type: "uint16",
                        description: "放电温度过低报警",
                        unit: "摄氏度",
                        formula: "return value * 10 + 2731"
                    },
                    {
                        name: "放电温度过低保护延时",
                        type: "uint16",
                        description: "放电温度过低保护延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "放电温度过低保护恢复延时",
                        type: "uint16",
                        description: "放电温度过低保护恢复延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "放电温度过低报警延时",
                        type: "uint16",
                        description: "放电温度过低报警延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "放电温度过低保护使能标志",
                        type: "uint16",
                        description: "放电温度过低保护使能标志",
                        options: [
                            {
                                value: 0,
                                label: "屏蔽保护"
                            },
                            {
                                value: 1,
                                label: "使能"
                            }
                        ]
                    }
                ]
            });
            /*
            放电温度过高保护 低字节 计算公式：（ 数据值 - 2731 ） * 0.1，例如：数据值为 0xAAC , 温度
值为（ 0xAAC - 2731 ）* 0.1 = 0.1 摄氏度 放电温度过高保护 高字节
放电温度过高保护恢复 低字节 计算公式：（ 数据值 - 2731 ） * 0.1，例如： 数据值为 0xAAC , 温
度值为（ 0xAAC - 2731 ） * 0.1 = 0.1 摄氏度 放电温度过高保护恢复 高字节
放电温度过高报警 低字节 计算公式：（ 数据值 - 2731 ） * 0.1，例如： 数据值为 0xAAC , 温
度值为（ 0xAAC - 2731 ） * 0.1 = 0.1 摄氏度 放电温度过高报警 高字节
放电温度过高保护延时 低字节
100ms/bit
放电温度过高保护延时 高字节
放电温度过高保护恢复延时 低字节
100ms/bit
放电温度过高保护恢复延时 高字节
放电温度过高报警延时 低字节
100ms/bit
放电温度过高报警延时 高字节
放电温度过高保护使能标志低字节
0： 屏蔽保护 1： 使能 放电温度过高保护使能标志高字节
            */
            this.sendCommandList.push({
                name_cn: "BMS LS 放电高温",
                name: "BMS LS discharge high temperature",
                command: "0x8900",
                sub_command: "0x2E",
                description: "BMS LS discharge high temperature",
                description_cn: "BMS LS 放电高温",
                params: [
                    {
                        name: "放电温度过高保护",
                        type: "uint16",
                        description: "放电温度过高保护",
                        unit: "摄氏度",
                        formula: "return value * 10 + 2731"
                    },
                    {
                        name: "放电温度过高保护恢复",
                        type: "uint16",
                        description: "放电温度过高保护恢复",
                        unit: "摄氏度",
                        formula: "return value * 10 + 2731"
                    },
                    {
                        name: "放电温度过高报警",
                        type: "uint16",
                        description: "放电温度过高报警",
                        unit: "摄氏度",
                        formula: "return value * 10 + 2731"
                    },
                    {
                        name: "放电温度过高保护延时",
                        type: "uint16",
                        description: "放电温度过高保护延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "放电温度过高保护恢复延时",
                        type: "uint16",
                        description: "放电温度过高保护恢复延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "放电温度过高报警延时",
                        type: "uint16",
                        description: "放电温度过高报警延时",
                        unit: "ms",
                        formula: "return value / 100"
                    },
                    {
                        name: "放电温度过高保护使能标志",
                        type: "uint16",
                        description: "放电温度过高保护使能标志",
                        options: [
                            {
                                value: 0,
                                label: "屏蔽保护"
                            },
                            {
                                value: 1,
                                label: "使能"
                            }
                        ]
                    }
                ]
            });
            getSendCommandList("secnet")
                .then(res => {
                // append res.data to this.sendCommandList
                console.log(res);
                this.sendCommandList = this.sendCommandList.concat(res.data);
            })
        },
        customRow(record) {
            return {
                on: {
                    click: (event) => {
                        console.log("row click", record);
                        this.currentRow = record;
                        this.param = "";
                        this.decimal_params = [];
                        this.params = [];
                        this.help_param = "";
                    }
                }
            };
        },
        handleOk() {
            this.formErrorMessage = null;
            if (this.currentRow === null) {
                this.formErrorMessage = "请选择指令";
                return;
            }
            console.log("deviceIds", this.deviceIds);
            if (this.deviceIds.length === 0) {
                this.formErrorMessage = "请添加设备";
                return;
            }

            // bms ls 配置命令，拼接好参数后，用透传命令发送
            let subCommand = this.currentRow.sub_command;
            if (this.customRow.command === "0x8900" &&
                (this.customRow.sub_command === "0x29" ||
                    this.customRow.sub_command === "0x28" ||
                    this.customRow.sub_command === "0x2C" ||
                    this.customRow.sub_command === "0x2D" ||
                    this.customRow.sub_command === "0x31" ||
                    this.customRow.sub_command === "0x2F" ||
                    this.customRow.sub_command === "0x30" ||
                    this.customRow.sub_command === "0x2E")
            ) {
                    subCommand = "0xff";
            }
            let arg = {
                id: (new Date()).getTime(), // current timestamp in milliseconds
                name: this.currentRow.name,
                command: this.currentRow.command,
                subCommand: subCommand,
                param: this.param,
                enableOfflineMessage: this.enableOfflineMessage,
                offlineMessageTtl: this.offlineMessageTtl
            };
            console.log("arg", arg);
            //
            // send the device id set (array of device id and/or device id range) to the backend.
            // The backend will send the command to each device in the set one by one in background.
            //
            // The backend will store the command in a database table and return the batch command id.
            //
            // The frontend can use this id to query the status of the batch command.
            //
            // The backend will (should?) also send a notification to the frontend when the batch command is finished.
            //
            // arg.deviceIdSet = this.deviceIdSet
            arg.deviceIds = this.deviceIds.map(item => item.deviceId);
            this.$message.info("正在发送指令");
            batchSendCommand(arg).then(res => {
                console.log(res);
                if (res.data && res.data.id) {
                    console.log("batch command id", res.data.id);
                    // close current dialog and show batch command manager dialog
                    this.$emit("ok", res.data.id);
                }
                else {
                    // send command failed
                    this.$message.error(res);
                }
            });
        },
        handleCancel() {
            console.log("handleCancel");
            this.deviceIdSet = null;
            this.showAddDevice = false;
        },
        handleAddDevice() {
            console.log("handleAddDevice");
            this.showAddDevice = !this.showAddDevice;
        },
        initDeviceSet() {
            if (this.deviceIdSet == null) {
                this.deviceIdSet = {
                    list: []
                };
                if (this.deviceId) {
                    this.deviceIdSet.list.push(this.deviceId);
                }
            }
            if (this.deviceIdSet.list == null) {
                this.deviceIdSet.list = [];
            }
            if (this.deviceIdSet.rangeList == null) {
                this.deviceIdSet.rangeList = [];
            }
        },
        reloadDeviceSet() {
            this.reload = false;
            this.reload = true;
        },
        handleAddDeviceId() {
            console.log("handleAddDeviceId", this.deviceIdNew);
            this.initDeviceSet();
            this.deviceIdSet.list.push(this.deviceIdNew);
            this.deviceIdNew = null;
            this.reloadDeviceSet();
        },
        handleAddDeviceIdRange() {
            console.log("handleAddDeviceIdRange", this.deviceIdRangeBegin, this.deviceIdRangeEnd);
            this.initDeviceSet();
            this.deviceIdSet.rangeList.push([this.deviceIdRangeBegin, this.deviceIdRangeEnd]);
            this.deviceIdRangeBegin = null;
            this.deviceIdRangeEnd = null;
            this.reloadDeviceSet();
        },
        handleRemoveDeviceId(id) {
            console.log("handleRemoveDeviceId", id);
            if (this.deviceIdSet && this.deviceIdSet.list) {
                const index = this.deviceIdSet.list.indexOf(id);
                if (index >= 0) {
                    this.deviceIdSet.list.splice(index, 1);
                }
            }
            this.reloadDeviceSet();
        },
        handleRemoveDeviceIdRange(idRange) {
            console.log("handleRemoveDeviceIdRange", idRange);
            if (this.deviceIdSet && this.deviceIdSet.rangeList) {
                let foundIndex = -1;
                this.deviceIdSet.rangeList.forEach((range, index) => {
                    console.log("range", range, "index", index);
                    if (range[0] === idRange[0] && range[1] === idRange[1]) {
                        foundIndex = index;
                    }
                });
                if (foundIndex >= 0) {
                    console.log("remove range", foundIndex);
                    this.deviceIdSet.rangeList.splice(foundIndex, 1);
                    console.log("rangeList", this.deviceIdSet.rangeList);
                }
            }
            this.reloadDeviceSet();
        },
        handleDeviceIdsRemove(id) {
            console.log("handleDeviceIdsRemove", id);
            const index = this.deviceIds.indexOf(id);
            if (index >= 0) {
                this.deviceIds.splice(index, 1);
            }
        },
        handleAddDeviceIds() {
            console.log("handleAddDeviceIds", this.newDeviceIds);
            this.newDeviceIds.split("\n").forEach(id => {
                const index = this.deviceIds.findIndex(item => item.deviceId === id);
                if (index < 0) {
                    this.deviceIds.push({ deviceId: id });
                }
            });
        },
        handleSaveOfflineMessageChange(value) {
            if (value) {
                const now = new Date();
                now.setMonth(now.getMonth() + 1);
                this.offlineMessageTtl = moment(now).format("YYYY-MM-DD HH:mm:ss");
            }
        },
        getTimeGap(date) {
            if (date == null) {
                return "";
            }
            const dateObj = new Date(date);
            const now = new Date();
            const gap = dateObj.getTime() - now.getTime();
            const seconds = Math.floor(gap / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            if (days > 0) {
                return `${days} 天 ${hours % 24} 小时`;
            }
            else if (hours > 0) {
                return `${hours} 小时 ${minutes % 60} 分钟`;
            }
            else if (minutes > 0) {
                return `${minutes} 分钟 ${seconds % 60} 秒`;
            }
            else {
                return `${seconds} 秒`;
            }
        },
        intToLittleEndianHexString(num) {
            // Convert the number to a hexadecimal string
            let hexString = num.toString(16);
            // Pad the string with leading zeros so it's a full byte sequence
            while (hexString.length % 8 !== 0) {
                hexString = '0' + hexString;
            }
            // Split the string into pairs of characters (bytes in big-endian)
            const hexPairs = hexString.match(/.{1,2}/g);
            // Reverse the order of the bytes for little-endian format
            const littleEndianHexString = hexPairs.reverse().join('');
            return littleEndianHexString;
        },
        handleDecimalParamChange(index) {
            console.log("handleDecimalParamChange", index, this.decimal_params[index]);
            // clear errors
            for (let i = 0; i < this.params_errors.length; i++) {
                this.$set(this.params_errors, i, "")
            }

            if (this.decimal_params_check_timer[index]) {
                clearTimeout(this.decimal_params_check_timer[index]);
            }

            this.decimal_params_check_timer = setTimeout(() => {
                // convert the decimal to hex
                let param_int = parseFloat(this.decimal_params[index]);
                if (isNaN(param_int)) {
                    console.log("param is not a number");
                    this.$set(this.params, index, "");
                    return;
                }
                console.log("param_int", param_int);
                // eval the formula
                const formula = this.currentRow.params[index].formula;
                console.log("formula", formula);
                if (formula) {
                    // eslint-disable-next-line no-new-func
                    const formula_func = new Function('value', formula);
                    const param = formula_func(param_int);
                    console.log("param after formula applied", param);
                    param_int = param
                }
                // little endian
                const param_hex = param_int.toString(16).padStart(4, "0");
                // const param_hex = param_int.toString(16).padStart(4, "0");
                console.log("param_hex", param_hex);
                const little_endian_hex = this.intToLittleEndianHexString(param_int);
                console.log("little_endian_hex", little_endian_hex);
                // split the hex into 2 bytes
                this.$set(this.params, index, param_hex.substring(2) + " " + param_hex.substring(0, 2));
                this.handleParamChange(index);
            }, 1000)
        },
        handleParamChange(index) {
            console.log("handleParamChange", index, this.params[index]);
            // clear errors
            for (let i = 0; i < this.params_errors.length; i++) {
                this.$set(this.params_errors, i, "")
            }
            this.param = ""
            // check if the param is valid after changed after 3 seconds
            if (this.params_check_timer[index]) {
                clearTimeout(this.params_check_timer[index]);
            }
            this.params_check_timer[index] = setTimeout(() => {
                console.log("check param", index, this.params[index])
                this.$set(this.params_errors, index, "")
                // check 0 ~ index -1 params
                console.log("params", this.params)
                for (let i = 0; i < index; i++) {
                    console.log("params[", i, "]", this.params[i])
                    this.$set(this.params_errors, i, "")
                    if (this.params[i] === undefined || this.params[i] === null || this.params[i] === "") {
                        this.$set(this.params_errors, i, "参数不能为空");
                        break;
                    }
                }
                if (this.params[index] !== "") {
                    // check if the param is valid
                    const param = this.params[index].split(" ");
                    if (param.length !== 2) {
                        this.$set(this.params_errors, index, "参数格式错误")
                    } else {
                        const low = parseInt(param[0], 16);
                        const high = parseInt(param[1], 16);
                        if (isNaN(low) || isNaN(high)) {
                            this.$set(this.params_errors, index, "参数格式错误")
                        }
                    }
                }
                console.log("params_errors", this.params_errors);

                // if there is no params_errors
                if (this.params_errors.filter(item => item !== "").length === 0) {
                    // calculate the param
                    const param = this.params.join(" ");
                    const param_len = param.split(" ").length;
                    const param_len_hex = param_len.toString(16).padStart(2, "0");
                    let command = this.currentRow.sub_command;
                    // remove leading 0x
                    if (command.startsWith("0x")) {
                        command = command.substring(2);
                    }
                    this.param = '3A 7D 02 01 00 ' + command + ' ' + param_len_hex + ' ' + param;
                    // calculate the checksum, add every byte and take the last 2 digits
                    let checksum = 0;
                    this.param.split(" ").forEach(item => {
                        checksum += parseInt(item, 16);
                        checksum = checksum & 0xff;
                    });
                    checksum = checksum.toString(16).padStart(2, "0")
                    this.param += ' ' + checksum;
                }
            }, 1000);
        },
        helpInputParams() {
            const help_param = this.help_param.replace(/[^0-9a-fA-F]/g, '');
            console.log('helpInputParams', help_param)
            // read 2 characters and add a space, then read 2 characters
            // then assign to this.params
            for (let i = 0; i < help_param.length / 4; i += 1) {
                const j = i * 4;
                const low = help_param.substring(j, j + 2);
                const high = help_param.substring(j + 2, j + 4);
                console.log('low', low, 'high', high)
                this.params[i] = low + ' ' + high;
            }

            this.handleParamChange(this.params.length - 1);
        }
    },
    components: { SelectDeviceIds }
}
</script>

<style scoped>
.info, .success, .warning, .error, .validation {
  border: 1px solid;
  margin: 10px 0px;
  padding: 15px 10px 15px 50px;
  background-repeat: no-repeat;
  background-position: 10px center;
}
.error{
  color: #D8000C;
  background-color: #FFBABA;
  background-image: url('~@/assets/icons/error.png');
}
.success {
  color: #4F8A10;
  background-color: #DFF2BF;
  background-image: url('~@/assets/icons/success.png');
}
</style>
