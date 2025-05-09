<script lang="ts">
import {
  ref,
  defineComponent,
  toRefs,
  PropType,
  computed,
  onMounted,
  watch,
  reactive,
  nextTick,
} from 'vue';
import { TaBuilderComponent } from '../types';
import useTaBuilderProcessItem from '../useTaBuilderProcessItem';
import { injectTaBuilderDesignerActiveItem } from './useActiveItem';

import { Draggable } from '@he-tree/vue3';
import '@he-tree/vue3/dist/he-tree-vue3.css';
// he-tree:
//    https://hetree.phphe.com/zh/v1/guide/#treedata-%E6%88%96-flatdata
//    https://hetree.phphe.com/zh/v1/api/#outputflatdata

import scrollIntoView from 'smooth-scroll-into-view-if-needed';
import { initRoot } from './initRoot';

const TaBuilderDesignerLayerList = defineComponent({
  name: 'TaBuilderDesignerLayerList',
  components: {
    Draggable,
  },
  props: {
    flatData: { type: Object as PropType<TaBuilderComponent[]>, default: () => ({}) },
  },
  emits: ['update:flatData', 'sortByIndex'],
  setup(props, { emit }) {
    const localFlatData = computed({
      get: () => props.flatData,
      set: val => emit('update:flatData', val),
    });

    const visibleFlatData = computed(() =>
      // 在最上层时，可以跨所有层级拖动
      activeRootKey.value === initRoot.key
        ? props.flatData.filter(
            (item: TaBuilderComponent) => activeItemMeta?.value?.activeSlotKey === item.slot,
          )
        : props.flatData.filter(
            (item: TaBuilderComponent) =>
              activeRootKey.value &&
              (
                activeItemMeta?.value?.drawerRef?.key2RelativeCells?.[activeRootKey.value] || []
              ).findIndex((i: TaBuilderComponent) => i.key === item.key) > -1 &&
              activeItemMeta?.value?.activeSlotKey === item.slot,
          ),
    );

    const treeRef = ref<any>(null);

    const { groupBy } = useTaBuilderProcessItem();
    const { activeItem, activeItemMeta, activeRootKey } = injectTaBuilderDesignerActiveItem();

    const onSelect = (key: string) => {
      const selectedItem = localFlatData.value.find((item: TaBuilderComponent) => item.key === key);
      if (selectedItem && activeItem) {
        activeItem.value = selectedItem;
      }
    };

    const selectedKeys = computed(() => [activeItem?.value?.key]);

    const onDragend = () => {
      setTimeout(() => {
        const outputFlatData = treeRef.value.outputFlatData();
        // console.log(outputFlatData.length, 'length');

        const idToItemMapping = groupBy(localFlatData.value, 'key');
        const root = props.flatData.find((item: TaBuilderComponent) => item.parent_key === null);

        // 更新 v-model 绑定值中的 parent_key，以更新树结构，并保持 activeItem
        outputFlatData.forEach((data: TaBuilderComponent, index: number) => {
          const item = idToItemMapping[data.key][0];
          // visibleFlatData 去掉了 root，所以这里返回 data.parent_key 为 undefined 时，表示父级为 root
          if (item.parent_key !== (data.parent_key || root!.key)) {
            // parent_key changed
            item.cssc.x = 0;
            item.cssc.y = 0;
          }

          emit('sortByIndex');
          item.parent_key = data.parent_key; //|| root!.key;

          item.index = index;
        });

        if (activeItemMeta) {
          activeItemMeta.value.drawerRef.$forceUpdate();
        }
      }, 100);
    };

    // he-tree 有 bug，end 一直是 3，只能显示 4 个
    watch(
      visibleFlatData,
      () => {
        if (treeRef.value?.$refs?.virtualizationList) {
          treeRef.value.$refs.virtualizationList.end = visibleFlatData.value.length;
        }
      },
      { immediate: true },
    );

    const onDelete = (cell: TaBuilderComponent) => {
      if (activeItemMeta) {
        activeItemMeta.value.drawerRef.removeCell(cell);
      }
    };

    watch(
      () => activeItem?.value,
      () => {
        if (treeRef.value) {
          nextTick(() => {
            const node = treeRef.value.$el.getElementsByClassName('selected-item')[0];
            if (node) {
              scrollIntoView(node, {
                scrollMode: node,
                block: 'center',
                behavior: 'smooth',
              });
            }
          });
        }
      },
    );

    return {
      ...toRefs(props),
      localFlatData,
      visibleFlatData,
      onSelect,
      selectedKeys,
      treeRef,
      onDragend,
      activeItem,
      activeRootKey,
      onDelete,
    };
  },
});
export default TaBuilderDesignerLayerList;
</script>

<template lang="pug">
.ta-screen-designer-layer-list
  Draggable(
    ref='treeRef'
    :flatData='visibleFlatData'
    idKey='key'
    parentIdKey="parent_key"
    :ondragend='onDragend'
    :virtualization='false'
  )
    template(v-slot="{ node, tree }")
      .item.p-2.flex.items-center.cursor-pointer.justify-between(
        :class='{ "selected-item": activeItem.key === node.key }'
        @click='onSelect(node.key)'
      )
        .left.flex.items-center.flex-grow.w-0
          TaIcon.transform.mr-2.flex-shrink-0(
            type='CaretRightOutlined',
            :class='{ "rotate-90": !node.$folded, "opacity-0": !node.children?.length }'
            @click="tree.toggleFold(node)",
          )
          TaDblclickInput.flex-grow.w-0(
            :value='localFlatData[localFlatData.findIndex(item => item.key === node.key)].name'
            @update:value='val => localFlatData[localFlatData.findIndex(item => item.key === node.key)].name = val'
          )
        .right.flex-shrink-0.ml-2
          TaIcon.delete(
            v-if='node.key !== activeRootKey'
            type='CloseOutlined',
            @click.stop='() => onDelete(localFlatData.find(item => item.key === node.key))'
          )
</template>

<style lang="stylus" scoped>
.item
  .delete
    display none
  &:hover
    .delete
      display block

.selected-item
  background $primary-color
  color white
  @apply rounded
</style>
