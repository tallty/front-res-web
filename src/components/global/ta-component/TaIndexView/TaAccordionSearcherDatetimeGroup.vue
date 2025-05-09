<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed, watch } from 'vue';
import { VObject } from '@/lib/vails/model/index';
import { TaAccordionSearcherItemInterface } from './TaAccordionSearcher.vue';
import dayjs, { Dayjs } from 'dayjs';

let seq = 0;

const TaAccordionSearcherDatetimeGroup = defineComponent({
  name: 'TaAccordionSearcherDatetimeGroup',
  components: {},
  props: {
    items: { type: Array as PropType<TaAccordionSearcherItemInterface[]>, default: () => [] },
    searchKey: { type: String, required: true },
    searchLabel: { type: String, required: true },
    options: { type: Array as PropType<{ label: string; query: VObject }[]>, default: undefined },
    hideCustom: { type: Boolean, default: false },
    showTime: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const localItems = computed({
      get: () => props.items,
      set: val => emit('update:items', val),
    });

    // const predicateOptions = [
    //   { label: '等于', value: 'eq' },
    //   { label: '大于', value: 'gt' },
    //   { label: '大于等于', value: 'gteq' },
    //   { label: '小于', value: 'lt' },
    //   { label: '小于等于', value: 'lteq' },
    // ];

    const datetimeAry = ref<(null | Dayjs)[]>([null, null]);
    // const predicate = ref('');

    const disabled = computed(() => datetimeAry.value.filter(i => i).length < 2);
    const format = computed(() => (props.showTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'));

    const addItem = () => {
      if (disabled.value) return;
      const cache = [...localItems.value];
      // const predicateLabel = predicateOptions.find(opt => opt.value === predicate.value)?.label;
      // cache.push({
      //   key: `${props.searchKey}-${seq++}`,
      //   label: `${props.searchLabel}：${predicateLabel} ${datetime.value?.format(
      //     'YYYY-MM-DD HH:mm',
      //   )}`,
      //   query: {
      //     [`${props.searchKey}_${predicate.value}`]: datetime.value?.format(
      //       'YYYY-MM-DD HH:mm:ss Z',
      //     ),
      //   },
      // });
      cache.push({
        key: `${props.searchKey}-${seq++}`,
        label: `${props.searchLabel}：从 ${datetimeAry.value[0]?.format(
          format.value,
        )} 到 ${datetimeAry.value[1]?.format(format.value)}`,
        query: {
          [`${props.searchKey}_gteq`]: datetimeAry.value[0]?.format('YYYY-MM-DD HH:mm:ss Z'),
          [`${props.searchKey}_lteq`]: props.showTime
            ? datetimeAry.value[1]?.format('YYYY-MM-DD HH:mm:ss Z')
            : datetimeAry.value[1]?.endOf('day')?.format('YYYY-MM-DD HH:mm:ss Z'),
        },
      });
      localItems.value = cache;
    };

    const timeOptions = computed(() =>
      props.options
        ? props.options
        : [
            {
              label: '今天',
              query: {
                [`${props.searchKey}_gteq`]: dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss Z'),
                [`${props.searchKey}_lt`]: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss Z'),
              },
            },
            {
              label: '本周',
              query: {
                [`${props.searchKey}_gteq`]: dayjs()
                  .startOf('week')
                  .format('YYYY-MM-DD HH:mm:ss Z'),
                [`${props.searchKey}_lt`]: dayjs().endOf('week').format('YYYY-MM-DD HH:mm:ss Z'),
              },
            },
            {
              label: '本月',
              query: {
                [`${props.searchKey}_gteq`]: dayjs()
                  .startOf('month')
                  .format('YYYY-MM-DD HH:mm:ss Z'),
                [`${props.searchKey}_lt`]: dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss Z'),
              },
            },
            {
              label: '今年',
              query: {
                [`${props.searchKey}_gteq`]: dayjs()
                  .startOf('year')
                  .format('YYYY-MM-DD HH:mm:ss Z'),
                [`${props.searchKey}_lt`]: dayjs().endOf('year').format('YYYY-MM-DD HH:mm:ss Z'),
              },
            },
          ],
    );

    return {
      ...toRefs(props),
      localItems,
      datetimeAry,
      // predicate,
      // predicateOptions,
      addItem,
      disabled,
      timeOptions,
    };
  },
});
export default TaAccordionSearcherDatetimeGroup;
</script>

<template lang="pug">
.ta-accordion-searcher-number-group.flex.items-center.py-1.space-x-2.pr-4.flex-wrap
  TaAccordionSearcherSelectGroup.flex-shrink-0.max-w-full(
    v-model:items='localItems',
    :options='timeOptions',
    :searchKey='searchKey',
    :prefix='`${searchLabel}：`',
    :multiple='false',
  )
  .flex.items-center.flex-grow.space-x-2(v-if='!hideCustom')
    //- a-select.flex-shrink-0.w-25(v-model:value='predicate', :options='predicateOptions')
    a-range-picker.flex-grow(v-model:value='datetimeAry', placeholder='从到', :show-time='showTime', :allowClear='false')
    TaIcon.flex-shrink-0.h-6.w-6.text-gray-400.cursor-pointer(
      type='outline/plus-circle',
      :class='{ "cursor-not-allowed": disabled, "text-primary": !disabled }'
      @click='addItem',
    )
</template>

<style lang="stylus" scoped></style>
