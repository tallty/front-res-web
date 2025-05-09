<script lang="ts">
import { defineComponent, computed, toRefs } from 'vue';
import { VObject } from '@/lib/vails';

const ComResTagsRelationIndex = defineComponent({
  name: 'ComResTagsRelationIndex',
  props: {
    store: { type: Object, required: true },
    recordName: { type: String, required: false, default: '' },
    initFormData: { type: Object, required: false, default: () => ({}) },
  },
  setup(props) {
    const config = computed(() => ({
      recordName: props.recordName,
      store: props.store,
      template: 'res_tags_relation',
      formDataEncode: (payload: VObject) => {
        return { ...props.initFormData, ...payload, };
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
          { dataIndex: 'tag.name', title: '标签名称' },
          { dataIndex: 'user.name', title: '成员姓名' },
          { dataIndex: 'org.name', title: '组织名称' },
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

export default ComResTagsRelationIndex;
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
