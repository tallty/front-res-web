<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';
import { injectTaBuilderDesignerActiveItem } from './useActiveItem';

const TaBuilderMeasuringScale = defineComponent({
  name: 'TaBuilderMeasuringScale',
  components: {},
  props: {
    rootItem: { type: Object, default: () => ({}) },
  },
  setup(props, { emit }) {
    const widthCount = computed(() => Math.ceil((props.rootItem.cssc.w || 0) / 50));
    const heightCount = computed(() => Math.ceil((props.rootItem.cssc.h || 0) / 50));

    const { activeItem, activeRootKey } = injectTaBuilderDesignerActiveItem();

    const activeCoord = computed(() =>
      activeItem && activeRootKey.value !== activeItem?.value?.key
        ? {
            width: `${activeItem.value.cssc?.x || 0}px`,
            height: `${activeItem.value.cssc?.y || 0}px`,
          }
        : {},
    );

    return {
      ...toRefs(props),
      widthCount,
      heightCount,
      activeItem,
      activeCoord,
    };
  },
});
export default TaBuilderMeasuringScale;
</script>

<template lang="pug">
.ta-builder-measuring-scale.flex.flex-col.w-full.h-full.overflow-auto
  .flex-shrink-0.ml-6.h-6.flex.sticky.top-0.cursor-pointer.z-400(@click.stop='onClickScale')
    .scale.border.border-gray-700.flex.relative.items-end.bg-blue-gray-100(v-for='i in widthCount', class='w-[50px]')
      .absolute.top-0.right-0.text-xs {{ i * 50 }}
      .line.w-0.border-gray-700(v-for='index in 10', :class='index % 2 === 1 ? "h-1 ml-[4px]" : "h-2 ml-[4px]"')
  .flex-grow.h-0.flex
    //- (:style='{ "min-width": `${rootItem?.cssc?.w}px` }')
    .flex-shrink-0.w-6.sticky.left-0.cursor-pointer.z-400(@click.stop='onClickScale')
      .scale.border.border-gray-700.relative.flex.flex-col.bg-blue-gray-100(
        v-for='i in heightCount', class='h-[50px]',
      )
        .absolute.bottom-0.left-0.text-xs {{ i * 50 }}
        .line-col.h-0.border-gray-700(v-for='index in 10', :class='index % 2 === 1 ? "w-1 mt-[4px]" : "w-2 mt-[4px]"')

    .flex-grow.flex-shrink-0.relative(
      :style='{ width: `${rootItem?.cssc?.w}px`, height: `${rootItem?.cssc?.h}px` }'
    )
      .absolute.top-0.left-0.coord-line.border.z-400.pointer-events-none(:style='activeCoord')
        .coord.absolute.bottom-0.right-0(
          v-if='activeItem?.cssc?.x && activeItem?.cssc?.y'
        )
          | {{ (activeItem.cssc.x.toFixed(2)) }}, {{ (activeItem.cssc.y).toFixed(2) }}
      slot


</template>

<style lang="stylus" scoped>
.ta-builder-measuring-scale
  .line
    border-right 1px solid
  .line-col
    border-top 1px solid
  .coord-line
    border-right 1px dashed $primary-color
    border-bottom 1px dashed $primary-color
    border-top 0px
    border-left 0px
  .coord
    color $primary-color
</style>
