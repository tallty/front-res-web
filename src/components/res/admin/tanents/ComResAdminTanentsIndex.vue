<script lang="ts">
import { VStore } from '@/lib/vails';
import { computed, defineComponent } from 'vue';
import { ResAdminTanentApi } from '@/res-core/apis/res/admin/tanents.api';
import { ResTanentModel } from '@/res-core/models/res/tanent';

const ComResAdminTanentsIndex = defineComponent({
  name: 'ComResAdminTanentsIndex',
  setup() {
    const store = new VStore(new ResAdminTanentApi(), ResTanentModel);

    const config = computed(() => ({
      recordName: '租户管理',
      store,
      template: 'tanent',
      mode: 'table',
      // editApi:
      // showCount: true,
      actions: [
        { key: 'create', enabled: true },
        { key: 'update', enabled: true },
        { key: 'delete', enabled: true },
        { key: 'import', enabled: false },
        { key: 'export', enabled: false },
      ],
      // table: {
      //   scroll: { y: 'auto' },
      //   columns: [
      //     { dataIndex: 'id', title: 'ID' },
      //     { dataIndex: 'code', title: 'CODE' },
      //     { dataIndex: 'name', title: '名称' },
      //   ],
      // },
      searcherSimpleOptions: [{ key: 'name', label: '名称', type: 'string' }],
    }));

    return {
      store,
      config,
    };
  },
});

export default ComResAdminTanentsIndex;
</script>

<template lang="pug">
.com-res-admin-tanents-index.w-full.h-full
  TaIndexView(:config='config')
</template>
