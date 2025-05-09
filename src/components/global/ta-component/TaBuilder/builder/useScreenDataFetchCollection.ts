import { useConfigurableApiWithContext } from '@/components/global/ta-component/ta-template-form-core/useConfigurableApi';
import { useContextInject } from '@/components/global/ta-component/ta-template-form-core/useContext';
import { SLOT_ARGUMENTS_KEY } from '@/components/global/ta-component/TaBuilder/builder/defineTaBuilderCellComponent';
import { ComScreenDesignerConfigDataSource } from '@/components/global/ta-component/TaBuilder/builder/useScreenDesignerConfig';
import { VObject } from '@/lib/vails/model/index';
import { Method } from 'axios';
import jsonata from 'jsonata';
import { maxBy, merge, set } from 'lodash-es';
import { computed, ComputedRef, inject, provide, ref, Ref } from 'vue';
import { MetaUserMetaRecordsApi } from '../apis/meta/user/meta_records.api';

const KEY = 'useScreenDataFetchCollection';
const DATA_SOURCE_COLLECTION_MAPPING_KEY =
  'useScreenDataFetchCollectionDataSourceCollectionMapping';

export const useScreenDataFetchCollectionProvide = (init = {}) => {
  const dataResult = ref<VObject>(init);
  const dataSourceCollectionMapping = ref<Record<string, VObject[]>>({});

  provide(KEY, dataResult);
  provide(DATA_SOURCE_COLLECTION_MAPPING_KEY, dataSourceCollectionMapping);

  const dataSourceCollection = computed(() => {
    return Object.values(dataSourceCollectionMapping.value).reduce((acc, val) => {
      return acc.concat(val);
    }, []);
  });

  return { dataResult, dataSourceCollectionMapping, dataSourceCollection };
};

