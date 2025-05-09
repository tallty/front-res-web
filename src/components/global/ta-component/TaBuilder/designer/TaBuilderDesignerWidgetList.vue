<script lang="ts">
import { ref, defineComponent, toRefs, PropType, reactive, computed, nextTick } from 'vue';
import { TaBuilderComponent } from '../types';
import { widgetsWithGroup } from '../widgets';
import draggable from 'vuedraggable';
import useTaBuilderProcessItem from '../useTaBuilderProcessItem';
import { injectTaBuilderDesignerActiveItem } from './useActiveItem';
import { merge, cloneDeep } from 'lodash';
import { initRoot } from './initRoot';
import { useNewCell } from './useNewCell';

// vuedraggable:
//    https://github.com/SortableJS/Vue.Draggable

const TaBuilderDesignerWidgetList = defineComponent({
  name: 'TaBuilderDesignerWidgetList',
  components: { draggable },
  props: {
    value: { type: Array as PropType<Partial<TaBuilderComponent>[]>, required: true },
    canvasRef: { type: Object as PropType<HTMLElement>, required: true },
    root: { type: Object as PropType<TaBuilderComponent>, default: initRoot },
    rootWidgets: { type: Array as PropType<TaBuilderComponent[]>, default: () => [] },
  },
  setup(props, { emit }) {
    const visibleGhost = ref(false);
    const ghost = ref<Partial<TaBuilderComponent>>({});
    const ghostCoord = reactive({ x: 0, y: 0 });
    const coord = reactive({ x: 0, y: 0 });
    const widgetListRef = ref<any>(null);

    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const widgetMouseDown = (widget: Partial<TaBuilderComponent>, e: MouseEvent) => {
      e.preventDefault();
      visibleGhost.value = true;

      ghost.value = { ...cloneDeep(widget) };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseMoveCancel);
      props.canvasRef.addEventListener('mouseup', onMouseUp);
      props.canvasRef.addEventListener('mousemove', onCanvasMouseMove);
      onMouseMove(e);
    };

    const onMouseMoveCancel = () => {
      visibleGhost.value = false;
      document.removeEventListener('mousemove', onMouseMove);
      props.canvasRef.removeEventListener('mouseup', onMouseUp);
      props.canvasRef.removeEventListener('mousemove', onCanvasMouseMove);
    };

    const onMouseUp = () => {
      onMouseMoveCancel();
      generateCell(ghost.value);
    };

    const onMouseMove = (e: MouseEvent) => {
      ghostCoord.x = e.clientX - widgetListRef.value.offsetLeft;
      ghostCoord.y = e.clientY - widgetListRef.value.offsetTop;
    };

    const onCanvasMouseMove = (e: MouseEvent) => {
      const rect = props.canvasRef.getBoundingClientRect();
      coord.x = e.clientX - rect.x;
      coord.y = e.clientY - rect.y;
    };

    const { generateKey } = useTaBuilderProcessItem();
    const { addNewCell } = useNewCell();

    const generateCell = (
      widget: Partial<TaBuilderComponent>,
      parent_key = props.root.key,
      extra = {},
    ) => {
      const newCell = merge(
        {},
        widget,
        {
          name: `${widget.name} ${
            localValue.value.filter(
              (item: Partial<TaBuilderComponent>) =>
                item.key !== props.root.key && item.component === widget.component,
            ).length + 1
          }`,
          key: generateKey(),
          parent_key,
          cssc: {
            x: coord.x,
            y: coord.y,
            zIndex: localValue.value.length,
          },
        },
        extra,
      );

      addNewCell(newCell, localValue);
    };

    const { activeItem } = injectTaBuilderDesignerActiveItem();

    const onDblclick = (widget: Partial<TaBuilderComponent>) => {
      if (activeItem) {
        generateCell(widget, activeItem.value.key, { cssc: { x: 0, y: 0 } });
      }
    };

    return {
      ...toRefs(props),
      // widgets,
      widgetListRef,
      widgetMouseDown,
      visibleGhost,
      ghost,
      coord,
      ghostCoord,
      onDblclick,
      widgetsWithGroup,
    };
  },
});
export default TaBuilderDesignerWidgetList;
</script>

<template lang="pug">
.ta-search-designer-widget-list.relative(ref='widgetListRef')
  .widgets.grid.gap-2.gap-y-3.grid-cols-2
    template(v-for='widget in widgetsWithGroup')
      a-popover(v-if='widget.widgets?.length > 0',)
        template(#content)
          .grid.gap-2.gap-y-3.grid-cols-2
            template(v-for='widget in widget.widgets')
              .widget.bg-blue-gray-100.rounded.cursor-pointer.flex.items-center.justify-center.py-2.text-gray-500.text-sm(
                @mousedown='widgetMouseDown(widget, $event)'
                @dblclick='onDblclick(widget)'
              )
                img.w-30.h-30(v-if='widget.img', :src='widget.img')
                div(v-else) {{ widget.name }}
        .flex.justify-center.bg-blue-gray-100.rounded.py-2.text-gray-500.text-sm
          | {{ widget.name }}
      .widget.bg-blue-gray-100.rounded.py-2.text-gray-500.text-sm(
        v-else,
        @mousedown='widgetMouseDown(widget, $event)'
        @dblclick='onDblclick(widget)'
      ) {{ widget.name }}
  template(v-if='rootWidgets.length > 0')
    .line.border.border-gray-200.w-full.my-2
    .root-widgets.grid.gap-2.gap-y-3.grid-cols-2
      .root-widget.bg-blue-gray-100.rounded.py-2.text-gray-500.text-sm(
        v-for='widget in rootWidgets',
        @mousedown='widgetMouseDown(widget, $event)'
        @dblclick='onDblclick(widget)'
      ) {{ widget.name }}

  .ghost.min-w-20.flex-center.bg-blue-gray-100.rounded.py-2.text-gray-500.z-10000.fixed(
    v-if='visibleGhost',
    :style='{ top: `${ghostCoord.y + 100}px`, left: `${ghostCoord.x + 10}px` }'
  )
    | {{ ghost.name }}

</template>

<style lang="stylus" scoped>
.ta-search-designer-widget-list
  .widget, .root-widget
    text-align center
    cursor pointer
    &:hover
      color $primary-color
</style>
