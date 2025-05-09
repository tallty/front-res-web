<script lang="ts">
import { defineComponent, toRefs, PropType, computed, nextTick, ref } from 'vue';
import { useFmtNumber } from '../../utils/useFmtNumber';
import {
  FormItemSize,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';

const TaInputNumber = defineComponent({
  name: 'TaInputNumber',
  components: {},
  emits: ['update:value', 'change', 'syncValue'],
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    value: { type: Number, default: null },
    disabled: { type: Boolean, default: false },
    formatter: { type: Function, default: undefined },
    parser: { type: Function, default: undefined },
    precision: { type: Number, default: undefined },
    maxlength: { type: Number, default: undefined },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    size: { type: String as PropType<FormItemSize>, default: () => 'regular' },
    formatterFail: { type: Boolean, default: () => false },
    addonAfter: { type: String, default: '' },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => {
        emit('update:value', val);
      },
    });

    const finalSize = computed(() => {
      if (props.item?.options?.size) {
        return props.item.options.size;
      }
      return props.size;
    });

    const finalAddonAfter = computed(() => {
      if (props.item?.options?.unit) {
        return props.item.options.unit;
      }
      return props.addonAfter;
    });

    const calPadding = computed(() => {
      switch (finalSize.value) {
        case 'regular':
          return '11px 16px';
        case 'small':
          return '7px 16px';
        case 'large':
          return '15px 16px';
        default:
          return '11px 16px';
      }
    });

    const max = computed(() => {
      if (props.max) return props.max;
      if (props.item.options?.max === 0) {
        return 0;
      } else if (props.item.options?.max) {
        return props.item.options?.max;
      } else {
        return Infinity;
      }
    });

    const min = computed(() => {
      if (props.min || props.min === 0) return props.min;
      if (props.item.options?.min === 0) {
        return 0;
      } else if (props.item.options?.min) {
        return props.item.options?.min;
      } else {
        return -Infinity;
      }
    });

    const { thousandSeparator, amountToChinese } = useFmtNumber()
    const thousandSeparatorIfNeed = (value: number) => {
      if (!value) return value;

      if (props.item.options?.thousand_separator) {
        return thousandSeparator(value)
      }
      return value
    }
    const amountToChineseIfNeed = (value: number) => {
      if (props.item.options?.amount_to_chinese) {
        return `(${amountToChinese(value)})`
      }
      return ''
    }
    const prefixIfNeed = () => {
      return props.item.options?.prefix || ''
    }

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

    const onBlur = () => {
      nextTick(() => {
        emit('syncValue', props.item, localValue.value);
      });
    };

    const handleChange = (v: number) => {
      emit('change', v);
    };

    return {
      ...toRefs(props),
      localValue,
      max,
      min,
      onBlur,
      calPadding,
      flag,
      validate,
      handleChange,
      finalAddonAfter,
      thousandSeparatorIfNeed,
      amountToChineseIfNeed,
      prefixIfNeed,
    };
  },
});
export default TaInputNumber;
</script>

<template lang="pug">
.ta-input-number(:class="{'warn-state':  formatterFail || !flag}")
  template(v-if='!disabled')
    a-input-number.input(
      v-model:value='localValue',
      :formatter='formatter',
      :parser='parser',
      :min='min',
      :max='max',
      :maxlength='item.options?.maxLength || maxlength',
      :precision='precision',
      :placeholder='item.options?.placeholder || `请输入${item.name || ""}`',
      @blur='onBlur',
      @change="handleChange",
      :style="{'--inputPadding': calPadding}"
    )
      template(#addonAfter, v-if='finalAddonAfter')
        span {{ finalAddonAfter }}
  template(v-else)
    .value {{prefixIfNeed()}}{{ thousandSeparatorIfNeed(localValue === 0 ? 0 : (localValue)) }} {{ finalAddonAfter }} {{amountToChineseIfNeed(localValue)}}
</template>

<style lang="stylus" scoped>
.ta-input-number
  width 100%
  >>>.ant-input-number
    background #F9FAFB !important
    padding var(--inputPadding) !important
    border-radius 8px
    color #111928
  >>>.ant-input-number-input::placeholder
    color: rgba(0, 0, 0, 0.25)
    font-size 14px
    font-weight 400
  >>>.ant-input-number-group-addon
    color #6B7280
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  >>>.ant-input-number-handler-wrap
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;

  >>>.ant-input-number-input-wrap
    height 20px !important
    min-width 1rem
    input
      height 20px !important
      padding 0 !important
  .input
    width 100%

.warn-state
  >>>.ant-input-number
    background #FDF2F2 !important
  >>>.ant-input-number-group-addon
    background #FDF2F2 !important
  >>>.ant-input-number-input
    color: #E02424

  >>>.ant-input-number-input::placeholder
    color: #E02424

  >>>.ant-input-number-group-addon
    color #E02424 !important
</style>
