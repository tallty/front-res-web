<script lang="ts">
import { ref, defineComponent, toRefs, onUpdated } from 'vue';
import { taIndexTableProps } from './TaIndexTable.vue';
import { onMounted } from '@vue/runtime-core';
import { VObject } from '@/lib/vails';
import elementDetectorGenerator from 'element-resize-detector';

const TaIndexSeamlessScrollTable = defineComponent({
  name: 'TaIndexSeamlessScrollTable',
  components: {},
  props: { ...taIndexTableProps, step: { type: Number, default: 0.6 } },
  setup(props, { emit }) {
    const container = ref<any>(null);
    const hContainer = ref<any>(null);
    const offsetTop = ref(0);

    const syncOffsetTop = () => {
      if (container.value) {
        hContainer.value = container.value.querySelector('.ant-table-thead');
        offsetTop.value = hContainer.value?.clientHeight || 0;
      }
    };

    onMounted(syncOffsetTop);
    onMounted(() => {
      const elementDetector = elementDetectorGenerator({});
      elementDetector.listenTo(hContainer.value, syncOffsetTop);
    });

    const bodyTable = ref<any>(null);

    const onExpand = (expanded: boolean, record: VObject) => {
      emit('expand', expanded, record);
    };

    const onRowClick = (...args: any) => {
      emit('rowClick', ...args);
    };

    const onChange = (...args: any) => {
      emit('change', ...args);
    };

    const onDraggle = (...args: any) => {
      emit('draggle', ...args);
    };

    const onTableChange = (...args: any) => {
      emit('tableChange', ...args);
    };

    return {
      ...toRefs(props),
      container,
      offsetTop,
      onExpand,
      onRowClick,
      onChange,
      onDraggle,
      onTableChange,
      bodyTable,
    };
  },
});
export default TaIndexSeamlessScrollTable;
</script>

<template lang="pug">
.ta-index-seamless-scroll-table.h-full.relative.overflow-hidden(
  ref='container',
  :class='{ [skin]: true }'
)
  TaIndexTable.header-table.pointer-events-none(
    v-bind='$props',
    @rowClick='onRowClick',
    @change='onChange',
    @draggle='onDraggle',
    @tableChange='onTableChange',
    @expand='onExpand'
  )
    slot
    template(#bodyCell='{ text, record, index, column }')
      slot(name='bodyCell', :text='text', :record='record', :index='index', :column='column')

  .body-container.absolute.w-full(:style='{ top: `${offsetTop}px` }')
    TaSeamlessScroll.w-full.overflow-hidden(:step='step')
      TaIndexTable.body-table(
        ref='bodyTable',
        v-bind='{ ...$props, config: { ...$props.config, showHeader: false, scroll: {} } }',
        @rowClick='onRowClick',
        @change='onChange',
        @draggle='onDraggle',
        @tableChange='onTableChange',
        @expand='onExpand'
      )
        slot
        template(#bodyCell='{ text, record, index, column }')
          slot(name='bodyCell', :text='text', :record='record', :index='index', :column='column')
    //- a-pagination(v-bind='bodyTable.pagination')
</template>

<style lang="stylus" scoped>
.ta-index-seamless-scroll-table
  .body-container
    height calc(100% - 100px)
  .header-table
    >>> tbody
      opacity 0
    >>> .ant-spin-spinning
      display none
  .body-table
    >>> .ant-table-body
      overflow none !important
      height fit-content
      max-height none !important
    >>> .table-header-cell
      height 0
      overflow hidden
      padding 0 !important
    >>> th
      padding 0 !important
    >>> .ant-pagination
      display none
@import './seamless-table.styl'
</style>
