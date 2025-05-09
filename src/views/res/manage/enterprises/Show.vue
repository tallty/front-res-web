<script lang="ts">
import { defineComponent } from 'vue';
import ComResManageEnterpriseShow from '@/components/res/manage/enterprises/ComResManageEnterpriseShow.vue';
import { useRoute } from 'vue-router';
import { VStore } from '@/lib/vails';
import { ResManageOrgApi } from '@/res-core/apis/res/manage/org.api';
import { ResOrgModel } from '@/res-core/models/res/org';
import { ResManageMembershipApi } from '@/res-core/apis/res/manage/membership.api';
import { ResMembershipModel } from '@/res-core/models/res/membership';

const ResUserEnterprisesShow = defineComponent({
  name: 'ResUserEnterprisesShow',
  components: { ComResManageEnterpriseShow },
  setup() {
    const route = useRoute();
    const params = JSON.parse(window.atob(route.params.enterpriseId as string));

    const orgStore = new VStore(new ResManageOrgApi(), ResOrgModel);
    orgStore.find(params.orgId);

    const membershipStore = new VStore(
      new ResManageMembershipApi({
        parents: [{ type: 'orgs', id: params.orgId }],
        params: {
          q: {
            mode: 'with_invalid',
            member_member_identity_id_eq: params.memberIdentityId,
            duty_id: params.dutyId,
            department_id: params.departmentId,
          },
        },
      }),
      ResMembershipModel,
    );

    return {
      org: orgStore.record,
      membershipStore,
      params,
    };
  },
});

export default ResUserEnterprisesShow;
</script>

<template lang="pug">
.res-user-manage-enterprises-show
  ComResManageEnterpriseShow(
    :org='org',
    :membershipStore='membershipStore',
    :options='params',
  )
</template>

<style lang="stylus" scoped>
.res-user-manage-enterprises-show
  height: 100%
</style>
