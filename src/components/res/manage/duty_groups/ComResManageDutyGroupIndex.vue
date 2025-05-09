<script lang="ts">
import { defineComponent, computed, ref, Ref, toRefs, reactive } from 'vue';
import { TaIndexViewTabInterface } from '@/components/global/ta-component/TaIndexView/types';
import { VObject } from '@/lib/vails/model';
import ComResManageDutyGroupShow from './ComResManageDutyGroupShow.vue';

const ComResManageDutyGroupIndex = defineComponent({
  name: 'ComResManageDutyGroupIndex',
  components: {
    ComResManageDutyGroupShow,
  },
  props: {
    store: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const config = computed(() => ({
      recordName: 'recordName',
      store: props.store,
      // pagination: {
      //   perPage: 15,
      //   showPageSizeChanger: false,
      //   hideOnSinglePage: false,
      //   showSizeChanger: false,
      // }
      // template: 'res_duty_group',
      // detail: {
      //   mode: 'auto',
      //   mode: 'drawer',
      //   width: '1100px',
      // },
      // mode: 'table',
      // editApi:
      // showCount: true,
      // actions: [
      //  { key: 'create', enabled: true },
      //  { key: 'update', enabled: true },
      //  { key: 'delete', enabled: true },
      //  { key: 'import', enabled: true },
      //  { key: 'export', enabled: true },
      // ],
      table: {
        scroll: { y: 'auto' },
        // columns: [{ dataIndex: 'id', title: 'ID' }],
      },
      list: {
        scroll: { y: 'auto' },
      },
      // selection: {
      //   showByDefault: false;
      //   showSwitch: false;
      // };
      // searcherSimpleOptions: [{key: 'title', label: '标题', type: 'string' }],
    }));

    const statistics = ref({
      key1: 0,
      key2: 0,
    });

    const tabs = computed<TaIndexViewTabInterface[]>(() => [
      {
        key: 'key1',
        label: '标签1',
        num: statistics.value.key1,
        query: {},
      },
      {
        key: 'key2',
        label: '标签2',
        num: statistics.value.key2,
        query: {},
      },
    ]);

    const onIndex = (data: VObject) => {
      statistics.value = data.statistics;
    };

    return {
      ...toRefs(props),
      config,
      tabs,
      onIndex,
    };
  },
});

export default ComResManageDutyGroupIndex;
</script>

<template lang="pug">
.com-res-manage-duty-group-index
  TaIndexView(:config='config' :tabs='tabs' @onIndex='onIndex')
    //- template(#card='{ record }')
    //- template(#table)
    //-    a-table-column(:autoHeight='true' title='名称' dataIndex='record')
    //- template(#detail='{ record, onClose }')
    //-   ComResManageDutyGroupShow(
    //-     v-if='record.id'
    //-     :store='store'
    //-     :extendRoute='`/res/manage/duty_groups/${record.id}`'
    //-     :editable='editable'
    //-     @afterDelete='onClose'
    //-     @afterExtend='onClose'
    //-   )

</template>

<style lang="stylus" scoped>
.com-res-manage-duty-group-index
  height 100%
  width 100%
</style>
