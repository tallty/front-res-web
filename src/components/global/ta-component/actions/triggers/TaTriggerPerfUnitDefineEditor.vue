<script lang="ts">
import { defineComponent, toRefs, computed, watch } from 'vue';
import { TaTriggerTypeConfigMapping } from './TaTriggerEditor.vue';
import { TaTriggerType } from '../types';
import { TriggerPerfUnitDefineTemplate } from './template';

const TaTriggerPerfUnitDefineEditor = defineComponent({
  name: 'TaTriggerPerfUnitDefineEditor',
  components: {},
  props: {
    value: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: value => emit('update:value', value),
    });

    const label = TaTriggerTypeConfigMapping[TaTriggerType.PerfUnitDefine].label;

    const placeholder = computed(() => {
      if (localValue.value.name) {
        return localValue.value.name;
      }

      // if (localValue.value.callback_method) {
      //   return localValue.value.callback_method;
      // }
      if (localValue.value.unit_define_id) {
        return '';
      }

      return `${label}`;
    });

    return {
      ...toRefs(props),
      localValue,
      label,
      TriggerPerfUnitDefineTemplate,
      placeholder,
    };
  },
});
export default TaTriggerPerfUnitDefineEditor;
</script>

<template lang="pug">
TaActionCapsuleEditor(
  v-model:value='localValue',
  :label='label',
  :disabled='disabled'
)
  .ta-trigger-data-form-record-method-editor.cursor-pointer.ellipsis
    .min-w-10.h-full(v-if='placeholder') {{ placeholder }}
    .min-w-10.h-full(v-else)
      TaApiSingleField(
        :value='localValue.unit_define_id',
        :disabled='true',,
        path='/perf/admin/unit_defines'
        :attrs='["name"]'
      )

  template(#editor='{ formData, updateFormData, disabled }')
    TaTemplateForm(
      :modelValue='formData',
      :template='TriggerPerfUnitDefineTemplate'
      :disabled='disabled',
      @update:modelValue='updateFormData',
    )
</template>

<style lang="stylus" scoped></style>
