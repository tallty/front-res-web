import { computed, ComputedRef, WritableComputedRef } from 'vue';
import { VObject } from '../../../../../lib/vails/model/index';
import { TaIndexViewTabInterface } from './types';
import { merge, isUndefined } from 'lodash-es';

const whichFirstHasValue = <T>(items: Array<() => T>): T | undefined => {
  let result: T | undefined;
  items.find((item: () => T) => {
    const val = item();
    if (!isUndefined(val)) {
      return (result = val), true;
    }
    return false;
  });
  return result;
};
const useActiveProps = (
  props: any,
  activeTab: ComputedRef<Partial<TaIndexViewTabInterface>>,
  activeTag: WritableComputedRef<Partial<TaIndexViewTabInterface>>,
) => {
  const defineActiveProps = (key: string, defaultValue?: any, defaultValueGetter?: () => any) => {
    return computed(() => {
      return whichFirstHasValue([
        () => activeTag.value[key as keyof TaIndexViewTabInterface],
        () => activeTab.value[key as keyof TaIndexViewTabInterface],
        () => props.config[key],
        () => (typeof defaultValueGetter === 'function' ? defaultValueGetter() : undefined),
        () => defaultValue,
      ]);
    });
  };

  // 使用 tab 单独配置 或 统一配置 -- 开始 --
  const activeStore = defineActiveProps('store');
  const activeMode = defineActiveProps('mode');
  const activeRecordName = defineActiveProps('recordName');
  const activeLayout = defineActiveProps('layout', { direction: {} });
  const activeShowCount = defineActiveProps('showCount', false);
  const activeSelectionConfig = defineActiveProps('selection', {});
  const activeActionsConfig = defineActiveProps('actions', []);
  const activeRowKey = defineActiveProps('rowKey', 'id');
  const activeListConfig = defineActiveProps('list', {});
  const activeSearcherSimpleOptions = defineActiveProps('searcherSimpleOptions', null);
  const activeSearcherComplicatedOptions = defineActiveProps('searcherComplicatedOptions', null);
  const activeSearcherAccordionUseDrawer = defineActiveProps('searcherAccordionUseDrawer', false);
  const activeDraggable = defineActiveProps('draggable');
  const activeGroupKeys = defineActiveProps('groupKeys', null);
  const activeTemplate = defineActiveProps('template');
  const activeBatchUpdateTemplate = defineActiveProps('batchUpdateTemplate');
  const activeSteps = defineActiveProps('steps', []);
  const activeInterval = defineActiveProps('interval', 0);
  const activeDetailConfig = defineActiveProps('detail', {});
  const activeFormConfig = defineActiveProps('form', {});
  const activeFormDataEncode = defineActiveProps('formDataEncode', function (record: VObject) {
    return record;
  });
  const activeEditApi = defineActiveProps(
    'editApi',
    activeStore.value.api,
    () => activeStore.value.api,
  );
  const activeTableConfig = defineActiveProps('table', {});
  const activePaginationConfig = defineActiveProps('pagination');
  const activeScrollLoading = defineActiveProps('scrollLoading');
  const activePerPage = computed(() => {
    return (
      activeTag.value.pagination?.perPage ||
      activeTab.value.pagination?.perPage ||
      props.config.pagination?.perPage
    );
  });

  const activeParams = computed(() =>
    merge({}, props.config.params, activeTab.value.params, activeTag.value.params),
  );

  const activeStatCondition = computed(() =>
    merge(
      {},
      props.config.statCondition,
      activeTab.value.statCondition,
      activeTag.value.statCondition,
    ),
  );

  return {
    defineActiveProps,
    activeStore,
    activeParams,
    activeStatCondition,
    activeMode,
    activeLayout,
    activeRecordName,
    activeShowCount,
    activeSelectionConfig,
    activeActionsConfig,
    activeRowKey,
    activeListConfig,
    activeSearcherSimpleOptions,
    activeSearcherComplicatedOptions,
    activeSearcherAccordionUseDrawer,
    activeDraggable,
    activeTemplate,
    activeBatchUpdateTemplate,
    activeDetailConfig,
    activeFormConfig,
    activeFormDataEncode,
    activeEditApi,
    activeTableConfig,
    activePaginationConfig,
    activeScrollLoading,
    activePerPage,
    activeSteps,
    activeInterval,
    activeGroupKeys,
  };
};

export default useActiveProps;
