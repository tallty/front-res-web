<script lang="ts">
import { defineComponent, toRefs, PropType, computed, ref, watch, nextTick } from 'vue';
import { BpmNodeConditionOptField } from '@/engines/bpm/components/designer/nodeEditor/ComBpmNodeEditorCondition.vue';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';
import { VObject } from '@/lib/vails';
import { getTaTemplateFormConditionFormSelectorTemplate } from './TaTemplateFormConditionFormSelectorTemplate';
import { useContextInject } from '../../ta-template-form-core/useContext';
import { ComUserModelSettingsApi } from './apis/com/user/model_settings.api';

const TaTemplateFormConditionFormSelector = defineComponent({
  name: 'TaTemplateFormConditionFormSelector',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    payload: { type: Object as PropType<VObject>, required: true },
    value: { type: Number, required: true },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:value', 'update:payload', 'update:template'],
  setup(props, { emit }) {
    const hidden = computed(() => !props.item.options?.meta?.fieldOpts);

    const { context } = useContextInject();

    const setForm = (form: VObject) => {
      context.conditionForm = form;
    };

    if (hidden.value) {
      setForm(props.item.options?.meta?.workflowTemplate || {});
    }

    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const localPayload = computed({
      get: () => props.payload,
      set: val => emit('update:payload', val),
    });

    const innerValue = ref({
      source_type: localPayload.value?.source_type,
      source_id_or_seq: localPayload.value?.source_id_or_seq,
      user_mode: localPayload.value?.user_mode,
      user_rule: localPayload.value?.user_rule,
    });

    const syncInnerValue = () => {
      nextTick(() => {
        if (!localPayload.value) localPayload.value = {};

        localPayload.value.source_type = innerValue.value.source_type;
        localPayload.value.source_id_or_seq = innerValue.value.source_id_or_seq;

        localPayload.value.user_mode = innerValue.value.user_mode;
        localPayload.value.user_rule = innerValue.value.user_rule;
      });
    };

    watch(
      innerValue,
      (newValue: VObject) => {
        if (newValue.source_type === 'workflow') {
          setForm(props.item.options?.meta?.workflowTemplate || {});
          syncInnerValue();
        } else if (newValue.source_type === 'place' && newValue.source_id_or_seq) {
          const field = (props.item.options?.meta?.fieldOpts || []).find(
            (field: BpmNodeConditionOptField) => field.seq === newValue.source_id_or_seq,
          );
          if (field?.form) {
            setForm(field.form);
            syncInnerValue();
          }
        } else if (newValue.source_type === 'flowable' && newValue.source_id_or_seq) {
          new ComUserModelSettingsApi().find(newValue.source_id_or_seq).then(({ data }) => {
            setForm(data.form);
            syncInnerValue();
          });
        } else if (newValue.source_type === 'user') {
          console.log(newValue, 'newValue');
          localPayload.value.rule = undefined;
          syncInnerValue();
        }
      },
      { deep: true, immediate: true },
    );

    const selects = computed(() => {
      const fieldOpts = props.item.options?.meta?.fieldOpts;
      return (Array.isArray(fieldOpts) ? fieldOpts : []).map((field: BpmNodeConditionOptField) => ({
        label: field.name,
        value: field.seq,
      }));
    });

    const template = computed(() => getTaTemplateFormConditionFormSelectorTemplate(selects.value));

    return {
      ...toRefs(props),
      localValue,
      // selects,
      template,
      hidden,
      context,
      innerValue,
    };
  },
});
export default TaTemplateFormConditionFormSelector;
</script>

<template lang="pug">
.ta-template-form-condition-form-selector
  TaTemplateForm(
    v-if='!hidden'
    v-model='innerValue',
    :template='template',
  )
  .text-gray-500(v-else) 主表单
</template>

<style lang="stylus" scoped>
.ta-template-form-condition-form-selector
  width 100%
  .select
    width 100%
    >>> .ant-select
      width 100%
</style>
