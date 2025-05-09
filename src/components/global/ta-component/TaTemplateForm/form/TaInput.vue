<script lang="ts">
import { defineComponent, toRefs, PropType, computed, nextTick, ref } from 'vue';
import {
  FormItemSize,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';

const TaInput = defineComponent({
  name: 'TaInput',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({ options: {} }) },
    value: { type: String, default: () => undefined },
    disabled: { type: Boolean, default: false },
    defaultValue: { type: String, default: '' },
    size: { type: String as PropType<FormItemSize>, default: () => 'regular' },
    addonAfter: { type: String, default: '' },
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

    const finalAddonAfter = computed(() => {
      if (props.item?.options?.unit) {
        return props.item.options.unit;
      }
      return props.addonAfter;
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
      if (
        props.item?.options?.minLength &&
        (props.value || ('' as any))?.length < props.item?.options?.minLength
      ) {
        flag.value = false;
        return Promise.reject(
          `输入内容至少需要${props.item?.options?.minLength}个字符，请继续输入。`,
        );
      }
      if (props.item?.options?.required) {
        if (props.value && props.value.trim()) {
          flag.value = false;
          return Promise.reject(`请输入${props.item?.name}`);
        }
      } else {
        flag.value = true;
        return Promise.resolve();
      }
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
      finalAddonAfter,
    };
  },
});
export default TaInput;
</script>

<template lang="pug">
.ta-input.relative(:class="{'warn-state': !flag}")
  template(v-if='!disabled')
    a-input.relative(
      v-model:value='localValue',
      :defaultValue='defaultValue',
      :placeholder='item.options?.placeholder || `请输入${item.name || ""}`',
      :maxlength='item.options?.maxLength'
      @blur='onBlur'
      :style="{'--inputPadding': calPadding}"
      :showCount='!!item.options?.maxLength'
    )
      template(v-if='item.options?.prefixIcon' #prefix)
        TaIcon(:type="item.options?.prefixIcon")

      template(#suffix)
        TaIcon.cursor-pointer(v-if='localValue', type="CloseOutlined", @click="localValue = ''")

      template(v-if='finalAddonAfter' #addonAfter)
        div(style="border-radius: 0 8px 8px 0; background-color: rgba(0, 0, 0, 0.02);") {{ finalAddonAfter }}
  template(v-else)
    .value(v-if='isHref')
      a(:href='localValue || defaultValue',  target="_blank") {{ localValue || defaultValue }}
    .value(v-else) {{ localValue || defaultValue }} {{ finalAddonAfter }}
</template>

<style lang="stylus" scoped>
.value
  // word-break break-all
.ta-input
  >>>.ant-input
    background #F9FAFB !important
    // border 1px solid #D1D5DB;
    border-radius 8px
    padding 0 !important
    color #111928
  >>>.ant-input::placeholder
    color: rgba(0, 0, 0, 0.25)
    font-size 14px
    font-weight 400
  >>>.ant-input-affix-wrapper
    background #F9FAFB !important
    padding var(--inputPadding) !important
    border-radius 8px
    >>>.ant-input::placeholder
      color: rgba(0, 0, 0, 0.25)
      font-size 14px

  >>>.ant-input-group-addon
    div
      color: #6B7280
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
