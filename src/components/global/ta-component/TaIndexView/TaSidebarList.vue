<script lang="ts">
import {
  TaIndexViewListConfigInterface,
  TaIndexViewPaginationConfigInterface,
  TaIndexViewTableConfigInterface,
  TaIndexViewTreeConfigInterface,
} from './types';
import {
  computed,
  ComputedRef,
  defineComponent,
  PropType,
  ref,
  Ref,
  toRefs,
  nextTick,
  getCurrentInstance,
} from 'vue';
import { VModel } from '@/lib/vails';
import { VObject } from '@/lib/vails/model';
import { TaIndexViewAction } from './ta-index-view-core/types';
import { TaIndexTreeItem } from '../TaIndexTree.vue';

export interface IRowSection<K, R> {
  selectedRowKeys?: K[];
  onSelect?: (record: R, selected: boolean) => void;
  // onChange?: (rowKeys: K[], rows: R[]) => void;
  getCheckboxProps?: (record: R) => { props: CheckboxProps };
}

interface CheckboxProps {
  name?: string;
  disabled?: boolean;
}

const TaSidebarList = defineComponent({
  name: 'TaSidebarList',
  components: {},
  props: {
    sidebarWidth: { type: Number, default: 0 },
    isSeamlessScrollTable: { type: Boolean, default: false },
    isTable: { type: Boolean, default: false },
    isTree: { type: Boolean, default: false },
    // 分页
    paginationConfig: {
      type: Object as PropType<TaIndexViewPaginationConfigInterface>,
      default: () => ({}),
    },
    // 表格配置
    tableConfig: {
      type: Object as PropType<TaIndexViewTableConfigInterface>,
      default: () => ({} as TaIndexViewTableConfigInterface),
    },
    // 列表配置
    listConfig: {
      type: Object as PropType<TaIndexViewListConfigInterface>,
      default: () => ({} as TaIndexViewListConfigInterface),
    },
    // 树配置
    treeConfig: {
      type: Object as PropType<TaIndexViewTreeConfigInterface>,
      default: () => ({ selectableFn: () => true } as TaIndexViewTreeConfigInterface),
    },
    selectionConfig: {
      type: Object as PropType<VObject>,
      default: () => ({} as VObject),
    },
    memberActions: {
      type: Array as PropType<TaIndexViewAction[]>,
      default: () => [] as TaIndexViewAction[],
    },
    // 表格和列表共用的属性

    store: { type: Object, default: null },
    emptyText: { type: String, default: '暂无数据' },
    scrollLoading: { type: Boolean, default: false },

    // 如果传入会出现勾选的批量状态
    rowKey: { type: String, default: 'id' },
    rowSelection: { type: Object, default: () => ({}) },

    draggable: { type: Boolean, default: false },
    step: { type: Number, default: 0.6 },
    actions: { type: Object, default: () => ({}) },
    activeActionsKeyToItemMap: { type: Object, default: () => ({}) },
    // 树的父级是否禁用
    disable_tree_parent: { type: Boolean, default: false },
  },
  emits: ['onPaginateChange', 'rowClick', 'draggle', 'tableChange', 'expand'],
  setup(props, { emit }) {
    const selectedRecords: Ref<VModel[]> = ref([]);

    // 取值 tableConfig 内值 或 默认 prop 值
    const activeRowKey = computed<string>(() => {
      return props.isTable ? props.tableConfig.rowKey || props.rowKey : props.rowKey;
    });

    const activeRowSelection = computed(() => {
      return props.isTable
        ? props.tableConfig.rowSelection || props.rowSelection
        : props.rowSelection;
    });

    const activeTableConfig: ComputedRef<TaIndexViewTableConfigInterface> = computed(() => {
      return {
        ...props.tableConfig,
        rowKey: activeRowKey.value,
        rowSelection: activeRowSelection.value.selectedRowKeys ? activeRowSelection.value : null,
        emptyText: props.emptyText,
      };
    });

    const activeListConfig: ComputedRef<TaIndexViewListConfigInterface> = computed(() => {
      return {
        ...props.listConfig,
      };
    });

    const activeTreeConfig = computed<TaIndexViewTreeConfigInterface>(() => {
      return {
        ...props.treeConfig,
        eachDraggable: props.draggable,
      };
    });

    const onCheckboxChange = (
      rowKeyValue: number,
      record: VModel,
      forceChecked?: boolean,
      opts: { treeNode?: VObject; tree?: any } = {},
    ) => {
      props.isTree
        ? onTreeCheckboxChange(
            rowKeyValue,
            record,
            opts?.treeNode || {},
            opts?.tree || null,
            forceChecked,
          )
        : onNormalCheckboxChange(rowKeyValue, record, forceChecked);
    };

    const onNormalCheckboxChange = (
      rowKeyValue: number,
      record: VModel,
      forceChecked?: boolean,
      callbacks?: { add: () => void; remove: () => void },
    ) => {
      const existsKeys = Array.isArray(activeRowSelection.value.selectedRowKeys)
        ? activeRowSelection.value.selectedRowKeys
        : [];
      // rowSelection 清空时,清空 selectedRecords
      selectedRecords.value = selectedRecords.value.filter(i =>
        existsKeys.includes((i.reactiveRecord as VObject)[activeRowKey.value]),
      );

      const index = existsKeys.indexOf(rowKeyValue);

      const shouldSelected =
        index === -1 &&
        (typeof forceChecked !== 'boolean' || (typeof forceChecked === 'boolean' && forceChecked));
      const shouldUnselected =
        index !== -1 &&
        (typeof forceChecked !== 'boolean' || (typeof forceChecked === 'boolean' && !forceChecked));

      if (shouldSelected) {
        existsKeys.push(rowKeyValue);
        selectedRecords.value.push(record);
        callbacks?.add?.();
        if (typeof activeRowSelection.value.onSelect === 'function') {
          activeRowSelection.value.onSelect(record, true);
        }
      } else if (shouldUnselected) {
        existsKeys.splice(index, 1);
        selectedRecords.value.splice(index, 1);
        callbacks?.remove?.();
        if (typeof activeRowSelection.value.onSelect === 'function') {
          activeRowSelection.value.onSelect(record, false);
        }
      }

      // if (typeof activeRowSelection.value.onChange === 'function') {
      //   activeRowSelection.value.onChange(existsKeys, selectedRecords.value);
      // }
    };

    const rowKeyValue2Indeterminate = ref<Record<any, boolean>>({});

    const onTreeCheckboxChange = (
      rowKeyValue: any,
      record: VModel,
      treeNode: VObject,
      tree: any,
      forceChecked?: boolean,
    ) => {
      onNormalCheckboxChange(rowKeyValue, record, forceChecked, {
        add: async () => {
          treeNode.$checked = true;

          for (let child of treeNode.$children) {
            await new Promise<void>(resolve => {
              setTimeout(() => {
                onTreeCheckboxChange(
                  child.record[activeRowKey.value],
                  child.record,
                  child,
                  tree,
                  true,
                );
                resolve();
              });
            });
          }
        },
        remove: async () => {
          treeNode.$checked = false;

          // console.log(tree, 'tree');

          for (let child of treeNode.$children) {
            await new Promise<void>(resolve => {
              setTimeout(() => {
                onTreeCheckboxChange(
                  child.record[activeRowKey.value],
                  child.record,
                  child,
                  tree,
                  false,
                );
                resolve();
              });
            });
          }
        },
      });
    };

    const onPaginateChange = (
      page: number,
      queryParams: Record<string, any>,
      perPage: number,
      scrollLoading = false,
    ) => {
      emit('onPaginateChange', page, queryParams, perPage, scrollLoading);
    };

    const onRowClick = (record: any, opts: VObject) => {
      if (typeof props.rowSelection.onSelect === 'function' && !props.selectionConfig.rowDisabled) {
        if (!props.rowSelection.getCheckboxProps?.(record)?.disabled)
          onCheckboxChange(record[activeRowKey.value], record, undefined, opts);
      }

      emit('rowClick', record);
    };
    const onExpand = (expanded: boolean, record: VObject, item?: TaIndexTreeItem) => {
      emit('expand', expanded, record, item);
    };
    const onDraggle = (record: VModel, position: number) => {
      emit('draggle', record, position);
    };
    const tableChange = (pagination: VObject, filters: VObject, sorter: VObject) => {
      emit('tableChange', pagination, filters, sorter);
    };

    // const updateLoading = val => {
    //   emit()
    // };

    const flatData = computed<TaIndexTreeItem[]>(() =>
      props.store.records.value.map((record: VObject) => ({
        idKey: record.$idKey || record[props.rowKey],
        parentKey: record.$parentKey || record.parent_id,
        label: record.name,
        record: record,
        create: props.activeActionsKeyToItemMap.create?.enabled
          ? {
              callback: (node: VObject) =>
                props.actions.onCreate({ initFormData: { parent_id: node.idKey } }),
            }
          : false,
        update: props.activeActionsKeyToItemMap.update?.enabled
          ? {
              callback: (node: VObject) => props.actions.onEdit(node.record),
            }
          : false,
        delete: props.activeActionsKeyToItemMap.delete?.enabled
          ? {
              callback: (node: VObject) => props.actions.onDelete(node.record),
            }
          : false,
        selectable:
          typeof record.selectable === 'boolean'
            ? record.selectable
            : props.treeConfig.selectableFn(record),
      })),
    );

    return {
      ...toRefs(props),
      onCheckboxChange,
      activeTableConfig,
      activeRowSelection,
      activeRowKey,
      activeListConfig,
      activeTreeConfig,
      onRowClick,
      onDraggle,
      onExpand,
      onPaginateChange,
      tableChange,
      flatData,
      onTreeCheckboxChange,
      rowKeyValue2Indeterminate,
    };
  },
});

