<script lang="ts">
import { defineComponent, toRefs, PropType, computed, reactive } from 'vue';
import {
  FormItemSize,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

const TaInputNumberRange = defineComponent({
  name: 'TaInputNumberRange',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    value: { type: Array as PropType<number[]>, default: () => [0, 0] },
    disabled: { type: Boolean, default: false },
    formatter: { type: Function, default: undefined },
    parser: { type: Function, default: undefined },
    precision: { type: Number, default: undefined },
    size: { type: String as PropType<FormItemSize>, default: () => 'regular' },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value || [0, 0],
      set: val => emit('update:value', val),
    });

    const queryParam = reactive({
      visitNum_begin: localValue.value?.[0] || 0,
      visitNum_end: localValue.value?.[1] || 0,
    });
    const max = computed(() => {
      if (props.item.options?.max === 0) {
        return 0;
      } else if (props.item.options?.max) {
        return props.item.options?.max;
      } else {
        return Infinity;
      }
    });

    const finalSize = computed(() => {
      if (props.item?.options?.size) {
        return props.item.options.size;
      }
      return props.size;
    });

    const min = computed(() => {
      if (props.item.options?.min === 0) {
        return 0;
      } else if (props.item.options?.min) {
        return props.item.options?.min;
      } else {
        return -Infinity;
      }
    });

    const handleMinChange = (v: number) => {
      const res = verification();
      if (!res) return;
      const max = queryParam.visitNum_end || localValue.value?.[1] || 0;
      localValue.value = [v, max];
    };
    const handleMaxChange = (v: number) => {
      const res = verification();
      if (!res) return;
      const min = queryParam.visitNum_begin || localValue.value?.[0] || 0;
      localValue.value = [min, v];
    };
    const { t } = useI18n();
    const verification = () => {
      if (!queryParam.visitNum_begin || !queryParam.visitNum_end) return;
      if (queryParam.visitNum_begin > queryParam.visitNum_end) {
        message.warning(t('taComponent.numberRange.error'));
        return false;
      } else {
        return true;
      }
    };

    return {
      ...toRefs(props),
      localValue,
      max,
      min,
      queryParam,
      finalSize,
      handleMinChange,
      handleMaxChange,
    };
  },
});
export default TaInputNumberRange;
</script>

<template lang="pug">
.ta-input-number
  template(v-if='!disabled')
    .flex.items-center 
      TaInputNumber.input(
        v-model:value='queryParam.visitNum_begin',
        :formatter='formatter',
        :parser='parser',
        :min='min',
        :max='max',
        :maxlength='item.options?.maxLength',
        :precision='precision',
        :size='finalSize',
        @change='handleMinChange'
      )
        template(#addonAfter, v-if='item.options?.unit')
          span {{ item.options?.unit }}
      .px-3 ~
      TaInputNumber.input(
        v-model:value='queryParam.visitNum_end',
        :formatter='formatter',
        :parser='parser',
        :min='min',
        :max='max',
        :maxlength='item.options?.maxLength',
        :precision='precision',
        :size='finalSize',
        @change='handleMaxChange'
      )
        template(#addonAfter, v-if='item.options?.unit')
          span {{ item.options?.unit }}
  template(v-else)
    .value {{ queryParam.visitNum_begin }} ~ {{ queryParam.visitNum_end }} {{ item.options?.unit }}
</template>

<style lang="stylus" scoped>
.ta-input-number
  width 100%
  >>>.ant-input-number
    background #F9FAFB !important
  .input
    width 100%
</style>
