<script lang="ts">
import { defineComponent, toRefs, PropType, computed, watch } from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import { get, set } from 'lodash';
import { useGetFormValueReactive } from '../../ta-template-form-core/useGetFormValue';

const TaTemplateFormDesignerDefaultValueConfig = defineComponent({
  name: 'TaTemplateFormDesignerDefaultValueConfig',
  components: {},
  props: {
    value: { type: Object as PropType<TaTemplateFormItem>, required: true },
    template: { type: Object as PropType<TaTemplateFormItem>, required: true },
  },
  emits: ['update:value', 'update:template'],
  setup(props, { emit }) {
    const field = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const localTemplate = computed({
      get: () => props.template,
      set: val => emit('update:template', val),
    });

    const { valueKey } = useGetFormValueReactive(field);

    const createDefaultValue = computed({
      get: () => ({
        defaultValue: get(localTemplate.value.model?.create_default_value || {}, valueKey.value),
      }),
      set: val => {
        if (!localTemplate.value.model) localTemplate.value.model = {};
        if (!localTemplate.value.model.create_default_value)
          localTemplate.value.model.create_default_value = {};
        set(localTemplate.value.model.create_default_value, valueKey.value, val.defaultValue);
      },
    });

    const updateDefaultValue = computed({
      get: () => ({
        defaultValue: get(localTemplate.value.model?.update_default_value || {}, valueKey.value),
      }),
      set: val => {
        if (!localTemplate.value.model) localTemplate.value.model = {};
        if (!localTemplate.value.model.update_default_value)
          localTemplate.value.model.update_default_value = {};
        set(localTemplate.value.model.update_default_value, valueKey.value, val.defaultValue);
      },
    });

    const defaultValue = computed({
      get: () => ({ defaultValue: field.value.options?.defaultValue }),
      set: val => {
        if (!field.value.options) field.value.options = {};
        field.value.options.defaultValue = val.defaultValue;
      },
    });

    return {
      ...toRefs(props),
      field,
      createDefaultValue,
      updateDefaultValue,
      defaultValue,
      valueKey,
    };
  },
});
export default TaTemplateFormDesignerDefaultValueConfig;
</script>

<template lang="pug">
.ta-template-form-designer-default-value-config
  .form-item
    .form-item-label 创建时默认值({ defaultValue: xxx })
    TaJsonEditorWithButton(v-model:value='createDefaultValue')
  .form-item
    .form-item-label 编辑时默认值({ defaultValue: xxx })
    TaJsonEditorWithButton(v-model:value='updateDefaultValue')
  .form-item
    .form-item-label 默认值({ defaultValue: xxx }), 优先级低
    TaJsonEditorWithButton(v-model:value='defaultValue')
</template>

<style lang="stylus" scoped>
.ta-template-form-designer-default-value-config
  .form-item
    margin-top 20px
    width 100%
    .form-item-label
      margin-bottom 8px
      color #808080
      font-weight 400
      font-size 14px
      line-height 20px
</style>
