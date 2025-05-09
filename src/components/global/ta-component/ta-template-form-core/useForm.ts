import { TaTemplateFormItem } from './../ta-template-form-core/types';
import { provide, ref, inject } from 'vue';
import { VObject } from '@/lib/vails/model/index';

const formComponentKey = 'formComponentKey';
export interface TaTemplateFormUseFormConfig {
  create: (formData: VObject) => Promise<any>;
  update: (formData: VObject) => Promise<any>;
  skipValidate?: boolean;
}

// 现在只在 useListLayout 用到
const useForm = (
  formData: VObject, // formData 需要是响应式的
  template: TaTemplateFormItem,
  config: TaTemplateFormUseFormConfig,
) => {
  provide('isViewer', false);

  const form = ref(null);
  const submit = (callback?: {
    success?: (formData: VObject) => void;
    fail?: (error: Error) => void;
    skipValidate?: boolean;
  }) => {
    const shouldSkipValidation = config.skipValidate || callback?.skipValidate;
    if (shouldSkipValidation) {
      return new Promise((resolve, reject) => {
        try {
          formData.id || formData._id ? config.update(formData) : config.create(formData);
          resolve(formData);
        } catch (e) {
          reject(e);
        }
      });
    }

    return (form.value as any)
      .validate()
      .then(() => {
        (formData.id || formData._id ? config.update(formData) : config.create(formData))
          .then(res => callback?.success && callback.success(res))
          .catch((error: Error) => {
            throw error;
          });
        return formData;
      })
      .catch((error: Error) => {
        callback?.fail && callback.fail(error);
        throw error;
      });
  };

  return {
    form,
    submit,
  };
};

export const useFormProvide = (self: any) => {
  provide(formComponentKey, self);
};

export const useFormInject = () => {
  const formComponent = inject(formComponentKey) as any;

  return {
    formComponent,
  };
};

export default useForm;