export default TaSidebarList;
</script>

<template lang="pug">
.ta-sidebar-list
  aside(:style='{ flexBasis: `${sidebarWidth}px` }')
    slot(name='sidebar')
  .list.flex.flex-col(:style='`width: calc(100% - ${sidebarWidth}px)`')
    slot(name='table_top')
    TaIndexSeamlessScrollTable(
      v-if='isSeamlessScrollTable',
      :store='store',
      :draggable='draggable',
      :config='activeTableConfig',
      :skin='activeTableConfig.skin',
      :paginationConfig='paginationConfig',
      :memberActions='memberActions',
      :step='step',
      :actions='actions',
      @rowClick='onRowClick',
      @change='onPaginateChange',
      @draggle='onDraggle',
      @tableChange='tableChange',
      @expand='onExpand'
    )
      slot
      template(#bodyCell='{ text, record, index, column, actions }')
        slot(name='bodyCell', :text='text', :record='record', :index='index', :column='column', :actions='actions')
      template(#expandedRowRender="{ record }")
        slot(name='expandedRowRender', :record='record')

    TaIndexTable(
      v-else-if='isTable',
      :store='store',
      :draggable='draggable',
      :config='activeTableConfig',
      :skin='activeTableConfig.skin',
      :paginationConfig='paginationConfig',
      :memberActions='memberActions',
      :actions='actions',
      @rowClick='onRowClick',
      @change='onPaginateChange',
      @draggle='onDraggle',
      @tableChange='tableChange',
      @expand='onExpand'
    )
      slot
      template(#bodyCell='{ text, record, index, column, actions }')
        slot(name='bodyCell', :text='text', :record='record', :index='index', :column='column', :actions='actions')
      template(#expandedRowRender="{ record }")
        slot(name='expandedRowRender', :record='record')
    TaIndexTree.flex-grow.h-0(
      v-else-if='isTree',
      :flatData='flatData',
      :emptyText='emptyText',
      :draggable='draggable',
      :paginationConfig='paginationConfig',
      :options='activeTreeConfig',
      :onDragend='onDraggle',
      @expand='onExpand'
    )
      template(#default='{ record, index, treeNode, tree }')
        TaListCheckboxItem.w-full(
          :record='record',
          :index='index',
          :rowKey='activeRowKey',
          :rowSelection='activeRowSelection',
          :showCheckbox='!!(rowKey && activeRowSelection.selectedRowKeys && (typeof record.$selectable === "boolean" ? record.$selectable : true))',
          :indeterminate='treeNode.$checked === null',
          :disable_tree_parent='disable_tree_parent'
          :tree='treeNode'
          @rowClick='record => (typeof record.$selectable === "boolean" ? record.$selectable && onRowClick(record, { treeNode }) : onRowClick(record, { treeNode }))',
          @change='(rowKeyValue, record) => onTreeCheckboxChange(rowKeyValue, record, treeNode, tree)'
        )
          template(#default='{ record, index, isActive }')
            slot(:record='record', :index='index', :isActive='isActive')
    TaIndexList(
      v-else,
      :store='store',
      :emptyText='emptyText',
      :scrollLoading='scrollLoading',
      :draggable='draggable',
      :paginationConfig='paginationConfig',
      :config='activeListConfig',
      :memberActions='memberActions',
      :actions='actions',
      :rowKey='activeRowKey',
      @change='onPaginateChange',
      @draggle='onDraggle'
    )
      template(#default='{ record, index }')
        TaListCheckboxItem(
          :index='index',
          :record='record',
          :rowKey='activeRowKey',
          :rowSelection='activeRowSelection',
          :showCheckbox='!!(rowKey && activeRowSelection.selectedRowKeys && (typeof record.selectable === "boolean" ? record.selectable : true))',
          @rowClick='onRowClick',
          @change='onCheckboxChange'
        )
          template(#default='{ record, index, isActive }')
            slot(:record='record', :index='index', :isActive='isActive', :onCheckboxChange='onCheckboxChange')
      template(#empty)
        slot(name='empty')
  .content-right.flex-shrink-0.flex-grow-0
    slot(name='content-right')
</template>

<style lang="stylus" scoped>
.ta-sidebar-list
  display flex
  height 100%
  width 100%
  aside
    flex-grow 0
    flex-shrink 0
  .list
    flex 1
    height 100%
</style>
