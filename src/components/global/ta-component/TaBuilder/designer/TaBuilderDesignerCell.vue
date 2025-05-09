<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed, reactive, watch, nextTick } from 'vue';
import { TaBuilderComponent } from '../types';

import Vue3DraggableResizable from '../vue3-draggable-resizable/Vue3DraggableResizable';
import '../vue3-draggable-resizable/index.css';
// import TaBuilderDesignerGroup from './TaBuilderDesignerGroup.vue';
import DraggableContainer from '../vue3-draggable-resizable/DraggableContainer';
import { injectTaBuilderDesignerActiveItem } from './useActiveItem';
import { useLayerPosition } from './useLayerPosition';

const TaBuilderDesignerCell = defineComponent({
  name: 'TaBuilderDesignerCell',
  components: {
    Vue3DraggableResizable,
    DraggableContainer,
  },
  props: {
    value: { type: Object as PropType<TaBuilderComponent>, default: () => ({}) },
    initW: { type: Number, default: 100 },
    initH: { type: Number, default: 100 },
    draggable: { type: Boolean, default: true },
    resizable: { type: Boolean, default: true },
    root: { type: Boolean, default: false },
    cellAttrs: { type: Object, default: () => ({}) },
  },
  emits: ['update:value', 'update:activeItem', 'reportConfig', 'delete'],
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const componentRef = ref<any>(null);
    const hasChildren = computed(() => checkHasChildren(localValue.value));

    const checkHasChildren = (item: TaBuilderComponent) => (item.children?.length || 0) > 0;

    const { activeItem, activeItemMeta, activeRootKey } = injectTaBuilderDesignerActiveItem();

    const onActivated = () => {
      if (activeItem) {
        activeItem.value = localValue.value;
      }
      if (activeItemMeta) {
        activeItemMeta.value.componentRef = componentRef.value?.componentRef;
      }

      locked.value = false;
    };

    const active = computed(() => props.value.key === activeItem?.value?.key);

    watch(
      () => props.draggable,
      () => {
        if (!props.draggable && !props.root) {
          (localValue.value.children || []).forEach((child: TaBuilderComponent) => {
            child.cssc.x = 0;
            child.cssc.y = 0;
          });
        }
      },
      { immediate: true },
    );

    const onDelete = (cell: TaBuilderComponent) => {
      if (activeItemMeta) {
        activeItemMeta.value.drawerRef.removeCell(cell);
      }
    };

    const onAddToRoot = (cell: TaBuilderComponent) => {
      if (activeItemMeta) {
        activeItemMeta.value.drawerRef.addToRoot(cell);
      }
    };

    const onClick = (e: Event) => {
      // if (!(activeItemMeta && props.value.key === activeItemMeta.value.activeEditableParentKey))
      if (editable.value) {
        e.stopPropagation();
      }
      // console.log(props.cellAttrs.draggable, 'props.cellAttrs.draggable');

      if (!props.cellAttrs.draggable) {
        onActivated();
      }
    };

    const fakeProps = reactive({
      componentSchema: localValue.value,
    });

    watch(
      localValue,
      () => {
        fakeProps.componentSchema = localValue.value;
      },
      { deep: true, immediate: true },
    );

    const editable = computed(() => {
      if (activeItemMeta) {
        return (activeItemMeta.value.drawerRef?.editableKeys || []).includes(props.value.key);
      }
      return false;
    });

    const onClickOutside = () => {
      // if (active.value && activeItem && activeItemMeta) {
      // 这里可能要限定在 drawer 画布范围
      // activeItem.value = activeItemMeta.value.drawerRef.activeRoot;
      // activeItemMeta.value.activeEditableParentKey =
      //   activeItemMeta.value.drawerRef.activeRoot.key;
      // }
    };

    const onDoubleClick = (e: any) => {
      e.preventDefault();
      // console.log('double click');
      if (activeItemMeta && activeItem) {
        // e.stopPropagation();
        if (active.value) {
          e.stopPropagation();
          // activeItemMeta.value.activeEditableParentKey = props.value.key;

          // 切换 root
          activeRootKey.value = props.value.key;
          nextTick(() => {
            activeItemMeta.value.drawerRef.$forceUpdate();
          });

          // 选择离鼠标最近的元素
          // if ((props.value.children?.length || 0) > 0) {
          //   const mouseX = e.clientX - activeItemMeta.value.drawerRef.canvasLeft;
          //   const mouseY = e.clientY - activeItemMeta.value.drawerRef.canvasTop;

          //   activeItem.value = [...props.value.children!].sort(
          //     (a: TaBuilderComponent, b: TaBuilderComponent) => {
          //       return calculateDirection(mouseX, mouseY, a) > calculateDirection(mouseX, mouseY, b)
          //         ? -1
          //         : 1;
          //     },
          //   )[0];
          // }
        }
      }
    };

    // const calculateDirection = (mouseX: number, mouseY: number, i: TaBuilderComponent) => {
    //   return [
    //     ((i.cssc.x || 0) - mouseX) ** 2 + ((i.cssc.y || 0) - mouseY) ** 2,
    //     ((i.cssc.x || 0) + (i.cssc.w || 0) - mouseX) ** 2 + ((i.cssc.y || 0) - mouseY) ** 2,
    //     ((i.cssc.x || 0) + (i.cssc.w || 0) - mouseX) ** 2 +
    //       ((i.cssc.y || 0) + (i.cssc.h || 0) - mouseY) ** 2,
    //     ((i.cssc.x || 0) - mouseX) ** 2 + ((i.cssc.y || 0) + (i.cssc.h || 0) - mouseY) ** 2,
    //   ].sort()[3];
    // };

    const locked = ref(true);
    const onDeactivated = () => (locked.value = true);

    const localResizable = computed(() => {
      return props.resizable && !locked.value;
    });

    const checkActiveSlot = (item: TaBuilderComponent) => {
      return activeItemMeta?.value?.activeSlotKey
        ? item.slot === activeItemMeta.value.activeSlotKey
        : !item.slot;
    };

    const { getContainerPosition, getCellAttrs } = useLayerPosition();
    const containerComponent = computed(() => getContainerPosition(props.value));
    const childCellAttrs = computed(() => getCellAttrs(props.value));

    return {
      ...toRefs(props),
      componentRef,
      localValue,
      onActivated,
      active,
      hasChildren,
      activeItem,
      onDelete,
      onClick,

      onAddToRoot,
      checkHasChildren,

      editable,
      onClickOutside,
      onDoubleClick,

      localResizable,
      onDeactivated,

      activeItemMeta,
      locked,

      checkActiveSlot,

      containerComponent,
      childCellAttrs,
    };
  },
});
export default TaBuilderDesignerCell;
</script>

