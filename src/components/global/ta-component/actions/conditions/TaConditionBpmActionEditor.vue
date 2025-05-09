<script lang="ts">
import { defineComponent, toRefs, computed, PropType } from 'vue';
import { TaConditionType } from '../types';
import { TaConditionTypeConfigMapping } from './TaConditionEditor.vue';
import { TaTemplateFormSelect } from '../../ta-template-form-core/types';
import { TokenModel } from '../../../../../engines/bpm/bpm-core/apis/user/token.api';
import { TaConditionBpmActionRailsBpmOptions } from './template';

const TaConditionBpmActionEditor = defineComponent({
  name: 'TaConditionBpmActionEditor',
  components: {},
  props: {
    value: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
    lifecycleOptions: {
      type: Array as PropType<TaTemplateFormSelect[]>,
      default: () => [
        // ...TaConditionBpmActionRailsComOptions,
        ...TaConditionBpmActionRailsBpmOptions,
      ],
    },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: value => emit('update:value', value),
    });

    const label = TaConditionTypeConfigMapping[TaConditionType.BpmAction]?.label;

    const valueLabel = computed(() => {
      const lifecycle = props.lifecycleOptions.find(
        (item: TaTemplateFormSelect) => item.value === localValue.value.lifecycle,
      )?.label;

      const action = actionOptions.value.find(
        (item: TaTemplateFormSelect) => item.value === localValue.value.action,
      )?.label;

      return lifecycle && action ? `【${action}】${lifecycle}` : '请选择';
    });

    const actionOptions = computed(() =>
      Object.keys(TokenModel.tokenActionZhMap()).reduce(
        (out: TaTemplateFormSelect[], key: string) => {
          out.push({
            label: TokenModel.tokenActionZhMap()[key],
            value: key,
          });
          return out;
        },
        [],
      ),
    );

    return {
      ...toRefs(props),
      localValue,
      label,
      valueLabel,
      actionOptions,
    };
  },
});
export default TaConditionBpmActionEditor;
</script>

<template lang="pug">
TaActionCapsuleEditor(
  v-model:value='localValue',
  :label='label',
  :disabled='disabled',
  :disableName='true'
)
  .ta-condition-function-editor.cursor-pointer.ellipsis
    | {{ valueLabel || '请选择' }}

  template(#editor='{ formData, updateFormData, disabled }')
    .mx-4
      TaSelect(
        :value='formData.lifecycle',
        :options='lifecycleOptions',
        :item='{ options: { placeholder: `请选择${label}` } }',
        :disabled='disabled',
        @update:value='updateFormData({ ...formData, lifecycle: $event })'
      )

      .text-gray-800.py-2 工作流操作

      TaSelect(
        :value='formData.action',
        :options='actionOptions',
        :item='{ options: { placeholder: `请选择工作流操作` } }',
        :disabled='disabled',
        @update:value='updateFormData({ ...formData, action: $event })'
      )
</template>

<style lang="stylus" scoped></style>
