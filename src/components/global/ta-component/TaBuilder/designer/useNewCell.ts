import { TaBuilderComponent } from '../types';
import { Ref, nextTick, WritableComputedRef } from 'vue';
import { injectTaBuilderDesignerActiveItem } from '@/components/global/ta-component/TaBuilder/designer/useActiveItem';

export const useNewCell = () => {
  const { activeItem, activeItemMeta } = injectTaBuilderDesignerActiveItem();

  const addNewCell = (
    newCell: TaBuilderComponent,
    flatDataRef:
      | Ref<Partial<TaBuilderComponent>[]>
      | WritableComputedRef<Partial<TaBuilderComponent>[]>,
  ) => {
    const cell = { ...newCell, slot: activeItemMeta?.value?.activeSlotKey };

    flatDataRef.value.push(cell);
    if (activeItem) {
      activeItem.value = cell;
    }
    nextTick(() => {
      if (activeItemMeta) {
        activeItemMeta.value.componentRef = activeItemMeta.value.renderComponents.find(
          (comp: any) => comp.componentSchema.key === cell.key,
        )?.componentRef;
      }
    });
  };

  return {
    addNewCell,
  };
};
