import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import { cloneDeep } from 'lodash';

let sign = 0;

const useKey = () => {
  const generateKey = (item: TaTemplateFormItem) => {
    return `${item.type || ''}_${Date.now()}_${sign++}`;
  };

  const freshKeys = (item: TaTemplateFormItem): TaTemplateFormItem => {
    const key = generateKey(item);
    const copy = cloneDeep(item);
    const modelKey = copy.options?.props?.model_key?.type === 'array' ? [key] : key;
    if (Array.isArray(modelKey) && typeof copy.options?.props?.model_key?.length === 'number') {
      for (let i = 1; i < copy.options?.props?.model_key?.length; i++) {
        modelKey.push(generateKey(item));
      }
    }

    return {
      ...copy,
      key: key,
      model_key: modelKey,
      model_key_configuration: (copy.model_key_configuration || []).map(configuration => ({
        ...configuration,
        model_key: generateKey(item),
      })),
      fields: (copy.fields || []).map(field => freshKeys(field)),
      conditions: (copy.conditions || []).map(condition => ({
        ...condition,
        fields: (condition.fields || []).map(field => freshKeys(field)),
      })),
    };
  };

  return {
    generateKey,
    freshKeys,
  };
};

export default useKey;
