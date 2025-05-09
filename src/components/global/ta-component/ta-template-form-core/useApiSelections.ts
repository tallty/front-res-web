import { computed, watch } from 'vue';
import { VObject } from '@/lib/vails/model/index';
import { TaTemplateFormSelect } from './types';
import useConfigurableApi from './useConfigurableApi';
import { isEqual } from 'lodash-es';

const useApiSelections = (props: any) => {
  const { store } = useConfigurableApi(props);

  const selections = computed(
    () =>
      props.options ||
      ((Array.isArray(props.item?.options?.select) && props.item.options.select!.length) > 0
        ? props.item?.options?.select || []
        : store.records?.value?.map(
            (record: VObject): TaTemplateFormSelect => ({
              label: record[props.attrs?.[0] || 'name'],
              value: record.id,
            }),
          )) ||
      [],
  );

  watch(
    () => store.api,
    (newValue: VObject, oldValue?: VObject) => {
      if (!isEqual(newValue, oldValue) && props.path) {
        store.index({ per_page: 999999 });
      }
    },
    { immediate: true },
  );

  const options = computed(() => {
    const showSerial = props.item?.options?.showSerial;
    const labelType = showSerial ? props.item?.options?.serialType || 'number' : '';
    const prefix = 'A';
    return (selections?.value || [])
      ?.map((o: any, index: number) => {
        const labelPrefix =
          labelType === 'number'
            ? index + 1
            : `${String.fromCharCode(prefix.charCodeAt(0) + index)}`;
        return {
          label: showSerial ? `${labelPrefix}. ${o.label}` : o.label,
          value: o.value || o.value === 0 || o.value === null ? o.value : o.label,
        };
      })
      ?.filter((o: any) => o.label);
  });

  const findLabel = (val: any) => {
    return selections.value.find(
      (item: TaTemplateFormSelect) =>
        (item.value !== undefined && item.value === val) || item.label === val,
    )?.label;
  };

  return {
    selections,
    options,
    findLabel,
  };
};

export default useApiSelections;
