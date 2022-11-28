<template>
  <a-card>
    <el-row>
      <el-col type="flex" align="middle" :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
        <div class="content_bt" style="width: 300px; margin-top: 16px">
          <span
            style="
              font-size: 14px;
              font-weight: bold;
              text-align: left;
              line-height: 200%;
            "
          >
            电池编码：{{ this.batteryName }}
            <br />
            更新时间：{{ this.time_tracking }}
            <el-tag
              :type="this.battery_currency === 0 ? 'info' : this.battery_currency > 0 ? 'warning' : 'danger'"
            >
              {{ this.battery_currency === 0 ? '搁置中' : this.battery_currency > 0 ? '充电中' : '放电中' }}
            </el-tag>
          </span>
        </div>
        <div>
          <span class="title_tx2">SOC:{{ this.battery_capacity_soc }}%</span>
          <el-image
            style="margin-top: 15px; width: 300px; height: 160px"
            class="img_battery"
            fit="fill"
            :src="require('@/assets/battery/icon_battery_' + this.getSocImg(this.battery_capacity_soc) + '.png')"
          />
        </div>
        <el-row type="flex" align="middle" style="margin-top: 20px">
          <el-col :span="2" :offset="6" type="flex" align="middle">
            <span
              class="tx_soh"
              :style="
                battery_healthy < 30
                  ? 'color:#f34d37'
                  : battery_healthy < 70
                    ? 'color:#F8B34D'
                    : 'color:#47ba80'
              "
            >
              SOH:
            </span>
          </el-col>
          <el-col :span="10" type="flex" align="middle">
            <el-progress
              :text-inside="true"
              :stroke-width="20"
              :percentage="battery_healthy"
              :color="customColorMethod"
            ></el-progress>
          </el-col>
        </el-row>

        <el-col
          :span="24"
          type="flex"
          align="middle"
          justify="middle"
          style="margin-top: 30px; margin-bottom: 30px"
        >
          <el-descriptions :column="3" border>
            <el-descriptions-item label="充电MOS" span="1">
              <el-switch
                v-model="isMosRec"
                disabled
                active-color="#41b584"
                inactive-color="#f34d37"
              ></el-switch>
            </el-descriptions-item>
            <el-descriptions-item label="放电MOS" span="1">
              <el-switch
                v-model="isMosDis"
                disabled
                active-color="#41b584"
                inactive-color="#f34d37"
              ></el-switch>
            </el-descriptions-item>
            <el-descriptions-item label="均衡开关" span="1">
              <el-switch
                v-model="isMosDis"
                disabled
                active-color="#41b584"
                inactive-color="#f34d37"
              ></el-switch>
            </el-descriptions-item>
            <el-descriptions-item label="当前电流" span="1">
              <el-tag
                size="small"
                :type="battery_currency === 0 ? 'info' : battery_currency > 0 ? 'warning' : 'danger'"
              >
                {{ battery_currency }}A
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="当前电压" span="1">
              <el-tag size="small">{{ battery_voltage }}V</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="当前功率" span="1">
              <el-tag size="small">W</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="当前湿度" span="1">
              <el-tag size="small">W</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="剩余容量" span="1">
              <el-tag size="small">{{ battery_capacity_soc * battery_capacity_config / 100 }} ah</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="循环次数" span="1">
              <el-tag size="small">{{ battery_charging_cycle }} 次</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-col>

        <el-row type="flex" align="middle" style="padding: 8px">
          <el-col :span="12" type="flex" align="middle">
            <span>放电MOS:</span>
            <el-tag
              size="mini"
              type="danger"
              effect="dark"
              @click="onSendOrderTag('放电MOS关闭')"
            >
              关闭
            </el-tag>
            <el-tag
              size="mini"
              type="success"
              effect="dark"
              @click="onSendOrderTag('放电MOS打开')"
            >
              开启
            </el-tag>
          </el-col>
          <el-col :span="12" type="flex" align="middle">
            <span>充电MOS:</span>
            <el-tag
              size="mini"
              type="danger"
              effect="dark"
              @click="onSendOrderTag('充电MOS关闭')"
            >
              关闭
            </el-tag>
            <el-tag
              size="mini"
              type="success"
              effect="dark"
              @click="onSendOrderTag('充电MOS打开')"
            >
              开启
            </el-tag>
          </el-col>
        </el-row>
        <el-row type="flex" align="middle" style="padding: 8px"></el-row>
      </el-col>

      <el-col type="flex" align="middle" :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
        <!-- 电池图表 -->
        <el-row>
          <el-col type="flex" align="middle" justify="middle">
            <chart-bms-more
              ref="bmschart"
            ></chart-bms-more>
            <span
              v-if="initHis && dataListBMS.length == 0"
              style="border-style: solid; border-width: 1px; padding: 8px"
            >
              设备无数据
            </span>
          </el-col>
          <el-col
            :span="23"
            :offset="1"
            type="flex"
            align="middle"
            justify="middle"
          >
            <el-row
              v-for="(itemList, indexList) in tempList"
              :key="'temp' + indexList"
              style="margin-top: 8px"
              type="flex"
              align="middle"
            >
              <el-col
                v-for="(item, index) in itemList"
                :key="'temp2' + index"
                :span="7"
                class="content_center"
              >
                <el-image
                  class="item_battery"
                  :src="require('@/assets/battery/icon_temp_item.png')"
                />
                <span style="font-size: 12px; margin-right: 4px">
                  {{ item.name }}:
                </span>
                <span :style="'font-size: 12px; font-weight: bold;'">
                  {{ item.value }}℃
                </span>
              </el-col>
            </el-row>

            <el-row type="flex" align="start" style="margin-top: 20px">
              <el-col :span="7" type="flex" align="middle">
                <el-tag size="small" effect="plain" type="success">
                  最高单体电压：{{ maxVol }}V
                </el-tag>
              </el-col>
              <el-col :span="7" type="flex" align="middle">
                <el-tag size="small" effect="plain" type="danger">
                  最低单体电压：{{ minVol }}V
                </el-tag>
              </el-col>
              <el-col :span="7" type="flex" align="middle">
                <el-tag size="small" effect="plain" type="info">
                  单体电压压差：{{ voltageDifference }}V
                </el-tag>
              </el-col>
            </el-row>

            <!-- 单个电池 -->
            <el-row
              v-for="(itemList, indexList) in batteryList"
              :key="'battery' + indexList"
              style="margin-top: 8px"
              type="flex"
            >
              <el-col
                v-for="(item, index) in itemList"
                :key="'battery2' + index"
                :span="5"
                class="content_start"
              >
                <span style="font-size: 12px; width: 20px">
                  [{{ indexList * 5 + index + 1 }}]
                </span>
                <el-image
                  class="item_battery"
                  :src="require('@/assets/battery/icon_battery_item.png')"
                />
                <span
                  :style="
                    'font-size: 12px; font-weight: bold;' +
                      (item.value === maxVol
                        ? 'color:#47ba80;'
                        : item.value === minVol
                          ? 'color:#f34d37;'
                          : 'color:#222222;')
                  "
                >
                  {{ item.value }}V
                </span>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <!-- 第三排 -->
    <el-row>
      <!-- 基础信息 -->
      <el-row
        type="flex"
        justify="space-between"
        align="middle"
        style="padding: 8px; margin-top: 8px"
      >
        <el-col :span="20">
          <span class="det_title">基础信息</span>
        </el-col>
        <el-col :span="2">
