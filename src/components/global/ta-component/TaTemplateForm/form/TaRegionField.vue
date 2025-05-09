<script lang="ts">
import { ref, defineComponent, toRefs, computed, PropType } from 'vue';

import type { RegionData } from '@/components/global/ta-component/ta-template-form-core/types/model';
import { RegionUserProvincesApi } from '@/components/global/ta-component/ta-template-form-core/apis/region/user/provinces.api';
import { RegionUserCitiesApi } from '@/components/global/ta-component/ta-template-form-core/apis/region/user/cities.api';
import { RegionUserCountiesApi } from '@/components/global/ta-component/ta-template-form-core/apis/region/user/counties.api';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';
import { TaTemplateFormRule } from '@/components/global/ta-component/ta-template-form-core/types';

interface CascaderItem {
  id: string;
  label: string;
  value: string;
  children?: CascaderItem[];
  loading?: boolean;
  isLeaf?: boolean;
}

const TaRegionField = defineComponent({
  name: 'TaRegionField',
  components: {},
  props: {
    value: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    region_change_on_select: { type: Boolean, default: () => false },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => [props.value?.province, props.value?.city, props.value?.district].filter(i => i),
      set: val => {
        emit('update:value', {
          province: val ? val[0] : null,
          city: val ? val[1] : null,
          district: val ? val[2] : null,
        });
      },
    });

    const apis = [
      new RegionUserProvincesApi(),
      new RegionUserCitiesApi(),
      new RegionUserCountiesApi(),
    ];

    const options = ref<CascaderItem[]>([]);

    apis[0].index().then(({ data }) => {
      options.value = data.records.map((region: RegionData) => ({
        label: region.name,
        value: region.name,
        id: region.id,
        isLeaf: false,
      }));
    });

    const loadData = (selectedOptions: CascaderItem[]) => {
      const targetOption = selectedOptions[selectedOptions.length - 1];

      targetOption.loading = true;

      const api = apis[selectedOptions.length];
      api
        .index({ parent_id: targetOption?.id })
        .then(({ data }) => {
          targetOption.children = data.records.map((region: RegionData) => ({
            label: region.name,
            value: region.name,
            id: region.id,
            isLeaf: selectedOptions.length >= apis.length - 1,
          }));
          targetOption.loading = false;
          options.value = [...options.value];
        })
        .catch(() => {
          targetOption.loading = false;
        });
    };

    const finalChangeOnSelect = computed(() => {
      return (
        props?.item?.options?.region_change_on_select || props?.region_change_on_select || false
      );
    });

    const validate = () => {
      return new Promise<void>((resolve, reject) => {
        if (
          (props.item.rules || []).filter((rule: TaTemplateFormRule) => rule.required).length === 0
        )
          return resolve();
        if (localValue.value.length === 3 || finalChangeOnSelect.value) {
          resolve();
        } else {
          reject('请选择地区');
        }
      });
    };

    return {
      ...toRefs(props),
      localValue,
      loadData,
      options,
      validate,

      finalChangeOnSelect,
    };
  },
});
export default TaRegionField;
</script>

<template lang="pug">
.ta-region-field
  template(v-if='disabled')
    .value {{ localValue.join(' / ') }}
  template(v-else)
    a-cascader(
      v-model:value='localValue'
      placeholder='请选择'
      expand-trigger="hover"
      :options='options'
      :load-data='loadData'
      :changeOnSelect='finalChangeOnSelect'
    )
</template>

<style lang="stylus" scoped>
.ta-region-field
  width 100%
  >>>.ant-select-multiple
    .ant-select-selector
      padding-top 6px
      padding-bottom 6px
      padding-left 10px
      .ant-select-selection-placeholder
        left 16px

  >>>.ant-select-single
    .ant-select-selector
      height 44px
      padding-top 6px
      padding-bottom 6px
      .ant-select-selection-search-input
        margin-top 6px
        left 16px
      .ant-select-selection-placeholder
        padding-left 6px
      .ant-select-selection-item
        padding-left 6px
  >>>.ant-select-selector
    background #F9FAFB !important
    border-radius: 8px !important
</style>
