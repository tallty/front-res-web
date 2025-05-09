<script lang="ts">
import { defineComponent, computed, toRefs } from 'vue';
import ComBpmInstanceDetailDialog from '@/engines/bpm/components/ComBpmInstanceDetailDialog.vue';

const ComResManageOrgIndex = defineComponent({
  name: 'ComResManageOrgIndex',
  components: {
    ComBpmInstanceDetailDialog,
  },
  props: {
    store: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const config = computed(() => ({
      recordName: '',
      store: props.store,
      template: 'org',
      detail: {
        mode: 'route',
        // url: `/res/manage/orgs`,
      },
      mode: 'table',
      actions: [
        { key: 'create', enabled: false },
        { key: 'update', enabled: true },
        { key: 'delete', enabled: false },
        { key: 'import', enabled: false },
        { key: 'export', enabled: false },
      ],
      table: {
        scroll: { y: 'auto' },
        columns: [
          { dataIndex: 'name', title: '名称' },
          { dataIndex: 'short_name', title: '简称' },
          { dataIndex: 'type', title: '类型' },
          { dataIndex: 'code', title: '标识' },
          { dataIndex: 'ancestryPath', title: '路径' },
          { dataIndex: 'children_count', title: '子组织数' },
          { dataIndex: 'operation', title: '' },
        ],
      },
      searcherSimpleOptions: [
        { key: 'name', label: '名称', type: 'string' },
        { key: 'short_name', label: '简称', type: 'string' },
        { key: 'code', label: '标识', type: 'string' },
      ],
    }));

    return {
      ...toRefs(props),
      config,
    };
  },
});

export default ComResManageOrgIndex;
</script>

<template lang="pug">
.com-res-manage-org-index
  TaIndexView(:config='config')
    template(#bodyCell='{ text, record, index, column }')
      a-button(
        @click.stop="viewInstance(record)"
        type="primary"
        v-if='column.dataIndex == "operation" && record.create_instance_id') 查看工作流
  ComBpmInstanceDetailDialog(v-model:visible='visibleInstance', :instanceId='instanceId')
</template>

<style lang="stylus" scoped>
.com-res-manage-org-index
  height 100%
  width 100%
</style>