<!--          <el-button-->
<!--            type="primary"-->
<!--            size="mini"-->
<!--            style="margin-left: 8px"-->
<!--            @click="onSendOrder()"-->
<!--          >-->
<!--            下发指令-->
<!--          </el-button>-->
        </el-col>
      </el-row>

      <el-descriptions :column="6" size="mini" border>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            二维码/别名
          </template>
          {{ mAlias }}
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-stopwatch"></i>
            GPS电压 ?
          </template>
          {{ mBatteryVoltage }}V
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            信号
          </template>
          <el-tag size="mini">GSM:{{ mSignal }}</el-tag>
          <el-tag size="mini">GPS:{{ mSatellites }}</el-tag>
          <el-tag size="mini" :type="mLocationType == 1 ? 'success' : 'danger'">
            {{ mLocationType == 1 ? 'GPS定位' : '基站定位' }}
          </el-tag>
        </el-descriptions-item>
        <!-- ################################## -->
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-time"></i>
            GPS信号时间
          </template>
          {{ mReceiveTime }}
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-time"></i>
            GPS定位时间
          </template>
          {{ mLocationTime }}
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-time"></i>
            电池运行时间
          </template>
          {{ batterySystimeStr }}
        </el-descriptions-item>
        <!-- ################################## -->

        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-info"></i>
            电池类型
          </template>
          {{ batteryType }}
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-info"></i>
            电池版本
          </template>
          {{ batteryVer }}
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            状态
          </template>
          <el-tag :type="mACCON ? 'danger' : 'info'" size="mini">
            {{ mACCON ? '运动中' : '静止' }}
          </el-tag>
          <el-tag
            :type="battery_currency === 0 ? 'info' : battery_currency > 0 ? 'warning' : 'danger'"
            size="mini"
          >
            {{ battery_currency === 0 ? '搁置中' : battery_currency > 0 ? '充电中' : '放电中' }}
          </el-tag>
        <!-- <el-tag size="mini">油电开</el-tag> -->
        </el-descriptions-item>
      </el-descriptions>
    </el-row>

    <el-row>
      <!-- 基础信息 -->
      <el-row
        type="flex"
        justify="space-between"
        align="middle"
        style="padding: 8px; margin-top: 8px"
      >
        <el-col :span="20">
          <span class="det_title">报警信息</span>
        </el-col>
      </el-row>
      <el-descriptions :column="10" size="mini" border>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            低容量报警
          </template>
          <el-tag
            size="small"
            :type="
              mAlarm1 == '0' ? 'success' : mAlarm1 == '1' ? 'danger' : 'info'
            "
          >
            {{ mAlarm1 == '0' ? '正常' : mAlarm1 == '1' ? '异常' : '未读取' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            MOS管超温报警
          </template>
          <el-tag
            size="small"
            :type="
              mAlarm2 == '0' ? 'success' : mAlarm2 == '1' ? 'danger' : 'info'
            "
          >
            {{ mAlarm2 == '0' ? '正常' : mAlarm2 == '1' ? '异常' : '未读取' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            充电过压报警
          </template>
          <el-tag
            size="small"
            :type="
              mAlarm3 == '0' ? 'success' : mAlarm3 == '1' ? 'danger' : 'info'
            "
          >
            {{ mAlarm3 == '0' ? '正常' : mAlarm3 == '1' ? '异常' : '未读取' }}
          </el-tag>
        </el-descriptions-item>
        <!-- ################################## -->

        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            放电欠压报警
          </template>
          <el-tag
            size="small"
            :type="
              mAlarm4 == '0' ? 'success' : mAlarm4 == '1' ? 'danger' : 'info'
            "
          >
            {{ mAlarm4 == '0' ? '正常' : mAlarm4 == '1' ? '异常' : '未读取' }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            电池超温报警
          </template>
          <el-tag
            size="small"
            :type="
              mAlarm5 == '0' ? 'success' : mAlarm5 == '1' ? 'danger' : 'info'
            "
          >
            {{ mAlarm5 == '0' ? '正常' : mAlarm5 == '1' ? '异常' : '未读取' }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            充电过流报警
          </template>
          <el-tag
            size="small"
            :type="
              mAlarm6 == '0' ? 'success' : mAlarm6 == '1' ? 'danger' : 'info'
            "
          >
            {{ mAlarm6 == '0' ? '正常' : mAlarm6 == '1' ? '异常' : '未读取' }}
          </el-tag>
        </el-descriptions-item>
        <!-- ################################## -->

        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            放电过流报警
          </template>
          <el-tag
            size="small"
            :type="
              mAlarm7 == '0' ? 'success' : mAlarm7 == '1' ? 'danger' : 'info'
            "
          >
            {{ mAlarm7 == '0' ? '正常' : mAlarm7 == '1' ? '异常' : '未读取' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            电芯压差报警
          </template>
          <el-tag
            size="small"
            :type="
              mAlarm8 == '0' ? 'success' : mAlarm8 == '1' ? 'danger' : 'info'
            "
          >
            {{ mAlarm8 == '0' ? '正常' : mAlarm8 == '1' ? '异常' : '未读取' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            电池箱内超温报警
          </template>
          <el-tag
            size="small"
            :type="
              mAlarm9 == '0' ? 'success' : mAlarm9 == '1' ? 'danger' : 'info'
            "
          >
            {{ mAlarm9 == '0' ? '正常' : mAlarm9 == '1' ? '异常' : '未读取' }}
          </el-tag>
        </el-descriptions-item>
        <!-- ################################## -->
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            电池低温报警
          </template>
          <el-tag
            size="small"
            :type="
              mAlarm10 == '0' ? 'success' : mAlarm10 == '1' ? 'danger' : 'info'
            "
          >
            {{ mAlarm10 == '0' ? '正常' : mAlarm10 == '1' ? '异常' : '未读取' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            单体过压报警
          </template>
          <el-tag
            size="small"
            :type="
              mAlarm11 == '0' ? 'success' : mAlarm11 == '1' ? 'danger' : 'info'
            "
          >
            {{ mAlarm11 == '0' ? '正常' : mAlarm11 == '1' ? '异常' : '未读取' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            单体欠压报警
          </template>
          <el-tag
            size="small"
            :type="
              mAlarm12 == '0' ? 'success' : mAlarm12 == '1' ? 'danger' : 'info'
            "
          >
            {{ mAlarm12 == '0' ? '正常' : mAlarm12 == '1' ? '异常' : '未读取' }}
          </el-tag>
        </el-descriptions-item>
        <!-- ################################## -->
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            309_A保护
          </template>
          <el-tag
            size="small"
            :type="
              mAlarm13 == '0' ? 'success' : mAlarm13 == '1' ? 'danger' : 'info'
            "
          >
            {{ mAlarm13 == '0' ? '正常' : mAlarm13 == '1' ? '异常' : '未读取' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            309_B保护
          </template>
          <el-tag
            size="small"
            :type="
              mAlarm14 == '0' ? 'success' : mAlarm14 == '1' ? 'danger' : 'info'
            "
          >
            {{ mAlarm14 == '0' ? '正常' : mAlarm14 == '1' ? '异常' : '未读取' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            湿度报警
          </template>
          <el-tag
            size="small"
            :type="
              mAlarm15 == '0' ? 'success' : mAlarm15 == '1' ? 'danger' : 'info'
            "
          >
            {{ mAlarm15 == '0' ? '正常' : mAlarm15 == '1' ? '异常' : '未读取' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-row>

    <el-row>
      <!-- 配置信息 -->
      <el-row
        type="flex"
        justify="space-between"
        align="middle"
        style="padding: 8px; margin-top: 8px"
      >
        <el-col :span="20">
          <span class="det_title">配置信息</span>
        </el-col>
      </el-row>

      <el-descriptions :column="8" size="mini" border>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            开关状态
          </template>
          <el-tag
            size="small"
            :type="
              mChargeSwitch == '1'
                ? 'success'
                : mChargeSwitch == '0'
                  ? 'danger'
                  : 'info'
            "
          >
            {{
              mChargeSwitch == '1'
                ? '充电开'
                : mChargeSwitch == '0'
                  ? '充电关'
                  : '未读取'
            }}
          </el-tag>
          <el-tag
            size="small"
            :type="
              mDischargeSwitch == '1'
                ? 'success'
                : mDischargeSwitch == '0'
                  ? 'danger'
                  : 'info'
            "
          >
            {{
              mDischargeSwitch == '1'
                ? '放电开'
                : mDischargeSwitch == '0'
                  ? '放电关'
                  : '未读取'
            }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            低容量报警
          </template>
          <el-tag size="small" :type="'success'">
            {{ mLowSOCAlarmValue }}%
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            标称容量
          </template>
          <el-tag size="small" :type="'success'">{{ mRatedCapacity }}ah</el-tag>
        </el-descriptions-item>

        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            主板额定电流
          </template>
          <el-tag size="small" :type="'success'">{{ mRatedCurrent }}A</el-tag>
        </el-descriptions-item>

        <!-- ################################## -->

        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            单体[充电/放电]保护电压
          </template>
          <el-tag size="small" :type="'success'">
            {{ mSingleChargeProtectionVoltage }}V
          </el-tag>
          <el-tag size="small" :type="'success'">
            {{ mSingleDischargeProtectionVoltage }}V
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            单体[充电/放电]恢复电压
          </template>
          <el-tag size="small" :type="'success'">
            {{ mSingleChargRecoverVoltage }}V
          </el-tag>
          <el-tag size="small" :type="'success'">
            {{ mSingleDifferentialPressureProtectionVoltage }}V
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            总体[充电/放电]保护电压
          </template>
          <el-tag size="small" :type="'success'">
            {{ mChargeProtectionVoltage }}V
          </el-tag>
          <el-tag size="small" :type="'success'">
            {{ mDischargeProtectionVoltage }}V
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            总体[充电/放电]保护电压
          </template>
          <el-tag size="small" :type="'success'">
            {{ mChargeRecoverVoltage }}V
          </el-tag>
          <el-tag size="small" :type="'success'">
            {{ mDischargeRecoverVoltage }}V
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            二次[充电/放电]保护电压
          </template>
          <el-tag size="small" :type="'success'">
            {{ mSecondChargeProtectionVoltage }}V
          </el-tag>
          <el-tag size="small" :type="'success'">
            {{ mSecondDischargeProtectionVoltage }}V
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            单节压差保护电压
          </template>
          <el-tag size="small" :type="'success'">
            {{ mSingleDifferentialPressureProtectionVoltage }}V
          </el-tag>
        </el-descriptions-item>

        <!-- ################################## -->

        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            均衡启控电压
          </template>
          <el-tag size="small" :type="'success'">
            {{ mEquilibriumVoltage }}V
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            均衡电流
          </template>
          <el-tag size="small" :type="'success'">
            {{ mEquilibriumCurrent }}A
          </el-tag>
        </el-descriptions-item>

      <!-- ################################## -->
      </el-descriptions>
    </el-row>
  </a-card>
</template>

<script>
import { getDateStr } from '@/utils/dateUtils'
import ChartBmsMore from '@/views/history/bms_history/components/ChartBmsMore.vue'
import BmsInfoCharts from '@/views/list/components/BmsInfoCharts'
import { getBatteryInfoLatest } from '@/api/manage'
import moment from 'moment/moment'

export default {
  // name: 'BmsInfoCharts',
  components: {
    BmsInfoCharts,
    ChartBmsMore
  },
  props: {
    deviceId: {
      type: String,
      default: () => null
    }
  },
  mounted () {
    getBatteryInfoLatest(this.deviceId, {})
      .then(res => {
        console.log('battery info latest', res)
        if (res.data && res.data.logs && res.data.logs.length > 0) {
          const bmsInfo = res.data.logs[0]
          this.time_tracking = moment(bmsInfo.time_tracking).format('YYYY-MM-DD HH:MM:SS')
          this.battery_capacity_soc = bmsInfo.battery_capacity_soc
          this.battery_healthy = bmsInfo.battery_healthy
          this.battery_voltage = (bmsInfo.battery_voltage / 100.0).toFixed(2)
          this.batteryList = this.form_battery_voltage_array_for_display(bmsInfo.single_battery_voltage_arr.split(','), 5)
          // console.log('battery list', this.batteryList)
          // single_battery_voltage_arr
          this.battery_currency = (bmsInfo.battery_currency / 100.0).toFixed(2)
          this.isMosRec = bmsInfo.battery_status_charging_mos === 1
          this.isMosDis = bmsInfo.battery_status_discharging_mos === 1
          this.battery_charging_cycle = bmsInfo.battery_charging_cycle
        }
      }).catch(err => {
        console.log('battery info latest', err)
    })
    if (this.dataListBMS.length === 0) {
      this.initBMSUI()
      // this.getBmsHis(this.mCurSn, 227, 6)
    }
  },
  data () {
    return {
      initHis: false,
      valueDate: [],

      hasMosRec: false,
      hasMosDis: false,
      batterySystimeStr: '',

      mChargeProtection: '-',
      mDischargeProtection: '-',
      mShortProtection: '-',

      dataListBMS: [],

      mAlias: '',
      mLocationTime: '-',
      mReceiveTime: '-',
      mLocationType: '-',
      mSignal: '-',
      mSatellites: '-',
      mBatteryVoltage: '-',
      mACCON: false,
      mLat: 0,
      mLng: 0,

      time_tracking: '-',
      mCurSn: '',
      isMosRec: false,
      isMosDis: false,
      isEleLink: false,
      isRec: false,
      socImg: 1,
      battery_currency: '-',
      battery_voltage: '-',
      battery_capacity_soc: '-',
      battery_capacity_config: 50,
      battery_charging_cycle: 0,
      battery_healthy: 0,
      mSurplusCapacity: '-',
      mRecIndex: '-',

      voltageDifference: '-',
      maxVol: '-',
      minVol: '-',
      batterySpeSwitch: false,
      batterySystime: '-',
      batteryName: '-',
      batteryType: '-',
      batteryVer: '-',

      mAlarm1: '-',
      mAlarm2: '-',
      mAlarm3: '-',
      mAlarm4: '-',
      mAlarm5: '-',
      mAlarm6: '-',
      mAlarm7: '-',
      mAlarm8: '-',
      mAlarm9: '-',
      mAlarm10: '-',
      mAlarm11: '-',
      mAlarm12: '-',
      mAlarm13: '-',
      mAlarm14: '-',
      mAlarm15: '-',
      mAlarm16: '-',
      mAlarm17: '-',
      mAlarm18: '-',
      mAlarm19: '-',
      tempList: [],
      batteryList: [
        [
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' }
        ],
        [
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' }
        ],
        [
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' }
        ],
        [
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' }
        ]
      ],

      mSingleChargeProtectionVoltage: '-',
      mSingleChargRecoverVoltage: '-',
      mSingleDischargeProtectionVoltage: '-',
      mSingleDischargeRecoverVoltage: '-',
      mSingleDifferentialPressureProtectionVoltage: '-',
      mChargeProtectionVoltage: '-',
      mChargeRecoverVoltage: '-',
      mDischargeProtectionVoltage: '-',
      mDischargeRecoverVoltage: '-',
      mSecondChargeProtectionVoltage: '-',
      mSecondDischargeProtectionVoltage: '-',
      mRatedCapacity: '-',
      mRatedCurrent: '-',
      mEquilibriumVoltage: '-',
      mEquilibriumCurrent: '-',
      mChargeSwitch: '-',
      mDischargeSwitch: '-',
      mLowSOCAlarmValue: '-'
    }
  },
  methods: {
    customColorMethod (percentage) {
      if (percentage < 30) {
        return '#f34d37'
      } else if (percentage < 70) {
        return '#F8B34D'
      } else {
        return '#47ba80'
      }
    },
    getSocImg (soc) {
      let img = 0
      if (soc === 0) {
        img = 0
      } else if (soc <= 25) {
        img = 1
      } else if (soc <= 50) {
        img = 2
      } else if (soc <= 75) {
        img = 3
      } else if (soc > 75) {
        img = 4
      }
      return img
    },
    initBMSUI () {
      var dateStr = getDateStr(new Date())
      setTimeout(() => {
        this.$nextTick(() => {
          this.$refs['bmschart'].init(
            [
              [
                {
                  value: 0,
                  date: dateStr
                },
                {
                  value: 0,
                  date: dateStr
                },
                {
                  value: 0,
                  date: dateStr
                },
                {
                  value: 0,
                  date: dateStr
                },
                {
                  value: 0,
                  date: dateStr
                },
                {
                  value: 0,
                  date: dateStr
                }
              ]
            ],
            ['电压', '电流', 'SOC', '箱内温度', '电池温度', '功率管温度'],
            ['V', 'A', '%', '℃', '℃', '℃'],
            [
              '#6AD6E6',
              '#6F95DA',
              '#47ba80',
              '#E8A456',
              '#DBBB5B',
              '#E8E156'
            ],
            3
          )
        })
      }, 300)
    },
    form_battery_voltage_array_for_display (array, subGroupLength) {
      let index = 0
      let batteryListTemp = []

      array.forEach((items, index) => {
        let vol = parseFloat(items).toFixed(2)
        if (index === 0) {
          this.maxVol = vol
          this.minVol = vol
        }
        if (vol > this.maxVol) {
          this.maxVol = vol
        } else if (vol < this.minVol) {
          this.minVol = vol
        }
        batteryListTemp.push({
          pos: index,
          value: vol
        })
      })
      this.voltageDifference = (this.maxVol - this.minVol).toFixed(2)
      let newArray = []
      while (index < array.length) {
        newArray.push(batteryListTemp.slice(index, (index += subGroupLength)))
      }
      return newArray
    }
  }
}
</script>

<style lang="less" scoped>
@import "~ant-design-vue/es/style/themes/default.less";

.img_battery {
  height: 120px;
  width: 230px;
  margin-bottom: 8px;
}
.item_battery {
  height: 30px;
  width: 30px;
}
.title_tx2 {
  position: absolute;
  z-index: 1000;
  font-size: 28px;
  width: 290px;
  top: 150px;
  text-align: center;
}
.tx_soh {
  color: #47ba80;
  font-size: 16px;
  font-weight: bold;
}
.content_bt {
  flex-direction: column;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.content_start {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.content_center_dir {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.content_center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.content_between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.det_title {
  font-size: 18px;
  font-weight: bold;
}
.bg-suc-a {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  color: #fff;
  background: #47ba80;
  border-radius: 4px;
}
.bg-suc-t {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  color: #fff;
  background: #47ba80;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.bg-suc-b {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-style: solid;
  border-color: #47ba80;
  text-decoration: none;
}

.bg-fail-a {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  color: #fff;
  background: #f34d37;
  border-radius: 4px;
}
.bg-fail-t {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  color: #fff;
  background: #f34d37;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.bg-fail-b {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-style: solid;
  border-color: #f34d37;
  text-decoration: none;
}
.text-suc {
  color: #47ba80;
}
.text-fail {
  color: #5a5a5a;
}

</style>
