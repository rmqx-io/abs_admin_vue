<template>
	<div>
		<a-table :dataSource='deviceIds' :columns='columnsDeviceIds' rowKey='deviceId'>
			<span slot="action" slot-scope="text, record">
				<template>
					<a @click="handleDeviceIdsRemove(record)">删除</a>
				</template>
			</span>
		</a-table>
		<div>
			<a-button type="primary" @click="handleAddDevice">
				添加设备
				<a-icon v-if='!showAddDevice' type="down" />
				<a-icon v-if='showAddDevice' type="up" />
			</a-button>
		</div>
		<div v-if='showAddDevice'>
			<a-form-item :label="`设备编号`">
				<a-textarea
					v-decorator="['newDeviceIds', { rules: [{ required: true, message: '设备编号' }] }]"
					:rows="4"
					v-model='newDeviceIds'
					placeholder='输入设备编号
一行一个设备' />
			</a-form-item>
			<div v-if='formErrorMessage' class='error'>{{ this.formErrorMessage }}</div>
			<a-button type="primary" @click="handleAddDeviceIds">
				添加
			</a-button>
		</div>
	</div>
</template>

<script>
export default {
	model: {
		prop: 'value',
		event: 'change'
	},
	props: {
		value: {
			type: String
		},
		deviceIds: {
			type: Array,
			default: () => []
		},
		formErrorMessage: {
			type: String,
			default: ''
		},
		showAdd: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		currentValue: {
			get () {
				return this.value
			},
			set (newValue) {
				this.$emit('input', newValue)
			}
		}
	},
	watch: {
		currentValue: {
			deep: true,
			immediate: true,
			handler: function (newValue) {
				this.valuePro = newValue
				if (newValue !== undefined) {
					this.$emit('change', newValue)
				}
			}
		}
	},
	data() {
		return {
			showAddDevice: this.showAdd,
			newDeviceIds: null,
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
			valuePro: undefined
		}
	},
	methods: {
		inputChange (e) {
			this.$emit('change', e.target.value)
		},
		handleDeviceIdsRemove(id) {
			console.log("handleDeviceIdsRemove", id);
			const index = this.deviceIds.indexOf(id);
			if (index >= 0) {
				this.deviceIds.splice(index, 1);
			}
		},
		handleAddDevice() {
			console.log("handleAddDevice");
			this.showAddDevice = !this.showAddDevice;
		},
		handleAddDeviceIds() {
			console.log("handleAddDeviceIds", this.newDeviceIds);
			this.newDeviceIds.split("\n").forEach(id => {
				const index = this.deviceIds.findIndex(item => item.deviceId === id);
				if (index < 0) {
					this.deviceIds.push({ deviceId: id });
				}
			});
		}
	}
}
</script>
