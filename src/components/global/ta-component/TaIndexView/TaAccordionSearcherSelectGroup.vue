<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import { VObject } from '@/lib/vails/model/index';
import { TaAccordionSearcherItemInterface } from './TaAccordionSearcher.vue';
import useApiSelections from '@/components/global/ta-component/ta-template-form-core/useApiSelections';

const TaAccordionSearcherSelectGroup = defineComponent({
  name: 'TaAccordionSearcherSelectGroup',
  components: {},
  props: {
    items: { type: Array as PropType<TaAccordionSearcherItemInterface[]>, default: () => [] },
    searchKey: { type: String, required: true },
    select: { type: Array as PropType<{ label: string; value?: string }[]>, default: () => [] },
    options: {
      type: Array as PropType<{ label: string; query: VObject }[]>,
      default: () => undefined,
    },
    multiple: { type: Boolean, default: false },
    prefix: { type: String, default: '' },
    path: { type: String, default: '' },
    ransackStr: { type: String, default: '' },
  },
  setup(props, { emit }) {
    const { selections: apiSelect } = useApiSelections(props);

    const localItems = computed({
      get: () => props.items,
      set: val => emit('update:items', val),
    });

    const finalSelect = computed(() => {
      if (props.select.length === 0 && props.path) {
        return apiSelect.value;
      }
      return props.select;
    });

    const searchItems = computed<TaAccordionSearcherItemInterface[]>(() =>
      ([] as TaAccordionSearcherItemInterface[]).concat(
        finalSelect.value
          .map((item: { label: string; value?: string }, index: number) => ({
            key: `${props.searchKey}-select-${index}`,
            label: item.label,
            query: {
              [`${props.searchKey}_in`]: [item.value === undefined ? item.label : item.value],
            },
          }))
          .concat(
            (props.options || []).map((item: { label: string; query: VObject }, index: number) => ({
              key: `${props.searchKey}-options-${index}`,
              label: item.label,
              query: item.query,
            })),
          ),
      ),
    );

    const onClick = (item: TaAccordionSearcherItemInterface) => {
      if (props.multiple) {
        const cache = [...localItems.value];
        const existsIndex = cache.findIndex(
          (i: TaAccordionSearcherItemInterface) => i.key === item.key,
        );
        if (existsIndex > -1) {
          cache.splice(existsIndex, 1);
        } else {
          cache.push({ ...item, label: `${props.prefix}${item.label}` });
        }
        localItems.value = cache;
      } else {
        if (localItems.value.map((i: TaAccordionSearcherItemInterface) => i.key) === [item.key]) {
          localItems.value = [];
        } else {
          localItems.value = [{ ...item, label: `${props.prefix}${item.label}` }];
        }
      }
    };

    return {
      ...toRefs(props),
      searchItems,
      onClick,
      localItems,
    };
  },
});
export default TaAccordionSearcherSelectGroup;
</script>

<template lang="pug">
.ta-accordion-searcher-select-group.flex.flex-wrap.items-center.py-1
  TaAccordionSearcherTag.cursor-pointer.my-1(
    :active='localItems.length === 0',
    @click='() => localItems = []'
  )
    | 全部

  TaAccordionSearcherTag.cursor-pointer.my-1(
    v-for='item in searchItems'
    :active='localItems.map(i => i.key).includes(item.key)'
    @click='() => onClick(item)'
  )
    | {{ item.label }}
</template>

<style lang="stylus" scoped></style>
