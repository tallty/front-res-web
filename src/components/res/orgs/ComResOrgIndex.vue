<script lang="ts">
import { defineComponent, computed, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import { VObject } from '@/lib/vails';

const ComResOrgIndex = defineComponent({
  name: 'ComResOrgIndex',
  components: {},
  props: {
    store: { type: Object, required: true },
    parentRecord: { type: Object, required: false, default: () => ({}) },
  },
  setup(props) {
    const route = useRoute();

    const detailUrl = () => {
      const res = route.path.match(/\/res\/.+\/orgs/);
      return res ? res[0] : '/res/manage/orgs';
    };

    const config = computed(() => ({
      recordName: '组织',
      store: props.store,
      template: 'org',
      detail: {
        mode: 'route',
        url: detailUrl(),
      },
      mode: 'table',
      formDataEncode: (payload: VObject) => {
        return { parent_id: props.parentRecord?.id, ...payload };
      },
      actions: [
        { key: 'create', enabled: route.meta?.role === 'admin' },
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

export default ComResOrgIndex;
</script>

<template lang="pug">
.com-res-org-index
  TaIndexView(:config='config')
</template>

<style lang="stylus" scoped>
.com-res-org-index
  height 100%
  width 100%
  >>>.table-header__title
    display none
</style>
