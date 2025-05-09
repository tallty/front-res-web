<script lang="ts">
import customRenders from '@/components/table-renders';
import { VStore } from '@/lib/vails';
import { VModel, VObject } from '@/lib/vails/model';
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  onMounted,
  PropType,
  ref,
  Ref,
  toRefs,
  watch,
} from 'vue';
import { TaIndexViewAction } from './ta-index-view-core/types';
import { jsonataGet } from '../ta-template-form-core/useJsonata';
import {
  TaIndexTablePaginationInterface,
  TaIndexTableSorterInterface,
  TaIndexViewPaginationConfigInterface,
  TaIndexViewTableConfigInterface,
} from './types';
import { TaTemplateFormColumnAttribute } from '../ta-template-form-core/types';

const renders = {
  ...customRenders,
  TableRendersAuto: defineAsyncComponent(() => import('./TableRendersAuto.vue')),
};

let seq = 0;

const getHeightAutoStyle = (className: string) => {
  return `
    .${className} {
      height: 100%;
    }
    .${className} .ant-table-header {
        position: sticky;
        top: 0;
        background: white;
        z-index: 4;
    }
    .${className} .ant-table-thead {
      position: sticky;
      top: 0;
      background: white;
      z-index: 4;
    }
    .${className} .ta-table-component__body__table {
      height: 100%;
    }
    .${className} .ant-table-wrapper {
      height: 100%;
    }
    .${className} .ant-spin-nested-loading {
      height: 100%;
    }
    .${className} .ant-spin-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .${className} .ant-table {
      flex-grow: 1;
      height: 0;
      overflow: auto;
    }
    .${className} .ant-table-content {
      display: inline;
    }
      `;
};

const getHeightNotAutoStyle = (className: string) => {
  return `
    .${className} {
      height: auto;
    }
    .${className} .ant-table-header {
        position: sticky;
        top: 0;
        background: white;
        z-index: 4;
    }
    .${className} .ant-table-thead {
      position: sticky;
      top: 0;
      background: white;
      z-index: 4;
    }
    .${className} .ta-table-component__body__table {
      height: auto;
    }
    .${className} .ant-table-wrapper {
      height: auto;
    }
    .${className} .ant-spin-nested-loading {
      height: auto;
    }
    .${className} .ant-spin-container {
      height: auto;
      display: flex;
      flex-direction: column;
    }
    .${className} .ant-table {
      // flex-grow: 1;
      height: auto;
      overflow: none;
      overflow-x: auto;
    }
    .${className} .ant-table-content {
      display: inline;
    }
      `;
};

export const taIndexTableProps = {
  data: { type: Array as PropType<VObject[]>, default: null },
  paginatedData: { type: Array as PropType<VObject[]>, default: null },
  store: { type: Object as PropType<VStore>, default: () => ({}) },
  loading: { type: Boolean, default: null },
  config: {
    type: Object as PropType<TaIndexViewTableConfigInterface>,
    default: () => ({} as TaIndexViewTableConfigInterface),
  },
  paginationConfig: {
    type: Object as PropType<TaIndexViewPaginationConfigInterface>,
    default: () => ({} as TaIndexViewPaginationConfigInterface),
  },
  memberActions: {
    type: Array as PropType<TaIndexViewAction[]>,
    default: () => [] as TaIndexViewAction[],
  },
  actions: { type: Object, default: () => ({}) },
  totalCount: { type: Number, default: 0 },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  draggable: { type: Boolean, default: false },
  skin: { type: String, default: '' },
};

