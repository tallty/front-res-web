<script lang="ts">
import { defineComponent, toRefs, PropType, computed, onMounted } from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';

const TaFixedValueField = defineComponent({
  name: 'TaFixedValueField',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    value: { type: [String, Array], default: '' },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    onMounted(() => {
      localValue.value = props.item.options?.defaultValue;
    });

    return {
      ...toRefs(props),
      localValue,
    };
  },
});
export default TaFixedValueField;
</script>

<template lang="pug">
.ta-fixed-value-field.h-10
  | {{ localValue }}
</template>

<style lang="stylus" scoped></style>
