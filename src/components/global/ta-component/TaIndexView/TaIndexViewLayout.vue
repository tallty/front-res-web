<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import { TaIndexViewLayoutDirection } from './ta-index-view-core/types';

const layoutConfigMap: Record<
  TaIndexViewLayoutDirection,
  { 'flex-direction': string; direction: string }
> = {
  'left-to-right': { 'flex-direction': 'row', direction: 'horizontal' },
  'right-to-left': { 'flex-direction': 'row-reverse', direction: 'horizontal' },
  'top-to-bottom': { 'flex-direction': 'column', direction: 'virtual' },
  'bottom-to-top': { 'flex-direction': 'column-reverse', direction: 'virtual' },
};

const TaIndexViewLayout = defineComponent({
  name: 'TaIndexViewLayout',
  components: {},
  props: {
    tabsLayoutDirection: {
      type: String as PropType<TaIndexViewLayoutDirection>,
      default: 'top-to-bottom',
    },
    tagsLayoutDirection: {
      type: String as PropType<TaIndexViewLayoutDirection>,
      default: 'top-to-bottom',
    },
    scroll: {
      type: Object as PropType<{ x?: string; y?: string } | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    const tabsHeightOrWidth0 = computed(() =>
      (props.tabsLayoutDirection.includes('right') ? props.scroll?.x : props.scroll?.y) === 'auto'
        ? {
            [props.tabsLayoutDirection.includes('right') ? 'width' : 'height']: 0,
            [props.tabsLayoutDirection.includes('right') ? 'height' : 'width']: '100%',
          }
        : {},
    );

    const tagsHeightOrWidth0 = computed(() =>
      (props.tabsLayoutDirection.includes('right') ? props.scroll?.x : props.scroll?.y) === 'auto'
        ? {
            [props.tagsLayoutDirection.includes('right') ? 'width' : 'height']: 0,
            [props.tagsLayoutDirection.includes('right') ? 'height' : 'width']: '100%',
          }
        : {},
    );

    return {
      ...toRefs(props),
      layoutConfigMap,
      tabsHeightOrWidth0,
      tagsHeightOrWidth0,
    };
  },
});
export default TaIndexViewLayout;
</script>

<template lang="pug">
.ta-index-view-layout.tabs-flex.flex-grow.w-full.h-full(
  :style='{ "flex-direction": layoutConfigMap[tabsLayoutDirection]["flex-direction"] }'
)
  slot(:name='`${layoutConfigMap[tabsLayoutDirection].direction}_layout_tabs`')
  .tags-flex.flex-grow(
    :style='{ "flex-direction": layoutConfigMap[tagsLayoutDirection]["flex-direction"], ...tabsHeightOrWidth0 }'
  )
    slot(:name='`${layoutConfigMap[tagsLayoutDirection].direction}_layout_tags`')
    .ta-index-view-layout-content.flex-grow(:style='tagsHeightOrWidth0')
      slot(name='content')
</template>

<style lang="stylus" scoped>
.tabs-flex, .tags-flex
  width 100%
  height 100%
  display flex
</style>
