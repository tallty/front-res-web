<script lang="ts">
import { defineComponent, toRefs, computed, PropType } from 'vue';
import { TaPipelineType } from '../types';
import { TaPipelineTypeConfigMapping } from './TaPipelineEditor.vue';
import { TaTemplateFormSelect } from '../../ta-template-form-core/types';

const TaPipelineDataFormEditor = defineComponent({
  name: 'TaPipelineDataFormEditor',
  components: {},
  props: {
    value: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
    dataFormOptions: { type: Array as PropType<TaTemplateFormSelect[]>, default: () => [] },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: value => emit('update:value', value),
    });

    const label = TaPipelineTypeConfigMapping[TaPipelineType.DataForm].label;

    const activeDataFormOption = computed(() =>
      props.dataFormOptions.find(
        (item: TaTemplateFormSelect) => item.value === localValue.value.form_conf_seq,
      ),
    );
    const name = computed(() => {
      return localValue.value.form_conf_seq ? activeDataFormOption.value?.label : '';
    });

    return {
      ...toRefs(props),
      localValue,
      label,
      name,
      activeDataFormOption,
    };
  },
});
export default TaPipelineDataFormEditor;
</script>

<template lang="pug">
TaActionCapsuleEditor(
  v-model:value='localValue',
  :label='label',
  :disabled='disabled'
)
  .ta-pipeline-data-form-editor.cursor-pointer.ellipsis.max-w-100
    | {{ localValue.name || name || localValue.form_conf_seq || '点击查看' }}

  template(#editor='{ formData, updateFormData, disabled }')
    .px-4
      TaSelect(
        v-model:value='formData.form_conf_seq',
        :disabled='disabled',
        :options='dataFormOptions',
        @update:value='updateFormData({ ...formData, form_conf_seq: $event })',
      )

      .text-gray-800.py-2 序列号为：

      TaInput(
        v-model:value='formData.form_conf_seq',
        :disabled='disabled',
        @update:value='updateFormData({ ...formData, form_conf_seq: $event })',
      )
    //- TaTextarea.mx-4(
    //-   :value='formData.data',
    //-   :item='{ options: { placeholder: `请输入 ${label}` }}',
    //-   :disabled='disabled',
    //-   @update:value='updateFormData({ ...formData, data: $event })',
    //- )
</template>

<style lang="stylus" scoped></style>
