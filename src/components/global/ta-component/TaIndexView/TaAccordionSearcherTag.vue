<script lang="ts">
import { defineComponent, toRefs } from 'vue';

const TaAccordionSearcherTag = defineComponent({
  name: 'TaAccordionSearcherTag',
  components: {},
  props: {
    active: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    return {
      ...toRefs(props),
    };
  },
});
export default TaAccordionSearcherTag;
</script>

<template lang="pug">
.ta-accordion-searcher-tag.flex.items-center.justify-center.py-1.px-4.bg-blue-gray-50.text-gary-400.rounded.flex-shrink-0.mr-4(
  :class='{ active }'
)
  slot
</template>

<style lang="stylus" scoped>
.active
  background $primary-color
  color white
.ta-accordion-searcher-tag
  width fit-content
</style>
