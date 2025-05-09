<script lang="ts">
import { ref, defineComponent, toRefs, computed, PropType, watch } from 'vue';

import type { RegionData } from '@/components/global/ta-component/ta-template-form-core/types/model';
import { TaTemplateFormItem, TaTemplateFormRule } from '../../ta-template-form-core/types';
import { RegionUserAreasApi } from './apis/region/user/areas.api';

interface CascaderItem {
  id: string;
  label: string;
  value: string;
  children?: CascaderItem[];
  loading?: boolean;
  isLeaf?: boolean;
}

// interface TaRegionIdFieldResultInterface {
//   province: { id: number; name: string };
//   city: { id: number; name: string };
//   district: { id: number; name: string };
// }

const TaRegionIdField = defineComponent({
  name: 'TaRegionIdField',
  components: {},
  props: {
    value: { type: Number, default: undefined },
    disabled: { type: Boolean, default: false },
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    depth: { type: Number, default: 3 },
    region_change_on_select: { type: Boolean, default: () => false },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => {
        emit('update:value', val);
        // const province = val ? getReturnDataFormOptions(val[0], options.value) : null;
        // const city = val ? getReturnDataFormOptions(val[1], cacheOptions.value[1]) : null;
        // const county = val ? getReturnDataFormOptions(val[2], cacheOptions.value[2]) : null;
        // emit('update:value', {
        //   province: val ? getReturnDataFormOptions(val[0], options.value) : null,
        //   city: val ? getReturnDataFormOptions(val[1], cacheOptions.value[1]) : null,
        //   county: val ? getReturnDataFormOptions(val[2], cacheOptions.value[2]) : null,
        //   province_id: province?.id,
        //   city_id: city?.id,
        //   county_id: county?.id,
        // });
      },
    });

    const innerValue = ref<{ id: number; name: string; type: string }[]>([]);

    watch(
      localValue,
      () => {
        if (localValue.value) {
          new RegionUserAreasApi().find(localValue.value).then(res => {
            // innerValue.value = res.data.ancestry?.split('/')?.map(i => Number(i)) || [];
            innerValue.value = res.data.path_info || [];
            console.log(innerValue.value, 'innerValue.value');
          });
        }
      },
      { immediate: true },
    );

    const cacheOptions = ref<Record<number, CascaderItem[]>>({});
    // const getReturnDataFormOptions = (name: number | string, options: CascaderItem[]) => {
    //   const resultOpt = options.find((opt: CascaderItem) => String(opt.value) === String(name));
    //   if (resultOpt) {
    //     return {
    //       id: resultOpt.id,
    //       name: resultOpt.label,
    //     };
    //   }
    //   return {};
    // };

    const rootRegionApi = new RegionUserAreasApi({ params: { q: { roots: true } } });
    const regionApi = new RegionUserAreasApi();

    const options = ref<CascaderItem[]>([]);

    rootRegionApi.index({ per_page: 999999 }).then(({ data }) => {
      options.value = data.records.map((region: RegionData) => ({
        label: region.name,
        value: region.id,
        id: region.id,
        isLeaf: props.depth == 1,
      }));
    });

    const loadData = (selectedOptions: CascaderItem[]) => {
      const targetOption = selectedOptions[selectedOptions.length - 1];

      targetOption.loading = true;

      regionApi
        .index({ per_page: 999999, q: { children_of: targetOption?.id } })
        .then(({ data }) => {
          const result = data.records.map((region: RegionData) => ({
            label: region.name,
            value: region.id,
            id: region.id,
            isLeaf: selectedOptions.length >= props.depth - 1,
          }));

          targetOption.children = result;
          cacheOptions.value[selectedOptions.length] = result;

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
        if (innerValue.value.length >= props.depth || finalChangeOnSelect.value) {
          resolve();
        } else {
          reject('请选择地区');
        }
      });
    };

    const onChange = (regionIds: any) => {
      localValue.value = regionIds[regionIds.length - 1];
    };

    return {
      ...toRefs(props),
      localValue,
      innerValue,
      loadData,
      options,
      validate,
      onChange,
      finalChangeOnSelect,
    };
  },
});
export default TaRegionIdField;
</script>

<template lang="pug">
.ta-region-field
  template(v-if='disabled')
    .value {{ innerValue.map(i => i.name).join(' / ') }}
  template(v-else)
    a-cascader(
      :value='innerValue.map(i => i.name)'
      placeholder='请选择'
      expand-trigger="hover"
      :options='options'
      :load-data='loadData'
      @update:value='onChange'
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
