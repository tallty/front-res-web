<script lang="ts">
import { defineComponent, toRefs, PropType, computed, ref } from 'vue';
import {
  FormItemSize,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';
import { VObject } from '@/lib/vails';

const TaInputNumberPercent = defineComponent({
  name: 'TaInputNumberPercent',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    value: { type: Number, default: null },
    disabled: { type: Boolean, default: false },
    precision: { type: Number, default: 2 },
    size: { type: String as PropType<FormItemSize>, default: () => 'regular' },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => (props.value ? Number((props.value * 100).toFixed(props.precision)) : props.value),
      set: val => emit('update:value', Number((val / 100).toFixed(props.precision + 2))),
    });

    const finalSize = computed(() => {
      if (props.item?.options?.size) {
        return props.item.options.size;
      }
      return props.size;
    });

    // 组件验证状态
    // 通过flag 改变css 的部分样式 【仅有部分组件需要 如input类型类的，需要改变边框 css样式型的】
    const flag = ref(true);
    const validate = async () => {
      if (props.item?.options?.required) {
        if (typeof props.value === 'number') {
          flag.value = true;
          return Promise.resolve();
        } else {
          flag.value = false;
          return Promise.reject(`请输入${props.item?.name}`);
        }
      } else {
        flag.value = true;
        return Promise.resolve();
      }
    };

    const calItem = computed(() => {
      const newItem: VObject = props.item;
      newItem.options.max = newItem.options?.max * 100 || null;
      newItem.options.min = newItem.options?.min * 100 || null;

      return newItem;
    });

    return {
      ...toRefs(props),
      localValue,
      finalSize,
      flag,
      validate,
      calItem,
    };
  },
});
export default TaInputNumberPercent;
</script>

<template lang="pug">
.ta-input-number-percent
  template(v-if='!disabled')
    TaInputNumber(
      v-model:value='localValue',
      :disabled='disabled',
      :formatter="value => value ? `${value}%` : ''"
      :parser="value => value.replace('%', '')"
      :size="finalSize"
      :formatterFail="!flag"
      :item="calItem"
    )
  template(v-else)
    .value {{ localValue === 0 ? 0 : (localValue) }} %
</template>

<style lang="stylus" scoped>
.ta-input-number-percent
  width 100%
//   >>>.ant-input-number
//     background #F9FAFB !important
//     padding var(--inputPadding) !important
//     border-radius 8px
//   >>>.ant-input-number-group-addon
//     color #6B7280
//     border-top-right-radius: 8px;
//     border-bottom-right-radius: 8px;
//   >>>.ant-input-number-handler-wrap
//     border-top-right-radius: 8px;
//     border-bottom-right-radius: 8px;

//   >>>.ant-input-number-input-wrap
//     height 20px !important
//     input
//       height 20px !important
//       padding 0 !important
//   .input
//     width 100%

// .warn-state
//   >>>.ant-input-number
//     background #FDF2F2 !important
//   >>>.ant-input-number-group-addon
//     background #FDF2F2 !important
//   >>>.ant-input-number-input::placeholder
//     color: #E02424

//   >>>.ant-input-number-group-addon
//     color #E02424 !important
</style>
