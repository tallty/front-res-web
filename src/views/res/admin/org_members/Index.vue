<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { VObject, VStore } from '@/lib/vails';
import ComResAdminOrgMembersIndex from '@/components/res/admin/org_members/ComResAdminOrgMembersIndex.vue';
import { ResAdminOrgMemberIdentitiesApi } from '@/res-core/apis/res/admin/org_member_identities.api';
import { ResAdminOrgMembersApi } from '@/res-core/apis/res/admin/org_members.api';
import { ResOrgMemberIdentityModel } from '@/res-core/models/res/org_member_identity';
import { ResOrgMemberModel } from '@/res-core/models/res/org_member';

const ResAdminOrgMembersIndex = defineComponent({
  name: 'ResAdminOrgMembersIndex',
  components: {
    ComResAdminOrgMembersIndex,
  },
  setup() {
    const store = new VStore(new ResAdminOrgMembersApi(), ResOrgMemberModel);

    const identityStore = new VStore(
      new ResAdminOrgMemberIdentitiesApi(),
      ResOrgMemberIdentityModel,
    );

    const onIdentitySelect = (data: VObject) => {
      // store.api = new ResAdminOrgMembersApi({
      //   params: { q: { org_member_identity_id_eq: data.identityId } },
      // });
    };

    return {
      store,
      identityStore,
      onIdentitySelect,
    };
  },
});

export default ResAdminOrgMembersIndex;
</script>

<template lang="pug">
.res-admin-org-members-index
  ComResAdminOrgMembersIndex(
    :store='store',
    :identityStore='identityStore',
    @onIdentitySelect='onIdentitySelect'
  )
</template>

<style lang="stylus" scoped>
.res-admin-org-members-index
  height 100%
  width 100%
</style>
