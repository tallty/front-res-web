<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';
import { useTaBuilderDesignerAlignToolHelper } from './useTaBuilderDesignerAlignToolHelper';
import { PropType } from 'vue';

const TaBuilderDesignerAlignTool = defineComponent({
  name: 'TaBuilderDesignerAlignTool',
  components: {},
  props: {
    value: { type: Object, default: () => ({}) },
    direction: { type: String as PropType<'vertical' | 'horizontal'>, default: 'horizontal' },
  },
  setup(props, { emit }) {
    // const localCssc = computed({
    //   get: () => props.value,
    //   set: val => emit('update:value', val),
    // });

    const { moveToX, moveToY } = useTaBuilderDesignerAlignToolHelper();

    const onClickPositionHorizontal = (index: number) => {
      switch (index) {
        case 1:
          moveToX('offset-1', 'horizontal');
          moveToY('offset-1', 'horizontal');
          break;
        case 2:
          moveToX('offset-2', 'horizontal');
          moveToY('offset-1', 'horizontal');
          break;
        case 3:
          moveToX('offset-3', 'horizontal');
          moveToY('offset-1', 'horizontal');
          break;
        case 4:
          moveToX('offset-1', 'horizontal');
          moveToY('offset-2', 'horizontal');
          break;
        case 5:
          moveToX('offset-2', 'horizontal');
          moveToY('offset-2', 'horizontal');
          break;
        case 6:
          moveToX('offset-3', 'horizontal');
          moveToY('offset-2', 'horizontal');
          break;
        case 7:
          moveToX('offset-1', 'horizontal');
          moveToY('offset-3', 'horizontal');
          break;
        case 8:
          moveToX('offset-2', 'horizontal');
          moveToY('offset-3', 'horizontal');
          break;
        case 9:
          moveToX('offset-3', 'horizontal');
          moveToY('offset-3', 'horizontal');
          break;
        default:
          break;
      }
    };

    // virtual rotate-90 index map
    //  7 4 1
    //  8 5 2
    //  9 6 3

    const onClickPositionVirtual = (index: number) => {
      switch (index) {
        case 1:
          moveToX('offset-3', 'vertical');
          moveToY('offset-1', 'vertical');
          break;
        case 2:
          moveToX('offset-3', 'vertical');
          moveToY('offset-2', 'vertical');
          break;
        case 3:
          moveToX('offset-3', 'vertical');
          moveToY('offset-3', 'vertical');
          break;
        case 4:
          moveToX('offset-2', 'vertical');
          moveToY('offset-1', 'vertical');
          break;
        case 5:
          moveToX('offset-2', 'vertical');
          moveToY('offset-2', 'vertical');
          break;
        case 6:
          moveToX('offset-2', 'vertical');
          moveToY('offset-3', 'vertical');
          break;
        case 7:
          moveToX('offset-1', 'vertical');
          moveToY('offset-1', 'vertical');

          break;
        case 8:
          moveToX('offset-1', 'vertical');
          moveToY('offset-2', 'vertical');
          break;
        case 9:
          moveToX('offset-1', 'vertical');
          moveToY('offset-3', 'vertical');
          break;
        default:
          break;
      }
    };

    const onClickPosition = (index: number) => {
      props.direction === 'horizontal'
        ? onClickPositionHorizontal(index)
        : onClickPositionVirtual(index);
    };

    const toXBetween = () => {
      props.direction === 'horizontal'
        ? moveToX('between', 'horizontal')
        : moveToY('between', 'vertical');
    };

    const toXAround = () => {
      props.direction === 'horizontal'
        ? moveToX('around', 'horizontal')
        : moveToY('around', 'vertical');
    };

    const toYTop = () => {
      props.direction === 'horizontal'
        ? moveToY('offset-1', 'horizontal')
        : moveToY('offset-1', 'vertical');
    };
    const toYCenter = () => {
      props.direction === 'horizontal'
        ? moveToY('offset-2', 'horizontal')
        : moveToY('offset-2', 'vertical');
    };
    const toYBottom = () => {
      props.direction === 'horizontal'
        ? moveToY('offset-3', 'horizontal')
        : moveToY('offset-3', 'vertical');
    };

    return {
      ...toRefs(props),
      onClickPosition,
      toXBetween,
      toXAround,
      toYTop,
      toYCenter,
      toYBottom,
    };
  },
});
export default TaBuilderDesignerAlignTool;
</script>

