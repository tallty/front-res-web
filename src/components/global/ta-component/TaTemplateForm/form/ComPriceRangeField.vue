<script lang="ts">
import { defineComponent, toRefs, computed, PropType } from 'vue';
import {
  TaTemplateFormRule,
  TaTemplateFormItem,
  FormItemSize,
} from '@/components/global/ta-component/ta-template-form-core/types';

const ComPriceRangeField = defineComponent({
  name: 'ComPriceRangeField',
  components: {},
  props: {
    value: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    size: { type: String as PropType<FormItemSize>, default: () => 'regular' },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const finalSize = computed(() => {
      if (props.item?.options?.size) {
        return props.item.options.size;
      }
      return props.size;
    });

    const validate = () => {
      return new Promise<void>((resolve, reject) => {
        if (
          (props.item.rules || []).filter((rule: TaTemplateFormRule) => rule.required).length === 0
        )
          return resolve();

        if (
          Number(localValue.value.estimate_amount_min) > 0 &&
          Number(localValue.value.estimate_amount_max) > 0 &&
          Number(localValue.value.estimate_amount_min) <=
            Number(localValue.value.estimate_amount_max)
        ) {
          resolve();
        } else {
          reject('请填写正确的金额范围');
        }
      });
    };

    return {
      ...toRefs(props),
      localValue,
      validate,
      finalSize,
    };
  },
});
export default ComPriceRangeField;
</script>

<template lang="pug">
.com-price-range-field.flex.items-center
  template(v-if='!disabled')
    TaInputNumber.min-w-10(v-model:value='localValue.estimate_amount_min', addonAfter='万元', :size='finalSize')
    .mx-2 ~
    TaInputNumber.min-w-10(v-model:value='localValue.estimate_amount_max', addonAfter='万元', :size='finalSize')
  template(v-else)
    .value {{ (Number(localValue.estimate_amount_min) || 0).toFixed(2) }} ~ {{ (Number(localValue.estimate_amount_max) || 0).toFixed(2) }} 万元
</template>

<style lang="stylus" scoped></style>
