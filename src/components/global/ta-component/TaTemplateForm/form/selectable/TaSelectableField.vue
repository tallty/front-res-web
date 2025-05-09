<script lang="ts">
import { FormsResourceInfos } from '@/components/global/ta-component/ta-template-form-core/apis/forms/resource_infos';
import { VStore } from '@/lib/vails';
import { VObject } from '@/lib/vails/model';
import { get, isEqual, merge } from 'lodash';
import {
  PropType,
  Ref,
  computed,
  defineComponent,
  nextTick,
  onMounted,
  ref,
  toRefs,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import draggable from 'vuedraggable';
import { TaTemplateFormItem, TaTemplateFormTableItem } from '../../../ta-template-form-core/types';
import { jsonataGet } from '../../../ta-template-form-core/useJsonata';
import { TaIndexTreeItem } from '../../../TaIndexView/ta-index-view-core/types';
import {
  TaIndexImportHeader,
  TaIndexViewConfigInterface,
  TaIndexViewTabInterface,
} from '../../../TaIndexView/types';

export const TaSelectableFieldProps = {
  attrs: { type: Array as PropType<string[]>, default: () => ['name'] },
  recordName: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  tableItems: { type: Array as PropType<TaTemplateFormTableItem[]>, default: () => [] },
  callback: { type: Function, default: () => {} },
  display: { type: String as PropType<'tag' | 'table' | 'configurable'>, default: 'tag' },
  displayConfigurableForm: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
  importExportHeaders: { type: Array as PropType<TaIndexImportHeader[]>, default: undefined },
  tabs: { type: Array as PropType<TaIndexViewTabInterface[]>, default: () => [] },
  useTree: { type: Boolean, default: false },
  disable_tree_parent: { type: Boolean, default: false },
  useList: { type: Boolean, default: false },
  extraTaIndexViewConfig: { type: Object, default: () => ({}) },
  draggable: { type: Boolean, default: false },
};

const TaSelectableField = defineComponent({
  name: 'TaSelectableField',
  components: {
    draggable,
  },
  props: {
    value: { type: Array as PropType<VObject[]>, default: () => [] },
    ...TaSelectableFieldProps,

    store: { type: Object, required: true },
    selectedRecords: { type: Array as PropType<VObject[]>, default: () => [] as VObject[] },
    resetValue: { type: Function, default: () => {} },
  },
  emits: [
    'onSelect',
    'update:value',
    'update:store',
    'update:selectedRecords',
    'resetValue',
    'open',
    'ok',
    'cancel',
    'tabChange',
    'show',
    'selectedAdd',
    'selectedRemove',
    'selectedClearUp',
    'expand',
    'tableChange',
  ],
  setup(props, { emit }) {
    const searchKey = ref('');
    const taIndexViewConfig = computed(() =>
      merge(
        {
          store: props.store,
          recordName: props.recordName,
          selection: { showByDefault: true, notMultiple: !props.multiple },
          mode: props.useList ? 'list' : 'table',
          // searcherSimpleOptions: searcherOptions.value,
          // searcherComplicatedOptions: searcherOptions.value,
          table: {
            scroll: { y: 'auto' },
            rowSelectionType: props.multiple ? 'checkbox' : 'radio',
          },
          list: {
            scroll: { y: 'auto' },
          },
          params: {
            q: {
              ...searchParams.value,
            },
          },
          actions: [
            { key: 'create', enabled: false },
            { key: 'update', enabled: false },
            { key: 'delete', enabled: false },
            { key: 'import', enabled: false },
            { key: 'export', enabled: false },
          ],
        },
        props.useTree
          ? {
              mode: 'tree',
              pagination: { perPage: 999999, hideOnSinglePage: true },
              disable_tree_parent: props.disable_tree_parent,
            }
          : {},
        props.extraTaIndexViewConfig,
      ),
    );

    const searcherOptions = computed(() => {
      return (props.tableItems || [])
        .filter((column: VObject) => column.search)
        .map(
          (column: VObject) =>
            ({
              label: column.name,
              key: column.searchKey || column.data_index,
              type: column.type || 'string',
            } || []),
        );
    });
    const searchParams = computed(() => {
      const vlist: string[] = searcherOptions.value.map(el => el.key);
      const vname = vlist.join('_or_');
      if (vname) {
        const vnameKey = `${vname}_cont_any`;
        return {
          [vnameKey]: parseStringToArray(searchKey.value),
        };
      }
      return {};
    });

    const parseStringToArray = (string: string) => {
      if (!string) return [];
      // const pattern = /[,，;；\s、!@#$%^&*_\-+=《》<>?\\/[\]()（）'"‘'“"']/g;
      const formatString = string
        // .replace(pattern, ' ')
        .trim()
        .replace(/\s{2,}/g, ' ');
      return formatString.split(' ');
    };

    // selectedRecords 是选中的值，未同步起效的值
    const localSelectedRecords = computed<VObject[]>({
      get: () => props.selectedRecords,
      set: val => emit('update:selectedRecords', val),
    });

    // value 是已同步后的值
    const localValue = computed<VObject[]>({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const visible = ref(false);
    const oldValue: Ref<VObject[]> = ref([]);
    const taIndexView = ref<any>(null);

    const onValueChange = (newVal?: (VObject | number)[], oldVal?: (VObject | number)[]) => {
      if (newVal && oldVal && isEqual(newVal, oldVal)) {
        return;
      }

      resetValue();
    };

    const resetValue = async () => {
      if (!isEqual(localValue.value, oldValue.value)) {
        await props.resetValue();
        oldValue.value = localValue.value;
      }
    };

    watch(localValue, onValueChange, { immediate: true, deep: true });

    onMounted(() => {
      props.store.reset();
      onValueChange();
    });

    const removeExistedRecord = (index: number | VObject) => {
      if (typeof index === 'object') {
        // 如果传入的是记录对象，则在原始数组中查找该记录的索引
        const recordIndex = localSelectedRecords.value.findIndex(item => item.id === index.id);
        if (recordIndex !== -1) {
          removeRecord(recordIndex);
          syncValue();
        }
      } else {
        // 兼容原来的按索引删除方式
        removeRecord(index);
        syncValue();
      }
    };

    const removeRecord = (index: number) => {
      if (props.disabled) {
        return;
      }

      emit('selectedRemove', localSelectedRecords.value[index], index);
      localSelectedRecords.value.splice(index, 1);
    };

    const syncValue = () => {
      // 单选多选都返回数组
      if (props.callback) {
        props.callback(localSelectedRecords.value);
      }
      localValue.value = localSelectedRecords.value;
    };

    const localStore = computed({
      get: () => props.store,
      set: val => emit('update:store', val),
    });

    const openSelector = () => {
      visible.value = true;
      const queryCache = props.store.query.value;
      props.store.reset();
      localStore.value.query.value = queryCache;

      nextTick(() => {
        (taIndexView.value as any).fetchData();
      });
      emit('open');
    };

    const handleOk = () => {
      visible.value = false;
      syncValue();
      emit('ok', localSelectedRecords.value);
    };

    const handleCancel = () => {
      visible.value = false;
      resetValue();
      emit('cancel');
    };

    const onSelect = (newValue: VObject[], oldValue: VObject[]) => {
      // 单选
      if (!props.multiple) {
        localSelectedRecords.value = newValue.filter(item => !oldValue.includes(item));
      } else {
        localSelectedRecords.value = newValue;
      }
      emit('onSelect', newValue, oldValue);
    };

    const onSelectedRemove = (record: VObject, index: number) => {
      emit('selectedRemove', record, index);
    };

    const clearUpRecord = () => {
      localSelectedRecords.value.forEach((record, index) => onSelectedRemove(record, index));
      emit('selectedClearUp');
      localSelectedRecords.value = [];
    };

    const localActiveTab = ref({});
    const onTabClick = computed(() => taIndexView.value?.onTabClick);

    const onTabChange = (activeTab: TaIndexViewConfigInterface) => {
      emit('tabChange', activeTab);
      localActiveTab.value = activeTab;
    };

    const getValue = (obj: VObject, key: string) => {
      return get(obj, key);
    };

    const ellipsis = (value: string) => {
      if (!value) return '';
      if (value.length > 10) {
        return value.slice(0, 10) + '...';
      }
      return value;
    };

    const onShow = (record: VObject) => {
      emit('show', record);
    };

    const toolStore = new VStore(
      new FormsResourceInfos({
        formData: {
          path: props.store.api.resourcePath,
        },
      }),
    );
    const importComp = ref<any>(null);

    const onImport = () => {
      importComp.value.clickFileInput();
    };

    const onImportConfirm = (options: {
      resultHeaders: TaIndexImportHeader[];
      uid: Ref<number>;
      resetImport: () => void;
    }) => {
      toolStore
        .sendCollectionAction({
          action: 'find_by_file',
          config: {
            data: {
              headers: options.resultHeaders,
              uid: options.uid.value,
            },
          },
        })
        .then(({ data }) => {
          localSelectedRecords.value = data.records;
          nextTick(() => syncValue());
          options.resetImport();
        });
    };

    const searchKeyword = ref('');

    const localSelectedRecordsSearched = computed(() => {
      if (!searchKeyword.value || !props.tableItems?.length) {
        return localSelectedRecords.value;
      }

      const keywords = searchKeyword.value.split(' ').filter(k => k);
      if (keywords.length === 0) {
        return localSelectedRecords.value;
      }

      return localSelectedRecords.value.filter(record => {
        // 对于每条记录，检查是否有任何一个字段包含任何一个关键词
        return props.tableItems.some(item => {
          const fieldValue = record[item.data_index];
          if (!fieldValue) return false;

          // 检查字段值是否包含任何一个关键词
          return keywords.some(keyword =>
            String(fieldValue).toLowerCase().includes(keyword.toLowerCase()),
          );
        });
      });
    });

    const onSelectedAdd = (record: VObject) => {
      emit('selectedAdd', record);
    };

    const getTagTextEllipses = (record: VObject) => {
      return ellipsis(props.attrs?.map((attr: string) => getValue(record, attr)).join(' '));
    };

    const getTagText = (record: VObject) => {
      return props.attrs?.map((attr: string) => getValue(record, attr)).join(' ');
    };

    const onExpand = (expanded: boolean, record: VObject, item: TaIndexTreeItem) => {
      emit('expand', expanded, record, item);
    };

    const onTableChange = (current: number, query: VObject, perPage: number) => {
      emit('tableChange', current, query, perPage);
    };

    const { t } = useI18n();

    return {
      ...toRefs(props),
      taIndexView,
      taIndexViewConfig,
      getValue,
      ellipsis,
      clearUpRecord,
      onTabChange,
      onSelect,
      handleCancel,
      handleOk,
      openSelector,
      removeRecord,
      removeExistedRecord,
      visible,
      localSelectedRecords,
      onShow,
      importComp,
      onImportConfirm,
      onImport,
      toolStore,
      searchKeyword,
      localValue,
      localSelectedRecordsSearched,
      onSelectedAdd,
      onSelectedRemove,
      localActiveTab,
      onTabClick,
      getTagTextEllipses,
      getTagText,
      jsonataGet,
      onExpand,
      searchKey,
      searcherOptions,
      onTableChange,
      t,
    };
  },
});
export default TaSelectableField;
</script>

<template lang="pug">
.ta-selectable-field
  slot(name='display', :open='openSelector')
    template(v-if='display === "tag"')
      slot(
        name='tags',
        :records='localSelectedRecords',
        :actions='{ removeRecord: removeExistedRecord, openSelector, getTagText, getTagTextEllipses }'
      )
        .flex.flex-col.display-layout
          TaSelectableFieldButtons.buttons.mb-2(
            v-if='!disabled',
            :localValue='localValue',
            @open='openSelector'
          )
            template(#extra)
              slot(name='display-extra')
          .tag-display
            a-tag.tag(
              v-for='(record, index) in localSelectedRecords',
              :key='record.id',
              :closable='!disabled',
              @close='removeExistedRecord(record)'
            )
              slot(name='tag-text', :record='record')
                a-popover(:mouseEnterDelay='1')
                  template(#content)
                    span {{ getTagText(record) }}
                  span {{ getTagTextEllipses(record) }}

    template(v-else-if='display === "table"')
      slot(
        name='table',
        :records='localSelectedRecordsSearched',
        :searchKeyword='searchKeyword',
        :actions='{ removeRecord: removeExistedRecord, openSelector, onTableChange, updateSearchKeyword: val => (searchKeyword = val) }'
      )
        .actions.flex-between
          TaSelectableFieldButtons(
            v-if='!disabled',
            :localValue='localValue',
            @open='openSelector'
          )
            template(#extra)
              slot(name='display-extra')
          slot(name='search-right-actions')
            a-input-search(v-model:value='searchKeyword', style='width: 200px; margin-bottom: 8px')

        TaIndexTable(
          :data='localSelectedRecordsSearched',
          :paginationConfig='{ hideOnSinglePage: true }',
          @change='onTableChange'
        )
          a-table-column(
            v-for='(column, index) in tableItems',
            :key='index',
            :title='column.name',
            :dataIndex='column.data_index.split(".")'
          )

          a-table-column(v-if='!disabled', :width='50')
            template(#default='{ record, index }')
              TaIcon(type='DeleteOutlined', @click.stop='removeExistedRecord(record)')
    template(v-else-if='display === "configurable"')
      TaSelectableFieldButtons(v-if='!disabled', :localValue='localValue', @open='openSelector')
        template(#extra)
          slot(name='display-extra')
      TaTemplateFormViewer.viewer(
        v-for='val in localSelectedRecords',
        :template='displayConfigurableForm',
        :modelValue='val',
        :key='val.id || val._id'
      )

  TaImport.hidden(
    ref='importComp',
    :store='toolStore',
    :onConfirmFunc='onImportConfirm',
    :headers='importExportHeaders'
  )

  TaNoPaddingModal(
    v-model:visible='visible',
    width='90vw',
    :z-index='9999',
    :modalContentStyle='{ "border-radius": "12px", overflow: "hidden" }',
    @cancel='handleCancel',
    :cancelBtnName='t("taComponent.Api.cancel")',
    :okBtnName='t("taComponent.Api.sure")'
  )
    template(#title)
      .py-1.text-gray-800.font-medium {{ `${t('taComponent.Api.choose')}${recordName}` }}

    template(#footer)
      .flex.justify-between
        .flex
          slot(name='modal-footer-left')
        .flex-end.h-12.mr-4
          a-button.footer-button(@click='handleCancel') {{ t('taComponent.Api.cancel') }}
          a-button.footer-button(type='primary', @click='handleOk') {{ t('taComponent.Api.sure') }}
    .modal.w-full.flex.overflow-auto
      .table-content.overflow-y-hidden.flex-grow.w-0
        TaIndexView.w-full.pl-3.pr-2.h-full(
          v-model:selectedRecords='localSelectedRecords',
          ref='taIndexView',
          :config='taIndexViewConfig',
          :tabs='tabs',
          :keepSelectionOnSwitch='true',
          paginationSize='small',
          @tabChange='onTabChange',
          @update:selectedRecords='onSelect',
          @onShow='onShow',
          @selectedAdd='onSelectedAdd',
          @selectedRemove='onSelectedRemove',
          @expand='onExpand'
        )
          //- template(v-slot:[`${tab.key}_tab`], v-for='tab in tabs')
          //-   slot(:name='`${tab.key}_tab`')
          template(#virtual_layout_tabs)
            .empty
          template(#header)
            slot(name='modal-header')
              .header
                template(v-for='tab in tabs')
                  .contact.text-sm.px-3.py-1.mx-2.rounded-4xl.cursor-pointer(
                    :class='{ "active-contact": localActiveTab?.key === tab.key }',
                    @click='() => onTabClick(tab.key)'
                  )
                    | {{ t('taComponent.Api.shelve') }}{{ tab.label }}
                slot(name='modal-header-right')
            .w-88.pl-6.pb-2
              a-input(
                allow-clear,
                v-model:value='searchKey',
                :placeholder='`${t("taComponent.Api.pleaseSearch")} ${searcherOptions.map(el => el.label).join("、")}`'
              )
                template(#prefix)
                  TaIcon(type='SearchOutlined', color='#6B7280')
          template(#actions='{ record }')
            slot(name='actions', :record='record', :selectedRecords='localSelectedRecords')

          template(#right-actions)
            slot(name='right-actions')
              .ml-1
                //- TaTextButton(size='large', icon='DownloadOutlined') 下载
              .ml-1.mr-8
                //- TaTextButton(size='large', icon='ImportOutlined', @click='onImport') 导入

          template(#card='{ record, no, index, isActive, actions }')
            slot(
              name='card',
              :record='record',
              :index='index',
              :no='no',
              :isActive='isActive',
              :actions='actions'
            )
              .flex.w-full.items-center.space-x-2
                template(v-for='(column, i) in tableItems')
                  .item.text-base.text-gray-900(
                    :class='{ "!text-sm": i > 0, "!text-gray-400": i > 0 }'
                  )
                    TableRendersAuto(
                      :value='jsonataGet(record, column.data_index)',
                      :record='record',
                      :index='i'
                    )

          template(#table)
            a-table-column(
              v-for='(column, index) in tableItems',
              :key='index',
              :title='column.name',
              :dataIndex='column.data_index.split(".")'
            )
              template(#default='{ record, index, column }')
                TableRendersAuto(
                  :value='jsonataGet(record, column.dataIndex?.join("."))',
                  :record='record',
                  :index='index'
                )

      .exist-list.flex-shrink-0
        .w-full.h-full.border-l-1.border-gray-200.pl-4.flex.flex-col
          .exist-list-header.border-b-1.border-gray-100
            span.text-gray-900.font-medium.text-base.pl-3 {{ t('taComponent.Api.selected') }}（{{ localSelectedRecords.length }}）
            TaTextButton(@click='clearUpRecord') {{ t('taComponent.Api.clear') }}
          draggable.exist-group.h-0.flex-grow.overflow-y-scroll.pb-10(
            v-model='localSelectedRecords',
            :disabled='!draggable'
          )
            //- .item.flex.align-center(v-for='(record, index) in localSelectedRecords')
            template(#item='{ element: record, index }')
              .item.flex.align-center
                slot(
                  name='selected-display',
                  :record='record',
                  :index='index',
                  :attrs='attrs',
                  :value='getValue(record, attrs[0])',
                  :ellipsisValue='ellipsis(getValue(record, attrs[0]))'
                )
                  a-popover
                    template(#content)
                      .label.cursor-default {{ getValue(record, attrs[0]) }}
                    .one-line.text-gray-900.font-regular.cursor-default {{ ellipsis(getValue(record, attrs[0])) }}
                TaIconTooltip(
                  icon='CloseOutlined',
                  :tips='t("taComponent.Api.delete")',
                  @click='removeRecord(index)',
                  size='16'
                )
</template>

<style lang="stylus" scoped>
.contact
  color $primary-color
  border 0.08rem solid $primary-color
.active-contact
  color white
  background-color $primary-color
.button
  margin-bottom 10px
.viewer
  border 1px solid rgba(0, 0, 0, 0.1)
  padding 10px 20px
  margin-bottom 10px
.tag-display
  display flex
  align-items center
  flex-wrap wrap
  .buttons
    margin-left 10px
.modal
  height 65vh
  overflow-y hidden
  .table-content
    // flex-shrink 1
    // width calc(100% - 260px)
    height 100%
    overflow hidden
    .header
      padding 10px
      margin-left 10px
      display flex
      justify-content flex
      .actions
        margin-left 30px
  >>>.ant-input
    background #F9FAFB !important
    // border 1px solid #D1D5DB;
    border-radius 8px
    padding 0 !important
  >>>.ant-input::placeholder
    color #6B7280
    font-size 14px
    font-weight 400
  >>>.ant-input-affix-wrapper
    background #F9FAFB !important
    padding 10px 16px !important
    border-radius 8px
  .exist-list
    overflow hidden
    height 100%
    padding 16px
    padding-left 0
    flex 0 0 280px
    color #888
    .exist-list-header
      display flex
      justify-content space-between
      padding 0 10px 10px 0
    .exist-group
      .item
        display flex
        justify-content space-between
        padding 10px
        line-height 24px
        border-radius 8px
      .item:hover
        background #F3F4F6
.tag-display .tag:not(.xxx)
  border-width 0
  color darken($primary-color, 20%)
  z-index 1
  position relative
  border-radius 6px
  padding 2px 8px
  font-weight 500
  font-size 12px
  &:before
    content ' '
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    opacity 0.05
    z-index -1
    background $primary-color
    border-radius 6px
  >>>.anticon
    position relative
    bottom 2px
    svg
      color darken($primary-color, 10%)
.footer-button
  margin-left 1.25rem !important
  height 2.5rem
  @apply rounded-lg px-6 py-2 text-base
</style>
