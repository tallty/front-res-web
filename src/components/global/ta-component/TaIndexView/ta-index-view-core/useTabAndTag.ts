import { computed, ref, Ref, watch } from 'vue';
import { VObject } from '../../../../../lib/vails/model/index';
import { TaIndexViewTabInterface, TaIndexViewTagInterface } from './types';
import { isEqual } from 'lodash-es';

const useTabAndTag = (
  props: any,
  emit: any,
  jumpRoute: (route: string) => void,
  visibleSelection?: Ref<boolean>
) => {
  const activeTabKey = ref(props.defaultActiveTabKey || '');
  const activeTagKey = ref('');

  const activeTab = computed((): Partial<TaIndexViewTabInterface> => {
    return (
      props.tabs.find(
        (i: TaIndexViewTabInterface) => i.key === activeTabKey.value
      ) || {}
    );
  });

  const activeTabIndex = computed({
    get: () =>
      props.tabs.findIndex(
        (i: TaIndexViewTabInterface) => i.key === activeTabKey.value
      ),
    set: (index: number) => {
      activeTabKey.value = props.tabs[index]?.key;
    },
  });

  const activeTag = computed<Partial<TaIndexViewTagInterface>>({
    get: () =>
      activeTab.value.tags?.find(
        (i: Partial<TaIndexViewTagInterface>) => i.key === activeTagKey.value
      ) || {},
    set: (tag: Partial<TaIndexViewTagInterface>) => {
      if (tag) {
        activeTagKey.value = tag.key!;
      }
    },
  });

  const activeTagIndex = computed<number>({
    get: () =>
      (activeTab.value.tags || [])?.findIndex(
        (i: Partial<TaIndexViewTagInterface>) => i.key === activeTagKey.value
      ),
    set: (index: number) => {
      activeTagKey.value = (activeTab.value.tags || [])[index]?.key;
    },
  });

  const onTabIndexChange = (index: number) => {
    if (props.tabs[index]?.key) {
      onTabClick(props.tabs[index].key);
    }
  };

  const onTabClick = (key: string) => {
    if (visibleSelection) {
      visibleSelection.value =
        props.config.selection?.showByDefault ||
        activeTab.value.selection?.showByDefault ||
        false;
    }
    if (activeTab.value.route) {
      jumpRoute(activeTab.value.route);
    }

    const oldActiveTabKey = activeTabKey.value;
    if (!oldActiveTabKey && !props.keepSelectionOnSwitch) {
      // 初始化时，不清空已选择项
      emit('update:selectedRecords', []);
    }

    activeTabKey.value = key;

    emit('tabChange', activeTab.value);

    if (activeTab.value.tags && activeTab.value.tags[0]) {
      onTagClick(activeTab.value.tags[0]);
    } else {
      onTagClick({});
    }
  };

  const onTagIndexChange = (index: number) => {
    if (activeTab.value.tags?.[index]) {
      onTagClick(activeTab.value.tags[index]);
    }
  };

  const onTagClick = (tag: Partial<TaIndexViewTagInterface>) => {
    activeTag.value = tag;
    emit('tagChange', tag);
  };

  const useTabAndTagOnMounted = () => {
    if (!activeTabKey.value && props.tabs && props.tabs[0]) {
      onTabClick(props.tabs[0].key);
    } else if (
      activeTab.value.tags &&
      activeTab.value.tags[0] &&
      !activeTagKey.value
    ) {
      onTagClick(activeTab.value.tags[0]);
    }
  };

  const isActive = (record: VObject) =>
    !!props.selectedRecords
      ?.filter(
        (record: VObject) =>
          !record.__TaIndexViewTabKey ||
          (record.__TaIndexViewTabKey &&
            record.__TaIndexViewTabKey === activeTab.value.key)
      )
      ?.find((r: VObject) => r.id == record.id);

  watch(
    () => props.tabs,
    (
      newValue: TaIndexViewTagInterface[],
      oldValue: TaIndexViewTagInterface[]
    ) => {
      if (!isEqual(newValue, oldValue)) {
        useTabAndTagOnMounted();
      }
    }
  );

  return {
    activeTabKey,
    activeTabIndex,
    activeTab,
    activeTag,
    activeTagIndex,
    onTabClick,
    onTagClick,
    isActive,
    useTabAndTagOnMounted,
    onTabIndexChange,
    onTagIndexChange,
  };
};

export default useTabAndTag;
