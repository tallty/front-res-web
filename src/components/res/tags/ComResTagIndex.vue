<script lang="ts">
import { defineComponent, computed, toRefs } from 'vue'

const ComResTagIndex = defineComponent({
  name: 'ComResTagIndex',
  props: {
    store: { type: Object, required: true },
  },
  setup(props) {
    const config = computed(() => ({
      recordName: '',
      store: props.store,
      template: 'res_tag',
      detail: {
        mode: 'drawer',
      },
      mode: 'table',
      actions: [
        { key: 'create', enabled: true },
        { key: 'update', enabled: true },
        { key: 'delete', enabled: true },
        { key: 'import', enabled: false },
        { key: 'export', enabled: false },
      ],
      table: {
        scroll: { y: 'auto' },
        columns: [
          { dataIndex: 'name', title: '名称' },
          { dataIndex: 'userCount', title: '人数' },
          { dataIndex: 'userNames', title: '成员姓名' },
        ],
      },
      searcherSimpleOptions: [
        { key: 'name', label: '名称', type: 'string' },
      ],
    }));

    return {
      ...toRefs(props),
      config,
    }
  },
});

export default ComResTagIndex;
</script>

<template lang="pug">
.com-res-tag-index
  TaIndexView(:config='config')
</template>

<style lang="stylus" scoped>
.com-res-tag-index
  height 100%
  width 100%
</style>
