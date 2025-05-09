<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';
import ComResAdminUserIndex from '@/components/res/admin/users/ComResAdminUserIndex.vue';
import { VStore } from '@/lib/vails';
import { ResAdminMembersApi } from '@/res-core/apis/res/admin/members.api';
import { ResAdminUsersApi } from '@/res-core/apis/res/admin/users.api';
import { ResUserModel } from '@/res-core/models/res/user';
import { ResAdminMembershipsApi } from '@/res-core/apis/res/admin/memberships.api';
import { ResMemberModel } from '@/res-core/models/res/member';
import { ResMembershipModel } from '@/res-core/models/res/membership';
import { ResAdminMemberIdentityApi } from '@/res-core/apis/res/admin/member_identity.api';
import { ResAdminTagsRelationApi } from '@/res-core/apis/res/admin/tags_relation.api';
import { ResMemberIdentityModel } from '@/res-core/models/res/member_identity';
import { ResTagsRelationModel } from '@/res-core/models/res/tags_relation';
import { useRoute } from 'vue-router';
const hrResAdminIndex = defineComponent({
  name: 'hrResAdminIndex',
  components: { ComResAdminUserIndex },
  props: {},
  setup(props) {
    const store = new VStore(new ResAdminUsersApi(), ResUserModel);
    const memberStore = new VStore(new ResAdminMembersApi(), ResMemberModel);

    const membershipStore = new VStore(new ResAdminMembershipsApi(), ResMembershipModel);

    const identityStore = new VStore(new ResAdminMemberIdentityApi(), ResMemberIdentityModel);
    const tagRelationStore = new VStore(new ResAdminTagsRelationApi(), ResTagsRelationModel);
    const route = useRoute();
    console.log(route.params.id);
    const onIdentitySelect = (id: number) => {
      memberStore.api = new ResAdminMembersApi({
        params: { q: { member_identity_id_eq: id } },
      });
    };

    return {
      ...toRefs(props),
      store,
      memberStore,
      membershipStore,
      identityStore,
      tagRelationStore,
      onIdentitySelect,
      route,
    };
  },
});
export default hrResAdminIndex;
</script>

<template lang="pug">
.hr-res-admin-index
  ComResAdminUserIndex.admin-index(
    :store='store',
    :memberStore='memberStore',
    :membershipStore='membershipStore',
    :identityStore='identityStore',
    :tagRelationStore='tagRelationStore',
    @onIdentitySelect='onIdentitySelect',
    :memberIdentityId='route.params.id',
    leftHide=true,
    )
</template>

<style lang="stylus" scoped>
.hr-res-admin-index
  width 100%
  height 100%
  .admin-index
    >>>.right-side
      width 100% !important
</style>
