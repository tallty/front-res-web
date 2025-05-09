import { ref, provide, inject, Ref, WritableComputedRef } from 'vue';
import { TaBuilderComponent } from '../types';
import { computed } from '@vue/runtime-core';

const TaBuilderDesignerActiveItemKey = 'TaBuilderDesignerActiveItem';
const TaBuilderDesignerActiveItemMetaKey = 'TaBuilderDesignerActiveItemMeta';

export interface TaBuilderDesignerActiveItemMeta {
  componentRef?: any;
  drawerRef?: any;
  renderComponents: any[];
  renderedKeys: string[]; // 这是用来控制保留渲染的画布数组
  activeRootKeyCache: string;
  activeEditableParentKey?: string;
  activeSlotKey?: string;
}

const provideTaBuilderDesignerActiveItem = () => {
  const activeItem = ref<Partial<TaBuilderComponent>>({});
  const { activeItemMeta, activeRootKey } = useProvideActiveItemMeta();

  provide(TaBuilderDesignerActiveItemKey, activeItem);

  const reset = () => {
    activeItem.value = {};
    activeItemMeta.value.componentRef = null;
  };

  return { activeItem, activeItemMeta, activeRootKey, reset };
};

const injectTaBuilderDesignerActiveItem = () => {
  const activeItem = inject<Ref<Partial<TaBuilderComponent>> | null>(
    TaBuilderDesignerActiveItemKey,
    null,
  );

  const activeItemMeta = inject<Ref<TaBuilderDesignerActiveItemMeta> | null>(
    TaBuilderDesignerActiveItemMetaKey,
    null,
  );

  const { activeRootKey } = useActiveRootKey(activeItemMeta);

  const reset = () => {
    if (activeItem) {
      activeItem.value = {};
    }
    if (activeItemMeta) {
      activeItemMeta.value.componentRef = null;
    }
  };

  return { activeItem, activeItemMeta, activeRootKey, reset };
};

export const refreshTaBuilderDesignerActiveItemMeta = () => {
  const { activeItemMeta } = useProvideActiveItemMeta();
  const reset = () => {
    activeItemMeta.value.componentRef = null;
  };

  return { activeItemMeta, reset };
};

const useProvideActiveItemMeta = () => {
  const activeItemMeta = ref<TaBuilderDesignerActiveItemMeta>({
    componentRef: null,
    renderComponents: [],
    renderedKeys: [],
    activeRootKeyCache: '',
  });

  const { activeRootKey } = useActiveRootKey(activeItemMeta);

  provide(TaBuilderDesignerActiveItemMetaKey, activeItemMeta);

  return { activeItemMeta, activeRootKey };
};

const useActiveRootKey = (activeItemMeta?: Ref<TaBuilderDesignerActiveItemMeta> | null) => {
  const activeRootKey = computed({
    get: () => activeItemMeta?.value?.activeRootKeyCache || '',
    set: val => {
      if (activeItemMeta?.value) {
        activeItemMeta.value.activeRootKeyCache = val;

        const existsKey = activeItemMeta.value.renderedKeys.findIndex(key => key === val);
        if (existsKey === -1) {
          activeItemMeta.value.renderedKeys.push(val);
        }
      }
    },
  });

  return { activeRootKey };
};

export { provideTaBuilderDesignerActiveItem, injectTaBuilderDesignerActiveItem };
