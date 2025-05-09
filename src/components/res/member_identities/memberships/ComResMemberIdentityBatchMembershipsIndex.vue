<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import ComResMembershipIndex from '../../memberships/ComResMembershipIndex.vue';
import ComResMembershipCreator from '../../memberships/ComResMembershipCreator.vue';
import { useRoute } from 'vue-router';
import useNavigateTab from '../../../../../../components/global/ta-component/useNavigateTab';

const ComResMemberIdentityBatchMembershipsIndex = defineComponent({
  name: 'ComResMemberIdentityBatchMembershipsIndex',
  components: { ComResMembershipIndex, ComResMembershipCreator },
  props: {
    recordName: { type: String, default: '身份' },
    store: { type: Object, default: () => ({}) },
    memberIdentityStore: { type: Object, default: () => ({}) },
    template: { type: String, default: 'membership#member_identity_batch' },
    searchTemplate: { type: String, default: 'membership#member_identity_batch_search' },
    createtemplate: { type: String, default: 'membership#member_identity_batch_batch' },
  },
  setup(props) {
    const route = useRoute();

    const { updateTitle } = useNavigateTab();
    if (props.recordName) {
      updateTitle(props.recordName, route.fullPath);
    }

    const config = computed(() => ({
      recordName: props.recordName,
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

    props.memberIdentityStore.index({ per_page: 999999 });

    const tags = [
      {
        key: 'effective',
        label: '已起效',
        query: {
          scopes: ['effective'],
        },
      },
      {
        key: 'all',
        label: '全部',
        query: {},
      },
    ];

    const tabs = computed(() => [
      {
        key: 'all',
        label: '全部',
        params: {},
        tags,
      },
      ...props.memberIdentityStore.records.value.map((record: any) => ({
        key: record.id,
        label: record.name,
        query: {
          member_member_identity_id_eq: record.id,
        },
        tags,
      })),
    ]);

    return {
      ...toRefs(props),
      config,
      tabs,
    };
  },
});
export default ComResMemberIdentityBatchMembershipsIndex;
</script>

<template lang="pug">
TaIndexView.com-res-member-identities-batch-memberships-index(:config='config', :tabs='tabs')
  template(#right-actions='{ actions }')
    ComResMembershipCreator(
      :store='store',
      :searchTemplate='searchTemplate',
      :template='createtemplate',
      @fresh='actions.silenceRefresh'
    )
  template(#bodyCell='{ column, text, record }')
    slot(name='bodyCell', v-bind='{ column, text, record }')

</template>
<style lang="stylus" scoped></style>
