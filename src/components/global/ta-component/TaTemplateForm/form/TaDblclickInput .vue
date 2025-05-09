<script lang="ts">
import { defineComponent, toRefs, PropType, computed, ref, nextTick } from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';

const TaDblclickInput = defineComponent({
  name: 'TaDblclickInput',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    value: { type: [String, Array], default: '' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:value', 'confirm'],
  setup(props, { emit }) {
    const localValue = computed({
      get: () => (Array.isArray(props.value) ? props.value[0] : props.value),
      set: val => emit('update:value', Array.isArray(val) ? val[0] : val),
    });

    const visible = ref(false);
    const innerValue = ref('');
    const inputRef = ref<any>(null);

    const isHref = computed(() => {
      const value = localValue.value;
      return value && typeof value === 'string' && value.trim().startsWith('http');
    });

    const onCancel = () => {
      innerValue.value = '';
      visible.value = false;
    };

    const onConfirm = () => {
      localValue.value = innerValue.value;
      emit('confirm');
      onCancel();
    };

    const onShowInput = () => {
      visible.value = true;
      innerValue.value = localValue.value as string;
      nextTick(() => inputRef.value?.focus?.());
    };

    return {
      ...toRefs(props),
      localValue,
      isHref,
      visible,
      innerValue,
      inputRef,
      onCancel,
      onConfirm,
      onShowInput,
    };
  },
});
export default TaDblclickInput;
</script>

<template lang="pug">
.ta-dblclick-input.flex-grow
  template(v-if='!disabled')
    .value.w-full(v-if='!visible', @dblclick='onShowInput')
      slot
        .w-full(v-if='isHref')
          a(:href='localValue || defaultValue',  target="_blank") {{ localValue || defaultValue }}
        .w-full(v-else) {{ localValue || defaultValue }} {{ item.options?.unit }}
    a-input.input(
      v-else,
      ref='inputRef'
      v-model:value='innerValue',
      :addonAfter='item.options?.unit',
      :placeholder='item.options?.placeholder || `请输入${item.name || ""}`',
      :maxlength='item.options?.maxLength'
      @keyup.enter='onConfirm',
      @blur='onCancel'
    )
  template(v-else)
    slot
      .value(v-if='isHref')
        a(:href='localValue || defaultValue',  target="_blank") {{ localValue || defaultValue }}
      .value(v-else) {{ localValue || defaultValue }} {{ item.options?.unit }}
</template>

<style lang="stylus" scoped>
.value
  word-break break-all
.input
  padding 0
  border 0
</style>
