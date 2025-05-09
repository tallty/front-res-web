<script lang="ts">
import { defineComponent, computed, ref, Ref, toRefs, reactive } from 'vue';
import { TaIndexViewTabInterface } from '@/components/global/ta-component/TaIndexView/types';
import { VObject } from '@/lib/vails/model';
import ComResBooksShow from './ComResBooksShow.vue';
import store from '@/store';
import { hasPermission } from '@/components/global/ta-component/TaIndexView/ta-index-view-core/usePermission';
import { ResBookTemplate } from './template';

const ComResBooksIndex = defineComponent({
  name: 'ComResBooksIndex',
  components: {
    ComResBooksShow,
  },
  props: {
    store: { type: Object, required: true },
    adminStore: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const config = computed(() => ({
      recordName: '通讯录',
      store: props.store,
      // pagination: {
      //   perPage: 15,
      //   showPageSizeChanger: false,
      //   hideOnSinglePage: false,
      //   showSizeChanger: false,
      // }
      template: ResBookTemplate,
      detail: {
        mode: 'auto',
        // mode: 'drawer',
        // width: '1100px',
      },
      mode: 'table',
      // editApi:
      // showCount: true,
      // actions: [
      //  { key: 'create', enabled: true },
      //  { key: 'update', enabled: true },
      //  { key: 'delete', enabled: true },
      //  { key: 'import', enabled: true },
      //  { key: 'export', enabled: true },
      // ],
      // table: {
      //   scroll: { y: '70vh' },
      //   // columns: [{ dataIndex: 'id', title: 'ID' }],
      // },
      // selection: {
      //   showByDefault: false;
      //   showSwitch: false;
      // };
      searcherSimpleOptions: [{ key: 'name', label: '标题', type: 'string' }],
    }));

    const tabs = computed(() => {
      const result: VObject[] = [
        {
          key: 'personal',
          label: '私人',
          store: props.store,
          query: {
            user_id_not_null: true,
          },
        },
      ];

      const roles = store.state.user.currentUser?.roles_name || [];

      if (hasPermission(roles, ['res_admin'], 'some')) {
        result.unshift({
          key: 'opened',
          label: '公开',
          store: props.adminStore,
          query: {
            user_id_null: true,
          },
        });
      }
      return result;
    });

    // const onIndex = (data: VObject) => {
    //   statistics.value = data.statistics;
    // };

    return {
      ...toRefs(props),
      config,
      tabs,
      // onIndex,
    };
  },
});

export default ComResBooksIndex;
</script>

<template lang="pug">
.com-res-admin-books-index
  TaIndexView(:config='config' :tabs='tabs')
    //- template(#card='{ record }')
    //- template(#table)
    //-    a-table-column(:autoHeight='true' title='名称' dataIndex='record')
    //- template(#detail='{ record, onClose }')
    //-   ComResBooksShow(
    //-     v-if='record.id'
    //-     :store='store'
    //-     :extendRoute='`/res/admin/books/${record.id}`'
    //-     :editable='editable'
    //-     @afterDelete='onClose'
    //-     @afterExtend='onClose'
    //-   )

</template>

<style lang="stylus" scoped>
.com-res-admin-books-index
  height 100%
  width 100%
</style>
