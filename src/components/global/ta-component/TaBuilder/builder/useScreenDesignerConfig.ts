import { inject, reactive, WritableComputedRef, computed } from 'vue';
import { provide } from '@vue/runtime-core';
import { VObject } from '../../../../../lib/vails/model/index';
import { TaBuilderConfiguration } from '../types';

const KEY = 'ComScreenDesignerConfig';

export interface ComScreenDesignerConfig {
  dataSource: ComScreenDesignerConfigDataSource[];
  screenConfiguration: TaBuilderConfiguration;
}

export interface ComScreenDesignerConfigDataSource {
  _id: string;
  name: string;
  aggregation: VObject;
  static?: VObject;
  path?: string;
  params?: VObject;
  method?: string;
  dataSource?: string;
  dataKey?: string;
  interval?: number;
}

export const useScreenDesignerConfigProvide = (
  config: WritableComputedRef<ComScreenDesignerConfig>,
) => {
  provide(KEY, config);
  return { config };
};

export const useScreenDesignerConfigInject = () => {
  const config = inject<WritableComputedRef<ComScreenDesignerConfig>>(KEY, {
    dataSource: [],
    screenConfiguration: {},
  } as any);

  const dataSourceSelect = computed(() =>
    (config?.value?.dataSource || [])
      .map((source: ComScreenDesignerConfigDataSource) => ({
        label: source.name,
        value: source._id as string | null,
      }))
      .concat({ label: '上下文', value: 'context' })
      .concat({ label: '全局/上一个页面', value: null })
      .concat({ label: '插槽', value: 'slotArguments' }),
  );

  return { config, dataSourceSelect };
};
