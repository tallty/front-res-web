<script lang="ts">
import { defineComponent, computed, ref, Ref, toRefs, reactive } from 'vue';
import { TaIndexViewTabInterface } from '@/components/global/ta-component/TaIndexView/types';
import { VObject } from '@/lib/vails/model';
import ComResManageDutyShow from './ComResManageDutyShow.vue';

const ComResManageDutyIndex = defineComponent({
  name: 'ComResManageDutyIndex',
  components: {
    ComResManageDutyShow,
  },
  props: {
    store: { type: Object, required: true },
    orgRecord: { type: Object, required: false, default: () => {} },
  },
  setup(props, { emit }) {
    const config = computed(() => ({
      recordName: '',
      store: props.store,
      // pagination: {
      //   perPage: 15,
      //   showPageSizeChanger: false,
      //   hideOnSinglePage: false,
      //   showSizeChanger: false,
      // }
      template: 'duty',
      detail: {
        mode: 'drawer',
        width: '1100px',
      },
      formDataEncode: (payload: VObject) => {
        return { ...payload, org_id: props.orgRecord?.id };
      },
      mode: 'table',
      // editApi:
      // showCount: true,
      actions: [
        { key: 'create', enabled: true },
        { key: 'update', enabled: true },
        { key: 'delete', enabled: true },
        { key: 'import', enabled: true },
        { key: 'export', enabled: true },
      ],
      table: {
        scroll: { y: 'auto' },
        columns: [
          { dataIndex: 'name', title: '名称' },
          { dataIndex: 'userCount', title: '人数' },
          { dataIndex: 'userNames', title: '姓名' },
        ],
      },
      searcherSimpleOptions: [{ key: 'name', label: '名称', type: 'string' }],
    }));

    return {
      ...toRefs(props),
      config,
    };
  },
});

export default ComResManageDutyIndex;
</script>

<template lang="pug">
.com-res-manage-duty-index
  TaIndexView(:config='config')
    //- template(#card='{ record }')
    //- template(#table)
    //-    a-table-column(:autoHeight='true' title='名称' dataIndex='record')
    //- template(#detail='{ record, onClose }')
    //-   ComResManageDutyShow(
    //-     v-if='record.id'
    //-     :store='store'
    //-     :extendRoute='`/res/manage/duties/${record.id}`'
    //-     :editable='editable'
    //-     @afterDelete='onClose'
    //-     @afterExtend='onClose'
    //-   )

</template>

<style lang="stylus" scoped>
.com-res-manage-duty-index
  height 100%
  width 100%
</style>
