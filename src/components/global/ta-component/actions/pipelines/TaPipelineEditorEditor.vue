<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import { TaPipelineTypeConfigMapping } from './TaPipelineEditor.vue';
import { TaPipelineType } from '../types';

const TaPipelineEditorEditor = defineComponent({
  name: 'TaPipelineEditorEditor',
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

    const label = TaPipelineTypeConfigMapping[TaPipelineType.Editor].label;

    return {
      ...toRefs(props),
      localValue,
      label,
    };
  },
});
export default TaPipelineEditorEditor;
</script>

<template lang="pug">
TaActionCapsuleEditor(
  v-model:value='localValue',
  :label='label',
  :disabled='disabled'
)
  .ta-pipeline-editor-editor.cursor-pointer.ellipsis.max-w-100
    | {{ localValue.name || '点击查看' }}

  template(#editor='{ formData, updateFormData, disabled }')
    //- TaTextarea.mx-4(
    //-   :value='formData.data',
    //-   :item='{ options: { placeholder: `请输入 ${label}` }}',
    //-   :disabled='disabled',
    //-   @update:value='updateFormData({ ...formData, data: $event })',
    //- )
</template>

<style lang="stylus" scoped></style>
