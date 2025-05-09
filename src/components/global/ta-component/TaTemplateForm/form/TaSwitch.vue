<script lang="ts">
import { defineComponent, toRefs, PropType, computed, watchEffect } from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
const TaSwitch = defineComponent({
  name: 'TaSwitch',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: false },
    value: { type: Boolean as PropType<any>, default: false },
    disabled: { type: Boolean, default: false },
    size: { type: String, default: 'default' },
    trueLabel: { type: String, default: '开' },
    falseLabel: { type: String, default: '关' },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const getSelectedValue = (bool: boolean) => {
      const index = bool ? 0 : 1;
      return (
        props.item?.options?.select?.[index]?.value || props.item?.options?.select?.[index]?.label
      );
    };
    const localValue = computed({
      get: () => {
        if (getSelectedValue(true) === props.value) return true;
        if (getSelectedValue(false) === props.value) return false;
        return props.value;
      },
      set: val => {
        if (getSelectedValue(true) && getSelectedValue(false)) {
          emit('update:value', val ? getSelectedValue(true) : getSelectedValue(false));
        } else {
          emit('update:value', val);
        }
      },
    });

    // watchEffect(() => console.log(props.value, localValue.value));
    return {
      ...toRefs(props),
      localValue,
      getSelectedValue,
    };
  },
});
export default TaSwitch;
</script>

<template lang="pug">
.ta-date-picker
  template(v-if='!disabled')
    a-switch(
      :checked-children='getSelectedValue(true) || trueLabel',
      :un-checked-children='getSelectedValue(false) || falseLabel',
      v-model:checked='localValue',
      :name='item.key',
      :option.initialValue='localValue',
      :disabled='disabled',
      :size='size'
    )
  template(v-else)
    a-switch(:checked='localValue', :disabled='true')
</template>

<style lang="stylus" scoped></style>
