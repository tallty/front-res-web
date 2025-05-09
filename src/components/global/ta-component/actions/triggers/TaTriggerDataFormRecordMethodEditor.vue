<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import { TaTriggerTypeConfigMapping } from './TaTriggerEditor.vue';
import { TaTriggerType } from '../types';
import { TriggerDataFormRecordMethodTemplate } from './template';

const TaTriggerDataFormRecordMethodEditor = defineComponent({
  name: 'TaTriggerDataFormRecordMethodEditor',
  components: {},
  props: {
    value: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: value => emit('update:value', value),
    });

    const label = TaTriggerTypeConfigMapping[TaTriggerType.DataFormRecordMethod].label;

    const placeholder = computed(() => {
      if (localValue.value.name) {
        return localValue.value.name;
      }

      if (localValue.value.callback_method) {
        return localValue.value.callback_method;
      }

      return `请输入${label}`;
    });

    return {
      ...toRefs(props),
      localValue,
      label,
      TriggerDataFormRecordMethodTemplate,
      placeholder,
    };
  },
});
export default TaTriggerDataFormRecordMethodEditor;
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
      :template='TriggerDataFormRecordMethodTemplate'
      :disabled='disabled',
      @update:modelValue='updateFormData',
    )
</template>

<style lang="stylus" scoped></style>
