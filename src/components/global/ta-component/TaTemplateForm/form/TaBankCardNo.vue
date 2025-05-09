<script lang="ts">
import { defineComponent, toRefs, PropType, computed, nextTick, ref } from 'vue';
import {
  FormItemSize,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';

const TaBankCardNo = defineComponent({
  name: 'TaBankCardNo',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({ options: {} }) },
    value: { type: String, default: () => undefined },
    disabled: { type: Boolean, default: false },
    defaultValue: { type: String, default: '' },
    size: { type: String as PropType<FormItemSize>, default: () => 'regular' },
  },
  emits: ['update:value', 'syncValue'],
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => {
        const value = Array.isArray(val) ? val[0] : val;
        emit('update:value', value);
      },
    });

    const finalSize = computed(() => {
      if (props.item?.options?.size) {
        return props.item.options.size;
      }
      return props.size;
    });

    const calPadding = computed(() => {
      switch (finalSize.value) {
        case 'regular':
          return '10px 16px';
        case 'small':
          return '6px 16px';
        case 'large':
          return '14px 16px';
        default:
          return '10px 16px';
      }
    });

    const isHref = computed(() => {
      const value = localValue.value || props.defaultValue;
      return value && typeof value === 'string' && value.trim().startsWith('http');
    });

    const onBlur = () => {
      nextTick(() => {
        emit('syncValue', props.item, localValue.value);
      });
    };

    // 组件验证状态
    // 通过flag 改变css 的部分样式 【仅有部分组件需要 如input类型类的，需要改变边框 css样式型的】
    const flag = ref(true);
    const validate = async () => {
      if (props.value && props.value.trim()) {
        const reg = /^[1-9]\d{8,29}$/;

        const res = reg.test(localValue.value as string);
        if (!res) {
          flag.value = false;
          return Promise.reject('请输入正确的银行卡号');
        }
      }
      if (props.item?.options?.required) {
        if (props.value && props.value.trim()) {
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

    const phoneChange = (e: Event) => {
      const value = (e.target as HTMLInputElement).value.trim().replace(/[^\d]/g, '');
      localValue.value = value;
      flag.value = true;
    };

    return {
      ...toRefs(props),
      localValue,
      isHref,
      onBlur,
      finalSize,
      calPadding,
      validate,
      flag,
      phoneChange,
    };
  },
});
export default TaBankCardNo;
</script>

<template lang="pug">
.ta-input(:class="{'warn-state': !flag}")
  template(v-if='!disabled')
    a-input(
      :value='localValue',
      :defaultValue='defaultValue',
      :addonAfter='item.options?.unit',
      :placeholder='item.options?.placeholder || `请输入${item.name || ""}`',
      @input='phoneChange',
      :maxlength='18'
      @blur='onBlur'
      allowClear
      :style="{'--inputPadding': calPadding}"
    )
      template(v-if='item.options?.prefixIcon' #prefix)
        TaIcon(:type="item.options?.prefixIcon")

  template(v-else)
    .value(v-if='isHref')
      a(:href='localValue || defaultValue',  target="_blank") {{ localValue || defaultValue }}
</template>

<style lang="stylus" scoped>
.value
  word-break break-all
.ta-input
  >>>.ant-input
    background #F9FAFB !important
    border 1px solid #D1D5DB;
    border-radius 8px
    padding 0 !important
    color #111928
  >>>.ant-input::placeholder
    color: #6B7280
    font-size 14px
    font-weight 400
  >>>.ant-input-affix-wrapper
    background #F9FAFB !important
    padding var(--inputPadding) !important
    border-radius 8px
.warn-state
  >>>.ant-input
    background #FDF2F2 !important
  >>>.ant-input
    color: #E02424
  >>>.ant-input::placeholder
    color: #E02424
  >>>.ant-input-affix-wrapper
    background #FDF2F2 !important
</style>
