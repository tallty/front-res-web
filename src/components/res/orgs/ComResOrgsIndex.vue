<script lang="ts">
import { defineComponent, computed, toRefs } from 'vue';
import { orgTemplate } from '../admin/orgs/template';

const ComResOrgsIndex = defineComponent({
  name: 'ComResOrgsIndex',
  components: {},
  props: {
    store: { type: Object, required: true },
  },
  setup(props) {
    const config = computed(() => ({
      recordName: '组织',
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

export default ComResOrgsIndex;
</script>

<template lang="pug">
.com-res-user-orgs-index
  TaIndexView(:config='config')
</template>

<style lang="stylus" scoped></style>
