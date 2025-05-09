<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import { TaConditionTypeConfigMapping } from './TaConditionEditor.vue';
import { TaConditionType } from '../types';
import { TaConditionUserTemplate } from './template';

const TaConditionUserEditor = defineComponent({
  name: 'TaConditionUserEditor',
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

    const label = TaConditionTypeConfigMapping[TaConditionType.User].label;

    return {
      ...toRefs(props),
      localValue,
      label,
      TaConditionUserTemplate,
    };
  },
});
export default TaConditionUserEditor;
</script>

<template lang="pug">
TaActionCapsuleEditor(
  v-model:value='localValue',
  :label='label',
  :disabled='disabled'
)
  .ta-condition-user-editor.cursor-pointer.ellipsis
    | {{ localValue.name || `请选择${label}` }}

  template(#editor='{ formData, updateFormData, disabled }')
    TaTemplateForm(
      :modelValue='formData',
      :template='TaConditionUserTemplate'
      :disabled='disabled',
      @update:modelValue='updateFormData',
    )
</template>

<style lang="stylus" scoped></style>
