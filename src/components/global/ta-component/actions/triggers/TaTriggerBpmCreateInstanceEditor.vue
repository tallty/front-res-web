<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import { TaTriggerTypeConfigMapping } from './TaTriggerEditor.vue';
import { TaTriggerType } from '../types';
import { TriggerBpmCreateInstanceTemplate } from './template';

const TaTriggerBpmCreateInstanceEditor = defineComponent({
  name: 'TaTriggerBpmCreateInstanceEditor',
  components: {},
  props: {
    value: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: value => emit('update:value', value),
    });

    const label = TaTriggerTypeConfigMapping[TaTriggerType.BpmCreateInstance].label;

    const placeholder = computed(() => {
      if (localValue.value.name) {
        return localValue.value.name;
      }

      // if (localValue.value.callback_method) {
      //   return localValue.value.callback_method;
      // }

      return `${label}`;
    });

    return {
      ...toRefs(props),
      localValue,
      label,
      TriggerBpmCreateInstanceTemplate,
      placeholder,
    };
  },
});
export default TaTriggerBpmCreateInstanceEditor;
</script>

<template lang="pug">
TaActionCapsuleEditor(
  v-model:value='localValue',
  :label='label',
  :disabled='disabled'
)
  .ta-trigger-data-form-record-method-editor.cursor-pointer.ellipsis
    | {{ placeholder }}

  template(#editor='{ formData, updateFormData, disabled }')
    TaTemplateForm(
      :modelValue='formData',
      :template='TriggerBpmCreateInstanceTemplate'
      :disabled='disabled',
      @update:modelValue='updateFormData',
    )
</template>

<style lang="stylus" scoped></style>
