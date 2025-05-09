<script lang="ts">
import {
  ref,
  defineComponent,
  toRefs,
  PropType,
  Ref,
  computed,
  watch,
  onMounted,
  nextTick,
} from 'vue';
import { VObject } from '@/lib/vails/model';
import { VStore } from '@/lib/vails';
import { TaIndexViewConfigInterface } from '../../TaIndexView/types';
import { get } from 'lodash';

const TaStoreField = defineComponent({
  name: 'TaStoreField',
  components: {},
  props: {
    value: { type: Array as PropType<number[]>, required: true },
    recordName: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    store: { type: Object as PropType<VStore>, required: true },
    config: { type: Object, default: () => ({}) },
    tabs: { type: Array, default: () => [] },
  },
  setup(props, { emit }) {
    const selectedRecordsRaw: Ref<VObject[]> = ref([]);
    const visible = ref(false);
    const oldValue: Ref<number[]> = ref([]);
    const taIndexView = ref(null);

    const selectedRecordIds = computed(() => selectedRecords.value.map(i => i.id));

    const selectedRecords = computed({
      get: () => selectedRecordsRaw.value,
      set: val => {
        selectedRecordsRaw.value = val;
        emit('selectedRecordsChange', val);
      },
    });

    const taIndexViewConfig = computed(() => ({
      store: props.store,
      recordName: props.recordName,
      selection: { showByDefault: true },
      mode: 'table',
      searcherSimpleOptions: searcherOptions.value,
      // searcherComplicatedOptions: searcherOptions.value,
      table: {
        scroll: { y: '60vh' },
      },
    }));

    const searcherOptions = computed(() => {
      return (props.config.tableColumns || [])
        .filter((column: VObject) => column.search)
        .map(
          (column: VObject) =>
            ({
              label: column.title,
              key: column.searchKey || column.dataIndex,
              type: column.type || 'string',
            } || []),
        );
    });

    const tagKey = computed(() => props.config.tagKey || 'name');

    const fetchExistRecords = async (ids: (string | number)[]) => {
      if (
        JSON.stringify(ids.sort()) === JSON.stringify(selectedRecords.value.map(i => i.id).sort())
      )
        return;
      if (ids.length === 0) {
        selectedRecords.value = [];
      } else {
        const { data } = await props.store.api.index({ per_page: ids.length, q: { id_in: ids } });
        selectedRecords.value = data[props.store.api.dataIndexKey];
      }
    };

    const onValueChange = () => {
      if (JSON.stringify(props.value) === JSON.stringify(oldValue.value)) {
        return;
      }
      if (props.value) {
        const ids = props.value.filter(i => i);
        fetchExistRecords(ids);
        oldValue.value = ids;
      }
    };

    watch(() => props.value, onValueChange, { immediate: true });

    onMounted(() => {
      props.store.reset();
      onValueChange();
    });

    const removeRecord = (index: number) => {
      if (props.disabled) {
        return;
      }
      selectedRecords.value.splice(index, 1);
      syncValue();
    };

    const syncValue = () => {
      // 单选多选都返回数组
      emit('update:value', selectedRecordIds.value);
    };

    const openSelector = () => {
      visible.value = true;
      props.store.reset();
      nextTick(() => {
        (taIndexView.value as any).fetchData();
      });
      emit('open');
    };

    const handleOk = () => {
      visible.value = false;
      syncValue();
      emit('ok', selectedRecords.value);
    };

    const handleCancel = () => {
      visible.value = false;
      onValueChange();
      emit('cancel');
    };

    const onSelect = (newValue: VObject[], oldValue: VObject[]) => {
      // 单选
      if (!props.multiple) {
        selectedRecords.value = newValue.filter(item => !oldValue.includes(item));
      }
      emit('onSelect', newValue, oldValue);
    };

    const clearUpRecord = () => {
      selectedRecords.value = [];
      syncValue();
    };

    const onTabChange = (activeTab: TaIndexViewConfigInterface) => {
      emit('tabChange', activeTab);
    };

    const getValue = (obj: VObject, key: string) => {
      return get(obj, key);
    };

    const ellipsis = (value: string) => {
      if (!value) return '';
      if (value.length > 8) {
        return value.slice(0, 8) + '...';
      }
      return value;
    };

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
      tagKey,
      visible,
      selectedRecords,
    };
  },
});
export default TaStoreField;
</script>

<template lang="pug">
.store-field
  slot(name='tags' :records='selectedRecords')
    a-tag.tag(
      v-for="(record, index) in selectedRecords"
      color="blue"
      :key="record.id"
      :closable="!disabled"
      @close="removeRecord(index)"
    )
      slot(name='tag-text', :record='record')
        a-popover(:mouseEnterDelay="1")
          template(slot="content")
            span {{ getValue(record, tagKey) }}
          span {{ ellipsis(getValue(record, tagKey)) }}

  a-button(
    v-if="!disabled"
    :disabled="disabled"
    @click="openSelector"
  )
    | {{ selectedRecords.length > 0 ? '修改' : '选择' }}
  a-modal(
    v-model:visible='visible',
    :title='`选择${recordName}`',
    width='90vw',
    height='50%'
    @ok='handleOk',
    @cancel='handleCancel',
  )
    .modal
      .table
        TaIndexView.ta-index-view(
          v-model:selectedRecords='selectedRecords',
          ref='taIndexView',
          :config='taIndexViewConfig',
          :tabs='tabs',
          @tabChange='onTabChange'
          @update:selectedRecords='onSelect'
        )
          template(v-slot:[`${tab.key}_tab`], v-for='tab in tabs')
            slot(:name='`${tab.key}_tab`')
          template(#header, v-if='!tabs')
            slot(name='modal-header')
              .header 选择
          template(#actions='{ record, selectedRecords }')
            slot(name='actions', :record='record', :selectedRecords='selectedRecords')
          template(#table)
            a-table-column(
              v-for='(column, index) in (config.tableColumns || [])',
              :key='index',
              :title='column.title',
              :customRender='column.customRender'
              :dataIndex='column.dataIndex'
            )
      .exist-list
        .exist-list-header
          span 已选（{{ selectedRecords.length }}）
          IconTooltip(icon='delete', tips='清空', @click='clearUpRecord')
        .exist-group
          .item(v-for="(record, index) in selectedRecords")
            a-popover
              template(#content)
                .label {{ getValue(record, tagKey) }}
              .one-line.label {{ ellipsis(getValue(record, tagKey)) }}
            IconTooltip(icon='close-circle', tips='删除', @click='removeRecord(index)')
</template>

<style lang="stylus" scoped>
.ta-index-view
  padding 0 10px
.modal
  height 75vh
  display flex
  .table
    border 1px solid #e8e8e8
    .header
      margin-left 10px
  .exist-list
    overflow hidden
    height 100%
    padding 10px
    border 1px solid #e8e8e8
    flex 0 0 240px
    margin-left 20px
    color #888
    .exist-list-header
      display flex
      justify-content space-between
      margin 0 10px 10px 0
    .exist-group
      height 100%
      overflow-y scroll
      padding-bottom 50px
      .item
        display flex
        justify-content space-between
        margin-bottom 4px
        padding 10px 10px 10px 0
        line-height 24px
</style>
