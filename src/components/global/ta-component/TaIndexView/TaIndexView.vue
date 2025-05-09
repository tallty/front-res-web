<script lang="ts">
import { TaIndexViewConfigInterface, TaIndexViewTabInterface } from './types';
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  Ref,
  ref,
  toRefs,
  reactive,
  onActivated,
} from 'vue';
import { VModel, VObject } from '@/lib/vails/model';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { cloneDeep, merge } from 'lodash';
import useAutoTemplateForm from '../ta-template-form-core/useAutoTemplateForm';
import useActiveProps from './ta-index-view-core/useActiveProps';
import useFetchData from './ta-index-view-core/useFetchData';
import useTabAndTag from './ta-index-view-core/useTabAndTag';
import useActions from './ta-index-view-core/useActions';
import useProcessFields from '../ta-template-form-core/useProcessFields';
import {
  TaTemplateFormItem,
  TaTemplateFormSelect,
  TaTemplateFormColumnAttribute,
} from '../ta-template-form-core/types';
import { TaIndexSearcherOptionInterface, TaIndexTreeItem } from './ta-index-view-core/types';
import { useTaIndexViewFilter } from './ta-index-view-core/useTaIdexViewFilter';

// slot `${key}_tab` 作为该 tab 下 slot

const TaIndexView = defineComponent({
  name: 'TaIndexView',
  components: {},
  props: {
    config: { type: Object as PropType<TaIndexViewConfigInterface>, required: true },
    tabs: { type: Array as PropType<TaIndexViewTabInterface[]>, default: () => [] },
    tabsLeftMargin: { type: Number, default: 0 },
    emptyText: { type: String, default: '暂无数据' },
    showHeader: { type: Boolean, default: true },
    showFilter: { type: Boolean, default: true },
    isSelection: { type: Boolean },
    selectedRecords: { type: Array as PropType<(VModel<VObject> & VObject)[]>, default: () => [] },
    sidebarWidth: { type: Number, default: 0 },
    autoFetch: { type: Boolean, default: true },
    keepSelectionOnSwitch: { type: Boolean, default: false },
    temporaryQuery: { type: Object, default: () => ({}) },
    temporarySubQuery: { type: Object, default: () => ({}) },
    defaultActiveTabKey: { type: String, default: '' },
    drawerDisabled: { type: Boolean, default: false },
  },
  emits: [
    'update:selectedRecords',
    'onShow',
    'onIndex',
    'onExpand',
    'expand',
    'tabChange',
    'mounted',
    'onCreate',
    'onUpdate',
    'onCloseDetail',
    'fieldsChange',
    'afterSave',
    'afterDelete',
    'selectedAdd',
    'selectedRemove',
    'tableChange',
    'onBatchEdit',
  ],
  setup(props, { emit, slots }) {
    const visibleDrawer = ref(false);
    const visibleDialog = ref(false);
    const visibleFormDrawer = ref(false);
    const visibleFormDialog = ref(false);
    const visibleSelection = ref(false);
    const visibleMoreActions = ref(false);
    const editable = ref(false);
    const route = useRoute();
    const router = useRouter();
    const editRecord: Ref<VModel | null> = ref(null);

    const jumpRoute = (route: string) => {
      router.push(route);
    };

    // emits: tabChange, update:selectedRecords, tagChange
    const {
      activeTabKey,
      activeTab,
      activeTag,
      onTabClick,
      onTagClick,
      isActive,
      useTabAndTagOnMounted,
      onTabIndexChange,
      onTagIndexChange,
    } = useTabAndTag(props, emit, jumpRoute, visibleSelection);

    const {
      activeStore,
      activeParams,
      activeStatCondition,
      activeMode,
      activeRecordName,
      activeShowCount,
      activeSelectionConfig,
      activeActionsConfig,
      activeRowKey,
      activeListConfig,
      activeSearcherSimpleOptions: activeSearcherSimpleOptionsOriginal,
      activeSearcherComplicatedOptions: activeSearcherComplicatedOptionsOriginal,
      activeSearcherAccordionUseDrawer,
      activeDraggable,
      activeTemplate,
      activeBatchUpdateTemplate,
      activeSteps,
      activeDetailConfig,
      activeFormConfig,
      activeFormDataEncode,
      activeEditApi,
      activeTableConfig,
      activePaginationConfig,
      activeScrollLoading,
      activePerPage,
      activeLayout,
      activeInterval,
      activeGroupKeys,
    } = useActiveProps(props, activeTab, activeTag);

    visibleSelection.value = activeSelectionConfig.value.showByDefault;

    const searcherAccordionFilter = (opt: TaIndexSearcherOptionInterface) => {
      return ['select', 'dynamicComponent'].includes(opt.type) || opt.options;
    };

    const activeSearcherSimpleOptions = computed(() => {
      const formSimpleOptions = (localTemplate.value.options?.searcher || []).filter(
        (opt: TaIndexSearcherOptionInterface) => !opt.simpleHidden,
      );

      return formSimpleOptions.length > 0
        ? formSimpleOptions
        : activeSearcherSimpleOptionsOriginal.value;
    });

    const activeSearcherComplicatedOptions = computed(() => {
      const formComplicatedOptions = (localTemplate.value.options?.searcher || []).filter(
        (opt: TaIndexSearcherOptionInterface) => !opt.complicatedHidden,
      );
      return (
        (formComplicatedOptions.length > 0 ? formComplicatedOptions : undefined) ||
        (formComplicatedOptions.length > 0
          ? undefined
          : activeSearcherComplicatedOptionsOriginal.value)
      );
    });

    const activeSearcherAccordionOptions = computed(() =>
      (activeSearcherComplicatedOptions.value || []).filter((opt: TaIndexSearcherOptionInterface) =>
        searcherAccordionFilter(opt),
      ),
    );

    const { localTemplate, fetchTemplate, getDataIndexValue } = useAutoTemplateForm(
      activeTemplate as any,
    );

    const { localTemplate: localBatchUpdateTemplate, fetchTemplate: fetchBatchUpdateTemplate } =
      useAutoTemplateForm(activeBatchUpdateTemplate as any);

    const { filters, filterValues, onFilter, cancelFilter, filterQuery } =
      useTaIndexViewFilter(localTemplate);

    const accordionSearcherQuery = ref({});

    const otherQuery = computed(() => ({
      ...filterQuery.value,
      ...accordionSearcherQuery.value,
    }));

    // emits: onIndex
    const { searcherQuery, fetchData, refresh, silenceRefresh, useFetchDataMounted, fetchLocked } =
      useFetchData(
        props,
        emit,
        activeTab,
        activeTag,
        activeStore,
        activePerPage,
        activeParams,
        activeStatCondition,
        activeGroupKeys,
        activeScrollLoading,
        otherQuery,
        activeInterval,
      );

    const { getFormItems } = useProcessFields();

    const flatTemplateItems = computed(() =>
      typeof localTemplate.value === 'object' ? getFormItems(localTemplate.value) : [],
    );

    const getColumnItem = (column: any) => {
      const items = flatTemplateItems.value.filter(
        (i: TaTemplateFormItem) =>
          [i.model_key_prefix, i.model_key].filter(i => i).join('.') === column.dataIndex,
      );

      // 合并同 key 的 select
      const select = items
        .map((i: TaTemplateFormItem) => i.options?.select)
        .filter(i => i)
        .reduce(
          (a: TaTemplateFormSelect[], b?: TaTemplateFormSelect[]) => a.concat(b || []),
          [] as TaTemplateFormSelect[],
        );

      return items[0] ? { ...items[0], options: { ...items[0].options, select } } : null;
    };

    const activeTableRemoteConfig = computed(() => {
      const templateColumnAttributes = (localTemplate.value.column_attributes || []).filter(
        (column: TaTemplateFormColumnAttribute) => {
          return !(typeof column.index?.on === 'boolean' && column.index.on === false);
        },
      );

      const columns = activeTableConfig.value.columns
        ? [...(activeTableConfig.value.columns || [])].map(column => ({
            ...column,
            dataIndex: (column.dataIndex || '').split('.'),
            render: column.render || 'TableRendersAuto',
            item: getColumnItem(column),
          }))
        : templateColumnAttributes.length > 0
        ? [
            ...(activeTableConfig.value.shiftColumns || []),
            ...(templateColumnAttributes || []),
            ...(activeTableConfig.value.pushColumns || []),
          ].map(column => ({
            ...column,
            filters: (column?.filters?.length || 0) > 0 ? column.filters : null,
            dataIndex: column.dataIndex?.split('.'),
            render: column.render || 'TableRendersAuto',
            item: getColumnItem(column),
          }))
        : null;

      return {
        ...activeTableConfig.value,
        columns,
      };
    });

    const taTabTabs = computed(() =>
      props.tabs.map((tab: TaIndexViewTabInterface) => ({
        key: tab.key,
        label: tab.label,
        num: tab.num,
      })),
    );

    const rowSelection = computed(() => {
      if (visibleSelection.value) {
        return {
          type: activeTableConfig.value?.rowSelectionType,
          selectedRowKeys: props.selectedRecords
            .filter(
              (r: VObject) =>
                !r.__TaIndexViewTabKey ||
                (r.__TaIndexViewTabKey && r.__TaIndexViewTabKey === activeTab.value.key),
            )
            .map((i: VObject) => i[activeRowKey.value]),
          onSelect: (selectedRecord: VModel<VObject> & VObject, selected: boolean) => {
            let selectedRecords = [...props.selectedRecords];
            selectedRecords = processSelection(selectedRecords, selectedRecord, selected);
            emit('update:selectedRecords', selectedRecords, props.selectedRecords);
          },
          onSelectAll: (selected: boolean) => {
            let selectedRecords = [...props.selectedRecords];
            activeStore.value.records.value.forEach((record: VModel<VObject> & VObject) => {
              selectedRecords = processSelection(selectedRecords, record, selected);
            });
            emit('update:selectedRecords', selectedRecords, props.selectedRecords);
          },
          getCheckboxProps: (record: VObject) => {
            return activeSelectionConfig.value.getCheckboxProps?.(record);
          },
          // onChange: (rowKeys: number[], records: VModel[]) => {
          //   const map: { [key: string]: VModel } = props.selectedRecords.concat(records).reduce(
          //     (obj, item) => ({
          //       ...obj,
          //       [(item as VObject)[activeRowKey.value]]: item,
          //     }),
          //     {},
          //   );
          //   const selectedRecords = Object.values(map).filter(o =>
          //     rowKeys.includes((o as VObject)[activeRowKey.value]),
          //   );

          //   emit('update:selectedRecords', selectedRecords, props.selectedRecords);
          // },
        };
      } else {
        return {};
      }
    });

    const processSelection = (
      data: (VModel<VObject> & VObject)[],
      selectedRecord: VModel<VObject> & VObject,
      selected: boolean,
    ) => {
      // 用于 TaNestedAttributesPolymorphicField
      selectedRecord.__TaIndexViewTabKey = activeTab.value.key;

      if (selected) {
        if (
          activeSelectionConfig.value.notMultiple ||
          activeTableConfig.value.rowSelectionType === 'radio'
        ) {
          data = [selectedRecord];
          // NOTE: 这里没有清除其他的，不过单选是不用 nested attributes，所以无伤大雅
          emit('selectedAdd', selectedRecord);
          return data;
        } else {
          data.push(selectedRecord);
          emit('selectedAdd', selectedRecord);
          return data.filter(
            (record, index) =>
              data.findIndex(r => r[activeRowKey.value] === record[activeRowKey.value]) === index,
          );
        }
      } else {
        const index = data.findIndex(r =>
          selectedRecord.__TaIndexViewTabKey
            ? selectedRecord.__TaIndexViewTabKey === activeTab.value.key &&
              r[activeRowKey.value] === selectedRecord[activeRowKey.value]
            : r[activeRowKey.value] === selectedRecord[activeRowKey.value],
        );
        if (index >= 0) {
          data.splice(index, 1);
          emit('selectedRemove', selectedRecord, index);
        }
        return data;
      }
    };

    onMounted(async () => {
      await fetchTemplate();
      await useTabAndTagOnMounted();
      await useFetchDataMounted();
      emit('mounted');
    });

    onActivated(() => {
      silenceRefresh();
    });

    const onRowClick = async (record: VModel & VObject) => {
      emit('onShow', record);
      switch (activeDetailConfig.value.mode) {
        case 'auto':
          await syncEditRecord(record);
          editable.value = false;
          visibleDrawer.value = true;
          break;
        case 'drawer':
          await syncEditRecord(record);
          editable.value = false;
          visibleDrawer.value = true;
          break;
        case 'dialog':
          await syncEditRecord(record);
          editable.value = false;
          visibleDialog.value = true;
          break;
        case 'route':
          router.push(`${activeDetailConfig.value.url || route.path}/${record.id}`);
          break;
        case 'window':
          const url = activeDetailConfig.value.url || `${route.path}/${record.id}`;
          if (process.env.VUE_APP_PUBLIC_PATH) {
            const publichPath = process.env.VUE_APP_PUBLIC_PATH.split('/')
              .filter((i: string | undefined) => i)
              .join('/');
            window.open(publichPath ? `/${publichPath}${url}` : `${url}`);
          } else {
            window.open(`${url}`);
          }
          break;
      }
    };
    const onExpand = (expanded: boolean, record: VObject, item?: TaIndexTreeItem) => {
      emit('onExpand', expanded, record, item);
      emit('expand', expanded, record, item);
    };
    const openForm = () => {
      switch (activeFormConfig.value.mode) {
        case 'auto':
          editable.value = true;
          visibleFormDrawer.value = true;
          break;
        case 'drawer':
          editable.value = true;
          visibleFormDrawer.value = true;
          break;
        case 'dialog':
          editable.value = true;
          visibleFormDialog.value = true;
          break;
        default:
          editable.value = true;
          visibleFormDrawer.value = true;
      }
    };

    const createLocked = ref(false);

    const onCreate = (opts?: { keepDataOnNext?: boolean; initFormData?: VObject }) => {
      // 这里加锁，是因为 production 时，会出现莫名的两次创建
      if (createLocked.value) return;
      createLocked.value = true;
      setTimeout(() => {
        createLocked.value = false;
      }, 500);

      editable.value = true;
      const lastFormData = cloneDeep(editRecord.value?.lastFormData);
      console.log(opts, lastFormData, 'lastFormData');

      editRecord.value = activeStore.value.new(
        merge(
          cloneDeep(opts?.initFormData || {}),
          cloneDeep(opts?.keepDataOnNext ? { ...lastFormData, id: null } : {}),
        ),
      );
      editRecord.value!.formData = reactive(
        activeFormDataEncode.value(cloneDeep(editRecord.value!.rawData)),
      );

      if (activeTemplate.value) {
        openForm();
      }
      emit('onCreate', editRecord);
    };

    const syncEditRecord = async (record: VModel<VObject> & VObject) => {
      editable.value = true;
      await record.fetch();
      activeStore.value.record.value = record;
      editRecord.value = activeStore.value.record.value as any;
      editRecord.value!.reload(activeFormDataEncode.value(cloneDeep(editRecord.value!.rawData)));
    };

    const batchUpdating = ref(false);

    const finalFormTemplate = computed(() => {
      return batchUpdating.value
        ? localBatchUpdateTemplate.value || localTemplate.value
        : localTemplate.value;
    });

    const onEdit = async (record: VModel) => {
      await syncEditRecord(record);
      if (activeTemplate.value) {
        batchUpdating.value = false;
        openForm();
      }

      emit('onUpdate', editRecord);
    };

    const onBatchEdit = async () => {
      if (activeBatchUpdateTemplate.value) {
        await fetchBatchUpdateTemplate();
      }

      if (activeBatchUpdateTemplate.value || activeTemplate.value) {
        batchUpdating.value = true;
        editRecord.value = activeStore.value.new();
        editRecord.value!.save = async () => await onBatchUpdate();
        openForm();
      }
      emit('onBatchEdit', editRecord);
    };

    const onBatchUpdate = async (records: VModel[] = props.selectedRecords) => {
      await activeStore.value
        .sendCollectionAction({
          action: 'batch_update',
          config: {
            data: {
              ids: records.map(record => record.reactiveRecord.id),
              [activeStore.value.api.paramsKey]: editRecord.value!.formData,
            },
          },
        })
        .then(() => {
          message.success('批量删除编辑成功');
          silenceRefresh();
        })
        .catch((err: Error) => {
          message.error('批量编辑失败');
          throw err;
        });
    };

    const onDelete = (record: VModel = props.selectedRecords[0]) => {
      return record
        .delete({}, activeEditApi.value)
        .then(() => {
          message.success('删除成功');
          silenceRefresh();
        })
        .catch(err => {
          message.error('删除失败');
          throw err;
        });
    };

    const onBatchDestroy = (records: VModel[] = props.selectedRecords) => {
      activeStore.value
        .sendCollectionAction({
          action: 'batch_destroy',
          config: { params: { ids: records.map(record => record.reactiveRecord.id) } },
        })
        .then(() => {
          message.success('批量删除成功');
          emit('update:selectedRecords', [], props.selectedRecords);
          silenceRefresh();
        })
        .catch((err: Error) => {
          message.error('批量删除失败');
          throw err;
        });
    };

    const onCloseDetail = () => {
      visibleDrawer.value = false;
      visibleDialog.value = false;
      visibleFormDrawer.value = false;
      visibleFormDialog.value = false;

      if (!activeScrollLoading.value) {
        silenceRefresh();
      }
      emit('onCloseDetail', editRecord);
    };

    const onDraggle = (record: VModel, position?: number) => {
      record
        .update({ id: record.reactiveRecord.id, position: position || 1 }, {}, activeEditApi.value)
        .then(() => {
          silenceRefresh();
        });
    };

    const importer = ref<any>(null);
    const exporter = ref<any>(null);

    const slotActions = computed(() => ({
      onCreate,
      onEdit,
      onDelete,
      onBatchDestroy,
      onBatchEdit,
      create: onCreate,
      update: onEdit,
      delete: onDelete,
      batch_delete: onBatchDestroy,
      silenceRefresh,
      refresh,
      import: importer.value?.onShow || (() => {}),
      export: exporter.value?.onHeaders || (() => {}),
    }));

    const {
      activeActions,
      activeActionsKeyToItemMap,
      activeActionsMemberActions,
      activeActionsHeaderActions,
      activeActionsHeaderCollapsedActions,
    } = useActions(activeActionsConfig, slotActions, localTemplate);

    const afterSave = () => {
      silenceRefresh();
      emit('afterSave', editRecord.value);
    };

    const afterDelete = () => {
      silenceRefresh();
      emit('afterDelete');
    };
    const tableChange = (pagination: VObject, filters: VObject, sorter: VObject) => {
      emit('tableChange', pagination, filters, sorter);
    };

    const oldSearcherOptions = computed(() =>
      (activeSearcherComplicatedOptions.value || []).map((opt: TaIndexSearcherOptionInterface) => ({
        key: opt.label,
        label: opt.label,
        value: opt.key,
        type: opt.type,
        select: opt.select,
      })),
    );

    const detailTitle = computed(() =>
      activeDetailConfig.value.hideTitle
        ? null
        : editable.value
        ? (editRecord.value as VObject)?.id
          ? `编辑${activeRecordName.value}`
          : `新建${activeRecordName.value}`
        : '详情',
    );

    const formTitle = computed(() =>
      activeFormConfig.value.hideTitle
        ? null
        : editable.value
        ? (editRecord.value as VObject)?.id
          ? `编辑${activeRecordName.value}`
          : `新建${activeRecordName.value}`
        : '详情',
    );

    return {
      ...toRefs(props),
      oldSearcherOptions,
      slots,
      activeTabKey,
      activeMode,
      activeTab,
      activeStore,
      activePerPage,
      activeRecordName,
      activeShowCount,
      activeRowKey,
      activeListConfig,
      activeSelectionConfig,
      activeDetailConfig,
      activeFormConfig,
      activeDraggable,
      activeSearcherSimpleOptions,
      activeSearcherComplicatedOptions,
      activeTemplate,
      activeTableRemoteConfig,
      activePaginationConfig,
      activeScrollLoading,
      activeLayout,
      activeGroupKeys,
      fetchData,
      onRowClick,
      onTabClick,
      onTagClick,
      onExpand,
      isActive,
      onCloseDetail,
      onDraggle,
      searcherQuery,
      rowSelection,
      visibleDrawer,
      visibleDialog,
      visibleSelection,
      visibleMoreActions,
      visibleFormDrawer,
      visibleFormDialog,
      editable,
      taTabTabs,
      editRecord,
      slotActions,
      localTemplate,
      syncEditRecord,
      afterSave,
      afterDelete,
      refresh,
      silenceRefresh,
      getDataIndexValue,
      activeActions,
      activeActionsKeyToItemMap,
      activeActionsConfig,
      activeActionsMemberActions,
      activeActionsHeaderActions,
      activeActionsHeaderCollapsedActions,
      activeTag,
      activeSteps,
      detailTitle,
      formTitle,
      activeEditApi,
      filters,
      cancelFilter,
      filterValues,
      onFilter,
      tableChange,
      fetchLocked,
      onTabIndexChange,
      onTagIndexChange,

      accordionSearcherQuery,
      importer,
      exporter,
      activeSearcherAccordionOptions,

      batchUpdating,
      onBatchEdit,
      onBatchDestroy,
      finalFormTemplate,
      activeSearcherAccordionUseDrawer,
    };
  },
});

