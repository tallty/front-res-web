<script lang="ts">
import { defineComponent, toRefs, computed, PropType } from 'vue';
import { TaConditionType } from '../types';
import { TaConditionTypeConfigMapping } from './TaConditionEditor.vue';
import { TaTemplateFormSelect } from '../../ta-template-form-core/types';

export const TaConditionLifecycleRailsComOptions = [
  { label: '对象创建后', value: 'after_create' },
  { label: '对象保存后', value: 'after_save' },
];

const TaConditionLifecycleEditor = defineComponent({
  name: 'TaConditionLifecycleEditor',
  components: {},
  props: {
    value: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
    lifecycleOptions: {
      type: Array as PropType<TaTemplateFormSelect[]>,
      default: () => [
        ...TaConditionLifecycleRailsComOptions,
        // ...TaConditionLifecycleRailsBpmOptions,
      ],
    },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: value => emit('update:value', value),
    });

    const label = TaConditionTypeConfigMapping[TaConditionType.Lifecycle].label;

    const valueLabel = computed(() => {
      return props.lifecycleOptions.find(
        (item: TaTemplateFormSelect) => item.value === localValue.value.lifecycle,
      )?.label;
    });

    return {
      ...toRefs(props),
      localValue,
      label,
      valueLabel,
    };
  },
});
export default TaConditionLifecycleEditor;
</script>

<template lang="pug">
TaActionCapsuleEditor(
  v-model:value='localValue',
  :label='label',
  :disabled='disabled'
  :disableName='true'
)
  .ta-condition-function-editor.cursor-pointer.ellipsis
    | {{ valueLabel || '请选择' }}

  template(#editor='{ formData, updateFormData, disabled }')
    .mx-4
      TaSelect(
        :value='formData.lifecycle',
        :options='lifecycleOptions',
        :item='{ options: { placeholder: `请选择${label}` }}',
        :disabled='disabled',
        @update:value='updateFormData({ ...formData, lifecycle: $event })',
      )
</template>

<style lang="stylus" scoped></style>
