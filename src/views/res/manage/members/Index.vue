<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import ComResMemberIndex from '@/components/res/members/ComResMemberIndex.vue';
import { useRoute } from 'vue-router';
import { VStore } from '@/lib/vails';
import { ResManageMemberApi } from '@/res-core/apis/res/manage/member.api';
import { ResMemberModel } from '@/res-core/models/res/member';
import { ResManageMemberIdentityApi } from '@/res-core/apis/res/manage/member_identity.api';
import { ResMemberIdentityModel } from '@/res-core/models/res/member_identity';
import usePolicy from '@/components/global/ta-component/ta-template-form-core/usePolicy';

const ResManageMemberIndex = defineComponent({
  name: 'ResManageMemberIndex',
  components: { ComResMemberIndex },
  setup() {
    // usePolicy();
    const route = useRoute();

    const identityId = Number(route.params.memberIdentityId);

    const identityStore = new VStore(new ResManageMemberIdentityApi(), ResMemberIdentityModel);

    const store = new VStore(
      new ResManageMemberApi({
        parents: [
          {
            type: 'member_identities',
            id: identityId,
          },
        ],
      }),
      ResMemberModel,
    );

    onMounted(() => {
      identityStore.find(identityId);
    });

    return {
      store,
      memberIdentity: identityStore.record,
    };
  },
});

export default ResManageMemberIndex;
</script>

<template lang="pug">
.res-manage-member-index.w-full.h-full
  ComResMemberIndex(:store='store', :memberIdentity='memberIdentity', v-if='memberIdentity.id')
</template>
