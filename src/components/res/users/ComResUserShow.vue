<script lang="ts">
import { defineComponent, toRefs, computed, ref, watch } from 'vue';
import ComResUserHeaderContent from './ComResUserHeaderContent.vue';
import ComResUserBasicInfo from './ComResUserBasicInfo.vue';
import ComResUserPermission from './ComResUserPermission.vue';
import { hasPermission } from '@/components/global/ta-component/TaIndexView/ta-index-view-core/usePermission';
import { AuthSessionApi } from '@/engines/login/apis/auth/session.api';
import ComResUserMemberInfo from './ComResUserMemberInfo.vue';

const ComResUserShow = defineComponent({
  name: 'ComResUserShow',
  components: {
    ComResUserHeaderContent,
    ComResUserBasicInfo,
    ComResUserPermission,
    ComResUserMemberInfo,
  },
  props: {
    store: { type: Object, required: true },
    record: { type: Object, required: true },
    membershipStore: { type: Object, required: true },
    tagRelationStore: { type: Object, required: true },
    memberStore: { type: Object, required: true },
    org: { type: Object, required: false, default: () => ({}) },
  },
  setup(props) {
    const hasManagePermission = computed(() => {
      return hasPermission(AuthSessionApi.currentUser().roles_name, ['permit_admin'], 'some');
    });

    const tabs = computed(() => {
      const _tabs = [
        {
          key: 'basic-info',
          label: '基本信息',
        },
      ];

      if (hasManagePermission.value) {
        _tabs.push({
          key: 'permissions',
          label: '权限',
        });
      }

      members.value.forEach((member: any) => {
        _tabs.push({
          key: `member-${member.id}`,
          label: member.member_identity_name,
        });
      });

      return _tabs;
    });

    const members = ref([]);

    watch(
      () => props.record,
      () => {
        members.value = props.record.members
          ?.filter((member: any) => member.form && Object.keys(member.form).length > 0)
          .filter((member: any) =>
            member.memberships_with_invalid
              .map((membership: any) => membership.org_id)
              .includes(props.org?.id),
          )
          .map((member: any) => props.memberStore.new(member));
      },
      {
        immediate: true,
        deep: true,
      },
    );

    const onUserSaved = () => {
      props.record.fetch();
    };

    const headerContent = ref<any>(null);

    const refresh = () => {
      headerContent.value?.loadData();
    };

    return {
      ...toRefs(props),
      tabs,
      onUserSaved,
      headerContent,
      refresh,
      members,
    };
  },
});
export default ComResUserShow;
</script>

<template lang="pug">
.com-res-user-show
  TaShowLayout(
    :tabs='tabs',
    :title='record.name',
    :store='store',
    template='user#res_model',
    :shouldChangeTitle='false'
  )
    template(#header-content)
      ComResUserHeaderContent(
        ref='headerContent',
        :record='record',
        :membershipStore='membershipStore',
        :org='org',
        v-if='record.id'
      )
    template(#basic-info_tab)
      ComResUserBasicInfo(
        :store='store',
        :membershipStore='membershipStore',
        :tagRelationStore='tagRelationStore',
        :record='record',
        :org='org',
        @userSaved='onUserSaved',
        @afterSave='refresh()',
        v-if='record.id'
      )
    template(#permissions_tab)
      ComResUserPermission(:record='record', v-if='record.id')
    template(#[`member-${member.id}_tab`], v-for='member in members')
      ComResUserMemberInfo(:record='member', :store='memberStore', @afterSave='onUserSaved')
</template>

<style lang="stylus" scoped>
.com-res-user-show
  height 100%
  >>>.header-edit
    display none
  >>>.ta-show-layout .background
    padding 0
  >>>.ta-tab
    border-bottom 1px solid #E5E7EB
</style>
