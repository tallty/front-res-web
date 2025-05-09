import { VStore } from '@/lib/vails/store/index';
import { Ref, computed, ref } from 'vue';
import { VObject } from '@/lib/vails/model/index';
import {
  TaTemplateFormColumnAttribute,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';
import { merge } from 'lodash-es';

export const useTaIndexViewFilter = (templateRef: Ref<TaTemplateFormItem>) => {
  const filterValues = ref<VObject>({});
  const filters = computed(() =>
    (templateRef.value.column_attributes || [])
      .filter((attr: TaTemplateFormColumnAttribute) => attr.filtered)
      .map((attr: TaTemplateFormColumnAttribute) => ({
        ...attr,
        filterRansackMap: (attr.filteredDetails || []).reduce(
          (out: VObject, item: VObject) => {
            out[item.label] = item.ransack;
            return out;
          },
          {}
        ),
      }))
  );

  const dataIndex2FilterItemMap = computed(() =>
    filters.value.reduce(
      (out: VObject, column: TaTemplateFormColumnAttribute) => {
        out[column.dataIndex] = column;
        return out;
      },
      {}
    )
  );

  const onFilter = (
    value: string,
    filterItem: TaTemplateFormColumnAttribute
  ) => {
    filterValues.value[filterItem.dataIndex] = value;
  };

  const cancelFilter = (filterItem: TaTemplateFormColumnAttribute) => {
    filterValues.value[filterItem.dataIndex] = undefined;
  };

  const filterQuery = computed(() => ({
    ...Object.keys(filterValues.value).reduce(
      (out: VObject, dataIndex: string) => {
        if (
          filterValues.value[dataIndex] &&
          dataIndex2FilterItemMap.value[dataIndex].filterRansackMap &&
          dataIndex2FilterItemMap.value[dataIndex].filterRansackMap[
            filterValues.value[dataIndex]
          ]
        ) {
          merge(
            out,
            dataIndex2FilterItemMap.value[dataIndex].filterRansackMap[
              filterValues.value[dataIndex]
            ]
          );
        } else {
          out[`${dataIndex}_eq`] = filterValues.value[dataIndex];
        }

        return out;
      },
      {}
    ),
  }));

  return {
    filters,
    filterValues,
    onFilter,
    cancelFilter,
    filterQuery,
  };
};
