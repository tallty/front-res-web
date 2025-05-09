<script lang="ts">
import utils from '@/utils';
import { defineComponent, toRefs, PropType, computed, ref } from 'vue';
import {
  TaTemplateFormItem,
  TaTemplateFormSelect,
} from '@/components/global/ta-component/ta-template-form-core/types';
import useApiSelections from '@/components/global/ta-component/ta-template-form-core/useApiSelections';

const TaSelect = defineComponent({
  name: 'TaSelect',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({ options: {} }) },
    value: { type: [String, Number, Object] as PropType<any>, default: undefined },
    disabled: { type: Boolean, default: false },
    size: { type: String, default: 'large' },
    options: { type: Array as PropType<TaTemplateFormSelect[]>, default: undefined },
    multiple: { type: Boolean, default: false },

    path: { type: String, default: '' },
    ransackStr: { type: String, default: '' },
    attrs: { type: Array as PropType<string[]>, default: () => ['name'] },
  },
  setup(props, { emit }) {
    const elseIconRef = ref('DownOutlined');
    const localValue = computed({
      get: () => props.value,
      set: val => {
        emit('update:value', val);
        emit('syncValue', props.item, val);
      },
    });

    const filterOption = (input: string, option: any) => {
      return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    };

    const { options, findLabel } = useApiSelections(props);

    const label = computed(() =>
      Array.isArray(localValue.value)
        ? (localValue.value as any[]).map(findLabel).join('、')
        : findLabel(localValue.value),
    );

    const selectOptions = computed(() => {
      const opts = options.value.map((o: TaTemplateFormSelect) => ({
        label: o.label,
        value: o.value,
        group: o.group,
      }));
      return opts[0] && opts[0].group ? utils.groupBy(opts, 'group') : opts;
    });

    return {
      ...toRefs(props),
      localValue,
      filterOption,
      selectOptions,
      findLabel,
      label,
      elseIconRef,
    };
  },
});
export default TaSelect;
</script>

<template lang="pug">
.ta-select
  template(v-if='!disabled')
    a-select.select(
      v-model:value='localValue',
      :name='item.key',
      :disabled='disabled',
      :size='size',
      :placeholder='item.options.placeholder || `请选择${item.name || ""}`',
      :options='selectOptions',
      :filterOption='filterOption',
      :mode='multiple ? "multiple" : null',
      :tokenSeparators='[","]',
      showSearch
      showArrow
      allowClear
      @focus="elseIconRef = 'SearchOutlined'"
      @blur="elseIconRef = 'DownOutlined'"

    )
      template(#suffixIcon)
        TaIcon.cursor-pointer(v-if="localValue?.length",type="CloseOutlined", @click="localValue = []")
        TaIcon(v-else,:type="elseIconRef")

  template(v-else)
    .value {{ label }}
</template>

<style lang="stylus" scoped>
.ta-select
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
  >>>.ant-select-selection-item-remove
    display flex
    align-items center
  .select
    width 100%
</style>