<template lang="pug">
.ta-builder-designer-align-tool
  .w-full.flex.h-8.pl-8
    .cursor-pointer.flex-grow.py-1.flex.justify-center.items-center(@click='toXBetween') 靠两边
    .cursor-pointer.flex-grow.py-1.flex.justify-center.items-center(@click='toXAround') 均分
  .flex.relative.ml-8
    .absolute.top-0.-left-8.flex-shrink-0.flex.flex-col.w-8.h-full
      .cursor-pointer.flex-grow.flex.justify-center.items-center(@click='toYTop') 上
      .cursor-pointer.flex-grow.flex.justify-center.items-center(@click='toYCenter') 中
      .cursor-pointer.flex-grow.flex.justify-center.items-center(@click='toYBottom') 下
    .h-0.w-full.relative(class='pb-1/1', :class='{ vertical: direction === "vertical" }')
      .w-full.h-full.grid.grid-cols-3.grid-rows-3.absolute.top-0.left-0.p-2.border.border-gray-200.rounded
        .hover-trigger.z-99.cursor-pointer(
          v-for='i in 9', :class='`hover-trigger-${i}`',
          @click='() => onClickPosition(i)'
        )

        //- vertical top
        .grid-container.position-left-top
          TaBuilderDesignerAlignToolFlag.flag.col-start-1.col-end-7.row-start-1.row-end-4(verticalAlign='top')

        .grid-container.position-center-top
          TaBuilderDesignerAlignToolFlag.flag.col-start-2.col-end-8.row-start-1.row-end-4(verticalAlign='top')

        .grid-container.position-right-top
          TaBuilderDesignerAlignToolFlag.flag.col-start-3.col-end-9.row-start-1.row-end-4(verticalAlign='top')

        //- vertical center
        .grid-container.position-left-center
          TaBuilderDesignerAlignToolFlag.flag.col-start-1.col-end-7.row-start-2.row-end-6(verticalAlign='center')

        .grid-container.position-center-center
          TaBuilderDesignerAlignToolFlag.flag.col-start-2.col-end-8.row-start-2.row-end-6(verticalAlign='center')

        .grid-container.position-right-center
          TaBuilderDesignerAlignToolFlag.flag.col-start-3.col-end-9.row-start-2.row-end-6(verticalAlign='center')

        //- vertical bottom
        .grid-container.position-left-bottom
          TaBuilderDesignerAlignToolFlag.flag.col-start-1.col-end-7.row-start-4.row-end-8(verticalAlign='bottom')

        .grid-container.position-center-bottom
          TaBuilderDesignerAlignToolFlag.flag.col-start-2.col-end-8.row-start-4.row-end-8(verticalAlign='bottom')

        .grid-container.position-right-bottom
          TaBuilderDesignerAlignToolFlag.flag.col-start-3.col-end-9.row-start-4.row-end-8(verticalAlign='bottom')


</template>

<style lang="stylus" scoped>
.grid-container
  @apply grid-cols-8 grid-rows-6 absolute top-0 left-0 h-full w-full grid opacity-0

.vertical
  @apply transform rotate-90
  >>> .num
    @apply transform -rotate-90
.hover-trigger-1
  &:hover ~ .position-left-top
    @apply opacity-100

.hover-trigger-2
  &:hover ~ .position-center-top
    @apply opacity-100

.hover-trigger-3
  &:hover ~ .position-right-top
    @apply opacity-100

.hover-trigger-4
  &:hover ~ .position-left-center
    @apply opacity-100

.hover-trigger-5
  &:hover ~ .position-center-center
    @apply opacity-100

.hover-trigger-6
  &:hover ~ .position-right-center
    @apply opacity-100


.hover-trigger-7
  &:hover ~ .position-left-bottom
    @apply opacity-100

.hover-trigger-8
  &:hover ~ .position-center-bottom
    @apply opacity-100

.hover-trigger-9
  &:hover ~ .position-right-bottom
    @apply opacity-100
</style>
