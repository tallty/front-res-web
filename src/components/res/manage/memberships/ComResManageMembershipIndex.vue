<script lang="ts">
import { defineComponent, computed, ref, Ref, toRefs, reactive } from 'vue';
import { TaIndexViewTabInterface } from '@/components/global/ta-component/TaIndexView/types';
import { VObject } from '@/lib/vails/model';
import ComResManageMembershipShow from './ComResManageMembershipShow.vue';

const ComResManageMembershipIndex = defineComponent({
  name: 'ComResManageMembershipIndex',
  components: {
    ComResManageMembershipShow,
  },
  props: {
    store: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const config = computed(() => ({
      recordName: '人员',
      store: props.store,
      // pagination: {
      //   perPage: 15,
      //   showPageSizeChanger: false,
      //   hideOnSinglePage: false,
      //   showSizeChanger: false,
      // }
      template: 'membership',
      detail: {
        mode: 'drawer',
        width: '1100px',
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
          { dataIndex: 'name', title: '姓名' },
          { dataIndex: 'account', title: '账号' },
          { dataIndex: '', title: '角色' },
          { dataIndex: '', title: '岗位数' },
          { dataIndex: '', title: '岗位' },
        ],
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

    return {
      ...toRefs(props),
      config,
    };
  },
});

export default ComResManageMembershipIndex;
</script>

<template lang="pug">
.com-res-manage-membership-index
  TaIndexView(:config='config')
    //- template(#card='{ record }')
    //- template(#table)
    //-    a-table-column(:autoHeight='true' title='名称' dataIndex='record')
    //- template(#detail='{ record, onClose }')
    //-   ComResManageMembershipShow(
    //-     v-if='record.id'
    //-     :store='store'
    //-     :extendRoute='`/res/manage/memberships/${record.id}`'
    //-     :editable='editable'
    //-     @afterDelete='onClose'
    //-     @afterExtend='onClose'
    //-   )

</template>

<style lang="stylus" scoped>
.com-res-manage-membership-index
  height 100%
  width 100%
</style>
