<script lang="ts">
import { defineComponent, toRefs, PropType, computed, watch } from 'vue';
import getComplexConditionTemplate from './getComplexConditionTemplate';
import {
  TaTemplateFormItem,
  TaTemplateFormComplexCondition,
} from '@/components/global/ta-component/ta-template-form-core/types';
import { BpmNodeConditionOptField } from '@/engines/bpm/components/designer/nodeEditor/ComBpmNodeEditorCondition.vue';

const TaTemplateFormDesignerComplexConditionConfig = defineComponent({
  name: 'TaTemplateFormDesignerComplexConditionConfig',
  components: {},
  props: {
    value: { type: Object as PropType<TaTemplateFormComplexCondition>, required: true },
    defaultErrorMessage: { type: String, default: '请填写' },
    workflowTemplate: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    fieldOpts: { type: Array as PropType<BpmNodeConditionOptField[]>, default: undefined },
  },
  setup(props, { emit }) {
    const complexCondition = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    complexCondition.value = complexCondition.value || {};
    watch(
      complexCondition,
      () => {
        if (complexCondition.value === undefined || Array.isArray(complexCondition.value)) {
          complexCondition.value = { groups: [{ items: [] }] };
        }
      },
      {
        immediate: true,
      },
    );

    const complexConditionTemplate = computed(() =>
      getComplexConditionTemplate(
        props.fieldOpts,
        props.workflowTemplate,
        (_, index) => (index === 0 ? '' : '或'),
        (_, index) => (index === 0 ? '当' : '且'),
      ),
    );

    return {
      ...toRefs(props),
      complexCondition,
      complexConditionTemplate,
    };
  },
});
export default TaTemplateFormDesignerComplexConditionConfig;
</script>

<template lang="pug">
.ta-template-form-designer-complex-condition-config
  TaTemplateForm(
    v-if='complexCondition',
    v-model:modelValue='complexCondition',
    :record='{}',
    :template='complexConditionTemplate'
  )
</template>

<style lang="stylus" scoped>
.ta-template-form-designer-complex-condition-config
  >>> .ta-template-form-field
    margin 10px 0
  >>> .ta-template-form-list-layout
    margin 10px 0
    border 1px solid rgba(0 0 0 0.1)
  >>> .a-form-item-lable
    background-color rgba(0 0 0 0.1)
    padding 8px 10px 4px 10px
  >>> .vard-box
    margin 0 20px 10px 20px
  >>> .ant-row
    margin-bottom 0
  >>> .ant-form-item-no-colon
    text-align left
    width 80px !important
  >>> .create-button
    // margin 5px 0 10px 20px
</style>
