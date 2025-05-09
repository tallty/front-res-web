import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import useKey from './useKey';
import { Ref } from 'vue';

export const useActiveFieldKey = 'activeField';

const useActiveField = () => {
  const { freshKeys } = useKey();

  const clone = (field: TaTemplateFormItem, item: TaTemplateFormItem) => {
    const index = (item.fields || []).findIndex(
      (item: TaTemplateFormItem) => item.key === field.key,
    );

    return [
      ...(item.fields || []).slice(0, index + 1),
      freshKeys(field),
      ...(item.fields || []).slice(index + 1),
    ];
  };

  const destroy = (field: TaTemplateFormItem, item: TaTemplateFormItem) => {
    const index = item.fields!.findIndex((item: TaTemplateFormItem) => item.key === field.key);
    const fields = item.fields || [];
    if (index !== -1) {
      fields.splice(index, 1);
    }
    return fields;
  };

  const reset = (field: Ref<TaTemplateFormItem>) => {
    field.value = {
      options: {},
      model: {},
    };
    return field;
  };

  return {
    clone,
    destroy,
    reset,
  };
};

export default useActiveField;
