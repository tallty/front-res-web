<script lang="ts">
import { VObject } from '@/lib/vails';
import { computed, defineComponent, toRefs } from 'vue';

const ComResMembershipIndex = defineComponent({
  name: 'ComResMembershipIndex',
  components: {},
  props: {
    store: { type: Object, required: true },
    initFormData: { type: Object, required: false, default: () => ({}) },
    recordName: { type: String, required: false, default: '' },
  },
  setup(props, { emit }) {
    const config = computed(() => ({
      recordName: props.recordName,
      store: props.store,
      template: 'membership',
      formDataEncode: (payload: VObject) => {
        return { ...props.initFormData, ...payload };
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
          { dataIndex: 'user.name', title: '姓名' },
          { dataIndex: 'org.name', title: '组织' },
          { dataIndex: 'department.name', title: '部门' },
          { dataIndex: 'duty.name', title: '岗位' },
          { dataIndex: 'member.member_identity_name', title: '身份' },
          { dataIndex: 'effective_at', title: '生效时间' },
          { dataIndex: 'invalid_at', title: '失效时间' },
        ],
      },
      searcherSimpleOptions: [{ key: 'name', label: '名称', type: 'string' }],
    }));
    return {
      ...toRefs(props),
      config,
    };
  },
});

export default ComResMembershipIndex;
</script>

<template lang="pug">
TaIndexView(:config='config', v-bind='$attrs')
</template>
