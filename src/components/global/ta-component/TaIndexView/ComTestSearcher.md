```vue
<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed } from 'vue';
import { TaAccordionSearcherItemInterface } from './ta-component/TaIndexView/TaAccordionSearcher.vue';

let seq = 1;

const ComTestSearcher = defineComponent({
  name: 'ComTestSearcher',
  components: {},
  props: {
    items: { type: Array as PropType<TaAccordionSearcherItemInterface[]>, default: () => [] },
  },
  setup(props, { emit }) {
    const localItems = computed({
      get: () => props.items,
      set: val => emit('update:items', val),
    });

    const addItem = (order: 'asc' | 'desc') => {
      if (!localItems.value) {
        localItems.value = [];
      }

      const cache = [...localItems.value];
      cache.push({
        key: `ComTestSearcher-${seq++}`,
        label: order,
        query: {
          s: [`id ${order}`],
        },
      });
      localItems.value = cache;
    };

    return {
      ...toRefs(props),
      addItem,
    };
  },
});
export default ComTestSearcher;
</script>

<template lang="pug">
.com-test-searcher
  h1(@click='addItem("desc")') 倒序
  h1(@click='addItem("asc")') 正序
</template>

<style lang="stylus" scoped></style>
```
