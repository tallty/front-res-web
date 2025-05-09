<script lang="ts">
import { defineComponent, toRefs, computed, watch, nextTick, ref } from 'vue';
import { TaConditionTypeConfigMapping } from './TaConditionEditor.vue';
import { TaConditionType } from '../types';
import { getTaConditionOldTemplateFn } from './template';
import useProcessFields from '@/components/global/ta-component/ta-template-form-core/useProcessFields';
import { getTaTemplateFormItemValueKey } from '../../ta-template-form-core/useGetFormValue';
import { cloneDeep, isEqual } from 'lodash';
import { VObject } from '../../../../../lib/vails/model/index';
import {
  TaTemplateFormItem,
  TaTemplateFormItemTreeData,
} from '@/components/global/ta-component/ta-template-form-core/types';

const OptZhMap: VObject = {
  '>': '大于',
  '>=': '大于等于',
  '==': '等于',
  '<': '小于',
  '<=': '小于等于',
  '!=': '不等于',
  between: '范围',
  contains: '包含',
  include: '含有',
  none: '无一符合',
  any: '有交集',
};

const TaConditionOldEditor = defineComponent({
  name: 'TaConditionOldEditor',
  components: {},
  props: {
    value: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
    activeDataFormOption: { type: Object, default: undefined },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: value => emit('update:value', value),
    });

    const label = TaConditionTypeConfigMapping[TaConditionType.Old].label;
    const desc = computed(() => {
      if (localValue.value.rule?.key && localValue.value.rule?.opt && localValue.value.rule?.val) {
        return `${localValue.value.rule?.key} ${localValue.value.rule?.opt} ${localValue.value.rule?.val}`;
      }
      return '';
    });

    const editor = ref<any>(null);
    const { getTreeData, processField } = useProcessFields();

    let valueItem: TaTemplateFormItem | undefined;

    const taConditionOldTemplate = computed(() => {
      const form = props.activeDataFormOption?.meta?.form;
      let fieldTreeData: TaTemplateFormItemTreeData[] = [];

      if (form) {
        fieldTreeData = [getTreeData(form)];
        processField(form, (item: TaTemplateFormItem) => {
          if (
            getTaTemplateFormItemValueKey(item, item.model_key as string) ===
            editor.value?.formData.rule?.key
          ) {
            valueItem = cloneDeep(item);
          }
        });
      }

      return getTaConditionOldTemplateFn(fieldTreeData, valueItem);
    });

    const visible = ref(true);
    const oldRuleType = ref(localValue.value.rule?.type);

    watch(
      [() => taConditionOldTemplate.value, () => editor.value?.formData?.rule?.type],
      () => {
        visible.value = false;
        if (editor.value.formData.rule && editor.value.formData.rule.type !== oldRuleType.value) {
          editor.value.formData.rule.opt = undefined;
          editor.value.formData.rule.val = undefined;
          editor.value.formData.rule.key_name = valueItem?.name;
        }
        oldRuleType.value = editor.value.formData.rule?.type;

        nextTick(() => (visible.value = true));
      },
      {
        deep: true,
      },
    );

    watch(
      localValue,
      (newValue: VObject, oldValue?: VObject) => {
        if (isEqual(newValue, oldValue)) return;
        localValue.value.desc = {
          name: localValue.value.rule?.key_name || localValue.value.rule?.key,
          optZh: OptZhMap[localValue.value.rule?.opt],
          modelValue: { rule: { val: localValue.value.rule?.val } },
          template: { key: 'key', type: 'layout', fields: [valueItem] },
        };
      },
      { deep: true },
    );

    return {
      ...toRefs(props),
      localValue,
      label,
      taConditionOldTemplate,
      desc,
      visible,
      editor,
    };
  },
});
export default TaConditionOldEditor;

// "desc"=>
//   {"name"=>"是否需要专家审核",
//   "optZh"=>"含有",
//   "template"=>
//     {"key"=>"key",
//     "type"=>"layout",
//     "fields"=>
//       [{"key"=>"ditto_1688744197317_2",
//         "name"=>"值",
//         "type"=>"select",
//         "model"=>{"attr_type"=>"array"},
//         "rules"=>[],
//         "fields"=>[],
//         "actions"=>[],
//         "options"=>
//         {"span"=>24,
//           "ditto"=>"ditto_single",
//           "select"=>[{"label"=>"是", "value"=>"是"}, {"label"=>"否", "value"=>"否"}],
//           "disabled"=>false,
//           "multiple"=>true,
//           "table_items"=>[],
//           "formDisabled"=>false,
//           "accessibility"=>"writeable",
//           "dynamic_component"=>"",
//           "import_export_headers"=>[{"_id"=>"1675178395625_3"}],
//           "display_configurable_form"=>{}},
//         "model_key"=>"val",
//         "conditions"=>[],
//         "index_attributes"=>[],
//         "model_key_prefix"=>"rule",
//         "column_attributes"=>[]}]},
//   "modelValue"=>{"rule"=>{"val"=>["是"]}}},
</script>

<template lang="pug">
TaActionCapsuleEditor(
  ref='editor',
  v-model:value='localValue',
  :label='label',
  :disabled='disabled'
)
  .ta-condition-user-editor.cursor-pointer.ellipsis
    span(v-if='localValue.name || !localValue.desc') {{ localValue.name || `请选择${label}` }}
    TaConditionOldDesc(v-else, :desc='localValue.desc')

  template(#editor='{ formData, updateFormData, disabled }')
    TaTemplateForm(
      v-if='visible',
      :modelValue='formData',
      :template='taConditionOldTemplate'
      :disabled='disabled',
      @update:modelValue='updateFormData',
    )
</template>

<style lang="stylus" scoped></style>
