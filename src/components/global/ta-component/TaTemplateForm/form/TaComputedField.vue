<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed, watch } from 'vue';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';
import { Function } from 'eval5';

const TaComputedField = defineComponent({
  name: 'TaComputedField',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    value: { type: String, default: '' },
    computedFunc: { type: String, default: '' },
    payload: { type: Object, required: true },
    template: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => {
        emit('update:value', val);
      },
    });

    const func = computed(() => props.computedFunc || props.item.options?.computedFunc);

    const computeValue = () => {
      try {
        return new (Function as any)(
          `"use strict"; try { return ${func.value} } catch (error) { console.log(error); return undefined }`,
        ).bind({
          payload: props.payload,
          template: props.template,
        })();
      } catch {
        return undefined;
      }
    };

    watch(
      () => props.payload,
      () => {
        localValue.value = computeValue();

      },
      { deep: true, immediate: true },
    );

    return {
      ...toRefs(props),
      localValue,
    };
  },
});
export default TaComputedField;
</script>

<template lang="pug">
.ta-computed-field
  | {{ localValue }}
</template>

<style lang="stylus" scoped></style>
