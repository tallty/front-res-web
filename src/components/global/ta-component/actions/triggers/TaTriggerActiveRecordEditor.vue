<script lang="ts">
import { defineComponent, toRefs, computed, PropType } from 'vue';
import { TaTriggerTypeConfigMapping } from './TaTriggerEditor.vue';
import { TaTriggerType } from '../types';
import { getTriggerActiveRecordTemplateFn } from './template';
import { TaTemplateFormSelect } from '../../ta-template-form-core/types';

const TaTriggerActiveRecordEditor = defineComponent({
  name: 'TaTriggerActiveRecordEditor',
  components: {},
  props: {
    value: { type: Object, required: true },
    dataFormOptions: { type: Array as PropType<TaTemplateFormSelect[]>, default: () => [] },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: value => emit('update:value', value),
    });

    const label = TaTriggerTypeConfigMapping[TaTriggerType.ActiveRecord].label;

    const placeholder = computed(() => {
      if (localValue.value.name) {
        return localValue.value.name;
      }

      // if (localValue.value.callback_class_name && localValue.value.callback_method) {
      //   return `${localValue.value.callback_class_name} ${localValue.value.callback_method}`;
      // }

      return `请输入 ${label}`;
    });

    return {
      ...toRefs(props),
      localValue,
      label,
      getTriggerActiveRecordTemplateFn,
      placeholder,
    };
  },
});
export default TaTriggerActiveRecordEditor;
</script>

<template lang="pug">
TaActionCapsuleEditor(
  v-model:value='localValue',
  :label='label',
  :disabled='disabled'
)
  .ta-trigger-active-record-editor.cursor-pointer.ellipsis
    | {{ placeholder }}

  template(#editor='{ formData, updateFormData, disabled }')
    TaTemplateForm(
      :modelValue='formData',
      :template='getTriggerActiveRecordTemplateFn(dataFormOptions)'
      :disabled='disabled',
      @update:modelValue='updateFormData',
    )
</template>

<style lang="stylus" scoped></style>
