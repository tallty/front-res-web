<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';

const TaThreeCellLayout = defineComponent({
  name: 'TaThreeCellLayout',
  components: {},
  props: {
    leftWidth: { type: String, default: '240px' },
    headerHeight: { type: String, default: '65px' },
  },
  setup(props) {
    const contentHeight = computed(() => `calc(100% - ${props.headerHeight})`);
    return {
      ...toRefs(props),
      contentHeight,
    };
  },
});
export default TaThreeCellLayout;
</script>

<template lang="pug">
.ta-three-cell-layout
  .top
    slot(name='header')
  .content.flex
    .left-content
      slot(name='left-content')
    .right-content
      slot(name='right-content')
</template>

<style lang="stylus" scoped>
.ta-three-cell-layout
  width 100%
  flex-grow 1
  .top
    border-bottom 1px solid #e5e5e5
  .content
    height v-bind(contentHeight)
    .left-content
      flex-shrink 0
      flex-direction column
      border-right 1px solid #E5E5E5
      width v-bind(leftWidth)
    .right-content
      flex-grow 1
      flex-shrink 1
      flex-direction column
      min-width 0
      min-height 0
</style>
