import { VApiIndexResponse } from '@/lib/vails/api/index';
import { VModelBase, VObject } from '@/lib/vails/model/index';
import { VStore } from '@/lib/vails/store/index';
import { cloneDeep, isEqual, merge } from 'lodash-es';
import { computed, ComputedRef, ref, Ref, watch } from 'vue';
import {
  TaIndexViewFetchDataOptsInterface,
  TaIndexViewTabInterface,
  TaIndexViewTagInterface,
} from './types';
import { GroupedRecordModel } from './models/grouped_record_model';

const useFetchData = (
  props: any,
  emit: any,
  activeTab: ComputedRef<Partial<TaIndexViewTabInterface>>,
  activeTag: Ref<Partial<TaIndexViewTagInterface>>,
  activeStore: ComputedRef<VStore<any>>,
  activePerPage: ComputedRef<number>,
  activeParams: ComputedRef<VObject>,
  activeStatCondition: ComputedRef<VObject>,
  activeGroupKeys: ComputedRef<string[] | null>,
  activeScrollLoading?: ComputedRef<boolean>,
  otherQuery: ComputedRef<VObject> = computed(() => ({})),
  interval?: ComputedRef<number>
  // activeApi?: ComputedRef<any>,
) => {
  // 初始化时上锁，在 mounted 完成 tab 切换后再初始化并请求
  const fetchLocked = ref(true);
  const searcherQuery = ref<VObject>({});

  const query = computed(() =>
    merge(
      cloneDeep(otherQuery.value),
      cloneDeep(props.temporaryQuery),
      cloneDeep(searcherQuery.value)
    )
  );

  const subQuery = computed(() =>
    merge(
      cloneDeep(activeTab.value.query),
      cloneDeep(activeTag.value?.query || {})
    )
  );

  const watchQuery = computed(() => [
    query.value,
    subQuery.value,
    activeParams.value,
    activeStatCondition.value,
    activeGroupKeys.value,
    activeStatCondition.value,
  ]);

  const queryCache = ref<VObject>({});

  const fetchData = (
    page = activeStore.value.currentPage.value,
    query = {},
    perPage = activePerPage.value,
    opts: TaIndexViewFetchDataOptsInterface = {}
  ) => {
    if (fetchLocked.value) return;

    queryCache.value = query;
    const params = {
      shouldAppend: activeScrollLoading ? activeScrollLoading?.value : true,
      silence: opts.silence,
      page,
      per_page: perPage,
      q: {
        ...query,
      },
    };
    const hasStatCondition =
      Object.keys(activeStatCondition.value || {}).length > 0;
    const isGroupedLayout = (activeGroupKeys.value?.length || 0) > 0;
    return (
      isGroupedLayout
        ? fetchGroupIndex(query, params)
        : hasStatCondition
        ? fetchListIndex(query, params)
        : activeStore.value.index(params)
    ).then(async (res: VApiIndexResponse<VModelBase, string> | VObject) => {
      if (Object.keys(res).length !== 0) {
        await new Promise<void>((resolve) => {
          emit(
            'onIndex',
            res,
            merge(
              {
                q: cloneDeep(activeStore.value.query.value),
                sub_q: cloneDeep(activeStore.value.subQuery.value),
              },
              cloneDeep(activeStore.value.params.value),
              {
                q: {
                  ...query,
                },
              }
            ),
            () => {
              resolve();
            }
          );
          // 只要没有 await fetchData 1 秒后释放
          setTimeout(() => resolve(), 1000);
          if (interval?.value) {
            setTimeout(
              () => fetchData(page, query, perPage, opts),
              interval.value
            );
          }
        });
      }
    });
  };

  const fetchListIndex = (query: VObject, params: VObject) => {
    return activeStore.value.sendCollectionAction({
      action: 'list_index',
      setRecords: true,
      config: {
        data: merge(
          {},
          params,
          {
            q: cloneDeep(activeStore.value.query.value),
            sub_q: cloneDeep(activeStore.value.subQuery.value),
          },
          cloneDeep(activeStore.value.params.value),
          {
            q: {
              ...query,
            },
          }
        ),
      },
    });
  };

  const fetchGroupIndex = (query: VObject, params: VObject) => {
    return activeStore.value
      .sendCollectionAction({
        action: 'group_index',
        // setRecords: true,
        config: {
          data: merge(
            {},
            params,
            {
              q: cloneDeep(activeStore.value.query.value),
              sub_q: cloneDeep(activeStore.value.subQuery.value),
            },
            cloneDeep(activeStore.value.params.value),
            {
              q: {
                ...query,
                group_keys: activeGroupKeys.value,
              },
            }
          ),
        },
      })
      .then((res) => {
        activeStore.value.processIndexData(res.data);
        activeStore.value.records.value = res.data.records.map(
          (record: VObject) =>
            new GroupedRecordModel(
              record,
              new VStore(activeStore.value.api, activeStore.value.model)
            )
        );
        return res;
      });
  };

  const asyncQueryAndData = () => {
    activeStore.value.query.value = query.value;
    activeStore.value.subQuery.value = subQuery.value;
    activeStore.value.params.value = activeParams.value;
    activeStore.value.requestData.value = {
      collection_stat_condition: activeStatCondition.value.collection,
      resource_stat_condition: activeStatCondition.value.resource,
    };
  };

  watch(
    watchQuery,
    (value1, value2) => {
      if (JSON.stringify(value1) !== JSON.stringify(value2)) {
        asyncQueryAndData();
        // 配合 immediate: true，value2 等于 undefined 表示是初始化时，
        // 如果 autoFetch 为 true，表示在 mounted 已请求，此时退出
        // 目的是为了保证， temporaryQuery 在第一次请求时就进入 store.query
        if (value2 === undefined && props.autoFetch) return;
        fetchData(1);
      }
    },
    { deep: true, immediate: true }
  );

  watch(
    [activeStore, () => activeStore.value.api],
    ([newStore, newApi], [oldStore, oldApi]) => {
      if (isEqual(newStore, oldStore) && isEqual(newApi, oldApi)) return;
      asyncQueryAndData();
      fetchData(1);
    }
  );

  // if (activeApi) {
  //   watch(activeApi, () => {
  //     if (activeApi.value) {
  //       activeStore.value.api = activeApi.value;
  //     }
  //   });
  // }

  const useFetchDataMounted = async () => {
    // 如果之前已锁上，解锁，并请求数据

    if (fetchLocked.value) {
      fetchLocked.value = false;
      if (props.autoFetch) {
        await fetchData(1);
      }
    }
  };

  const silenceRefresh = () => {
    return fetchData(
      activeStore.value.currentPage.value,
      queryCache.value,
      activeStore.value.perPage.value,
      {
        silence: true,
      }
    );
  };

  const refresh = (page?: number) => {
    return fetchData(
      page || activeStore.value.currentPage.value,
      queryCache.value,
      activeStore.value.perPage.value,
      {}
    );
  };

  return {
    searcherQuery,
    query,
    subQuery,
    watchQuery,
    fetchData,
    refresh,
    silenceRefresh,
    useFetchDataMounted,
    fetchLocked,
  };
};

export default useFetchData;