export const useScreenDataFetchCollectionInject = (extra: any) => {
  const dataResult = inject<Ref<VObject> | null>(KEY, null);
  const dataSourceCollectionMapping = inject<Ref<VObject> | null>(
    DATA_SOURCE_COLLECTION_MAPPING_KEY,
    null,
  );

  const dataSourceCollection = computed(() => {
    return Object.values(dataSourceCollectionMapping?.value || {}).reduce((acc, val) => {
      return acc.concat(val);
    }, []);
  });

  const parentSlotArguments = inject<ComputedRef<VObject> | null>(SLOT_ARGUMENTS_KEY, null);
  const slotArguments = computed(() => extra.slotArguments);

  const getScreenData = (dataObject: VObject, modelKeyPrefix: string) => {
    const key = dataObject[[modelKeyPrefix, 'dataKey'].filter(i => i).join(':')];
    const sourceKey = dataObject[[modelKeyPrefix, 'dataSource'].filter(i => i).join(':')];
    const staticValue = dataObject[[modelKeyPrefix, 'dataStatic'].filter(i => i).join(':')];
    if (dataResult) {
      try {
        const result = getScreenDataByKey(key, sourceKey);
        // console.log(result, 'result', key, result == 0 ? result : result || staticValue);
        return result == 0 ? result : result || staticValue;
      } catch {
        return staticValue;
      }
    } else {
      return staticValue;
    }
  };

  const getScreenDataByKey = (key: string, sourceKey?: string) => {
    if (dataResult) {
      const valueSource = dataResult.value[sourceKey || ''] || dataResult.value || {};

      return jsonata(key).evaluate({
        $$: dataResult.value,
        ...valueSource,
        ...merge({}, parentSlotArguments?.value || {}, slotArguments.value),
      });
    }
    return undefined;
  };

  const setScreenData = (key: string, value: any) => {
    if (dataResult) {
      set(dataResult.value, key, value);
      (dataResult as any)._dirty = true;
    }
  };

  return {
    dataResult,
    dataSourceCollectionMapping,
    dataSourceCollection,
    getScreenData,
    setScreenData,
    getScreenDataByKey,
  };
};
export const nowYearMonthDay = () => {
  const _d = new Date();
  const result = [];
  for (let i = 0; i < 12; i++) {
    let _m: string | number = i + 1;
    _m = _m < 10 ? '0' + _m : _m;
    result.push(_d.getFullYear() + '-' + _m + '-01');
  }
  return result;
};
export const useFetchScreenData = () => {
  const {
    getScreenDataByKey,
    dataSourceCollectionMapping,
    dataSourceCollection,
    dataResult,
  } = useScreenDataFetchCollectionInject({});

  const { context } = useContextInject();

  const fetchScreenData = (
    dataSource: ComScreenDesignerConfigDataSource[],
    dataResult: Ref<VObject>,
  ) => {
    if (dataResult) {
      (dataSource || []).forEach((source: ComScreenDesignerConfigDataSource) =>
        fetchScreenDataBySource(source, dataResult),
      );
    }
  };

  const refreshAll = () => {
    if (dataResult) {
      fetchScreenData(dataSourceCollection.value, dataResult);
    }
  };

  const refreshCurrent = (
    _id = maxBy(Object.keys(dataSourceCollectionMapping?.value || {}), (s: string) => Number(s)),
  ) => {
    if (dataResult && dataSourceCollectionMapping && _id) {
      fetchScreenData(dataSourceCollectionMapping.value[_id] || [], dataResult);
    }
  };

  const fetchScreenDataBySource = (
    source: ComScreenDesignerConfigDataSource,
    dataResult: Ref<VObject>,
  ) => {
    if (
      source.static &&
      typeof source.static === 'object' &&
      !Array.isArray(source.static) &&
      Object.keys(source.static).length > 0
    ) {
      dataResult.value[source._id] = source.static;
    } else if (source.path) {
      const { store, insertContext } = useConfigurableApiWithContext(
        { path: source.path },
        { ...context, ...dataResult.value },
      );
      const api = store.api;

      const params =
        (source.dataKey && getScreenDataByKey(source.dataKey, source.dataSource)) ||
        JSON.parse(insertContext(JSON.stringify(source.params || {})));
      const url = insertContext(source.path);
      // if (source.method === 'POST' || !source.method) {
      //   api.mode = 'single';
      // }
      api.request
        .run({
          method: (source.method || 'POST') as Method,
          url,
          [(source.method || 'POST') === 'GET' ? 'params' : 'data']: params,
        })
        .then(res => {
          if (source.path === '/plan/api/tokens/period_stat') {
            dataResult.value[source._id] = res.data;
            dataResult.value[source._id].total_count =
              (res.data?.done_count || 0) +
              (res.data?.overed_count || 0) +
              (res.data?.undo_count || 0);
            dataResult.value[source._id].xAxis = nowYearMonthDay();
            dataResult.value[source._id].done_data = dataResult.value[source._id].xAxis.map(
              (x: string) => res.data.done_stat[x] || '',
            );
            dataResult.value[source._id].overed_data = dataResult.value[source._id].xAxis.map(
              (x: string) => res.data.overed_stat[x] || '',
            );
            dataResult.value[source._id].undo_data = dataResult.value[source._id].xAxis.map(
              (x: string) => res.data.undo_stat[x] || '',
            );
            dataResult.value[source._id].xAxis = [
              '1月',
              '2月',
              '3月',
              '4月',
              '5月',
              '6月',
              '7月',
              '8月',
              '9月',
              '10月',
              '11月',
              '12月',
            ];
          } else {
            dataResult.value[source._id] = res.data;
          }
        });
    } else if (source.aggregation) {
      new MetaUserMetaRecordsApi()
        .sendCollectionAction('aggregate', {
          data: { meta_record: source.aggregation },
        })
        .then(({ data }) => {
          dataResult.value[source._id] = data;
        });
    }

    if (source.interval) {
      setTimeout(() => fetchScreenDataBySource(source, dataResult), source.interval);
    }
  };

  return { fetchScreenData, fetchScreenDataBySource, refreshAll, refreshCurrent };
};
