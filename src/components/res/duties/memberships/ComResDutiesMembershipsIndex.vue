<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';
import ComResMembershipIndex from '../../memberships/ComResMembershipIndex.vue';
import { VObject } from '../../../../../../lib/vails/model/index';
import ComResMembershipCreator from '../../memberships/ComResMembershipCreator.vue';

const ComResDutiesMembershipsIndex = defineComponent({
  name: 'ComResDutiesMembershipsIndex',
  components: { ComResMembershipIndex, ComResMembershipCreator },
  props: {
    duty: { type: Object, default: () => ({}) },
    store: { type: Object, default: () => ({}) },
    template: { type: String, default: 'membership#duty' },
    searchTemplate: { type: String, default: 'membership#duty_search' },
    createTemplate: { type: String, default: 'membership#duty_batch' },
  },
  setup(props) {
    const config = computed(() => ({
      recordName: `${props.duty.name}管理`,
      store: props.store,
      template: props.template,
      // formDataEncode: (payload: VObject) => {
      //   return { duty_id: props.duty.id, ...payload };
      // },
      mode: 'table',
      // actions: [
      //   { key: 'create', enabled: false },
      //   { key: 'update', enabled: true },
      //   { key: 'delete', enabled: true },
      //   { key: 'import', enabled: false },
      //   { key: 'export', enabled: false },
      // ],
      table: {
        scroll: { y: 'auto' },
      },
      searcherSimpleOptions: [
        { key: 'user_name', label: '用户名', type: 'string' },
        { key: 'user_mobile', label: '手机号', type: 'string' },
        {
          key: 'org_name',
          label: '组织名称',
          type: 'string',
        },
        {
          key: 'user_account',
          label: '账号',
          type: 'string',
        },
      ],
    }));

    const tabs = [
      {
        key: 'effective',
        label: '已起效',
      },
      {
        key: 'all',
        label: '全部',
        params: {
          with_invalid: true,
        },
      },
    ];

    return {
      ...toRefs(props),
      config,
      tabs,
    };
  },
});
export default ComResDutiesMembershipsIndex;
</script>

<template lang="pug">
TaIndexView.com-res-duty-memberships-index(:config='config', :tabs='tabs')
  template(#right-actions='{ actions }')
    ComResMembershipCreator(
      :store='store',
      :initFormData='{ duty_id: duty.id }',
      :searchTemplate='searchTemplate',
      :template='createTemplate',
      @fresh='actions.silenceRefresh'
    )
</template>

<style lang="stylus" scoped></style>
