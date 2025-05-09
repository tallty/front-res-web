<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import { ResMembershipModel } from '@/res-core/models/res/manage/membership';
import { VStore } from '@/lib/vails';

import usePolicy from '@/components/global/ta-component/ta-template-form-core/usePolicy';
import { ResAdminMembershipsApi } from '../../../../../res-core/apis/res/admin/memberships.api';
import ComResMemberIdentityBatchMembershipsIndex from '../../../../../components/res/member_identities/memberships/ComResMemberIdentityBatchMembershipsIndex.vue';
import { ResAdminMemberIdentitiesApi } from '../../../../../res-core/apis/res/admin/member_identities.api';
import { ResMemberIdentityModel } from '@/res-core/models/res/manage/member_identity';

const ResAdminMemberIdentitiesMembershipIndex = defineComponent({
  name: 'ResAdminMemberIdentitiesMembershipIndex',
  components: {
    ComResMemberIdentityBatchMembershipsIndex,
  },
  setup() {
    usePolicy();

    const store = new VStore(
      new ResAdminMembershipsApi({
        params: {
          q: { member_id_not_null: 1 },
        },
      }),
      ResMembershipModel,
    );

    const memberIdentityStore = new VStore(
      new ResAdminMemberIdentitiesApi(),
      ResMemberIdentityModel,
    );

    return {
      store,
      memberIdentityStore,
    };
  },
});

export default ResAdminMemberIdentitiesMembershipIndex;
</script>

<template lang="pug">
ComResMemberIdentityBatchMembershipsIndex.res-manage-duties-membership-index(
  :store='store',
  :memberIdentityStore='memberIdentityStore',
)
</template>

<style lang="stylus" scoped>
.res-manage-duties-membership-index
  height 100%
  width 100%
</style>