<template lang="pug">
Vue3DraggableResizable.ta-screen-designer-cell(
  :initW="initW",
  :initH="initH",
  :minW='0',
  :minH='0',
  :scale="1"
  v-model:x="localValue.cssc.x"
  v-model:y="localValue.cssc.y"
  v-model:w="localValue.cssc.w"
  v-model:h="localValue.cssc.h"
  :active='active'
  :draggable="draggable && editable"
  :resizable="localResizable && editable"
  :class='{ active, editable }'
  :parent='!root'
  :style='{ "z-index": 10 + localValue.cssc.zIndex }'

  v-click-outside='onClickOutside',
  @click='onClick',
  @dblclick='onDoubleClick'
  @activated='onActivated',
  @deactivated='onDeactivated'
  v-bind='cellAttrs'
)
  component(:is='containerComponent')
    TaBuilderTreeNode(ref='componentRef', :isDesignerUseDefaultProps='true', :componentSchema='localValue')
      a-dropdown(
        trigger='contextmenu',
        @contextmenu.stop='',
        v-for='(item, index) in localValue.children',
      )
        template(#overlay)
          a-menu
            a-menu-item(@click.stop='() => onDelete(item)') 删除{{ item.name }}
            a-menu-item(
              v-if='checkHasChildren(item)',
              @click.stop='() => onAddToRoot(item)'
            ) 添加分组
        TaBuilderDesignerCell(
          v-model:value='localValue.children[index]',
          v-if='checkActiveSlot(localValue.children[index])',
          :key='item.key',
          :initW='item.cssc.w || 100',
          :initH='item.cssc.h || 100',
          :cellAttrs='childCellAttrs',
        )

</template>

<style lang="stylus" scoped>
.editable
  border 1px dashed
  @apply border-blue-gray-200
.active
  border 1px solid $primary-color
.ta-screen-designer-cell
  .layout
    border 1px dashed black
    // background v-bind(background)
</style>
