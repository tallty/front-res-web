<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
const TaColorInput = defineComponent({
  name: 'TaColorInput',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    value: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    return {
      ...toRefs(props),
      localValue,
    };
  },
});
export default TaColorInput;
</script>

<template lang="pug">
.ta-color-input
  template(v-if='!disabled')
    .flex.items-center
      a-input(v-model:value='localValue', type='color')
      .ml-2
        a-input(v-model:value='localValue')
  template(v-else)
    .value(:style='{ background: localValue || defaultValue }')
</template>

<style lang="stylus" scoped>
.ta-color-input
  height 40px
  width 200px
  .value
    height 20px
</style>
