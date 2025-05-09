<script lang="ts">
import { ref, defineComponent, toRefs, PropType, watch, computed } from 'vue';
import { VObject } from '@/lib/vails/model';
import { TaIndexTreeItem } from './TaIndexTree.vue';
import { merge } from 'lodash';

const TaTreeSwitchLayout = defineComponent({
  name: 'TaTreeSwitchLayout',
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
    const treeOpen = ref(true);
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
      changeTree,
      treeOpen,
    };
  },
});
export default TaTreeSwitchLayout;
</script>

<template lang="pug">
.ta-tree-switch-layout
  TaIndexView.index-view(:config='taIndexViewConfig', @onIndex='onIndex')
    template(#table)
      slot(name='table')
    template(#custom='{ actions }')
      TaFourCellLayout.tree-content.h-full(
        :leftWidth='treeOpen ? `${treeWidth}px` : `0px`',
        headerHeight='50px'
      )
        template(#left-header, v-if='treeOpen')
          slot(name='left-header')
            .flex-between.w-full
              .title 结构
              .actions
                TaTextButton.create(
                  v-if='allowCreateRoot',
                  icon='PlusCircleOutlined',
                  @click='actions.onCreate'
                ) 创建

        template(#left-content)
          TaIndexTree.tree(
            v-model:activeItem='localActiveItem',
            :flatData='flatData',
            :options='heTreeOptions',
            @select='onSelect',
            @expend='onExpend'
          )
            template(#item='{ node, tree, actions }')
              slot(name='tree-item', :node='node', :tree='node', :actions='actions')
        template(#right-header)
          .cursor-pointer.my-2.relative
            span(v-if='treeOpen', @click.stop='changeTree') 
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            span(v-else, @click.stop='changeTree') 
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
              </svg>
          slot(name='right-header')
            span 详情
        template(#right-content)
          slot(name='tree-detail')
          slot(name='right-content')

    template(#right-actions='{ record, records, actions }')
      slot(name='right-actions', :record='record', :records='records', :actions='actions')
        .layout-switcher
          a-popover(placement='bottom')
            .switcher-box
              .switcher {{ activeLayoutMode === "table" ? "列表视图" : "树型视图" }}
              TaIcon(type='DownOutlined')
            template(#content)
              .switcher-item.flex(@click='() => (activeLayoutMode = "table")')
                TaIcon.icon(type='BarsOutlined')
                .text 列表视图
                TaIcon(v-if='activeLayoutMode === "table"', type='CheckOutlined')
              .switcher-item.flex(@click='() => (activeLayoutMode = "custom")')
                TaIcon.icon(type='ApartmentOutlined')
                .text 树型视图
                TaIcon(v-if='activeLayoutMode === "custom"', type='CheckOutlined')
</template>

<style lang="stylus" scoped>
.switcher-box
  display flex
  align-items center
.ta-tree-switch-layout
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