const TaIndexTable = defineComponent({
  name: 'TaIndexTable',
  components: { ...renders },
  props: taIndexTableProps,
  emits: [
    'change',
    'paginate',
    'sort',
    'filter',
    'rowClick',
    'rowDbClick',
    'contextmenu',
    'rowHover',
    'tableChange',
    'draggle',
    'expand',
  ],
  setup(props, { emit }) {
    const uuid = `ta-index-table-${seq++}`;
    const heightAutoClass = `ta-table-component-height-auto-${uuid}`;
    const styleDom = ref<HTMLElement | null>(null);
    const heightAutoStyle = getHeightAutoStyle(heightAutoClass);
    const heightNotAutoStyle = getHeightNotAutoStyle(heightAutoClass);

    onMounted(() => {
      watch(
        () => props.config.scroll?.y,
        () => {
          if (props.config.scroll?.y === 'auto') {
            styleDom.value!.textContent = heightAutoStyle;
          } else {
            styleDom.value!.textContent = heightNotAutoStyle;
          }
        },
        {
          immediate: true,
        },
      );
    });

    const localPageSize: Ref<number | null> = ref(null);
    const sorter: Ref<VObject> = ref({});
    const queryObject: Ref<VObject> = ref({ s: [] });
    const localData: Ref<VObject[]> = ref(props.data || props.paginatedData);
    const localTotalCount = ref(props.totalCount);
    const localCurrentPage = ref(props.currentPage);

    const records = computed(() => {
      return (
        (props.data || props.paginatedData ? localData.value : props.store.records.value) || []
      );
    });

    // -- config start --

    const perPage = computed(() => {
      return props.paginationConfig.perPage || localPageSize.value || 15;
    });

    const showSizeChanger = computed(() => {
      if (pageSize.value && total.value < pageSize.value) return false;
      return props.paginationConfig.showSizeChanger !== false;
    });

    const pageSizeOptions = computed(() => {
      return (
        props.paginationConfig.pageSizeOptions || [
          '10',
          '15',
          '20',
          '30',
          '40',
          '50',
          '100',
          '200',
          '500',
          '1000',
        ]
      );
    });

    const rowKey = computed(() => {
      return props.config.rowKey || 'id';
    });

    const scroll = computed(() => {
      if (props.config.scroll?.y === 'auto') {
        return { ...props.config.scroll, y: null };
      }
      return props.config.scroll || { x: '100%' };
    });

    const rowClassName = computed(() => {
      return props.config.rowClassName;
    });

    const emptyText = computed(() => {
      return tableLoading.value ? '加载中' : props.paginationConfig.emptyText || '暂无数据';
    });

    const size = computed(() => {
      return props.config.size || 'middle';
    });

    const paginationSize = computed(() => {
      return props.config.paginationSize || 'middle';
    });

    const bordered = computed(() => {
      return props.config.bordered || false;
    });

    const showHeader = computed(() => {
      return typeof props.config.showHeader === 'boolean' ? props.config.showHeader : true;
    });

    const hideOnSinglePage = computed(() => {
      return props.paginationConfig.hideOnSinglePage || false;
    });

    const rowSelection = computed(() => {
      return props.config.rowSelection || null;
    });

    const childrenColumnName = computed(() => {
      return props.config.childrenColumnName || 'children';
    });

    // -- config end --

    const haveStore = computed(() => {
      return !!props.store.currentPage?.value;
    });

    const current = computed(() => {
      return props.store.currentPage?.value || localCurrentPage.value;
    });

    const total = computed(() => {
      return props.store.totalCount?.value || localTotalCount.value || 0;
    });

    const pageSize = computed(() => {
      return perPage.value || props.store.perPage?.value || 15;
    });

    const totalPage = computed(() => {
      return props.store.totalPages?.value || props.totalPages || 0;
    });

    const pagination = computed(() => {
      return props.paginationConfig.hide
        ? false
        : {
            total: total.value,
            pageSize: pageSize.value,
            current: current.value,
            hideOnSinglePage: hideOnSinglePage.value,
            showSizeChanger: !!showSizeChanger.value,
            showQuickJumper: totalPage.value > 1,
            size: paginationSize.value,
            pageSizeOptions: pageSizeOptions.value,
            showTotal: props.paginationConfig.showTotal || ((total: number) => `共 ${total} 条`),
          };
    });

    const tableFiltersProcessor = computed(() => {
      return props.config.filtersProcessor || ((filters: VObject) => filters);
    });

    const tableLoading = computed(() => {
      return typeof props.loading === 'boolean' ? props.loading : props.store.loading?.value;
    });

    const locale = computed(() => {
      return {
        emptyText: emptyText.value,
      };
    });

    watch(
      () => props.data,
      () => {
        if (props.data) {
          localTotalCount.value = props.totalCount || props.data.length;
          localData.value = props.data;
        }
      },
      { immediate: true, deep: true },
    );

    watch(
      () => props.paginatedData,
      () => {
        if (props.paginatedData && props.paginatedData.length > 0) {
          localTotalCount.value = props.totalCount || props.data.length;
          localData.value = props.paginatedData;
        }
      },
      { immediate: true },
    );

    const onChange = (
      pagination: TaIndexTablePaginationInterface,
      filters: VObject,
      sorter: TaIndexTableSorterInterface,
    ) => {
      haveStore.value || props.paginatedData
        ? onStoreTableChange(pagination, filters, sorter)
        : onDataTableChange(pagination);
    };
    const onExpand = (expanded: boolean, record: VObject) => {
      emit('expand', expanded, record);
    };
    const onDataTableChange = (pagination: TaIndexTablePaginationInterface) => {
      if (pagination.current !== current.value || pagination.pageSize !== pageSize.value) {
        localPageSize.value = pagination.pageSize;
        localCurrentPage.value = pagination.current;
        localData.value = props.data.slice(
          (localCurrentPage.value - 1) * localPageSize.value!,
          localCurrentPage.value * localPageSize.value!,
        );
        emit('change', pagination.current, {}, localPageSize.value);
      }
    };

    const onStoreTableChange = (
      pagination: TaIndexTablePaginationInterface,
      filters: VObject,
      _sorter: TaIndexTableSorterInterface,
    ) => {
      emit('tableChange', pagination, filters, _sorter);

      if (pagination.current !== current.value || pagination.pageSize !== pageSize.value) {
        localPageSize.value = pagination.pageSize;
        emit('change', pagination.current, { ...queryObject.value }, localPageSize.value);
        emit('paginate', pagination.current);
      } else if (
        (_sorter.order && sorter.value.order !== _sorter.order) ||
        sorter.value.field !== _sorter.field
      ) {
        sorterChange(_sorter);
      } else {
        filterChange(filters);
      }
    };

    const sorterChange = async (_sorter: TaIndexTableSorterInterface) => {
      sorter.value = _sorter;
      let ransackQuerySort = ['id desc'];
      if (_sorter.order) {
        const key = _sorter.field || _sorter.columnKey;
        ransackQuerySort = [
          `${Array.isArray(key) ? key.join('.') : key} ${
            _sorter.order === 'descend' ? 'desc' : 'asc'
          }`,
        ];
        queryObject.value.s = ransackQuerySort;
      } else {
        const index = (queryObject.value.s || []).find((o: any) => o.includes(_sorter.field));
        queryObject.value.s.splice(index, 1);
      }

      emit('change', 1, { ...queryObject.value }, pageSize.value);
      emit('sort', { ...queryObject.value });
    };

    const filterChange = (filters: VObject) => {
      // filters: dataIndex => value ary
      const processedFilters = tableFiltersProcessor.value(filters || {});
      queryObject.value = {
        ...queryObject.value,
        ...Object.keys(processedFilters).reduce((obj: VObject, key: string) => {
          obj[`${key}_in`] = processedFilters[key];
          return obj;
        }, {}),
      };
      emit('change', 1, { ...queryObject.value }, pageSize.value);
      emit('filter', queryObject.value);
    };

    let dragItem: VModel;
    let targItem: VModel;

    const customRow = computed(() => {
      return (record: VModel, index: number) => {
        return {
          onClick: (event: Event) => {
            emit('rowClick', record, index, event);
          },
          // double click row
          onDblclick: (event: Event) => {
            emit('rowDbClick', record, index, event);
          },
          // right button click row
          onContextmenu: (event: Event) => {
            emit('contextmenu', record, index, event);
          },
          onMouseenter: (event: Event) => {
            emit('rowHover', record, index, event);
          },
          onMouseleave: (event: Event) => {
            emit('rowHover', {}, null, event);
          },
          draggable: props.draggable,
          ondrag() {
            dragItem = record;
          },
          ondrop() {
            targItem = record;
          },
          ondragend() {
            if (dragItem !== targItem) {
              const oldIndex = records.value.indexOf(dragItem);
              const newIndex = records.value.indexOf(targItem);
              emit(
                'draggle',
                records.value[oldIndex],
                records.value[newIndex]?.reactiveRecord.position,
              );
            }
          },
          ondragover() {
            return false;
          },
          ...(props.config.customRow?.(record, index) || {}),
        };
      };
    });

    const getRowClassName = (...args: VObject[]) => {
      if (rowClassName.value instanceof Function) {
        return rowClassName.value(...args);
      }
      return rowClassName.value;
    };

    const endDrag = (event: any) => {
      const { newIndex, oldIndex } = event;
      emit('draggle', records.value[oldIndex], records.value[newIndex]?.reactiveRecord.position);
    };

    const actionColumn = {
      key: 'actions',
      render: 'actions',
      fixed: props.config.actionColumnFixed ? 'right' : false,
      width: 80,
    };

    const localColumns = computed(() => {
      let result: any = null;
      if (props.config.columns) {
        if (props.memberActions.length > 0) {
          result = [...props.config.columns, actionColumn];
        } else {
          result = props.config.columns;
        }
      }

      return result?.map((item: VObject) => ({
        ...item,
        filters: item.filters?.length > 0 ? item.filters : undefined,
      }));
    });

    const getValue = (record: VObject, column: TaTemplateFormColumnAttribute) => {
      return jsonataGet(record, column.dataIndex?.join('.'));
    };

    return {
      ...toRefs(props),
      rowKey,
      records,
      rowSelection,
      pagination,
      bordered,
      tableLoading,
      showHeader,
      customRow,
      getRowClassName,
      scroll,
      locale,
      size,
      onChange,
      onExpand,
      endDrag,
      localColumns,
      renders,
      getValue,
      heightAutoClass,
      styleDom,
      childrenColumnName,
    };
  },
});

