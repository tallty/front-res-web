import { computed, provide, inject, Ref, ref } from 'vue';
import { TaTemplateFormOptions } from './types';
import { cloneDeep, merge } from 'lodash-es';

const optionsConfigKey = 'labelConfig';

const useOptionsConfig = (optionsReactive: Ref<TaTemplateFormOptions | undefined>) => {
  const injectItem = inject(optionsConfigKey, ref({})) as Ref<TaTemplateFormOptions | undefined>;

  const localOptionsConfig = computed(() => {
    return merge(cloneDeep(injectItem.value || {}), optionsReactive.value || {});
  });

  provide(optionsConfigKey, localOptionsConfig);

  return {
    localOptionsConfig: localOptionsConfig,
  };
};

export const useOptionsConfigInject = () => {
  const localOptionsConfig = inject(optionsConfigKey, ref({})) as Ref<
    TaTemplateFormOptions | undefined
  >;
  return {
    localOptionsConfig,
  };
};

export default useOptionsConfig;
