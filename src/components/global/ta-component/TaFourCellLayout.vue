<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';

const TaFourCellLayout = defineComponent({
  name: 'TaFourCellLayout',
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
export default TaFourCellLayout;
</script>

<template lang="pug">
.ta-four-cell-layout.flex
  .left
    .left-header.flex
      slot(name='left-header')
    .left-content
      slot(name='left-content')
  .right
    .right-header.flex
      slot(name='right-header')
    .right-content
      slot(name='right-content')
</template>

<style lang="stylus" scoped>
.ta-four-cell-layout
  width 100%
  flex-grow 1
  .left
    width v-bind(leftWidth)
    flex-shrink 0
    flex-direction column
    display flex
    border-right 1px solid #E5E5E5
    .left-header
      height v-bind(headerHeight)
      padding 0 20px
      border-bottom 1px solid #E5E5E5
      align-items center
      color #808080
      font-weight 500
      font-size 16px
    .left-content
      flex-grow 1
      // height v-bind(contentHeight)
      height 0
  .right
    flex-grow 1
    flex-shrink 1
    flex-direction column
    min-width 0
    display flex
    .right-header
      padding 0 20px
      height v-bind(headerHeight)
      flex-shrink 0
      border-bottom 1px solid #E5E5E5
      align-items center
      color #383838
      font-weight 500
      font-size 16px
    .right-content
      padding 20px
      height 0
      // height v-bind(contentHeight)
      flex-grow 1
</style>
