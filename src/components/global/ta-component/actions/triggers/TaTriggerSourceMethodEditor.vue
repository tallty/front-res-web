<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import { TaTriggerTypeConfigMapping } from './TaTriggerEditor.vue';
import { TaTriggerType } from '../types';
import { TriggerSourceMethodTemplate } from './template';

const TaTriggerSourceMethodEditor = defineComponent({
  name: 'TaTriggerSourceMethodEditor',
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

    const label = TaTriggerTypeConfigMapping[TaTriggerType.SourceMethod].label;

    const placeholder = computed(() => {
      if (localValue.value.name) {
        return localValue.value.name;
      }

      if (localValue.value.method) {
        return localValue.value.method;
      }

      return `请输入${label}`;
    });

    return {
      ...toRefs(props),
      localValue,
      label,
      TriggerSourceMethodTemplate,
      placeholder,
    };
  },
});
export default TaTriggerSourceMethodEditor;
</script>

<template lang="pug">
TaActionCapsuleEditor(
  v-model:value='localValue',
  :label='label',
  :disabled='disabled'
)
  .ta-trigger-function-editor.cursor-pointer.ellipsis
    | {{ placeholder }}

  template(#editor='{ formData, updateFormData, disabled }')
    TaTemplateForm(
      :modelValue='formData',
      :template='TriggerSourceMethodTemplate'
      :disabled='disabled',
      @update:modelValue='updateFormData',
    )
</template>

<style lang="stylus" scoped></style>
