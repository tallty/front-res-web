<script lang="ts">
import {
  defineComponent,
  toRefs,
  PropType,
  computed,
  watch,
  onMounted,
  ref,
  onUnmounted,
} from 'vue';
import {
  TaTemplateFormItem,
  TaTemplateFormItemTreeData,
  TaTemplateFormCondition,
  TaTemplateFormComplexConditionRule,
  TaTemplateFormComplexConditionDescItem,
} from '@/components/global/ta-component/ta-template-form-core/types';
import useProcessFields from '../../ta-template-form-core/useProcessFields';
import { merge, isEqual, cloneDeep } from 'lodash';
import useKey from '../designer/useKey';
import { VObject } from '@/lib/vails/model';
import { useContextInject } from '../../ta-template-form-core/useContext';

const TaTemplateFormConditionTargetSelector = defineComponent({
  name: 'TaTemplateFormConditionTargetSelector',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    value: { type: [String, Number] as PropType<any>, required: true },
    payload: { type: Object, required: true },
    template: { type: Object as PropType<TaTemplateFormItem>, required: true },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:value', 'update:payload', 'update:template'],
  setup(props, { emit }) {
    const { context } = useContextInject();

    const localPayload = computed({
      get: () => props.payload,
      set: val => emit('update:payload', val),
    });

    const localTemplate = computed({
      get: () => props.template,
      set: val => emit('update:template', val),
    });

    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const { getFormItems, processField } = useProcessFields();
    const { generateKey } = useKey();

    // 因为 setDittoItem 中直接 merge 对象中嵌套某一项无法触发响应式，
    // 所以增加一个 stashTemplate 来手动触发
    const stashTemplate = ref(localTemplate.value);
    watch(stashTemplate, () => (localTemplate.value = stashTemplate.value), { deep: true });

    const setDittoItem = (key: string, item: TaTemplateFormItem) => {
      const items = getFormItems(localTemplate.value);
      // 保留引用
      const target = items.find(item => item.options?.ditto === key);

      if (target) {
        const extra: VObject = {};
        // radio 换成 select 以支持多选
        if (item.type === 'radio') {
          extra.type = 'select';
        }
        const key = generateKey({ type: 'ditto' });

        merge(
          target,
          { ...item, rules: [] },
          {
            key,
            name: '值',
            model_key: 'val',
            model_key_prefix: 'rule',
            model: {
              attr_type: 'array',
            },
            options: {
              span: 24,
              multiple: true,
              formDisabled: false,
              disabled: false,
              accessibility: 'writeable',
            },
          },
          extra,
        );
      }

      stashTemplate.value = localTemplate.value;
    };

    const getDittoItemDefault = (key: string) => {
      return {
        name: '',
        type: '',
        rules: [],
        model: {},
        options: { span: 24, ditto: key },
        key: `dynamic_component_1633111922226_${key}`,
        model_key: '',
        fields: [],
        conditions: [],
        model_key_prefix: 'rule',
      };
    };

    // treeData 在新版 antd vue 中 key value 不能重复，所以做此转换
    const valueToTargetValue = computed({
      get: () =>
        treeOptionsFlat.value.find(
          item => item.targetValue === props.value || item.value === props.value,
        )?.value,
      set: val => {
        localPayload.value.rule = {};
        const targetValue = processDitto(val);
        emit('update:value', targetValue);
      },
    });

    onUnmounted(() => {
      if (localPayload.value?.rule && Object.keys(localPayload.value.rule).length === 0) {
        localPayload.value.rule = undefined;
      }
    });

    const processDitto = (val: string) => {
      const target = treeOptionsFlat.value.find(item => item.value === val);
      const targetValue = target?.targetValue || target?.value;
      // 替换 ditto 值选择器
      const componentType = target?._record?.type;
      const attrType = target?._record?.model?.attr_type || 'string';
      const multiple = target?._record?.options?.multiple || false;
      if (['select', 'radio', 'checkbox'].includes(componentType) || attrType === 'array') {
        if (multiple) {
          localPayload.value.rule.type = 'Com::Attr::ConditionRules::MultiChoice';
          setDittoItem('ditto_multi', target?._record);
        } else {
          localPayload.value.rule.type = 'Com::Attr::ConditionRules::SingleChoice';
          setDittoItem('ditto_single', target?._record);
        }
      } else {
        setDittoItem('ditto_single', getDittoItemDefault('ditto_single'));
        setDittoItem('ditto_multi', getDittoItemDefault('ditto_multi'));

        if (attrType === 'number')
          localPayload.value.rule.type = 'Com::Attr::ConditionRules::Number';
        else if (attrType === 'boolean')
          localPayload.value.rule.type = 'Com::Attr::ConditionRules::Boolean';
        else localPayload.value.rule.type = 'Com::Attr::ConditionRules::String';
        // 更新 英文名 key
      }
      return targetValue;
    };

    onMounted(() => {
      if (props.value)
        processDitto(
          treeOptionsFlat.value.find(
            item => item.targetValue === props.value || item.value === props.value,
          )?.value,
        );
    });

    // desc 条件描述处理

    const conditions = computed(() => {
      const result: TaTemplateFormCondition[] = [];
      if (!localTemplate.value) return result;

      processField(
        localTemplate.value,
        {},
        item => {
          item.conditions?.forEach(condition => result.push(condition));
        },
        () => true,
        localPayload.value,
      );
      return result;
    });

    const getItemTypeCondition = (val?: TaTemplateFormComplexConditionRule) => {
      return conditions.value.find(condition => condition.val === val?.type);
    };

    const conditionGetValItem = (
      condition: TaTemplateFormCondition,
    ): TaTemplateFormItem | undefined => {
      return getFormItems(condition, () => true, localPayload.value).find(
        field => field.model_key === 'val',
      );
    };

    const desc = computed<TaTemplateFormComplexConditionDescItem | null>(() => {
      const itemTypeCondition = getItemTypeCondition(localPayload.value.rule);
      if (itemTypeCondition) {
        // 拿到 opt 的 select 用于后续翻译中文
        const optSelects = itemTypeCondition.fields.find(field => field.model_key === 'opt')
          ?.options?.select;

        if (optSelects) {
          // 拿到 opt 中文
          const optZh = optSelects.find(
            select => select.value === localPayload.value.rule.opt,
          )?.label;

          if (optZh) {
            // 拿到 val 的表单项
            const valTemplateItem = cloneDeep(conditionGetValItem(itemTypeCondition));

            if (valTemplateItem) {
              return {
                name: localPayload.value.rule.key_name,
                optZh,
                modelValue: { rule: { val: localPayload.value.rule.val } },
                template: { key: 'key', type: 'layout', fields: [valTemplateItem] },
              };
            }
          }
        }
      }
      return null;
    });

    watch(
      localPayload,
      (newValue: VObject) => {
        // 更新 中文名 key_name
        const title = findTitleValue(newValue?.rule?.key);
        if (!isEqual(newValue?.rule?.key_name, title)) {
          localPayload.value.rule.key_name = title;
        }
        if (!isEqual(newValue?.desc, desc.value)) {
          // 已选择了操作符，才赋值 desc
          localPayload.value.desc = newValue.rule?.opt && newValue.rule?.key ? desc.value : null;
        }
      },
      {
        deep: true,
        // immediate: true,
      },
    );

    // treeData 处理

    // reactive 在 computed 中，reactive 值，无法触发响应式
    const treeData = ref<TaTemplateFormItemTreeData[]>([]);
    // computed(() => {
    //   treeDataChangeFlag.value;
    //   return [getTreeData(context.conditionForm || {})];
    // });

    const getTreeData = (
      field: TaTemplateFormItem,
      filterFn: (field: TaTemplateFormItem) => boolean = () => true,
    ): TaTemplateFormItemTreeData => {
      return {
        title: field.name!,
        _record: field,
        targetValue: [field.model_key_prefix, field.model_key!].filter(i => i).join('.'),
        value: field.key,
        children: (field.fields || [])
          .filter(item => filterFn(item))
          .map(item => getTreeData(item, filterFn))
          .concat(
            (field.conditions || [])
              .map(condition => condition.fields.map(item => getTreeData(item, filterFn)))
              .reduce((a, b) => a.concat(b), []),
          ),
      };
    };

    const treeSelectKey = ref(new Date().getTime());
    watch(
      () => context.conditionForm,
      () => {
        console.log(context.conditionForm, 'context.conditionForm');

        treeData.value = [getTreeData(context.conditionForm || {})];
        treeSelectKey.value = new Date().getTime();
      },
      { deep: true, immediate: true },
    );

    watch(
      () => context.conditionForm,
      () => {
        valueToTargetValue.value = null;
      },
      { deep: true },
    );

    // 树处理

    const treeOptionsFlat = computed(() => {
      const flatData: TaTemplateFormItemTreeData[] = [];
      treeData.value.forEach((item: TaTemplateFormItemTreeData) => {
        processTree(item, (i: TaTemplateFormItemTreeData) => flatData.push(i));
      });
      return flatData;
    });

    const processTree = (
      item: TaTemplateFormItemTreeData,
      processItem: (item: TaTemplateFormItemTreeData) => void,
    ) => {
      processItem(item);
      item.children?.forEach((i: TaTemplateFormItemTreeData) => processTree(i, processItem));
    };

    const titleValue = computed(() => findTitleValue(props.value));

    const findTitleValue = (val: any) =>
      treeOptionsFlat.value.find(item => item.targetValue === val || item.value === val)?.title;

    return {
      ...toRefs(props),
      valueToTargetValue,
      titleValue,
      treeData,
      localTemplate,
      treeSelectKey,
      localValue,
    };
  },
});
export default TaTemplateFormConditionTargetSelector;
</script>

<template lang="pug">
.ta-template-form-condition-target-selector
  template(v-if='!disabled')
    a-tree-select.select(
      :key='treeSelectKey',
      v-model:value='valueToTargetValue',
      :name='item.key',
      :disabled='disabled',
      size='default',
      :placeholder='item.options.placeholder || `请选择${item.name}`',
      :mode='item.options.multiple ? "multiple" : null',
      :tokenSeparators='[","]',
      :tree-data='treeData.length > 0 ? treeData : item.options.treeData',
      tree-default-expand-all,
      :dropdownMatchSelectWidth='false',
      show-search,
      treeNodeFilterProp='title',
    )

    .label.my-2.font-bold 自定义条件值
    a-input(v-model:value='localValue')
    //- .mt-6
    //-   .label.text-gray-900.font-base.mr-2 自定义关键字
    //-   a-input(v-model:value='valueToTargetValue')
  template(v-else)
    .value {{ titleValue }}
</template>

<style lang="stylus" scoped>
.ta-template-form-condition-target-selector
  width 100%
  .select
    width 100%
    >>> .ant-select
      width 100%
</style>
