<script lang="ts">
import { ref, defineComponent, toRefs, computed, PropType } from 'vue';

const TaBuilderDesignerAlignToolFlag = defineComponent({
  name: 'TaBuilderDesignerAlignToolFlag',
  components: {},
  props: {
    verticalAlign: {
      type: String as PropType<'center' | 'top' | 'bottom' | 'stretch'>,
      default: 'center',
    },
  },
  setup(props) {
    const style = computed(() => {
      switch (props.verticalAlign) {
        case 'center':
          return { 'align-items': 'center' };
        case 'top':
          return { 'align-items': 'flex-start' };
        case 'bottom':
          return { 'align-items': 'flex-end' };

        default:
          return { 'align-items': 'center' };
      }
    });
    return {
      ...toRefs(props),
      style,
    };
  },
});
export default TaBuilderDesignerAlignToolFlag;
</script>

<template lang="pug">
.ta-builder-designer-align-tool-flag.grid.grid-cols-3.gap-1.h-full
  .shell.flex(:style='style')
    .bar.flex-center.text-white(class='h-3/5', :style='{ "height": verticalAlign === "stretch" ? "100" : null }')
      .num 1
  .shell.flex(:style='style')
    .bar.flex-center.text-white(class='h-9/10' :style='{ "height": verticalAlign === "stretch" ? "100" : null }')
      .num 2
  .shell.flex(:style='style')
    .bar.flex-center.text-white(class='h-3/4', :style='{ "height": verticalAlign === "stretch" ? "100" : null }')
      .num 3
</template>

<style lang="stylus" scoped>
.bar
  background $primary-color
  @apply w-full rounded
</style>
