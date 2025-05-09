<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed, watch } from 'vue';
import { VObject } from '@/lib/vails/model/index';
import { TaAccordionSearcherItemInterface } from './TaAccordionSearcher.vue';

const TaAccordionSearcherStringGroup = defineComponent({
  name: 'TaAccordionSearcherStringGroup',
  components: {},
  props: {
    items: { type: Array as PropType<TaAccordionSearcherItemInterface[]>, default: () => [] },
    searchKey: { type: String, required: true },
    searchLabel: { type: String, required: true },
    options: { type: Array as PropType<{ label: string; query: VObject }[]>, default: undefined },
    hideCustom: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const localItems = computed({
      get: () => props.items,
      set: val => emit('update:items', val),
    });

    let seq = 0;

    const predicateOptions = [
      { label: '包含', value: 'cont' },
      { label: '等于', value: 'eq' },
      { label: '不等于', value: 'not_eq' },
    ];

    const keyword = ref('');
    const predicate = ref('cont');

    const disabled = computed(() => !(keyword.value && predicate.value));

    const addItem = () => {
      if (disabled.value) return;
      const cache = [...localItems.value];
      const predicateLabel = predicateOptions.find(opt => opt.value === predicate.value)?.label;
      cache.push({
        key: `${props.searchKey}-${seq++}`,
        label: `${props.searchLabel}：${predicateLabel} ${keyword.value}`,
        query: {
          [`${props.searchKey}_${predicate.value}`]: keyword.value,
        },
      });
      localItems.value = cache;
    };

    return {
      ...toRefs(props),
      keyword,
      predicate,
      predicateOptions,
      addItem,
      disabled,
      localItems,
    };
  },
});
export default TaAccordionSearcherStringGroup;
</script>

<template lang="pug">
.ta-accordion-searcher-string-group.flex.items-center.py-1.space-x-2.pr-4.flex-wrap
  TaAccordionSearcherSelectGroup.flex-shrink-0.max-w-full(
    v-if='options'
    v-model:items='localItems',
    :options='options',
    :searchKey='searchKey',
    :prefix='`${searchLabel}：`',
    :multiple='false',
  )
  .flex.items-center.flex-grow.space-x-2(v-if='!hideCustom')
    a-select.flex-shrink-0.w-25(v-model:value='predicate', :options='predicateOptions')
    a-input.flex-grow(v-model:value='keyword', placeholder='请输入期望值', @keyup.enter='addItem')
    TaIcon.flex-shrink-0.h-6.w-6.text-gray-400.cursor-pointer(
      type='outline/plus-circle',
      :class='{ "cursor-not-allowed": disabled, "text-primary": !disabled }'
      @click='addItem',
    )
</template>

<style lang="stylus" scoped></style>
