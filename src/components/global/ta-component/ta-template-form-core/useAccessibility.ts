import { provide, inject, ComputedRef, computed, Ref } from 'vue';
import { TaTemplateFormAccessibility } from './types';

const useAccessibilityKey = 'useAccessibility';

const useAccessibilityProvide = (
  value: Ref<TaTemplateFormAccessibility[]> | ComputedRef<TaTemplateFormAccessibility[]>,
) => {
  provide(useAccessibilityKey, value);
};

const useAccessibilityInject = (valueKey: ComputedRef<string | string[]>) => {
  const accessibility = inject(useAccessibilityKey) as ComputedRef<TaTemplateFormAccessibility[]>;

  const targetAccessibility = computed(() =>
    accessibility.value.find(access => access.key === valueKey.value),
  );
  const hidden = computed(() => targetAccessibility.value?.accessibility === 'hidden');
  const disabled = computed(
    () =>
      targetAccessibility.value?.accessibility &&
      ['readonly', 'hidden'].includes(targetAccessibility.value?.accessibility),
  );

  return { accessibility, hidden, disabled };
};

export { useAccessibilityProvide, useAccessibilityInject };
