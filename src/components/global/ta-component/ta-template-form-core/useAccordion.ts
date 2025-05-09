import useFieldComponentCollector from './useFieldComponentCollector';
import { computed, inject, provide } from 'vue';

const accordionKey = 'accordion';
const useAccordion = () => {
  const { fieldComponents, addField, removeField } = useFieldComponentCollector();

  const finishedCount = computed(
    () =>
      fieldComponents.value
        .map(comp => {
          if (typeof comp.value === 'object' && comp.value) {
            return comp.value.length > 0;
          } else {
            return comp.value;
          }
        })
        .filter(i => i).length,
  );

  const totalCount = computed(() => fieldComponents.value.length);

  const collapseStats = computed(() => {
    return `${finishedCount.value}/${totalCount.value}`;
  });

  return {
    fieldComponents,
    addField,
    removeField,
    finishedCount,
    totalCount,
    collapseStats,
  };
};

export default useAccordion;

export const useAccordionInject = () => {
  const accordionContext = inject(accordionKey, {}) as any;

  return {
    accordionContext,
  };
};

export const useAccordionProvide = (self: any) => {
  provide(accordionKey, self);
};
