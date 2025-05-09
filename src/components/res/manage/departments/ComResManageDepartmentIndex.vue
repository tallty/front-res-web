<script lang="ts">
import { defineComponent, computed, ref, Ref, toRefs, reactive } from 'vue';
import { TaIndexViewTabInterface } from '@/components/global/ta-component/TaIndexView/types';
import { VObject } from '@/lib/vails/model';
import ComResManageDepartmentShow from './ComResManageDepartmentShow.vue'

const ComResManageDepartmentIndex = defineComponent({
  name: 'ComResManageDepartmentIndex',
  components: {
    ComResManageDepartmentShow,
  },
  props: {
    store: { type: Object, required: true },
    orgRecord: { type: Object, required: false, default: () => {} },
  },
  setup(props, { emit }) {
    const config = computed(() => ({
      recordName: '',
      store: props.store,
      template: 'department',
      detail: {
        mode: 'drawer',
        width: '1100px',
      },
      formDataEncode: (payload: VObject) => {
        return { ...payload, org_id: props.orgRecord?.id };
      },
      mode: 'table',
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
          { dataIndex: 'childrenNames', title: '下级部门' },
        ],
      },
      searcherSimpleOptions: [{key: 'name', label: '名称', type: 'string' }],
    }));

    return {
      ...toRefs(props),
      config,

    };
  },
});

export default ComResManageDepartmentIndex;
</script>

<template lang="pug">
.com-res-manage-department-index
  TaIndexView(:config='config')
</template>

<style lang="stylus" scoped>
.com-res-manage-department-index
  height 100%
  width 100%
</style>
