<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';
import { useRoute } from 'vue-router';
import { VStore, VModel } from '@/lib/vails';
import { ResAdminMemberIdentitiesApi } from '@/res-core/apis/res/admin/member_identities.api';
import { ResMemberIdentity, ResMembership } from '@/res-core/model';
import { ResAdminMembersApi } from '@/res-core/apis/res/admin/members.api';
import { ResAdminOrgsApi } from '@/res-core/apis/res/admin/orgs.api';
import { ResMember, ResOrg } from '@/res-core/types/model';

const ComResAdminMemberOrgsIndex = defineComponent({
  name: 'ComResAdminMemberOrgsIndex',
  components: {},
  props: {},
  setup(props) {
    const route = useRoute();
    const orgType = route.query.orgType || 'ProjectOrg';

    const memberIdentityStore = new VStore(new ResAdminMemberIdentitiesApi());

    memberIdentityStore.index({ per_page: 999999 });

    const tabs = computed(() =>
      memberIdentityStore.records.value.map((identity: ResMemberIdentity) => ({
        key: identity.id,
        label: identity.name,
        query: {
          member_identity_id_eq: identity.id,
        },
      })),
    );

    const memberStore = new VStore(new ResAdminMembersApi());

    const config = computed(() => ({
      recordName: '组织权限管理',
      store: memberStore,
      mode: 'table',
      table: {
        scroll: { y: 'auto' },
      },
      searcherSimpleOptions: [
        { label: '姓名', key: 'user_name', type: 'string' },
        { label: '账号', key: 'user_account', type: 'string' },
      ],
    }));

    const orgStore = new VStore(
      new ResAdminOrgsApi({
        params: { q: { type_eq: orgType } },
      }),
    );

    orgStore.index({ per_page: 999999 });

    const getChecked = (member: ResMemberIdentity, org: ResOrg) => {
      return (
        member.memberships.findIndex((membership: ResMembership) => membership.org_id === org.id) >
        -1
      );
    };

    const updateChecked = (member: ResMember & VModel<ResMember>, org: ResOrg) => {
      const existMembership = member.memberships.find(
        (membership: ResMembership) => membership.org_id === org.id,
      );
      if (existMembership) {
        member.update({
          memberships_with_invalid_attributes: [
            {
              id: existMembership.id,
              org_id: org.id,
              _destroy: true,
            },
          ],
        });
      } else {
        member.update({
          memberships_with_invalid_attributes: [
            {
              org_id: org.id,
            },
          ],
        });
      }
    };

    return {
      ...toRefs(props),
      config,
      tabs,
      orgs: orgStore.records,
      getChecked,
      updateChecked,
    };
  },
});
export default ComResAdminMemberOrgsIndex;
</script>

<template lang="pug">
.com-res-admin-member-orgs-index
  TaIndexView(:config='config', :tabs='tabs', :autoFetch='false')
    template(#table)
      a-table-column(:autoHeight='true' title='姓名', dataIndex='user_name', fixed='left', :width='100')
        template(#default='{ text }')
          .whitespace-nowrap {{ text }}
      a-table-column(:autoHeight='true' title='账号', dataIndex='user_account', :width='150')
      a-table-column(:autoHeight='true' 
        v-for='org in orgs',
        :title='org.name',
        :width='120',
      )
        template(#default='{ record: member }')
          a-switch(:checked='getChecked(member, org)', @update:checked='() => updateChecked(member, org)')
</template>

<style lang="stylus" scoped>
.com-res-admin-member-orgs-index
  height 100%
  >>> .ant-table-cell-fix-left
    z-index 10
    background-color white
</style>
