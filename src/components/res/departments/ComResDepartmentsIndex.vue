<script lang="ts">
import { defineComponent, computed, toRefs } from 'vue';
import { orgTemplate } from '../admin/orgs/template';

const ComResDepartmentsIndex = defineComponent({
  name: 'ComResDepartmentsIndex',
  components: {},
  props: {
    store: { type: Object, required: true },
  },
  setup(props) {
    const config = computed(() => ({
      recordName: '部门',
      store: props.store,
      // pagination: {
      //   perPage: 15,
      //   showPageSizeChanger: false,
      //   hideOnSinglePage: false,
      //   showSizeChanger: false,
      // }
      template: orgTemplate,
      detail: {
        mode: 'route',
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
      table: {
        scroll: { y: '70vh' },
        // columns: [{ dataIndex: 'id', title: 'ID' }],
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

export default ComResDepartmentsIndex;
</script>

<template lang="pug">
.com-res-user-departments-index
  TaIndexView(:config='config')
</template>

<style lang="stylus" scoped>
.com-res-user-departments-index
  height 100%
  width 100%
</style>
