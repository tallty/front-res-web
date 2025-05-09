<script lang="ts">
import { defineComponent, toRefs, computed, ref } from 'vue';
import { TaConditionType } from '../types';
import { TaConditionTypeConfigMapping } from './TaConditionEditor.vue';

const TaConditionGroupEditor = defineComponent({
  name: 'TaConditionGroupEditor',
  components: {},
  props: {
    value: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
    dataFormOptions: { type: Array, default: () => [] },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const formData = ref(props.value);
    const label = TaConditionTypeConfigMapping[TaConditionType.Group].label;
    const visible = ref(false);

    return {
      ...toRefs(props),
      localValue,
      visible,
      formData,
      label,
    };
  },
});
export default TaConditionGroupEditor;
</script>

<template lang="pug">
TaActionCapsuleEditor(
  v-model:value='localValue',
  :label='label',
  :disabled='disabled',
  :modelProps='{ width: "90vw" }',
)
  .ta-pipeline-function-editor.cursor-pointer.ellipsis
    | {{ localValue.name || '点击查看' }}

  template(#editor='{ formData, updateFormData, disabled }')
    .w-full.h-70vh.flex.items-center.justify-center.overflow-auto.p-4
      TaConditionGroupEditorTree.py-4(
        :value='formData'
        :disabled='disabled'
        :dataFormOptions='dataFormOptions'
        @update:value='updateFormData'
      )
</template>

<style lang="stylus" scoped></style>
