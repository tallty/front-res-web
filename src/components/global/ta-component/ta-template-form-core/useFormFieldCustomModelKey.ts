import { computed } from 'vue';
import { TaTemplateFormModelKeyConfiguration, TaTemplateFormRule } from './types';
import { get, set } from 'lodash-es';
import { getTaTemplateFormItemValueKey } from './useGetFormValue';

export const useFormFieldCustomModelKey = (props: any, formComponent: any) => {
  const customModelKeyAccessorProps = computed(() =>
    (props.item.model_key_configuration || [])
      .map((configuration: TaTemplateFormModelKeyConfiguration) => {
        const modelKey = getTaTemplateFormItemValueKey(props.item, configuration.model_key);
        return {
          [configuration.key]: get(formComponent.value, modelKey),
          [`onUpdate:${configuration.key}`]: (value: any) => {
            set(formComponent.value, modelKey, value);
          },
        };
      })
      .reduce((acc: any, cur: any) => ({ ...acc, ...cur }), {}),
  );

  const multiKeyValidateRules = computed(() => {
    const rule = (props.item?.rules || []).find((rule: TaTemplateFormRule) => rule.required);
    if (props.item.model_key_configuration && rule) {
      return props.item.model_key_configuration.map(
        (config: TaTemplateFormModelKeyConfiguration) => {
          return {
            ...rule,
            message: `请填写${config.custom_label || config.label}`,
            transform() {
              const modelKey = getTaTemplateFormItemValueKey(props.item, config.model_key);

              return get(formComponent.value, modelKey);
            },
          };
        },
      );
    }
    return [];
  });

  return {
    customModelKeyAccessorProps,
    multiKeyValidateRules,
  };
};
