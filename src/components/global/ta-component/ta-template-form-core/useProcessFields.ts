import { VObject } from '@/lib/vails/model/index';
import { cloneDeep, get, merge, without, isEmpty } from 'lodash-es';
import {
  TaTemplateFormAccessibility,
  TaTemplateFormColumnAttribute,
  TaTemplateFormCondition,
  TaTemplateFormItem,
  TaTemplateFormItemTreeData,
  TaTemplateFormLayoutTypeAry,
} from './types';
import useCondition from './useCondition';

export interface TaTemplateFormItemMergeOptions {
  form: TaTemplateFormItem;
  modelKeyPrefix?: string;
}

const useProcessFields = () => {
  const processField = (
    item: TaTemplateFormItem,
    context: VObject,
    // eslint-disable-next-line
    processFn = (item: TaTemplateFormItem, parent: TaTemplateFormItem) => {},
    // eslint-disable-next-line
    filterFn = (item: TaTemplateFormItem, parent: TaTemplateFormItem) => true,
    formData: VObject | null = null,
    parent: TaTemplateFormItem = {},
  ) => {
    processFn(item, parent);
    item.fields
      ?.filter(i => filterFn(i, item))
      ?.forEach(field => processField(field, context, processFn, filterFn, formData, item));

    if (item.type === 'condition') {
      if (formData) {
        const { enableFields } = useCondition(item, formData, {}, context);
        enableFields.value
          ?.filter(i => filterFn(i, item))
          ?.forEach(field => processField(field, context, processFn, filterFn, formData, item));
      } else {
        item.conditions?.forEach(condition =>
          condition.fields
            ?.filter(i => filterFn(i, item))
            ?.forEach(field => processField(field, context, processFn, filterFn, formData, item)),
        );
      }
    }
  };

  const getValue = (template: TaTemplateFormItem, formData: VObject) => {
    return get(formData, getKey(template));
  };

  const getKey = (template: TaTemplateFormItem) => {
    return [template.model_key_prefix, template.model_key].filter(i => i).join('.');
  };

  const mergeFormItem = (opts: TaTemplateFormItemMergeOptions[]) => {
    return merge(
      {
        type: 'layout',
        key: 'layout',
        fields: opts.map((opts: TaTemplateFormItemMergeOptions) => {
          const field = cloneDeep(opts.form);
          processField(
            field,
            {},
            (item: TaTemplateFormItem) => {
              if (opts.modelKeyPrefix) {
                item.model_key_prefix = [opts.modelKeyPrefix, item.model_key_prefix].join('.');
              }
            },
            (item: TaTemplateFormItem, parent: TaTemplateFormItem) => {
              return parent.type !== 'list';
            },
          );
          return field;
        }),
        column_attributes: opts
          .map((opt: TaTemplateFormItemMergeOptions) => {
            return (opt.form.column_attributes || []).map(
              (column: TaTemplateFormColumnAttribute) => ({
                ...column,
                dataIndex: [opt.modelKeyPrefix, column.dataIndex].filter(i => i).join('.'),
              }),
            );
          })
          .reduce(
            (a: TaTemplateFormColumnAttribute[], b: TaTemplateFormColumnAttribute[]) => a.concat(b),
            [] as TaTemplateFormColumnAttribute[],
          ),
      },
      { options: opts[0]?.form?.options, actions: opts[0]?.form?.actions },
    );
  };

  const getFormItems = (
    template: TaTemplateFormItem,
    // eslint-disable-next-line
    filterFn = (item: TaTemplateFormItem) => true,
    formData: VObject | null = null,
    context: VObject = {},
  ) => {
    const formItems: TaTemplateFormItem[] = [];
    processField(
      template,
      context,
      item => {
        if (!TaTemplateFormLayoutTypeAry.includes(item.type!)) {
          formItems.push(item);
        }
      },
      filterFn,
      formData,
    );
    return formItems;
  };

  const getFieldsTree = (item: TaTemplateFormItem): TaTemplateFormItem => {
    let name = item.name;
    if (item.type === 'list') {
      name = `【列表布局】${name}`;
    }
    return {
      ...item,
      name,
      fields: [
        ...(!item.fields || item.type === 'list' ? [] : item.fields).map(
          (field: TaTemplateFormItem) => getFieldsTree(field),
        ),
        ...(item.conditions || []).map((condition: TaTemplateFormCondition, index: number) => ({
          key: `${item.key}_condition_${index}`,
          name: `【条件布局】${condition.name}`,
          type: 'condition',
          fields: condition.fields.map((field: TaTemplateFormItem) =>
            getFieldsTree({
              ...field,
              name: `【条件】${condition.name} - ${field.name}`,
            }),
          ),
        })),
      ],
    };
  };

  const getFormAllAccessibilityHidden = (
    form: TaTemplateFormItem,
    formData: VObject,
    accessibility: TaTemplateFormAccessibility[],
    context: VObject = {},
  ) => {
    let result = true;

    if (!form) return result;

    processField(
      form,
      context,
      (item: TaTemplateFormItem) => {
        if (
          !without(TaTemplateFormLayoutTypeAry, 'list').includes(item.type!) &&
          accessibility.find(acc => acc.key === getKey(item))?.accessibility !== 'hidden'
        ) {
          result = false;
        }
      },
      (_: TaTemplateFormItem, parent: TaTemplateFormItem) => parent.type !== 'list',
      formData,
    );
    return result;
  };

  const getIsFormEmpty = (form: TaTemplateFormItem) => {
    let isEmpty = true;

    processField(form, {}, (item: TaTemplateFormItem) => {
      if (isEmpty && !TaTemplateFormLayoutTypeAry.includes(item.type || 'layout')) {
        isEmpty = false;
      }
    });

    return isEmpty;
  };

  const judgeValueButZeroIsTrue = (value: any) => {
    if (typeof value === 'object') {
      return !isEmpty(value);
    }
    return value === 0 ? true : !!value;
  };
  const getFormCompletedProgress = (form: TaTemplateFormItem, payload: VObject) => {
    const formItems = getFormItems(form);
    if (formItems.length === 0) return;

    const checks = formItems
      .map((form: TaTemplateFormItem) => {
        return !!(getKey(form) && judgeValueButZeroIsTrue(getValue(form, payload)));
      })
      .filter(x => x);

    return checks.length / formItems.length;
  };

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

  return {
    processField,
    getValue,
    getFormItems,
    getFieldsTree,
    getKey,
    getFormAllAccessibilityHidden,
    mergeFormItem,
    getIsFormEmpty,
    getFormCompletedProgress,
    getTreeData,
  };
};

export default useProcessFields;
