import { TaTemplateFormItem } from './types';
import { VObject } from '../../../../lib/vails/model/index';
import { merge } from 'lodash-es';

let sign = 0;

const useOldTemplateUpdater = () => {
  const generateKey = (prefix: string) => {
    return `${prefix}_${Date.now()}_${sign++}`;
  };

  const getRuleType = (item: OldFormTemplateItem): any => {
    if (['date', 'datetime'].includes(item.layout.type as string)) {
      return 'string';
    } else {
      item.model?.attr_type;
    }
  };

  const updateOldTemplate = (
    oldTemplate: OldFormTemplateItem[],
    opts = { extraFn: (item: TaTemplateFormItem) => ({} as VObject) },
  ) => {
    const fields: TaTemplateFormItem[] = oldTemplate.map((item: OldFormTemplateItem) => {
      const rules =
        item.layout.required && item.accessibility !== 'hidden' && item.accessibility !== 'readonly'
          ? [{ required: true, type: getRuleType(item), message: `请填写正确的${item.name}` }]
          : [];
      const type = item.layout.component;
      const options = {
        ...item.layout,
        accessibility: item.accessibility,
        select: item.layout.options,
        span: item.layout.rowspan,
        attrs: [],
      };

      const result = {
        key: item.key,
        model_key: item.key,
        name: item.name,
        type,
        rules,
        options,
        fields: [],
      };
      return merge(result, opts.extraFn(result));
    });

    const conditionItems = oldTemplate.filter(
      (item: OldFormTemplateItem) => (item.layout.templateIndexAry?.length || 0) > 0,
    );

    const hiddenIndexCollection: number[][] = [];
    const conditions = conditionItems.map((item: OldFormTemplateItem) => {
      hiddenIndexCollection.push(item.layout.templateIndexAry || []);
      return {
        key: generateKey('condition_layout'),
        type: 'condition',
        model_key: '',
        conditions: [
          {
            type: 'simple' as 'simple',
            model_key: item.layout.conditionKey!,
            val: item.layout.conditionValue!,
            opt: '==',
            fields: fields.filter(
              (_: TaTemplateFormItem, index: number) =>
                !!item.layout.templateIndexAry?.includes(index),
            ),
          },
        ],
      };
    });

    hiddenIndexCollection.forEach((indexAry: number[], index: number) => {
      fields.splice(indexAry[0], 1, conditions[index]);
      indexAry.shift();
    });

    const hiddenIndex = hiddenIndexCollection.reduce((a: number[], b: number[]) => a.concat(b), []);

    console.log(hiddenIndex, 'hiddenIndex');

    return {
      key: generateKey('layout'),
      type: 'layout',
      model_key: '',
      fields: fields.filter((_: TaTemplateFormItem, index: number) => !hiddenIndex.includes(index)),
    };
  };

  return {
    updateOldTemplate,
  };
};

export default useOldTemplateUpdater;

export interface OldFormTemplateItem {
  icon?: string;
  key?: string;
  name: string;
  accessibility?: 'read_and_write' | 'readonly' | 'hidden';
  children_ransack?: string;
  api_url?: string;
  sub_template_id?: number;
  map_key?: string;
  layout: {
    component: TemplateFormComponents;
    type?: validatorTypes;
    options?: Array<{
      label: string;
      value?: string | number | boolean;
      group?: string;
    }>;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    multiple?: boolean;
    accept?: string;
    span?: number;
    rowspan?: number;
    textAlign?: 'left' | 'center' | 'right';
    min?: number;
    max?: number;
    attrs?: Array<{ key: string; name: string }>;
    defaultValue?: any;
    template?: OldFormTemplateItem[];
    templateIndexAry?: number[];
    conditionKey?: string;
    conditionValue?: string;
    summary?: boolean;
  };
  model: {
    attr_type: any;
    store?: any;
    storeConfig?: StoreConfig;
  };
}

type validatorTypes = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'url' | 'date' | 'any';

type TemplateFormComponents =
  | 'input'
  | 'textarea'
  | 'date'
  | 'time'
  | 'datetime'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'switch'
  | 'file'
  | 'image'
  | 'rich-text'
  | 'record'
  | 'department'
  | 'department_tree'
  | 'hr'
  | 'task'
  | 'user'
  | 'objective'
  | 'slider'
  | 'text'
  | 'text_value'
  | 'label'
  | 'contacts'
  | 'table'
  | 'tag'
  | 'currency'
  | 'form-designer'
  | 'user_store'
  | 'store_field'
  | 'if_container'
  | 'set'
  | 'file_selector'
  | 'time_range_switch_input'
  | 'from_gray'
  | 'taskable'
  | 'switch_input_change'
  | 'editable'
  | 'kpi_store'
  | 'result_store'
  | 'activity';

interface StoreConfig {
  initParams?: VObject;
  tagKey?: string; // 显示在标签上的值所对应的 key，默认为 name
  tableColumns?: {
    title: string;
    dataIndex: string;
    type?: string;
    search?: boolean;
  }[];
}
