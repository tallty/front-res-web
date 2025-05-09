import { ComputedRef, ref, Ref, computed, watch } from 'vue';
import { TaTemplateFormItem, TaTemplateFormIndexAttribute } from './types';
import { FormsUserSetableTemplateApi } from './templates.api';
import { get, cloneDeep, isEqual } from 'lodash-es';
import { VObject } from '../../../../lib/vails/model/index';

const isTaTemplateFormItem = (
  val:
    | TaTemplateFormItem
    | ComputedRef<string | TaTemplateFormItem>
    | { template: string | TaTemplateFormItem },
): val is TaTemplateFormItem => {
  return !!(val as VObject).key;
};

const isComputed = (
  val: ComputedRef<string | TaTemplateFormItem> | { template: string | TaTemplateFormItem },
): val is ComputedRef<string | TaTemplateFormItem> => {
  return typeof (val as VObject).value === 'string' || typeof (val as VObject).value === 'object';
};

const isProps = (val: {
  template: string | TaTemplateFormItem;
}): val is { template: string | TaTemplateFormItem } => {
  return typeof val.template == 'string' || typeof val.template == 'object';
};

const useAutoTemplateForm = (
  templateOrProps?:
    | TaTemplateFormItem
    | string
    | ComputedRef<string | TaTemplateFormItem>
    | { template: string | TaTemplateFormItem },
  type = 'model',
) => {
  const localTemplate: Ref<TaTemplateFormItem> = ref({});

  const getConfig = computed(() => {
    if (!templateOrProps) return {};

    if (typeof templateOrProps == 'string') {
      return {
        templateResult: templateOrProps,
      };
    } else {
      if (isTaTemplateFormItem(templateOrProps)) {
        // 传入 TaTemplateFormItem 对象
        return {
          templateResult: templateOrProps,
        };
      } else if (isComputed(templateOrProps)) {
        // 传入响应式 item 或 string
        return {
          templateResult: templateOrProps.value,
        };
      } else if (isProps(templateOrProps)) {
        // 传入 props
        return {
          props: templateOrProps,
        };
      }
    }
    return {};
  });

  const fetchTemplate = async () => {
    let output: TaTemplateFormItem;
    let template: TaTemplateFormItem | string | undefined = getConfig.value.templateResult;
    let templateType = type;

    if (getConfig.value.props) {
      template = getConfig.value.props.template;
    }

    if (typeof template === 'object') {
      output = template;
    } else if (typeof template === 'string') {
      if (template.split('#')[1]) {
        templateType = template.split('#')[1];
        template = template.split('#')[0];
      }
      output = await fetchRemoteTemplate(template, templateType);
    } else {
      output = {};
    }
    localTemplate.value = output;
  };

  watch(
    () => [getConfig.value.props?.template, getConfig.value.templateResult],
    (val1: any, val2: any) => {
      if (!isEqual(val1, val2)) {
        fetchTemplate();
      }
    },
  );

  const fetchRemoteTemplate = async (
    modelSingularName: string,
    modelType: string,
  ): Promise<TaTemplateFormItem> => {
    const api = new FormsUserSetableTemplateApi({
      parents: [{ type: modelSingularName, id: modelType }],
    });
    const { data } = await api.find();
    return data.form;
  };

  const getDataIndexValue = (index_attribute: TaTemplateFormIndexAttribute, formData: VObject) => {
    const value = get(formData, index_attribute.data_index);

    if (value === 0) {
      return 0;
    } else if (value) {
      return value;
    } else {
      return get(formData, index_attribute.data_index.replace('_payload', '_payload_summary'));
    }
  };

  return {
    localTemplate,
    fetchTemplate,
    getDataIndexValue,
  };
};

export default useAutoTemplateForm;
