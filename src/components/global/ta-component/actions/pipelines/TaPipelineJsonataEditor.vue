<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import { TaPipelineTypeConfigMapping } from './TaPipelineEditor.vue';
import { TaPipelineType } from '../types';

const TaPipelineJsonataEditor = defineComponent({
  name: 'TaPipelineJsonataEditor',
  components: {},
  props: {
    value: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: value => emit('update:value', value),
    });

    const label = TaPipelineTypeConfigMapping[TaPipelineType.Jsonata].label;

    return {
      ...toRefs(props),
      localValue,
      label,
    };
  },
});
export default TaPipelineJsonataEditor;
</script>

<template lang="pug">
TaActionCapsuleEditor(
  v-model:value='localValue',
  :label='label',
  :disabled='disabled'
)
  .ta-pipeline-jsonata-editor.cursor-pointer.ellipsis.max-w-100
    | {{ localValue.formula || `请输入 ${label}` }}

  template(#editor='{ formData, updateFormData, disabled }')
    TaTextarea.mx-4(
      :value='formData.formula',
      :item='{ options: { placeholder: `请输入 ${label}` }}',
      :disabled='disabled',
      @update:value='updateFormData({ ...formData, formula: $event })',
    )
</template>

<style lang="stylus" scoped></style>
