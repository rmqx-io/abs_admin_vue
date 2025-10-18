<template>
  <div class="address-selector">
    <a-row :gutter="8">
      <a-col :span="6">
        <a-select
          v-model="selectedProvince"
          placeholder="选择省份"
          allowClear
          showSearch
          optionFilterProp="children"
          @change="handleProvinceChange"
          style="width: 100%"
        >
          <a-select-option
            v-for="province in provinces"
            :key="province.code"
            :value="province.code"
          >
            {{ province.name }}
          </a-select-option>
        </a-select>
      </a-col>
      <a-col :span="6">
        <a-select
          v-model="selectedCity"
          placeholder="选择城市"
          allowClear
          showSearch
          optionFilterProp="children"
          @change="handleCityChange"
          style="width: 100%"
          :disabled="!selectedProvince"
        >
          <a-select-option
            v-for="city in cities"
            :key="city.code"
            :value="city.code"
          >
            {{ city.name }}
          </a-select-option>
        </a-select>
      </a-col>
      <a-col :span="6">
        <a-select
          v-model="selectedDistrict"
          placeholder="选择区县"
          allowClear
          showSearch
          optionFilterProp="children"
          @change="handleDistrictChange"
          style="width: 100%"
          :disabled="!selectedCity"
        >
          <a-select-option
            v-for="district in districts"
            :key="district.code"
            :value="district.code"
          >
            {{ district.name }}
          </a-select-option>
        </a-select>
      </a-col>
      <a-col :span="6">
        <a-input
          v-model="detailAddress"
          placeholder="详细地址"
          @change="handleDetailChange"
          :maxLength="100"
        />
      </a-col>
    </a-row>
    <div v-if="fullAddress" class="full-address">
      <a-icon type="environment" />
      完整地址：{{ fullAddress }}
    </div>
  </div>
</template>

<script>
import { chinaAreaData } from './china-area-data'

export default {
  name: 'AddressSelector',
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    placeholder: {
      type: String,
      default: '请选择地址'
    }
  },
  data() {
    return {
      selectedProvince: '',
      selectedCity: '',
      selectedDistrict: '',
      detailAddress: '',
      provinces: [],
      cities: [],
      districts: []
    }
  },
  computed: {
    fullAddress() {
      const parts = []
      if (this.selectedProvince) {
        const province = this.provinces.find(p => p.code === this.selectedProvince)
        if (province) parts.push(province.name)
      }
      if (this.selectedCity) {
        const city = this.cities.find(c => c.code === this.selectedCity)
        if (city) parts.push(city.name)
      }
      if (this.selectedDistrict) {
        const district = this.districts.find(d => d.code === this.selectedDistrict)
        if (district) parts.push(district.name)
      }
      if (this.detailAddress) {
        parts.push(this.detailAddress)
      }
      return parts.join('')
    }
  },
  watch: {
    value: {
      handler(newValue) {
        if (newValue) {
          this.selectedProvince = newValue.provinceCode || ''
          this.selectedCity = newValue.cityCode || ''
          this.selectedDistrict = newValue.districtCode || ''
          this.detailAddress = newValue.detailAddress || ''
          
          // 如果有省份，加载城市
          if (this.selectedProvince) {
            this.loadCities(this.selectedProvince)
          }
          // 如果有城市，加载区县
          if (this.selectedCity) {
            this.loadDistricts(this.selectedCity)
          }
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.loadProvinces()
  },
  methods: {
    loadProvinces() {
      this.provinces = chinaAreaData.map(province => ({
        code: province.code,
        name: province.name
      }))
    },

    loadCities(provinceCode) {
      const province = chinaAreaData.find(p => p.code === provinceCode)
      if (province && province.children) {
        this.cities = province.children.map(city => ({
          code: city.code,
          name: city.name
        }))
      } else {
        this.cities = []
      }
      this.districts = []
    },

    loadDistricts(cityCode) {
      const province = chinaAreaData.find(p => p.code === this.selectedProvince)
      if (province && province.children) {
        const city = province.children.find(c => c.code === cityCode)
        if (city && city.children) {
          this.districts = city.children.map(district => ({
            code: district.code,
            name: district.name
          }))
        } else {
          this.districts = []
        }
      }
    },

    handleProvinceChange(provinceCode) {
      this.selectedCity = ''
      this.selectedDistrict = ''
      this.cities = []
      this.districts = []
      
      if (provinceCode) {
        this.loadCities(provinceCode)
      }
      
      this.emitChange()
    },

    handleCityChange(cityCode) {
      this.selectedDistrict = ''
      this.districts = []
      
      if (cityCode) {
        this.loadDistricts(cityCode)
      }
      
      this.emitChange()
    },

    handleDistrictChange() {
      this.emitChange()
    },

    handleDetailChange() {
      this.emitChange()
    },

    emitChange() {
      const result = {
        provinceCode: this.selectedProvince,
        provinceName: this.getProvinceName(this.selectedProvince),
        cityCode: this.selectedCity,
        cityName: this.getCityName(this.selectedCity),
        districtCode: this.selectedDistrict,
        districtName: this.getDistrictName(this.selectedDistrict),
        detailAddress: this.detailAddress,
        fullAddress: this.fullAddress
      }
      
      this.$emit('input', result)
      this.$emit('change', result)
    },

    getProvinceName(code) {
      const province = this.provinces.find(p => p.code === code)
      return province ? province.name : ''
    },

    getCityName(code) {
      const city = this.cities.find(c => c.code === code)
      return city ? city.name : ''
    },

    getDistrictName(code) {
      const district = this.districts.find(d => d.code === code)
      return district ? district.name : ''
    }
  }
}
</script>

<style scoped>
.address-selector {
  .full-address {
    margin-top: 8px;
    padding: 8px 12px;
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 4px;
    font-size: 13px;
    color: #52c41a;

    .anticon {
      margin-right: 4px;
    }
  }
}

@media (max-width: 768px) {
  .address-selector {
    :deep(.ant-col) {
      margin-bottom: 8px;
    }
  }
}
</style>
