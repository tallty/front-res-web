<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed } from 'vue';
import { VObject } from '@/lib/vails/model';
import { TaIndexTreeItem } from './TaIndexTree.vue';
import { merge } from 'lodash';

const TaTreeSwitchLayout2 = defineComponent({
  name: 'TaTreeSwitchLayout2',
  components: {},
  props: {
    activeItem: { type: Object, default: () => ({}) },
    store: { type: Object, required: true },
    treeItemGenerator: {
      type: Function as PropType<(record: VObject) => TaIndexTreeItem>,
      default: () => (record: VObject) => ({ record }),
    },
    customFlatData: { type: Array, default: null },
    config: { type: Object, default: () => ({}) },
    heTreeOptions: { type: Object, default: () => ({}) },
    treeWidth: { type: Number, default: 300 },
    defaultMode: { type: String, default: 'custom' },
    allowCreateRoot: { type: Boolean, default: false },
  },
  emits: ['select', 'onIndex', 'update:activeItem', 'treeExpend'],
  setup(props, { emit }) {
    const treeOpen = ref(false);
    const changeTree = () => {
      treeOpen.value = !treeOpen.value;
    };
    const localActiveItem = computed({
      get: () => props.activeItem,
      set: val => emit('update:activeItem', val),
    });

    const onSelect = (item: TaIndexTreeItem) => {
      emit('select', item);
    };

    const activeLayoutMode = ref(props.defaultMode);

    const taIndexViewConfig = computed(() =>
      merge(
        {
          store: props.store,
          pagination: {
            perPage: 999999,
            hideOnSinglePage: true,
          },
          mode: activeLayoutMode.value,
          table: {
            scroll: { y: '70vh' },
          },
        },
        props.config,
      ),
    );

    const flatData = computed(
      () => props.customFlatData || props.store.records.value.map(props.treeItemGenerator),
    );

    const onExpend = (node: TaIndexTreeItem, tree: any) => {
      emit('treeExpend', node, tree);
    };

    const onIndex = (data: VObject) => {
      emit('onIndex', data);
    };

    return {
      ...toRefs(props),
      onSelect,
      localActiveItem,
      activeLayoutMode,
      taIndexViewConfig,
      flatData,
      onExpend,
      onIndex,
      treeOpen,
      changeTree,
    };
  },
});
export default TaTreeSwitchLayout2;
</script>

<template lang="pug">
.ta-tree-switch-layout-2
  TaIndexView.index-view(:config='taIndexViewConfig', @onIndex='onIndex')
    template(#header)
      span
    template(#custom='{ actions }')
      TaThreeCellLayout.tree-content.h-full(
        :leftWidth='treeOpen ? `${treeWidth}px` : `0px`',
        headerHeight='120px'
      )
        template(#header)
          slot(name='header')
        template(#left-content)
          slot(v-if='treeOpen', name='left-content')
            TaIndexTree.tree(
              v-model:activeItem='localActiveItem',
              :flatData='flatData',
              :options='heTreeOptions',
              @select='onSelect',
              @expend='onExpend'
            )
              template(#item='{ node, tree, actions }')
                slot(name='tree-item', :node='node', :tree='node', :actions='actions')
        template(#right-content)
          .right-content.flex
            .out-cursor.cursor-pointer.z-10.relative.my-3
              span(v-if='treeOpen', @click.stop='changeTree') 
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              span(v-else, @click.stop='changeTree') 
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
                </svg>
            slot(name='right-content')
</template>

<style lang="stylus" scoped>
.switcher-box
  display flex
  align-items center
.ta-tree-switch-layout-2
  height 100%
  width 100%
  .index-view
    height calc(100% - 100px)
.layout-switcher
  margin-left 12px
  cursor pointer
  position relative
.tree-content
  border 1px solid #E5E5E5
  height 100%
.tree
  height 100%
  overflow auto
.switcher
  width 60px
.switcher-item
  cursor pointer
  width 120px
  height 40px
  align-items center
  // &:hover
  // background rgba(19,206,102,0.1)
  .text, .icon
    margin-right 12px
</style>
