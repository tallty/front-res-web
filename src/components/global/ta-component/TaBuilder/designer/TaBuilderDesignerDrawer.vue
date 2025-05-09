<script lang="ts">
import {
  ref,
  defineComponent,
  toRefs,
  computed,
  onMounted,
  PropType,
  watch,
  getCurrentInstance,
} from 'vue';
import DraggableContainer from '../vue3-draggable-resizable/DraggableContainer';
import '../vue3-draggable-resizable/index.css';

import { provideTriggerMeasureParent } from '../vue3-draggable-resizable/useTriggerParentSize';
import { provideTaBuilderDesignerActiveItem } from './useActiveItem';
import useTaBuilderProcessItem from '../useTaBuilderProcessItem';
import { TaBuilderComponent } from '../types';
import { cloneDeep, merge } from 'lodash';
import { VObject } from '@/lib/vails';
import { useNewCell } from './useNewCell';
import utils from '@/components/global/ta-component/utils';
import { initRoot } from './initRoot';
import { useLayerPosition } from './useLayerPosition';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';

const TaBuilderDesignerDrawer = defineComponent({
  name: 'TaBuilderDesignerDrawer',
  components: {
    DraggableContainer,
  },
  props: {
    value: {
      type: Array as PropType<TaBuilderComponent[]>,
      default: () => [],
    },
    keywordTemplate: {
      type: Object as PropType<TaTemplateFormItem>,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const canvasRef = ref<any>(null);
    const canvasLeft = computed(() =>
      canvasRef.value ? utils.getElementLeft(canvasRef.value) : 0,
    );
    const canvasTop = computed(() => (canvasRef.value ? utils.getElementTop(canvasRef.value) : 0));

    const { sortByZIndex, generateTreeData, generateKey } = useTaBuilderProcessItem();

    // 拖动时如果是树结构，很难操作结构的同时，保持 activeItem，所以选择平面结构
    const localValue = computed({
      get: () => sortByZIndex(props.value),
      set: val => emit('update:value', sortByZIndex(val)),
    });

    // 第一棵树是主树，剩下的树是组件树
    const rootItems = computed(() =>
      localValue.value
        .filter((item: TaBuilderComponent) => item.parent_key === null)
        .map((item: TaBuilderComponent) => key2FlatDataItem.value[item.key]),
    );

    const rootWidgets = computed(() =>
      rootItems.value
        .filter((item: TaBuilderComponent) => item.key !== initRoot.key)
        .map((item: TaBuilderComponent) => ({
          name: item.name,
          component: 'TaBuilderComponentLink',
          cssc: item.cssc,
          props: { linkKey: item.key },
        })),
    );

    // 这里取 cloneDeep(localValue.value) 可以使得 children 在 flatData 中不重复
    // 但是 会使得 拖拽的修改无法实时同步到 localValue 上
    const treeData = computed(() => generateTreeData(localValue.value)[0]); // 只取第一颗树

    const key2RelativeCells = computed(() =>
      localValue.value.reduce(
        (out: Record<string, TaBuilderComponent[]>, item: TaBuilderComponent) => {
          // const result = getRelativeCells(item);
          // item.relativeCellKeys = result.map((i: TaBuilderComponent) => i.key);
          out[item.key] = getRelativeCells(item);
          return out;
        },
        {},
      ),
    );

    const key2TreeData = computed(() =>
      localValue.value.reduce(
        (out: Record<string, TaBuilderComponent>, item: TaBuilderComponent) => {
          out[item.key] = generateTreeData(key2RelativeCells.value[item.key], item)[0];
          return out;
        },
        {},
      ),
    );

    const key2FlatDataItem = computed(() =>
      localValue.value.reduce(
        (out: Record<string, TaBuilderComponent>, item: TaBuilderComponent) => {
          out[item.key] = item;
          return out;
        },
        {},
      ),
    );

    const {
      activeItem,
      activeItemMeta,
      activeRootKey,
      reset: activeItemReset,
    } = provideTaBuilderDesignerActiveItem();

    const { triggerMeasureParentFlag } = provideTriggerMeasureParent();

    const activeRoot = computed(() => key2FlatDataItem.value[activeRootKey.value || initRoot.key]);

    const renderRootItemTrees = computed(() =>
      localValue.value
        // .filter((item: TaBuilderComponent) => item.parent_key === null)
        .filter((item: TaBuilderComponent) =>
          // 已加入 rendered key 进行渲染的数据
          activeItemMeta.value.renderedKeys.includes(item.key),
        )
        .map((item: TaBuilderComponent) => key2TreeData.value[item.key]),
    );

    const ancestryWithSelfChain = computed(() => {
      const getParentItem = (key: string, out: TaBuilderComponent[]) => {
        if (!key2FlatDataItem.value[key] || !key2FlatDataItem.value[key].parent_key) return out;

        const parent = key2FlatDataItem.value[key2FlatDataItem.value[key].parent_key!];
        if (parent) {
          out.push(parent);
          getParentItem(parent.key, out);
        }
        return out;
      };

      return getParentItem(activeRootKey.value, [
        key2FlatDataItem.value[activeRootKey.value],
      ]).filter(i => i);
    });

    watch(
      () => true,
      () => {
        if (!activeRoot.value) {
          localValue.value.unshift(initRoot);
        }
      },
      { immediate: true },
    );

    onMounted(() => {
      triggerMeasureParentFlag.value = true;
    });

    watch(localValue, () => (triggerMeasureParentFlag.value = !triggerMeasureParentFlag.value), {
      deep: true,
    });

    const onSelectRoot = () => {
      if (activeItem && activeRoot.value) {
        activeItem.value = activeRoot.value;
      }
    };

    const removeCell = (cell: TaBuilderComponent) => {
      if (cell.key === initRoot.key) return;
      const index = localValue.value.findIndex((c: TaBuilderComponent) => c.key === cell.key);
      if (index > -1) {
        const relativeCells = getRelativeCells(cell, []);

        localValue.value.splice(index, 1);

        relativeCells.forEach((c: TaBuilderComponent) => {
          const i = localValue.value.findIndex((item: TaBuilderComponent) => c.key === item.key);
          if (i > -1) {
            localValue.value.splice(i, 1);
          }
        });

        if (activeItem) {
          activeItem.value = {};
        }
      }
    };

    const { addNewCell } = useNewCell();

    const addToRoot = (cell: TaBuilderComponent) => {
      if (cell.key === initRoot.key) return;
      const index = localValue.value.findIndex((c: TaBuilderComponent) => c.key === cell.key);
      if (index > -1) {
        const relativeCells = getRelativeCells(cell);

        removeCell(cell);

        activeItem.value = {};
        const resultCell = pasteCells(relativeCells, { parent_key: null });

        resultCell.cssc.x = 0;
        resultCell.cssc.y = 0;
        console.log(cell, 'cell');

        const newLinkComponentCell: TaBuilderComponent = merge({}, cell, {
          component: 'TaBuilderComponentLink',
          props: { linkKey: resultCell.key, key2Props: { [cell.key]: cell.props } },
        });

        addNewCell(newLinkComponentCell, localValue);
      }
    };

    const parentKey2Items = computed(() =>
      localValue.value.reduce((out: VObject, item: TaBuilderComponent) => {
        if (item.parent_key) {
          if (!out[item.parent_key]) {
            out[item.parent_key] = [];
          }
          out[item.parent_key].push(item);
        }
        return out;
      }, {}),
    );

    const getRelativeCells = (
      cell: TaBuilderComponent,
      flatDataCells: TaBuilderComponent[] = [cell],
    ) => {
      // const existCell = localValue.value.find((c: TaBuilderComponent) => c.key === cell.key);
      // if (existCell) {
      //   parentKey2Items.value[existCell.key]?.forEach((c: TaBuilderComponent) => {
      //     getRelativeCells(c, flatDataCells);
      //   });
      //   flatDataCells.push(...(parentKey2Items.value[existCell.key] || []));
      // }
      // console.log(localValue.value, 'value');

      parentKey2Items.value[cell.key]?.forEach((c: TaBuilderComponent) => {
        getRelativeCells(c, flatDataCells);
      });
      flatDataCells.push(...(parentKey2Items.value[cell.key] || []));
      return flatDataCells;
    };

    const pasteCells = (
      cells: TaBuilderComponent[],
      opts: { parent_key: string | null } = { parent_key: initRoot.key },
    ) => {
      const result = cloneDeep(cells);
      const oldKey2NewKey: Record<string, string> = {};
      result.forEach((item: TaBuilderComponent) => {
        const oldKey = item.key;

        item.key = generateKey();
        oldKey2NewKey[oldKey] = item.key;
      });

      result.forEach((item: TaBuilderComponent, index: number) => {
        if (item.parent_key) {
          item.parent_key =
            index === 0 ? activeItem.value?.key || opts.parent_key : oldKey2NewKey[item.parent_key];
        }

        if (activeItemMeta?.value?.activeSlotKey) item.slot = activeItemMeta.value.activeSlotKey;
      });

      localValue.value.push(...result);

      return result[0];
    };

    const buttons: { key: string; label: string; callback: () => void }[] = [
      {
        key: 'widgets',
        label: '控件',
        callback: () => (activeButtonKey.value = 'widgets'),
      },
      {
        key: 'layers',
        label: '图层',
        callback: () => (activeButtonKey.value = 'layers'),
      },
      {
        key: 'roots',
        label: '分组',
        callback: () => (activeButtonKey.value = 'roots'),
      },
    ];

    const activeButtonKey = ref(buttons[0].key);

    // for ref
    const editableKeys = computed(() => {
      if (activeItemMeta && activeItem) {
        const activeKey: string =
          activeItemMeta.value.activeEditableParentKey || activeRoot.value.key;
        return (parentKey2Items.value[activeKey] || []).map((i: TaBuilderComponent) => i.key);
      }
      return [];
    });

    const { getContainerPosition, getCellAttrs } = useLayerPosition();

    // const sortByIndex = () => {
    //   localValue.value.sort((a: TaBuilderComponent, b: TaBuilderComponent) =>
    //     (a.index || 0) > (b.index || 0) ? -1 : 1,
    //   );
    // };

    return {
      ...toRefs(props),
      canvasLeft,
      canvasTop,

      localValue,
      treeData,
      activeItem,
      // rootItem,
      canvasRef,
      onSelectRoot,
      activeItemMeta,
      removeCell,
      buttons,
      activeButtonKey,
      activeItemReset,
      getRelativeCells,
      pasteCells,

      rootItems,
      activeRoot,
      initRoot,
      addToRoot,
      key2TreeData,
      key2RelativeCells,
      key2FlatDataItem,

      rootWidgets,
      renderRootItemTrees,
      editableKeys,

      ancestryWithSelfChain,

      getContainerPosition,
      getCellAttrs,

      // sortByIndex,
    };
  },
  mounted() {
    if (this.activeItemMeta) {
      this.activeItemMeta.drawerRef = ref(this);
    }
  },
});
export default TaBuilderDesignerDrawer;
</script>

<template lang="pug">
.ta-screen-designer-drawer.w-full.h-full.flex
  //- p treeData = {{ treeData }}
  //- p value = {{ localValue }}
  //- | activeItem  = {{ activeItem }}
  //- p activeItemMeta.value.renderedKeys {{ activeItemMeta.renderedKeys}}
  .flex-shrink-0.p-2.px-4.flex-col.flex
    TaCapsuleMultiButton.mb-4.w-50.flex-shrink-0(
      :activeKey='activeButtonKey',
      :buttons='buttons',
      :shadow='true'
    )
    TaBuilderDesignerWidgetList.flex-grow.h-0.overflow-auto(
      v-show='activeButtonKey === "widgets"',
      v-model:value='localValue',
      :canvasRef='canvasRef',
      :root='activeRoot',
      :rootWidgets='rootWidgets',
    )
    TaBuilderDesignerLayerList.flex-grow.h-0.overflow-auto(
      v-show='activeButtonKey === "layers"',
      v-model:flatData='key2RelativeCells[activeRoot.key]',
    )
      //- @sortByIndex='sortByIndex',
    TaBuilderDesignerRootList.flex-grow.h-0.overflow-auto(
      v-show='activeButtonKey === "roots"',
      v-model:rootItems='rootItems',
    )
  .flex.flex-col.flex-grow.w-0
    TaBuilderDesignerParentBreadcrumb(:ancestryWithSelfChain='ancestryWithSelfChain')

    TaBuilderMeasuringScale.flex-grow.h-0.w-full(:rootItem='activeRoot', @click='onSelectRoot')
      .canvas-relative.w-full.h-full(
        ref='canvasRef',
      )
        //- p value = {{ localValue }}
        component(
          v-for='(root, index) in renderRootItemTrees',
          v-show='root?.key === activeRoot.key',
          :is='getContainerPosition(root)',
        )
          TaBuilderDesignerCell(
            v-model:value='renderRootItemTrees[index]',
            :draggable='false',
            :resizable='false',
            :root='true',
            :initW='root.cssc.w',
            :initH='root.cssc.h',
            :style='{ position: "static" }'
            :cellAttrs='getCellAttrs(root)'
          )
  TaBuilderDesignerConfig(:keywordTemplate='keywordTemplate')
</template>

<style lang="stylus" scoped>
.ta-screen-designer-drawer
  .canvas-relative
    position relative
    top -1px
    left -1px
    flex 1
    min-width 100%
    width fit-content
    height 100%
  .layer-list
    position absolute
    top 100px
    right 100px
    z-index 2000
</style>