export default TaIndexTable;
</script>

<template lang="pug">
.ta-table-component.relative.flex.flex-col(
  :class='{ [heightAutoClass]: true, [skin]: true }',
  @click.stop='',
)
  component(is='style', ref='styleDom')
  //- h1 {{  localColumns}}
  slot(name='header')
  a-table.z-2.ta-table-component__table.ta-table-component__body__table(
    v-bind='config',
    :columns='localColumns',
    :rowKey='rowKey',
    :dataSource='records',
    :rowSelection='rowSelection',
    :pagination='pagination',
    :bordered='bordered',
    :loading='tableLoading',
    :showHeader='showHeader',
    :customRow='customRow',
    :rowClassName='getRowClassName',
    :childrenColumnName='childrenColumnName',
    :scroll='scroll',
    :locale='locale',
    :size='size',
    :style='{ "flex-grow": config.scroll?.y === "auto", "h-0": config.scroll?.y === "auto" }'
    @change='onChange',
    @expand='onExpand'
  )
    slot
    template(#expandedRowRender="{ record }",v-if='config.expandedRowRender')
      slot(name='expandedRowRender', :record='record')
    template(#headerCell='{ title, column }')
      slot(name='headerCell', :title='title', :column='column')
        .table-header-cell(:class='{ truncate: column.ellipsis }')
          | {{ Array.isArray(title) ? title.join('') : title }}
    template(#bodyCell='{ text: value, record, index, column }', v-if='localColumns')
      component(:is='column.ellipsis ? "a-tooltip" : "div"')
        template(#title)
          | {{ value }}
        .wrapper
          TaIndexTableActionColumn.table-body-cell(
            v-if='column.render === "actions" && memberActions',
            :memberActions='memberActions',
            :store='store',
            :record='record'
          )
          span.table-body-cell(v-else-if='typeof column.render === "function"')
            | {{ column.render(getValue(record, column), index, record, column) }}
          span.table-body-cell(
            v-else-if='column.render === "No"',
            :style='{ color: column.color }'
          )
            | {{ (pagination?.pageSize || 0) * ((pagination.current || 1) - 1) + (index + 1) }}
          component.table-body-cell(
            v-else-if='column.render',
            :is='column.render',
            :item='column.item',
            :value='getValue(record, column)',
            :dataIndex='column.data_index',
            :record='record',
            :index='index',
            :column='column',
            :memberActions='memberActions',
            :actions='actions'
            :store='store',
            :style='{ color: column.color }'
          )
            slot(
              name='bodyCell',
              :text='getValue(record, column)',
              :record='record',
              :index='index',
              :column='column',
              :actions='actions'
            )
          TableRendersAuto.table-body-cell(
            v-else,
            :item='column.item',
            :column='column',
            :value='getValue(record, column)',
            :record='record',
            :index='index',
            :actions='actions'
            :style='{ color: column.color }'
          )
            slot(
              name='bodyCell',
              :text='getValue(record, column)',
              :record='record',
              :index='index',
              :column='column',
              :actions='actions'
            )
</template>

<style lang="stylus" scoped>
.ta-table-component
  position relative
  width 100%
  .ta-table-component__table
    width 100%
  >>> .ant-table-cell:before
    display none
// .ta-table-component__header__table
// height fit-content
// overflow hidden
// // >>> .ant-table-wrapper
// // height 100%
// .ta-table-component__header__table >>> .ant-pagination
// display none
// .ta-table-component__header__table >>> .ant-table-body
// // display none
// overflow hidden !important
// height 0
// .ta-table-component__header__table >>> .ant-spin-blur
// display none

@import './seamless-table.styl'
</style>
