<script lang="ts">
import { defineComponent, toRefs, computed, PropType, nextTick, ref } from 'vue';
import {
  FormItemSize,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';

const TaTextarea = defineComponent({
  name: 'TaTextarea',
  components: {},
  props: {
    value: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({ options: {} }) },
    defaultValue: { type: String, default: '' },
    size: { type: String as PropType<FormItemSize>, default: () => 'regular' },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => {
        emit('update:value', val);
      },
    });

    // size 需要实现【】
    const finalSize = computed(() => {
      if (props.item?.options?.size) {
        return props.item.options.size;
      }
      return props.size;
    });
    // const validate = () => {
    //   let minLength = props.item.options?.minLength || 0;
    //   return new Promise<void>((resolve, reject) => {
    //     if (props.item.type === 'textarea' && minLength && props.value.length) {
    //       if (props.value.length < minLength) {
    //         reject(`字数必须 ≥ ${minLength} 个`);
    //       } else {
    //         resolve();
    //       }
    //     }
    //   });
    // };

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
        if (props.value.trim()) {
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
    return {
      ...toRefs(props),
      localValue,
      validate,
      onBlur,
      finalSize,
    };
  },
});
export default TaTextarea;
</script>

<template lang="pug">
.ta-textarea
  template(v-if='!disabled')
    a-textarea(
      v-model:value='localValue',
      :name='item.key',
      :autoSize='{ minRows: 4 }',
      :disabled='disabled',
      :placeholder='item.options.placeholder || `请输入${item.name || ""}`',
      :maxlength='item.options?.maxLength',
      :defaultValue='defaultValue'
      @blur='onBlur'
      :showCount='item.options?.maxLength'
    )
  template(v-else)
    .value {{ localValue || defaultValue }}
</template>

<style lang="stylus" scoped>
.value
  word-break break-all
  white-space break-spaces
.ta-textarea
  >>>.ant-input
    padding 13px 16px
    border 1px solid #D1D5DB;
    border-radius 8px
    background #F9FAFB !important
    color #111928
  >>>.ant-input::placeholder
    color: rgba(0, 0, 0, 0.25)
    font-size 14px
</style>
