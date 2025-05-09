import { inject, computed, ref } from 'vue';
import useOptionsConfig from '../ta-template-form-core/useOptionsConfig';
import { VObject } from '@/lib/vails/model';
import useGetFormValue from './useGetFormValue';
import { TaTemplateFormRule } from './types';
import { useAccessibilityInject } from './useAccessibility';

const useFormField = (props: VObject) => {
  // isViewer 在 TaTemplateFormViewer 中, provide 为 true
  // isViewer 在 TaTemplateForm 中, provide 为 undefined
  const isViewer = inject('isViewer', false);
  const optionsReactive = computed(() => props.item.options);

  const { localOptionsConfig } = useOptionsConfig(optionsReactive);
  const { value, formComponent, valueKey } = useGetFormValue(props.item);

  const { hidden: accessibilityHidden, disabled: accessibilityDisabled } =
    useAccessibilityInject(valueKey);

  const disabled = computed(
    () =>
      isViewer ||
      accessibilityDisabled.value ||
      props.item.options?.formDisabled ||
      props.item.options?.accessibility === 'readonly' ||
      props.item.options?.disabled,
  );

  const valueEmpty = computed(() => {
    return (
      !value.value ||
      (Array.isArray(value.value) && value.value.length === 0) ||
      (typeof value.value === 'object' && Object.keys(value.value).length === 0)
    );
  });

  const hidden = computed(
    () =>
      props.item.options?.accessibility === 'hidden' ||
      accessibilityHidden.value ||
      (props.item.options?.formHidden && !isViewer) ||
      (props.item.options?.viewHidden && isViewer) ||
      (formComponent?.hideEmpty && valueEmpty.value),
  );
  const required = computed(
    () => !!(props.item.rules || []).find((rule: TaTemplateFormRule) => rule.required),
  );

  const headerLabelStyle = computed(() => ({
    width: localOptionsConfig.value?.label?.emWidth
      ? `${localOptionsConfig.value.label?.emWidth}em`
      : localOptionsConfig.value?.label?.width && `${localOptionsConfig.value.label?.width}px`,
    textAlign: localOptionsConfig.value?.label?.align,
    fontSize: localOptionsConfig.value?.label?.font_size,
    display: localOptionsConfig.value?.label?.hidden ? 'none' : 'flex',
  }));

  const labelStyle = computed(() => ({
    height: props.item.options?.label?.height && `${props.item.options?.label?.height}px`,
    width: props.item.options?.label?.width && `${props.item.options?.label?.width}px`,
    'font-size':
      props.item.options?.label?.font_size && `${props.item.options?.label?.font_size}px`,
    'text-align': props.item.options?.label?.align,
    'padding-top':
      props.item.options?.label?.padding_top && `${props.item.options?.label?.padding_top}px`,
    'padding-right':
      props.item.options?.label?.padding_right && `${props.item.options?.label?.padding_right}px`,
    'padding-bottom':
      props.item.options?.label?.padding_bottom && `${props.item.options?.label?.padding_bottom}px`,
    'padding-left':
      props.item.options?.label?.padding_left && `${props.item.options?.label?.padding_left}px`,
    'background-color': props.item.options?.label?.background_color,
    ...(typeof localOptionsConfig.value?.theme === 'object' &&
    localOptionsConfig.value?.theme?.background?.color
      ? { '--label-background-color': localOptionsConfig.value?.theme?.background?.color }
      : {}),
  }));

  return {
    value,
    isViewer,
    disabled,
    hidden,
    required,
    headerLabelStyle,
    labelStyle,
    formComponent,
    valueKey,
    localOptionsConfig,
  };
};

export default useFormField;
