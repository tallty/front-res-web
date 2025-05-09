<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import { TaPipelineTypeConfigMapping } from './TaPipelineEditor.vue';
import { TaPipelineType } from '../types';
import { PipelineFunctionTemplate } from './template';

const TaPipelineFunctionEditor = defineComponent({
  name: 'TaPipelineFunctionEditor',
  components: {},
  props: {
    value: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: value => emit('update:value', value),
    });

    const label = TaPipelineTypeConfigMapping[TaPipelineType.Function].label;

    const placeholder = computed(() => {
      if (localValue.value.name) {
        return localValue.value.name;
      }

      if (localValue.value.callback_class_name && localValue.value.callback_method) {
        return `${localValue.value.callback_class_name} ${localValue.value.callback_method}`;
      }

      return `请输入 ${label}`;
    });

    return {
      ...toRefs(props),
      localValue,
      label,
      PipelineFunctionTemplate,
      placeholder,
    };
  },
});
export default TaPipelineFunctionEditor;
</script>

<template lang="pug">
TaActionCapsuleEditor(
  v-model:value='localValue',
  :label='label',
  :disabled='disabled'
)
  .ta-pipeline-function-editor.cursor-pointer.ellipsis
    | {{ placeholder }}

  template(#editor='{ formData, updateFormData, disabled }')
    TaTemplateForm(
      :modelValue='formData',
      :template='PipelineFunctionTemplate'
      :disabled='disabled',
      @update:modelValue='updateFormData',
    )
</template>

<style lang="stylus" scoped></style>
