<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed, watch } from 'vue';
import { VObject } from '@/lib/vails/model/index';
import { TaAccordionSearcherItemInterface } from './TaAccordionSearcher.vue';

const TaAccordionSearcherNumberGroup = defineComponent({
  name: 'TaAccordionSearcherNumberGroup',
  components: {},
  props: {
    items: { type: Array as PropType<TaAccordionSearcherItemInterface[]>, default: () => [] },
    searchKey: { type: String, required: true },
    searchLabel: { type: String, required: true },
    options: { type: Array as PropType<{ label: string; query: VObject }[]>, default: undefined },
    hideCustom: { type: Boolean, default: false },
    useRange: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const localItems = computed({
      get: () => props.items,
      set: val => emit('update:items', val),
    });

    let seq = 0;

    const predicateOptions = [
      { label: '等于', value: 'eq' },
      { label: '大于', value: 'gt' },
      { label: '大于等于', value: 'gteq' },
      { label: '小于', value: 'lt' },
      { label: '小于等于', value: 'lteq' },
    ];

    const keyword = ref(0);
    const keywordAry = ref<(number | null)[]>([null, null]);
    const predicate = ref('');

    const disabled = computed(() =>
      props.useRange
        ? keywordAry.value.filter((i: number | null) => i !== null).length !== 2
        : !((keyword.value || keyword.value === 0) && predicate.value),
    );

    const addItem = () => {
      if (disabled.value) return;
      const cache = [...localItems.value];
      if (props.useRange) {
        if (keywordAry.value.filter((i: number | null) => i !== null).length === 2) {
          cache.push({
            key: `${props.searchKey}-${seq++}`,
            label: `${props.searchLabel}：从 ${keywordAry.value[0]} 到 ${keywordAry.value[1]}`,
            query: {
              [`${props.searchKey}_gteq`]: keywordAry.value[0],
              [`${props.searchKey}_lteq`]: keywordAry.value[1],
            },
          });
        }
      } else {
        const predicateLabel = predicateOptions.find(opt => opt.value === predicate.value)?.label;
        cache.push({
          key: `${props.searchKey}-${seq++}`,
          label: `${props.searchLabel}：${predicateLabel} ${keyword.value}`,
          query: {
            [`${props.searchKey}_${predicate.value}`]: keyword.value,
          },
        });
      }
      localItems.value = cache;
    };

    return {
      ...toRefs(props),
      keyword,
      predicate,
      predicateOptions,
      keywordAry,
      addItem,
      disabled,
      localItems,
    };
  },
});
export default TaAccordionSearcherNumberGroup;
</script>

<template lang="pug">
.ta-accordion-searcher-number-group.flex.items-center.py-1.space-x-2.pr-4.flex-wrap
  TaAccordionSearcherSelectGroup.flex-shrink-0.max-w-full(
    v-if='options'
    v-model:items='localItems',
    :options='options',
    :searchKey='searchKey',
    :prefix='`${searchLabel}：`',
    :multiple='false',
  )
  .flex.items-center.flex-grow.space-x-2(v-if='!hideCustom')
    template(v-if='useRange')
      div 从
      a-input-number.flex-grow(v-model:value='keywordAry[0]', placeholder='请输入最小值', @keyup.enter='addItem')
      div 到
      a-input-number.flex-grow(v-model:value='keywordAry[1]', placeholder='请输入最大值', @keyup.enter='addItem')

    template(v-else)
      a-select.flex-shrink-0.w-25(v-model:value='predicate', :options='predicateOptions')
      a-input-number.flex-grow(v-model:value='keyword', placeholder='请输入期望值', @keyup.enter='addItem')

    TaIcon.flex-shrink-0.h-6.w-6.text-gray-400.cursor-pointer(
      type='outline/plus-circle',
      :class='{ "cursor-not-allowed": disabled, "text-primary": !disabled }'
      @click='addItem',
    )
</template>

<style lang="stylus" scoped></style>
