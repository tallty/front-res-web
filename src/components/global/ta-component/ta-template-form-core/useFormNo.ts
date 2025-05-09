import { computed, ComputedRef, inject, provide } from 'vue';
import { TaTemplateFormItem } from './types';

const useFormNoKey = 'useFormNoKey';

export const useFormNoProvide = (formComponent: any) => {
  const formNoInfo = computed<Record<string, number>>(() => {
    const result: Record<string, number> = {};
    const counter = { count: 1 };

    const normalLayouts = formComponent.fieldComponents
      .filter((i: any) => i.isNormalLayout)
      .map((i: any) => i.item);

    normalLayouts.forEach((item: TaTemplateFormItem) => {
      buildCounter(item, normalLayouts, counter, result);
    });

    return result;
  });

  const buildCounter = (
    item: TaTemplateFormItem,
    layouts: any[],
    counter: { count: number },
    result: Record<string, number>,
  ) => {
    (item.fields || []).forEach((field: TaTemplateFormItem) => {
      if (['layout', 'condition'].includes(field.type!)) {
        const layout = layouts.find((i: TaTemplateFormItem) => i.key === field.key);
        if (layout) buildCounter(layout, layouts, counter, result);
      } else if (field.type !== 'label' && !field?.options?.skipNo) {
        if (typeof result[field.key!] !== 'number') {
          result[field.key!] = counter.count;
          counter.count++;
        }
      }
    });
  };

  provide(useFormNoKey, formNoInfo);

  return {
    formNoInfo,
  };
};

export const useFormNoInject = (itemComputed: ComputedRef<TaTemplateFormItem>) => {
  const formNoInfo = inject<ComputedRef<Record<string, number>>>(useFormNoKey);
  if (!formNoInfo) return { formNo: undefined };

  const formNo = computed(() => {
    return formNoInfo.value[itemComputed.value.key!];
  });

  return {
    formNo,
  };
};