export default TaIndexView;
</script>

<template lang="pug">
.ta-index-view.h-full
  TaAccordionSearcher(
    v-if='activeSearcherAccordionOptions.length > 0 && !activeSearcherAccordionUseDrawer',
    v-model:query='accordionSearcherQuery',
    :options='activeSearcherComplicatedOptions',
    :simpleOptions='activeSearcherSimpleOptions',
    :placeholder='`搜索${activeSearcherSimpleOptions.map(i => i.label).join("、")}`',
  )
  .ta-index-view-header.bg-white(v-if='showHeader')
    .header
      slot(
        name='header',
        :searcherQuery='searcherQuery',
        :actions='slotActions',
        :activeRecordName='activeRecordName'
      )
        TaTitleHeader(:title='activeRecordName')
    .ta-index-view-filters.flex.items-center(v-if='filters.length > 0 && showFilter')
      .ta-index-view-filter(v-for='filterItem in filters')
        a-popover(placement='bottomLeft')
          template(#content)
            .ta-index-view-filter-items
              .ta-index-view-filter-item.flex(@click='cancelFilter(filterItem)') 全部
              .ta-index-view-filter-item.flex(
                v-for='value in filterItem.filteredValue',
                :class='{ "active-item": value === filterValues[filterItem.dataIndex] }',
                @click='onFilter(value, filterItem)'
              )
                | {{ value }}

          .label.flex-center
            template(v-if='filterValues[filterItem.dataIndex]')
              .active.text {{ filterValues[filterItem.dataIndex] }}
              TaIcon.active(type='CaretUpOutlined')
            template(v-else)
              .text {{ filterItem.title[0] }}
              TaIcon(type='CaretDownOutlined')
    .ta-index-view-actions.space-x-2
      .custom-actions
        slot(
          name='actions',
          :record='editRecord',
          :records='selectedRecords',
          :actions='slotActions'
          :visibleSelection='visibleSelection',
        )

      .search(v-if='!(activeSearcherAccordionOptions.length > 0 && !activeSearcherAccordionUseDrawer)')
        TaRansackSearcher(
          v-if='activeSearcherComplicatedOptions && activeSearcherSimpleOptions && activeSearcherAccordionOptions.length == 0',
          v-model:value='searcherQuery',
          :options='oldSearcherOptions',
          :variables='activeSearcherSimpleOptions.map(i => i.key)',
          tips='搜索',
          :placeholder='`搜索${activeSearcherSimpleOptions.map(i => i.label).join("、")}`',
          @focusSearch='() => fetchData()'
        )
        TaSearcher(
          v-else-if='activeSearcherSimpleOptions',
          v-model:value='searcherQuery',
          :variables='activeSearcherSimpleOptions.map(i => i.key)',
          tips='搜索',
          :placeholder='`搜索${activeSearcherSimpleOptions.map(i => i.label).join("、")}`',
          @focusSearch='() => fetchData()'
        )
      TaAccordionSearcherDrawer(
        v-if='activeSearcherAccordionOptions.length > 0 && activeSearcherAccordionUseDrawer',
        v-model:query='accordionSearcherQuery',
        :options='activeSearcherComplicatedOptions',
      )
      .collection-or-selectable-actions.space-x-2
        template(v-for='action in activeActionsHeaderActions')
          template(
            v-if='(action.action_type === "selectable" && selectedRecords.length >= 1) || action.action_type === "collection"'
          )
            .import-action(v-if='action.key === "import"')
              TaPolicyResources(actionKey='import', :store='activeStore')
                TaImport(
                  :store='activeStore',
                  :headers='(activeActionsConfig.import || {}).importHeaders',
                  :template='localTemplate',
                  @success='fetchData'
                )
            .export-action(v-else-if='action.key === "export"')
              TaPolicyResources(actionKey='export', :store='activeStore')
                TaExport(
                  :store='activeStore',
                  :temporaryQuery='temporaryQuery',
                  :template='activeActionsConfig.export?.exportTemplate || localTemplate'
                  :filename='activeActions.find(action => action.key === "export")?.exportFilename'
                  :action='action',
                )
            .export-file-action(v-else-if='action.key === "export_file"')
              TaPolicyResources(actionKey='export_file', :store='activeStore')
                TaExportFile(
                  :store='activeStore',
                  :temporaryQuery='temporaryQuery',
                  :template='activeActionsConfig.export?.exportTemplate || localTemplate'
                  :filename='activeActions.find(action => action.key === "export")?.exportFilename'
                  :action='action',
                )

            TaPolicyResources(
              v-else-if='["batch_destroy"].includes(action.key) && visibleSelection && selectedRecords.length > 0'
              :store='activeStore',
              actionKey='batch_destroy',
            )
              TaPopoverConfirm(
                title='批量删除',
                :content='`确认批量删除该${activeRecordName}`',
                @confirm='onBatchDestroy'
              )
                TaTextButton(icon='DeleteOutlined') 批量删除

            TaPolicyResources(
              v-else-if='["batch_update"].includes(action.key) && visibleSelection && selectedRecords.length > 0'
              :store='activeStore',
              actionKey='batch_update',
            )
              TaTextButton(icon='EditOutlined', @click='onBatchEdit') 批量编辑
            TaPolicyResources(
              v-else-if='action.confirm',
              :actionKey='action.key',
              :store='activeStore',
              :alwaysEnabled='!["create"].includes(action.key)'
            )
              TaPopoverConfirm(
                :title='action.label',
                :content='action.options?.confirmText || `您确认${action.label}这些${activeRecordName}吗？`',
                @confirm='action.callback'
              )
                TaTextButton(:icon='action.icon') {{ action.label }}
            TaPolicyResources(
              v-else,
              :actionKey='action.key',
              :store='activeStore',
              :alwaysEnabled='!["create"].includes(action.key)'
            )
              TaTextButton(:icon='action.icon', @click='action.callback') {{ action.label }}
        slot(
          name='collection-actions',
          :records='selectedRecords',
          :temporaryQuery='temporaryQuery'
        )

      .selection-switch(
        v-if='activeSelectionConfig.showSwitch && !activeSelectionConfig.showByDefault'
      )
        span.action(v-if='visibleSelection', @click='visibleSelection = false') 取消选择
        span.action(v-else, @click='visibleSelection = true') 批量选择


      .custom-actions
        slot(
          name='right-actions',
          :record='editRecord',
          :records='selectedRecords',
          :actions='slotActions',
          :template='localTemplate',
          :visibleSelection='visibleSelection',
        )
      a-popover(
        v-if='activeActionsHeaderCollapsedActions.length > 0',
        v-model='visibleMoreActions',
        placement='bottomRight'
      )
        TaIconTooltip(icon='EllipsisOutlined')
        template(#title)
          .popover-title 更多操作
        template(#content, style='margin: -14px 0px')
          TaPolicyResources(
            v-for='action in activeActionsHeaderCollapsedActions',
            :actionKey='action.key',
            :store='activeStore',
            :alwaysEnabled='!["create"].includes(action.key)'
          )
            .popover-item(@click='action.callback')
              TaIcon(:type='action.icon')
              span(style='margin-left: 12px') {{ action.label }}
  TaIndexViewLayout(
    :tabsLayoutDirection='activeLayout.direction?.tabsLayout',
    :tagsLayoutDirection='activeLayout.direction?.tagsLayout',
    :scroll='{ ...(activeMode === "table" && activeTableRemoteConfig.seamlessScroll ? { y: "auto" } : {}), ...(activeTableRemoteConfig?.scroll || activeListConfig?.scroll) }'
  )
    template(#virtual_layout_tabs)
      .ta-index-view-ta-tab.flex.justify-between.items-center
        .flex.items-center.w-full
          slot(name='tabs_left', :actions='slotActions')
          slot(
            name='virtual_layout_tabs',
            :tabs='tabs',
            :onTabClick='onTabClick',
            :onTabIndexChange='onTabIndexChange',
            :activeTab='activeTab',
            :actions='slotActions'
          )
            TaTab(
              v-if='tabs && tabs[0]',
              v-model:value='activeTabKey',
              :tabs='taTabTabs',
              @update:value='onTabClick'
            )
              template(#tab='{ tab, isActive }')
                .tab.flex-between(
                  :class='{ "tab-active": isActive }',
                  :style='tab.width ? `width: ${tab.width}px` : null'
                )
                  .tab-label {{ tab.label }}
                  .num(v-if='activeShowCount && typeof tab.num === "number"')
                    span ·
                    .badge(:style='{ background: tab.background, color: tab.color }')
                      | {{ tab.num }}
        slot(name='tabs_right', :actions='slotActions')
    template(#horizontal_layout_tabs, :actions='slotActions')
      .ta-index-view-horizontal-layout-tabs
        slot(
          name='horizontal_layout_tabs',
          :tabs='tabs',
          :onTabClick='onTabClick',
          :onTabIndexChange='onTabIndexChange',
          :activeTab='activeTab'
        )
          a-menu(
            v-if='tabs && tabs[0]',
            :selectedKeys='[activeTag.key]',
            mode='inline',
            @click='onTabClick($event.key)',
            :style='activeTab.width ? `width: ${activeTab.width}px` : null'
          )
            a-menu-item(v-for='tab in tabs', :key='tab.key')
              | {{ tab.label }}{{ typeof tab.num === "number" ? ` · ${tab.num}` : "" }}
    template(#virtual_layout_tags)
      slot(
        name='virtual_layout_tags',
        :activeTab='activeTab',
        :tags='activeTab.tags',
        :onTagClick='onTagClick',
        :onTagIndexChange='onTagIndexChange',
        :activeTag='activeTag'
      )
        .virtual-layout-tags
          a-tag.tag(
            v-for='tag in activeTab.tags',
            :class='{ "active-tag": activeTag.key === tag.key }',
            @click='onTagClick(tag)'
          ) {{ tag.label }}
    template(#horizontal_layout_tags)
      slot(
        name='horizontal_layout_tags',
        :activeTab='activeTab',
        :tags='activeTab.tags',
        :onTagClick='onTagClick',
        :onTagIndexChange='onTagIndexChange',
        :activeTag='activeTag'
      )
        a-menu(
          v-if='activeTab.tags && activeTab.tags[0]',
          :selectedKeys='[activeTab.key]',
          mode='inline',
          @click='onTagIndexChange(activeTab.tags.findIndex(t => t.key === $event.key))',
        )
          a-menu-item(v-for='tab in activeTab.tags', :key='tab.key')
            | {{ tab.label }}{{ typeof tab.num === "number" ? ` · ${tab.num}` : "" }}
    template(#content)
      .content.flex.flex-col
        slot(name='extra_content', :actions='slotActions')
        template(v-if='activeMode === "custom"')
          slot(name='content')
          slot(
            name='custom',
            :actions='slotActions',
            :store='activeStore',
            :template='localTemplate',
          )
        TaTagIndex(
          v-else-if='activeMode === "tag"',
          :store='activeStore',
          :actions='slotActions',
          :activeActionsKeyToItemMap='activeActionsKeyToItemMap',
        )
          template(#default='{ record }')
            slot(
              :record='record',
              :actions='slotActions'
            )
        TaSidebarList(
          :key='activeTab.key',
          v-else,
          :store='activeStore',
          :isTable='activeMode === "table"',
          :isTree='activeMode === "tree"',
          :isSeamlessScrollTable='activeMode === "table" && activeTableRemoteConfig.seamlessScroll',
          :sidebarWidth='sidebarWidth',
          :rowKey='activeRowKey',
          :rowSelection='rowSelection',
          :paginationConfig='activePaginationConfig',
          :tableConfig='activeTableRemoteConfig',
          :scrollLoading='activeScrollLoading',
          :listConfig='activeListConfig',
          :selectionConfig='activeSelectionConfig',
          :draggable='activeDraggable',
          :emptyText='emptyText',
          :memberActions='activeActionsMemberActions',
          :activeActionsKeyToItemMap='activeActionsKeyToItemMap',
          :actions='slotActions',
          :disable_tree_parent='config?.disable_tree_parent'
          @rowClick='onRowClick',
          @onPaginateChange='fetchData',
          @draggle='onDraggle',
          @tableChange='tableChange',
          @expand='onExpand',
        )
          template(#default='{ record, index, isActive }')
            slot(
              :name='`${activeTab.key}_tab`',
              :record='record',
              :index='index',
              :isActive='isActive',
              :actions='slotActions'
            )
            template(v-if='activeMode === "table" && !activeTableRemoteConfig?.autoOff')
              a-table-column(v-for='attr in localTemplate?.index_attributes', :title='attr.name')
                template(#default='{ record }')
                  TaCellValueFormatter(:value='getDataIndexValue(attr, record)', :config='attr')
            TaIndexViewCard(
              v-if='activeGroupKeys?.length > 0',
              :store='activeStore',
              :mode='activeMode',
              :record='record',
              :depth='0',
              :template='localTemplate',
              @click.stop='',
            )
              template(#card='{ record, index, no, isActive, actions, memberActions }')
                slot(
                  name='card',
                  :record='record',
                  :index='index',
                  :no='no',
                  :isActive='isActive',
                  :actions='slotActions',
                  :memberActions='activeActionsMemberActions',
                )
              template(#table)
                slot(name='table')
              template(#bodyCell='{ record, text, column, actions }')
                slot(
                  name='bodyCell',
                  :record='record',
                  :text='text',
                  :column='column',
                  :actions='actions'
                )
              template(#ta-index-view-card-header='{ record, store, depth }')
                slot(
                  name='ta-index-view-card-header',
                  :record='record',
                  :store='activeStore',
                  :depth='depth',
                )
            slot(
              v-else,
              :name='activeMode === "table" ? "table" : "card"',
              :record='record',
              :index='index',
              :no='activeScrollLoading ? index : index + (activeStore.currentPage.value - 1) * activeStore.perPage.value + 1',
              :isActive='isActive',
              :actions='slotActions',
              :memberActions='activeActionsMemberActions',
            )
            a-table-column(
              v-if='activeMode === "table" && (activeActionsConfig.update || activeActionsConfig.delete)',
              :width='100'
            )
              template(#default='{ record }')
                TaPolicyResources(
                  v-if='activeActionsConfig.update',
                  actionKey='update',
                  :store='activeStore'
                )
                  TaIcon.icon(type='EditOutlined', @click.stop='slotActions.onEdit(record)')
                TaPolicyResources(
                  v-if='activeActionsConfig.delete',
                  actionKey='destroy',
                  :store='activeStore'
                )
                  TaPopoverConfirm(
                    title='删除',
                    :content='`确认删除该${activeRecordName}`',
                    @confirm='slotActions.onDelete(record)'
                  )
                    TaIcon(@click.stop='', type='DeleteOutlined')

          template(#table_top)
            slot(name='table_top')
          template(#sidebar)
            slot(name='sidebar', :onTagClick='onTagClick')
          template(#bodyCell='{ text, record, index, column, actions }')
            slot(name='bodyCell', :text='text', :record='record', :index='index', :column='column', :actions='actions')
          template(#content-right)
            slot(name='content-right', :actions='slotActions')
          template(#empty)
            slot(name='empty', :actions='slotActions')
          template(#expandedRowRender="{ record }")
            slot(name='expandedRowRender', :record='record')
  TaTemplateFormWithActionsDrawer(
    v-model:visible='visibleDrawer',
    v-if='visibleDrawer',
    :closable='false',
    :disabled='drawerDisabled',
    :width='activeDetailConfig.width || "1100px"',
    v-model:editable='editable',
    :template='localTemplate',
    :steps='activeSteps',
    :record='editRecord',
    :loading='activeStore.loading.value',
    :title='detailTitle',
    :canSaveAndCreateNext='true',
    @afterSave='afterSave',
    @afterDelete='afterDelete',
    @afterSaveAndCreateNext='slotActions.onCreate',
    @close='onCloseDetail'
  )
    slot(
      name='detail',
      v-if='visibleDrawer',
      :record='editRecord',
      :onClose='onCloseDetail',
      :actions='slotActions'
      :template='localTemplate',
    )

  TaTemplateFormWithActionsModal(
    v-model:visible='visibleDialog',
    v-if='visibleDialog',
    :width='activeDetailConfig.width',
    :mask='activeDetailConfig.mask',
    v-model:editable='editable',
    :template='localTemplate',
    :steps='activeSteps',
    :record='editRecord',
    :loading='activeStore.loading.value',
    :title='detailTitle',
    @afterSave='afterSave',
    @afterDelete='afterDelete',
    @afterSaveAndCreateNext='slotActions.onCreate'
  )
    slot(
      name='detail',
      v-if='visibleDialog',
      :record='editRecord',
      :onClose='onCloseDetail',
      :actions='slotActions',
      :template='localTemplate',
    )

  TaTemplateFormWithActionsDrawer(
    v-model:visible='visibleFormDrawer',
    v-if='visibleFormDrawer',
    :closable='false',
    :width='activeFormConfig.width || activeDetailConfig.width || "1100px"',
    v-model:editable='editable',
    :template='finalFormTemplate',
    :steps='activeSteps',
    :record='editRecord',
    :loading='activeStore.loading.value',
    :title='formTitle',
    :canSaveAndCreateNext='true',
    :editApi='activeEditApi',
    :canTemporaryStorage='activeFormConfig.temporaryStorage?.enable',
    :tempStoreLocation='activeFormConfig.temporaryStorage?.location',
    :closeConfirm='activeFormConfig.closeConfirm',
    @afterSave='afterSave',
    @afterDelete='afterDelete',
    @afterSaveAndCreateNext='slotActions.onCreate',
    @close='onCloseDetail'
  )
    slot(
      name='form',
      v-if='visibleFormDrawer',
      :record='editRecord',
      :template='finalFormTemplate',
      :actions='{ onClose: onCloseDetail, afterSave, afterDelete }'
    )
  TaTemplateFormWithActionsModal(
    v-model:visible='visibleFormDialog',
    v-if='visibleFormDialog',
    :width='activeFormConfig.width || activeDetailConfig.width',
    :footer='null',
    :closable='!slots.form',
    :mask='activeFormConfig.mask',
    v-model:editable='editable',
    :template='finalFormTemplate',
    :steps='activeSteps',
    :record='editRecord',
    :loading='activeStore.loading.value',
    :title='formTitle',
    :editApi='activeEditApi',
    :canTemporaryStorage='activeFormConfig.temporaryStorage?.enable',
    :tempStoreLocation='activeFormConfig.temporaryStorage?.location',
    :closeConfirm='activeFormConfig.closeConfirm',
    @afterSave='afterSave',
    @afterDelete='afterDelete',
    @afterSaveAndCreateNext='slotActions.onCreate'
  )
    slot(
      name='form',
      v-if='visibleFormDialog',
      :record='editRecord',
      :template='finalFormTemplate',
      :actions='{ onClose: onCloseDetail, afterSave, afterDelete }'
    )
  TaImport(
    ref='importer',
    class='!hidden',
    :store='activeStore',
    :headers='(activeActionsConfig.import || {}).importHeaders',
    :template='localTemplate',
    @success='fetchData'
  )
  TaExport(
    ref='exporter',
    class='!hidden',
    :store='activeStore',
    :temporaryQuery='temporaryQuery',
    :template='activeActionsConfig.export?.exportTemplate || localTemplate'
    :filename='activeActions.find(action => action.key === "export")?.exportFilename'
  )
</template>

<style lang="stylus" scoped>
.ta-index-view
  // height 100%
  width 100%
  display flex
  flex-direction column
  .ta-index-view-filters
    padding 0 24px
    flex-grow 0
    .ta-index-view-filter
      font-size 14px
      line-height 20px
      color #808080
      margin-right 58px
      .label
        .text
          margin-right 6px
        .active
          color $primary-color
  .ta-index-view-header
    // margin-bottom 20px
    position sticky
    width 100%
    top 0
    z-index 9
    // background white
    display flex
    align-items center
    justify-content space-between
    .header
      width 100%
      flex 1
  .ta-index-view-ta-tab
    width 100%
    .tab-active
      .tab-label
        color black
      .badge
        color black
    .tab
      height 48px
      color #808080
      font-size 14px
      line-height 48px
      .num
        display flex
        span
          margin-left 3px
        .badge
          padding 0 4px
          height 23px
          border-radius 50%
          text-align center
          font-size 8px
          line-height 23px
          margin auto 0px
  .ta-index-view-horizontal-layout-tabs
    height 100%
  .ta-index-view-actions
    display flex
    // padding-top 10px
    color #A4A4A4
    line-height 30px
    flex-shrink 0
    .action
      padding-right 10px
      cursor pointer
    .search
      margin-bottom -3px
    .create-action, .selection-switch, .import-action, .export-action, .search
      margin-left 12px
      display flex
      align-items center
    .custom-actions, .collection-or-selectable-actions
      display flex
      align-items center
    .create-action
      margin-top 4px
  .content
    // overflow auto
    height 100%
    width 100%
    flex 1
.ta-index-view-filter-items
  padding 13px 0
  color #909399
  .ta-index-view-filter-item
    cursor pointer
    margin 0 -16px
    height 34px
    min-width 158px
    padding 19px 23px
    align-items center
    &:hover
      color $primary-color
      background $background-color
  .active-item
    color $primary-color !important
    background $background-color
.icon
  margin-right 10px
.virtual-layout-tags
  display flex
  .tag
    cursor pointer
    border 1px solid $primary-color
    color $primary-color
    background white
  .active-tag
    color white
    background $primary-color
.popover-title
  padding 6px 0
  text-align center
.popover-item
  justify-content flex-start
  cursor pointer
.dialog-detail-switch
  padding 20px 0
  >>> .actions
    display flex
    justify-content flex-end
</style>
