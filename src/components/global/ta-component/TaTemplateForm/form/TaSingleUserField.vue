<script lang="ts">
import { defineComponent, toRefs, computed, PropType, WritableComputedRef } from 'vue';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';

const TaSingleUserField = defineComponent({
  name: 'TaSingleUserField',
  components: {},
  props: {
    value: { type: Number, required: true },
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const localValue: WritableComputedRef<number[]> = computed({
      get: () => [props.value],
      set: val => emit('update:value', val[0]),
    });

    return {
      ...toRefs(props),
      localValue,
    };
  },
});
export default TaSingleUserField;
</script>

<template lang="pug">
.ta-forms-template-field
  TaUserField(v-model:value='localValue', :item='item', :disabled='disabled', :multiple='false')
</template>

<style lang="stylus" scoped></style>
